"use strict";
const {stableStringify}=require("./quaerensCore/stable");
const presentation=require("./assessmentReportPresentation");

// These are reference facts, never a recovery calculator.
function amount(value) {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const cleaned = value.trim().replace(/^(?:£|GBP\s*)/i, "").replace(/,/g, "");
  return /^\d+(?:\.\d{1,2})?$/.test(cleaned) ? Number(cleaned) : null;
}
const normal = value => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
function records(extraction, match = () => true, collections = ["financialItems", "transactions"]) {
  return collections.flatMap(collection => (extraction[collection] || []).flatMap((item, index) => match(item) ? [{
    ...item, amount: amount(item.amount), sourceField: `${collection}[${index}]`, collection,
    status: item.status || "UNKNOWN", provenance: [{ sourceField: `${collection}[${index}]`, label: item.label, status: item.status || "UNKNOWN", basis: item.basis || item.source || "" }],
  }] : []));
}
function reconcile(entries) {
  // Exact repeated source assertions are not separate transactions. Require
  // descriptive provenance; a coincident amount/status/label alone is not enough.
  const unique = [], fingerprints = new Map();
  for (const entry of entries) {
    const {provenance,sourceField,...payload}=entry;
    const fingerprint=stableStringify(payload);
    const previous=(entry.basis || entry.source) && fingerprints.get(fingerprint);
    if(previous) previous.provenance.push(...entry.provenance);
    else {const copy={...entry,provenance:[...entry.provenance]};unique.push(copy);fingerprints.set(fingerprint,copy);}
  }
  entries=unique;
  const items = [], conflicts = [];
  for (const entry of entries) {
    const explicit = entry.transactionId || entry.id;
    const prior = explicit && items.find(i => (i.transactionId || i.id) === explicit);
    if (prior) {
      if (prior.amount !== entry.amount || prior.status !== entry.status ||
        (prior.scope && entry.scope && prior.scope !== entry.scope) ||
        (prior.date && entry.date && prior.date !== entry.date)) conflicts.push(`Conflicting representations for ${entry.label || "financial reference"}.`);
      else { prior.provenance.push(...entry.provenance); continue; }
    }
    // Reconcile one unambiguous reference in each extraction collection. Never
    // deduplicate two same-amount records within one collection.
    const peers = entries.filter(i => i.collection === entry.collection);
    const cross = !explicit && items.find(i => !i.id && !i.transactionId &&
      i.collection !== entry.collection &&
      ((peers.length === 1 && entries.filter(j => j.collection === i.collection).length === 1) ||
       (normal(entry.basis) && normal(entry.basis) === normal(i.basis) &&
        peers.filter(j => j.amount === entry.amount && j.status === entry.status && normal(j.basis) === normal(entry.basis)).length === 1)) &&
      !/\b(?:separate|distinct)\b/i.test(`${i.basis || ""} ${entry.basis || ""}`) &&
      (!i.date || !entry.date || i.date === entry.date) &&
      (!i.scope || !entry.scope || i.scope === entry.scope) &&
      (!i.source || !entry.source || i.source === entry.source) &&
      i.amount === entry.amount && i.status === entry.status);
    if (cross) { cross.provenance.push(...entry.provenance); continue; }
    items.push({ ...entry, provenance: [...entry.provenance] });
  }
  const distinct = items.length <= 1 || items.every(i => i.transactionId || i.id ||
    /\b(?:separate|distinct)\b/i.test(i.basis || "") && normal(i.basis) && items.filter(j => normal(j.basis) === normal(i.basis)).length === 1);
  if (!distinct) conflicts.push("Multiple financial references require identity/scope reconciliation; no first value or aggregate selected.");
  const total = conflicts.length || items.some(i => i.amount === null) || !items.length ? null :
    Math.round(items.reduce((sum, i) => sum + i.amount, 0) * 100) / 100;
  return { items, conflicts, total };
}
function chronology(extraction) {
  const events = [];
  for (const collection of ["confirmedFacts", "reportedFacts", "transactions", "product", "property"]) {
    (extraction[collection] || []).forEach((item, index) => {
      const raw = [item.date, item.value, item.basis].filter(Boolean).join(" ");
      const dates = raw.match(/\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/g) || [];
      // Retain a supplied year or written date without inventing precision.
      if(!dates.length && /\b(?:date|year)\b/i.test(item.label || "") && /\b(?:19|20)\d{2}\b/.test(String(item.value || "")))dates.push(String(item.value));
      if(!dates.length)return;
      const description=String(item.value || item.basis || ""),kind=presentation.eventKind(`${item.label || ""} ${description}`);
      const anchor=/\b(?:date|year)\b/i.test(item.label || "") && !presentation.canonical(description);
      const event = `${item.label || "Reported event"}: ${description}`;
      events.push({dates:[...new Set(dates)],descriptionKey:anchor?`${kind}:date`:presentation.canonical(description || item.label),
        kind,anchor,id:item.eventId || item.transactionId || item.id,status:item.status || "UNKNOWN",collection,
        combinedDates:new Set(dates).size>1,sources:[`${collection}[${index}]`],event});
    });
  }
  return presentation.reconcileChronology(events).map(e=>({date_or_stage:e.dates.join(" / "),
    event_or_relevance:`${e.event} [${e.status}; source: ${e.sources.join(", ")}]`}));
}
function appendChronology(report, extraction) {
  report.chronology = [...(report.chronology || [])];
  for (const row of chronology(extraction)) if (!report.chronology.some(x => x.date_or_stage === row.date_or_stage && x.event_or_relevance === row.event_or_relevance)) {
    // Suppress only the adapter's generic installation anchor, not distinct
    // detailed events sharing a date, contractor or amount.
    const generic=report.chronology.findIndex(x=>presentation.dateKey(x.date_or_stage)===presentation.dateKey(row.date_or_stage) &&
      /^Spray foam installation reported; installer:/i.test(x.event_or_relevance) &&
      /installation/i.test(row.event_or_relevance));
    if(generic>=0){row.event_or_relevance=`${report.chronology[generic].event_or_relevance} ${row.event_or_relevance}`;report.chronology.splice(generic,1);}
    // Keep undated follow-up placeholders at the end; do not assign them dates.
    const placeholder=report.chronology.findIndex(x => /^(?:Date requires confirmation|Further chronology required)$/i.test(x.date_or_stage || ""));
    report.chronology.splice(placeholder<0?report.chronology.length:placeholder,0,row);
  }
  report.chronology=presentation.orderChronology(report.chronology);
  return presentation.normaliseReport(report);
}
const money = value => value === null ? "Not quantified" : new Intl.NumberFormat("en-GB", {style:"currency", currency:"GBP"}).format(value);
function referenceModel(extraction) {
  const groups = new Map();
  for (const entry of records(extraction)) {
    const label=normal(entry.label);
    const role=/^(?:purchase price|original purchase price|installation expenditure|original installation cost|installation price)$/.test(label)?"PURCHASE_REFERENCE":label;
    const key = entry.transactionId || entry.id || role;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  const reconciled = [...groups.values()].map(reconcile);
  return {items:reconciled.flatMap(r => r.items), conflicts:reconciled.flatMap(r => r.conflicts)};
}
function applyReferences(report, extraction) {
  const model = referenceModel(extraction);
  const rows = model.items.map(item => ({field:item.label, amount:money(item.amount),
    basis_or_comment:`${item.status}; ${item.basis || "Evidence and scope require confirmation"}; source: ${item.provenance.map(p => p.sourceField).join(", ")}. Reference expenditure only; not assessed recoverable loss.`}));
  const qualification = "Financial references retain their reported evidence status. No category-specific recovery range is calculated; entitlement, payment, causation, overlap and credits require separate assessment.";
  report.financial_exposure = rows;
  report.current_preliminary_position = {rows:rows.map(row => ({field:row.field,position:`${row.amount}; ${row.basis_or_comment}`}))};
  report.executive_summary.push(qualification, ...rows.map(row => `${row.field}: ${row.amount}; ${row.basis_or_comment}`));
  report.preliminary_position += ` ${qualification}`;
  report.information_to_confirm.push(qualification, ...model.conflicts);
  report.evidence_required.push({priority:"HIGH", requirement:"Reconcile financial references against transaction identities, invoices, payment records, scope and credits", why_it_matters:qualification});
  report.recommended_case_direction += ` ${qualification}`;
  return appendChronology(report, extraction);
}
module.exports = { amount, records, reconcile, chronology, appendChronology, referenceModel, applyReferences };

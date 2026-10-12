"use strict";
const semantics = require("./assessmentSemantics");

// Category-only reconciliation. Never sum duplicate extraction representations.
const patterns = {
  installation: /(?:installation.*(?:cost|price)|original.*installation)/i,
  treatment: /(?:damp.*treatment|treatment.*(?:cost|paid|expenditure)|rafter.*treatment)/i,
  removal: /(?:removal.*(?:cost|paid|actual|expenditure|quote)|spray.foam removal|foam extraction expenditure)/i,
};
function reconcile(extraction) {
  const entries = ["financialItems", "transactions"].flatMap(source =>
    (extraction[source] || []).map((item, index) => ({ ...item, sourceField: `${source}[${index}]` })));
  const model = { items: {}, conflicts: [], presence: false };
  for (const [kind, pattern] of Object.entries(patterns)) {
    const references = semantics.records(extraction, item => pattern.test(item.label || "") && !/range|total|combined/i.test(item.label || ""));
    const matches = references.filter(item => !/quote|estimate|prospective/i.test(item.label || "") && !/ESTIMATE|QUOTED|PROSPECTIVE/.test(item.status || ""));
    const reconciled = semantics.reconcile(matches);
    model.conflicts.push(...reconciled.conflicts.map(message => `${kind}: ${message}`));
    model.items[kind] = {
      amount: reconciled.total,
      status: [...new Set(references.map(item => item.status))].join(" / ") || "UNKNOWN",
      verified: false,
      references: semantics.reconcile(references).items,
      provenance: references.flatMap(item => item.provenance),
    };
  }
  const facts = [...(extraction.reportedFacts || []), ...(extraction.clientStatements || [])];
  model.presence = ["treatment", "removal"].some(kind => model.items[kind].provenance.length > 0) || facts.some(item => /removal|remedial|treatment/i.test(item.label || "") && !/^(no|none|not supplied)\b/i.test(item.value || ""));
  const scopeText = [...entries, ...facts].map(item => `${item.label || ""} ${item.basis || item.value || ""}`).join(" ");
  model.treatmentIncludedInRemoval = /removal[^.]*includes?[^.]*treatment|treatment[^.]*included[^.]*removal/i.test(scopeText);
  const {installation, treatment, removal} = model.items;
  const creditResult = semantics.reconcile(semantics.records(extraction, item => /refund|credit/i.test(item.label || "") && !/expect|sought|request/i.test(item.label || "") && semantics.amount(item.amount) !== null, ["refunds", "financialItems", "transactions"]));
  model.conflicts.push(...creditResult.conflicts);
  model.credits = creditResult.items.length ? creditResult.total : 0;
  model.creditsReported = creditResult.items.length > 0;
  const costs = [removal.amount, model.treatmentIncludedInRemoval ? null : treatment.amount].filter(value => value !== null);
  model.remedial = model.conflicts.length ? null : costs.length ? Math.max(0, Math.round((costs.reduce((a,b) => a+b, 0) - model.credits) * 100) / 100) : null;
  model.historical = !model.conflicts.length && !model.treatmentIncludedInRemoval && [installation.amount,treatment.amount,removal.amount].every(value => value !== null)
    ? installation.amount + treatment.amount + removal.amount : null;
  return model;
}
const money = value => value === null ? "Not quantified" : new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP",maximumFractionDigits:2}).format(value);
function applyReport(report, model) {
  const {installation,treatment,removal} = model.items;
  const qualification = "Expenditure retains its source evidence status; an amount alone does not establish payment or completion. Invoices, payment records, causation and scope must be reconciled. Treatment and removal may be combined only to the extent their scopes do not overlap.";
  const statusOf = item => item.status === "CLIENT_REPORTED" ? "client-reported / unverified" : `${item.status}; evidence/payment status not inferred`;
  const creditPosition = model.creditsReported ? `with reported credits of ${money(model.credits)} requiring scope reconciliation before quantification` : "with no credit deducted; the credit/refund position requires confirmation";
  const summary = `Original installation: ${money(installation.amount)} (${statusOf(installation)}); damp/treatment: ${money(treatment.amount)} (${statusOf(treatment)}); spray-foam removal: ${money(removal.amount)} (${statusOf(removal)}). Conditional subsequent remedial scenario: ${money(report.financial_assessment_range.lower.amount)} ${creditPosition}, subject to evidence, causation and non-overlap. Historical reference expenditure: ${money(model.historical)} only, not claim value, entitlement or automatic recoverable loss. Broader recoverable exposure remains unquantified pending separate justification.`;
  report.executive_summary = report.executive_summary.map(text => /removal or remedial event|reported installation price|Removal\/remedial information records/.test(text) ? summary + " " + qualification : text);
  report.executive_summary = [...new Set(report.executive_summary)];
  report.preliminary_position += " " + summary;
  report.chronology.push({date_or_stage:"Treatment / removal expenditure — dates and sequence subject to supporting records",event_or_relevance:summary});
  for (const row of report.technical_findings.table) {
    if (/Removal quotation|Further remedial/.test(row.issue)) {
      row.current_position = /Removal quotation/.test(row.issue) ? `Removal expenditure ${money(removal.amount)} reported; completion is not established by payment alone.` : `Damp/treatment expenditure ${money(treatment.amount)} reported. Full roof replacement is not established.`;
      row.evidence_or_clarification_needed = qualification;
    }
  }
  for (const row of report.preliminary_assessment.table) if (row.assessment_factor === "Removal / remedial position") row.preliminary_position = summary + " " + qualification;
  report.preliminary_assessment.narrative.push(summary);
  for (const row of report.financial_exposure) {
    if (row.field === "Second removal / further remedial cost") {
      row.field = "Damp / treatment expenditure";
      row.basis_or_comment = "CLIENT REPORTED / UNVERIFIED. " + qualification;
    }
    if (row.field === "Removal cost actually paid") {
      row.field = "Reported removal expenditure";
      row.basis_or_comment = "CLIENT REPORTED / UNVERIFIED. Payment and completion require separate confirmation.";
    }
  }
  report.current_preliminary_position.rows = report.current_preliminary_position.rows.filter(row => !/Direct incurred/.test(row.field));
  report.current_preliminary_position.rows.unshift(
    {field:`Installation - ${statusOf(installation)}`,position:money(installation.amount)},
    {field:`Treatment - ${statusOf(treatment)}`,position:money(treatment.amount)},
    {field:`Removal - ${statusOf(removal)}`,position:money(removal.amount)},
    {field:"Conditional subsequent remedial scenario",position:report.financial_assessment_range.lower.amount === null ? "Pending reconciliation / verification; not assumed zero" : report.financial_assessment_range.lower.display + "; subject to evidence, causation, non-overlap and credits"},
    {field:"Historical reference expenditure only",position:money(model.historical) + "; not recoverable entitlement"});
  report.information_to_confirm.push(qualification, ...model.conflicts);
  report.financial_exposure = report.financial_exposure.filter(row => !["Damp / treatment expenditure","Reported removal expenditure"].includes(row.field));
  for (const [kind, item] of Object.entries(model.items)) for (const reference of item.references || []) {
    const basis = `${reference.status}; ${reference.basis || "Scope/payment evidence requires confirmation"}; source: ${reference.provenance.map(p => p.sourceField).join(", ")}. Reference only, not an additional loss.`;
    report.financial_exposure.push({field:`${kind}: ${reference.label}`,amount:money(reference.amount),basis_or_comment:basis});
  }
  report.evidence_required.push({priority:"HIGH",evidence_required:"Separate installation, treatment and removal invoices/payment records and scope comparison",why_it_matters:qualification});
  return report;
}
module.exports = { reconcile, applyReport };

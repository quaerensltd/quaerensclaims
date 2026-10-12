"use strict";

// Presentation only: never changes extraction, financial records or evidence status.
function wording(value) {
  return value.replace(/\bUnited Kingdon\b/g, "United Kingdom")
    .replace(/\bvita homes\b/gi, "Vita Homes")
    .replace(/\bevergreen power\b/gi, "Evergreen Power")
    .replace(/\bThe consumer reports\s+(?:(?:the )?client (?:says|reports)(?: that)?\s+)+/gi, "The client reports that ")
    .replace(/\bThe client reports that (Vita Homes|Evergreen Power) claimed\b/g, "The client reports that $1 stated");
}
function normaliseReport(value) {
  if (typeof value === "string") return wording(value);
  if (Array.isArray(value)) return value.map(normaliseReport);
  if (value && typeof value === "object") {
    const result = Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normaliseReport(v)]));
    return Array.isArray(result.executive_summary) && result.current_preliminary_position
      ? require("./assessmentFinancialPresentation").applyFinancialPresentation(result) : result;
  }
  return value;
}
function clientObservation(value) {
  let body=wording(String(value || "").trim());
  // Remove reporting wrappers only at the start, retaining one explicit client
  // attribution. Do not transform negations, quotations or substantive assertions.
  const prefix=/^(?:(?:the\s+)?(?:client|consumer)\s+(?:says|said|reports|reported)(?:\s+that)?\s*[:,]?\s+|client-reported condition includes\s+)/i;
  while(prefix.test(body))body=body.replace(prefix, "").trim();
  if(!body || /^(?:no (?:further )?(?:client(?:-reported)? )?(?:condition information|observation)(?:s)? (?:recorded|supplied|has been supplied)|not supplied|not provided|unknown|tbc)[.!]?$/i.test(body))
    return "No further client-reported condition information has been supplied.";
  body=body.replace(/^((?:Vita Homes|Evergreen Power)) claimed\b/, "$1 stated");
  // Noun-phrase observations (e.g. 'damp') need no invented verb.
  return `The client reports: ${body.replace(/[.!]+$/, "")}.`
    .replace(/^The client reports: ((?:Vita Homes|Evergreen Power)\s+)/, "The client reports that $1");
}
function chronologyOrderKey(value) {
  const raw=String(value || "").trim(), dates=[...raw.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b|\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g)];
  if(dates.length){
    const keys=dates.map(m=>{const y=+(m[1]||m[6]),month=+(m[2]||m[5]),d=+(m[3]||m[4]);
      const check=new Date(Date.UTC(y,month-1,d));
      return check.getUTCFullYear()===y&&check.getUTCMonth()===month-1&&check.getUTCDate()===d?y*10000+month*100+d:null;});
    return keys.some(k=>k===null)?null:Math.min(...keys);
  }
  const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
  const written=raw.match(/^(?:(\d{1,2})\s+)?([A-Za-z]+)\s+(\d{4})$/);
  if(written&&months.includes(written[2].toLowerCase())){
    const month=months.indexOf(written[2].toLowerCase())+1;
    return written[1]?chronologyOrderKey(`${written[3]}-${String(month).padStart(2,'0')}-${written[1].padStart(2,'0')}`):+written[3]*10000+month*100;
  }
  return /^(?:19|20)\d{2}$/.test(raw)?+raw*10000:null;
}
function orderChronology(rows) {
  // Known dates first, ascending; grouped dates use their earliest known date.
  // Partial dates retain precision; unknown/invalid dates stay unchanged at the
  // end in stable source order. Equal dates never establish an event identity.
  return rows.map((row,index)=>({row,index,key:chronologyOrderKey(row.date_or_stage)}))
    .sort((a,b)=>(a.key??Infinity)-(b.key??Infinity)||a.index-b.index).map(x=>x.row);
}
const dateKey = date => date.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");
const canonical = value => wording(value).toLowerCase().replace(/\b(?:the client|client|the consumer) (?:reports|says)(?: that)?\s*/g, "")
  .replace(/\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
function reconcileChronology(events) {
  const result=[];
  for(const event of events){
    // Same descriptive assertion across extraction representations: keep all dates,
    // sources and statuses once. Explicit distinct event IDs are never collapsed.
    const prior=result.find(p=>p.descriptionKey===event.descriptionKey && p.descriptionKey &&
      ((!p.id&&!event.id)||p.id&&p.id===event.id) &&
      !p.collections.includes(event.collection) && p.status===event.status && p.kind===event.kind &&
      (p.dates.some(d=>event.dates.some(x=>dateKey(x)===dateKey(d))) || event.combinedDates && p.combinedDates));
    if(prior){prior.dates=[...new Set([...prior.dates,...event.dates])];prior.sources.push(...event.sources);prior.collections.push(event.collection);}
    else result.push({...event,collections:[event.collection],dates:[...event.dates],sources:[...event.sources]});
  }
  // A date-only field is an anchor, not an additional event. Attach only when
  // exactly one detailed event of the same kind/date exists; ambiguity stays visible.
  return result.filter(anchor=>{
    if(!anchor.anchor)return true;
    const matches=result.filter(e=>!e.anchor && e.kind===anchor.kind && anchor.kind && e.status===anchor.status &&
      ((!e.id&&!anchor.id)||e.id&&e.id===anchor.id) &&
      anchor.dates.every(d=>e.dates.some(x=>dateKey(x)===dateKey(d))));
    if(matches.length!==1)return true;
    matches[0].sources.push(...anchor.sources);return false;
  });
}
const eventKind = label => [[/install/i,"installation"],[/inspection|survey/i,"inspection"],[/treatment|damp/i,"treatment"],[/removal/i,"removal"]]
  .filter(([pattern])=>pattern.test(label)).map(([,kind])=>kind).join("+");
module.exports={wording,normaliseReport,clientObservation,chronologyOrderKey,orderChronology,dateKey,canonical,reconcileChronology,eventKind};

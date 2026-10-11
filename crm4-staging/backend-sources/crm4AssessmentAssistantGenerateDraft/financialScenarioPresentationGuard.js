"use strict";

// A report section is not another quantification authority. Rebuild monetary
// scenario prose from the issued decision; retain expenditure facts as references.
const monetary=/(?:[£€$]\s*[-\d]|\b(?:GBP|EUR|USD)\s*[-\d]|\d[\d,.]*\s*(?:GBP|EUR|USD)\b)/i;
const scenario=/(?:recover(?:y|able)|redress|compensation|entitlement|\baward\b|\bdamages\b|\bpayout\b|\bpayback\b|claim\s*value|financial\s*position|(?:lower|upper|financial|monetary|remedial)\s*(?:scenario|range)|potential\s*loss|assessed\s*loss)/i;
const labels=o=>[o?.field,o?.label,o?.scenario,o?.assessment_factor,o?.title].filter(x=>typeof x==="string").join(" ");
function statement(position){return `Governed financial position: ${position.display}. ${position.mode==="UNQUANTIFIED"?"No monetary recovery scenario is authorised.":"Conditional on the independently governed basis, evidence, causation, non-overlap and linked offsets."} Broader redress: Under assessment.`;}
function isClaim(value,context){
  // Explicit negative qualifications do not convert reference expenditure into
  // an assertion of recovery; positive recovery labels still take precedence.
  return String(value).split(/(?<=[.!?])\s+(?=[A-Z])/).some(sentence=>{
    const stripped=sentence.replace(/\b(?:not|no|never)\s+(?:(?:a|an|automatically|automatic|assessed|expected|established|recoverable|claim|value|loss|or|entitlement|recovery|scenario|financial|range|award|damages|payout)\b[\s,]*)+/gi,"");
    return (monetary.test(sentence)||typeof value==="number") && scenario.test(context+" "+stripped);
  });
}
function governReportMoney(report,position,{assertOnly=false}={}){
  const canonical=statement(position);
  function walk(value,context="",path=""){
    if(value===null||value===undefined)return value;
    if(typeof value==="string"||typeof value==="number"){
      if(value===canonical)return value;
      if(context==="Governed financial position"&&value===position.display)return value;
      if(isClaim(typeof value==="string"?value.replaceAll(canonical,""):value,context)){
        if(assertOnly)throw Error(`FINANCIAL_QUANTIFICATION: Unauthorised monetary scenario at ${path}`);
        if(typeof value!=="string")return canonical;
        // Do not discard independent non-financial observations merely because
        // a later sentence in the same paragraph attempts quantification.
        return value.split(/(?<=[.!?])\s+(?=[A-Z])/).map(sentence=>isClaim(sentence,context)?canonical:sentence).join(" ");
      }
      return value;
    }
    if(Array.isArray(value))return value.map((v,i)=>walk(v,context,`${path}[${i}]`));
    const nextContext=labels(value)||context;
    for(const key of Object.keys(value)){
      // These slots are validated/rebuilt by applyFinancialPresentation, never
      // accepted as independent category-authored scenario assertions.
      if(path===""&&["financial_position","valuation_or_scenario_matrix"].includes(key))continue;
      if(path===""&&key==="financial_assessment_range"&&value[key]){
        const range={...value[key]};
        for(const field of Object.keys(range))if(!["quantification","lower","upper","display_range"].includes(field))range[field]=walk(range[field],"",`${path}.${key}.${field}`);
        value[key]=range;continue;
      }
      value[key]=walk(value[key],nextContext,`${path}.${key}`);
    }
    return value;
  }
  return walk(report);
}
module.exports={governReportMoney,statement};

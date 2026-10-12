"use strict";

// Presentation consumes governed scenarios only. References never supply endpoints.
function financialPosition(range, locale = "en-GB") {
  if(range){
    const decision=require("./quaerensCore/financialQuantification").validateStored(range.quantification);
    if(range.lower?.amount!==(decision.scenarios[0]?.amount??null)||range.upper?.amount!==(decision.scenarios[1]?.amount??null))throw Error("FINANCIAL_QUANTIFICATION: Scenario endpoint override rejected");
    for(const [index,key] of ["lower","upper"].entries())if(decision.scenarios[index]){
      const expected=new Intl.NumberFormat(range.locale||locale,{style:"currency",currency:range.currency||"GBP",minimumFractionDigits:0,maximumFractionDigits:2}).format(decision.scenarios[index].amount);
      if(range[key].display!==expected||range[key].basis!==decision.scenarios[index].basis)throw Error("FINANCIAL_QUANTIFICATION: Scenario display/basis override rejected");
    }
    if(decision.scenarios.length===2&&range.display_range!==`${range.lower.display} - ${range.upper.display}`)throw Error("FINANCIAL_QUANTIFICATION: Range display override rejected");
  }
  const usable = item => typeof item?.amount === "number" && Number.isFinite(item.amount) && item.amount >= 0 && Boolean(item.basis);
  const lower = usable(range?.lower), upper = usable(range?.upper);
  const mode = lower && upper ? "FULL_RANGE" : lower || upper ? "SINGLE_SCENARIO" : "UNQUANTIFIED";
  const dutch = locale === "nl-NL";
  return {
    mode,
    title: mode === "FULL_RANGE" ? (dutch ? "INDICATIEVE FINANCIËLE BANDBREEDTE" : "INDICATIVE FINANCIAL ASSESSMENT RANGE") : (dutch ? "INDICATIEVE FINANCIËLE POSITIE" : "INDICATIVE FINANCIAL POSITION"),
    display: mode === "FULL_RANGE" ? range.display_range : mode === "SINGLE_SCENARIO" ? (lower ? range.lower.display : range.upper.display) : (dutch ? "Momenteel niet gekwantificeerd" : "Currently unquantified"),
    basis: mode === "SINGLE_SCENARIO" ? (lower ? range.lower.basis : range.upper.basis) : "",
  };
}

function applyFinancialPresentation(report) {
  const range = report.financial_assessment_range;
  const position = financialPosition(range, report.renderer_locale);
  const guard=require("./financialScenarioPresentationGuard");
  guard.governReportMoney(report,position);
  if (report.financial_position) {
    if(report.financial_position.mode!==position.mode || report.financial_position.display!==position.display)throw Error("FINANCIAL_QUANTIFICATION: Presentation override rejected");
  }
  if (position.mode === "FULL_RANGE") {
    report.financial_position={...position,rows:[{label:"Independently governed range",value:position.display}],explanation:"Each endpoint has its own conditional basis. Alternative scenarios must not be added together."};
    report.valuation_or_scenario_matrix={include:true,title:position.title,rows:range.quantification.scenarios.map(s=>({scenario:s.id,indicative_value:new Intl.NumberFormat(range.locale||"en-GB",{style:"currency",currency:range.currency||"GBP"}).format(s.amount),rationale:s.basis+" "+s.relationship}))};
    applySharedSummary(report,position);guard.governReportMoney(report,position);guard.governReportMoney(report,position,{assertOnly:true});return report;
  }
  const dutch = report.renderer_locale === "nl-NL";
  const rows = [];
  if (position.mode === "SINGLE_SCENARIO") rows.push({label:dutch ? "Huidig gerapporteerd / voorwaardelijk scenario" : "Current reported/conditional scenario", value:position.display});
  else rows.push({label:dutch ? "Financiële positie" : "Financial position",value:position.display});
  const supported=range?.quantification.scenarios[0];
  if(position.mode==="SINGLE_SCENARIO"&&supported?.credits.length){
    const fmt=value=>new Intl.NumberFormat(range.locale||"en-GB",{style:"currency",currency:range.currency||"GBP"}).format(value);
    rows.push({label:"Supported gross expenditure before linked offsets",value:fmt(supported.grossAmount)},{label:"Established linked offsets",value:fmt(supported.offsetAmount)});
  }
  // Only a separately labelled model reference is displayed: never add amounts here.
  const historical = (report.current_preliminary_position?.rows || []).find(row => ["Historical reference expenditure only","Historical expenditure reference"].includes(row.field));
  if (historical) rows.push({label:"Historical expenditure reference",value:historical.position.split(";")[0]});
  const referencePanel = range?.reported_reference_panel;
  if(referencePanel){
    rows.push({label:referencePanel.label,value:referencePanel.rangeStatus});
    for(const entry of referencePanel.entries || []) rows.push({label:entry.label,value:entry.display});
  }else if(range?.reported_reference){
    rows.push({label:range.reported_reference.label,value:range.reported_reference.display});
  }
  rows.push({label:dutch ? "Bredere verhaalspositie" : "Broader redress position",value:dutch ? "In beoordeling" : "Under assessment"});
  const explanation = dutch
    ? "De financiële positie blijft afhankelijk van bewijs, causaliteit, niet-overlappende posten en toepasselijke verrekeningen. Historische uitgaven zijn uitsluitend referentiebedragen, geen automatische claimwaarde of aanspraak. Breder verhaal blijft ongekwantificeerd totdat een afzonderlijke bewijsrechtelijke, juridische of klachtgrondslag is vastgesteld."
    : `${position.mode === "SINGLE_SCENARIO" ? "The current conditional scenario remains subject to evidence, causation, non-overlap and applicable credits." : "No monetary recovery scenario is presently supportable; the financial position remains unquantified, not assumed zero."} Historical expenditure is reference only, including original installation expenditure where shown; it is not automatically a claim value, entitlement or recoverable loss. Broader redress remains unquantified until a separately justified evidential, legal or complaint basis is established.`;
  report.financial_position = {...position,rows,explanation:explanation.replace("Historical expenditure is reference only", "Historical reference expenditure is reference only")};
  if (range) {
    report.financial_assessment_range = {...range,display_range:position.display,agent_summary:`${position.title}: ${position.display}. ${explanation}`,caveat:explanation};
  }
  report.valuation_or_scenario_matrix = {...report.valuation_or_scenario_matrix,include:true,title:position.title,intro:explanation,rows:rows.map((row,index)=>({scenario:row.label,indicative_value:row.value,rationale:index===0 && position.mode === "SINGLE_SCENARIO" ? position.basis : row.label === "Historical expenditure reference" ? "Historical expenditure including original installation; reference only, not automatic recoverable loss or entitlement." : row.label === "Broader redress position" ? "Unquantified until supported by a separately justified evidential, legal or complaint basis." : /linked offsets/i.test(row.label) ? "Gross components and offsets are linked in the governed calculation; the displayed current scenario is their net result." : "Reference only; classification and supporting evidence require confirmation."}))};
  if (report.current_preliminary_position?.rows) {
    report.current_preliminary_position.rows=report.current_preliminary_position.rows.filter(row=>!rows.some(current=>current.label===row.field));
    report.current_preliminary_position.rows = report.current_preliminary_position.rows.filter(row => !/^(?:Indicative financial assessment range|Financial assessment range|Range status|Lower scenario|Upper scenario|Conditional subsequent remedial scenario|Historical reference expenditure only|Historical expenditure reference|Current reported\/conditional scenario|Financial position|Broader redress position|Financial position qualification)$/i.test(row.field || ""));
    report.current_preliminary_position.rows.push(...rows.map(row=>({field:row.label,position:row.value})),{field:"Financial position qualification",position:explanation});
  }
  applySharedSummary(report,position);
  guard.governReportMoney(report,position);
  guard.governReportMoney(report,position,{assertOnly:true});
  return report;
}
function applySharedSummary(report,position){
  const prefix="Governed financial position: ";
  const text=require("./financialScenarioPresentationGuard").statement(position)+" Financial references are not automatic recoverable loss or entitlement.";
  const add=list=>[...(Array.isArray(list)?list:[]).filter(x=>typeof x!=="string"||!x.startsWith(prefix)),text];
  report.executive_summary=add(report.executive_summary);
  report.recommendations_next_steps=add(report.recommendations_next_steps);
  for(const key of ["preliminary_position","recommended_case_direction"]){
    if(typeof report[key]==="string")report[key]=report[key].split(prefix)[0].trim()+" "+text;
  }
  if(report.preliminary_assessment)report.preliminary_assessment.narrative=add(report.preliminary_assessment.narrative);
  if(Array.isArray(report.financial_exposure)){
    report.financial_exposure=report.financial_exposure.filter(row=>row.field!=="Governed financial position");
    report.financial_exposure.push({field:"Governed financial position",amount:position.display,basis_or_comment:text});
  }
}
module.exports = {financialPosition,applyFinancialPresentation};

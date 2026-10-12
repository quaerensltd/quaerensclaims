"use strict";

// Mandatory Framework B authority. Category code supplies proposals, not amounts
// with authority. Only these versioned category relationships can quantify.
const VERSION = "FRAMEWORK-B-QUANTIFICATION-v1";
const freeze=value=>{if(value&&typeof value==="object"){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
const RULES = freeze({
  SPRAY_CONDITIONAL_REMEDIATION: Object.freeze({category:"spray-foam",roles:["treatment","removal"],statuses:["CLIENT_REPORTED","CONFIRMED_FROM_INPUT","INVOICED","PAID","INCURRED","COMMITTED"]}),
  SOLAR_DIRECT_REMEDIATION: Object.freeze({category:"solar",roles:["ENGINEER_INSPECTION","INVERTER_REMEDIAL","OTHER_DIRECT_INCURRED"],statuses:["PAID","INCURRED","COMMITTED","PAID_OR_INCURRED"]}),
});
const issued = new WeakSet();
const clone = value => JSON.parse(JSON.stringify(value));
const minor = value => typeof value === "number" && Number.isFinite(value) && value >= 0 && Number.isSafeInteger(Math.round(value*100)) && Math.abs(value*100-Math.round(value*100))<0.00001 ? Math.round(value*100) : null;
const fail = message => {throw new Error("FINANCIAL_QUANTIFICATION: "+message);};

function evaluate({category,references=[],proposals=[],missing=[]}) {
  if(!Array.isArray(references)||!Array.isArray(proposals)||references.length>200||proposals.length>2)fail("Invalid bounded contract");
  const refs=new Map();
  for(const reference of references){
    if(!reference.id || refs.has(reference.id))fail("Duplicate/missing financial identity");
    refs.set(reference.id,{...clone(reference),provenance:(reference.provenance||[]).map(p=>typeof p==="string"?p:p.sourceField)});
  }
  const scenarios=[];
  for(const proposal of proposals){
    const rule=RULES[proposal.ruleId];
    if(!rule || rule.category!==category)fail("Category rule not authorised");
    if(!proposal.id || !proposal.basis?.trim() || !proposal.relationship?.trim() || proposal.conditional!==true)fail("Scenario requires independent governed basis and conditional relationship");
    if(!Array.isArray(proposal.componentIds)||!proposal.componentIds.length||new Set(proposal.componentIds).size!==proposal.componentIds.length)fail("Invalid/duplicate scenario components");
    let total=0;const scopes=new Set(),sources=new Set(),components=[];
    for(const id of proposal.componentIds){
      const ref=refs.get(id);
      if(!ref || minor(ref.amount)===null || !rule.roles.includes(ref.role) || !rule.statuses.includes(ref.status) || !ref.scope || scopes.has(ref.scope) || !Array.isArray(ref.provenance)||!ref.provenance.length || ref.provenance.some(p=>typeof p!=="string"||!p))fail("Unsupported amount, scope, status or provenance");
      for(const source of ref.provenance){if(sources.has(source))fail("Equivalent financial source counted twice");sources.add(source);}
      scopes.add(ref.scope);total+=minor(ref.amount);components.push(id);
    }
    const gross=total;
    if(!Number.isSafeInteger(gross))fail("Gross amount exceeds supported precision");
    const offsetsByComponent=new Map();
    const credits=[];
    for(const id of proposal.creditIds || []){
      const ref=refs.get(id);
      if(!ref || credits.includes(id) || ref.role!=="credit" || minor(ref.amount)===null || !["CLIENT_REPORTED","CONFIRMED_FROM_INPUT","PAID"].includes(ref.status) || !proposal.componentIds.includes(ref.appliesTo) || !ref.provenance?.length || ref.provenance.some(p=>typeof p!=="string"||!p))fail("Credit requires a supported relationship to a scenario component");
      for(const source of ref.provenance){if(sources.has(source))fail("Equivalent credit source counted twice");sources.add(source);}
      const offset=(offsetsByComponent.get(ref.appliesTo)||0)+minor(ref.amount);
      if(offset>minor(refs.get(ref.appliesTo).amount))fail("Linked credits exceed their supported component");
      offsetsByComponent.set(ref.appliesTo,offset);
      credits.push(id);total-=minor(ref.amount);
    }
    if(total<0)fail("Linked credits exceed the supported gross scenario");
    if(!Number.isSafeInteger(total))fail("Amount exceeds supported precision");
    const signature=JSON.stringify([...proposal.componentIds].sort())+JSON.stringify((proposal.creditIds||[]).slice().sort());
    if(scenarios.some(s=>s.id===proposal.id||s.signature===signature))fail("Equivalent scenario counted twice");
    scenarios.push({id:proposal.id,ruleId:proposal.ruleId,amount:total/100,...(credits.length?{grossAmount:gross/100,offsetAmount:(gross-total)/100}:{}),basis:proposal.basis,relationship:proposal.relationship,conditional:true,components,credits,signature});
  }
  scenarios.sort((a,b)=>a.amount-b.amount);
  if(scenarios.length===2 && scenarios[0].basis===scenarios[1].basis)fail("Each range endpoint needs its own basis");
  const result={version:VERSION,category,state:scenarios.length===2?"FULL_RANGE":scenarios.length?"SINGLE_SCENARIO":"UNQUANTIFIED",scenarios,references:[...refs.values()],missing:[...missing]};
  freeze(result);issued.add(result);return result;
}
function assertIssued(result){if(!result || !issued.has(result))fail("Adapter supplied an uncertified quantification result");return result;}
function validateStored(result){
  if(result?.version!==VERSION)fail("Missing current central quantification contract");
  const rebuilt=evaluate({category:result.category,references:result.references,missing:result.missing,proposals:(result.scenarios||[]).map(s=>({id:s.id,ruleId:s.ruleId,basis:s.basis,relationship:s.relationship,conditional:s.conditional,componentIds:s.components,creditIds:s.credits}))});
  if(!require("node:util").isDeepStrictEqual(rebuilt,result))fail("Stored financial authority mismatch");
  return rebuilt;
}

// Reuse the established spray-foam reconciliation; never classify references as
// paid or infer completion. Scope distinction remains explicitly conditional.
function sprayFromModel(model){
  if(!model)return evaluate({category:"spray-foam",missing:["Supported remediation scope, expenditure status, causation and credit relationships"]});
  const references=[],ids=[];
  for(const [role,item] of Object.entries(model.items)){
    for(const [index,ref] of (item.references||[]).entries()){
      const id=`${role}:${index}`;
      references.push({...ref,id,role,scope:id});
      if(["treatment","removal"].includes(role)&&!(role==="treatment"&&model.treatmentIncludedInRemoval)&&minor(ref.amount)!==null&&RULES.SPRAY_CONDITIONAL_REMEDIATION.statuses.includes(ref.status))ids.push(id);
    }
  }
  // Existing reconciliation has already excluded overlapping treatment and
  // duplicate transaction representations. Ambiguous credits cannot be applied.
  const creditUnresolved=model.creditsReported && model.credits!==0;
  const proposals=!model.conflicts.length&&!creditUnresolved&&ids.length?[{id:"conditional-remediation",ruleId:"SPRAY_CONDITIONAL_REMEDIATION",componentIds:ids,conditional:true,basis:"Conditional client-reported remedial expenditure; not established recoverable loss.",relationship:"Separate treatment/removal scopes only to the extent non-overlap, causation, supporting evidence and applicable credits are established."}]:[];
  return evaluate({category:"spray-foam",references,proposals,missing:creditUnresolved?["Establish each credit's relationship to the relevant expenditure before quantification"]:["Invoices, payment evidence, causation, non-overlap and applicable credits"]});
}
function solarFromDirectCosts(items=[]){
  const references=[],ids=[],seen=new Map();let conflict=false;
  for(const [index,item] of items.entries()){
    const identity=item.transactionId||item.overlapIdentity||item.scopeIdentity;
    const id=`solar:${index}`,source=`financial.directCosts[${index}]`;
    const ref={id,amount:item.amount,role:item.type,status:item.status,evidenceStatus:item.evidenceStatus||"UNVERIFIED",scope:identity||id,provenance:[source],reportedProvenance:item.provenance||null};
    references.push(ref);
    if(!identity||minor(item.amount)===null||!RULES.SOLAR_DIRECT_REMEDIATION.roles.includes(item.type)||!RULES.SOLAR_DIRECT_REMEDIATION.statuses.includes(item.status))continue;
    const prior=seen.get(identity);
    if(prior){if(prior.amount!==item.amount||prior.role!==item.type||prior.status!==item.status)conflict=true;continue;}
    seen.set(identity,ref);ids.push(id);
  }
  const proposals=!conflict&&ids.length?[{id:"solar-direct-remediation",ruleId:"SOLAR_DIRECT_REMEDIATION",componentIds:ids,conditional:true,basis:"Separately identified reported incurred/committed Solar remediation; payment and supporting evidence remain subject to verification.",relationship:"Conditional causal remediation only; distinct scopes, non-overlap and applicable credits require confirmation. Purchase, finance and quotations are reference only."}]:[];
  return evaluate({category:"solar",references,proposals,missing:[conflict?"Conflicting direct-cost identities require reconciliation":"Verify direct-cost evidence, causal scope, non-overlap and applicable credits"]});
}
module.exports={VERSION,RULES,evaluate,assertIssued,validateStored,sprayFromModel,solarFromDirectCosts};

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const q=require('../backend-sources/crm4AssessmentAssistantGenerateDraft/quaerensCore/financialQuantification');
test('preserved Solar authority supports typed conditional costs, not manual category substitution',()=>{
 const cost={transactionId:'synthetic-inverter',type:'INVERTER_REMEDIAL',amount:650,status:'INCURRED',provenance:'Synthetic reported invoice'};
 const supported=q.solarFromDirectCosts([cost,cost]);
 assert.equal(supported.state,'SINGLE_SCENARIO');assert.equal(supported.scenarios[0].amount,650);assert.equal(supported.scenarios[0].conditional,true);
 assert.equal(supported.references[0].evidenceStatus,'UNVERIFIED');
 for(const patch of [{status:'QUOTED'},{type:'PURCHASE_PRICE'},{type:'FINANCE_PRINCIPAL'},{amount:null},{transactionId:null}])assert.equal(q.solarFromDirectCosts([{...cost,...patch}]).state,'UNQUANTIFIED');
 assert.equal(q.solarFromDirectCosts([cost,{...cost,amount:700}]).state,'UNQUANTIFIED');
 const schema=require('../backend-sources/crm4AssessmentAssistantGenerateDraft/crm4AssessmentAssistantSchema');
 assert(schema.CATEGORIES.solar);assert.deepEqual(schema.OUTPUT_SCHEMA.properties.reportType.enum,['AI_ASSISTED']);
});

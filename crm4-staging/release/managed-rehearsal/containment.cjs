'use strict';
// Only explicit, separately approved containment operations can run.
// Continue safe independent actions after one fails; never broaden authority.
async function contain(approval,operations,receipt){const results=[];for(const name of ['revoke-bootstrap','disable-owner','withdraw-iap','remove-run-invoker','delete-test-service','cleanup-synthetic']){if(approval?.containmentApproved!==true||!approval.containmentActions?.includes(name)){results.push({name,state:'NOT_AUTHORISED'});continue;}try{if(typeof operations[name]!=='function')throw Error();const outcome=await operations[name]();if(outcome?.complete===false)throw Error();results.push({name,state:'VERIFIED'});}catch{results.push({name,state:'FAILED'});}}await receipt(results);return {complete:results.every(x=>x.state==='VERIFIED'),results};}
module.exports={contain};

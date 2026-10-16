'use strict';
// Bind all required probe names, but never convert missing evidence to PASS.
// Input must be the redacted, operator-reviewed receipts from the real probes.
const {required}=require('./acceptance.cjs');
function bind(receipts){return Object.fromEntries(required.map(name=>[name,async()=>{const rows=receipts.filter(x=>x.name===name);if(rows.length!==1)return {pass:false,state:'INCONCLUSIVE',correlation:'missing-or-duplicate-'+name,observedAt:Date.now()};const r=rows[0];const complete=r.state==='PASS'&&r.positiveBaseline===true&&r.serverEvidence===true&&r.fixtureVerified===true&&r.inconclusive!==true&&r.limitedObservation!==true;return {...r,pass:complete};}]));}
module.exports={bind};

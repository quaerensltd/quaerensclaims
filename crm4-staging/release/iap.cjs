'use strict';
function createIapVerifier(config,client) {
 const audience='/projects/'+config.projectNumber+'/locations/'+config.region+'/services/crm4-spain-test';
 return async assertion=>{
  if(typeof assertion!=='string'||assertion.length>16000)throw Error('IAP assertion required');
  const {pubkeys}=await client.getIapPublicKeys();
  const ticket=await client.verifySignedJwtWithCertsAsync(assertion,pubkeys,audience,['https://cloud.google.com/iap'],660);
  const claims=ticket.getPayload(),now=Math.floor(Date.now()/1000);
  if(!claims?.sub||claims.aud!==audience||claims.iss!=='https://cloud.google.com/iap'||!Number.isFinite(claims.exp)||!Number.isFinite(claims.iat)||claims.exp<now-30||claims.iat>now+30||claims.exp-claims.iat>660||!config.testerEmails.includes(String(claims.email||'').toLowerCase()))throw Error('IAP tester denied');
  return claims;
 };
}
module.exports={createIapVerifier};

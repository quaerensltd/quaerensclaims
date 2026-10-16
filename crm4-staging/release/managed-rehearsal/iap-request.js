// Load only as reviewed local snippet on the already approved private origin.
async function crm4IapRequestReceipt(){if(location.origin!=='https://crm4-spain-test-558324850479.europe-west1.run.app')throw Error('ORIGIN');const nonce='crm4-iap-'+crypto.randomUUID().replaceAll('-','');const sentAt=Date.now();const r=await fetch('/crm4-login.html?rehearsal='+nonce,{credentials:'same-origin',redirect:'manual',cache:'no-store'});return {nonce,sentAt,receivedAt:Date.now(),httpStatus:r.status};}
if(typeof module!=='undefined')module.exports={crm4IapRequestReceipt};

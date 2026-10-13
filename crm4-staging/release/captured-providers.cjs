'use strict';
const {createHash,randomUUID}=require('node:crypto');
const hash=x=>createHash('sha256').update(x).digest('hex');
function createCapturedProviders(db) {
 return {resend:{emails:{async send(payload,options={}){
  const recipients=[payload.to,payload.cc,payload.bcc].flat(2).filter(Boolean);
  if(!recipients.length||recipients.some(x=>!/^\S+@(?:crm4\.)?example\.test$/.test(x)&&!['support@quaerens.co.uk','info@quaerens.co.uk'].includes(x)))throw Error('Synthetic/captured internal recipients required');
  const fingerprint=hash(JSON.stringify(payload)),id=hash(options.idempotencyKey||randomUUID()),ref=db.collection('crm4ProviderCaptures').doc(id);
  return db.runTransaction(async tx=>{
   const old=(await tx.get(ref)).data();
   if(old&&old.fingerprint!==fingerprint)throw Error('Conflicting provider idempotency key');
   if(!old)tx.create(ref,{fingerprint,recipients,subject:String(payload.subject||''),capturedOnly:true,delivered:false,createdAt:new Date(),providerMessageId:'crm4-cloud-capture-'+id});
   return {data:{id:'crm4-cloud-capture-'+id}};
  });
 }}}};
}
module.exports={createCapturedProviders};

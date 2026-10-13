'use strict';
const {AsyncLocalStorage}=require('node:async_hooks'),{randomBytes,createHash}=require('node:crypto');
const actorContext=new AsyncLocalStorage();
const hash=s=>createHash('sha256').update(s).digest('hex');
function createDocumentLinks(db,storage,auth,origin) {
 async function authority(uid,path){
  const member=(await db.collection('crm4Memberships').doc(uid).get()).data();
  if(member?.active===true&&member.workspaceId==='CRM4'&&(['manager','administrator','processing'].includes(member.role)||(()=>{try{return require('../tools/staff-capabilities.cjs').resolveActor(uid,member).roles.includes('closer')}catch{return false}})()))
   return JSON.stringify({kind:'staff',role:member.role,roles:member.roles||null});
  const match=/^clientPortal\/([\w-]+)\//.exec(path),portal=match&&(await db.collection('clientPortalCases').doc(match[1]).get()).data();
  if(!portal||portal.clientUid!==uid||portal.accessState!=='ACTIVE'||![portal.workspaceId,portal.crmLink?.workspaceId].includes('CRM4')||[portal.workspaceId,portal.crmLink?.workspaceId].some(v=>v&&v!=='CRM4'))throw Error('Document access revoked');
  return JSON.stringify({kind:'client',caseId:match[1],uid});
 }
 return {
  withActor:(actor,fn)=>actorContext.run(actor,fn),
  async issue(path){
   const actor=actorContext.getStore();if(!actor?.iapSub||!actor?.uid)throw Error('Authenticated document context required');
   storage.bucket().file(path); // Apply the authoritative object-path allowlist before issuing a ticket.
   const authorization=await authority(actor.uid,path),token=randomBytes(32).toString('hex'),issuedAt=Date.now();
   await db.collection('crm4DocumentTickets').doc(hash(token)).create({path,uid:actor.uid,iapSub:actor.iapSub,authorization,issuedAt,expires:issuedAt+300000});
   return [origin+'/__crm4/document/'+token];
  },
  async download(token,iap){
   if(!/^[a-f0-9]{64}$/.test(token))throw Error('Invalid document ticket');
   const ticket=(await db.collection('crm4DocumentTickets').doc(hash(token)).get()).data();
   if(!ticket||!Number.isFinite(ticket.issuedAt)||ticket.expires<=Date.now()||ticket.iapSub!==iap.sub)throw Error('Document ticket denied');
   const user=await auth.getUser(ticket.uid);
   if(user.disabled)throw Error('Account disabled');
   if(user.tokensValidAfterTime&&Date.parse(user.tokensValidAfterTime)>ticket.issuedAt)throw Error('Account sessions revoked');
   if(await authority(ticket.uid,ticket.path)!==ticket.authorization)throw Error('Document access revoked');
   return (await storage.bucket().file(ticket.path).download())[0];
  }
 };
}
module.exports={createDocumentLinks};

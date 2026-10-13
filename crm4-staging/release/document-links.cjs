'use strict';
const {AsyncLocalStorage}=require('node:async_hooks'),{randomBytes,createHash}=require('node:crypto');
const actorContext=new AsyncLocalStorage();
const hash=s=>createHash('sha256').update(s).digest('hex');
function createDocumentLinks(db,storage,auth,origin) {
 return {
  withActor:(actor,fn)=>actorContext.run(actor,fn),
  async issue(path){
   const actor=actorContext.getStore();if(!actor?.iapSub||!actor?.uid)throw Error('Authenticated document context required');
   const token=randomBytes(32).toString('hex');
   await db.collection('crm4DocumentTickets').doc(hash(token)).create({path,uid:actor.uid,iapSub:actor.iapSub,expires:Date.now()+300000});
   return [origin+'/__crm4/document/'+token];
  },
  async download(token,iap){
   if(!/^[a-f0-9]{64}$/.test(token))throw Error('Invalid document ticket');
   const ticket=(await db.collection('crm4DocumentTickets').doc(hash(token)).get()).data();
   if(!ticket||ticket.expires<=Date.now()||ticket.iapSub!==iap.sub)throw Error('Document ticket denied');
   if((await auth.getUser(ticket.uid)).disabled)throw Error('Account disabled');
   const member=(await db.collection('crm4Memberships').doc(ticket.uid).get()).data();
   if(!(member?.active===true&&member.workspaceId==='CRM4')){
    const match=/^clientPortal\/([\w-]+)\//.exec(ticket.path),portal=match&&(await db.collection('clientPortalCases').doc(match[1]).get()).data();
    if(!portal||portal.clientUid!==ticket.uid||portal.accessState!=='ACTIVE')throw Error('Document access revoked');
   }
   return (await storage.bucket().file(ticket.path).download())[0];
  }
 };
}
module.exports={createDocumentLinks};

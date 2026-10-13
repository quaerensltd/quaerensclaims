'use strict';
// Shared CRM Framework acceptance against literal loopback emulators only.
// Temporarily publishes reviewed release rules locally and restores them in finally.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
async function run(){
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const root=path.resolve(__dirname,'..'),r=require('../tools/local-handlers.cjs').createLocalHandlers(),auth=require('firebase-admin/auth').getAuth(r.app),id='release-rules-'+require('crypto').randomUUID(),uid=id+'-client',password='Synthetic-only-927!',results=[];
 const setRules=async file=>{const response=await fetch('http://127.0.0.1:9199/internal/setRules',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({rules:{files:[{name:path.join(root,file),content:fs.readFileSync(path.join(root,file),'utf8')}]}})});assert.equal(response.status,200,await response.text());};
 const login=async user=>{const response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:user+'@example.test',password,returnSecureToken:true})});assert.equal(response.status,200);return (await response.json()).idToken;};
 const create=async user=>{await auth.createUser({uid:user,email:user+'@example.test',password,emailVerified:true});return login(user);};
 const check=async(name,response,status)=>{const actual=(await response).status;assert.equal(actual,status,name);results.push({name,status:actual});};
 try{
  await setRules('release/storage.rules');const token=await create(uid);
  const ref=r.db.collection('clientPortalCases').doc(id),base='http://127.0.0.1:9199/v0/b/quaerens-crm4-spain-test.firebasestorage.app/o';let counter=0;
  const upload=(type='text/plain')=>require('./storage-upload-helper.cjs').uploadSynthetic(base,token,'clientPortal/'+id+'/client-uploads/'+uid+'/test-'+counter+++'.txt',type);
  await ref.set({workspaceId:'CRM4',clientUid:uid,accessState:'ACTIVE'});await check('CRM4 case owner upload',upload(),200);
  for(const [name,patch]of [['CRM2 case',{workspaceId:'CRM2'}],['CRM3 case',{workspaceId:'CRM3'}],['CRM5 case',{workspaceId:'CRM5'}],['conflicting link',{workspaceId:'CRM4',crmLink:{workspaceId:'CRM3'}}],['revoked case access',{workspaceId:'CRM4',crmLink:{workspaceId:'CRM4'},accessState:'DISABLED'}]]){await ref.update(patch);await check(name,upload(),403);}
  await ref.update({workspaceId:'CRM4',crmLink:{workspaceId:'CRM4'},accessState:'ACTIVE'});await check('unsafe MIME',upload('text/html'),403);
  await ref.update({clientUid:id+'-other'});await check('wrong case owner',upload(),403);
  await ref.update({clientUid:uid,portalVersion:2,crmLink:{workspaceId:'CRM4',collection:'crm4Leads',caseId:id}});await r.db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4'});
  await ref.update({crm4LeadId:'conflict'});await check('conflicting canonical lead marker',upload(),403);await ref.update({crm4LeadId:id});
  await r.db.collection('crm4Leads').doc(id).update({workspaceId:'CRM3'});await check('case owner foreign linked lead',upload(),403);await r.db.collection('crm4Leads').doc(id).update({workspaceId:'CRM4'});await check('case owner two-document linked upload',upload(),200);
  const shared=(credential,name='shared-'+counter+++'.txt')=>require('./storage-upload-helper.cjs').uploadSynthetic(base,credential,'clientPortal/'+id+'/shared/'+name);
  const adminUid=id+'-admin',adminToken=await create(adminUid),member=r.db.collection('crm4Memberships').doc(adminUid);
  await member.set({workspaceId:'CRM4',active:true,role:'administrator'});await check('direct administrator shared upload requires server boundary',shared(adminToken,'same.txt'),403);await check('existing object overwrite denied',shared(adminToken,'same.txt'),403);
  await member.update({active:false});await check('inactive administrator',shared(adminToken),403);
  for(const workspaceId of ['CRM2','CRM3','CRM5']){await member.update({active:true,workspaceId});await check(workspaceId+' membership',shared(adminToken),403);}
  await member.update({workspaceId:'CRM4'});await r.db.collection('crm4Leads').doc(id).update({workspaceId:'CRM3'});await check('foreign linked lead',shared(adminToken),403);await r.db.collection('crm4Leads').doc(id).update({workspaceId:'CRM4'});
  for(const suffix of ['staff-one','staff-two']){const staffUid=id+'-'+suffix,staffToken=await create(staffUid);await r.db.collection('crm4Memberships').doc(staffUid).set({workspaceId:'CRM4',active:true,role:'lister',roles:['lister','closer']});await check(suffix+' dual role cannot gain administrator upload power',shared(staffToken),403);}
  await member.delete();await check('missing membership',shared(adminToken),403);
  await check('unauthenticated list denied',fetch(base),403);
  console.log('STORAGE_RULES_RESULTS '+JSON.stringify({environment:'loopback demo emulators',passed:results.length,failed:0,results,cloudIamExercised:false}));
 }finally{await setRules('storage.local.rules');await r.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});

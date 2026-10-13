'use strict';
const {validateCloudRuntime}=require('./cloud-configuration.cjs');
async function createCloudRuntime(configuration) {
 const config=validateCloudRuntime(configuration);
 require('../tools/runtime-boundary.cjs').assertRuntime({crm4Cloud:config,db:{projectId:config.projectId}});
 if(process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL&&process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL!=='archive@example.test')throw Error('Synthetic archive required');
 process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL='archive@example.test';
 // Managed identity must be the dedicated CRM4 runtime account, never ADC from a developer key.
 const identity=await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email',{headers:{'Metadata-Flavor':'Google'},signal:AbortSignal.timeout(3000)});
 if(!identity.ok||(await identity.text()).trim()!==config.runtimeServiceAccount)throw Error('CRM4 managed service identity mismatch');
 const {initializeApp,deleteApp,applicationDefault}=require('firebase-admin/app');
 const app=initializeApp({projectId:config.projectId,storageBucket:config.bucket,credential:applicationDefault()},'crm4-spain-'+require('node:crypto').randomUUID());
 const db=require('firebase-admin/firestore').getFirestore(app),auth=require('firebase-admin/auth').getAuth(app);
 try{
  const persistent=require('./persistent-storage.cjs').createPersistentStorage(app,config,require('firebase-admin/storage').getStorage);
  const documents=require('./document-links.cjs').createDocumentLinks(db,persistent,auth,config.origin);
  const storage={bucket:name=>({file:path=>({...persistent.bucket(name).file(path),getSignedUrl:()=>documents.issue(path)})})};
  const providers=require('./captured-providers.cjs').createCapturedProviders(db);
  class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
  const deps={db,crm4Cloud:config,HttpsError,onCall:(...args)=>args.at(-1),admin:{firestore:require('firebase-admin').firestore,storage:()=>storage,auth:()=>auth},resend:providers.resend,resendSecret:{value:()=>{throw Error('Provider secrets disabled');}}};
  const handlers=require('../tools/register-handlers.cjs').registerHandlers(deps);
  return {app,db,auth,handlers,documents,config,async close(){await db.terminate();await deleteApp(app);}};
 }catch(error){await db.terminate();await deleteApp(app);throw error;}
}
module.exports={createCloudRuntime};

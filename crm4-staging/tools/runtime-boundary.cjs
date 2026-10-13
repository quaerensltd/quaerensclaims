'use strict';
function assertRuntime(deps, authRequired=false, env=process.env) {
 if(!deps.crm4Cloud){
  if(env.GCLOUD_PROJECT!=='demo-quaerens-crm4'||env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080'||(authRequired&&env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9099'))throw Error('CRM4 demo emulators required');
  return;
 }
 const config=require('../release/configuration.cjs').validateConfiguration(deps.crm4Cloud);
 if(env.GCLOUD_PROJECT!==config.projectId||deps.db.projectId!==config.projectId)throw Error('CRM4 cloud project mismatch');
 if(['FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','STORAGE_EMULATOR_HOST','GOOGLE_APPLICATION_CREDENTIALS'].some(k=>env[k]))throw Error('Cloud runtime refuses emulator or key-file credentials');
 if(config.deploymentApproved!==true||env.CRM4_DEPLOYMENT_APPROVED!=='true')throw Error('Application deployment approval required');
}
module.exports={assertRuntime};

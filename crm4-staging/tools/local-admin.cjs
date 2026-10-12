'use strict';
// Exact selected deployed declarations, not a rewritten Admin business handler.
// Monolithic index initialization and unrelated exports are never evaluated.
function loadAdmin(name,deps) {
  if(!['CreateUser','UpdateMembership','SendPasswordSetupEmail','ProvisionExistingProcessing'].some(s=>name==='crm4Admin'+s))throw Error('Unreviewed admin handler');
  const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
  const root=path.resolve(__dirname,'../backend-sources',name),manifest=require(path.join(root,'source-manifest.json'));
  for(const row of manifest.records)if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,row.target))).digest('hex')!==row.cloneSha256)throw Error('Admin source integrity mismatch');
  const exports={};
  const localRequire=id=>{
    const target=id.replace(/^\.\//,'')+'.js';
    if(!id.startsWith('./')||!manifest.records.some(r=>r.target===target))throw Error('Unreviewed Admin dependency');
    return require(path.join(root,target));
  };
  require('node:vm').compileFunction(fs.readFileSync(path.join(root,'index.js'),'utf8'),['exports','require','admin','db','onCall','HttpsError','resend','resendApiKeySecret','FieldValue','process'],{filename:path.join(root,'index.js')})(exports,localRequire,deps.admin,deps.db,deps.onCall,deps.HttpsError,deps.resend,{},deps.admin.firestore.FieldValue,Object.freeze({env:Object.freeze({FUNCTIONS_EMULATOR:'false'})}));
  return async request=>{
    if(request.auth?.token?.platformAdmin!==true)throw new deps.HttpsError('permission-denied','Platform administrator required');
    const synthetic=email=>{if(!/^[^@\s]+@(?:crm4\.)?example\.test$/.test(email||''))throw new deps.HttpsError('permission-denied','Synthetic emulator identity required');};
    if(name.endsWith('CreateUser'))synthetic(String(request.data?.email||'').trim().toLowerCase());
    else if(name.endsWith('ProvisionExistingProcessing')) {
      const rows=await deps.db.collection('users').where('role','==','processing').get();
      for(const row of rows.docs) {
        try { synthetic((await deps.admin.auth().getUser(row.id)).email); }
        catch(error) { if(error.code!=='auth/user-not-found')throw error; }
      }
    } else if(request.data?.uid)synthetic((await deps.admin.auth().getUser(request.data.uid)).email);
    return exports[name](request);
  };
}
module.exports={loadAdmin};

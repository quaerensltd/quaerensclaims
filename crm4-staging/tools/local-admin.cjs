'use strict';
// Exact selected deployed declarations, not a rewritten Admin business handler.
// Monolithic index initialization and unrelated exports are never evaluated.
function loadAdmin(name,deps) {
  if(!['CreateUser','UpdateMembership','SendPasswordSetupEmail','ProvisionExistingProcessing'].some(s=>name==='crm4Admin'+s))throw Error('Unreviewed admin handler');
  const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
  const root=path.resolve(__dirname,'../backend-sources',name),manifest=require(path.join(root,'source-manifest.json'));
  for(const row of manifest.records)if(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,row.target))).digest('hex')!==row.cloneSha256)throw Error('Admin source integrity mismatch');
  const policy=require('./admin-authority.cjs').administration(deps);
  if(name==='crm4AdminUpdateMembership')return policy.update;
  const exports={};
  const localRequire=id=>{
    const target=id.replace(/^\.\//,'')+'.js';
    if(!id.startsWith('./')||!manifest.records.some(r=>r.target===target))throw Error('Unreviewed Admin dependency');
    return require(path.join(root,target));
  };
  let source=fs.readFileSync(path.join(root,'index.js'),'utf8');
  if(name!=='crm4AdminProvisionExistingProcessing'){
    const guard=/if \(!request\.auth \|\| request\.auth\.token\.platformAdmin !== true\) \{?[\s]*throw new HttpsError\("permission-denied", "Platform administrator access is required\."\);[\s]*\}?/;
    if(!guard.test(source))throw Error('Admin authority hook drift');
    source=source.replace(guard,'await crm4Administration.authorize(request,{role:request.data?.role});');
    source=source.replace('outcome: "sent"','outcome: "captured"');
    if(name==='crm4AdminSendPasswordSetupEmail')source=source.replace('  const user = await admin.auth().getUser(uid)', '  await crm4Administration.authorize(request,{target:{...membership.data(),uid}});\n  const user = await admin.auth().getUser(uid)');
    if(name==='crm4AdminCreateUser'){
      source=source.replace('user = await admin.auth().createUser({ email, displayName, emailVerified: false });','user = await admin.auth().createUser({ email, displayName, emailVerified: false, disabled:true });');
      source=source.replace('    role,\n    workspaceId:', '    role,\n    ...(crm4Administration.desired(data)?{roles:[...crm4Administration.desired(data)]}:{}),\n    workspaceId:');
    }
  }
  require('node:vm').compileFunction(source,['exports','require','admin','db','onCall','HttpsError','resend','resendApiKeySecret','FieldValue','process','crm4Capabilities','crm4Administration'],{filename:path.join(root,'index.js')})(exports,localRequire,deps.admin,deps.db,deps.onCall,deps.HttpsError,deps.resend,{},deps.admin.firestore.FieldValue,Object.freeze({env:Object.freeze({FUNCTIONS_EMULATOR:'false'})}),require('./staff-capabilities.cjs'),policy);
  return async request=>{
    if(name==='crm4AdminProvisionExistingProcessing'){if(request.auth?.token?.platformAdmin!==true)throw new deps.HttpsError('permission-denied','Platform administrator required');}
    else {const target=request.data?.uid?{...(await deps.db.collection('crm4Memberships').doc(request.data.uid).get()).data(),uid:request.data.uid}:undefined;await policy.authorize(request,{target,role:request.data?.role});}
    const synthetic=email=>{if(!/^[^@\s]+@(?:crm4\.)?example\.test$/.test(email||''))throw new deps.HttpsError('permission-denied','Synthetic emulator identity required');};
    if(name.endsWith('CreateUser'))synthetic(String(request.data?.email||'').trim().toLowerCase());
    else if(name.endsWith('ProvisionExistingProcessing')) {
      const rows=await deps.db.collection('users').where('role','==','processing').get();
      for(const row of rows.docs) {
        try { synthetic((await deps.admin.auth().getUser(row.id)).email); }
        catch(error) { if(error.code!=='auth/user-not-found')throw error; }
      }
    } else if(request.data?.uid){const targetUser=await deps.admin.auth().getUser(request.data.uid);synthetic(targetUser.email);if(Object.keys(targetUser.customClaims||{}).length)throw new deps.HttpsError('permission-denied','Claim-bearing identities require separate governance');}
    const result=await exports[name](request);
    return name.endsWith('SendPasswordSetupEmail')?{...result,setupEmailSent:false,capturedOnly:true,externalCommunications:0}:result;
  };
}
module.exports={loadAdmin};

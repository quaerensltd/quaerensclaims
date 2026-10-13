'use strict';
// Local prepared-context integrity. Never executes a build or accesses the cloud.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function contextFiles(root) {
 const files=[];
 function walk(dir,prefix='') {for(const name of fs.readdirSync(dir).sort()) {
  const relative=prefix+name,full=path.join(dir,name),stat=fs.lstatSync(full);
  if(stat.isSymbolicLink())throw Error('Context symlink denied');
  if(stat.isDirectory())walk(full,relative+'/');
  else if(!['context-manifest.json','preparation.json'].includes(relative))files.push({path:relative,sha256:hash(fs.readFileSync(full))});
 }}
 walk(root);return files;
}
function sealContext(root) {
 const files=contextFiles(root),digest=hash(JSON.stringify(files));
 fs.writeFileSync(path.join(root,'context-manifest.json'),JSON.stringify({schemaVersion:1,digest,files},null,2)+'\n');
 return {contextDigest:digest,contextFiles:files.length};
}
function verifyContext(root,expectedDigest) {
 if(!/^[a-f0-9]{64}$/.test(expectedDigest||''))throw Error('Independent expected context digest required');
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'context-manifest.json'))),files=contextFiles(root);
 if(manifest.digest!==expectedDigest||hash(JSON.stringify(files))!==expectedDigest||JSON.stringify(files)!==JSON.stringify(manifest.files))throw Error('Prepared context drift');
 return {contextDigest:expectedDigest,contextFiles:files.length};
}
module.exports={sealContext,verifyContext};
if(require.main===module)console.log(JSON.stringify(verifyContext(process.argv[2],process.argv[3])));

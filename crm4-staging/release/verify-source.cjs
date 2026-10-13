'use strict';
// Offline, allowlisted packaging. Never executes source bundles or cloud CLIs.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function verifySource() {
 const files=[],add=(relative,expected)=>{
  if(relative.includes('..')||path.isAbsolute(relative)||/\\/.test(relative))throw Error('Unsafe package path');
  const full=path.join(root,relative),resolved=fs.realpathSync(full);
  if(!resolved.startsWith(root+path.sep)||fs.lstatSync(full).isSymbolicLink())throw Error('Package escape');
  const sha256=hash(fs.readFileSync(full));if(expected&&sha256!==expected)throw Error('Source drift: '+relative);
  files.push({path:relative,sha256});
 };
 const dependencies=new Set(['firebase-admin','firebase-functions']);
 for(const name of fs.readdirSync(path.join(root,'backend-sources')).sort()){
  const base='backend-sources/'+name+'/',m=JSON.parse(fs.readFileSync(path.join(root,base,'source-manifest.json')));
  if(m.unresolved?.length)throw Error('Unresolved source import: '+name);
  for(const row of m.records)add(base+row.target,row.cloneSha256);
  add(base+'source-manifest.json');
  const brochure=base+'internal-assets/client-information-brochure-en-2026-08-13.pdf';
  if(fs.existsSync(path.join(root,brochure))&&!files.some(f=>f.path===brochure))add(brochure,'6188112b85b08f495cf6a83485dd4e6fa44b5fe6cd38ae7509468be64351fcf6');
  for(const mod of m.packages||[])if(!require('node:module').isBuiltin(mod))dependencies.add(mod.startsWith('@')?mod.split('/').slice(0,2).join('/'):mod.split('/')[0]);
 }
 const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8').replace(/^\uFEFF/,''));
 for(const name of dependencies)if(!/^\d+\.\d+\.\d+$/.test(pkg.dependencies[name]||''))throw Error('Unpinned dependency: '+name);
 const lock=JSON.parse(fs.readFileSync(path.join(__dirname,'package-lock.json')));
 for(const [name,version]of Object.entries(pkg.dependencies))if(lock.packages['node_modules/'+name]?.version!==version)throw Error('Lock mismatch: '+name);
 const queue=['local-handlers.cjs'],seen=new Set();
 while(queue.length){const name=queue.shift();if(seen.has(name))continue;seen.add(name);add('tools/'+name);const source=fs.readFileSync(path.join(root,'tools',name),'utf8');for(const match of source.matchAll(/require\(['"]\.\/([^'"]+\.cjs)['"]\)/g))queue.push(match[1]);}
 for(const name of fs.readdirSync(__dirname).filter(name=>/\.(cjs|json|rules)$/.test(name)||['Dockerfile','.dockerignore'].includes(name)).sort())add('release/'+name);
 return {schemaVersion:1,workspace:'CRM4',team:'Spain',deployable:false,reason:'Offline cloud runtime and routing candidates only; organization/provisioning authorization, dual-role support and cloud acceptance remain blocked',files:files.sort((a,b)=>a.path.localeCompare(b.path)),dependencies:pkg.dependencies};
}
function packageReview() {
 const report=verifySource(),out=path.join(root,'.scratch','release-review');fs.mkdirSync(out,{recursive:true});
 for(const row of report.files){const target=path.join(out,row.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,row.path),target);}
 fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({files:report.files.length,deployable:report.deployable,output:out}));
 return report;
}
module.exports={verifySource,packageReview};
if(require.main===module)packageReview();

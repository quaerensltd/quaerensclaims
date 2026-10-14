'use strict';
// Public sources only. No cloud SDK, upload or deployment operation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const lock=require('./inputs.lock.json');const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function prepare(parent){
 fs.mkdirSync(parent,{recursive:true});const out=fs.mkdtempSync(path.join(parent,'sources-'));
 const patch=fs.readFileSync(path.join(__dirname,'zlib-1.3.1.patch'));if(hash(patch)!==lock.patchSha256)throw Error('Patch drift');
 const records=[];
 for(const [name,spec]of [['node',lock.nodeSource],['system',lock.systemSource]]){
  const archive=path.join(parent,spec.sha256+'.archive');
  if(!fs.existsSync(archive)){const r=await fetch(spec.url);if(!r.ok)throw Error('Source HTTP '+r.status);const bytes=Buffer.from(await r.arrayBuffer());if(hash(bytes)!==spec.sha256)throw Error('Download checksum mismatch');fs.writeFileSync(archive,bytes,{flag:'wx'});}
  if(hash(fs.readFileSync(archive))!==spec.sha256)throw Error('Cached source checksum mismatch');
  const dest=path.join(out,name);fs.mkdirSync(dest);cp.execFileSync('tar',['-xf',archive,'--strip-components=1','-C',dest]);
  const target=path.join(dest,name==='node'?'deps/zlib/gzwrite.c':'gzwrite.c');const original=fs.readFileSync(target);if(hash(original)!==lock.unpatchedGzwriteSha256)throw Error('Unexpected gzwrite source');
  const before='            if (gz_comp(state, Z_NO_FLUSH) == -1)\n                return 0;\n            len -= n;';
  const after='            if (gz_comp(state, Z_NO_FLUSH) == -1) {\n                state->strm.avail_in = 0;\n                state->strm.next_in = state->in;\n                return 0;\n            }\n            len -= n;';
  const source=original.toString();if(source.split(before).length!==2)throw Error('Nonunique patch context');fs.writeFileSync(target,source.replace(before,after));
  records.push({component:name,archiveSha256:spec.sha256,beforeSha256:hash(original),afterSha256:hash(fs.readFileSync(target)),patchSha256:hash(patch)});
 }
 const receipt={output:out,records,compilationPerformed:false};fs.writeFileSync(path.join(out,'patch-receipt.json'),JSON.stringify(receipt,null,2)+'\n');return receipt;
}
module.exports={prepare};if(require.main===module)prepare(path.resolve(process.argv[2]||'crm4-staging/.scratch/zlib-remediation')).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});

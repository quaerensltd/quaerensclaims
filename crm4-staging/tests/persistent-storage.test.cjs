'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPersistentStorage}=require('../release/persistent-storage.cjs');
const config=JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname,'../release/infrastructure.proposed.json'),'utf8').replace(/^\uFEFF/,''));
test('cloud storage candidate pins app/bucket and delegates writes, preconditions and failures without memory fallback',async()=>{
 const app={name:'crm4-spain-test',options:{projectId:config.projectId,storageBucket:config.bucket}},calls=[],stored=new Map();
 const sdk=()=>({bucket:name=>{assert.equal(name,config.bucket);return {file:path=>({save:async(bytes,options)=>{calls.push(options);if(stored.has(path)&&options?.preconditionOpts?.ifGenerationMatch===0)throw Object.assign(Error('exists'),{code:412});stored.set(path,Buffer.from(bytes));},download:async()=>{if(!stored.has(path))throw Error('missing');return [Buffer.from(stored.get(path))];},getSignedUrl:async options=>{assert.equal(options.action,'read');assert(options.expires<=Date.now()+300000);return ['synthetic-signed-url'];}})}}});
 const name='professional-assessments/test/versions/v1/report.pdf',r=createPersistentStorage(app,config,sdk),f=r.bucket().file(name);
 const options={preconditionOpts:{ifGenerationMatch:0}};await f.save(Buffer.from('first'),options);assert.deepEqual(calls[0],options);
 await assert.rejects(f.save(Buffer.from('overwrite'),options),e=>e.code===412);
 assert.equal((await createPersistentStorage(app,config,sdk).bucket().file(name).download())[0].toString(),'first');
 stored.set(name,Buffer.from('changed-in-storage'));assert.equal((await f.download())[0].toString(),'changed-in-storage');
 stored.delete(name);await assert.rejects(f.download(),/missing/);
 assert.throws(()=>r.bucket('quaerensclaims.appspot.com'),/Cross-project/);
 for(const name of ['../../key','clientPortal/x/shared/../secret','crm2/file','professional-assessments/x/versions/y/report.exe'])assert.throws(()=>r.bucket().file(name),/Unapproved/);
 assert.throws(()=>createPersistentStorage({...app,options:{...app.options,projectId:'quaerensclaims'}},config,sdk),/Explicit CRM4/);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
test('runtime documents survive a fresh adapter and never use a stale memory cache',async()=>{
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const r=require('../tools/local-handlers.cjs').createLocalHandlers();
 try{
  const make=()=>require('../tools/local-storage.cjs').createLocalStorage(r.app),first=make(),name='professional-assessments/storage-'+require('node:crypto').randomUUID()+'/versions/v1/report.pdf';
  const file=first.bucket().file(name);await file.save(Buffer.from('persistent report'),{preconditionOpts:{ifGenerationMatch:0}});
  first.objects.set(name,Buffer.from('stale cache'));
  assert.equal((await file.download())[0].toString(),'persistent report');
  const second=make();assert.equal((await second.bucket().file(name).download())[0].toString(),'persistent report');
  await assert.rejects(second.bucket().file(name).save(Buffer.from('overwrite'),{preconditionOpts:{ifGenerationMatch:0}}),e=>e.code===412);
  const stored=require('firebase-admin/storage').getStorage(r.app).bucket('demo-quaerens-crm4.appspot.com').file(name);await stored.delete();
  await assert.rejects(file.download(),e=>e.code===404);
 }finally{await r.close();}
});

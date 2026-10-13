'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {sealContext,verifyContext}=require('../release/context-integrity.cjs');
test('independent context digest rejects changed, additional and missing build inputs',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'crm4-context-'));
 try {
  fs.writeFileSync(path.join(root,'Dockerfile'),'reviewed');const sealed=sealContext(root);
  assert.deepEqual(verifyContext(root,sealed.contextDigest),sealed);
  fs.writeFileSync(path.join(root,'Dockerfile'),'changed');assert.throws(()=>verifyContext(root,sealed.contextDigest),/drift/);
  fs.writeFileSync(path.join(root,'Dockerfile'),'reviewed');fs.writeFileSync(path.join(root,'extra'),'unreviewed');assert.throws(()=>verifyContext(root,sealed.contextDigest),/drift/);
  fs.unlinkSync(path.join(root,'extra'));fs.unlinkSync(path.join(root,'Dockerfile'));assert.throws(()=>verifyContext(root,sealed.contextDigest),/drift/);
  assert.throws(()=>verifyContext(root),/expected/);
 }finally{assert(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep+'crm4-context-'));for(const name of fs.readdirSync(root))fs.unlinkSync(path.join(root,name));fs.rmdirSync(root);}
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
test('isolated release dependencies extract synthetic DOCX without loading CLI formatting dependencies',async()=>{
 const base=path.resolve(__dirname,'../release/node_modules');
 const docx=require(path.join(base,'docx')),mammoth=require(path.join(base,'mammoth'));
 const bytes=await docx.Packer.toBuffer(new docx.Document({sections:[{children:[new docx.Paragraph('CRM4 synthetic Spray Foam evidence')]}]}));
 assert.equal((await mammoth.extractRawText({buffer:bytes})).value.trim(),'CRM4 synthetic Spray Foam evidence');
 assert(!Object.keys(require.cache).some(name=>/[\\/]node_modules[\\/](argparse|sprintf-js)[\\/]/.test(name)));
 const admin=require(path.join(base,'firebase-admin'));
 assert.equal(typeof admin.initializeApp,'function');assert.equal(typeof admin.firestore,'function');assert.equal(typeof admin.auth,'function');
});

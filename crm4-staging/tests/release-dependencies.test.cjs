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

test('Mammoth argparse override preserves CLI DOCX extraction without sprintf-js',async()=>{
 const fs=require('node:fs'),os=require('node:os'),cp=require('node:child_process');
 const base=path.resolve(__dirname,'../release/node_modules'),docx=require(path.join(base,'docx'));
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'crm4-docx-'));
 try {const file=path.join(dir,'synthetic.docx');fs.writeFileSync(file,await docx.Packer.toBuffer(new docx.Document({sections:[{children:[new docx.Paragraph('CRM4 synthetic CLI parity')]}]})));
 const output=cp.execFileSync(process.execPath,[path.join(base,'mammoth/bin/mammoth'),file,'--output-format=html'],{encoding:'utf8'});
 assert.match(output,/<p>CRM4 synthetic CLI parity<\/p>/);
 assert.equal(require(path.join(base,'argparse/package.json')).version,'2.0.1');
 assert(!fs.existsSync(path.join(base,'sprintf-js')));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

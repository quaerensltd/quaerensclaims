'use strict';
// Offline Linux image acceptance. Never starts the application or contacts Firebase.
const assert=require('node:assert/strict');
async function smoke(){
 if(process.platform==='linux')assert.equal(process.getuid(),65532,'runtime must be nonroot');
 assert.equal(process.versions.node.split('.')[0],'22');
 const docx=require('docx'),mammoth=require('mammoth');
 const bytes=await docx.Packer.toBuffer(new docx.Document({sections:[{children:[new docx.Paragraph('CRM4 synthetic runtime acceptance')]}]}));
 assert.equal((await mammoth.extractRawText({buffer:bytes})).value.trim(),'CRM4 synthetic runtime acceptance');
 const PDFDocument=require('pdfkit'),pdf=new PDFDocument();const chunks=[];
 const done=new Promise((resolve,reject)=>{pdf.on('data',b=>chunks.push(b));pdf.on('end',resolve);pdf.on('error',reject);});
 pdf.text('CRM4 synthetic runtime acceptance');pdf.end();await done;
 assert.equal(Buffer.concat(chunks).subarray(0,5).toString(),'%PDF-');
 assert.equal(typeof require('pdf-parse'),'function');
 assert.equal(typeof require('firebase-admin').initializeApp,'function');
 assert.equal(typeof require('google-auth-library').OAuth2Client,'function');
 console.log(JSON.stringify({runtimeSmoke:'PASS',node:process.versions.node,platform:process.platform,uid:process.getuid?.(),networkCalls:0}));
}
module.exports={smoke};
if(require.main===module)smoke().catch(e=>{console.error(e);process.exitCode=1;});

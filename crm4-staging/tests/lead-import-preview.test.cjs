'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{preview,phone,parseCsv}=require('../tools/lead-import-preview.cjs');
const staff=['staff-one','staff-two'].map(uid=>({uid,workspaceId:'CRM4',active:true,role:'lister',roles:['lister','closer']}));
const header='sourceRowId,forename,surname,email,telephone,referralSource,assigneeUid,workspaceId';
const context={batchId:'synthetic-import-0001',staff,existingRevision:'synthetic-empty'};
test('CSV preview assigns distinct staff, normalizes Spanish phones and blocks duplicates/invalid/workspace rows',()=>{
 const p=preview(header+'\na,Test,One,one@example.test,612345678,direct_enquiry,staff-one,CRM4\nb,Test,Two,two@example.test,+34612345678,direct_enquiry,staff-two,CRM4\nc,Test,Three,three@example.test,+34910000002,direct_enquiry,staff-two,CRM4\nd,,Missing,four@example.test,,direct_enquiry,staff-one,CRM4\ne,Test,Foreign,five@example.test,,direct_enquiry,staff-one,CRM3',context);
 assert.deepEqual(p.counts,{accepted:2,rejected:2,duplicate:1});assert.equal(p.rows[0].data.telephone,'+34612345678');assert.equal(p.rows[2].assigneeUid,'staff-two');assert.equal(p.executionAuthorized,false);assert.equal(p.rows[0].data.workspaceId,undefined);
 assert.equal(preview(header+'\na,Test,One,ONE@example.test,,direct_enquiry,staff-one,CRM4',{...context,existing:[{workspaceId:'CRM4',email:'one@example.test'}]}).counts.duplicate,1);
});
test('preview rejects authority injection, malformed CSV, bad phone and inactive assignee inventory',()=>{
 assert.throws(()=>parseCsv(header+',role\n'),/Unknown/);assert.throws(()=>parseCsv(header+'\n"unfinished'),/Unclosed/);assert.throws(()=>phone('02012345678'));assert.throws(()=>phone('+34123'));assert.equal(phone('0034910000001'),'+34910000001');assert.throws(()=>preview(header,{...context,staff:[staff[0],{...staff[1],active:false}]}));
 const p=preview(header+'\na,=cmd,One,a@example.test,,direct_enquiry,staff-one,CRM4',context);assert.equal(p.counts.rejected,1);
});
test('quoted fields and deterministic request hashes preserve exact retries and expose changed allocation',()=>{
 const csv=header+'\na,"Test, Quoted",One,a@example.test,,direct_enquiry,staff-one,CRM4';const a=preview(csv,context),b=preview(csv,context);assert.equal(a.previewHash,b.previewHash);assert.equal(a.rows[0].data.requestId,b.rows[0].data.requestId);const c=preview(csv.replace('staff-one','staff-two'),context);assert.notEqual(c.previewHash,a.previewHash);assert.notEqual(c.rows[0].data.requestId,a.rows[0].data.requestId);
});

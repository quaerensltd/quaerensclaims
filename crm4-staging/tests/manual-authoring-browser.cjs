'use strict';
// Actual adapted authoring screen and separate authenticated reviewer.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
async function run(){
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const service=await require('../tools/serve-callables.cjs').start(),server=http.createServer(require('../tools/serve-local.cjs').handler);
 await new Promise(r=>server.listen(4404,'127.0.0.1',r));
 const browser=await require(process.env.CRM4_PLAYWRIGHT_MODULE).chromium.launch({channel:'msedge',headless:true});
 const id='manual-browser-'+require('node:crypto').randomUUID(),email=id+'@example.test',password='Synthetic-Only-927!';
 const db=service.runtime.db,auth=require('firebase-admin/auth').getAuth(service.runtime.app),evidence={status:'INCOMPLETE',responsive:[]};
 const output=path.resolve(__dirname,'../.scratch/manual-authoring');fs.mkdirSync(output,{recursive:true});
 try{
  await auth.createUser({uid:id,email,password});
  await db.collection('crm4Memberships').doc(id).set({workspaceId:'CRM4',active:true,role:'manager',email,displayName:'Synthetic Manager'});
  await db.collection('users').doc(id).set({assessmentCapabilities:['assessmentAuthor'],assessmentCategoryAccess:['spray-foam'],assessmentWorkspaceAccess:['CRM4']});
  const reviewer=id+'-reviewer',reviewEmail=reviewer+'@example.test';
  await auth.createUser({uid:reviewer,email:reviewEmail,password});
  await db.collection('crm4Memberships').doc(reviewer).set({workspaceId:'CRM4',active:true,role:'manager',email:reviewEmail});
  await db.collection('users').doc(reviewer).set({assessmentCapabilities:['assessmentAuthor','assessmentApprover','assessmentIssuer','assessmentReviewer'],assessmentCategoryAccess:['spray-foam'],assessmentWorkspaceAccess:['CRM4']});
  await db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4',clientName:'Synthetic Manual Browser',email:id+'-client@example.test',reference:id,updatedAt:new Date()});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',r=>['127.0.0.1','www.gstatic.com','cdn.tailwindcss.com','cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4404/crm4-login.html');await page.locator('#email').fill(email);await page.locator('#password').fill(password);await page.locator('#submit').click();
  try{await page.waitForURL(u=>!u.pathname.includes('crm4-login'),{waitUntil:'commit'});}catch(e){if(!e.message.includes('ERR_ABORTED'))throw e;}
  await page.waitForLoadState('domcontentloaded');await page.waitForTimeout(1000);
  await page.goto('http://127.0.0.1:4404/crm4-assessment-builder.html?caseId='+id);
  await page.locator('#caseId option[value="'+id+'"]').waitFor({state:'attached'});
  await page.locator('#route').selectOption('spray-foam');
  await page.locator('[name=issueSummary]').fill('Synthetic client-reported roof concerns. Evidence unverified.');
  await page.locator('[name=financialPosition]').fill('Unquantified pending evidence.');
  await page.locator('#save').click();
  await page.locator('#manualIdentity').filter({hasText:'Revision 2'}).waitFor();
  const assessmentId=new URL(page.url()).searchParams.get('assessmentId'),a=db.collection('professionalAssessments').doc(assessmentId);
  const qar=(await a.get()).data().qarReference;
  await page.reload();await page.locator('#manualIdentity').filter({hasText:'Revision 2'}).waitFor();
  assert.equal(await page.locator('[name=issueSummary]').inputValue(),'Synthetic client-reported roof concerns. Evidence unverified.');
  await page.locator('[name=issueSummary]').fill('Synthetic client-reported roof concerns. Edited.');await page.locator('#save').click();await page.locator('#manualIdentity').filter({hasText:'Revision 3'}).waitFor();
  await page.locator('#submitReview').click();await page.locator('#manualIdentity').filter({hasText:'UNDER REVIEW'}).waitFor();
  assert.equal((await db.collection('crm4Assessments').where('caseId','==',id).get()).size,0);
  const download=page.waitForEvent('download');await page.locator('#rtf').click();const file=await download;await file.saveAs(path.join(output,'synthetic-draft.rtf'));
  assert.match(fs.readFileSync(path.join(output,'synthetic-draft.rtf'),'utf8'),/Synthetic client-reported roof concerns/);
  const reviewContext=await browser.newContext({viewport:{width:1440,height:1000}}),reviewPage=await reviewContext.newPage();
  await reviewContext.route('**/*',r=>['127.0.0.1','www.gstatic.com','cdn.tailwindcss.com','cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());
  reviewPage.on('pageerror',e=>errors.push(e.message));
  await reviewPage.goto('http://127.0.0.1:4404/crm4-login.html');await reviewPage.locator('#email').fill(reviewEmail);await reviewPage.locator('#password').fill(password);await reviewPage.locator('#submit').click();
  try{await reviewPage.waitForURL(u=>!u.pathname.includes('crm4-login'),{waitUntil:'commit'});}catch(e){if(!e.message.includes('ERR_ABORTED'))throw e;}
  await reviewPage.waitForLoadState('domcontentloaded');await reviewPage.waitForTimeout(1000);
  await reviewPage.goto(page.url());await reviewPage.locator('#manualIdentity').filter({hasText:'UNDER REVIEW'}).waitFor();
  for(const box of await reviewPage.locator('[data-review]').all())await box.check();
  await reviewPage.locator('#approveManual').click();await reviewPage.locator('#manualIdentity').filter({hasText:'APPROVED'}).waitFor();
  await reviewPage.locator('#generateManual').click();await reviewPage.locator('#result').filter({hasText:'completed'}).waitFor();
  await reviewPage.locator('#issueManual').click();await reviewPage.locator('#manualIdentity').filter({hasText:'ISSUED'}).waitFor();
  const versionId=(await a.get()).data().currentVersionId;
  await page.reload();await page.locator('#manualIdentity').filter({hasText:'ISSUED'}).waitFor();
  await page.locator('#correctManual').click();await page.locator('#manualIdentity').filter({hasText:'DRAFT'}).waitFor();
  await page.locator('[name=issueSummary]').fill('Synthetic corrected narrative');await page.locator('#save').click();await page.locator('#result').filter({hasText:'completed'}).waitFor();
  assert.equal((await a.get()).data().qarReference,qar);
  assert.equal((await db.collection('professionalAssessmentVersions').doc(versionId).get()).data().status,'ISSUED');
  assert.equal((await a.get()).data().clientContent.executiveSummary,'Synthetic corrected narrative');
  await page.locator('#submitReview').click();await page.locator('#manualIdentity').filter({hasText:'UNDER REVIEW'}).waitFor();
  await reviewPage.reload();await reviewPage.locator('#manualIdentity').filter({hasText:'UNDER REVIEW'}).waitFor();
  for(const box of await reviewPage.locator('[data-review]').all())await box.check();
  await reviewPage.locator('#approveManual').click();await reviewPage.locator('#manualIdentity').filter({hasText:'APPROVED'}).waitFor();
  await reviewPage.locator('#generateManual').click();await reviewPage.locator('#result').filter({hasText:'completed'}).waitFor();
  await reviewPage.locator('#issueManual').click();await reviewPage.locator('#manualIdentity').filter({hasText:'ISSUED'}).waitFor();
  assert.equal((await a.get()).data().currentVersion,2);
  assert.equal((await a.get()).data().qarReference,qar);
  assert.equal((await db.collection('professionalAssessmentVersions').doc(versionId).get()).data().status,'SUPERSEDED');
  const documents=await db.collection('professionalAssessmentDocuments').where('assessmentId','==',assessmentId).get();assert.equal(documents.size,2);
  for(const d of documents.docs){assert.equal(require('node:crypto').createHash('sha256').update(service.runtime.storageObjects.get(d.data().pdfPath)).digest('hex'),d.data().pdfHash);}
  await page.reload();await page.locator('#manualIdentity').filter({hasText:'Version 2'}).waitFor();
  assert.match(await page.locator('#preview').innerText(),/Assessment route: Spray Foam Loft Insulation/);
  assert.equal(await page.locator('[name=status]').inputValue(),'ISSUED');
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:path.join(output,'authoring-'+width+'.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);evidence.responsive.push({width,overflow});assert(!overflow);}
  assert.deepEqual(errors,[]);evidence.status='PASS';evidence.assessmentId=assessmentId;evidence.qar=qar;evidence.flows=['author','save','reopen','edit','submit','independent approve','generate','captured issue','correction draft/save','correction submit/approve/generate/issue','version 1 superseded; version 2 same QAR; both hashes verified'];
 }finally{fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(evidence,null,2));await browser.close();await new Promise(r=>server.close(r));await service.close();console.log(JSON.stringify(evidence));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});

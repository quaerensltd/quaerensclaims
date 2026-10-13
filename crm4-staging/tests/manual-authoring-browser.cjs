'use strict';
// Test the unchanged actual legacy authoring screen, including its fail-closed
// save boundary. A diagnostic result is never called complete workflow acceptance.
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
  await db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4',clientName:'Synthetic Manual Browser',reference:id,updatedAt:new Date()});
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
  await page.locator('#result').filter({hasText:/permission/i}).waitFor();
  assert.equal((await db.collection('crm4Assessments').where('caseId','==',id).get()).size,0);
  const download=page.waitForEvent('download');await page.locator('#rtf').click();const file=await download;await file.saveAs(path.join(output,'synthetic-draft.rtf'));
  assert.match(fs.readFileSync(path.join(output,'synthetic-draft.rtf'),'utf8'),/Synthetic client-reported roof concerns/);
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:path.join(output,'authoring-'+width+'.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);evidence.responsive.push({width,overflow});assert(!overflow);}
  assert.deepEqual(errors,[]);evidence.status='BLOCKED_SAVE_CONTRACT';evidence.reason='Legacy builder writes crm4Assessments directly; emulator rules intentionally read-only. No governed conversion to professionalAssessments or authoring callable exists in pinned inventory.';
 }finally{fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(evidence,null,2));await browser.close();await new Promise(r=>server.close(r));await service.close();console.log(JSON.stringify(evidence));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
// Actual cloned portal-admin forms and search UI, synthetic records only.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
async function run(){
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',STORAGE_EMULATOR_HOST:'http://127.0.0.1:9199'});
 const service=await require('../tools/serve-callables.cjs').start(),server=http.createServer(require('../tools/serve-local.cjs').handler);
 await new Promise(r=>server.listen(4404,'127.0.0.1',r));
 const browser=await require(process.env.CRM4_PLAYWRIGHT_MODULE).chromium.launch({channel:'msedge',headless:true});
 const id='browser-'+require('node:crypto').randomUUID(),password='Synthetic-Only-927!',email=id+'@example.test',clientEmail=id+'-client@example.test';
 const db=service.runtime.db,auth=require('firebase-admin/auth').getAuth(service.runtime.app),evidence={status:'INCOMPLETE',flows:[],responsive:[]};
 const output=path.resolve(__dirname,'../.scratch/final-contracts');fs.mkdirSync(output,{recursive:true});
 try {
  await auth.createUser({uid:id,email,password});
  await db.collection('crm4Memberships').doc(id).set({workspaceId:'CRM4',active:true,role:'processing',email,displayName:'Synthetic Processing'});
  await db.collection('crm4Leads').doc(id).set({workspaceId:'CRM4',email:clientEmail,clientName:'Synthetic Browser Contract',reference:id});
  const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
  await context.route('**/*',r=>['127.0.0.1','www.gstatic.com','cdn.tailwindcss.com','cdn.jsdelivr.net','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4404/crm4-login.html');await page.locator('#email').fill(email);await page.locator('#password').fill(password);await page.locator('#submit').click();
  try {await page.waitForURL(u=>!u.pathname.includes('crm4-login'),{waitUntil:'commit'});}catch(e){if(!e.message.includes('ERR_ABORTED'))throw e;}
  await page.waitForLoadState('domcontentloaded');await page.waitForTimeout(1000);
  await page.goto('http://127.0.0.1:4404/client-portal-admin.html');await page.locator('#workspace').waitFor({state:'visible'});
  for(const [field,value] of Object.entries({crmCaseId:id,clientName:'Synthetic Browser Contract',clientEmail,caseRef:'SYNTHETIC-'+id,claimType:'spray-foam',status:'Synthetic review',summary:'Isolated compatibility test',nextStep:'No delivery'}))await page.locator('#'+field).fill(value);
  await page.locator('#caseForm button').click();await page.locator('#caseMsg').filter({hasText:'Controlled projection saved'}).waitFor();
  const caseId='crm4-legacy-'+id;await page.locator(`[data-open="${caseId}"]`).click();
  evidence.flows.push('Actual v2 projection form');
  await page.locator('#message').fill('Synthetic browser staff message');await page.locator('#messageForm button').click();await page.locator('#messageMsg').filter({hasText:'Message shared securely'}).waitFor();
  evidence.flows.push('Actual staff message form');
  await page.locator('#documentFile').setInputFiles({name:'synthetic.txt',mimeType:'text/plain',buffer:Buffer.from('Synthetic browser evidence')});await page.locator('#documentTitle').fill('Synthetic evidence');await page.locator('#documentForm button').click();
  await page.locator('#documentMsg').filter({hasText:'Document shared securely'}).waitFor();evidence.flows.push('Actual staff Storage upload and registration');
  await page.locator('#inviteForm button').click();await page.locator('#inviteMsg').filter({hasText:'Invitation created and copied'}).waitFor();evidence.flows.push('Actual invitation form; local URL only');
  await page.locator('#inviteForm button').click();await page.locator('#inviteMsg').filter({hasText:'unexpired invitation already exists'}).waitFor();
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:path.join(output,'portal-admin-'+width+'.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);evidence.responsive.push({screen:'portal-admin',width,overflow});assert(!overflow);}
  await page.goto('http://127.0.0.1:4404/client-search.html');await page.locator('#authLoader').waitFor({state:'hidden'});await page.locator('#searchInput').fill(id);await page.locator('#searchBtn').click();
  await page.locator('#resultsList').filter({hasText:'Synthetic Browser Contract'}).waitFor();evidence.flows.push('Actual authenticated global search');
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});await page.screenshot({path:path.join(output,'search-'+width+'.png'),fullPage:true});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);evidence.responsive.push({screen:'search',width,overflow});assert(!overflow);}
  assert.deepEqual(errors,[]);assert.equal(service.runtime.providerReceipts.length,0);evidence.status='PASS';
 }catch(e){evidence.error=e.message;throw e;}finally{
  fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(evidence,null,2));await browser.close();await new Promise(r=>server.close(r));await service.close();console.log(JSON.stringify(evidence));
 }
}
run().catch(e=>{console.error(e);process.exitCode=1;});

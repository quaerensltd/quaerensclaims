'use strict';
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
async function run(){
 Object.assign(process.env,{GCLOUD_PROJECT:'demo-quaerens-crm4',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'});
 const service=await require('../tools/serve-callables.cjs').start(),runtime=service.runtime,auth=require('firebase-admin/auth').getAuth(runtime.app),server=http.createServer(require('../tools/serve-local.cjs').handler);
 await new Promise(resolve=>server.listen(4404,'127.0.0.1',resolve));const browser=await require(process.env.CRM4_PLAYWRIGHT_MODULE).chromium.launch({channel:'msedge',headless:true}),id=require('crypto').randomUUID(),results=[];
 try{
  for(const number of [1,2]){
   const uid='browser-dual-'+number+'-'+id,email=uid+'@example.test',password='Synthetic-only-927!';await auth.createUser({uid,email,password});const membership={active:true,workspaceId:'CRM4',role:'lister',roles:['lister','closer'],displayName:'Synthetic dual staff '+number};await runtime.db.collection('crm4Memberships').doc(uid).set(membership);
   const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
   await page.goto('http://127.0.0.1:4404/crm4-login.html');await page.fill('#email',email);await page.fill('#password',password);await page.click('#submit');await page.waitForURL('**/staff-dashboard.html');await page.waitForSelector('[data-staff-capabilities]');
   for(const route of ['/staff-dashboard.html','/closer-dashboard.html']){
    await page.goto('http://127.0.0.1:4404'+route);await page.waitForSelector('[data-staff-capabilities]');assert.equal(new URL(page.url()).pathname,route);
    const actor=await page.evaluate(async()=>{const {auth}=await import('/crm4-platform.js');await auth.authStateReady();return auth.currentUser.uid});assert.equal(actor,uid);
    for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(100);const out=path.resolve(__dirname,'../.scratch/dual-staff');fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,number+'-'+route.slice(1)+'-'+width+'.png'),fullPage:true});}
   }
   assert.deepEqual((await runtime.db.collection('crm4Memberships').doc(uid).get()).data(),membership);assert.deepEqual(errors,[]);results.push({uid,loginCount:1,workspaces:2,viewportChecks:6,errors});await context.close();
  }
  console.log(JSON.stringify({status:'PASS',staff:results}));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));await service.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});

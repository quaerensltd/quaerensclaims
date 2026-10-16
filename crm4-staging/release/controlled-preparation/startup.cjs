'use strict';
// Local preparation only. This function is serialized into a reviewed Node -e
// deployment command; no application image or cloud resource is modified here.
async function startup(d, s) {
 const fail=()=>{throw Error('CRM4 sealed startup rejected');};
 const start=Date.parse(s.startUtc),end=Date.parse(s.endUtc);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end-start!==604800000||new Date(start).toISOString()!==s.startUtc||new Date(end).toISOString()!==s.endUtc)fail();
 if(d.env.CRM4_DEPLOYMENT_APPROVED!=='true'||d.env.GCLOUD_PROJECT!=='quaerens-crm4-spain-test'||d.now()>=end)fail();
 if(['GOOGLE_APPLICATION_CREDENTIALS','FIRESTORE_EMULATOR_HOST','FIREBASE_AUTH_EMULATOR_HOST','STORAGE_EMULATOR_HOST'].some(k=>d.env[k]))fail();
 const bytes=d.fs.readFileSync('/app/release/runtime-config.json');
 if(d.sha(bytes)!=='8ee3b8d34ea203461513584b2ac97083c890a754c1292a0d45df78de6e893eb4')fail();
 const config=JSON.parse(bytes);
 if(config.deploymentApproved!==false||config.projectId!=='quaerens-crm4-spain-test'||config.projectNumber!=='558324850479'||config.providers!=='capture-only'||JSON.stringify(config.testerEmails)!=='["brusseljeroen@gmail.com"]')fail();
 const approved={...config,deploymentApproved:true};
 const content=JSON.stringify(approved,null,2)+'\n';
 if(d.sha(content)!=='be32ef38127276c3ba875abb2a456acfa70816892df86c8eb768120c312610cc')fail();
 const file='/tmp/crm4-approved-runtime.json';
 d.fs.writeFileSync(file,content,{flag:'wx',mode:0o600});
 d.env.CRM4_CONFIG_FILE=file;
 const server=await d.loadServer().start();
 // The existing HTTP handler still performs all IAP/Firebase/framework checks.
 // Install the additional time gate before yielding back to request callbacks.
 const handlers=server.listeners('request');if(handlers.length!==1){server.closeAllConnections();server.close();fail();}
 server.removeAllListeners('request');
 server.on('request',(req,res)=>{
   const now=d.now();if(now<start||now>=end){res.writeHead(403,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end('{"error":"Synthetic test window closed"}');return;}
   handlers[0].call(server,req,res);
 });
 const stop=()=>{server.close();server.closeAllConnections();d.exit(0);};
 if(d.now()>=end){stop();return;}
 // Timer is independent of operator availability; every process restart also
 // refuses an expired window. Request gate uses UTC on every request.
 const timer=d.setTimeout(stop,end-d.now());timer.unref?.();
 return server;
}
function command(spec){return ['-e',`(${startup.toString()})({fs:require('node:fs'),sha:x=>require('node:crypto').createHash('sha256').update(x).digest('hex'),env:process.env,now:Date.now,loadServer:()=>require('/app/release/server.cjs'),setTimeout,exit:code=>process.exit(code)},${JSON.stringify(spec)}).catch(()=>{console.error('CRM4 sealed startup rejected');process.exit(1)})`];}
module.exports={startup,command};

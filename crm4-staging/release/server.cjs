'use strict';
async function start(){
 const fs=require('node:fs'),path=require('node:path');
 if(!process.env.CRM4_CONFIG_FILE)throw Error('CRM4 deployment configuration required');
 const config=JSON.parse(fs.readFileSync(process.env.CRM4_CONFIG_FILE,'utf8').replace(/^\uFEFF/,''));
 const runtime=await require('./cloud-runtime.cjs').createCloudRuntime(config);
 try{
 const webRoot=path.resolve(__dirname,'../cloud-public'),manifest=JSON.parse(fs.readFileSync(path.join(webRoot,'manifest.json')));
 if(manifest.origin!==config.origin||manifest.projectId!==config.projectId)throw Error('Cloud web/runtime configuration mismatch');
 const verifyIap=require('./iap.cjs').createIapVerifier(config,new (require('google-auth-library').OAuth2Client)());
 const server=require('node:http').createServer(require('./http.cjs').createCloudHandler({runtime,verifyIap,webRoot,manifest,csp:manifest.csp}));
 server.requestTimeout=120000;server.headersTimeout=10000;
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(Number(process.env.PORT||8080),'0.0.0.0',resolve);});
 for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(async()=>{await runtime.close();process.exit(0);}));
 return server;
 }catch(error){await runtime.close();throw error;}
}
module.exports={start};
if(require.main===module)start().catch(()=>{console.error('CRM4 cloud startup failed closed');process.exitCode=1;});

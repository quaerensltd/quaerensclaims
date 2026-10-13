'use strict';
// Offline artifact preparation only. No child processes, SDK clients or cloud writes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function prepareContainer({config,nodeImage,builderImage}) {
 require('./cloud-configuration.cjs').validateCloudRuntime(config);
 if(!/^node:22[\w.-]*@sha256:[a-f0-9]{64}$/.test(nodeImage||''))throw Error('Pinned official Node 22 image required');
 if(!/^gcr\.io\/cloud-builders\/docker@sha256:[a-f0-9]{64}$/.test(builderImage||''))throw Error('Pinned Cloud Build Docker builder required');
 const publicKeys=['apiKey','appId','authDomain','projectId','storageBucket','messagingSenderId'];
 if(!config.firebaseWeb?.apiKey||!config.firebaseWeb?.appId)throw Error('Firebase web app public configuration required');
 const runtime={...require('./infrastructure.proposed.json'),projectNumber:config.projectNumber,origin:config.origin,deploymentApproved:config.deploymentApproved===true,
 firebaseWeb:Object.fromEntries(publicKeys.filter(k=>config.firebaseWeb[k]!==undefined).map(k=>[k,config.firebaseWeb[k]]))};
 const report=require('./verify-source.cjs').verifySource();
 const digest=crypto.createHash('sha256').update(JSON.stringify({report,runtime,nodeImage,builderImage})).digest('hex');
 const parent=path.join(root,'.scratch','container-review');
 fs.mkdirSync(parent,{recursive:true});
 // Independent review runs must never overwrite a context another build is reading.
 const out=fs.mkdtempSync(path.join(parent,digest.slice(0,16)+'-'));
 for(const row of report.files){const target=path.join(out,row.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,row.path),target);}
 require('./build-web.cjs').buildWeb(runtime,path.join(out,'cloud-public'));
 fs.writeFileSync(path.join(out,'release','runtime-config.json'),JSON.stringify(runtime,null,2)+'\n');
 // Docker reads .dockerignore from the context root, not beside -f.
 fs.copyFileSync(path.join(__dirname,'.dockerignore'),path.join(out,'.dockerignore'));
 const image='europe-west1-docker.pkg.dev/'+runtime.projectId+'/crm4-release/crm4-spain:'+digest.slice(0,16);
 const build={steps:[{name:builderImage,args:['build','--build-arg','NODE_IMAGE='+nodeImage,'--file','release/Dockerfile','--tag',image,'.']}],images:[image],timeout:'900s',serviceAccount:'projects/'+runtime.projectId+'/serviceAccounts/crm4-build@'+runtime.projectId+'.iam.gserviceaccount.com',options:{logging:'CLOUD_LOGGING_ONLY',machineType:'E2_MEDIUM'}};
 fs.writeFileSync(path.join(out,'cloudbuild.json'),JSON.stringify(build,null,2)+'\n');
 const result={output:out,image,sourceDigest:digest,cloudWritesPerformed:false,buildExecuted:false,deploymentAuthorized:false};
 fs.writeFileSync(path.join(out,'preparation.json'),JSON.stringify(result,null,2)+'\n');
 return result;
}
module.exports={prepareContainer};
if(require.main===module){const [file,nodeImage,builderImage]=process.argv.slice(2);if(!file)throw Error('Usage: node prepare-container.cjs CONFIG NODE_IMAGE_DIGEST BUILDER_IMAGE_DIGEST');console.log(JSON.stringify(prepareContainer({config:JSON.parse(fs.readFileSync(file,'utf8')),nodeImage,builderImage})));}

'use strict';
// Offline proposal generator. Intentionally contains no network or command executor.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PROJECT='quaerens-crm4-spain-test',NUMBER='558324850479',REGION='europe-west1';
const SDK='serviceAccount:firebase-adminsdk-fbsvc@'+PROJECT+'.iam.gserviceaccount.com';
function proposeTokenCreatorRemoval(policy){
 if(!policy?.etag||!Array.isArray(policy.bindings))throw Error('Fresh versioned project IAM policy required');
 const matches=policy.bindings.filter(b=>b.role==='roles/iam.serviceAccountTokenCreator'&&b.members?.includes(SDK));
 if(matches.length!==1)throw Error('Expected exactly one SDK Token Creator binding; recheck drift');
 const copy=structuredClone(policy);let removed=0;
 copy.bindings=copy.bindings.filter(b=>{
  if(b.role!=='roles/iam.serviceAccountTokenCreator'||!b.members?.includes(SDK))return true;
  if(b.condition)throw Error('Conditional Token Creator binding requires a new review');
  b.members=b.members.filter(m=>m!==SDK);removed++;return b.members.length>0;
 });
 if(removed!==1)throw Error('Expected exactly one SDK Token Creator binding; recheck drift');
 return {policy:copy,removedMember:SDK,removedRole:'roles/iam.serviceAccountTokenCreator',applyApproved:false};
}
function createPlan(scope,observed){
 if(scope.projectId!==PROJECT||scope.projectNumber!==NUMBER||scope.region!==REGION||observed.projectId!==PROJECT||observed.projectNumber!==NUMBER)throw Error('Exact CRM4 project/number/EU region required');
 require('./tester-policy.cjs').assertTesterPolicy({testerEmails:scope.iap.testerEmails});
 const expectedBindings=[
 ['crm4-runtime@'+PROJECT+'.iam.gserviceaccount.com','roles/datastore.user','project'],
 ['crm4-runtime@'+PROJECT+'.iam.gserviceaccount.com','roles/firebaseauth.admin','project'],
 ['crm4-runtime@'+PROJECT+'.iam.gserviceaccount.com','roles/storage.objectUser','bucket'],
 ['crm4-build@'+PROJECT+'.iam.gserviceaccount.com','roles/artifactregistry.writer','repository/crm4-release'],
 ['crm4-build@'+PROJECT+'.iam.gserviceaccount.com','roles/logging.logWriter','project'],
 ['service-'+NUMBER+'@gcp-sa-iap.iam.gserviceaccount.com','roles/run.invoker','service/crm4-spain-test'],
 ['user:brusseljeroen@gmail.com','roles/iap.httpsResourceAccessor','iap-service/crm4-spain-test']
 ];
 const signatures=rows=>rows.map(r=>JSON.stringify(r)).sort();
 if(JSON.stringify(signatures(scope.iamBindings.map(b=>[b.principal,b.role,b.scope])))!==JSON.stringify(signatures(expectedBindings)))throw Error('Unreviewed IAM binding change');
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,file))).digest('hex');
 const request=(id,stage,method,url,body,dependsOn=[],extra={})=>({id,stage,approved:false,method,url,body,dependsOn,...extra});
 const base='projects/'+PROJECT,db=base+'/databases/(default)',region=base+'/locations/'+REGION;
 const bucket=PROJECT+'.firebasestorage.app';
 const missing=scope.apis.filter(api=>!observed.enabledApis.includes(api));
 const steps=[request('enable-apis','infrastructure','POST','https://serviceusage.googleapis.com/v1/projects/'+NUMBER+'/services:batchEnable',{serviceIds:missing},[],{before:'Re-read enabled APIs; skip already-enabled entries. Explicit API approval required.'}),
 {id:'inspect-existing',stage:'read-only',approved:false,dependsOn:['enable-apis'],checks:['Read SDK account metadata, user-managed keys, service-account policy and project IAM again','Read existing budget including project filters, amount, thresholds, channel names and etag; never create a second budget','GET database, default bucket, repository, service accounts and Run service; reuse only matching resources, stop on drift'],stopIf:'Unexpected existing resources, keys, workloads or policy changes'},
 {id:'remove-sdk-token-creator',stage:'iam',approved:false,dependsOn:['inspect-existing'],resource:base,proposal:proposeTokenCreatorRemoval(observed.projectIam),before:'Approve this one removal after account/key/dependency review; regenerate against freshly read policy and preserve etag, audit configs, other members and bindings; no automatic rollback grant'},
 request('firestore','infrastructure','POST','https://firestore.googleapis.com/v1/'+base+'/databases?databaseId=%28default%29',{locationId:REGION,type:'FIRESTORE_NATIVE',databaseEdition:'STANDARD',concurrencyMode:'PESSIMISTIC'},['inspect-existing']),
 request('firestore-backup','infrastructure','POST','https://firestore.googleapis.com/v1/'+db+'/backupSchedules',{retention:'604800s',dailyRecurrence:{}},['firestore']),
 request('firebase-default-bucket','infrastructure','POST','https://firebasestorage.googleapis.com/v1alpha/'+base+'/defaultBucket',{location:REGION},['inspect-existing']),
 request('harden-default-bucket','infrastructure','PATCH','https://storage.googleapis.com/storage/v1/b/'+bucket,{iamConfiguration:{uniformBucketLevelAccess:{enabled:true},publicAccessPrevention:'enforced'},softDeletePolicy:{retentionDurationSeconds:'604800'}},['firebase-default-bucket'],{before:'Read bucket metageneration; supply ifMetagenerationMatch and verify exact project/location before patch'}),
 {id:'rules-indexes',stage:'infrastructure',approved:false,dependsOn:['firestore','harden-default-bucket'],cwd:'crm4-staging',command:['firebase','deploy','--project',PROJECT,'--config','release/firebase.cloud.json','--only','firestore:rules,firestore:indexes,storage'],before:'Approve rules publication separately; no Hosting, Functions or application targets. Verify default-deny access before any user or web-app use.'},
 {id:'initialize-firebase-auth',stage:'infrastructure',approved:false,dependsOn:['rules-indexes'],console:'Firebase Authentication Get started on '+PROJECT,settings:{emailPassword:true,emailLink:false,phone:false,anonymous:false,socialProviders:[],usersCreated:0},before:'Initialize Firebase Auth only; do not silently upgrade to Identity Platform or create users'},
 request('auth-settings','infrastructure','PATCH','https://identitytoolkit.googleapis.com/admin/v2/'+base+'/config?updateMask=signIn.email,signIn.phoneNumber,signIn.anonymous,signIn.allowDuplicateEmails,client.permissions',{signIn:{email:{enabled:true,passwordRequired:true},phoneNumber:{enabled:false},anonymous:{enabled:false},allowDuplicateEmails:false},client:{permissions:{disabledUserSignup:true,disabledUserDeletion:true}}},['initialize-firebase-auth'],{before:'Read current config first. If client permission settings are unavailable on Firebase Auth, stop for review; do not upgrade product or relax signup restrictions automatically.'}),
 request('firebase-web-app','infrastructure','POST','https://firebase.googleapis.com/v1beta1/'+base+'/webApps',{displayName:'CRM4 Spain Private Synthetic Test'},['auth-settings']),
 request('artifact-repository','infrastructure','POST','https://artifactregistry.googleapis.com/v1/'+region+'/repositories?repositoryId=crm4-release',{format:'DOCKER',description:'CRM4 Spain private synthetic runtime images',dockerConfig:{immutableTags:true}},['inspect-existing']),
 request('build-source-bucket','infrastructure','POST','https://storage.googleapis.com/storage/v1/b?project='+PROJECT,{name:PROJECT+'-build-source',location:REGION,storageClass:'STANDARD',iamConfiguration:{uniformBucketLevelAccess:{enabled:true},publicAccessPrevention:'enforced'},softDeletePolicy:{retentionDurationSeconds:'604800'}},['inspect-existing'])];
 for(const name of ['crm4-runtime','crm4-build'])steps.push(request(name,'iam','POST','https://iam.googleapis.com/v1/'+base+'/serviceAccounts',{accountId:name,serviceAccount:{displayName:name+' Spain synthetic test'}},['remove-sdk-token-creator']));
 steps.push(request('iap-agent','iam','POST','https://serviceusage.googleapis.com/v1beta1/projects/'+NUMBER+'/services/iap.googleapis.com:generateServiceIdentity',{},['enable-apis']));
 const bindings=scope.iamBindings.map(b=>({...b,principal:b.principal.includes(':')?b.principal:'serviceAccount:'+b.principal}));
 bindings.push({principal:'serviceAccount:crm4-build@'+PROJECT+'.iam.gserviceaccount.com',role:'roles/storage.objectViewer',scope:'bucket/'+PROJECT+'-build-source'});
 for(const b of bindings){b.resource=b.scope==='project'?base:b.scope==='bucket'?'//storage.googleapis.com/'+bucket:b.scope.startsWith('bucket/')?'//storage.googleapis.com/'+b.scope.slice(7):b.scope==='repository/crm4-release'?region+'/repositories/crm4-release':b.scope==='service/crm4-spain-test'?region+'/services/crm4-spain-test':'IAP Cloud Run service '+region+'/services/crm4-spain-test';}
 steps.push({id:'resource-iam-bindings',stage:'iam',approved:false,dependsOn:['crm4-runtime','crm4-build','artifact-repository','build-source-bucket','harden-default-bucket'],bindings:bindings.filter(b=>!b.scope.includes('service/')),before:'Read-modify-write each resource IAM policy with its own current etag; preserve existing agents and unrelated bindings. No owner/editor, tokenCreator, service-account keys or cross-project grants. Verify provisioner actAs; do not add grants already supplied by Owner.'});
 steps.push({id:'budget-notification',stage:'infrastructure',approved:false,dependsOn:['inspect-existing'],channelBody:require('./budget-email-channel.request.proposed.json'),channelEndpoint:'https://monitoring.googleapis.com/v3/'+base+'/notificationChannels',budgetDesired:require('./budget.request.proposed.json'),before:'Read existing budget and linked channels; reuse a matching company-email channel; after approval update existing budget by name with etag. Stop if scope differs from CRM4-only. No duplicate budget.'});
 steps.push({id:'oauth',stage:'iam',approved:false,dependsOn:['iap-agent'],settings:scope.iap,before:'External OAuth setup in Console; support email must be eligible. Keep OAuth secrets out of repository/image. No alternative contact or account creation without approval.'});
 steps.push({id:'container-build',stage:'build',approved:false,dependsOn:['resource-iam-bindings','firebase-web-app'],region:REGION,sourceBucket:scope.build.sourceBucket,prepareTool:'prepare-container.cjs',nodeImage:scope.build.nodeImageDigest,builderImage:scope.build.builderImageDigest,before:'Separate build submission approval required. Review actual public Firebase config and expected Run origin; produce content-addressed context, upload only its allowlist; regional build runs as crm4-build; no deploy step. Scan result and record immutable application digest.'});
 steps.push(request('private-run-service','deployment','POST','https://run.googleapis.com/v2/'+region+'/services?serviceId=crm4-spain-test',{ingress:'INGRESS_TRAFFIC_ALL',iapEnabled:true,invokerIamDisabled:false,template:{serviceAccount:'crm4-runtime@'+PROJECT+'.iam.gserviceaccount.com',scaling:{minInstanceCount:0,maxInstanceCount:2},maxInstanceRequestConcurrency:8,timeout:'120s',containers:[{image:'europe-west1-docker.pkg.dev/'+PROJECT+'/crm4-release/crm4-spain@sha256:<approved-image-digest>',ports:[{containerPort:8080}],resources:{limits:{cpu:'1',memory:'1Gi'},cpuIdle:true},env:Object.entries(scope.runtime.environmentOnApprovedDeployment).map(([name,value])=>({name,value}))}]}},['container-build','oauth'],{before:'Separate exact-image deployment approval required; replace digest placeholder, verify runtime approval config and origin. Never create a placeholder service under infrastructure-only approval.'}));
 steps.push({id:'private-service-access',stage:'deployment',approved:false,dependsOn:['private-run-service'],bindings:bindings.filter(b=>b.scope.includes('service/')),before:'Service-specific IAM/IAP access only. Verify no inherited accessor policy broadens the sole tester and no public invoker exists.'});
 return {schemaVersion:1,projectId:PROJECT,projectNumber:NUMBER,region:REGION,executable:false,approved:false,sourceHashes:Object.fromEntries(['firestore.rules','storage.rules','firestore.indexes.json','package-lock.json','Dockerfile'].map(f=>[f,hash(f)])),steps,unresolved:['SDK account/key/dependency inspection after IAM API approval','Existing budget settings after Budget API approval','OAuth support email eligibility','Auth initialization and client-permission support','Actual Firebase web config, service origin, image digest and live cloud acceptance'],noProjectCreation:true,noBillingAttachment:true};
}
module.exports={createPlan,proposeTokenCreatorRemoval};
if(require.main===module){const plan=createPlan(require('./infrastructure-scope.json'),require('./bootstrap-preflight.json'));fs.writeFileSync(path.join(__dirname,'bootstrap-plan.json'),JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({steps:plan.steps.length,executable:false,approved:false}));}

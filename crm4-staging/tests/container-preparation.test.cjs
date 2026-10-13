'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {prepareContainer}=require('../release/prepare-container.cjs');
const proposal=require('../release/infrastructure.proposed.json');
const config={...proposal,projectNumber:'123456789012',origin:'https://crm4-spain-test-synthetic.europe-west1.run.app',firebaseWeb:{projectId:proposal.projectId,authDomain:proposal.authDomain,storageBucket:proposal.bucket,apiKey:'synthetic-key',appId:'synthetic-app',secret:'DO-NOT-COPY'},unexpectedSecret:'DO-NOT-COPY'};
const nodeImage='node:22-bookworm-slim@sha256:'+'a'.repeat(64),builderImage='gcr.io/cloud-builders/docker@sha256:'+'b'.repeat(64);
test('container preparation rejects unpinned images and cross-project configuration',()=>{
 for(const change of [{nodeImage:'node:22'},{builderImage:'gcr.io/cloud-builders/docker:latest'},{config:{...config,projectId:'quaerensclaims'}},{config:{...config,testerEmails:['other@example.test']}}])assert.throws(()=>prepareContainer({config,nodeImage,builderImage,...change}));
});
test('offline context connects browser, runtime and immutable build inputs without secrets or deployment',()=>{
 const result=prepareContainer({config,nodeImage,builderImage});
 assert.equal(result.buildExecuted,false);assert.equal(result.deploymentAuthorized,false);
 const read=name=>fs.readFileSync(path.join(result.output,name),'utf8');
 const runtime=JSON.parse(read('release/runtime-config.json'));
 assert.equal(runtime.deploymentApproved,false);assert(!read('release/runtime-config.json').includes('DO-NOT-COPY'));
 assert.equal(JSON.parse(read('cloud-public/manifest.json')).origin,config.origin);
 const build=JSON.parse(read('cloudbuild.json'));assert.equal(build.steps.length,1);assert.equal(build.steps[0].name,builderImage);assert(build.steps[0].args.includes('NODE_IMAGE='+nodeImage));assert.equal(build.options.logging,'CLOUD_LOGGING_ONLY');
 assert(read('.dockerignore').includes('**/node_modules'));assert(read('release/Dockerfile').includes('USER node'));
});

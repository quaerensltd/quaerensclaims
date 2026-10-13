'use strict';
const {validateConfiguration}=require('./configuration.cjs');
function validateCloudRuntime(config) {
 validateConfiguration(config);
 if(config.projectId!=='quaerens-crm4-spain-test')throw Error('Exact approved Spain test project required');
 if(!/^\d{6,}$/.test(config.projectNumber||''))throw Error('Confirmed project number required');
 if(!/^https:\/\/crm4-spain-test-[a-z0-9-]+(?:\.(?:a|europe-west1))?\.run\.app$/.test(config.origin||''))throw Error('Assigned private Cloud Run origin required');
 const testerEmails=require('./tester-policy.cjs').assertTesterPolicy(config);
 return Object.freeze({...config,testerEmails});
}
module.exports={validateCloudRuntime};

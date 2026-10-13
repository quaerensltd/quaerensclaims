'use strict';
const {validateConfiguration}=require('./configuration.cjs');
function validateCloudRuntime(config) {
 validateConfiguration(config);
 if(config.projectId!=='quaerens-crm4-spain-test')throw Error('Exact approved Spain test project required');
 if(!/^\d{6,}$/.test(config.projectNumber||''))throw Error('Confirmed project number required');
 if(!/^https:\/\/crm4-spain-test-[a-z0-9-]+(?:\.(?:a|europe-west1))?\.run\.app$/.test(config.origin||''))throw Error('Assigned private Cloud Run origin required');
 if(!Array.isArray(config.testerEmails)||!config.testerEmails.length||config.testerEmails.some(v=>typeof v!=='string'||!/^\S+@\S+\.\S+$/.test(v)||v!==v.toLowerCase()))throw Error('Confirmed named IAP testers required');
 return Object.freeze({...config});
}
module.exports={validateCloudRuntime};

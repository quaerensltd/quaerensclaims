'use strict';
// Proposed owner-only access policy. This does not grant IAM or Firebase membership.
const ownerTester='brusseljeroen@gmail.com';
function assertTesterPolicy(config){
 if(!Array.isArray(config.testerEmails)||config.testerEmails.length!==1||config.testerEmails[0]!==ownerTester)throw Error('Only the confirmed owner IAP tester is authorized');
 return Object.freeze([ownerTester]);
}
module.exports={assertTesterPolicy};

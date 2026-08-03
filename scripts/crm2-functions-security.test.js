const assert = require("node:assert/strict");
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_local_test_placeholder";
const { crm2AdminCreateUser, crm2AdminUpdateMembership } = require("../functions/index.js");

async function rejectsCode(action, code) {
  await assert.rejects(action, error => error && error.code === code);
}

(async () => {
  await rejectsCode(() => crm2AdminCreateUser.run({ auth:null, data:{} }), "permission-denied");
  await rejectsCode(() => crm2AdminCreateUser.run({ auth:{ uid:"ordinary", token:{} }, data:{} }), "permission-denied");
  await rejectsCode(() => crm2AdminCreateUser.run({ auth:{ uid:"admin", token:{platformAdmin:true} }, data:{email:"valid@example.test",displayName:"Test",role:"owner"} }), "invalid-argument");
  await rejectsCode(() => crm2AdminCreateUser.run({ auth:{ uid:"admin", token:{platformAdmin:true} }, data:{email:"",displayName:"Test",role:"lister"} }), "invalid-argument");
  await rejectsCode(() => crm2AdminUpdateMembership.run({ auth:{ uid:"ordinary", token:{} }, data:{uid:"target",role:"manager",active:true} }), "permission-denied");
  await rejectsCode(() => crm2AdminUpdateMembership.run({ auth:{ uid:"admin", token:{platformAdmin:true} }, data:{uid:"target",role:"owner",active:true} }), "invalid-argument");
  console.log("CRM2 Cloud Function security tests passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require("node:assert/strict");

process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_local_test_placeholder";

const {
  gatewayAdminListPreparedCases,
  gatewayAdminUpdatePreparedCase
} = require("../functions/index.js");

async function rejectsCode(action, code) {
  await assert.rejects(action, error => error && error.code === code);
}

(async () => {
  await rejectsCode(() => gatewayAdminListPreparedCases.run({ auth: null, data: {} }), "permission-denied");
  await rejectsCode(() => gatewayAdminListPreparedCases.run({ auth: { uid: "manager", token: {} }, data: {} }), "permission-denied");
  await rejectsCode(() => gatewayAdminUpdatePreparedCase.run({ auth: null, data: {} }), "permission-denied");
  await rejectsCode(() => gatewayAdminUpdatePreparedCase.run({ auth: { uid: "manager", token: {} }, data: {} }), "permission-denied");
  await rejectsCode(() => gatewayAdminUpdatePreparedCase.run({ auth: { uid: "administrator", token: { platformAdmin: true } }, data: {} }), "invalid-argument");

  console.log("Intake Gateway Cloud Function authorization tests passed.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

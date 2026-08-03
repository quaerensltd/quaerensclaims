const admin = require("firebase-admin");
const fs = require("node:fs");
const path = require("node:path");

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/bootstrap-crm2-admin.js authorised-admin@example.com");
  process.exit(1);
}

async function firebaseCliToken() {
  const firebaseAuth = require("firebase-tools/lib/auth");
  const account = firebaseAuth.getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error("No trusted Firebase CLI credential source is available.");
  const token = await firebaseAuth.getAccessToken(account.tokens.refresh_token, [
    "openid",
    "email",
    "https://www.googleapis.com/auth/firebase",
    "https://www.googleapis.com/auth/cloud-platform"
  ]);
  if (!token?.access_token) throw new Error("The trusted Firebase CLI session did not provide an access token.");
  return token;
}

function trustedCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return admin.credential.applicationDefault();
  return { getAccessToken:firebaseCliToken };
}

async function writeMembership(user) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    await admin.firestore().collection("crm2Memberships").doc(user.uid).set(user.membership, { merge:true });
    return;
  }
  const token = await firebaseCliToken();
  const timestamp = new Date().toISOString();
  const fields = {
    uid:{stringValue:user.uid}, email:{stringValue:user.membership.email}, displayName:{stringValue:user.membership.displayName},
    role:{stringValue:"administrator"}, workspaceId:{stringValue:"CRM2"}, workspaceAccess:{arrayValue:{values:[{stringValue:"CRM2"}]}},
    active:{booleanValue:true}, createdAt:{timestampValue:timestamp}, createdBy:{stringValue:"secure-bootstrap"}, updatedAt:{timestampValue:timestamp}
  };
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/quaerensclaims/databases/(default)/documents/crm2Memberships/${encodeURIComponent(user.uid)}`, {
    method:"PATCH", headers:{Authorization:`Bearer ${token.access_token}`,"Content-Type":"application/json"}, body:JSON.stringify({fields})
  });
  if (!response.ok) throw new Error("The trusted Firestore membership write failed.");
}

function webApiKey() {
  const source = fs.readFileSync(path.resolve(__dirname, "../../public/crm2-platform.js"), "utf8");
  const match = source.match(/apiKey:\s*"([^"]+)"/);
  if (!match) throw new Error("Firebase web configuration is unavailable.");
  return match[1];
}

async function sendResetEmail(address) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(webApiKey())}`, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ requestType:"PASSWORD_RESET", email:address })
  });
  if (!response.ok) throw new Error("Firebase could not send the password-reset email.");
}

admin.initializeApp({ credential:trustedCredential(), projectId:"quaerensclaims" });

(async () => {
  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    user = await admin.auth().createUser({ email, displayName:"CRM2 Administrator", emailVerified:false });
  }
  await admin.auth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), platformAdmin: true });
  await writeMembership({ uid:user.uid, membership:{
    email: user.email || email,
    displayName: user.displayName || "Platform Administrator",
    role: "administrator",
    workspaceId: "CRM2",
    workspaceAccess: ["CRM2"],
    active: true,
    createdAt: new Date(),
    createdBy: "secure-bootstrap",
    updatedAt: new Date()
  }});
  await sendResetEmail(email);
  console.log("CRM2 platform administrator enabled. Firebase password-reset email sent; re-authentication is required.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

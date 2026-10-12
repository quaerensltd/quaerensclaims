const { renderCrm2CorporateEmail, renderCrm3CorporateEmail } = require("./crm4CorporateEmail");
const CRM4_ROLES = new Set(["lister", "manager", "closer", "processing", "administrator"]);
async function sendCrm2StaffSetupEmail({ actorUid, user, displayName, role, action }) {
  const firstName = String(displayName || "Colleague").trim().split(/\s+/)[0] || "Colleague";
  const setupLink = await admin.auth().generatePasswordResetLink(user.email);
  const body = `Dear ${firstName},\n\nA Quaerens CRM account has been created for you.\n\nUsername: ${user.email}\nRole: ${role}\n\nPlease use the secure link below to set your personal password.\n\n${setupLink}\n\nThis link is personal and must not be shared with anyone. If the link has expired, please contact your Manager/Administrator so that a new setup link can be sent.\n\nOnce your password has been set, you can sign in through the secure Quaerens CRM login.\n\nKind regards,\nQuaerens Administration`;
  const content = renderCrm2CorporateEmail(body);
  let providerMessageId = "mock-crm4-staff-setup";
  if (process.env.FUNCTIONS_EMULATOR !== "true") {
    const result = await resend.emails.send({ from: "Quaerens <noreply@quaerens.co.uk>", to: user.email, subject: "Your Quaerens CRM account", text: content.text, html: content.html, tags: [{ name: "type", value: "crm4-staff-password-setup" }] });
    if (result?.error) throw new HttpsError("internal", result.error.message || "Password setup email could not be sent.");
    providerMessageId = result?.data?.id || result?.id || "";
  }
  await db.collection("crm4MembershipAudit").add({ action, actorUid, targetUid: user.uid, role, outcome: "sent", providerMessageId, passwordStored: false, setupLinkStored: false, createdAt: FieldValue.serverTimestamp() });
  return { externalCommunications: process.env.FUNCTIONS_EMULATOR === "true" ? 0 : 1 };
}
const { applyWorkspaceAccessState } = require("./workspaceIdentityAccess");
exports.crm4AdminCreateUser = onCall({ secrets: [resendApiKeySecret] }, async request => {
  if (!request.auth || request.auth.token.platformAdmin !== true) {
    throw new HttpsError("permission-denied", "Platform administrator access is required.");
  }

  const data = request.data || {};
  const email = String(data.email || "").trim().toLowerCase();
  const displayName = String(data.displayName || "").trim();
  const role = String(data.role || "").trim().toLowerCase();
  const active = data.active === undefined ? true : data.active;

  if (!email || !email.includes("@")) throw new HttpsError("invalid-argument", "A valid email is required.");
  if (!displayName) throw new HttpsError("invalid-argument", "A display name is required.");
  if (!CRM4_ROLES.has(role)) throw new HttpsError("invalid-argument", "Select a valid CRM4 role.");
  if (typeof active !== "boolean") throw new HttpsError("invalid-argument", "Active access must be true or false.");
  if (data.workspaceId !== undefined && data.workspaceId !== "CRM4") throw new HttpsError("invalid-argument", "Only the CRM4 workspace may be assigned.");

  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    user = await admin.auth().createUser({ email, displayName, emailVerified: false });
  }

  await db.collection("crm4Memberships").doc(user.uid).set({
    uid: user.uid,
    email,
    displayName,
    role,
    workspaceId: "CRM4",
    workspaceAccess: ["CRM4"],
    active,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: request.auth.uid,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  await applyWorkspaceAccessState({ db, auth: admin.auth(), uid: user.uid, workspaceId: "CRM4", active });

  const delivery = await sendCrm2StaffSetupEmail({ actorUid: request.auth.uid, user, displayName, role, action: "CRM4_STAFF_SETUP_EMAIL_SENT" });
  return { uid: user.uid, email, role, workspaceId: "CRM4", setupEmailSent: true, passwordStored: false, linkReturned: false, externalCommunications: delivery.externalCommunications };
});
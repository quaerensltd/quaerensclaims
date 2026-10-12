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
exports.crm4AdminSendPasswordSetupEmail = onCall({ secrets: [resendApiKeySecret] }, async request => {
  if (!request.auth || request.auth.token.platformAdmin !== true) throw new HttpsError("permission-denied", "Platform administrator access is required.");
  const uid = String(request.data?.uid || "").trim(), membership = await db.collection("crm4Memberships").doc(uid).get();
  if (!uid || !membership.exists || membership.data()?.workspaceId !== "CRM4" || !CRM4_ROLES.has(membership.data()?.role)) throw new HttpsError("permission-denied", "A governed CRM4 member is required.");
  const user = await admin.auth().getUser(uid), delivery = await sendCrm2StaffSetupEmail({ actorUid: request.auth.uid, user, displayName: membership.data()?.displayName, role: membership.data()?.role, action: "CRM4_PASSWORD_SETUP_EMAIL_SENT" });
  return { uid, email: user.email, setupEmailSent: true, passwordStored: false, linkReturned: false, externalCommunications: delivery.externalCommunications };
});
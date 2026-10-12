const CRM4_ROLES = new Set(["lister", "manager", "closer", "processing", "administrator"]);
const { applyWorkspaceAccessState } = require("./workspaceIdentityAccess");
exports.crm4AdminUpdateMembership = onCall(async request => {
  if (!request.auth || request.auth.token.platformAdmin !== true) {
    throw new HttpsError("permission-denied", "Platform administrator access is required.");
  }
  const data = request.data || {};
  const uid = String(data.uid || "").trim();
  const role = String(data.role || "").trim().toLowerCase();
  if (!uid || !CRM4_ROLES.has(role) || typeof data.active !== "boolean") {
    throw new HttpsError("invalid-argument", "A user, role and active state are required.");
  }
  if (data.workspaceId !== undefined && data.workspaceId !== "CRM4") {
    throw new HttpsError("invalid-argument", "Only the CRM4 workspace may be assigned.");
  }
  if (request.auth.uid === uid) {
    throw new HttpsError("failed-precondition", "Administrators cannot change their own CRM4 role or active access.");
  }
  const current = await db.collection("crm4Memberships").doc(uid).get();
  if (!current.exists || current.data()?.workspaceId !== "CRM4") {
    throw new HttpsError("permission-denied", "A governed CRM4 member is required.");
  }
  const batch = db.batch();
  batch.set(db.collection("crm4Memberships").doc(uid), {
    role,
    active: data.active,
    workspaceId: "CRM4",
    workspaceAccess: ["CRM4"],
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: request.auth.uid
  }, { merge: true });
  const auditRef = db.collection("crm4MembershipAudit").doc();
  batch.create(auditRef, {
    action: data.active ? "CRM4_STAFF_REACTIVATED" : "CRM4_STAFF_BLOCKED",
    actorUid: request.auth.uid,
    targetUid: uid,
    role,
    before: { active: current.data()?.active === true },
    after: { active: data.active, firebaseAuthDisabled: null, remainingActiveWorkspaces: [] },
    createdAt: FieldValue.serverTimestamp()
  });
  await batch.commit();
  const authState = await applyWorkspaceAccessState({ db, auth: admin.auth(), uid, workspaceId: "CRM4", active: data.active });
  await auditRef.update({ "after.firebaseAuthDisabled": authState.firebaseAuthDisabled, "after.remainingActiveWorkspaces": authState.remainingActiveWorkspaces });
  return { uid, role, active: data.active, workspaceId: "CRM4", ...authState };
});
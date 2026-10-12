function requirePlatformAdmin(request) {
  if (!request.auth || request.auth.token.platformAdmin !== true) {
    throw new HttpsError("permission-denied", "Authorised internal access is required.");
  }
}
exports.crm4AdminProvisionExistingProcessing = onCall(async request => {
  requirePlatformAdmin(request);
  const legacy = await db.collection("users").where("role", "==", "processing").get();
  let provisioned = 0;
  let alreadyProvisioned = 0;
  let skipped = 0;
  for (const document of legacy.docs) {
    const source = document.data() || {};
    const existing = await db.collection("crm4Memberships").doc(document.id).get();
    if (existing.exists && existing.data().role !== "processing") { skipped += 1; continue; }
    try {
      await admin.auth().getUser(document.id);
    } catch (error) {
      if (error.code === "auth/user-not-found") { skipped += 1; continue; }
      throw error;
    }
    if (existing.exists && existing.data().active === true && existing.data().workspaceId === "CRM4") {
      alreadyProvisioned += 1;
      continue;
    }
    const batch = db.batch();
    batch.set(db.collection("crm4Memberships").doc(document.id), {
      uid: document.id,
      email: String(source.email || "").trim().toLowerCase(),
      displayName: String(source.name || source.displayName || "Processing team member").trim(),
      role: "processing",
      active: true,
      workspaceId: "CRM4",
      workspaceAccess: ["CRM4"],
      provisionedFrom: "existing-authorised-processing-role",
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid
    }, { merge: true });
    batch.create(db.collection("crm4MembershipAudit").doc(), {
      action: "PROCESSING_MEMBERSHIP_PROVISIONED",
      targetUid: document.id,
      actorUid: request.auth.uid,
      sourceRole: "processing",
      grantedRole: "processing",
      workspaceId: "CRM4",
      createdAt: FieldValue.serverTimestamp()
    });
    await batch.commit();
    provisioned += 1;
  }
  return { eligible: legacy.size, provisioned, alreadyProvisioned, skipped };
});
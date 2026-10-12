"use strict";

const MAX_ASSIGNMENTS = 50;
function failure(code) { throw Object.assign(new Error(code === "invalid-argument" ? "Invalid assignment request." : "Assignment access denied."), { code }); }
function identifiers(data) {
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length !== 1 || !Array.isArray(data.assignmentIds)
    || data.assignmentIds.length > MAX_ASSIGNMENTS || data.assignmentIds.some(id => typeof id !== "string" || !/^[A-Za-z0-9_-]{1,180}$/.test(id))) failure("invalid-argument");
  return [...new Set(data.assignmentIds)];
}
function createProcessingLinks({ db }) {
  return async function getLinks(uid, data) {
    if (typeof uid !== "string" || !uid) failure("unauthenticated");
    const ids = identifiers(data);
    // One snapshot binds status to the authoritative assignment relationship.
    // The read-only transaction cannot create audit records or mutate CRM state.
    return db.runTransaction(async tx => {
      const [profile, crm4, crm3] = await Promise.all([
        tx.get(db.collection("users").doc(uid)),
        tx.get(db.collection("crm4Memberships").doc(uid)),
        tx.get(db.collection("crm3Memberships").doc(uid))
      ]);
      const user = profile.data() || {};
      const role = user.admin === true ? "admin" : user.role;
      if (!profile.exists || crm4.exists || crm3.exists || user.active === false || user.disabled === true || !["closer", "manager", "admin"].includes(role)) failure("permission-denied");
      const assignments = await Promise.all(ids.map(id => tx.get(db.collection("closerAssignments").doc(id))));
      if (assignments.some(s => !s.exists || s.data().closer?.uid !== uid || ![undefined, "CRM"].includes(s.data().workspaceId))) failure("permission-denied");
      const linkedAssignmentIds = [];
      // Bounded sequential pairs avoid unbounded read fan-out. Empty select()
      // requests document identity only; no client/report/payment fields needed.
      for (const id of ids) {
        const matches = await Promise.all(["assignmentId", "sourceAssignmentId"].map(field =>
          tx.get(db.collection("processingFiles").where(field, "==", id).select().limit(1))));
        if (matches.some(s => !s.empty)) linkedAssignmentIds.push(id);
      }
      return { linkedAssignmentIds };
    }, { readOnly: true });
  };
}
function registerLegacyCloserProcessingLinks({ db, admin, onCall, HttpsError }) {
  const getLinks = createProcessingLinks({ db });
  return { legacyCloserGetProcessingLinks: onCall(async request => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to continue.");
    try {
      const header = request.rawRequest.get("authorization") || "";
      if (!header.startsWith("Bearer ")) failure("unauthenticated");
      const verified = await admin.auth().verifyIdToken(header.slice(7), true);
      if (verified.uid !== request.auth.uid) failure("permission-denied");
      return await getLinks(verified.uid, request.data);
    } catch (error) {
      const code = ["invalid-argument", "permission-denied", "unauthenticated"].includes(error.code) ? error.code : "permission-denied";
      throw new HttpsError(code, code === "invalid-argument" ? "Invalid assignment request." : "Processing linkage unavailable for this account.");
    }
  }) };
}
module.exports = { MAX_ASSIGNMENTS, identifiers, createProcessingLinks, registerLegacyCloserProcessingLinks };

"use strict";

async function activeWorkspaceAuthority({ db, auth, uid, excludingWorkspace }) {
  const [user, crm4, crm3, legacy] = await Promise.all([
    auth.getUser(uid),
    db.collection("crm4Memberships").doc(uid).get(),
    db.collection("crm3Memberships").doc(uid).get(),
    db.collection("users").doc(uid).get()
  ]);
  const claims = user.customClaims || {};
  const active = [];
  if (excludingWorkspace !== "CRM4" && crm4.exists && crm4.data()?.active === true) active.push("CRM4");
  if (excludingWorkspace !== "CRM3" && crm3.exists && crm3.data()?.active === true) active.push("CRM3");
  if (excludingWorkspace !== "CRM1" && legacy.exists) {
    const data = legacy.data() || {};
    if (data.active !== false && data.disabled !== true && String(data.role || "").trim()) active.push("CRM1");
  }
  if (claims.platformAdmin === true || claims.crossCrmAuthority === true) active.push("PLATFORM");
  return { user, active, mayDisableFirebaseAuth: active.length === 0 };
}

async function applyWorkspaceAccessState({ db, auth, uid, workspaceId, active }) {
  if (active === true) {
    const user = await auth.updateUser(uid, { disabled: false });
    return { firebaseAuthDisabled: user.disabled === true, remainingActiveWorkspaces: [] };
  }
  const authority = await activeWorkspaceAuthority({ db, auth, uid, excludingWorkspace: workspaceId });
  if (!authority.mayDisableFirebaseAuth) {
    return { firebaseAuthDisabled: authority.user.disabled === true, remainingActiveWorkspaces: authority.active };
  }
  const user = await auth.updateUser(uid, { disabled: true });
  return { firebaseAuthDisabled: user.disabled === true, remainingActiveWorkspaces: [] };
}

module.exports = { activeWorkspaceAuthority, applyWorkspaceAccessState };

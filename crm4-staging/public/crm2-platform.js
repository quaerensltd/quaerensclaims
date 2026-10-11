import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const firebaseConfig = { apiKey:"AIzaSyCOo_Sa242sUuGyZD8jO8kk12V1aBX7wMA", authDomain:"quaerensclaims.firebaseapp.com", projectId:"quaerensclaims" };
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export const roleRoutes = Object.freeze({
  lister: "/staff-dashboard.html",
  manager: "/manager-dashboard.html",
  closer: "/closer-dashboard.html",
  administrator: "/manager-dashboard.html"
});

export function loginRoute() {
  const next = location.pathname + location.search;
  return "/crm2-login.html?next=" + encodeURIComponent(next);
}

export function waitForUser() {
  return new Promise(resolve => {
    const stop = onAuthStateChanged(auth, user => { stop(); resolve(user); });
  });
}

export async function requireCrm2(allowedRoles) {
  const user = await waitForUser();
  if (!user) { location.replace(loginRoute()); throw new Error("Authentication required"); }
  const snapshot = await getDoc(doc(db, "crm2Memberships", user.uid));
  const membership = snapshot.exists() ? snapshot.data() : null;
  if (!membership || membership.active !== true || membership.workspaceId !== "CRM2") {
    await signOut(auth);
    location.replace("/crm2-login.html?error=workspace-access");
    throw new Error("CRM2 membership required");
  }
  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    location.replace(roleRoutes[membership.role] || "/crm2-login.html?error=role");
    throw new Error("CRM2 role not allowed");
  }
  document.documentElement.dataset.crm2Ready = "true";
  return { user, membership };
}

export async function logoutCrm2() {
  await signOut(auth);
  location.replace("/crm2-login.html");
}

export function bindLogout() {
  document.querySelectorAll("[data-crm2-logout]").forEach(button => button.addEventListener("click", logoutCrm2));
}

export function appendAudit(existing, action, actor, details) {
  const history = Array.isArray(existing) ? existing : [];
  return [...history, { action, actor, details: details || "", at: new Date().toISOString() }].slice(-100);
}

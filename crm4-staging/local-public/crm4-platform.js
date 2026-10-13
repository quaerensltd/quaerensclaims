import {resolveActor} from "/crm4-staff-capabilities.js";
import { initializeApp, getApps } from "/__crm4/sdk/10.8.0/app.js";
import { getAuth, onAuthStateChanged, signOut } from "/__crm4/sdk/10.8.0/auth.js";
import { getFirestore, doc, getDoc } from "/__crm4/sdk/10.8.0/firestore.js";
import { getFunctions } from "/__crm4/sdk/10.8.0/functions.js";

const firebaseConfig = { apiKey:"crm4-local-only", authDomain:"crm4-local-only", projectId:"demo-quaerens-crm4" };
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export const roleRoutes = Object.freeze({
  lister: "/staff-dashboard.html",
  manager: "/manager-dashboard.html",
  closer: "/closer-dashboard.html",
  administrator: "/manager-dashboard.html",
  processing: "/processing-dashboard.html"
});

export function loginRoute() {
  const next = location.pathname + location.search;
  return "/crm4-login.html?next=" + encodeURIComponent(next);
}

export function waitForUser() {
  return new Promise(resolve => {
    const stop = onAuthStateChanged(auth, user => { stop(); resolve(user); });
  });
}

export async function requireCrm2(allowedRoles) {
  const user = await waitForUser();
  if (!user) { location.replace(loginRoute()); throw new Error("Authentication required"); }
  const snapshot = await getDoc(doc(db, "crm4Memberships", user.uid));
  const membership = snapshot.exists() ? snapshot.data() : null;
  if (!membership || membership.active !== true || membership.workspaceId !== "CRM4") {
    await signOut(auth);
    location.replace("/crm4-login.html?error=workspace-access");
    throw new Error("CRM4 membership required");
  }
  if (allowedRoles && !allowedRoles.some(role=>resolveActor(user.uid,membership).roles.includes(role))) {
    location.replace(roleRoutes[membership.role] || "/crm4-login.html?error=role");
    throw new Error("CRM4 role not allowed");
  }
  document.documentElement.dataset.crm4Ready = "true";
  return { user, membership };
}

export async function logoutCrm2() {
  await signOut(auth);
  location.replace("/crm4-login.html");
}

export function bindLogout() {
  document.querySelectorAll("[data-crm4-logout]").forEach(button => button.addEventListener("click", logoutCrm2));
}

export function appendAudit(existing, action, actor, details) {
  const history = Array.isArray(existing) ? existing : [];
  return [...history, { action, actor, details: details || "", at: new Date().toISOString() }].slice(-100);
}

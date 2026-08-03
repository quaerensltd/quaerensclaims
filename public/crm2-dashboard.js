import { requireCrm2, bindLogout } from "/crm2-platform.js";
import { collection, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "/crm2-platform.js";

const expectedRole = document.body.dataset.crm2Role;
const labels = { lister:"Lister", manager:"Manager", closer:"Closer", administrator:"Administrator" };
const emptyCopy = {
  lister:"No CRM2 leads are waiting. Create a manual lead to begin.",
  manager:"No CRM2 cases are awaiting manager review.",
  closer:"No CRM2 appointments or approved opportunities are currently assigned.",
  administrator:"No CRM2 cases have been created yet."
};
const allowedStatuses = {
  lister:["new","information-requested","awaiting-manager-review"],
  manager:["awaiting-manager-review","information-requested"],
  closer:["approved","closer-assigned","appointment-booked","onboarded"],
  administrator:null
};
const escapeHtml = value => String(value || "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function renderShell(member) {
  document.getElementById("app").innerHTML = `<div class="shell"><aside class="sidebar"><img class="logo" src="/images/quaerens-logo.png" alt="Quaerens"><div><div class="workspace-mark">CRM2 · ${escapeHtml(labels[member.role])}</div><p style="color:#bae6fd">${escapeHtml(member.displayName || member.email || "Authorised user")}</p></div><nav class="nav"><a class="active" href="${escapeHtml(location.pathname)}">Dashboard</a><a href="/crm2-cases.html">CRM2 Cases</a>${["lister","manager","administrator"].includes(member.role)?'<a href="/crm2-lead-new.html">Create Manual Lead</a>':''}<a href="/crm2-assessment-builder.html">Assessments</a>${member.role==='administrator'?'<a href="/crm2-admin.html#users">User Administration</a>':''}<button data-crm2-logout>Log out</button></nav></aside><main class="main"><header class="topbar"><div><p class="eyebrow">CRM2 ${escapeHtml(labels[member.role])}</p><h1>Operational Dashboard</h1></div><div class="actions"><a class="btn" href="/crm2-cases.html">Open CRM2 Cases</a>${["lister","manager","administrator"].includes(member.role)?'<a class="btn primary" href="/crm2-lead-new.html">Create Manual Lead</a>':''}</div></header><div class="content"><section class="grid stats"><article class="card stat"><span>New leads</span><strong id="statNew">0</strong></article><article class="card stat"><span>Manager review</span><strong id="statReview">0</strong></article><article class="card stat"><span>Approved</span><strong id="statApproved">0</strong></article><article class="card stat"><span>Appointments</span><strong id="statAppointments">0</strong></article><article class="card stat"><span>Onboarded</span><strong id="statOnboarded">0</strong></article></section><section class="card"><div class="actions" style="justify-content:space-between"><div><p class="eyebrow">Shared CRM2 records</p><h2>${escapeHtml(labels[member.role])} queue</h2></div></div><div id="queue"></div></section><section class="notice" style="margin-top:1rem">Shared Processing integration is being completed. Continue preparing the client file; no case has been submitted.</section>${member.role==='administrator'?adminPanel():''}</div></main></div>`;
  bindLogout();
}

function adminPanel(){return `<section class="card" id="users" style="margin-top:1rem"><p class="eyebrow">Secure administration</p><h2>Create or update CRM2 user</h2><p>User creation is completed through a protected Cloud Function. A password-reset link is returned to the platform administrator and must be shared securely.</p><form id="userForm" class="grid form-grid"><label>Name<input name="displayName" required></label><label>Email<input name="email" type="email" required></label><label>CRM2 role<select name="role"><option value="lister">Lister</option><option value="manager">Manager</option><option value="closer">Closer</option><option value="administrator">Administrator</option></select></label><div class="full"><button class="btn primary" type="submit">Create CRM2 User</button></div></form><p id="userResult" class="message"></p></section>`}

function relevant(leads) {
  const statuses = allowedStatuses[expectedRole];
  return statuses ? leads.filter(item => statuses.includes(item.status)) : leads;
}

function renderQueue(leads) {
  const queue = document.getElementById("queue");
  const items = relevant(leads);
  if (!items.length) { queue.innerHTML=`<div class="empty"><h3>${escapeHtml(emptyCopy[expectedRole])}</h3>${["lister","manager","administrator"].includes(expectedRole)?'<a class="btn primary" href="/crm2-lead-new.html">Create Manual Lead</a>':''}</div>`; return; }
  queue.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Client</th><th>Issue</th><th>Status</th><th>Assigned</th><th>Updated</th><th></th></tr></thead><tbody>${items.slice(0,50).map(item=>`<tr><td><strong>${escapeHtml(item.clientName)}</strong><div class="muted">${escapeHtml(item.reference)}</div></td><td>${escapeHtml(item.issue)}</td><td><span class="badge">${escapeHtml(item.status)}</span></td><td>${escapeHtml(item.assignedUserName||"Unassigned")}</td><td>${escapeHtml(item.updatedAt?.toDate?item.updatedAt.toDate().toLocaleString('en-GB'):"")}</td><td><a class="btn" href="/crm2-case.html?id=${encodeURIComponent(item.id)}">Open</a></td></tr>`).join('')}</tbody></table></div>`;
}

function updateStats(leads){const count=status=>leads.filter(item=>item.status===status).length;document.getElementById('statNew').textContent=count('new');document.getElementById('statReview').textContent=count('awaiting-manager-review');document.getElementById('statApproved').textContent=count('approved')+count('closer-assigned');document.getElementById('statAppointments').textContent=count('appointment-booked');document.getElementById('statOnboarded').textContent=count('onboarded')}

const { membership } = await requireCrm2([expectedRole]);
renderShell(membership);
if(expectedRole==='administrator'){
  const { httpsCallable }=await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js');
  const { functions }=await import('/crm2-platform.js');
  document.getElementById('userForm').addEventListener('submit',async event=>{event.preventDefault();const result=document.getElementById('userResult');result.textContent='Creating secure CRM2 access…';try{const payload=Object.fromEntries(new FormData(event.currentTarget).entries());const response=await httpsCallable(functions,'crm2AdminCreateUser')(payload);result.innerHTML=`CRM2 user created: <strong>${escapeHtml(response.data.email)}</strong>. Secure reset link: <a href="${escapeHtml(response.data.resetLink)}">open password setup</a>.`;event.currentTarget.reset()}catch(error){result.textContent=error.message}})
}
const leadQuery = expectedRole === "closer"
  ? query(collection(db,"crm2Leads"), where("status", "in", allowedStatuses.closer), orderBy("updatedAt","desc"))
  : query(collection(db,"crm2Leads"),orderBy("updatedAt","desc"));
onSnapshot(leadQuery,snapshot=>{const leads=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));updateStats(leads);renderQueue(leads)},error=>{document.getElementById('queue').innerHTML=`<div class="notice">Could not load CRM2 records: ${escapeHtml(error.message)}</div>`});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

const app = initializeApp({
  apiKey: "AIzaSyCOo_Sa242sUuGyZD8jO8kk12V1aBX7wMA",
  authDomain: "quaerensclaims.firebaseapp.com",
  projectId: "quaerensclaims"
});

const auth = getAuth(app);
const functions = getFunctions(app);
const listPreparedCases = httpsCallable(functions, "gatewayAdminListPreparedCases");
const updatePreparedCase = httpsCallable(functions, "gatewayAdminUpdatePreparedCase");

const state = { cases: [], filteredCases: [], activeCase: null, activeDocument: "executiveSummary", loading: false };
const knownBuilders = ["Airbnb", "Section 75", "Holiday Compensation", "Flight Delay", "Car Finance", "Train", "Parking", "Cruise", "Lost Luggage", "Energy", "Gym"];
const documentTabs = [
  ["executiveSummary", "Executive Summary"],
  ["complaintPack", "Complaint Pack"],
  ["timeline", "Timeline"],
  ["evidenceSchedule", "Evidence Schedule"],
  ["financialSchedule", "Financial Schedule"],
  ["complaintLetter", "Complaint Letter"],
  ["coverEmail", "Cover Email"],
  ["supportingDocuments", "Supporting Documents"],
  ["internalNotes", "Internal Notes"],
  ["assignment", "Assignment"]
];

const byId = id => document.getElementById(id);
const titleCase = value => String(value || "Not set").replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

function asDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value._seconds === "number") return new Date(value._seconds * 1000);
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, includeTime = false) {
  const date = asDate(value);
  if (!date) return "Not recorded";
  return date.toLocaleString("en-GB", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function showMessage(message, error = false) {
  const box = byId("appMessage");
  box.textContent = message;
  box.classList.toggle("error", error);
  box.hidden = false;
  window.clearTimeout(showMessage.timeout);
  showMessage.timeout = window.setTimeout(() => { box.hidden = true; }, 5000);
}

function setLoading(loading) {
  state.loading = loading;
  document.querySelectorAll("button").forEach(button => {
    if (button.id !== "closeCaseDialog") button.disabled = loading;
  });
}

function showView(view) {
  document.querySelectorAll("[data-view-panel]").forEach(panel => { panel.hidden = panel.dataset.viewPanel !== view; });
  document.querySelectorAll("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view));
}

function average(field) {
  if (!state.cases.length) return 0;
  return Math.round(state.cases.reduce((sum, item) => sum + (Number(item[field]) || 0), 0) / state.cases.length);
}

function countStatus(...statuses) {
  return state.cases.filter(item => statuses.includes(item.status)).length;
}

function renderMetrics() {
  const today = new Date().toISOString().slice(0, 10);
  const metrics = [
    ["New Prepared Cases", countStatus("new"), true],
    ["Awaiting Review", countStatus("new", "awaiting-review"), false],
    ["Awaiting Qualification", countStatus("reviewed", "awaiting-qualification"), false],
    ["Awaiting Assignment", countStatus("qualified", "awaiting-assignment", "ready-for-assignment"), true],
    ["Assigned", countStatus("assigned"), false],
    ["Accepted", countStatus("accepted"), false],
    ["Closed", countStatus("closed"), false],
    ["Today's Cases", state.cases.filter(item => { const date = asDate(item.submissionDate || item.createdAt); return date && date.toISOString().slice(0, 10) === today; }).length, false],
    ["Average Response Time", calculateResponseTime(), false],
    ["Average Pack Quality", `${average("complaintPackQuality")}%`, false],
    ["Average Evidence Readiness", `${average("evidenceReadiness")}%`, false]
  ];
  byId("metricGrid").innerHTML = metrics.map(([label, value, highlight]) => `<article class="metric-card${highlight ? " highlight" : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("");
}

function calculateResponseTime() {
  const durations = state.cases.map(item => {
    const start = asDate(item.createdAt);
    const end = asDate(item.updatedAt);
    return start && end && end > start ? end - start : 0;
  }).filter(Boolean);
  if (!durations.length) return "—";
  const hours = durations.reduce((sum, value) => sum + value, 0) / durations.length / 3600000;
  return hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;
}

function builderCounts() {
  const counts = new Map(knownBuilders.map(builder => [builder, 0]));
  state.cases.forEach(item => counts.set(item.builder || "Unspecified", (counts.get(item.builder || "Unspecified") || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderDashboard() {
  renderMetrics();
  const attention = state.cases.filter(item => ["new", "reviewed", "awaiting-qualification", "qualified", "awaiting-assignment"].includes(item.status)).slice(0, 6);
  byId("attentionList").innerHTML = attention.length ? attention.map(item => `
    <article class="attention-card">
      <div><strong>${escapeHtml(item.gatewayReference || "Reference pending")}</strong><span>${escapeHtml(item.customer?.name || "Customer not recorded")} · ${escapeHtml(item.builder || "Builder not recorded")} · ${escapeHtml(titleCase(item.status))}</span></div>
      <button class="button secondary" type="button" data-open-case="${escapeHtml(item.id)}">Review</button>
    </article>`).join("") : `<div class="empty-state"><strong>No Prepared Cases currently require attention.</strong><p>New, completed Guided Support cases will appear here.</p></div>`;
  byId("builderBreakdown").innerHTML = builderCounts().map(([builder, count]) => `<div class="breakdown-row"><strong>${escapeHtml(builder)}</strong><span>${count}</span></div>`).join("");
  byId("lastUpdated").textContent = `Updated ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

function populateFilter(id, values) {
  const select = byId(id);
  const current = select.value;
  const first = select.options[0].outerHTML;
  select.innerHTML = first + [...new Set(values.filter(Boolean))].sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(titleCase(value))}</option>`).join("");
  if ([...select.options].some(option => option.value === current)) select.value = current;
}

function renderFilters() {
  populateFilter("frameworkFilter", state.cases.map(item => item.framework));
  populateFilter("builderFilter", state.cases.map(item => item.builder));
  populateFilter("statusFilter", state.cases.map(item => item.status));
  populateFilter("commercialFilter", state.cases.map(item => item.commercialModel));
  populateFilter("countryFilter", state.cases.map(item => item.country));
  populateFilter("priorityFilter", state.cases.map(item => item.priority));
}

function applyFilters() {
  const search = byId("caseSearch").value.trim().toLowerCase();
  const filters = {
    framework: byId("frameworkFilter").value,
    builder: byId("builderFilter").value,
    status: byId("statusFilter").value,
    commercialModel: byId("commercialFilter").value,
    country: byId("countryFilter").value,
    priority: byId("priorityFilter").value
  };
  const assignment = byId("assignmentFilter").value;
  state.filteredCases = state.cases.filter(item => {
    const searchable = [item.gatewayReference, item.complaintPackReference, item.customer?.name, item.customer?.email, item.builder, item.framework, item.country, item.status, item.commercialModel, formatDate(item.submissionDate || item.createdAt)].join(" ").toLowerCase();
    if (search && !searchable.includes(search)) return false;
    if (Object.entries(filters).some(([field, value]) => value && item[field] !== value)) return false;
    if (assignment === "assigned" && !item.proposedDestination) return false;
    if (assignment === "unassigned" && item.proposedDestination) return false;
    return true;
  });
  renderCasesTable();
}

function renderCasesTable() {
  const body = byId("casesTableBody");
  byId("caseCount").textContent = `${state.filteredCases.length} ${state.filteredCases.length === 1 ? "case" : "cases"}`;
  byId("casesEmpty").hidden = state.filteredCases.length > 0;
  body.innerHTML = state.filteredCases.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.gatewayReference || "Pending")}</strong><br><small>${escapeHtml(formatDate(item.submissionDate || item.createdAt))}</small></td>
      <td>${escapeHtml(item.customer?.name || "Not recorded")}</td>
      <td>${escapeHtml(item.builder || "Not recorded")}</td>
      <td>${Math.round(Number(item.complaintPackQuality) || 0)}%</td>
      <td>${Math.round(Number(item.evidenceReadiness) || 0)}%</td>
      <td><span class="status-pill${item.status === "ready-for-assignment" ? " ready" : ""}">${escapeHtml(titleCase(item.status))}</span></td>
      <td class="${String(item.priority).toLowerCase() === "high" ? "priority-high" : ""}">${escapeHtml(titleCase(item.priority || "Normal"))}</td>
      <td>${escapeHtml(item.proposedDestination || "Unassigned")}</td>
      <td><button class="button secondary" type="button" data-open-case="${escapeHtml(item.id)}">Open</button></td>
    </tr>`).join("");
}

function renderQueues() {
  const counts = builderCounts();
  byId("queueGrid").innerHTML = counts.map(([builder, total]) => {
    const cases = state.cases.filter(item => item.builder === builder);
    const newCount = cases.filter(item => item.status === "new").length;
    const qualification = cases.filter(item => ["reviewed", "awaiting-qualification"].includes(item.status)).length;
    const assignment = cases.filter(item => ["qualified", "awaiting-assignment", "ready-for-assignment"].includes(item.status)).length;
    return `<article class="queue-card"><div class="queue-card-header"><h3>${escapeHtml(builder)}</h3><span>${total}</span></div><div class="queue-stats"><div><strong>${newCount}</strong><small>New</small></div><div><strong>${qualification}</strong><small>Qualification</small></div><div><strong>${assignment}</strong><small>Assignment</small></div></div></article>`;
  }).join("");
}

function renderAll() {
  renderDashboard();
  renderFilters();
  state.filteredCases = [...state.cases];
  applyFilters();
  renderQueues();
}

async function loadCases() {
  if (state.loading) return;
  setLoading(true);
  try {
    const result = await listPreparedCases();
    state.cases = Array.isArray(result.data.cases) ? result.data.cases : [];
    renderAll();
  } catch (error) {
    showMessage(error.code === "functions/permission-denied" ? "Your account is not authorised to access the Intake Gateway." : "Prepared Cases could not be loaded. Please try again.", true);
  } finally {
    setLoading(false);
  }
}

function caseDocumentValue(item, key) {
  if (key === "supportingDocuments") {
    const files = item.supportingDocuments || [];
    return files.length ? files.map(file => `${file.name} (${file.contentType || "file"}, ${Math.round((file.size || 0) / 1024)} KB)`).join("\n") : "No supporting documents were supplied with this Prepared Case.";
  }
  if (key === "internalNotes") return item.lastInternalNote || "No internal notes have been added.";
  if (key === "assignment") return item.proposedDestination ? `Proposed destination: ${item.proposedDestination}\nAssignment status: ${titleCase(item.assignmentStatus)}\n\nNo CRM record has been created.` : "No destination has been prepared. Version 1 assignment is manual and never creates a CRM record.";
  return item.documents?.[key] || "This section was not supplied in the Prepared Case payload.";
}

function renderActiveDocument() {
  const item = state.activeCase;
  if (!item) return;
  const label = documentTabs.find(([key]) => key === state.activeDocument)?.[1] || "Document";
  const value = caseDocumentValue(item, state.activeDocument);
  byId("caseDocument").innerHTML = `<h3>${escapeHtml(label)}</h3><div class="${value.startsWith("No ") || value.startsWith("This section") ? "document-empty" : ""}">${escapeHtml(value)}</div>`;
  byId("caseTabs").querySelectorAll("button").forEach(button => {
    const active = button.dataset.document === state.activeDocument;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function openCase(caseId) {
  const item = state.cases.find(entry => entry.id === caseId);
  if (!item) return;
  state.activeCase = item;
  state.activeDocument = "executiveSummary";
  byId("caseDialogReference").textContent = item.gatewayReference || "Gateway reference pending";
  byId("caseDialogTitle").textContent = `${item.customer?.name || "Prepared Case"} — ${item.builder || "Builder"}`;
  const summary = [
    ["Pack reference", item.complaintPackReference], ["Framework", item.framework], ["Category", item.complaintCategory],
    ["Commercial model", item.commercialModel], ["Country / language", `${item.country || "Not set"} / ${item.language || "Not set"}`],
    ["Submitted", formatDate(item.submissionDate || item.createdAt, true)], ["Quality", `${item.complaintPackQuality || 0}%`],
    ["Evidence readiness", `${item.evidenceReadiness || 0}%`], ["Financial exposure", formatCurrency(item.estimatedFinancialExposure)],
    ["Status", titleCase(item.status)], ["Priority", titleCase(item.priority || "Normal")], ["Assignment", item.proposedDestination || "Unassigned"]
  ];
  byId("caseSummary").innerHTML = summary.map(([label, value]) => `<div class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Not recorded")}</strong></div>`).join("");
  byId("caseTabs").innerHTML = documentTabs.map(([key, label]) => `<button class="tab-button${key === state.activeDocument ? " active" : ""}" type="button" role="tab" aria-selected="${key === state.activeDocument}" data-document="${key}">${escapeHtml(label)}</button>`).join("");
  byId("internalNote").value = "";
  byId("assignmentDestination").value = item.proposedDestination || "";
  renderActiveDocument();
  byId("caseDialog").showModal();
}

async function performAction(action) {
  if (!state.activeCase || state.loading) return;
  const note = byId("internalNote").value.trim();
  const destination = byId("assignmentDestination").value;
  if (action === "decline" && !note) {
    showMessage("Add an internal reason before declining a Prepared Case.", true);
    byId("internalNote").focus();
    return;
  }
  if (action === "ready-for-assignment" && !destination) {
    showMessage("Select a proposed destination before marking the case Ready for Assignment.", true);
    byId("assignmentDestination").focus();
    return;
  }
  setLoading(true);
  try {
    const result = await updatePreparedCase({ caseId: state.activeCase.id, action, note, destination });
    if (result.data.crmRecordCreated !== false) throw new Error("Unexpected CRM creation response");
    showMessage(action === "ready-for-assignment" ? "Prepared Case is Ready for Assignment. No CRM record was created." : "Prepared Case updated successfully.");
    byId("caseDialog").close();
    setLoading(false);
    await loadCases();
  } catch (error) {
    showMessage(error.message || "The Gateway action could not be completed.", true);
  } finally {
    setLoading(false);
  }
}

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view], [data-open-view]");
  if (viewButton) showView(viewButton.dataset.view || viewButton.dataset.openView);
  const caseButton = event.target.closest("[data-open-case]");
  if (caseButton) openCase(caseButton.dataset.openCase);
  const tabButton = event.target.closest("[data-document]");
  if (tabButton) { state.activeDocument = tabButton.dataset.document; renderActiveDocument(); }
  const actionButton = event.target.closest("[data-case-action]");
  if (actionButton) performAction(actionButton.dataset.caseAction);
});

byId("refreshButton").addEventListener("click", loadCases);
byId("closeCaseDialog").addEventListener("click", () => byId("caseDialog").close());
byId("signOutButton").addEventListener("click", async () => { await signOut(auth); window.location.assign("/login.html?next=/intake-gateway.html"); });
byId("caseSearch").addEventListener("input", applyFilters);
["frameworkFilter", "builderFilter", "statusFilter", "commercialFilter", "countryFilter", "priorityFilter", "assignmentFilter"].forEach(id => byId(id).addEventListener("change", applyFilters));
byId("clearFilters").addEventListener("click", () => {
  byId("caseSearch").value = "";
  ["frameworkFilter", "builderFilter", "statusFilter", "commercialFilter", "countryFilter", "priorityFilter", "assignmentFilter"].forEach(id => { byId(id).value = ""; });
  applyFilters();
});

onAuthStateChanged(auth, async user => {
  if (!user) {
    sessionStorage.setItem("crmReturnTo", "/intake-gateway.html");
    window.location.replace("/login.html?next=/intake-gateway.html");
    return;
  }
  try {
    const token = await user.getIdTokenResult(true);
    if (token.claims.platformAdmin !== true) {
      byId("authMessage").textContent = "Your account does not have authorised Intake Gateway access.";
      return;
    }
    byId("userIdentity").textContent = user.email || "Authorised internal user";
    byId("authGate").hidden = true;
    byId("gatewayApp").hidden = false;
    renderAll();
    await loadCases();
  } catch {
    byId("authMessage").textContent = "Authorisation could not be confirmed. Please sign in again.";
  }
});

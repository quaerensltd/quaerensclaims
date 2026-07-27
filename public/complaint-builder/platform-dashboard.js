"use strict";

(function expose(root, factory) {
  const api = factory(root.QuaerensPlatformMetadata);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QuaerensComplaintDashboard = api;
})(typeof window !== "undefined" ? window : globalThis, function buildDashboard(metadata) {
  const META = metadata || { products: [] };
  const STANDARD_STATUSES = [
    "Not Started",
    "In Progress",
    "Needs Key Information",
    "Needs Evidence",
    "Ready for Review",
    "Ready to Submit",
    "Submitted",
    "Closed"
  ];

  function parseDraft(raw) {
    if (!raw) return { ok: false, reason: "empty" };
    try {
      const parsed = JSON.parse(raw);
      const state = parsed && parsed.state ? parsed.state : parsed;
      if (!state || typeof state !== "object") return { ok: false, reason: "empty" };
      return { ok: true, payload: parsed, state };
    } catch (_) {
      return { ok: false, reason: "corrupted" };
    }
  }

  function getStorageKeys(product) {
    const keys = new Set(product.storageKeys || []);
    if (product.storageNamespace) keys.add("qcbf:" + product.storageNamespace + ":1");
    if (product.storageKey) keys.add(product.storageKey);
    return Array.from(keys).filter(Boolean);
  }

  function safeText(value, fallback) {
    const text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    if (!text) return fallback || "";
    return text.length > 140 ? text.slice(0, 137) + "..." : text;
  }

  function pick(state, paths) {
    for (const path of paths) {
      const value = path.split(".").reduce((node, part) => node && node[part], state);
      if (value != null && String(value).trim()) return value;
    }
    return "";
  }

  function normaliseStatus(state) {
    const raw = safeText(pick(state, ["status", "packStatus", "meta.status", "analysis.status", "readiness.status"]), "");
    if (/ready.*submit/i.test(raw)) return "Ready to Submit";
    if (/ready.*review/i.test(raw)) return "Ready for Review";
    if (/evidence/i.test(raw)) return "Needs Evidence";
    if (/key|missing|required/i.test(raw)) return "Needs Key Information";
    if (/submitted/i.test(raw)) return "Submitted";
    if (/closed|complete/i.test(raw)) return "Closed";
    return raw && STANDARD_STATUSES.includes(raw) ? raw : "In Progress";
  }

  function summariseDraft(product, key, parsed) {
    const state = parsed.state || {};
    const meta = state.meta || parsed.payload.meta || {};
    return {
      id: product.id + "::" + key,
      storageKey: key,
      productId: product.id,
      productName: product.productName,
      packName: product.packName,
      category: product.category,
      canonicalUrl: product.canonicalUrl,
      resumeUrl: product.canonicalUrl + "#builder",
      startNewUrl: product.canonicalUrl,
      packReference: safeText(meta.packReference || state.packReference || state.reference, "Draft saved"),
      issueSummary: safeText(pick(state, ["issueSummary", "problemSummary", "primaryIssue", "problem", "disruption.type", "booking.issueType"]), product.shortDescription),
      organisation: safeText(pick(state, ["organisation", "airline", "operator", "company", "provider", "gymName", "cruiseLine", "travelCompany"]), "Organisation not recorded"),
      createdDate: safeText(meta.createdAt || parsed.payload.createdAt || parsed.payload.savedAt, "Date not recorded"),
      lastUpdatedDate: safeText(meta.updatedAt || meta.lastSavedAt || parsed.payload.savedAt || parsed.payload.updatedAt, "Date not recorded"),
      packStatus: normaliseStatus(state),
      evidencePosition: safeText(pick(state, ["evidencePosition", "analysis.evidencePosition", "evidence.level"]), "Not assessed yet"),
      progress: safeText(pick(state, ["progress", "meta.progress"]), "Draft saved"),
      requestedOutcome: safeText(pick(state, ["requestedOutcome", "outcome", "remedy"]), "Outcome not recorded"),
      amountDisputed: safeText(pick(state, ["amountDisputed", "financial.total", "expenses.total"]), "")
    };
  }

  function discoverSavedPacks(storage, products) {
    const target = storage || (typeof window !== "undefined" ? window.localStorage : null);
    const list = [];
    const errors = [];
    (products || META.products || []).filter((product) => product.dashboardVisible !== false).forEach((product) => {
      getStorageKeys(product).forEach((key) => {
        let raw = null;
        try { raw = target && target.getItem ? target.getItem(key) : null; } catch (_) { errors.push({ productId: product.id, storageKey: key, reason: "unavailable" }); }
        if (!raw) return;
        const parsed = parseDraft(raw);
        if (parsed.ok) list.push(summariseDraft(product, key, parsed));
        else errors.push({ productId: product.id, storageKey: key, reason: parsed.reason });
      });
    });
    return { packs: list.sort((a, b) => String(b.lastUpdatedDate).localeCompare(String(a.lastUpdatedDate))), errors };
  }

  function renderDashboard(root, storage) {
    if (!root) return;
    const result = discoverSavedPacks(storage);
    root.textContent = "";
    const summary = document.createElement("p");
    summary.className = "platform-privacy";
    summary.textContent = "Your Complaint Packs are stored locally in this browser on this device. They are not automatically uploaded to Quaerens.";
    root.appendChild(summary);

    const toolbar = document.createElement("div");
    toolbar.className = "dashboard-toolbar";
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search product or organisation";
    search.setAttribute("aria-label", "Search saved Complaint Packs");
    toolbar.appendChild(search);
    root.appendChild(toolbar);

    const list = document.createElement("div");
    list.className = "pack-card-grid";
    root.appendChild(list);

    function draw() {
      list.textContent = "";
      const query = search.value.toLowerCase();
      const visible = result.packs.filter((pack) => (pack.productName + " " + pack.organisation).toLowerCase().includes(query));
      if (!visible.length) {
        const empty = document.createElement("section");
        empty.className = "empty-state";
        const h = document.createElement("h2");
        h.textContent = result.packs.length ? "No matching Complaint Packs" : "You have no saved Complaint Packs in this browser yet.";
        const p = document.createElement("p");
        p.textContent = "Explore the free Complaint Packs below and start a new draft when you are ready.";
        const a = document.createElement("a");
        a.className = "btn";
        a.href = "/complaint-platform.html#packs";
        a.textContent = "Explore Free Complaint Packs";
        empty.append(h, p, a);
        list.appendChild(empty);
      }
      visible.forEach((pack) => list.appendChild(createPackCard(pack, storage || window.localStorage, draw)));
      if (result.errors.length) {
        const warning = document.createElement("p");
        warning.className = "dashboard-warning";
        warning.textContent = "One saved draft could not be read, but other Complaint Packs are still available.";
        list.appendChild(warning);
      }
    }
    search.addEventListener("input", draw);
    draw();
  }

  function createPackCard(pack, storage, refresh) {
    const card = document.createElement("article");
    card.className = "pack-card";
    const h = document.createElement("h2");
    h.textContent = pack.productName;
    const meta = document.createElement("p");
    meta.textContent = pack.packReference + " · " + pack.packStatus;
    const body = document.createElement("p");
    body.textContent = pack.organisation + " · " + pack.issueSummary;
    const actions = document.createElement("div");
    actions.className = "pack-actions";
    const resume = linkButton("Resume Pack", pack.resumeUrl);
    const product = linkButton("Open Product Page", pack.canonicalUrl);
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete Pack";
    del.addEventListener("click", function onDelete() {
      if (window.confirm("Delete this draft from this browser? This cannot be undone.")) {
        storage.removeItem(pack.storageKey);
        refresh();
      }
    });
    actions.append(resume, product, del);
    card.append(h, meta, body, actions);
    return card;
  }

  function linkButton(label, href) {
    const a = document.createElement("a");
    a.className = "btn";
    a.href = href;
    a.textContent = label;
    return a;
  }

  function resetAll(storage) {
    const target = storage || (typeof window !== "undefined" ? window.localStorage : null);
    (META.products || []).forEach((product) => getStorageKeys(product).forEach((key) => {
      try { if (target) target.removeItem(key); } catch (_) {}
    }));
  }

  return { discoverSavedPacks, normaliseStatus, resetAll, renderDashboard, getStorageKeys };
});

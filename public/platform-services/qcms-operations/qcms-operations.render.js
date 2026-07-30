(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    const model = require("./qcms-operations.model.js");
    module.exports = factory(model);
  } else {
    root.QCMSOperationsRender = factory(root.QCMSOperationsModel);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (model) {
  const esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  function badge(value) {
    const key = String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return '<span class="qops-badge qops-badge-' + esc(key) + '">' + esc(value) + "</span>";
  }

  function layout(active, content) {
    const nav = model.config.navigation.map(function (item) {
      const current = item[0] === active ? " aria-current=\"page\"" : "";
      return '<a class="qops-nav-link" href="#' + esc(item[0]) + '"' + current + ">" + esc(item[1]) + "</a>";
    }).join("");
    return [
      '<div class="qops-shell">',
      '<aside class="qops-sidebar" aria-label="QCMS Operations navigation">',
      '<a class="qops-brand" href="/"><img src="/images/quaerens-logo.png" alt="Quaerens"><span>QCMS Operations</span></a>',
      '<nav>' + nav + "</nav>",
      '<p class="qops-boundary">Complaint Manager workspace for instructed QCMS cases only.</p>',
      "</aside>",
      '<main class="qops-main" tabindex="-1">' + content + "</main>",
      "</div>"
    ].join("");
  }

  function metric(label, value, tone) {
    return '<article class="qops-metric ' + esc(tone || "") + '"><span>' + esc(label) + '</span><strong>' + esc(value) + "</strong></article>";
  }

  function dashboard() {
    const cases = model.fixtures.cases;
    const stats = model.workload(cases);
    const stageCounts = model.byStage(cases);
    const priority = model.priorityActions(cases);
    const today = model.todayActions(cases);
    const newCases = cases.filter(function (item) { return item.status === "New Instruction"; }).slice(0, 5);
    const recent = model.activity(cases);

    return layout("dashboard", [
      '<section class="qops-hero"><p class="qops-eyebrow">Dashboard</p><h1>Good morning, Martijn</h1><p>Operational overview for instructed QCMS cases. This prototype uses mock local data only.</p></section>',
      '<section class="qops-metrics" aria-label="Workload summary">',
      metric("Active Cases", stats.active),
      metric("New Instructions", stats.newInstructions, "blue"),
      metric("Awaiting Client", stats.awaitingClient, "amber"),
      metric("Ready for Submission", stats.readyForSubmission, "green"),
      metric("Awaiting Response", stats.awaitingResponse),
      metric("High Priority", stats.highPriority, "red"),
      "</section>",
      '<section class="qops-grid qops-grid-two">',
      panel("My Priority Actions", actionList(priority)),
      panel("Today I Can Complete", actionList(today, true)),
      "</section>",
      '<section class="qops-grid qops-grid-two">',
      panel("New Instructions", compactCases(newCases)),
      panel("My Cases Summary", stageSummary(stageCounts)),
      "</section>",
      panel("Recent Activity", activityList(recent))
    ].join(""));
  }

  function panel(title, body) {
    return '<section class="qops-panel"><h2>' + esc(title) + "</h2>" + body + "</section>";
  }

  function actionList(items, effort) {
    return '<div class="qops-list">' + items.map(function (item, index) {
      return '<a class="qops-list-row" href="#case/' + esc(item.reference) + '">' +
        '<span><strong>' + esc(item.reference) + " - " + esc(item.client) + "</strong><small>" + esc(item.complaintType) + " / " + esc(item.priority) + "</small></span>" +
        '<span><b>' + esc(item.nextAction) + '</b><small>Due ' + esc(item.dueDate) + (effort ? " / " + (index + 1) * 15 + " mins" : "") + "</small></span>" +
        "</a>";
    }).join("") + "</div>";
  }

  function compactCases(items) {
    return '<div class="qops-list">' + items.map(function (item) {
      return '<a class="qops-list-row" href="#case/' + esc(item.reference) + '"><span><strong>' + esc(item.client) + "</strong><small>" + esc(item.reference) + " / " + esc(item.complaintType) + "</small></span>" + badge(item.priority) + "</a>";
    }).join("") + "</div>";
  }

  function stageSummary(counts) {
    return '<div class="qops-stage-grid">' + Object.keys(counts).map(function (stage) {
      return '<div><span>' + esc(stage) + '</span><strong>' + esc(counts[stage]) + "</strong></div>";
    }).join("") + "</div>";
  }

  function activityList(items) {
    return '<ol class="qops-activity">' + items.map(function (item) {
      return '<li><strong>' + esc(item.action) + '</strong><span>' + esc(item.reference) + " - " + esc(item.client) + "</span><small>" + esc(item.at) + " by " + esc(item.actor) + ": " + esc(item.detail) + "</small></li>";
    }).join("") + "</ol>";
  }

  function casesRegister(filters) {
    const filtered = model.sortCases(model.filterCases(model.fixtures.cases, filters || {}), (filters || {}).sort);
    return layout("cases", [
      '<section class="qops-hero compact"><p class="qops-eyebrow">Cases Register</p><h1>Instructed QCMS Cases</h1><p>Search and filter local mock cases. Rows open the case workspace shell.</p></section>',
      filterBar(filters || {}),
      '<section class="qops-panel qops-table-panel"><div class="qops-table-wrap"><table class="qops-table"><thead><tr>',
      [
        "Case Reference", "Client", "Complaint Type", "Service Level", "Current Status",
        "Priority", "Complaint Manager", "Case Health", "Next Action", "Due Date", "Last Activity"
      ].map(function (heading) { return "<th>" + esc(heading) + "</th>"; }).join(""),
      "</tr></thead><tbody>",
      filtered.map(caseRow).join(""),
      "</tbody></table></div></section>"
    ].join(""));
  }

  function filterBar(filters) {
    function options(values, selected) {
      return '<option value="">All</option>' + values.map(function (value) {
        return '<option value="' + esc(value) + '"' + (value === selected ? " selected" : "") + ">" + esc(value) + "</option>";
      }).join("");
    }
    return '<form class="qops-filters" data-qops-filters>' +
      '<label>Search<input name="query" value="' + esc(filters.query || "") + '" placeholder="Client, reference, provider, postcode"></label>' +
      '<label>Status<select name="status">' + options(model.config.stages, filters.status) + "</select></label>" +
      '<label>Complaint type<select name="type">' + options(model.config.complaintRoutes, filters.type) + "</select></label>" +
      '<label>Priority<select name="priority">' + options(model.config.priorities, filters.priority) + "</select></label>" +
      '<label>Manager<select name="manager">' + options(model.config.managers, filters.manager) + "</select></label>" +
      '<label>Sort<select name="sort">' + options(["dueDate", "reference", "client", "status", "priority"], filters.sort || "dueDate") + "</select></label>" +
      '<button type="submit">Apply</button><a class="qops-button secondary" href="#cases">Clear</a>' +
      "</form>";
  }

  function caseRow(item) {
    return '<tr data-href="#case/' + esc(item.reference) + '"><td><a href="#case/' + esc(item.reference) + '">' + esc(item.reference) + "</a></td>" +
      "<td>" + esc(item.client) + "</td><td>" + esc(item.complaintType) + "</td><td>" + esc(item.serviceLevel) + "</td>" +
      "<td>" + badge(item.status) + "</td><td>" + badge(item.priority) + "</td><td>" + esc(item.manager) + "</td><td>" + badge(item.caseHealth) + "</td>" +
      "<td>" + esc(item.nextAction) + "</td><td>" + esc(item.dueDate) + "</td><td>" + esc(item.dates.lastActivity) + "</td></tr>";
  }

  function caseWorkspace(reference, tab) {
    const item = model.findCase(reference);
    const current = tab || "overview";
    const tabs = ["Overview", "Client", "Timeline", "Evidence", "Complaint", "Documents", "Messages", "Internal Notes", "Activity"];
    const tabLinks = tabs.map(function (name) {
      const key = name.toLowerCase().replace(/\s+/g, "-");
      return '<a href="#case/' + esc(item.reference) + "/" + key + '"' + (key === current ? ' aria-current="page"' : "") + ">" + esc(name) + "</a>";
    }).join("");
    return layout("cases", [
      '<section class="qops-case-head"><div><p class="qops-eyebrow">Case Workspace</p><h1>' + esc(item.reference) + " - " + esc(item.client) + "</h1><p>" + esc(item.summary) + "</p></div>",
      '<div class="qops-case-meta">' + badge(item.status) + badge(item.priority) + badge(item.caseHealth) + "</div></section>",
      '<section class="qops-panel"><div class="qops-case-strip">',
      '<span><b>Complaint type</b>' + esc(item.complaintType) + "</span>",
      '<span><b>Service level</b>' + esc(item.serviceLevel) + "</span>",
      '<span><b>Complaint Manager</b>' + esc(item.manager) + "</span>",
      '<span><b>Recommended next action</b>' + esc(item.nextAction) + "</span>",
      "</div></section>",
      '<nav class="qops-tabs" aria-label="Case workspace tabs">' + tabLinks + "</nav>",
      renderTab(item, current)
    ].join(""));
  }

  function renderTab(item, tab) {
    if (tab === "timeline") return panel("Timeline", timeline(item.timeline));
    if (tab === "evidence") return panel("Evidence", evidence(item.evidence));
    if (tab === "internal-notes") return panel("Internal Notes", notesForm(item));
    if (tab === "activity") return panel("Activity", activityList(item.activity.map(function (entry) { return Object.assign({ reference: item.reference, client: item.client }, entry); })));
    if (tab === "client") return panel("Client", '<div class="qops-detail-grid"><p><b>Client</b>' + esc(item.client) + '</p><p><b>Postcode</b>' + esc(item.postcode) + '</p><p><b>Authority status</b>' + esc(item.authorityStatus) + "</p></div>");
    if (tab === "complaint" || tab === "documents" || tab === "messages") return panel(tab.replace("-", " "), '<p class="qops-placeholder">Structured ' + esc(tab.replace("-", " ")) + ' workspace placeholder. No live data, emails or document systems are connected in Release 1.2 foundation.</p>');
    return overview(item);
  }

  function overview(item) {
    return panel("Case Overview", [
      '<div class="qops-detail-grid">',
      '<p><b>Provider/respondent</b>' + esc(item.provider) + "</p>",
      '<p><b>Important dates</b>Instructed ' + esc(item.dates.instructed) + ", due " + esc(item.dates.due) + "</p>",
      '<p><b>Financial value</b>Approx. GBP ' + esc(item.value.toLocaleString("en-GB")) + "</p>",
      '<p><b>Current stage</b>' + esc(item.status) + "</p>",
      '<p><b>Responsible person</b>' + esc(item.responsible) + "</p>",
      '<p><b>Expected milestone</b>' + esc(item.milestone) + "</p>",
      "</div>",
      '<div class="qops-progress"><span style="width:' + esc(item.progress) + '%"></span></div><p class="qops-muted">Operational progress: ' + esc(item.progress) + "% complete. This is not a success prediction.</p>",
      '<div class="qops-health">',
      health("Evidence Completeness", item.evidenceCompleteness),
      health("Complaint Readiness", item.complaintReadiness),
      health("Authority Status", item.authorityStatus),
      health("Timeline Completeness", item.timelineCompleteness),
      health("Overall Case Health", item.caseHealth),
      "</div>",
      '<h3>Outstanding requirements</h3><ul>' + item.outstanding.map(function (entry) { return "<li>" + esc(entry) + "</li>"; }).join("") + "</ul>"
    ].join(""));
  }

  function health(label, value) {
    return '<div><span>' + esc(label) + '</span><strong>' + esc(value) + "</strong></div>";
  }

  function timeline(items) {
    return '<ol class="qops-activity">' + items.map(function (item) {
      return '<li><strong>' + esc(item.title) + '</strong><span>' + esc(item.date) + '</span><small>' + esc(item.detail) + "</small></li>";
    }).join("") + "</ol>";
  }

  function evidence(items) {
    return '<div class="qops-stage-grid">' + items.map(function (item) {
      return '<div><span>' + esc(item.name) + '</span><strong>' + esc(item.status) + "</strong></div>";
    }).join("") + "</div>";
  }

  function notesForm(item) {
    return '<form class="qops-note-form" data-qops-note="' + esc(item.reference) + '"><label>Add internal note<textarea name="note" placeholder="Mock note only. This is not persisted."></textarea></label><button type="submit">Add Mock Note</button></form><div id="qops-note-result"></div>';
  }

  function placeholder(route) {
    const label = model.config.navigation.find(function (item) { return item[0] === route; });
    return layout(route, '<section class="qops-hero compact"><p class="qops-eyebrow">Foundation Module</p><h1>' + esc(label ? label[1] : "QCMS Operations") + '</h1><p>This Release 1.2 foundation screen is intentionally a labelled prototype. No production data or external services are connected.</p></section>');
  }

  return {
    layout,
    dashboard,
    casesRegister,
    caseWorkspace,
    placeholder,
    badge,
    filterBar
  };
});

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    const config = require("./qcms-operations.config.js");
    const model = require("./qcms-operations.model.js");
    module.exports = factory(config, model);
  } else {
    root.QCMSOperationsRender = factory(root.QCMSOperationsConfig, root.QCMSOperationsModel);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (config, model) {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function badge(value, tone) {
    const slug = tone || String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return '<span class="qops-badge qops-badge-' + escapeHtml(slug) + '">' + escapeHtml(value) + "</span>";
  }

  function fmtDate(value) {
    return value || "Not set";
  }

  function money(value) {
    return "&pound;" + Number(value || 0).toLocaleString("en-GB");
  }

  function openButton(reference, label) {
    return '<a class="qops-button qops-button-small" href="#case/' + encodeURIComponent(reference) + '">' + (label || "Open Case") + "</a>";
  }

  function nav(active) {
    return config.navigation.map(function (item) {
      const id = item[0];
      const label = item[1];
      return '<a class="' + (id === active ? "qops-nav-active" : "") + '" href="#' + escapeHtml(id) + '">' + escapeHtml(label) + "</a>";
    }).join("");
  }

  function layout(active, content) {
    return '' +
      '<div class="qops-shell">' +
        '<aside class="qops-sidebar">' +
          '<a class="qops-brand" href="index.html" aria-label="Quaerens home"><img src="images/quaerens-logo.png" alt="Quaerens"></a>' +
          '<p class="qops-release">' + escapeHtml(config.releaseName) + ' &middot; ' + escapeHtml(config.version) + '</p>' +
          '<nav class="qops-nav" aria-label="QCMS Operations navigation">' + nav(active) + '</nav>' +
          '<div class="qops-boundary"><strong>Operational boundary</strong><p>QCMS Operations is for instructed complaint work only. Lead and business workflows remain outside this workspace.</p></div>' +
        '</aside>' +
        '<main class="qops-main">' + content + '</main>' +
      '</div>';
  }

  function panel(title, body, meta) {
    return '<section class="qops-panel">' +
      '<div class="qops-panel-head"><div>' +
      (meta ? '<p class="qops-eyebrow">' + escapeHtml(meta) + '</p>' : '') +
      '<h2>' + escapeHtml(title) + '</h2></div></div>' +
      body +
    '</section>';
  }

  function missionCard(mission, startCase) {
    return '<section class="qops-mission">' +
      '<div class="qops-mission-copy">' +
        '<p class="qops-eyebrow">GOOD MORNING, ' + escapeHtml(mission.managerName.toUpperCase()) + '</p>' +
        '<h1>Today\'s Mission</h1>' +
        '<p class="qops-lead">Focus on the complaints that can be completed, moved forward or unblocked today.</p>' +
        '<div class="qops-mission-grid">' +
          '<div><strong>' + mission.completeToday + '</strong><span>Complete complaints today</span></div>' +
          '<div><strong>' + mission.moveForward + '</strong><span>Move complaints forward</span></div>' +
          '<div><strong>' + escapeHtml(mission.workload) + '</strong><span>Estimated workload</span></div>' +
        '</div>' +
        (startCase ? '<a class="qops-button qops-start" href="#case/' + encodeURIComponent(startCase.reference) + '">START WORKING</a>' : '') +
      '</div>' +
      '<div class="qops-summary-pills" aria-label="Operational summary">' +
        '<div class="qops-summary-pill qops-pill-red"><strong>' + mission.summary.immediateActions + '</strong><span>Immediate Actions</span></div>' +
        '<div class="qops-summary-pill qops-pill-amber"><strong>' + mission.summary.waitingOnClient + '</strong><span>Waiting on Clients</span></div>' +
        '<div class="qops-summary-pill qops-pill-green"><strong>' + mission.summary.readyForSubmission + '</strong><span>Ready for Submission</span></div>' +
        '<div class="qops-summary-pill qops-pill-blue"><strong>' + mission.summary.newInstructions + '</strong><span>New Instructions</span></div>' +
      '</div>' +
    '</section>';
  }

  function instructionInbox(items) {
    if (!items.length) return '<p class="qops-empty-good">No new instructions are waiting to be opened.</p>';
    return '<div class="qops-inbox-grid">' + items.map(function (item) {
      return '<article class="qops-instruction-card">' +
        '<div class="qops-card-top">' + badge(item.priority) + badge(item.assignedState) + '</div>' +
        '<h3>' + escapeHtml(item.complaintType) + '</h3>' +
        '<p><strong>' + escapeHtml(item.client) + '</strong></p>' +
        '<p>Current stage: ' + escapeHtml(item.status) + '</p>' +
        '<div class="qops-card-actions">' + openButton(item.reference) + '</div>' +
      '</article>';
    }).join("") + '</div>';
  }

  function actionTable(items, mode) {
    if (!items.length) return '<p class="qops-empty-good">No cases need action in this queue.</p>';
    const columns = mode === "ready"
      ? ["Client", "Complaint Type", "Remaining Action", "Estimated Effort", ""]
      : mode === "overdue"
      ? ["Client", "Complaint Type", "Overdue Reason", "Days Overdue", "Required Action", ""]
      : ["Client", "Complaint Type", "Why Action Is Required", "Due Date", "Recommended Next Action", ""];

    return '<div class="qops-table-wrap"><table class="qops-op-table"><thead><tr>' +
      columns.map(function (col) { return '<th>' + escapeHtml(col) + '</th>'; }).join("") +
      '</tr></thead><tbody>' +
      items.map(function (item) {
        if (mode === "ready") {
          return '<tr><td>' + escapeHtml(item.client) + '</td><td>' + escapeHtml(item.complaintType) + '</td><td>' + escapeHtml(item.recommendedNextAction) + '</td><td>' + item.estimatedEffortMinutes + ' minutes</td><td>' + openButton(item.reference) + '</td></tr>';
        }
        if (mode === "overdue") {
          return '<tr><td>' + escapeHtml(item.client) + '</td><td>' + escapeHtml(item.complaintType) + '</td><td>' + escapeHtml(item.waitingReason) + '</td><td>' + item.daysOverdue + ' days</td><td>' + escapeHtml(item.recommendedNextAction) + '</td><td>' + openButton(item.reference) + '</td></tr>';
        }
        return '<tr><td>' + escapeHtml(item.client) + '</td><td>' + escapeHtml(item.complaintType) + '</td><td>' + escapeHtml(item.waitingReason) + '</td><td>' + fmtDate(item.dueDate) + '</td><td>' + escapeHtml(item.recommendedNextAction) + '</td><td>' + openButton(item.reference) + '</td></tr>';
      }).join("") +
      '</tbody></table></div>';
  }

  function waitingGroups(groups) {
    if (!groups.length) return '<p class="qops-empty-good">No cases are currently waiting on others.</p>';
    return '<div class="qops-waiting-grid">' + groups.map(function (group) {
      return '<article class="qops-waiting-card">' +
        '<h3>' + escapeHtml(group.label) + '</h3>' +
        '<strong>' + group.cases.length + '</strong>' +
        '<ul>' + group.cases.map(function (item) {
          return '<li><a href="#case/' + encodeURIComponent(item.reference) + '">' + escapeHtml(item.client) + ' &middot; ' + escapeHtml(item.complaintType) + '</a></li>';
        }).join("") + '</ul>' +
      '</article>';
    }).join("") + '</div>';
  }

  function operationalSummary(cases) {
    const stages = model.byStage(cases);
    const workload = model.workload(cases);
    return '<div class="qops-summary-panel">' +
      '<div>' + badge(cases.length + " active cases", "blue") + '</div>' +
      '<div>' + badge(workload.immediateActions + " actions today", "amber") + '</div>' +
      '<div>' + badge(workload.readyForSubmission + " ready for submission", "green") + '</div>' +
      '<div>' + badge(workload.overdue + " overdue", "red") + '</div>' +
    '</div><div class="qops-stage-grid">' +
      Object.keys(stages).map(function (stage) {
        return '<div><strong>' + stages[stage] + '</strong><span>' + escapeHtml(stage) + '</span></div>';
      }).join("") +
    '</div>';
  }

  function activityList(items) {
    return '<ol class="qops-feed">' + items.map(function (item) {
      return '<li><strong>' + escapeHtml(item.client) + '</strong><span>' + escapeHtml(item.action) + ': ' + escapeHtml(item.detail) + '</span><small>' + escapeHtml(item.at) + '</small></li>';
    }).join("") + '</ol>';
  }

  function dashboard() {
    const cases = model.allCases();
    const mission = model.mission(cases);
    const startCase = model.highestPriorityActionable(cases);
    const content =
      missionCard(mission, startCase) +
      panel("New Complaint Instructions", instructionInbox(model.newInstructions(cases)), "Section 1") +
      panel("Immediate Action Required", actionTable(model.immediateActions(cases), "immediate"), "Section 2") +
      panel("Waiting On Others", waitingGroups(model.waitingGroups(cases)), "Section 3") +
      panel("Ready To Complete Today", actionTable(model.readyToCompleteToday(cases), "ready"), "Section 4") +
      panel("Overdue", actionTable(model.overdueCases(cases), "overdue"), "Section 5") +
      panel("Operational Summary", operationalSummary(cases), "Section 6") +
      panel("Operational Feed", activityList(model.activity(cases, 5)) + '<a class="qops-link-action" href="#activity">View Full Activity</a>', "Section 7");
    return layout("dashboard", content);
  }

  function filterBar(filters) {
    filters = filters || {};
    return '<form class="qops-filter-bar" data-qops-filters>' +
      '<input name="query" value="' + escapeHtml(filters.query || "") + '" placeholder="Search client, reference or complaint type">' +
      '<select name="status"><option value="">All statuses</option>' + config.stages.map(function (status) { return '<option value="' + escapeHtml(status) + '"' + (filters.status === status ? " selected" : "") + '>' + escapeHtml(status) + '</option>'; }).join("") + '</select>' +
      '<select name="type"><option value="">All complaint types</option>' + config.complaintRoutes.map(function (type) { return '<option value="' + escapeHtml(type) + '"' + (filters.type === type ? " selected" : "") + '>' + escapeHtml(type) + '</option>'; }).join("") + '</select>' +
      '<select name="priority"><option value="">All priorities</option>' + config.priorities.map(function (priority) { return '<option value="' + escapeHtml(priority) + '"' + (filters.priority === priority ? " selected" : "") + '>' + escapeHtml(priority) + '</option>'; }).join("") + '</select>' +
      '<select name="sort"><option value="dueDate">Due date</option><option value="caseAgeDays">Case age</option><option value="priority">Priority</option><option value="lastActivity">Last activity</option></select>' +
      '<button class="qops-button qops-button-small" type="submit">Apply</button>' +
    '</form>';
  }

  function casesRegister(filters) {
    const cases = model.sortCases(model.filterCases(model.allCases(), filters), (filters && filters.sort) || "dueDate");
    const rows = cases.map(function (item) {
      return '<tr data-href="#case/' + escapeHtml(item.reference) + '">' +
        '<td><a href="#case/' + encodeURIComponent(item.reference) + '">' + escapeHtml(item.reference) + '</a></td>' +
        '<td>' + escapeHtml(item.client) + '</td>' +
        '<td>' + escapeHtml(item.complaintType) + '</td>' +
        '<td>' + escapeHtml(item.serviceLevel) + '</td>' +
        '<td>' + badge(item.status) + '</td>' +
        '<td>' + badge(item.priority) + '</td>' +
        '<td>' + escapeHtml(item.manager) + '</td>' +
          '<td>' + badge(item.complaintReadiness) + '</td>' +
        '<td>' + badge(item.waitingStatus) + '</td>' +
        '<td>' + item.caseAgeDays + ' days</td>' +
        '<td>' + escapeHtml(item.nextAction) + '</td>' +
        '<td>' + fmtDate(item.dueDate) + '</td>' +
        '<td>' + fmtDate(item.dates.lastActivity) + '</td>' +
      '</tr>';
    }).join("");
    const content = '<section class="qops-page-head"><p class="qops-eyebrow">CASE REGISTER</p><h1>All instructed QCMS cases</h1><p>Track complaint readiness, waiting status, case age and the next complaint-manager action.</p></section>' +
      filterBar(filters) +
      '<div class="qops-table-wrap"><table class="qops-register"><thead><tr><th>Case Reference</th><th>Client</th><th>Complaint Type</th><th>Service Level</th><th>Current Status</th><th>Priority</th><th>Complaint Manager</th><th>Complaint Readiness</th><th>Waiting Status</th><th>Case Age</th><th>Next Action</th><th>Due Date</th><th>Last Activity</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    return layout("cases", content);
  }

  function journey(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">CASE WORKSPACE</p><h2>Complaint Journey</h2></div><div class="qops-journey" role="list">' +
      caseItem.journey.map(function (stage) {
        return '<div class="qops-journey-stage qops-journey-' + escapeHtml(stage.state.toLowerCase()) + '" role="listitem"><span class="qops-journey-marker"></span><strong>' + escapeHtml(stage.label) + '</strong><small>' + escapeHtml(stage.state) + '</small><p>' + escapeHtml(stage.description) + '</p></div>';
      }).join("") +
    '</div></section>';
  }

  function complaintSummary(caseItem) {
    const summary = caseItem.summary || {};
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">SUMMARY</p><h2>Complaint Summary</h2></div><div class="qops-summary-list">' +
      '<div><span>Problem</span><strong>' + escapeHtml(summary.problem) + '</strong></div>' +
      '<div><span>Service</span><strong>' + escapeHtml(summary.service) + '</strong></div>' +
      '<div><span>Financial position</span><strong>' + escapeHtml(summary.financialPosition) + '</strong></div>' +
      '<div><span>Current position</span><strong>' + escapeHtml(summary.currentPosition) + '</strong></div>' +
      '<div><span>Objective</span><strong>' + escapeHtml(summary.objective) + '</strong></div>' +
    '</div></section>';
  }

  function todaysTask(caseItem) {
    const task = caseItem.todaysTask || {};
    return '<section class="qops-task-panel"><div><p class="qops-eyebrow">TODAY</p><h2>Today\'s Task</h2><p>' + escapeHtml(task.currentTask) + '</p></div>' +
      '<dl class="qops-task-grid">' +
        '<div><dt>Recommended next action</dt><dd>' + escapeHtml(task.recommendedNextAction) + '</dd></div>' +
        '<div><dt>Responsible person</dt><dd>' + escapeHtml(task.responsiblePerson) + '</dd></div>' +
        '<div><dt>Estimated effort</dt><dd>' + escapeHtml(task.estimatedEffortMinutes) + ' minutes</dd></div>' +
        '<div><dt>Expected outcome</dt><dd>' + escapeHtml(task.expectedOutcome) + '</dd></div>' +
        '<div><dt>Deadline</dt><dd>' + escapeHtml(task.deadline) + '</dd></div>' +
      '</dl><button class="qops-button" type="button">' + escapeHtml(task.primaryActionLabel || "Start Task") + '</button></section>';
  }

  function readiness(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">QUALITY CHECK</p><h2>Complaint Readiness</h2></div><div class="qops-readiness">' +
      (caseItem.readiness || []).map(function (item) {
        const score = Math.max(0, Math.min(100, item.score || 0));
        return '<div class="qops-progress-row"><div><strong>' + escapeHtml(item.label) + '</strong><span>' + escapeHtml(item.status) + '</span></div><div class="qops-progress-track"><span style="width:' + score + '%"></span></div><em>' + score + '%</em></div>';
      }).join("") +
    '</div></section>';
  }

  function evidenceChecklist(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">EVIDENCE</p><h2>Evidence Checklist</h2></div><div class="qops-checklist">' +
      (caseItem.evidenceChecklist || []).map(function (item) {
        return '<article class="qops-check-item"><strong>' + escapeHtml(item.label) + '</strong>' + badge(item.status) + '<small>Owner: ' + escapeHtml(item.owner) + '</small></article>';
      }).join("") +
    '</div></section>';
  }

  function operationalTimeline(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">HISTORY</p><h2>Operational Timeline</h2></div><ol class="qops-pro-timeline">' +
      caseItem.timeline.map(function (event) {
        return '<li><time>' + escapeHtml(event.date) + '</time><strong>' + escapeHtml(event.title) + '</strong><p>' + escapeHtml(event.detail) + '</p></li>';
      }).join("") +
    '</ol></section>';
  }

  function expectedMilestone(caseItem) {
    const milestone = caseItem.expectedMilestone || {};
    return '<section class="qops-workspace-card qops-milestone"><div class="qops-card-heading"><p class="qops-eyebrow">NEXT</p><h2>Expected Next Milestone</h2></div><strong>' + escapeHtml(milestone.title) + '</strong><p>Owner: ' + escapeHtml(milestone.owner) + ' &middot; Due: ' + escapeHtml(milestone.dueDate) + '</p><p>' + escapeHtml(milestone.successMeasure) + '</p>' + (milestone.blocker ? '<div class="qops-warning"><strong>Blocker</strong><p>' + escapeHtml(milestone.blocker) + '</p></div>' : '') + '</section>';
  }

  function workspaceActions(caseItem) {
    return '<aside class="qops-actions-panel"><p class="qops-eyebrow">ACTIONS</p><h2>Workspace Actions</h2><p>Use these mock actions to show the intended Release 1.4 operational flow. No live systems are connected.</p>' +
      '<div class="qops-action-buttons">' + (caseItem.workspaceActions || []).map(function (label) {
        return '<button class="qops-button qops-button-outline" type="button">' + escapeHtml(label) + '</button>';
      }).join("") + '</div></aside>';
  }

  function messagesPanel(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">COMMUNICATIONS</p><h2>Messages</h2></div><div class="qops-message-thread">' +
      (caseItem.messages || []).map(function (message) {
        return '<article><strong>' + escapeHtml(message.subject) + '</strong><p>' + escapeHtml(message.detail) + '</p><small>' + escapeHtml(message.from) + ' &middot; ' + escapeHtml(message.status) + '</small></article>';
      }).join("") +
    '</div></section>';
  }

  function notesPanel(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">INTERNAL</p><h2>Internal Notes</h2></div><div class="qops-note-list">' +
      (caseItem.notes || []).map(function (note) {
        return '<article><strong>' + escapeHtml(note.author) + '</strong><p>' + escapeHtml(note.text) + '</p><small>' + escapeHtml(note.visibility) + '</small></article>';
      }).join("") +
      '</div><form class="qops-note-form" data-qops-note="' + escapeHtml(caseItem.reference) + '"><textarea name="note" placeholder="Add a mock internal note"></textarea><button class="qops-button" type="submit">Add Note</button><div id="qops-note-result"></div></form></section>';
  }

  function activityPanel(caseItem) {
    return '<section class="qops-workspace-card"><div class="qops-card-heading"><p class="qops-eyebrow">AUDIT</p><h2>Activity</h2></div><ol class="qops-feed qops-feed-compact">' +
      caseItem.activity.map(function (item) {
        return '<li><strong>' + escapeHtml(item.action) + '</strong><span>' + escapeHtml(item.detail) + '</span><small>' + escapeHtml(item.at) + ' &middot; ' + escapeHtml(item.actor) + '</small></li>';
      }).join("") +
    '</ol></section>';
  }

  function caseWorkspace(reference) {
    const caseItem = model.findCase(reference);
    const content = '<section class="qops-case-head"><div><p class="qops-eyebrow">' + escapeHtml(caseItem.reference) + '</p><h1>' + escapeHtml(caseItem.client) + '</h1><p>' + escapeHtml(caseItem.complaintType) + ' &middot; ' + escapeHtml(caseItem.serviceLevel) + '</p></div><div class="qops-case-badges">' + badge(caseItem.status) + badge(caseItem.priority) + badge(caseItem.caseHealth) + badge(caseItem.waitingStatus) + '</div></section>' +
      '<section class="qops-case-strip"><div><span>Complaint Type</span><strong>' + escapeHtml(caseItem.complaintType) + '</strong></div><div><span>Service Level</span><strong>' + escapeHtml(caseItem.serviceLevel) + '</strong></div><div><span>Complaint Manager</span><strong>' + escapeHtml(caseItem.manager) + '</strong></div><div><span>Waiting status</span><strong>' + escapeHtml(caseItem.waitingStatus) + '</strong></div><div><span>Case age</span><strong>' + caseItem.caseAgeDays + ' days</strong></div><div><span>Complaint Readiness</span><strong>' + escapeHtml(caseItem.complaintReadiness) + '</strong></div><div><span>Financial value</span><strong>' + money(caseItem.value) + '</strong></div></section>' +
      '<div class="qops-workspace"><div class="qops-workspace-main">' +
        journey(caseItem) +
        complaintSummary(caseItem) +
        todaysTask(caseItem) +
        readiness(caseItem) +
        evidenceChecklist(caseItem) +
        operationalTimeline(caseItem) +
        expectedMilestone(caseItem) +
        '<div class="qops-activity-split">' + messagesPanel(caseItem) + notesPanel(caseItem) + '</div>' +
        activityPanel(caseItem) +
      '</div>' + workspaceActions(caseItem) + '</div>';
    return layout("cases", content);
  }

  function placeholder(route) {
    return layout(route, '<section class="qops-page-head"><p class="qops-eyebrow">FOUNDATION MODULE</p><h1>' + escapeHtml(route) + '</h1><p>This Release 1.4 Case Workspace module is reserved for the next implementation phase.</p></section>');
  }

  return {
    layout,
    badge,
    dashboard,
    filterBar,
    casesRegister,
    caseWorkspace,
    placeholder
  };
});

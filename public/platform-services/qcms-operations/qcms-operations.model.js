(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    const config = require("./qcms-operations.config.js");
    const fixtures = require("./qcms-operations.fixtures.js");
    module.exports = factory(config, fixtures);
  } else {
    root.QCMSOperationsModel = factory(root.QCMSOperationsConfig, root.QCMSOperationsFixtures);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (config, fixtures) {
  const today = "2026-07-30";
  const dayMs = 24 * 60 * 60 * 1000;
  let localCases = cloneCases(fixtures.cases);

  function cloneCases(cases) {
    return JSON.parse(JSON.stringify(cases || []));
  }

  function setCases(cases) {
    localCases = cloneCases(cases);
    return allCases();
  }

  function resetMockState() {
    localCases = cloneCases(fixtures.cases);
    return allCases();
  }

  function toDate(value) {
    return new Date(String(value) + "T00:00:00Z");
  }

  function daysBetween(start, end) {
    return Math.max(0, Math.round((toDate(end).getTime() - toDate(start).getTime()) / dayMs));
  }

  function daysOverdue(dueDate) {
    return Math.max(0, Math.round((toDate(today).getTime() - toDate(dueDate).getTime()) / dayMs));
  }

  function enrichCase(item) {
    return Object.assign({}, item, {
      caseAgeDays: daysBetween(item.dates.instructed, today),
      daysOverdue: daysOverdue(item.dueDate),
      isOverdue: daysOverdue(item.dueDate) > 0 && item.status !== "Closed" && item.status !== "Resolved",
      isActionable: item.status !== "Closed" && item.waitingStatus === "Waiting on Complaint Manager",
      isReadyToComplete: item.status === "Ready for Submission" || item.status === "Response Received"
    });
  }

  function allCases() {
    return localCases.map(enrichCase);
  }

  function priorityRank(priority) {
    return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] == null ? 4 : { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority];
  }

  function urgencySort(a, b) {
    return priorityRank(a.priority) - priorityRank(b.priority) ||
      String(a.dueDate).localeCompare(String(b.dueDate)) ||
      b.caseAgeDays - a.caseAgeDays;
  }

  function formatWorkload(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours ? hours + "h " + String(mins).padStart(2, "0") + "m" : mins + "m";
  }

  function byStage(cases) {
    return config.stages.reduce(function (acc, stage) {
      acc[stage] = cases.filter(function (item) { return item.status === stage; }).length;
      return acc;
    }, {});
  }

  function workload(cases) {
    return {
      active: cases.filter(function (item) { return item.status !== "Closed"; }).length,
      newInstructions: cases.filter(function (item) { return item.status === "New Instruction"; }).length,
      waitingOnClient: cases.filter(function (item) { return item.waitingStatus === "Waiting on Client"; }).length,
      readyForSubmission: cases.filter(function (item) { return item.status === "Ready for Submission"; }).length,
      awaitingResponse: cases.filter(function (item) { return item.status === "Awaiting Response"; }).length,
      immediateActions: immediateActions(cases).length,
      highPriority: cases.filter(function (item) { return item.priority === "High" || item.priority === "Critical"; }).length,
      overdue: overdueCases(cases).length
    };
  }

  function mission(cases) {
    const ready = readyToCompleteToday(cases);
    const immediate = immediateActions(cases);
    const minutes = immediate.concat(ready).reduce(function (sum, item) {
      return sum + Number(item.estimatedEffortMinutes || 0);
    }, 0);
    return {
      managerName: "Martijn",
      completeToday: ready.length,
      moveForward: immediate.length,
      workload: formatWorkload(minutes),
      summary: workload(cases)
    };
  }

  function newInstructions(cases) {
    return cases
      .filter(function (item) { return item.status === "New Instruction"; })
      .sort(urgencySort)
      .slice(0, 8);
  }

  function immediateActions(cases) {
    return cases
      .filter(function (item) {
        return item.status !== "Closed" &&
          item.status !== "Resolved" &&
          (item.waitingStatus === "Waiting on Complaint Manager" || item.priority === "Critical" || item.dueDate <= today);
      })
      .sort(urgencySort)
      .slice(0, 8);
  }

  function priorityActions(cases) {
    return immediateActions(cases);
  }

  function todayActions(cases) {
    return readyToCompleteToday(cases);
  }

  function waitingGroups(cases) {
    const labels = [
      "Waiting on Client",
      "Waiting on Business",
      "Waiting on Partner",
      "Waiting on Authority",
      "Waiting on Finance",
      "Waiting on Documents",
      "Waiting on Provider",
      "Waiting on Complaint Manager"
    ];
    return labels.map(function (label) {
      return {
        label,
        cases: cases.filter(function (item) { return item.waitingStatus === label && item.status !== "Closed"; }).sort(urgencySort).slice(0, 4)
      };
    }).filter(function (group) { return group.cases.length; });
  }

  function readyToCompleteToday(cases) {
    return cases
      .filter(function (item) { return item.isReadyToComplete || item.status === "Ready for Submission"; })
      .sort(urgencySort)
      .slice(0, 6);
  }

  function overdueCases(cases) {
    return cases.filter(function (item) { return item.isOverdue; }).sort(function (a, b) {
      return b.daysOverdue - a.daysOverdue || urgencySort(a, b);
    });
  }

  function highestPriorityActionable(cases) {
    return immediateActions(cases)[0] || newInstructions(cases)[0] || cases[0];
  }

  function activity(cases, limit) {
    return cases.flatMap(function (item) {
      return item.activity.map(function (entry) {
        return Object.assign({ reference: item.reference, client: item.client, complaintType: item.complaintType }, entry);
      });
    }).sort(function (a, b) { return b.at.localeCompare(a.at); }).slice(0, limit || 5);
  }

  function filterCases(cases, filters) {
    filters = filters || {};
    const query = String(filters.query || "").trim().toLowerCase();
    return cases.filter(function (item) {
      const haystack = [
        item.reference, item.client, item.complaintType, item.provider, item.postcode,
        item.serviceLevel, item.status, item.manager, item.priority, item.waitingStatus
      ].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.type || item.complaintType === filters.type) &&
        (!filters.priority || item.priority === filters.priority) &&
        (!filters.manager || item.manager === filters.manager);
    });
  }

  function sortCases(cases, sortKey) {
    const key = sortKey || "dueDate";
    return cases.slice().sort(function (a, b) {
      if (key === "caseAgeDays") return b.caseAgeDays - a.caseAgeDays;
      return String(a[key] || "").localeCompare(String(b[key] || ""));
    });
  }

  function findCase(reference) {
    return allCases().find(function (item) { return item.reference === reference; }) || allCases()[0];
  }

  function createActivity(caseItem, action, detail, actor) {
    return {
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: actor || "Prototype User",
      action,
      detail,
      reference: caseItem.reference,
      client: caseItem.client
    };
  }

  function nowStamp() {
    return new Date().toISOString().slice(0, 16).replace("T", " ");
  }

  function actionKey(label) {
    return String(label || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function findMutableCase(reference) {
    return localCases.find(function (item) { return item.reference === reference; }) || localCases[0];
  }

  function updateJourney(caseItem, currentLabel, closed) {
    const order = {
      Instructed: 0,
      Triage: 1,
      Evidence: 2,
      Timeline: 3,
      Complaint: 4,
      "Ready for Submission": 5,
      Submitted: 5,
      "Awaiting Response": 6,
      Resolved: 7
    };
    const currentIndex = order[currentLabel] == null ? 0 : order[currentLabel];
    caseItem.journey = (caseItem.journey || []).map(function (stage, index) {
      const state = closed ? "Complete" : index < currentIndex ? "Complete" : index === currentIndex ? "Current" : "Pending";
      return Object.assign({}, stage, { state });
    });
  }

  function upsertEvidence(caseItem, label, status, owner) {
    const items = caseItem.evidenceChecklist || [];
    const existing = items.find(function (item) { return item.label === label; });
    if (existing) {
      existing.status = status;
      existing.owner = owner || existing.owner;
    } else {
      items.push({ label, status, owner: owner || "Client" });
    }
    caseItem.evidenceChecklist = items;
  }

  function addAudit(caseItem, action, detail, actor) {
    const entry = createActivity(caseItem, action, detail, actor);
    caseItem.activity = caseItem.activity || [];
    caseItem.timeline = caseItem.timeline || [];
    caseItem.activity.unshift(entry);
    caseItem.timeline.unshift({
      date: nowStamp().slice(0, 10),
      title: action,
      detail: detail
    });
    caseItem.dates = caseItem.dates || {};
    caseItem.dates.lastActivity = nowStamp().slice(0, 10);
    return entry;
  }

  function refreshTask(caseItem, task, action, responsible) {
    caseItem.recommendedNextAction = action;
    caseItem.nextAction = action;
    caseItem.todaysTask = Object.assign({}, caseItem.todaysTask || {}, {
      currentTask: task,
      recommendedNextAction: action,
      responsiblePerson: responsible || caseItem.manager,
      primaryActionLabel: action
    });
    caseItem.expectedMilestone = Object.assign({}, caseItem.expectedMilestone || {}, {
      title: action,
      owner: responsible || caseItem.manager,
      successMeasure: task
    });
  }

  function setReadiness(caseItem, label, status, score) {
    caseItem.readiness = (caseItem.readiness || []).map(function (item) {
      if (item.label === label) return Object.assign({}, item, { status, score });
      return item;
    });
  }

  function applyWorkspaceAction(reference, key, payload) {
    payload = payload || {};
    const caseItem = findMutableCase(reference);
    const actor = payload.preparedBy || payload.manager || payload.actor || "Prototype User";
    const normalized = actionKey(key);
    let detail = "";

    if (normalized === "generate-complaint") {
      caseItem.status = "Complaint Preparation";
      caseItem.complaintReadiness = "Needs Review";
      updateJourney(caseItem, "Complaint");
      setReadiness(caseItem, "Complaint Pack", "Drafting", 70);
      detail = "Complaint preparation opened for " + (payload.complaintType || caseItem.complaintType) + " using " + (payload.route || "the selected complaint route") + ".";
      refreshTask(caseItem, "Prepare complaint wording and route notes.", "Review draft complaint", actor);
    } else if (normalized === "request-evidence") {
      caseItem.status = "Evidence Requested";
      caseItem.waitingStatus = "Waiting on Client";
      caseItem.complaintReadiness = "Needs Evidence";
      updateJourney(caseItem, "Evidence");
      upsertEvidence(caseItem, payload.evidenceItem || "Requested evidence", "Requested", payload.recipient || "Client");
      setReadiness(caseItem, "Evidence", "Requested", 45);
      detail = "Evidence requested from " + (payload.recipient || "client") + ": " + (payload.evidenceItem || "Requested evidence") + ".";
      refreshTask(caseItem, "Wait for requested evidence and review once received.", "Follow up evidence request", payload.recipient || "Client");
    } else if (normalized === "send-reminder") {
      detail = "Reminder logged for " + (payload.recipient || "client") + " about " + (payload.reminderType || "next action") + ".";
      caseItem.waitingStatus = caseItem.waitingStatus || "Waiting on Client";
      refreshTask(caseItem, "Reminder logged and follow-up date noted.", "Monitor reminder response", caseItem.manager);
    } else if (normalized === "assign-complaint") {
      caseItem.manager = payload.manager || caseItem.manager;
      caseItem.assignedState = "Assigned";
      caseItem.waitingStatus = "Waiting on Complaint Manager";
      detail = "Complaint assigned to " + caseItem.manager + ".";
      refreshTask(caseItem, "New Complaint Manager should review case position.", "Review assigned case", caseItem.manager);
    } else if (normalized === "record-response") {
      caseItem.status = "Response Received";
      caseItem.waitingStatus = payload.followUpRequired ? "Waiting on Complaint Manager" : "Waiting on Client";
      updateJourney(caseItem, "Awaiting Response");
      detail = "Response recorded from " + (payload.respondent || "respondent") + ": " + (payload.outcomeSummary || "Response details added") + ".";
      refreshTask(caseItem, "Assess the response and decide the next complaint step.", "Review response outcome", caseItem.manager);
    } else if (normalized === "close-complaint") {
      if (!payload.confirmClose) return { caseItem: enrichCase(caseItem), entry: null, error: "Close confirmation required." };
      caseItem.status = payload.outcome === "Resolved" ? "Resolved" : "Closed";
      caseItem.waitingStatus = "Closed";
      caseItem.complaintReadiness = "Complete";
      caseItem.caseHealth = "Excellent";
      updateJourney(caseItem, "Resolved", true);
      setReadiness(caseItem, "Outcome position", "Complete", 100);
      detail = "Complaint closed: " + (payload.closureReason || "Closure recorded") + ".";
      refreshTask(caseItem, "Outcome recorded and case closed.", "No further action", caseItem.manager);
    } else {
      detail = "Workspace action logged.";
    }

    const entry = addAudit(caseItem, actionLabel(normalized), detail, actor);
    return { caseItem: enrichCase(caseItem), entry };
  }

  function actionLabel(key) {
    return {
      "generate-complaint": "Generate Complaint",
      "request-evidence": "Request Evidence",
      "send-reminder": "Send Reminder",
      "assign-complaint": "Assign Complaint",
      "record-response": "Record Response",
      "close-complaint": "Close Complaint"
    }[key] || "Workspace Action";
  }

  return {
    config,
    fixtures,
    today,
    allCases,
    byStage,
    workload,
    mission,
    newInstructions,
    immediateActions,
    todayActions,
    priorityActions,
    waitingGroups,
    readyToCompleteToday,
    overdueCases,
    highestPriorityActionable,
    activity,
    filterCases,
    sortCases,
    findCase,
    createActivity,
    actionKey,
    setCases,
    resetMockState,
    applyWorkspaceAction
  };
});

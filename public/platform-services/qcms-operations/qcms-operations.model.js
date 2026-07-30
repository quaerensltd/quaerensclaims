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
    return fixtures.cases.map(enrichCase);
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
    createActivity
  };
});

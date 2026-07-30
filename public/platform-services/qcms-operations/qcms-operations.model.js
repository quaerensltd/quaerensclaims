(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    const config = require("./qcms-operations.config.js");
    const fixtures = require("./qcms-operations.fixtures.js");
    module.exports = factory(config, fixtures);
  } else {
    root.QCMSOperationsModel = factory(root.QCMSOperationsConfig, root.QCMSOperationsFixtures);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (config, fixtures) {
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
      awaitingClient: cases.filter(function (item) { return item.status === "Evidence Requested"; }).length,
      readyForSubmission: cases.filter(function (item) { return item.status === "Ready for Submission"; }).length,
      awaitingResponse: cases.filter(function (item) { return item.status === "Awaiting Response"; }).length,
      highPriority: cases.filter(function (item) { return item.priority === "High" || item.priority === "Critical"; }).length
    };
  }

  function todayActions(cases) {
    return cases
      .filter(function (item) { return item.dueDate <= "2026-08-01" && item.status !== "Closed"; })
      .slice(0, 6);
  }

  function priorityActions(cases) {
    return cases
      .filter(function (item) { return item.priority === "Critical" || item.priority === "High"; })
      .slice(0, 6);
  }

  function activity(cases) {
    return cases.flatMap(function (item) {
      return item.activity.map(function (entry) {
        return Object.assign({ reference: item.reference, client: item.client }, entry);
      });
    }).sort(function (a, b) { return b.at.localeCompare(a.at); }).slice(0, 8);
  }

  function filterCases(cases, filters) {
    filters = filters || {};
    const query = String(filters.query || "").trim().toLowerCase();
    return cases.filter(function (item) {
      const haystack = [
        item.reference, item.client, item.complaintType, item.provider, item.postcode,
        item.serviceLevel, item.status, item.manager, item.priority
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
      return String(a[key] || "").localeCompare(String(b[key] || ""));
    });
  }

  function findCase(reference) {
    return fixtures.cases.find(function (item) { return item.reference === reference; }) || fixtures.cases[0];
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
    byStage,
    workload,
    todayActions,
    priorityActions,
    activity,
    filterCases,
    sortCases,
    findCase,
    createActivity
  };
});

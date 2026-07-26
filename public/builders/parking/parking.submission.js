"use strict";

(function(root, factory) {
  const parking = root.QCBFParking || {};
  const api = factory(parking.analysis, parking.resources);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.submission = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis, resources) {
  if (!analysis && typeof require === "function") analysis = require("./parking.analysis");
  if (!resources && typeof require === "function") resources = require("./parking.resources");

  function smartSubmission(data) {
    const result = analysis.analyse(data || {});
    const route = resources.operatorRoute(data || {});
    const checks = [
      "Check the notice number, vehicle registration, dates and location before submitting.",
      "Use the official route printed on the notice or rejection letter.",
      "Attach only relevant evidence and keep copies of every upload, email or postal receipt.",
      "Do not ignore court, enforcement, fixed-penalty or Letter Before Claim paperwork.",
      "If a POPLA, IAS or tribunal code has been supplied, record the code and deadline."
    ];
    return {
      readiness: result.completeness.status,
      preferredMethod: route.method,
      route,
      urgent: result.stage.urgent,
      checks,
      warning: result.stage.caution
    };
  }

  return { smartSubmission };
});

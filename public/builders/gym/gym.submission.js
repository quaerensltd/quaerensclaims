(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./gym.resources"));
  else root.QCBFGymSubmission = factory(root.QCBFGymResources);
})(typeof self !== "undefined" ? self : this, function (resources) {
  function smartSubmission(data, analysis) {
    const route = analysis && analysis.submission ? analysis.submission : resources.officialRoute(data);
    return {
      title: "Quaerens Smart Submission™",
      method: route.method,
      status: route.status,
      detail: route.detail,
      checklist: [
        "Check the gym and legal entity",
        "Check the membership number",
        "Check the requested cancellation date",
        "Remove unsupported claims",
        "Attach the membership agreement and cancellation evidence",
        "Attach payment evidence where money is disputed",
        "Use the gym or administrator's current official route",
        "Keep proof of submission and all responses",
        "Do not ignore debt or court correspondence"
      ]
    };
  }

  return { smartSubmission };
});

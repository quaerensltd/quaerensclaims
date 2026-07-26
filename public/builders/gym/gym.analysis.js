(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(
    require("./gym.config"),
    require("./gym.deadlines"),
    require("./gym.contract"),
    require("./gym.evidence"),
    require("./gym.resources")
  );
  else root.QCBFGymAnalysis = factory(root.QCBFGymConfig, root.QCBFGymDeadlines, root.QCBFGymContract, root.QCBFGymEvidence, root.QCBFGymResources);
})(typeof self !== "undefined" ? self : this, function (config, deadlines, contract, evidence, resources) {
  function array(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function isUrgent(data) {
    return /letter before claim|court|judgment|enforcement|bailiff|insolvency|statutory demand/i.test(array(data.whatHappened).concat(data.currentStage || "", data.debtStage || "").join(" "));
  }

  function issueType(data) {
    const issues = array(data.whatHappened).join(" ");
    if (/charged|refund|payment|direct debit|card/i.test(issues)) return "Billing or refund dispute";
    if (/refused/i.test(issues)) return "Cancellation refusal";
    if (/cooling|online|telephone|away/i.test(issues)) return "Cooling-off or joining-route review";
    if (/illness|injury/i.test(issues)) return "Health or injury-related cancellation request";
    if (/moved|home/i.test(issues)) return "Relocation cancellation request";
    if (/job|financial/i.test(issues)) return "Hardship cancellation or freeze request";
    if (/price/i.test(issues)) return "Price-increase dispute";
    if (/facility|closed|moved location/i.test(issues)) return "Service or facility-change dispute";
    if (/misled|explained/i.test(issues)) return "Sales explanation or contract transparency review";
    if (/renew/i.test(issues)) return "Automatic-renewal review";
    if (/debt|court|letter before/i.test(issues)) return "Debt or formal escalation boundary";
    return "Cancellation request";
  }

  function financialPosition(data) {
    const monthly = Number(data.monthlyFee || 0);
    const disputed = Number(data.amountDisputed || 0);
    const refund = Number(data.refundReceived || 0);
    const balance = Number(data.balanceDemanded || 0);
    const total = Math.max(0, disputed + balance - refund);
    return {
      monthlyFee: monthly || null,
      amountDisputed: disputed || null,
      refundReceived: refund || null,
      balanceDemanded: balance || null,
      estimatedPosition: total || null,
      note: "Estimated only. Do not combine different currencies without checking the figures."
    };
  }

  function completeness(data) {
    const missing = config.essentialFields.filter((field) => {
      const value = data[field];
      return Array.isArray(value) ? value.length === 0 : !value;
    });
    return {
      status: missing.length ? "Needs key information" : "Ready to review",
      missing
    };
  }

  function analyse(data) {
    const urgent = isUrgent(data);
    return {
      packReference: data.packReference,
      issueType: issueType(data),
      urgent,
      deadline: deadlines.deadlineSummary(data),
      contractReview: contract.contractReview(data),
      fairnessReview: contract.fairnessReview(data),
      evidenceChecklist: evidence.buildEvidenceChecklist(data),
      evidencePosition: evidence.evidencePosition(data),
      financialPosition: financialPosition(data),
      completeness: completeness(data),
      submission: resources.officialRoute(data),
      caution: urgent
        ? "This builder can help organise the contract, payments and correspondence, but court and enforcement documents may involve strict deadlines and separate procedures. Check the document immediately and consider obtaining qualified advice."
        : "The pack is a self-service cancellation and complaint aid. Quaerens does not contact the gym or cancel the membership for you."
    };
  }

  return { analyse, isUrgent, issueType, financialPosition, completeness };
});

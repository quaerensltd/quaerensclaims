(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./gym.config"), require("./gym.analysis"), require("./gym.submission"), require("./gym.resources"));
  else root.QCBFGymDocuments = factory(root.QCBFGymConfig, root.QCBFGymAnalysis, root.QCBFGymSubmission, root.QCBFGymResources);
})(typeof self !== "undefined" ? self : this, function (config, analysisEngine, submissionEngine, resources) {
  function value(v, fallback) {
    if (Array.isArray(v)) return v.length ? v.join(", ") : fallback;
    return v || fallback;
  }

  function money(v) {
    return v ? `£${Number(v).toFixed(2)}` : "Not recorded";
  }

  function line(label, val, fallback) {
    const out = value(val, fallback || "Not yet recorded");
    return `${label}: ${out}`;
  }

  function cover(data, analysis) {
    return [
      "QUAERENS",
      "Gym Membership Cancellation & Dispute Pack",
      "",
      line("Pack reference", data.packReference),
      line("Generated", new Date().toLocaleDateString("en-GB")),
      line("Member", data.memberName, "Member name not yet recorded"),
      line("Gym", data.gymName, "Gym not yet recorded"),
      line("Branch", data.branch, "Branch not yet recorded"),
      line("Membership type", data.membershipType, "Membership type not yet recorded"),
      line("Membership number", data.membershipNumber, "Membership number not yet recorded"),
      line("Primary issue", analysis.issueType),
      line("Current stage", data.currentStage, "Current stage not yet recorded"),
      line("Pack status", analysis.completeness.status)
    ].join("\n");
  }

  function summary(data, analysis) {
    return [
      "Cancellation & Dispute Summary",
      line("What happened", data.whatHappened, "Issue not yet selected"),
      line("Jurisdiction", data.jurisdiction, "Jurisdiction not yet recorded"),
      line("Requested outcome", data.requestedOutcomes, "Requested outcome not yet recorded"),
      line("Member summary", data.memberSummary, "No additional member summary recorded"),
      "",
      "Analysis",
      `Issue type: ${analysis.issueType}`,
      `Evidence position: ${analysis.evidencePosition}`,
      `Completeness: ${analysis.completeness.status}`,
      analysis.caution
    ].join("\n");
  }

  function membership(data) {
    return [
      "Membership Summary",
      line("Gym trading name", data.gymName, "Gym trading name not yet recorded"),
      line("Legal entity", data.legalEntity, "Legal entity not yet known"),
      line("Administrator", data.membershipAdministrator, "Administrator not yet recorded"),
      line("Payment collector", data.paymentCollector, "Payment collector not yet recorded"),
      line("Start date", data.membershipStartDate, "Start date needs checking"),
      line("Minimum term", data.minimumTerm, "Minimum term needs checking"),
      line("Renewal date", data.renewalDate, "Renewal date not recorded"),
      line("Notice period", data.noticePeriod, "Notice period needs checking"),
      line("Monthly fee", money(data.monthlyFee)),
      line("Current status", data.currentMembershipStatus, "Status not yet recorded")
    ].join("\n");
  }

  function contract(data, analysis) {
    return [
      "Contract Review",
      ...analysis.contractReview.map((x) => `- ${x}`),
      "",
      "Contract Fairness Review",
      ...analysis.fairnessReview.map((x) => `- ${x}`),
      "",
      `Cooling-off analysis: ${analysis.deadline.coolingOff}`,
      `Notice analysis: ${analysis.deadline.notice}`
    ].join("\n");
  }

  function financial(data, analysis) {
    const f = analysis.financialPosition;
    return [
      "Payment and Charge Schedule",
      line("Payment method", data.paymentMethod, "Payment method not yet recorded"),
      line("Amount disputed", money(data.amountDisputed)),
      line("Balance demanded", money(data.balanceDemanded)),
      line("Refund received", money(data.refundReceived)),
      line("Estimated financial position", money(f.estimatedPosition)),
      f.note,
      "",
      line("Payment notes", data.paymentNotes, "No payment notes recorded")
    ].join("\n");
  }

  function evidence(data, analysis) {
    return [
      "Evidence Checklist",
      ...analysis.evidenceChecklist.map((x) => `- ${x}`),
      "",
      line("Evidence already recorded", data.evidence, "No evidence selected yet"),
      line("Missing evidence", data.missingEvidence, "No missing evidence recorded")
    ].join("\n");
  }

  function timeline(data) {
    return [
      "Membership Timeline",
      line("Date joined", data.dateJoined || data.membershipStartDate, "Date joined not recorded"),
      line("Circumstances began", data.circumstancesBegan, "Not recorded"),
      line("Cancellation requested", data.cancellationRequestDate, "Cancellation date not recorded"),
      line("Gym response date", data.gymResponseDate, "No response date recorded"),
      line("Follow-up date", data.followUpDate, "Follow-up date not recorded"),
      line("Timeline notes", data.timelineNotes, "No timeline notes recorded")
    ].join("\n");
  }

  function letter(data, analysis) {
    const urgent = analysis.urgent;
    const heading = urgent ? "Factual Evidence Summary" : "Cancellation or Complaint Letter";
    return [
      heading,
      "",
      `To ${value(data.gymName, "the gym or membership administrator")},`,
      "",
      `I am writing about membership ${value(data.membershipNumber, "[membership number not recorded]")}.`,
      `The issue I want reviewed is: ${analysis.issueType}.`,
      `Requested outcome: ${value(data.requestedOutcomes, "please review the cancellation, billing and contract position")}.`,
      "",
      data.cancellationRequestDate ? `I record that cancellation or notice was given on ${data.cancellationRequestDate}.` : "The cancellation or notice date still needs to be confirmed.",
      data.requestedEndDate ? `The requested membership end date is ${data.requestedEndDate}.` : "Please confirm the correct effective cancellation date and final balance.",
      "",
      "Please review the contract terms, cancellation route, payment history and correspondence, and provide a written response.",
      data.amountDisputed ? `The amount currently disputed is ${money(data.amountDisputed)}.` : "",
      urgent ? "This is not a court defence or court form. It is a factual summary of the membership dispute and evidence recorded." : "",
      "",
      "Yours faithfully,",
      value(data.memberName, "[member name]")
    ].filter(Boolean).join("\n");
  }

  function buildAll(data) {
    const analysis = analysisEngine.analyse(data);
    const submission = submissionEngine.smartSubmission(data, analysis);
    const sections = {
      cover: cover(data, analysis),
      summary: summary(data, analysis),
      membership: membership(data),
      contract: contract(data, analysis),
      financial: financial(data, analysis),
      evidence: evidence(data, analysis),
      timeline: timeline(data),
      letter: letter(data, analysis),
      submission: [
        "Smart Submission",
        `Method: ${submission.method}`,
        `Status: ${submission.status}`,
        submission.detail,
        "",
        "Before You Submit",
        ...submission.checklist.map((x) => `- ${x}`)
      ].join("\n"),
      resources: ["Official Resources", ...resources.officialSources.map((x) => `- ${x.label}: ${x.url}`)].join("\n"),
      disclaimer: "Self-Service Disclaimer\nQuaerens does not contact or cancel the membership for you. Outcomes depend on facts, documents, deadlines and responses received."
    };
    return {
      title: "Quaerens Consumer Complaint File",
      subtitle: config.productName,
      analysis,
      sections,
      text: Object.values(sections).join("\n\n---\n\n")
    };
  }

  return { buildAll };
});

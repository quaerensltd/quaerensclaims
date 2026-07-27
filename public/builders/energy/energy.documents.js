(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./energy.config"), require("./energy.analysis"));
  else root.QCBFEnergyDocuments = factory(root.QCBFEnergyConfig, root.QCBFEnergyAnalysis);
})(typeof self !== "undefined" ? self : this, function (config, analysisEngine) {
  function arr(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function value(v, fallback) {
    if (Array.isArray(v)) return v.length ? v.join(", ") : fallback;
    return v || fallback;
  }

  function line(label, val, fallback) {
    return `${label}: ${value(val, fallback || `${label} has not yet been recorded`)}`;
  }

  function build(data) {
    const analysis = analysisEngine.analyse(data || {});
    return [
      "QUAERENS CONSUMER COMPLAINT FILE",
      config.packName,
      "Powered by the Quaerens Evidence Engine(TM)",
      "",
      line("Pack reference", data.packReference, "Pack reference has not yet been created"),
      line("Generated", new Date().toLocaleDateString("en-GB")),
      line("Document type", analysis.documentType),
      line("Primary issue", analysis.issueType),
      line("Evidence position", analysis.evidencePosition),
      "",
      "CONSUMER AND ACCOUNT DETAILS",
      line("Consumer", data.consumerName, "Consumer name has not yet been recorded"),
      line("Email", data.email, "Email has not yet been recorded"),
      line("Telephone", data.telephone, "Telephone has not yet been recorded"),
      line("Account holder position", data.accountHolder, "Account-holder position has not yet been recorded"),
      line("Jurisdiction", data.jurisdiction, "Jurisdiction has not yet been recorded"),
      line("Property country", data.propertyCountry, "Property country has not yet been recorded"),
      line("Residential or business", data.accountResidential, "Account type has not yet been recorded"),
      "",
      "SUPPLIER, TARIFF AND METER",
      line("Supplier", data.supplierName, "Supplier name has not yet been recorded"),
      line("Previous supplier", data.previousSupplier, "Previous supplier not recorded"),
      line("New or intended supplier", data.newSupplier, "New supplier not recorded"),
      line("Energy type", data.energyType, "Energy type has not yet been recorded"),
      line("Account number", data.accountNumber, "Account number has not yet been recorded"),
      line("Tariff", data.tariffName, "Tariff details need to be added"),
      line("Meter serial", data.meterSerial, "Meter serial has not yet been confirmed"),
      line("Opening reading", data.openingReading, "Opening reading needs verification"),
      line("Closing reading", data.closingReading, "Closing reading needs verification"),
      "",
      "WHAT HAPPENED",
      value(arr(data.whatHappened).map((x) => `- ${x}`).join("\n"), "No issue selection has been recorded"),
      "",
      "SUMMARY",
      value(data.problemSummary, "A factual summary has not yet been added."),
      "",
      "PAYMENTS, CREDIT AND AMOUNTS",
      line("Disputed amount", data.disputedAmount, "No disputed amount recorded"),
      line("Credit balance", data.creditBalance, "No credit balance recorded"),
      line("Payment issue", data.paymentIssue, "No payment issue recorded"),
      "",
      "COMPLAINT HISTORY",
      line("Complaint date", data.complaintDate, "Complaint date has not yet been recorded"),
      line("Supplier response", data.supplierResponse, "No written response recorded"),
      line("Deadlock letter", data.deadlockLetter, "No deadlock letter recorded"),
      "",
      "EVIDENCE RECOMMENDED",
      analysis.evidence.map((item) => `- ${item}`).join("\n"),
      "",
      "EVIDENCE AVAILABLE",
      value(arr(data.evidenceAvailable).map((x) => `- ${x}`).join("\n"), "No available evidence has been selected yet."),
      "",
      "ROUTE ANALYSIS",
      analysis.routes.map((r) => `- ${r.organisation}: ${r.role}. ${r.status}`).join("\n"),
      "",
      "REQUESTED OUTCOME",
      value(arr(data.requestedOutcomes).map((x) => `- ${x}`).join("\n"), "No requested outcome has been selected yet."),
      "",
      "BOUNDARIES",
      "This pack organises account records, bills, payments and correspondence. It does not guarantee compensation, a refund, bill correction, Ombudsman acceptance or any particular outcome.",
      analysis.jurisdictionWarning || "No jurisdiction warning has been triggered by the current answers.",
      analysis.urgent
        ? "Urgent warning: this pack is not an emergency service and does not create court or enforcement documents."
        : "No urgent safety or court boundary has been triggered by the current answers."
    ].join("\n");
  }

  function status(data) {
    const analysis = analysisEngine.analyse(data || {});
    return [
      analysis.completeness.status,
      analysis.issueType,
      analysis.evidencePosition,
      analysis.documentType
    ];
  }

  return { build, status };
});

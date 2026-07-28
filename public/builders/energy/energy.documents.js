(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./energy.config"), require("./energy.analysis"), require("./energy.resources"));
  else root.QCBFEnergyDocuments = factory(root.QCBFEnergyConfig, root.QCBFEnergyAnalysis, root.QCBFEnergyResources);
})(typeof self !== "undefined" ? self : this, function (config, analysisEngine, resources) {
  function arr(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function clean(value) {
    return String(value || "")
      .replace(/\bon[a-z]+\s*=/gi, "event-attribute-removed=")
      .replace(/javascript\s*:/gi, "javascript-removed:")
      .replace(/[<>]/g, (char) => (char === "<" ? "‹" : "›"))
      .replace(/\u0000/g, "")
      .trim();
  }

  function value(v, fallback) {
    if (Array.isArray(v)) return v.length ? v.map(clean).filter(Boolean).join(", ") : fallback;
    return v ? clean(v) : fallback;
  }

  function line(label, val, fallback) {
    return `${label}: ${value(val, fallback || `${label} has not yet been recorded`)}`;
  }

  function section(title, lines) {
    const body = arr(lines).filter((item) => item !== undefined && item !== null && String(item).trim() !== "");
    if (!body.length) return "";
    return [`\n${title.toUpperCase()}`, ...body].join("\n");
  }

  function bullets(items, fallback) {
    const list = arr(items).map(clean).filter(Boolean);
    return list.length ? list.map((item) => `- ${item}`).join("\n") : fallback;
  }

  function table(rows) {
    return arr(rows).map((row) => `${clean(row[0] || row.label)}: ${clean(row[1] || row.value)}`).join("\n");
  }

  function officialResourceLines() {
    if (!resources || !Array.isArray(resources.sources)) {
      return ["Official route records are unavailable in this build. Check Ofgem, the supplier and the Energy Ombudsman before submitting."];
    }
    return [
      `Official source records last verified: ${resources.verifiedOn || "not recorded"}.`,
      ...resources.sources.map((source, index) => `${index + 1}. ${source.organisation} - ${source.title}: ${source.officialUrl} (${source.limitations})`)
    ];
  }

  function relevant(data, pattern) {
    return pattern.test(arr(data.issueGroups).concat(arr(data.whatHappened), data.issueSummary || "", data.financialSummary || "").join(" ").toLowerCase());
  }

  function buildComplaintLetter(data, analysis) {
    return [
      `Dear ${value(data.supplierName, "Energy Supplier")},`,
      "",
      "I am writing to raise a formal complaint about the energy account issue summarised in this pack.",
      `The main issue currently appears to be: ${analysis.issueType}.`,
      value(data.issueSummary, "The detailed facts still need to be completed before this letter is sent."),
      "",
      "Please review the account records, bills, meter information, payment history and correspondence connected with this complaint.",
      "I ask that you provide a clear written response, explain the account position and consider the requested outcome where the evidence supports it.",
      "",
      "This complaint pack is prepared for self-service use. I will attach the relevant evidence before submitting it.",
      "",
      "Yours faithfully,",
      value(data.customerName || data.consumerName, "[Name]")
    ].join("\n");
  }

  function packSections(data) {
    const analysis = analysisEngine.analyse(data || {});
    const generated = new Date().toLocaleDateString("en-GB");
    const timelineRows = analysis.timeline.events.map((event) => `${value(event.date, "Date not recorded")} | ${value(event.organisation || data.supplierName, "Organisation not recorded")} | ${value(event.event, "Event")} | ${value(event.description, "")}`);
    const financialRows = analysis.financialSchedule.entries.map((entry) => `${entry.date || "Date not recorded"} | ${entry.category || "Category"} | ${entry.description || "Description"} | ${entry.currency || "GBP"} ${entry.amount}`);

    const sections = [
      section("Premium Cover Page", [
        "QUAERENS CONSUMER COMPLAINT FILE",
        config.packName,
        "Powered by the Quaerens Evidence Engine(TM)",
        line("Pack reference", data.packReference, "Pack reference has not yet been created"),
        line("Generated", generated),
        line("Pack status", analysis.completeness.status)
      ]),
      section("Executive Summary", [
        line("Document type", analysis.documentType),
        line("Primary issue", analysis.issueType),
        line("Evidence position", analysis.evidencePosition),
        analysis.completeness.explanation
      ]),
      section("Consumer Summary", [
        line("Consumer", data.customerName || data.consumerName, "Consumer name has not yet been recorded"),
        line("Account holder position", data.accountHolder, "Account-holder position has not yet been recorded"),
        line("Contact email", data.customerEmail || data.email, "Email has not yet been recorded"),
        line("Telephone", data.customerPhone || data.telephone, "Telephone has not yet been recorded")
      ]),
      section("Property Summary", [
        line("Supply address", data.propertyAddress, "Supply address has not yet been recorded"),
        line("Postcode", data.postcode, "Postcode has not yet been recorded"),
        line("Jurisdiction", data.jurisdiction, "Jurisdiction has not yet been recorded"),
        line("Account type", data.customerType || data.accountResidential, "Account type has not yet been recorded")
      ]),
      section("Supplier Summary", [
        line("Supplier", data.supplierName, "Supplier name has not yet been recorded"),
        line("Previous or gaining supplier", data.previousSupplier || data.newSupplier, "Other supplier not recorded"),
        line("Fuel", data.fuelType || data.energyType, "Fuel type has not yet been recorded"),
        line("Account number", data.accountNumber, "Account number has not yet been recorded"),
        line("Tariff", data.tariffName, "Tariff details need to be added"),
        line("Meter serial / MPAN / MPRN", data.meterSerial, "Meter identifier has not yet been confirmed")
      ]),
      section("Energy Account Health Summary", table(analysis.healthSummary.rows.map((row) => [row.label, row.value]))),
      section("Energy Complaint Analysis", [
        "Issue selections:",
        bullets(data.issueGroups, "No issue selection has been recorded."),
        "",
        "What happened:",
        value(data.issueSummary || data.problemSummary, "A factual summary has not yet been added.")
      ]),
      relevant(data, /switch|transfer/) && section("Switching Analysis", [
        line("Switch requested", data.switchRequestedDate || data.issueStartDate, "Switch request date has not yet been recorded"),
        line("Switch completed", data.switchCompletedDate, "Switch completion date has not yet been recorded"),
        line("Supplier roles", `${value(data.supplierName, "Current supplier not recorded")} / ${value(data.previousSupplier || data.newSupplier, "Other supplier not recorded")}`),
        "Compare supplier roles, switch dates, opening readings and final bills before submitting."
      ]),
      relevant(data, /bill|balance|historical|back-billing|estimated/) && section("Billing Analysis", [
        line("Bill date", data.billDate, "Relevant bill date has not yet been recorded"),
        line("Recorded account balance", data.recordedAccountBalance, "Recorded account balance has not yet been recorded"),
        line("Disputed amount", data.disputedAmount, "Disputed amount has not yet been recorded"),
        value(data.financialSummary, "Billing explanation has not yet been added.")
      ]),
      relevant(data, /meter|reading|smart|prepayment/) && section("Meter Analysis", [
        line("Meter type", data.meterType, "Meter type has not yet been recorded"),
        line("Meter identifier", data.meterSerial, "Meter identifier has not yet been recorded"),
        line("Opening reading", data.openingReading, "Opening reading not recorded"),
        line("Closing reading", data.closingReading, "Closing reading not recorded")
      ]),
      section("Financial Position", table(analysis.financialPosition.rows)),
      analysis.financialSchedule.entries.length && section("Financial Schedule", financialRows),
      section("Complaint History", [
        line("Complaint date", data.complaintDate, "Complaint date has not yet been recorded"),
        line("Supplier response", data.supplierResponse, "Supplier response has not yet been recorded"),
        line("Final response or deadlock", data.finalResponseDate || data.deadlockDate, "Final response or deadlock date has not yet been recorded"),
        line("Current stage", data.currentStage, "Current stage has not yet been recorded")
      ]),
      analysis.timeline.events.length && section("Energy Timeline", timelineRows.concat(analysis.timeline.warnings.map((warning) => `Timeline warning: ${warning}`))),
      section("Requested Outcome", [
        bullets(data.requestedOutcomes, "No requested outcome has been selected yet."),
        value(data.preferredOutcome, "")
      ]),
      section("Evidence Position", [
        line("Evidence position", analysis.evidencePosition),
        analysis.completeness.explanation
      ]),
      section("Evidence Checklist", bullets(analysis.evidence, "No evidence recommendations are available.")),
      analysis.completeness.missing.length && section("Missing Evidence", bullets(analysis.completeness.missing, "No missing evidence has been identified.")),
      section("Complaint Letter", buildComplaintLetter(data, analysis)),
      section("Smart Submission", [
        analysis.smartSubmission.message,
        "",
        table(analysis.smartSubmission.rows)
      ]),
      section("Before You Submit", [
        "Review every factual entry against the documents you hold.",
        "Attach the relevant bills, meter readings, payment records and correspondence.",
        "Make sure the correct supplier or organisation is selected.",
        "Quaerens does not submit complaints automatically."
      ]),
      section("Official Resources", [
        ...officialResourceLines(),
        "Check the supplier's current complaint page, any relevant Ofgem guidance and Energy Ombudsman eligibility before submission."
      ]),
      section("Self-Service Disclaimer", [
        "This pack organises account records, bills, payments and correspondence.",
        "It does not guarantee compensation, a refund, bill correction, Ombudsman acceptance or any particular outcome.",
        analysis.jurisdictionWarning || "No jurisdiction warning has been triggered by the current answers.",
        analysis.urgent ? "Urgent warning: this pack is not an emergency service and does not create court or enforcement documents." : "No urgent safety or court boundary has been triggered by the current answers."
      ])
    ];

    return sections.filter(Boolean);
  }

  function build(data) {
    return packSections(data || {}).join("\n");
  }

  function buildTxt(data) {
    const full = build(data || {});
    const analysis = analysisEngine.analyse(data || {});
    const shortComplaint = [
      "ENERGY SUPPLIER COMPLAINT",
      line("Supplier", data.supplierName, "Supplier not recorded"),
      line("Issue", analysis.issueType),
      value(data.issueSummary, "Issue summary not yet recorded."),
      "Requested outcome:",
      bullets(data.requestedOutcomes, "Requested outcome not yet selected.")
    ].join("\n");
    const completeSummary = [
      "COMPLETE SUMMARY",
      table(analysis.healthSummary.rows),
      "",
      "Financial position",
      table(analysis.financialPosition.rows),
      "",
      "Smart Submission",
      table(analysis.smartSubmission.rows)
    ].join("\n");
    return { shortComplaint, fullComplaint: full, completeSummary };
  }

  function buildCopy(data) {
    const txt = buildTxt(data || {});
    const analysis = analysisEngine.analyse(data || {});
    const supplier = value(data.supplierName, "Energy Supplier");
    const email = [
      `Dear ${supplier},`,
      "",
      "Please treat the following as my energy supplier complaint.",
      "",
      txt.shortComplaint,
      "",
      "Please review the account records, evidence and requested outcome set out above.",
      "",
      "Yours faithfully,",
      value(data.customerName || data.consumerName, "Customer")
    ].join("\n");
    const supplierPortal = [
      `Issue: ${analysis.issueType}`,
      `Supplier: ${supplier}`,
      `Requested outcome: ${value(data.requestedOutcomes, "Please review and respond to the complaint.")}`,
      "",
      txt.fullComplaint
    ].join("\n");
    const energyOmbudsmanForm = [
      "Energy Ombudsman form summary",
      "",
      txt.completeSummary
    ].join("\n");
    const complaintPortal = [
      "Complaint portal summary",
      "",
      txt.fullComplaint
    ].join("\n");
    return {
      email,
      supplierPortal,
      energyOmbudsmanForm,
      complaintPortal
    };
  }

  const architectures = {
    pdf: {
      status: "Prepared",
      style: "Quaerens premium blue cover with pack branding, Evidence Engine, pack reference, generated date, page numbers, required sections and footer.",
      sections: ["Energy Account Health Summary", "Switching Analysis", "Billing Analysis", "Financial Schedule", "Timeline", "Evidence Position", "Complaint Letter", "Requested Outcome", "Smart Submission", "Official Resources"]
    },
    word: {
      status: "Prepared",
      supports: ["Headings", "Complaint Letter", "Timeline", "Financial Schedule", "Evidence Schedule", "Requested Outcome", "Account Summary", "Pack reference", "Generated date", "Editable tables"]
    },
    txt: {
      status: "Prepared",
      supports: ["Short complaint", "Full complaint", "Complete summary", "No HTML"]
    },
    copy: {
      status: "Prepared",
      supports: ["Email", "Supplier portal", "Energy Ombudsman forms", "Complaint portals", "No HTML"]
    },
    print: {
      status: "Prepared",
      hide: ["Navigation", "Buttons", "Marketing"],
      retain: ["Complaint Pack", "Timeline", "Financial Schedule", "Evidence", "Complaint Letter", "Requested Outcome", "Pack Reference", "Generated Date"]
    }
  };

  function status(data) {
    const analysis = analysisEngine.analyse(data || {});
    return [
      analysis.completeness.status,
      analysis.issueType,
      analysis.evidencePosition,
      analysis.documentType
    ];
  }

  return { build, buildTxt, buildCopy, packSections, status, architectures };
});

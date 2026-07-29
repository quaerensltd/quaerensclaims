(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(
    require("./energy.config"),
    require("./energy.analysis"),
    require("./energy.documents"),
    require("../../platform-services/qcms/qcms.case-summary"),
    require("../../platform-services/qcms/qcms.config"),
    require("../../platform-services/qcms/qcms.recommendation"),
    require("../../platform-services/qcms/qcms.validation")
  );
  else root.QCBFEnergyQCMSAdapter = factory(
    root.QCBFEnergyConfig,
    root.QCBFEnergyAnalysis,
    root.QCBFEnergyDocuments,
    root.QuaerensQCMSCaseSummary,
    root.QuaerensQCMSConfig,
    root.QuaerensQCMSRecommendation,
    root.QuaerensQCMSValidation
  );
})(typeof self !== "undefined" ? self : this, function (config, analysisEngine, docs, qcmsCase, qcmsConfig, qcmsRecommendation, qcmsValidation) {
  const INTEGRATION_VERSION = "1.1.0-rc.1";
  const STORAGE_KEY = "qcms-energy-reference-handoff";
  const SOURCE_URL = "https://www.quaerens.co.uk/energy-switch.html";
  const PRIVACY_NOTICE = "Your Complaint Pack and Case Summary currently remain stored locally in your browser.\nExploring the Quaerens Complaint Management Service™ does not send your information to Quaerens.\nNothing will be transferred unless you later give clear permission during the instruction process.";

  function arr(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function clean(value) {
    return String(value || "")
      .replace(/\bon[a-z]+\s*=/gi, "event-attribute-removed=")
      .replace(/javascript\s*:/gi, "javascript-removed:")
      .replace(/[<>]/g, function (char) { return char === "<" ? "‹" : "›"; })
      .replace(/\u0000/g, "")
      .trim();
  }

  function escapeHtml(value) {
    return clean(value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char];
    });
  }

  function value(data, names, fallback) {
    for (const name of names) {
      const current = data && data[name];
      if (Array.isArray(current) && current.length) return current.map(clean).filter(Boolean).join(", ");
      if (current !== undefined && current !== null && String(current).trim()) return clean(current);
    }
    return fallback || "";
  }

  function moneyToPence(input) {
    const number = Number(String(input || "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(number) ? Math.round(number * 100) : null;
  }

  function formatPounds(pence) {
    if (pence === null || pence === undefined || !Number.isFinite(Number(pence))) return "Not recorded";
    return "£" + (Number(pence) / 100).toFixed(2);
  }

  function simpleHash(input) {
    const text = JSON.stringify(input || {});
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    return Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 8);
  }

  function savedDraftId(data) {
    return clean(data && data.packReference) || "QE-DRAFT-" + simpleHash(data);
  }

  function caseId(data) {
    return "QCMS-ENERGY-" + simpleHash({
      draft: savedDraftId(data),
      supplier: value(data, ["supplierName"], ""),
      issue: value(data, ["issueSummary", "problemSummary"], "")
    });
  }

  function dateFact(label, date, body) {
    return date ? { date: clean(date), event: label, description: clean(body || label) } : null;
  }

  const issueMap = [
    [/switch|transfer|erroneous/i, "Switching or transfer problem"],
    [/bill|tariff|charge|estimate|statement/i, "Billing or tariff dispute"],
    [/meter|smart|reading|prepay/i, "Meter or smart meter issue"],
    [/direct debit|payment|debit|arrears|debt/i, "Payments, direct debit or arrears issue"],
    [/credit|refund|final bill/i, "Credit, refund or final bill issue"],
    [/complaint|ombudsman|deadlock|response/i, "Complaint handling or escalation issue"],
    [/safety|disconnect|warrant|court|emergency/i, "Urgent or specialist energy issue"]
  ];

  function issueLabels(data) {
    const raw = arr(data.issueGroups)
      .concat(arr(data.whatHappened))
      .concat([data.issueSummary, data.problemSummary, data.financialSummary])
      .map(clean)
      .filter(Boolean);
    const text = raw.join(" ");
    const labels = issueMap.filter(function (entry) { return entry[0].test(text); }).map(function (entry) { return entry[1]; });
    if (!labels.length && text) labels.push("Energy supplier complaint");
    if (!labels.length) labels.push("Energy supplier issue to review");
    return Array.from(new Set(labels));
  }

  function makeChronology(data, analysis) {
    const rows = [
      dateFact("Issue first noticed", data.issueStartDate, data.issueSummary || data.problemSummary),
      dateFact("Switch requested", data.switchRequestedDate, "Switch or supplier change was requested."),
      dateFact("Switch completed", data.switchCompletedDate, "Switch or supplier change was completed."),
      dateFact("Bill or statement received", data.billDate, "Relevant energy bill, statement or account entry was received."),
      dateFact("Refund requested", data.refundRequestDate, "Refund, credit or account correction was requested."),
      dateFact("Refund received", data.refundReceivedDate, "Refund or credit was recorded as received."),
      dateFact("Complaint raised", data.complaintDate, "Complaint was raised with the supplier or organisation."),
      dateFact("Final response or deadlock", data.finalResponseDate || data.deadlockDate, "Final response, deadlock letter or escalation position was recorded."),
      dateFact("Ombudsman contact", data.ombudsmanDate, "Ombudsman or external escalation date recorded.")
    ].filter(Boolean);
    const analysed = analysis && analysis.timeline && analysis.timeline.events ? analysis.timeline.events : [];
    analysed.forEach(function (event) {
      if (!rows.some(function (row) { return row.date === event.date && row.event === event.event; })) {
        rows.push({ date: clean(event.date), event: clean(event.event), description: clean(event.description) });
      }
    });
    return rows.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
  }

  function evidenceLabel(item) {
    const labels = {
      bill: "Energy bill or statement",
      contract: "Supply contract or tariff documents",
      meter: "Meter readings or smart meter records",
      complaint: "Complaint correspondence",
      refund: "Refund or credit correspondence",
      switch: "Switching correspondence",
      directDebit: "Direct debit or account payment records",
      photos: "Photographs or screenshots",
      ombudsman: "Energy Ombudsman correspondence"
    };
    return labels[item] || clean(item).replace(/[-_]+/g, " ").replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  function makeEvidence(data, analysis, labels) {
    const selected = arr(data.evidence).map(evidenceLabel).filter(Boolean);
    const recommended = arr(analysis && analysis.evidence).map(clean).filter(Boolean);
    const complex = labels.length > 1 || /ombudsman|deadlock|court|warrant|disconnect|arrears|multiple/i.test([data.currentStage, data.issueSummary, data.financialSummary].join(" "));
    const maxItems = complex ? 10 : 4;
    const combined = Array.from(new Set(selected.concat(recommended))).slice(0, maxItems);
    const availability = qcmsConfig.EVIDENCE_STATUSES.AVAILABILITY;
    const requirement = qcmsConfig.EVIDENCE_STATUSES.REQUIREMENT;
    return combined.map(function (label) {
      const available = selected.includes(label);
      return {
        label: label,
        category: /bill|tariff|meter|direct debit|payment|refund|credit/i.test(label) ? "Financial and account evidence" : "Complaint and correspondence evidence",
        requirementStatus: available ? requirement.RECOMMENDED : requirement.OPTIONAL,
        availabilityStatus: available ? availability.AVAILABLE : availability.UNCLEAR,
        notes: available ? "Recorded in the Energy builder by the Platform User." : "May help if available."
      };
    });
  }

  function makeFinancialPosition(data, analysis, labels) {
    const disputed = moneyToPence(data.disputedAmount);
    const extra = moneyToPence(data.extraCosts);
    const refund = moneyToPence(data.requestedRefund) || moneyToPence(data.creditBalance);
    const hasRows = analysis && analysis.financialPosition && Array.isArray(analysis.financialPosition.entries) && analysis.financialPosition.entries.length > 2;
    return {
      currency: clean(data.currency) || "GBP",
      disputedValuePence: disputed,
      documentedLossPence: extra,
      refundRequestedPence: refund,
      hasFinancialReconstructionNeed: labels.length > 1 && (hasRows || /reconstruct|multiple bills|several bills|account history|timeline/i.test(clean(data.financialSummary))),
      notes: [
        disputed !== null ? "Disputed amount: " + formatPounds(disputed) : "Disputed amount not recorded",
        extra !== null ? "Documented additional costs: " + formatPounds(extra) : "Additional costs not recorded",
        refund !== null ? "Refund or credit requested: " + formatPounds(refund) : "Refund position not recorded",
        clean(data.financialSummary)
      ].filter(Boolean).join(" | ")
    };
  }

  function makeGeneratedDocuments() {
    return [
      { title: "Energy Supplier Complaint Pack™", type: "complete pack", format: "PDF / RTF / TXT / copy / print", status: "available locally" },
      { title: "Complaint letter", type: "letter", format: "editable text", status: "available locally" },
      { title: "Energy account health summary", type: "analysis", format: "pack section", status: "available locally" },
      { title: "Financial schedule", type: "schedule", format: "pack section", status: "available locally" },
      { title: "Energy timeline", type: "chronology", format: "pack section", status: "available locally" },
      { title: "Evidence checklist", type: "checklist", format: "pack section", status: "available locally" },
      { title: "Smart Submission", type: "readiness review", format: "pack section", status: "available locally" }
    ];
  }

  function makeOfficialRoute(data, analysis) {
    const route = analysis && analysis.routes && analysis.routes[0] ? analysis.routes[0] : {};
    const supplierKnown = !!value(data, ["supplierName"], "");
    const routeName = clean(route.organisation) || (supplierKnown ? value(data, ["supplierName"], "Energy supplier") : "Relevant energy supplier");
    const routeUrl = clean(route.officialUrl) || "https://www.energyombudsman.org/";
    return {
      routeName: routeName,
      routeUrl: routeUrl,
      routeType: /ombudsman/i.test(routeName + " " + routeUrl) ? "ombudsman" : "supplier complaint",
      requiresPortal: /portal|form|ombudsman/i.test(routeName + " " + routeUrl),
      verificationStatus: supplierKnown ? "verified" : "requires verification"
    };
  }

  function makeRiskFlags(data, analysis) {
    const text = [data.currentStage, data.issueSummary, data.problemSummary, data.financialSummary, data.timelineNotes].join(" ");
    const flags = [];
    if (/court|warrant|legal proceedings|jurisdiction/i.test(text)) flags.push("manual scope review");
    if (/disconnect|disconnection|safety|emergency/i.test(text)) flags.push("urgent energy risk");
    if (/debt|arrears|collection|bailiff/i.test(text)) flags.push("debt collection present");
    if (analysis && analysis.jurisdictionWarning) flags.push("route requires verification");
    return flags;
  }

  function makeVulnerabilityIndicators(data) {
    const text = [data.issueSummary, data.problemSummary, data.timelineNotes, data.customerType, data.accessibilityNeeds].join(" ");
    return /vulnerable|priority|medical|disabled|disability|elderly|child|oxygen|health/i.test(text)
      ? ["Potential vulnerability or priority-services issue recorded"]
      : [];
  }

  function buildEnergyCaseSummary(data) {
    data = data || {};
    const analysis = analysisEngine.analyse(data);
    const labels = issueLabels(data);
    const chronology = makeChronology(data, analysis);
    const evidenceItems = makeEvidence(data, analysis, labels);
    const missing = arr(analysis.completeness && analysis.completeness.missing)
      .concat(evidenceItems.filter(function (item) { return item.availabilityStatus !== qcmsConfig.EVIDENCE_STATUSES.AVAILABILITY.AVAILABLE; }).map(function (item) { return item.label; }))
      .map(clean)
      .filter(Boolean);
    const summary = qcmsCase.createEmptyCaseSummary({
      caseId: caseId(data),
      sourceBuilder: "energy",
      sourceBuilderVersion: config.builderVersion,
      complaintCategory: "Utilities",
      complaintType: "Energy Supplier Complaint",
      complaintTitle: "Energy Supplier Complaint Pack™",
      platformUser: {
        role: "Platform User",
        fullName: value(data, ["customerName", "consumerName", "fullName"], null),
        email: value(data, ["customerEmail", "email"], null),
        telephone: value(data, ["customerPhone", "phone"], null),
        address: value(data, ["propertyAddress", "address"], null),
        postcode: value(data, ["postcode"], null)
      },
      contactDetails: { preferredContactMethod: value(data, ["preferredContactMethod"], "Not recorded") },
      businessOrOrganisation: value(data, ["supplierName"], null),
      respondent: {
        name: value(data, ["supplierName"], "Relevant energy supplier"),
        previousSupplier: value(data, ["previousSupplier"], ""),
        accountNumber: value(data, ["accountNumber"], ""),
        fuelType: value(data, ["fuelType", "energyType"], ""),
        tariffName: value(data, ["tariffName"], ""),
        meterType: value(data, ["meterType"], ""),
        meterSerial: value(data, ["meterSerial"], "")
      },
      complaintIssues: labels.map(function (label) {
        return { title: label, description: value(data, ["issueSummary", "problemSummary"], label), status: value(data, ["currentStage"], "Not yet submitted") };
      }),
      complaintSummary: value(data, ["issueSummary", "problemSummary"], "Energy supplier complaint pack prepared locally."),
      keyFacts: [
        "Supplier: " + value(data, ["supplierName"], "Not recorded"),
        "Property: " + [value(data, ["propertyAddress"], ""), value(data, ["postcode"], "")].filter(Boolean).join(", "),
        "Account status: " + value(data, ["accountStatus", "currentStage"], "Not recorded"),
        "Fuel type: " + value(data, ["fuelType", "energyType"], "Not recorded"),
        "Pack status: " + clean(analysis.completeness && analysis.completeness.status)
      ].filter(function (item) { return !/undefined|null$/i.test(item); }),
      chronology: chronology,
      financialPosition: makeFinancialPosition(data, analysis, labels),
      requestedOutcomes: arr(data.requestedOutcomes).concat(value(data, ["preferredOutcome"], "")).map(clean).filter(Boolean),
      evidenceSummary: clean(analysis.evidencePosition || "Evidence position to be reviewed."),
      evidenceItems: evidenceItems,
      missingEvidence: Array.from(new Set(missing)).slice(0, 8),
      generatedDocuments: makeGeneratedDocuments(),
      supportingFiles: [],
      complaintStatus: analysis.completeness && analysis.completeness.status === "Ready to Submit" ? "Initial Complaint Prepared" : "Not Yet Submitted",
      submissionStatus: "Not Submitted",
      officialRoute: makeOfficialRoute(data, analysis),
      escalationPosition: value(data, ["currentStage"], "Supplier complaint or pre-complaint stage"),
      vulnerabilityIndicators: makeVulnerabilityIndicators(data),
      riskFlags: makeRiskFlags(data, analysis),
      consentStatus: qcmsConfig.CONSENT_STATES.NOT_REQUESTED,
      transferStatus: qcmsConfig.TRANSFER_STATES.LOCAL_ONLY,
      metadata: {
        sourceUrl: SOURCE_URL,
        completionDate: new Date().toISOString(),
        savedDraftId: savedDraftId(data),
        complaintRoute: value(data, ["currentStage"], "Energy supplier route"),
        architectureVersion: qcmsConfig.ARCHITECTURE_VERSION,
        localOnly: true,
        integrationVersion: INTEGRATION_VERSION,
        proposedSourceBuilderVersion: "Energy Builder 1.1.0-rc.1"
      }
    });
    return qcmsCase.normaliseCaseSummary(summary);
  }

  function createEnergyQCMSHandoff(data) {
    const caseSummary = buildEnergyCaseSummary(data);
    const validation = qcmsValidation.validateCaseSummary(caseSummary);
    const recommendation = qcmsRecommendation.recommendQCMSService(caseSummary);
    return {
      caseId: caseSummary.caseId,
      sourceBuilder: "energy",
      sourceDraftId: caseSummary.metadata.savedDraftId,
      caseSummary: caseSummary,
      recommendation: recommendation,
      validation: validation,
      createdAt: caseSummary.createdAt,
      updatedAt: new Date().toISOString(),
      consentStatus: qcmsConfig.CONSENT_STATES.NOT_REQUESTED,
      transferStatus: qcmsConfig.TRANSFER_STATES.LOCAL_ONLY,
      instructionStatus: qcmsConfig.INSTRUCTION_STATES.NOT_STARTED
    };
  }

  function saveEnergyQCMSHandoff(data) {
    const handoff = createEnergyQCMSHandoff(data);
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(handoff));
    return handoff;
  }

  function readEnergyQCMSHandoff() {
    if (typeof localStorage === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { return null; }
  }

  function renderListHtml(items) {
    return items && items.length
      ? "<ul>" + items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>"
      : "<p class=\"small\">None recorded yet.</p>";
  }

  function renderEnergyQCMSCompletion(data) {
    const analysis = analysisEngine.analyse(data || {});
    if (!analysis.completeness || analysis.completeness.status !== "Ready to Submit") {
      return [
        "<section class=\"card\" data-energy-qcms-panel>",
        "<div class=\"eyebrow\">Optional managed support</div>",
        "<h3>Complete the free Energy Complaint Pack first</h3>",
        "<p>Your free DIY route remains available. Once the pack is complete, you can download it and submit it yourself free of charge, or explore a local-only QCMS preview.</p>",
        "<p class=\"small\">" + escapeHtml(PRIVACY_NOTICE).replace(/\n/g, "<br>") + "</p>",
        "</section>"
      ].join("");
    }
    const handoff = createEnergyQCMSHandoff(data);
    const rec = handoff.recommendation;
    const summary = handoff.caseSummary;
    const fee = rec && rec.indicativeFee ? rec.indicativeFee : "No indicative fee";
    const rows = [
      ["Case Summary", summary.complaintTitle],
      ["Energy health", (analysis.healthSummary.rows || []).map(function (row) { return clean(row.label || row[0]) + ": " + clean(row.value || row[1]); }).slice(0, 3).join(" | ")],
      ["Evidence completeness", clean(rec.evidenceCompleteness && rec.evidenceCompleteness.status) || clean(analysis.evidencePosition)],
      ["Readiness", clean(rec.complaintReadiness && rec.complaintReadiness.status) || clean(analysis.completeness.status)],
      ["Complexity", clean(rec.complexity) || "Not assessed"],
      ["Estimated admin", clean(rec.administrationEstimate && rec.administrationEstimate.label) || clean(rec.administrationEstimate && rec.administrationEstimate.minutes ? rec.administrationEstimate.minutes + " minutes" : "") || "Not assessed"],
      ["Recommended service", clean(rec.serviceName) || clean(rec.serviceCode)],
      ["Indicative fee", fee],
      ["Official route", clean(summary.officialRoute.routeName) + " (" + clean(summary.officialRoute.verificationStatus) + ")"]
    ];
    return [
      "<section class=\"card qcms-energy-panel\" data-energy-qcms-panel>",
      "<div class=\"eyebrow\">Optional managed support</div>",
      "<h3>Your Complaint Pack is complete</h3>",
      "<p><strong>Your Complaint Pack is complete. You can download it and submit it yourself free of charge.</strong></p>",
      "<table class=\"energy-table readiness-table\"><tbody>" + rows.map(function (row) { return "<tr><th>" + escapeHtml(row[0]) + "</th><td>" + escapeHtml(row[1]) + "</td></tr>"; }).join("") + "</tbody></table>",
      "<div class=\"grid three\"><article class=\"card\"><h4>Why this service level?</h4>" + renderListHtml(rec.primaryReasons && rec.primaryReasons.length ? rec.primaryReasons : rec.reasonCodes) + "</article><article class=\"card\"><h4>Missing or useful information</h4>" + renderListHtml(summary.missingEvidence) + "</article><article class=\"card\"><h4>Scope and limits</h4><p>QCMS can help organise and manage the complaint process. It does not guarantee a refund, credit, compensation or supplier outcome.</p><p>Specialist or regulated support may still be needed for some matters.</p></article></div>",
      "<div class=\"notice\"><strong>DIY or QCMS?</strong><br>You can continue with the free DIY route and submit the pack yourself. QCMS is an optional managed support route to explore after your free pack is ready.</div>",
      "<p class=\"small\">" + escapeHtml(PRIVACY_NOTICE).replace(/\n/g, "<br>") + "</p>",
      "<div class=\"builder-actions\"><button class=\"button secondary\" type=\"button\" data-energy-qcms-diy>Continue with Free DIY</button><button class=\"button\" type=\"button\" data-energy-qcms-explore aria-expanded=\"false\">Explore QCMS</button></div>",
      "<div class=\"notice\" data-energy-qcms-instruction-preview hidden><strong>QCMS instruction architecture preview</strong><br>Case Summary prepared locally. Consent status: NOT_REQUESTED. Transfer status: LOCAL_ONLY. Instruction status: NOT_STARTED. No information has been sent to Quaerens.</div>",
      "</section>"
    ].join("");
  }

  return {
    INTEGRATION_VERSION: INTEGRATION_VERSION,
    STORAGE_KEY: STORAGE_KEY,
    PRIVACY_NOTICE: PRIVACY_NOTICE,
    buildEnergyCaseSummary: buildEnergyCaseSummary,
    createEnergyQCMSHandoff: createEnergyQCMSHandoff,
    saveEnergyQCMSHandoff: saveEnergyQCMSHandoff,
    readEnergyQCMSHandoff: readEnergyQCMSHandoff,
    renderEnergyQCMSCompletion: renderEnergyQCMSCompletion
  };
});

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./energy.config"), require("./energy.evidence"), require("./energy.resources"));
  else root.QCBFEnergyAnalysis = factory(root.QCBFEnergyConfig, root.QCBFEnergyEvidence, root.QCBFEnergyResources);
})(typeof self !== "undefined" ? self : this, function (config, evidence, resources) {
  function arr(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  }

  function pick(data, names) {
    for (const name of names) {
      const value = data[name];
      if (Array.isArray(value) && value.length) return value.join(", ");
      if (value) return value;
    }
    return "";
  }

  function text(data) {
    return arr(data.whatHappened).concat(
      data.issueGroups || [],
      data.urgentNotes || "",
      data.problemSummary || "",
      data.issueSummary || "",
      data.energyType || "",
      data.fuelType || "",
      data.meterType || "",
      data.paymentMethod || "",
      data.currentStage || "",
      data.financialSummary || "",
      data.timelineNotes || ""
    ).join(" ").toLowerCase();
  }

  function has(data, pattern) {
    return pattern.test(text(data));
  }

  function isUrgent(data) {
    return /gas leak|smell of gas|sparking|overheating|exposed wire|fire|carbon monoxide|disconnected|court|letter before claim|enforcement|warrant|forced-entry|unsafe|vulnerable person/.test(text(data));
  }

  function issueType(data) {
    const t = text(data);
    if (isUrgent(data)) return "Urgent safety, court or enforcement boundary";
    if (/without permission|wrong supplier|erroneous|transfer/.test(t)) return "Erroneous transfer review";
    if (/both suppliers|old supplier is still billing|duplicate account|duplicate supplier|duplicate bill|duplicate billing/.test(t)) return "Duplicate billing review";
    if (/switch/.test(t)) return "Supplier switching complaint";
    if (/back-billing|catch-up|historical/.test(t)) return "Historical billing or back-billing review";
    if (/direct debit|payment|paid|refund|credit balance|not credited|account was not credited/.test(t)) return "Payment, Direct Debit or credit balance complaint";
    if (/final bill|moved|moving|moved out|occupier|another person|account closed/.test(t)) return "Moving home or final account complaint";
    if (/estimated bill|estimated reading|estimated readings|bill is based on estimated|bill|balance/.test(t)) return "Billing dispute";
    if (/smart meter|in-home display|meter serial|wrong meter|opening reading|closing reading|meter readings|meter reading|ignored my meter/.test(t)) return "Metering and smart-meter complaint";
    if (/tariff|unit rate|standing charge|exit fee|discount/.test(t)) return "Tariff or contract complaint";
    if (/prepayment|top up|priority|vulnerab|accessible/.test(t)) return "Prepayment or vulnerability support complaint";
    if (/deadlock|ombudsman|ignored my complaint|escalate/.test(t)) return "Complaint handling and escalation review";
    return "Energy supplier complaint review";
  }

  function documentType(data) {
    const issue = issueType(data);
    if (/Urgent/.test(issue)) return "Urgent safety or court facts summary only";
    if (/Erroneous/.test(issue)) return "Erroneous transfer complaint";
    if (/Duplicate/.test(issue)) return "Duplicate billing complaint";
    if (/switching/.test(issue)) return "Delayed or failed switch complaint";
    if (/Payment|Direct Debit|credit/.test(issue)) return "Direct Debit, payment or credit-balance complaint";
    if (/Meter/.test(issue)) return "Meter-reading, wrong-meter or smart-meter complaint";
    if (/Moving/.test(issue)) return "Moving-home account or final-bill complaint";
    if (/Tariff/.test(issue)) return "Tariff complaint";
    if (/Historical/.test(issue)) return "Historical billing or back-billing review request";
    if (/Prepayment|vulnerability/.test(issue)) return "Prepayment or vulnerability-support complaint";
    if (/Complaint handling/.test(issue)) return "Complaint escalation letter";
    if (/Billing/.test(issue)) return "Incorrect bill complaint";
    return "Account and billing information request";
  }

  function jurisdictionWarning(data) {
    if (data.jurisdiction === "Northern Ireland") {
      return "Northern Ireland has different energy regulation and complaint arrangements. This pack records the facts and flags route verification before use.";
    }
    if (data.accountResidential === "Business" || data.customerType === "Microbusiness or business account") {
      return "Business-energy complaints may follow different complaint arrangements. The pack can organise a factual summary, but route assumptions are limited.";
    }
    if (/heat network|lpg|oil|communal/i.test(data.energyType || data.customerType || "")) {
      return "This energy type may not follow the same route as licensed domestic mains gas or electricity. Use the pack as a factual complaint summary until the route is verified.";
    }
    if (!data.jurisdiction || data.jurisdiction === "Unsure") {
      return "The applicable regulator, complaint route and supplier obligations may depend on the property location and account type.";
    }
    return "";
  }

  function money(value) {
    if (value === undefined || value === null || value === "") return "";
    const cleaned = String(value).replace(/[^\d.,-]/g, "").replace(",", ".");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : "";
  }

  function formatAmount(amount, currency) {
    if (amount === "" || amount === undefined || amount === null) return "Information required";
    const prefix = currency === "EUR" ? "EUR " : currency === "USD" ? "USD " : currency === "Other" ? "" : "GBP ";
    return `${prefix}${Number(amount).toFixed(2)}`;
  }

  function parseEntries(data, field) {
    if (!data[field]) return [];
    if (Array.isArray(data[field])) return data[field];
    try {
      const parsed = JSON.parse(data[field]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function financialSchedule(data) {
    const entries = parseEntries(data, "financialSchedule");
    const currency = data.currency || "GBP";
    [
      ["disputedAmount", "Disputed Items", "Recorded disputed amount", data.disputedAmount],
      ["creditBalance", "Credits", "Recorded credit balance", data.creditBalance],
      ["extraCosts", "Additional Losses", "Recorded additional cost or loss", data.extraCosts],
      ["currentDirectDebit", "Payments", "Current Direct Debit", data.currentDirectDebit],
      ["recordedAccountBalance", "Account Charges", "Recorded account balance", data.recordedAccountBalance],
      ["requestedRefund", "Credits", "Requested refund", data.requestedRefund],
      ["refundsReceived", "Credits", "Refunds received", data.refundsReceived]
    ].forEach(([field, category, description, amount]) => {
      const parsed = money(amount);
      if (parsed !== "") {
        entries.push({
          date: data[`${field}Date`] || "",
          category,
          description,
          supplier: data.supplierName || "",
          amount: parsed,
          currency,
          evidence: "",
          refunded: field === "refundsReceived" ? "Yes" : "No",
          disputed: /disputed|extra|balance/i.test(field) ? "Yes" : "No",
          notes: ""
        });
      }
    });
    const totalsByCurrency = {};
    entries.forEach((entry) => {
      const entryCurrency = entry.currency || currency;
      if (!totalsByCurrency[entryCurrency]) totalsByCurrency[entryCurrency] = {};
      const category = entry.category || "Other";
      totalsByCurrency[entryCurrency][category] = (totalsByCurrency[entryCurrency][category] || 0) + (money(entry.amount) || 0);
    });
    return { entries, totalsByCurrency };
  }

  function financialPosition(data) {
    const schedule = financialSchedule(data);
    function amount(field) {
      return formatAmount(money(data[field]), data.currency || "GBP");
    }
    return {
      rows: [
        ["Bills Issued", data.billsIssued || data.recordedAccountBalance ? amount("recordedAccountBalance") : "Information required"],
        ["Payments Made", data.paymentsMade || "Information required"],
        ["Credits Held", amount("creditBalance")],
        ["Refunds Received", amount("refundsReceived")],
        ["Refunds Outstanding", data.refundsOutstanding || amount("requestedRefund")],
        ["Disputed Amount", amount("disputedAmount")],
        ["Current Direct Debit", amount("currentDirectDebit")],
        ["Recorded Account Balance", amount("recordedAccountBalance")],
        ["Potential Credit Balance", amount("creditBalance")],
        ["Requested Refund", amount("requestedRefund")]
      ],
      entries: schedule.entries,
      totalsByCurrency: schedule.totalsByCurrency
    };
  }

  function energyHealthSummary(data) {
    const result = analyseLite(data);
    const rows = [];
    function add(label, value, relevant) {
      if (relevant === false) return;
      rows.push({ label, value: value || "Information required" });
    }
    add("Supplier", pick(data, ["supplierName"]));
    add("Fuel", pick(data, ["fuelType", "energyType"]));
    add("Property", pick(data, ["postcode", "jurisdiction", "propertyCountry"]));
    add("Account Status", pick(data, ["accountStatus", "currentStage"]) || (has(data, /moved|closed|final bill/) ? "Closed or closing account issue" : ""));
    add("Switch Status", pick(data, ["switchStatus"]) || (has(data, /erroneous|without permission/) ? "Erroneous transfer concern" : has(data, /switch/) ? "Switching issue recorded" : ""), has(data, /switch|transfer|old supplier|new supplier/));
    add("Tariff", pick(data, ["tariffName"]) || (has(data, /tariff|unit rate|standing charge/) ? "Tariff issue recorded" : ""), data.tariffName || has(data, /tariff|unit rate|standing charge/));
    add("Billing Position", has(data, /estimated/) ? "Estimated billing concern" : has(data, /historical|back-billing|catch-up/) ? "Historical billing review" : has(data, /bill|balance/) ? "Disputed billing position" : "", has(data, /bill|balance|reading|historical|back-billing/));
    add("Meter Position", pick(data, ["meterType", "meterSerial"]) || (has(data, /meter|reading/) ? "Meter issue recorded" : ""), data.meterType || data.meterSerial || has(data, /meter|reading/));
    add("Smart Meter Status", has(data, /smart meter|in-home display/) ? "Smart meter issue recorded" : "", has(data, /smart meter|in-home display/));
    add("Direct Debit Position", pick(data, ["paymentMethod"]) || (has(data, /direct debit|payment/) ? "Payment issue recorded" : ""), data.paymentMethod || has(data, /direct debit|payment/));
    add("Credit Balance", data.creditBalance ? formatAmount(money(data.creditBalance), data.currency || "GBP") : "", data.creditBalance || has(data, /credit|refund/));
    add("Refund Position", data.requestedRefund ? "Requested refund recorded" : has(data, /refund/) ? "Refund outstanding or under review" : "", data.requestedRefund || has(data, /refund/));
    add("Complaint Stage", pick(data, ["currentStage"]) || (data.complaintDate ? "Complaint submitted" : ""));
    add("Evidence Position", result.evidencePosition);
    add("Pack Status", result.completeness.status);
    return { rows };
  }

  function timelineEvents(data) {
    const events = parseEntries(data, "timelineEvents");
    [
      ["issueStartDate", "Issue started", data.issueSummary || "Issue started"],
      ["switchRequestedDate", "Switch requested", "Supplier switch requested"],
      ["switchCompletedDate", "Switch completed", "Switch completed or was expected to complete"],
      ["billDate", "Bill issued", "Relevant bill issued"],
      ["paymentDate", "Payment made", "Relevant payment made"],
      ["refundRequestDate", "Refund requested", "Refund or credit-balance request made"],
      ["refundReceivedDate", "Refund received", "Refund received"],
      ["complaintDate", "Complaint submitted", "Complaint submitted to supplier"],
      ["finalResponseDate", "Supplier response or deadlock", "Final response, deadlock or supplier reply"],
      ["deadlockDate", "Deadlock letter", "Deadlock letter received"],
      ["ombudsmanDate", "Ombudsman stage", "Ombudsman stage recorded"]
    ].forEach(([field, event, description]) => {
      if (data[field]) events.push({ date: data[field], organisation: data.supplierName || "", event, description, evidence: "", amount: "", notes: "" });
    });
    events.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    const warnings = [];
    if (data.complaintDate && data.issueStartDate && data.complaintDate < data.issueStartDate) warnings.push("Complaint date appears before the issue start date. Check the timeline before submitting.");
    if (data.finalResponseDate && data.complaintDate && data.finalResponseDate < data.complaintDate) warnings.push("Final response date appears before the complaint date. Check the timeline before submitting.");
    if (data.switchCompletedDate && data.switchRequestedDate && data.switchCompletedDate < data.switchRequestedDate) warnings.push("Switch completion date appears before the switch request date. Check the timeline before submitting.");
    return { events, warnings };
  }

  function issueSpecificMissing(data) {
    const t = text(data);
    const missing = [];
    function need(condition, label) {
      if (!condition) missing.push(label);
    }
    if (/switch|transfer/.test(t)) {
      need(data.supplierName, "current or relevant supplier");
      need(data.previousSupplier || data.newSupplier, "previous or new supplier");
      need(data.switchRequestedDate || data.issueStartDate, "switch request or issue date");
      need(arr(data.evidence).includes("switch"), "switch confirmation or supplier messages");
    }
    if (/bill|estimated|historical|back-billing|catch-up/.test(t)) {
      need(data.disputedAmount || data.recordedAccountBalance, "bill amount or account balance");
      need(data.tariffName || data.fuelType, "tariff or fuel details");
      need(arr(data.evidence).includes("bills"), "bill or account statement evidence");
    }
    if (/smart meter|meter|reading|in-home display/.test(t)) {
      need(data.meterType || data.meterSerial, "meter type, serial or identifier");
      need(data.issueSummary, "meter issue details");
      need(arr(data.evidence).includes("readings"), "meter reading, photo or screenshot evidence");
    }
    if (/direct debit|payment|paid|not credited/.test(t)) {
      need(data.paymentMethod, "payment method");
      need(data.financialSummary || data.paymentDate, "payment history or explanation");
      need(arr(data.evidence).includes("payments"), "bank, Direct Debit or receipt evidence");
    }
    if (/credit|refund/.test(t)) {
      need(data.creditBalance || data.requestedRefund, "credit balance or requested refund amount");
      need(data.refundRequestDate || data.complaintDate, "refund request or complaint date");
      need(arr(data.evidence).includes("bills") || arr(data.evidence).includes("complaint"), "account statement or supplier response");
    }
    return missing;
  }

  function packCompleteness(data) {
    const hasStarted = Object.keys(data || {}).some((key) => key !== "packReference" && data[key] && (!Array.isArray(data[key]) || data[key].length));
    if (!hasStarted) return { status: "Not Started", missing: [], explanation: "Start by recording the issue, supplier and account position." };
    const missing = [];
    if (!arr(data.issueGroups).length && !arr(data.whatHappened).length) missing.push("issue type");
    if (!data.supplierName) missing.push("supplier name");
    if (!data.jurisdiction && !data.propertyCountry) missing.push("property location");
    if (!data.customerName && !data.consumerName) missing.push("consumer name");
    if (!data.issueSummary && !data.problemSummary) missing.push("brief issue summary");
    if (missing.length) return { status: "Needs Key Information", missing, explanation: `Add ${missing.slice(0, 3).join(", ")} before relying on the pack.` };
    const evidenceMissing = issueSpecificMissing(data);
    if (evidenceMissing.length) return { status: "Needs Evidence", missing: evidenceMissing, explanation: `Evidence still needed: ${evidenceMissing.slice(0, 3).join(", ")}.` };
    if (!data.complaintDate && !arr(data.evidence).includes("complaint")) {
      return { status: "Ready for Review", missing: ["complaint history or supplier response"], explanation: "The core facts are recorded, but complaint history should be checked before submission." };
    }
    return { status: "Ready to Submit", missing: [], explanation: "The pack appears complete enough for a final human review before submission." };
  }

  function smartSubmission(data) {
    const completeness = packCompleteness(data);
    const position = evidence.position(data);
    const evidenceStatus = /strong|supported/i.test(position) ? "Supported" : /developing|some/i.test(position) ? "Developing" : "Limited";
    function status(condition, good, bad) {
      return condition ? good : bad;
    }
    return {
      message: "Before submitting your Complaint Pack, review the facts, attach the relevant evidence and ensure the correct supplier or organisation is selected. Quaerens does not submit complaints automatically.",
      rows: [
        ["Account Details", status(data.accountNumber || data.customerName || data.consumerName, "Complete", "Needs Information")],
        ["Supplier Details", status(data.supplierName, "Complete", "Needs Information")],
        ["Property", status(data.postcode || data.jurisdiction, "Complete", "Needs Information")],
        ["Switching Information", has(data, /switch|transfer/) ? status(data.switchRequestedDate || data.issueStartDate, "Complete", "Needs Information") : "Not Applicable"],
        ["Billing Position", has(data, /bill|balance|estimated|historical/) ? status(data.disputedAmount || data.recordedAccountBalance || data.financialSummary, "Complete", "Needs Review") : "Needs Review"],
        ["Meter Information", has(data, /meter|reading|smart/) ? status(data.meterType || data.meterSerial, "Complete", "Needs Evidence") : "Needs Evidence"],
        ["Payments & Direct Debit", has(data, /payment|direct debit|paid/) ? status(data.paymentMethod || data.financialSummary, "Complete", "Needs Evidence") : "Needs Evidence"],
        ["Credit & Refund Position", has(data, /credit|refund/) ? status(data.creditBalance || data.requestedRefund, "Complete", "Needs Information") : "Needs Information"],
        ["Complaint History", status(data.complaintDate || arr(data.evidence).includes("complaint"), "Complete", "Needs Information")],
        ["Evidence Position", evidenceStatus],
        ["Complaint Pack", completeness.status === "Ready to Submit" ? "Complete" : "Needs Review"],
        ["Official Route", data.officialRouteVerified || (resources && resources.findSupplier && resources.findSupplier(data.supplierName)) ? "Verified" : "Requires Verification"],
        ["Pack Status", completeness.status]
      ]
    };
  }

  function routeAnalysis(data) {
    const routes = resources && typeof resources.routeFor === "function" ? resources.routeFor(data || {}) : [];
    if (routes.length) {
      if (/meter|unsafe|network/i.test(text(data))) {
        routes.push({ organisation: data.networkOperator || "Network or meter operator", role: "Meter or supply safety evidence", status: "Requires Verification", officialUrl: "", limitation: "Emergency, safety or network routes should be checked before relying on the pack." });
      }
      if (isUrgent(data)) {
        routes.push({ organisation: "Emergency, court or advice route", role: "Urgent boundary", status: "Requires urgent review", officialUrl: "", limitation: "Strict deadlines or safety steps may apply outside this self-service pack." });
      }
      return routes;
    }
    const routesFallback = [];
    const supplier = data.supplierName || "Current or relevant supplier";
    routesFallback.push({ organisation: supplier, role: "Supplier complaint route", status: "Primary factual complaint route" });
    if (/switch|transfer|both suppliers|old supplier/i.test(arr(data.whatHappened).concat(data.issueGroups || []).join(" "))) {
      routesFallback.push({ organisation: data.previousSupplier || "Previous or new supplier", role: "Switching or transfer evidence", status: "Check supplier roles before submission" });
    }
    if (/meter|unsafe|network/i.test(text(data))) {
      routesFallback.push({ organisation: data.networkOperator || "Network or meter operator", role: "Meter or supply safety evidence", status: "Official route requires verification" });
    }
    if (/payment|refund|credit|direct debit/i.test(text(data))) {
      routesFallback.push({ organisation: "Payment provider", role: "Payment evidence", status: "Only relevant where payment evidence supports it" });
    }
    if (/deadlock|ignored|escalate|ombudsman/i.test(text(data))) {
      routesFallback.push({ organisation: "Energy Ombudsman", role: "Possible escalation", status: config.officialBoundary });
    }
    if (isUrgent(data)) {
      routesFallback.push({ organisation: "Emergency, court or advice route", role: "Urgent boundary", status: "Strict deadlines or safety steps may apply outside this self-service pack" });
    }
    return routesFallback;
  }

  function summaryCards(data) {
    const analysis = analyseLite(data);
    const cards = [
      ["Energy Account Health", `${data.fuelType || data.energyType || "Fuel not recorded"} | ${analysis.completeness.status}`],
      ["Supplier Roles", `${data.supplierName || "Supplier not yet recorded"}${data.previousSupplier ? " / " + data.previousSupplier : ""}`],
      ["Evidence Position", analysis.evidencePosition],
      ["Smart Submission", smartSubmission(data).rows.find((row) => row[0] === "Pack Status")[1]]
    ];
    if (/switch|transfer|both suppliers/i.test(text(data))) cards.push(["Switching Analysis", "Switching dates, supplier roles and opening or closing readings need to be compared."]);
    if (/bill|reading|meter|balance/i.test(text(data))) cards.push(["Billing and Meter Position", "Bills, tariff, meter readings and payment records should be cross-checked."]);
    if (/direct debit|payment|refund|credit/i.test(text(data))) cards.push(["Payment and Refund Position", "Payment dates, amounts and account credits need to be matched."]);
    if (/deadlock|complaint|ombudsman/i.test(text(data))) cards.push(["Complaint History", data.complaintDate ? `Complaint recorded from ${data.complaintDate}` : "Complaint date has not yet been recorded."]);
    if (isUrgent(data)) cards.push(["Urgent Boundary", "This pack is not an emergency service or court defence."]);
    return cards.map(([title, body]) => ({ title, body }));
  }

  function analyseLite(data) {
    return {
      issueType: issueType(data),
      documentType: documentType(data),
      urgent: isUrgent(data),
      jurisdictionWarning: jurisdictionWarning(data),
      completeness: packCompleteness(data),
      evidencePosition: evidence.position(data)
    };
  }

  function analyse(data) {
    const base = analyseLite(data || {});
    return Object.assign(base, {
      evidence: evidence.recommendations(data || {}),
      routes: routeAnalysis(data || {}),
      cards: summaryCards(data || {}),
      healthSummary: energyHealthSummary(data || {}),
      timeline: timelineEvents(data || {}),
      financialSchedule: financialSchedule(data || {}),
      financialPosition: financialPosition(data || {}),
      smartSubmission: smartSubmission(data || {})
    });
  }

  return {
    analyse,
    issueType,
    documentType,
    isUrgent,
    jurisdictionWarning,
    routeAnalysis,
    summaryCards,
    energyHealthSummary,
    timelineEvents,
    financialSchedule,
    financialPosition,
    packCompleteness,
    smartSubmission
  };
});

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./energy.config"), require("./energy.evidence"));
  else root.QCBFEnergyAnalysis = factory(root.QCBFEnergyConfig, root.QCBFEnergyEvidence);
})(typeof self !== "undefined" ? self : this, function (config, evidence) {
  function arr(value) {
    return Array.isArray(value) ? value : value ? [value] : [];
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
      data.financialSummary || ""
    ).join(" ").toLowerCase();
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
      return "Northern Ireland has different energy regulation and complaint arrangements. This Part 1A pack records the facts and flags route verification before use.";
    }
    if (data.accountResidential === "Business") {
      return "Business-energy complaints are outside the main domestic-consumer scope for Part 1A. The pack can still organise a factual summary, but route assumptions are limited.";
    }
    if (/heat network|lpg|oil|communal/i.test(data.energyType || "")) {
      return "This energy type may not follow the same route as licensed domestic mains gas or electricity. Use the pack as a factual complaint summary until the route is verified.";
    }
    if (!data.jurisdiction || data.jurisdiction === "Unsure") {
      return "The applicable regulator, complaint route and supplier obligations may depend on the property location and account type.";
    }
    return "";
  }

  function completeness(data) {
    const missing = config.essentialFields.filter((field) => {
      const val = data[field];
      return Array.isArray(val) ? val.length === 0 : !val;
    });
    return {
      status: missing.length ? "Needs key information" : "Ready to review",
      missing
    };
  }

  function routeAnalysis(data) {
    const routes = [];
    const supplier = data.supplierName || "Current or relevant supplier";
    routes.push({ organisation: supplier, role: "Supplier complaint route", status: "Primary factual complaint route" });
    if (/switch|transfer|both suppliers|old supplier/i.test(arr(data.whatHappened).join(" "))) {
      routes.push({ organisation: data.previousSupplier || "Previous or new supplier", role: "Switching or transfer evidence", status: "Check supplier roles before submission" });
    }
    if (/meter|unsafe|network/i.test(text(data))) {
      routes.push({ organisation: data.networkOperator || "Network or meter operator", role: "Meter or supply safety evidence", status: "Official route requires verification" });
    }
    if (/payment|refund|credit|direct debit/i.test(text(data))) {
      routes.push({ organisation: "Payment provider", role: "Payment evidence", status: "Only relevant where payment evidence supports it" });
    }
    if (/deadlock|ignored|escalate|ombudsman/i.test(text(data))) {
      routes.push({ organisation: "Energy Ombudsman", role: "Possible escalation", status: config.officialBoundary });
    }
    if (isUrgent(data)) {
      routes.push({ organisation: "Emergency, court or advice route", role: "Urgent boundary", status: "Strict deadlines or safety steps may apply outside this self-service pack" });
    }
    return routes;
  }

  function summaryCards(data) {
    const cards = [
      ["Energy Account Summary", `${data.energyType || "Energy type not yet recorded"} | ${data.accountNumber || "Account number has not yet been recorded"}`],
      ["Supplier Roles", `${data.supplierName || "Supplier not yet recorded"}${data.previousSupplier ? " / " + data.previousSupplier : ""}`],
      ["Evidence Position", evidence.position(data)],
      ["Route Analysis", routeAnalysis(data).map((r) => r.organisation).join(", ")]
    ];
    if (/switch|transfer|both suppliers/i.test(text(data))) cards.push(["Switching Analysis", "Switching dates, supplier roles and opening or closing readings need to be compared."]);
    if (/bill|reading|meter|balance/i.test(text(data))) cards.push(["Billing and Meter Position", "Bills, tariff, meter readings and payment records should be cross-checked."]);
    if (/direct debit|payment|refund|credit/i.test(text(data))) cards.push(["Payment and Refund Position", "Payment dates, amounts and account credits need to be matched."]);
    if (/deadlock|complaint|ombudsman/i.test(text(data))) cards.push(["Complaint History", data.complaintDate ? `Complaint recorded from ${data.complaintDate}` : "Complaint date has not yet been recorded."]);
    if (isUrgent(data)) cards.push(["Urgent Boundary", "This pack is not an emergency service or court defence."]);
    return cards.map(([title, body]) => ({ title, body }));
  }

  function analyse(data) {
    return {
      issueType: issueType(data),
      documentType: documentType(data),
      urgent: isUrgent(data),
      jurisdictionWarning: jurisdictionWarning(data),
      completeness: completeness(data),
      evidencePosition: evidence.position(data),
      evidence: evidence.recommendations(data),
      routes: routeAnalysis(data),
      cards: summaryCards(data)
    };
  }

  return { analyse, issueType, documentType, isUrgent, jurisdictionWarning, routeAnalysis, summaryCards };
});

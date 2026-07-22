"use strict";

(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./holiday.analysis"), require("./holiday.evidence"), require("./holiday.submission"));
    return;
  }
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.documents = factory(root.QCBFHoliday.analysis, root.QCBFHoliday.evidence, root.QCBFHoliday.submission);
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis) {
  const ISSUE_EVIDENCE = {
    "Hotel not as described": ["Original hotel listing", "Brochure or website screenshots", "Room photographs", "Videos", "Star-rating evidence", "Booking description"],
    "Accommodation not as described": ["Original hotel listing", "Brochure or website screenshots", "Room photographs", "Videos", "Star-rating evidence", "Booking description"],
    "Dirty or unhygienic accommodation": ["Room photographs", "Videos", "Complaint messages", "Representative notes", "Cleaning reports if available"],
    "Pool closed": ["Photographs of the closed pool", "Closure signs", "Hotel messages", "Website screenshots advertising the pool", "Dates the pool was unavailable", "Witness evidence"],
    "Illness or food-hygiene concern": ["Medical evidence", "Pharmacy or medical receipts", "Food photographs", "Illness diary", "Names of affected travellers", "Report made to hotel", "Report made to representative", "Travel insurance contact record"],
    "Construction noise": ["Videos with sound", "Photographs", "Working times", "Complaint records", "Evidence of prior warning or lack of warning"],
    "Transfer failure": ["Taxi receipts", "Transfer confirmation", "Call logs", "Messages", "Arrival time evidence"],
    "Major change": ["Original itinerary", "Change notification", "Messages from organiser", "Replacement offer details"],
    "Missing facility": ["Original facility listing", "Photographs", "Hotel notices", "Dates unavailable", "Complaint records"]
  };

  function today() {
    return analysis.today ? analysis.today() : new Date().toLocaleDateString("en-GB");
  }

  function esc(value) {
    return String(value || "").replace(/[&<>"']/g, match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[match]));
  }

  function has(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function text(value, fallback) {
    return has(value) ? String(value).trim() : fallback;
  }

  function list(items, fallback) {
    const clean = (items || []).filter(Boolean);
    return clean.length ? clean.map(item => "- " + item).join("\n") : "- " + fallback;
  }

  function csv(items, fallback) {
    const clean = (items || []).filter(Boolean);
    return clean.length ? clean.join(", ") : fallback;
  }

  function money(amount, currency, fallback) {
    if (!has(amount)) return fallback || "Not yet recorded";
    const parsed = Number(String(amount).replace(/,/g, ""));
    const value = Number.isFinite(parsed) ? parsed.toLocaleString("en-GB", { minimumFractionDigits: parsed % 1 ? 2 : 0, maximumFractionDigits: 2 }) : String(amount);
    return (currency || "GBP") + " " + value;
  }

  function expenseTotal(items) {
    return (items || []).reduce((sum, item) => sum + (Number(String(item.amount || "").replace(/,/g, "")) || 0), 0);
  }

  function allEvidence(a) {
    return (a.evidence || []).filter(Boolean);
  }

  function missingValue(label) {
    const map = {
      "Booking reference": "Not yet provided",
      "Refund received": "No refund recorded",
      "Voucher offered": "No voucher recorded",
      "Complaint method": "No complaint method recorded",
      "Complaint reference": "No complaint reference recorded",
      "Response received": "No response recorded",
      "Remedy offered": "No remedy recorded",
      "Key promises": "No detailed promises recorded",
      "Other impact": "No additional impact recorded",
      "Event notes": "No additional events recorded",
      "Missing evidence": "See suggested evidence below"
    };
    return map[label] || "Not yet recorded";
  }

  function travelCompanyName(a) {
    return text(a.travelCompany || a.companyOther, "Travel company not yet recorded");
  }

  function destination(a) {
    const parts = [a.destination, a.country].filter(has);
    return parts.length ? parts.join(", ") : "Destination not yet recorded";
  }

  function travelDates(a) {
    if (has(a.travelStart) && has(a.travelEnd)) return a.travelStart + " to " + a.travelEnd;
    if (has(a.travelStart)) return "From " + a.travelStart;
    if (has(a.travelEnd)) return "Until " + a.travelEnd;
    return "Travel dates not yet recorded";
  }

  function packReference(a) {
    return /^QH-\d{4}-[A-Z0-9]{6}$/.test(a.packReference || "") ? a.packReference : "QH-" + new Date().getFullYear() + "-DRAFT1";
  }

  function status(a) {
    const essentials = [a.holidayType, a.travelCompany || a.companyOther, a.destination, a.leadPassenger];
    const completed = essentials.filter(has).length + ((a.complaintTypes || []).length ? 1 : 0) + (allEvidence(a).length ? 1 : 0) + ((a.outcomes || []).length ? 1 : 0);
    if (completed <= 1) return "Not Started";
    if (completed <= 3) return "Needs Key Information";
    if (!allEvidence(a).length) return "Needs Evidence";
    if (completed >= 6) return "Ready for Review";
    return "In Progress";
  }

  function completeness(a) {
    const requirements = [
      { label: "Holiday type", ok: has(a.holidayType) },
      { label: "Travel company or organiser", ok: has(a.travelCompany || a.companyOther) },
      { label: "Destination", ok: has(a.destination) },
      { label: "Lead traveller", ok: has(a.leadPassenger) },
      { label: "Main complaint issues", ok: (a.complaintTypes || []).length > 0 },
      { label: "Evidence selected", ok: allEvidence(a).length > 0 },
      { label: "Requested outcome", ok: (a.outcomes || []).length > 0 },
      { label: "Complaint history", ok: has(a.complaintMethod) || has(a.complaintReference) || has(a.responseReceived) }
    ];
    const done = requirements.filter(item => item.ok);
    const percent = Math.round((done.length / requirements.length) * 100);
    return {
      percent,
      status: status(a),
      completed: done.map(item => item.label),
      missing: requirements.filter(item => !item.ok).map(item => item.label),
      improvements: suggestedEvidence(a).filter(item => item.status === "Missing").slice(0, 5).map(item => item.label)
    };
  }

  function evidencePosition(a) {
    const count = allEvidence(a).length;
    const label = count >= 5 ? "Well Supported" : count >= 3 ? "Supported" : count >= 1 ? "Developing" : "Limited";
    return {
      label,
      available: allEvidence(a),
      missing: suggestedEvidence(a).filter(item => item.status === "Missing").slice(0, 8).map(item => item.label)
    };
  }

  function suggestedEvidence(a) {
    const selected = allEvidence(a).map(item => item.toLowerCase());
    const suggestions = new Map();
    (a.complaintTypes || []).forEach(issue => {
      (ISSUE_EVIDENCE[issue] || []).forEach(label => suggestions.set(label, label));
    });
    if (!suggestions.size) {
      ["Booking confirmation", "Invoice", "Payment records", "Complaint correspondence", "Photos or videos of the issue"].forEach(label => suggestions.set(label, label));
    }
    return Array.from(suggestions.values()).map(label => {
      const lower = label.toLowerCase();
      const available = selected.some(item => lower.includes(item) || item.includes(lower.split(" ")[0]));
      return { label, status: available ? "Available" : "Missing" };
    });
  }

  function promisedVsActual(a) {
    const rows = [];
    if (has(a.accommodationName) || has(a.accommodationType)) rows.push(["Accommodation as booked", text([a.accommodationName, a.accommodationType].filter(has).join(" - "), "Further detail required")]);
    if (has(a.advertisedStarRating)) rows.push([a.advertisedStarRating + " star rating", issueText(a, "rating")]);
    if (has(a.roomTypeBooked)) rows.push([a.roomTypeBooked, issueText(a, "room")]);
    if (has(a.boardBasis)) rows.push([a.boardBasis, issueText(a, "food")]);
    (a.facilitiesAdvertised || []).forEach(facility => rows.push([facility, issueText(a, facility)]));
    if (has(a.keyPromises)) rows.push(["Key promises recorded", a.keyPromises]);
    if (!rows.length && (a.complaintTypes || []).length) rows.push(["Further detail required", csv(a.complaintTypes, "Complaint issues recorded")]);
    return rows.length ? rows : [["Further detail required", "The pack needs more detail about what was advertised and what happened."]];
  }

  function issueText(a, hint) {
    const detail = text(a.issueDetails, "");
    if (detail) return detail;
    if ((a.complaintTypes || []).length) return csv(a.complaintTypes, "Complaint issue recorded");
    return "Further detail required";
  }

  function issueCards(a) {
    const issues = (a.complaintTypes || []).filter(Boolean);
    if (!issues.length) {
      return [{ name: "Main issue not yet selected", affected: "Not yet recorded", reported: missingValue("Complaint method"), fixed: "Not yet recorded", evidence: "Evidence not yet selected", impact: text(a.issueDetails, "Impact not yet recorded") }];
    }
    return issues.map(issue => ({
      name: issue,
      affected: [a.problemDate, a.problemEnd].filter(has).join(" to ") || "Not yet recorded",
      whole: text(a.continuedWholeHoliday, "Not yet recorded"),
      reported: text(a.reportedDuringHoliday, missingValue("Complaint method")),
      fixed: text(a.problemFixed, "Not yet recorded"),
      evidence: allEvidence(a).length ? csv(allEvidence(a), "Evidence selected") : "Evidence not yet selected",
      impact: text(a.issueDetails || a.losses, "Impact not yet recorded")
    }));
  }

  function timelineRows(a) {
    return [
      ["Holiday booked", text(a.bookingDate || a.bookedDate, "Not yet recorded"), "Booking platform or travel company", "Booking record", text(a.bookingReference, missingValue("Booking reference")), "Check booking documents"],
      ["Travel started", text(a.travelStart, "Not yet recorded"), "Traveller", "Travel", destination(a), "Keep travel documents"],
      ["Problem discovered", text(a.problemDate, "Not yet recorded"), "Hotel / supplier / organiser", "During holiday", text(a.issueDetails, "Problem detail not yet recorded"), "Record evidence"],
      ["Problem reported", text(a.complaintDate, "Not yet recorded"), travelCompanyName(a), text(a.complaintMethod, missingValue("Complaint method")), text(a.responseReceived, missingValue("Response received")), "Keep proof of complaint"],
      ["Problem ended", text(a.problemEnd, "Not yet recorded"), "Traveller", "Holiday record", text(a.problemFixed, "Not yet recorded"), "Confirm period affected"],
      ["Travel ended", text(a.travelEnd, "Not yet recorded"), "Traveller", "Travel", "Holiday completed", "Prepare complaint pack"],
      ["Formal complaint made", text(a.complaintDate, "Not yet recorded"), travelCompanyName(a), text(a.complaintMethod, missingValue("Complaint method")), text(a.complaintReference, missingValue("Complaint reference")), "Record deadline"],
      ["Travel company response", text(a.responseReceived, "Not yet recorded"), travelCompanyName(a), "Response", text(a.remedyOffered, missingValue("Remedy offered")), "Review next step"]
    ];
  }

  function financialSummary(a) {
    const currency = a.currencyLoss || a.currency || "GBP";
    const extras = expenseTotal(a.expenses);
    return [
      ["Holiday value", money(a.totalPrice, a.currency, "Not yet recorded")],
      ["Amount paid", money(a.amountPaid, a.currency, "Not yet recorded")],
      ["Recorded extra costs", extras ? money(extras.toFixed(2), currency) : "No extra costs recorded"],
      ["Refund received", money(a.refundAlreadyReceived, currency, missingValue("Refund received"))],
      ["Voucher offered", text(a.voucherReceived, missingValue("Voucher offered"))],
      ["Recorded financial position", "A record of entered costs for review. Not every cost will necessarily be recoverable."],
      ["Requested outcome", csv(a.outcomes, "Requested outcome not yet selected")]
    ];
  }

  function requestedOutcome(a) {
    return {
      requested: csv(a.outcomes, "Requested outcome not yet selected"),
      amount: money(a.holidayPriceClaimed || a.totalPrice, a.currencyLoss || a.currency, "No specific amount recorded"),
      reasons: (a.complaintTypes || []).filter(Boolean),
      evidence: allEvidence(a),
      refund: money(a.refundAlreadyReceived, a.currencyLoss || a.currency, missingValue("Refund received")),
      offer: text(a.remedyOffered || a.voucherReceived, "No offer recorded"),
      stillNeeded: suggestedEvidence(a).filter(item => item.status === "Missing").slice(0, 5).map(item => item.label)
    };
  }

  function travelCompanyCard(a) {
    return [
      ["Trading name", travelCompanyName(a)],
      ["Organiser or supplier role", text(a.packageSold || a.holidayType, "Role not yet recorded")],
      ["Booking platform", text(a.travelAgent, "Booking platform not yet recorded")],
      ["Accommodation provider", text(a.accommodationProvider || a.accommodationName, "Accommodation provider not yet recorded")],
      ["Official complaint route", "Check the company's current official website before sending"],
      ["Customer relations", "Use only verified current contact details from the official website"],
      ["Official website", "Check the company's current official website"],
      ["Postal address", "Use only a verified current address"],
      ["ABTA membership", "Verify on the current ABTA or company website where relevant"],
      ["ADR route", "Check the company's current official guidance"],
      ["Last verified", today()]
    ];
  }

  function expenseSchedule(a) {
    const currency = a.currencyLoss || a.currency || "GBP";
    if (!a.expenses || !a.expenses.length) return "No itemised extra costs have been added. If there were no extra costs, this section can remain unused.";
    return a.expenses.map((item, index) => [
      "Item " + (index + 1),
      "Date: Not yet recorded",
      "Category: Extra holiday cost",
      "Description: " + text(item.description, "Cost description not yet recorded"),
      "Amount: " + money(item.amount, currency, "Amount not yet recorded"),
      "Currency: " + currency,
      "Receipt status: " + text(item.receipt, "Receipt status not yet recorded"),
      "Reason: " + text(item.reason, "Reason not yet recorded"),
      "Payer: Lead traveller unless updated"
    ].join("\n")).join("\n\n");
  }

  function medicalNote(a) {
    const hasIllness = (a.complaintTypes || []).some(issue => /illness|food|hygiene/i.test(issue));
    if (!hasIllness) return "";
    return "\n\nMedical and illness wording safeguard:\nThe travellers reported becoming unwell during the holiday and have recorded concerns about food quality or hygiene. This wording does not diagnose the cause of illness or state that the hotel caused the illness as a proven fact. Medical attendance, dates, affected travellers and supporting evidence should be checked before submission.";
  }

  function smartSubmission(a) {
    const c = completeness(a);
    const e = evidencePosition(a);
    const checks = [
      ["Complaint Letter", c.percent >= 50 ? "Complete" : "Needs Review"],
      ["Holiday Analysis", c.missing.includes("Travel company or organiser") || c.missing.includes("Destination") ? "Needs Information" : "Complete"],
      ["Evidence Schedule", e.label === "Limited" ? "Needs Evidence" : e.label],
      ["Financial Loss Schedule", a.expenses && a.expenses.length ? "Complete" : "Not Used"],
      ["Travel Company Route", "Check Official Website"],
      ["Pack Review", c.status === "Ready for Review" ? "Complete" : "Incomplete"],
      ["Ready to Submit", c.status === "Ready for Review" && !c.missing.length ? "Yes" : "Not Yet"]
    ];
    return checks;
  }

  function beforeSubmitChecklist() {
    return [
      "Check all traveller names",
      "Check travel dates",
      "Check booking reference",
      "Check organiser identity",
      "Confirm what was promised",
      "Confirm what happened",
      "Remove inaccurate wording",
      "Attach relevant evidence",
      "Attach receipts",
      "Remove unnecessary sensitive information",
      "Save the final PDF",
      "Save the editable version",
      "Use the official complaint route",
      "Keep proof of submission",
      "Record the complaint reference",
      "Add the response deadline or follow-up date",
      "Retain all responses"
    ];
  }

  function section(title, body) {
    return title + "\n" + "-".repeat(Math.min(title.length, 48)) + "\n" + body;
  }

  function rowsText(rows) {
    return rows.map(row => row[0] + ": " + row[1]).join("\n");
  }

  function buildCover(a) {
    const c = completeness(a);
    return [
      "QUAERENS",
      "",
      "Holiday & Package Travel",
      "Complaint Pack",
      "",
      "Pack reference: " + packReference(a),
      "Generated date: " + today(),
      "Complaint Pack Status: " + c.status,
      "",
      "Lead Traveller: " + text(a.leadPassenger, "Lead traveller not yet recorded"),
      "Additional Travellers: " + text(a.additionalTravellers, "No additional travellers recorded"),
      "Travel Company / Organiser: " + travelCompanyName(a),
      "Destination: " + destination(a),
      "Travel Dates: " + travelDates(a),
      "Number of Nights: " + text(a.nights, "Nights not yet recorded"),
      "Number of Travellers: " + text(a.travellers, "1"),
      "Booking Reference: " + text(a.bookingReference, missingValue("Booking reference")),
      "Holiday Value: " + money(a.totalPrice, a.currency, "Holiday value not yet recorded"),
      "Main Complaint Issues: " + csv(a.complaintTypes, "Main issues not yet selected"),
      "Recorded Extra Costs: " + (expenseTotal(a.expenses) ? money(expenseTotal(a.expenses).toFixed(2), a.currencyLoss || a.currency) : "No extra costs recorded"),
      "Requested Outcome: " + csv(a.outcomes, "Requested outcome not yet selected")
    ].join("\n");
  }

  function buildSummary(a) {
    const c = completeness(a);
    const e = evidencePosition(a);
    const outcome = requestedOutcome(a);
    return [
      section("HOLIDAY SUMMARY", rowsText([
        ["Travel Company", travelCompanyName(a)],
        ["Destination", destination(a)],
        ["Travel Dates", travelDates(a)],
        ["Holiday Type", text(a.holidayType, "Holiday type not yet recorded")],
        ["Nights", text(a.nights, "Nights not yet recorded")],
        ["Travellers", text(a.travellers, "1")],
        ["Accommodation", text(a.accommodationName, "Accommodation not yet recorded")],
        ["Board Basis", text(a.boardBasis, "Board basis not yet recorded")],
        ["Booking Reference", text(a.bookingReference, missingValue("Booking reference"))],
        ["Current Complaint Status", text(a.currentStatus, c.status)]
      ]) + "\n\nMain issues:\n" + list(a.complaintTypes, "Main issues not yet selected")),
      section("COMPLAINT PACK COMPLETENESS", c.percent + "%\nStatus: " + c.status + "\n\nCompleted requirements:\n" + list(c.completed, "No requirements completed yet") + "\n\nStill needed:\n" + list(c.missing, "No essential gaps recorded") + "\n\nRecommended improvements:\n" + list(c.improvements, "No specific evidence improvements identified")),
      section("EVIDENCE POSITION", e.label + "\n\nAvailable:\n" + list(e.available, "No evidence selected yet") + "\n\nStill missing:\n" + list(e.missing, "No issue-specific gaps identified") + "\n\nThis reflects the evidence recorded in the pack. It does not predict whether the complaint will succeed."),
      section("WHAT WAS PROMISED VS WHAT HAPPENED", promisedVsActual(a).map(row => row[0] + " | " + row[1]).join("\n")),
      section("MAIN COMPLAINT ISSUES", issueCards(a).map(card => card.name.toUpperCase() + "\nAffected: " + card.affected + "\nWhole holiday affected: " + (card.whole || "Not yet recorded") + "\nReported: " + card.reported + "\nResolved: " + card.fixed + "\nEvidence: " + card.evidence + "\nImpact: " + card.impact).join("\n\n")),
      section("FINANCIAL SUMMARY", rowsText(financialSummary(a))),
      section("REQUESTED OUTCOME", "Requested: " + outcome.requested + "\nAmount or value: " + outcome.amount + "\nReasons:\n" + list(outcome.reasons, "Reasons not yet selected") + "\nSupporting evidence:\n" + list(outcome.evidence, "Evidence not yet selected") + "\nRefund already received: " + outcome.refund + "\nOffer already made: " + outcome.offer + "\nStill needed:\n" + list(outcome.stillNeeded, "No further evidence suggestions"))
    ].join("\n\n");
  }

  function buildTimeline(a) {
    return section("HOLIDAY TIMELINE AND COMPLAINT HISTORY", timelineRows(a).map(row => row[0] + "\nDate: " + row[1] + "\nOrganisation/person contacted: " + row[2] + "\nMethod: " + row[3] + "\nEvidence / response: " + row[4] + "\nNext action: " + row[5]).join("\n\n") + "\n\nEvent notes:\n" + text(a.timelineNotes, missingValue("Event notes")));
  }

  function buildEvidence(a) {
    const suggestions = suggestedEvidence(a);
    return section("HOLIDAY EVIDENCE CHECKLIST", "Evidence already identified:\n" + list(allEvidence(a), "No evidence selected yet") + "\n\nMissing evidence schedule:\n" + suggestions.map(item => "- " + item.label + " | Status: " + item.status).join("\n") + "\n\nAdditional notes:\n" + text(a.missingEvidence, "No additional missing-evidence notes recorded") + "\n\nDo not send original documents unless specifically required. Redact unnecessary sensitive information before attaching documents.");
  }

  function buildLosses(a) {
    const totalCosts = expenseTotal(a.expenses);
    const currency = a.currencyLoss || a.currency || "GBP";
    return section("FINANCIAL LOSS SCHEDULE", rowsText(financialSummary(a)) + "\n\nItemised extra costs:\n" + expenseSchedule(a) + "\n\nEstimated extra costs total entered: " + (totalCosts ? money(totalCosts.toFixed(2), currency) : "No extra costs recorded") + "\n\nOther impact:\n" + text(a.losses, missingValue("Other impact")) + "\n\nCaution: This schedule is a record of costs and impact for review. Not every cost or impact will be recoverable. Where multiple currencies are entered, totals should be checked separately; no currency conversion is applied by this pack.");
  }

  function buildLetter(a) {
    const outcome = requestedOutcome(a);
    const issueTextBlock = (a.complaintTypes || []).length ? a.complaintTypes.join(", ") : "holiday complaint issues";
    return "INITIAL HOLIDAY AND PACKAGE TRAVEL COMPLAINT\n\nPack reference: " + packReference(a) + "\n\nTo: " + travelCompanyName(a) + "\n\nBooking details\nBooking reference: " + text(a.bookingReference, missingValue("Booking reference")) + "\nLead traveller: " + text(a.leadPassenger, "Lead traveller not yet recorded") + "\nDestination: " + destination(a) + "\nTravel dates: " + travelDates(a) + "\n\nDear Customer Relations Team,\n\nI am writing about the holiday booking above. I ask that you review the enclosed complaint pack and provide a clear written response.\n\nPackage organiser\nThe organiser or supplier recorded in this pack is: " + travelCompanyName(a) + ". The booking platform or travel agent recorded is: " + text(a.travelAgent, "No separate booking platform recorded") + ".\n\nWhat was promised\n" + text(a.keyPromises, missingValue("Key promises")) + "\n\nWhat actually happened\nThe main issues recorded are: " + issueTextBlock + ".\n" + text(a.issueDetails || a.timelineNotes, "Further detail about what happened should be added before submission.") + medicalNote(a) + "\n\nDates affected\nProblem period: " + text(a.problemDate, "Start date not yet recorded") + " to " + text(a.problemEnd, "End date not yet recorded") + ". Whole holiday affected: " + text(a.continuedWholeHoliday, "Not yet recorded") + ". Problem fixed during the holiday: " + text(a.problemFixed, "Not yet recorded") + ".\n\nComplaint made during holiday and response\nReported while away: " + text(a.reportedDuringHoliday, "Not yet recorded") + "\nComplaint method: " + text(a.complaintMethod, missingValue("Complaint method")) + "\nComplaint reference: " + text(a.complaintReference, missingValue("Complaint reference")) + "\nResponse received: " + text(a.responseReceived, missingValue("Response received")) + "\nRemedy offered: " + text(a.remedyOffered, missingValue("Remedy offered")) + "\n\nPractical impact\n" + text(a.losses, missingValue("Other impact")) + "\n\nFinancial losses\n" + buildLosses(a).replace(/^FINANCIAL LOSS SCHEDULE\n-+\n/, "") + "\n\nEvidence attached or available\n" + list(allEvidence(a), "Evidence not yet selected") + "\n\nRequested outcome\nI ask that you consider the following requested outcome:\n" + outcome.requested + "\n\nThis request is based on the facts and supporting documents set out in the enclosed complaint pack.\n\nReasons\n" + list(outcome.reasons, "Reasons not yet selected") + "\n\nInformation requested\nPlease explain your position, the evidence you have considered, any documents you need from me, and the route for further escalation if we cannot resolve this directly.\n\nResponse requested\nPlease provide a written response within your normal complaint-handling timescale and include any complaint reference I should use in future correspondence.\n\nYours faithfully,\n\n" + text(a.leadPassenger, "Lead traveller");
  }

  function buildSubmit(a) {
    return section("QUAERENS SMART SUBMISSION", "Your Holiday Complaint Pack Is Ready to Submit\n\n" + smartSubmission(a).map(row => row[0] + ": " + row[1]).join("\n") + "\n\nQuaerens does not send the complaint for you. Review the pack, attach relevant evidence and submit it through the travel company's official complaint route.\n\nPreferred complaint method\nTravel company / organiser: " + travelCompanyName(a) + "\nOfficial complaint form: Check the current official website before sending\nCustomer relations email: Check the current official website before sending\nPostal address: Check the current official website before sending\nWebsite: Check the current official website before sending\n\nBefore You Submit\n" + list(beforeSubmitChecklist(), "Checklist unavailable") + "\n\nFollow-Up Tracker\nDate sent: [add date]\nMethod used: [online form / email / post]\nAttachments included: [list attachments]\nComplaint reference: " + text(a.complaintReference, missingValue("Complaint reference")) + "\nFollow-up date: [add date]");
  }

  function buildTravelCompany(a) {
    return section("TRAVEL COMPANY", rowsText(travelCompanyCard(a)));
  }

  function card(title, body, extraClass) {
    return '<article class="preview-card ' + (extraClass || "") + '"><h4>' + esc(title) + '</h4>' + body + '</article>';
  }

  function kv(label, value) {
    return '<div><strong>' + esc(label) + '</strong><span>' + esc(value) + '</span></div>';
  }

  function previewHtml(a) {
    const c = completeness(a);
    const e = evidencePosition(a);
    const outcome = requestedOutcome(a);
    const summary = [
      kv("Travel company", travelCompanyName(a)),
      kv("Destination", destination(a)),
      kv("Travel dates", travelDates(a)),
      kv("Travellers", text(a.travellers, "1")),
      kv("Booking reference", text(a.bookingReference, missingValue("Booking reference"))),
      kv("Pack reference", packReference(a))
    ].join("");
    const issues = issueCards(a).map(item => '<div class="mini-status"><strong>' + esc(item.name) + '</strong><span>Affected: ' + esc(item.affected) + '</span><span>Reported: ' + esc(item.reported) + '</span><span>Resolved: ' + esc(item.fixed) + '</span></div>').join("");
    const promised = promisedVsActual(a).map(row => '<tr><td>' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td></tr>').join("");
    const timeline = timelineRows(a).map(row => '<li><strong>' + esc(row[0]) + '</strong><span>' + esc(row[1]) + '</span></li>').join("");
    const finance = financialSummary(a).map(row => kv(row[0], row[1])).join("");
    const travelCompany = travelCompanyCard(a).slice(0, 6).map(row => kv(row[0], row[1])).join("");
    return [
      '<div class="preview-empty-note">This preview updates as you answer. Empty optional fields are omitted or shown as practical next steps.</div>',
      card("Holiday Summary", '<div class="preview-kv">' + summary + '</div>'),
      card("Main Issues", '<div class="issue-preview-grid">' + issues + '</div>'),
      card("What Was Promised vs What Happened", '<table class="preview-table"><thead><tr><th>Promised</th><th>Actual</th></tr></thead><tbody>' + promised + '</tbody></table>'),
      card("Complaint Timeline", '<ol class="timeline-preview">' + timeline + '</ol>'),
      card("Evidence Position", '<p><span class="status-pill">' + esc(e.label) + '</span></p><p>This reflects the evidence recorded in the pack. It does not predict whether the complaint will succeed.</p><p><strong>Still useful:</strong> ' + esc(e.missing.slice(0, 4).join(", ") || "No issue-specific gaps identified") + '</p>'),
      card("Complaint Pack Completeness", '<p><span class="status-pill">' + esc(c.percent + "% - " + c.status) + '</span></p><p><strong>Still needed:</strong> ' + esc(c.missing.join(", ") || "No essential gaps recorded") + '</p>'),
      card("Financial Summary", '<div class="preview-kv">' + finance + '</div>'),
      card("Requested Outcome", '<p><strong>Requested:</strong> ' + esc(outcome.requested) + '</p><p><strong>Still needed:</strong> ' + esc(outcome.stillNeeded.slice(0, 4).join(", ") || "No further evidence suggestions") + '</p>'),
      card("Travel Company", '<div class="preview-kv">' + travelCompany + '</div>'),
      card("Smart Submission", '<ul>' + smartSubmission(a).map(row => '<li><strong>' + esc(row[0]) + ':</strong> ' + esc(row[1]) + '</li>').join("") + '</ul>')
    ].join("");
  }

  function buildAll(a) {
    const docs = {
      cover: buildCover(a),
      summary: buildSummary(a),
      letter: buildLetter(a),
      evidence: buildEvidence(a),
      timeline: buildTimeline(a),
      expenses: buildLosses(a),
      travelCompany: buildTravelCompany(a),
      submit: buildSubmit(a)
    };
    docs.full = "QUAERENS CONSUMER COMPLAINT FILE\nHoliday & Package Travel Complaint Pack\n\nIncludes your Holiday Analysis, Complaint Letter, Evidence Checklist, Missing Evidence Schedule, Timeline, Financial Loss Schedule, Potential Remedy Summary and Smart Submission guidance.\n\n" + [docs.cover, docs.summary, docs.letter, docs.evidence, docs.timeline, docs.expenses, docs.travelCompany, docs.submit, section("OFFICIAL RESOURCES", "Check current official guidance from the travel company, ABTA where relevant, Citizens Advice, UK International Consumer Centre where relevant, and any applicable travel insurance provider."), section("SELF-SERVICE DISCLAIMER", "This pack is a self-service starting point. Check every answer, remove anything inaccurate and only send documents that reflect your own circumstances. It does not provide legal advice or guarantee a refund, compensation, reimbursement, price reduction or goodwill payment.")].join("\n\n---\n\n");
    docs.previewHtml = previewHtml(a);
    return docs;
  }

  return {
    buildAll,
    buildLetter,
    helpers: {
      completeness,
      evidencePosition,
      packReference,
      promisedVsActual,
      requestedOutcome,
      suggestedEvidence
    }
  };
});

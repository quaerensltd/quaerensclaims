"use strict";

(function(root, factory) {
  const evidence = factory();
  if (typeof module === "object" && module.exports) module.exports = evidence;
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.evidence = evidence;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function fallback(value) {
    return value && String(value).trim() ? String(value).trim() : "[Not provided]";
  }

  function lines(items) {
    return items && items.length ? items.map(item => "- " + item).join("\n") : "- [Not selected]";
  }

  const evidenceGuidance = [
    "Booking confirmation, invoice and payment records",
    "Terms and conditions supplied at booking",
    "Screenshots of the hotel, villa, resort or package description",
    "Photos and videos showing the problem",
    "Emails, app messages, chat logs and complaint correspondence",
    "Receipts for replacement accommodation, transport, food, calls or extra costs",
    "Notes of who you spoke to and when",
    "Medical or witness evidence where relevant"
  ];

  function buildEvidence(a) {
    return "HOLIDAY EVIDENCE CHECKLIST\n\nEvidence already identified:\n" + lines(a.evidence) + "\n\nMissing evidence schedule:\n" + fallback(a.missingEvidence) + "\n\nOther evidence that may help:\n- " + evidenceGuidance.join("\n- ") + "\n\nDo not send original documents unless specifically required. Redact unnecessary sensitive information before attaching documents.";
  }

  return { evidenceGuidance, buildEvidence };
});

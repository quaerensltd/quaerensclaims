"use strict";

(function(root, factory) {
  const submission = factory();
  if (typeof module === "object" && module.exports) module.exports = submission;
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.submission = submission;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function fallback(value) {
    return value && String(value).trim() ? String(value).trim() : "[Not provided]";
  }

  function buildSubmit(a) {
    return "QUAERENS SMART SUBMISSION\n\nYour Holiday Complaint Pack Is Ready to Submit\n\nBefore sending:\n- Read every section carefully\n- Remove or amend anything that is inaccurate\n- Attach only relevant evidence\n- Check the travel company or organiser official complaint page\n- Keep proof of sending\n- Record any complaint reference\n- Save copies of all documents and responses\n\nPREFERRED COMPLAINT METHOD\nTravel company / organiser: " + fallback(a.travelCompany || a.companyOther) + "\nOfficial complaint form: Check the current official website before sending\nCustomer relations email: Check the current official website before sending\nPostal address: Check the current official website before sending\nWebsite: Check the current official website before sending\n\nFOLLOW-UP TRACKER\nDate sent: [add date]\nMethod used: [online form / email / post]\nAttachments included: [list attachments]\nComplaint reference: " + fallback(a.complaintReference) + "\nFollow-up date: [add date]\n\nQuaerens does not send this complaint for you through this free builder.";
  }

  return { buildSubmit };
});

"use strict";

(function(root, factory) {
  const analysis = factory();
  if (typeof module === "object" && module.exports) module.exports = analysis;
  root.QCBFHoliday = root.QCBFHoliday || {};
  root.QCBFHoliday.analysis = analysis;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  function today() {
    return new Date().toLocaleDateString("en-GB");
  }

  function fallback(value) {
    return value && String(value).trim() ? String(value).trim() : "[Not provided]";
  }

  function lines(items) {
    return items && items.length ? items.map(item => "- " + item).join("\n") : "- [Not selected]";
  }

  function money(amount, currency) {
    return amount ? (currency || "GBP") + " " + amount : "[Not provided]";
  }

  function expenseTotal(items) {
    return (items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  function expenseLines(items, currency) {
    return items && items.length ? items.map(item => "- " + fallback(item.description) + ": " + money(item.amount, currency) + " | Receipt: " + fallback(item.receipt) + " | Reason: " + fallback(item.reason)).join("\n") : "- [No itemised extra costs added]";
  }

  function buildSummary(a) {
    const totalCosts = expenseTotal(a.expenses);
    return "QUAERENS CONSUMER COMPLAINT FILE\n\nHoliday & Package Travel Complaint Pack\n\nGenerated: " + today() + "\n\nHOLIDAY AND BOOKING ANALYSIS\nHoliday type: " + fallback(a.holidayType) + "\nPossible package position: " + fallback(a.packageSold) + "\nTravel company / organiser: " + fallback(a.travelCompany) + "\nTravel agent / booking website: " + fallback(a.travelAgent) + "\nAccommodation provider: " + fallback(a.accommodationProvider || a.accommodationName) + "\nBooking reference: " + fallback(a.bookingReference) + "\nLead traveller: " + fallback(a.leadPassenger) + "\nAdditional travellers: " + fallback(a.additionalTravellers) + "\nTravel dates: " + fallback(a.travelStart) + " to " + fallback(a.travelEnd) + "\nNights: " + fallback(a.nights) + "\nDestination: " + fallback(a.destination) + ", " + fallback(a.country) + "\nNumber of travellers: " + fallback(a.travellers) + "\nPayment method: " + fallback(a.paymentMethod) + "\nTotal price: " + money(a.totalPrice, a.currency) + "\nAmount paid: " + money(a.amountPaid, a.currency) + "\n\nWHAT WAS PROMISED\nAccommodation: " + fallback(a.accommodationName) + " | Type: " + fallback(a.accommodationType) + " | Rating: " + fallback(a.advertisedStarRating) + "\nRoom / unit booked: " + fallback(a.roomTypeBooked) + "\nBoard basis: " + fallback(a.boardBasis) + "\nAdvertised facilities or services:\n" + lines(a.facilitiesAdvertised) + "\nPromise sources:\n" + lines(a.promiseSource) + "\nKey promises:\n" + fallback(a.keyPromises) + "\n\nWHAT ACTUALLY HAPPENED\nKey issues:\n" + lines(a.complaintTypes) + "\nProblem period: " + fallback(a.problemDate) + " to " + fallback(a.problemEnd) + "\nAffected whole holiday: " + fallback(a.continuedWholeHoliday) + "\nFixed during holiday: " + fallback(a.problemFixed) + "\nAlternative offered: " + fallback(a.alternativeOffered) + "\nAccepted alternative: " + fallback(a.acceptedAlternative) + "\nDetails:\n" + fallback(a.issueDetails) + "\n\nFINANCIAL POSITION\nHoliday price relevant to complaint: " + money(a.holidayPriceClaimed || a.totalPrice, a.currencyLoss || a.currency) + "\nRefund already received: " + money(a.refundAlreadyReceived, a.currencyLoss || a.currency) + "\nVoucher or credit offered: " + fallback(a.voucherReceived) + "\nItemised extra costs total entered: " + money(totalCosts ? totalCosts.toFixed(2) : "", a.currencyLoss || a.currency) + "\n\nPOTENTIAL OUTCOMES TO CONSIDER\n" + lines(a.outcomes) + "\n\nIMPORTANT NOTE\nThis pack is a self-service starting point. Check every answer, remove anything inaccurate and only send documents that reflect your own circumstances. It does not provide legal advice or guarantee a refund, compensation, reimbursement, price reduction or goodwill payment.";
  }

  function buildTimeline(a) {
    return "HOLIDAY TIMELINE AND COMPLAINT HISTORY\n\nHoliday booked: " + fallback(a.bookingDate || a.bookedDate) + "\nTravel start: " + fallback(a.travelStart) + "\nTravel end: " + fallback(a.travelEnd) + "\nProblem discovered: " + fallback(a.problemDate) + "\nProblem ended: " + fallback(a.problemEnd) + "\nReported while away: " + fallback(a.reportedDuringHoliday) + "\nComplaint made: " + fallback(a.complaintDate) + "\nComplaint method: " + fallback(a.complaintMethod) + "\nComplaint reference: " + fallback(a.complaintReference) + "\nResponse received: " + fallback(a.responseReceived) + "\nRemedy offered: " + fallback(a.remedyOffered) + "\nOffer accepted: " + fallback(a.remedyAccepted) + "\nCurrent status: " + fallback(a.currentStatus) + "\n\nEVENT NOTES\n" + fallback(a.timelineNotes);
  }

  function buildLosses(a) {
    const totalCosts = expenseTotal(a.expenses);
    return "FINANCIAL LOSS SCHEDULE\n\nHoliday price relevant to complaint: " + money(a.holidayPriceClaimed || a.totalPrice, a.currencyLoss || a.currency) + "\nAmount paid so far: " + money(a.amountPaid, a.currency || a.currencyLoss) + "\nRefund already received: " + money(a.refundAlreadyReceived, a.currencyLoss || a.currency) + "\nVoucher / credit offered: " + fallback(a.voucherReceived) + "\n\nItemised extra costs:\n" + expenseLines(a.expenses, a.currencyLoss || a.currency) + "\n\nEstimated extra costs total entered: " + money(totalCosts ? totalCosts.toFixed(2) : "", a.currencyLoss || a.currency) + "\n\nOther impact:\n" + fallback(a.losses) + "\n\nCaution: This schedule is a record of costs and impact for review. Not every cost or impact will be recoverable.";
  }

  return { today, fallback, lines, money, expenseLines, expenseTotal, buildSummary, buildTimeline, buildLosses };
});

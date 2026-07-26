(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QCBFGymDeadlines = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysBetween(start, end) {
    if (!start || !end) return null;
    return Math.round((end.getTime() - start.getTime()) / 86400000);
  }

  function coolingOffStatus(data) {
    const method = String(data.joiningMethod || "").toLowerCase();
    const distanceMethod = /online|app|telephone|away|promotional|work|third-party/.test(method);
    if (!method) return "Joining method needs verification";
    if (!distanceMethod) return "Contract appears to have been made on business premises or needs checking";
    const joined = parseDate(data.dateJoined || data.membershipStartDate);
    const cancelled = parseDate(data.cancellationRequestDate || data.requestedEndDate);
    if (!joined) return "Start date needs confirmation";
    if (!cancelled) return "Cancellation date needs confirmation";
    const days = daysBetween(joined, cancelled);
    if (days !== null && days <= 14) return "Cooling-off period may apply, subject to contract information and service-use deductions";
    return "Cancellation appears outside the recorded 14-day period, but contract information should still be checked";
  }

  function noticeStatus(data) {
    if (!data.noticePeriod) return "Notice period needs checking";
    return `Recorded notice period: ${data.noticePeriod}`;
  }

  function deadlineSummary(data) {
    const urgent = /letter before claim|court|judgment|bailiff|enforcement|statutory demand/i.test([data.currentStage, data.debtStage, data.whatHappened].flat().join(" "));
    return {
      urgent,
      coolingOff: coolingOffStatus(data),
      notice: noticeStatus(data),
      guidance: urgent
        ? "Court and enforcement documents may involve strict deadlines and separate procedures. Check the document immediately and consider obtaining qualified advice."
        : "Check the membership terms, notice period and official cancellation route before submitting."
    };
  }

  return { parseDate, daysBetween, coolingOffStatus, noticeStatus, deadlineSummary };
});

function minutesBetween(start, end) {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;
  return Math.round((endDate.getTime() - startDate.getTime()) / 60000);
}

function delayText(minutes) {
  if (minutes === null || minutes === undefined) return "Not calculated";
  const sign = minutes < 0 ? "-" : "";
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;
  return `${sign}${hours} hours and ${mins} minutes`;
}

function calculateArrivalDelay({ scheduledArrivalUtc, actualArrivalUtc, manualDelayMinutes }) {
  const calculated = minutesBetween(scheduledArrivalUtc, actualArrivalUtc);
  if (calculated !== null) {
    return {
      delayMinutes: calculated,
      delayText: delayText(calculated),
      delaySource: "Calculated from scheduled and actual arrival times"
    };
  }

  const manual = parseInt(manualDelayMinutes, 10);
  if (!Number.isNaN(manual)) {
    return {
      delayMinutes: manual,
      delayText: delayText(manual),
      delaySource: "Manual arrival delay entered because actual times were unknown"
    };
  }

  return {
    delayMinutes: null,
    delayText: "Not calculated",
    delaySource: "Not calculated"
  };
}

module.exports = {
  calculateArrivalDelay,
  delayText,
  minutesBetween
};

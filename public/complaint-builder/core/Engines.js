"use strict";

const { sortTimeline } = require("../utilities/dates");
const { totalsByCurrency } = require("../utilities/currency");

function evidencePosition(items) {
  const relevant = (items || []).filter((item) => item && item.status !== "not applicable");
  const available = relevant.filter((item) => item.status === "available").length;
  const level = available >= 6 ? "Well Supported" : available >= 3 ? "Supported" : available >= 1 ? "Developing" : "Limited";
  return {
    level,
    reasons: available ? [available + " evidence item(s) marked available"] : ["Key evidence still needs adding"],
    missing: relevant.filter((item) => item.status === "missing" || !item.status).map((item) => item.label)
  };
}

function readiness(config, data) {
  const essentials = config && config.essentialFields ? config.essentialFields : [];
  const missing = essentials.filter((field) => {
    const value = String(field).split(".").filter(Boolean).reduce((node, key) => node && node[key], data);
    return value === undefined || value === null || String(value).trim() === "";
  });
  const percent = essentials.length ? Math.round(((essentials.length - missing.length) / essentials.length) * 100) : 0;
  const status = percent >= 100 ? "Ready to Submit" : percent >= 70 ? "Ready for Review" : percent > 0 ? "In Progress" : "Not Started";
  return { percent, status, missing };
}

function confidence(signals) {
  const active = (signals || []).filter(Boolean).length;
  const label = active >= 4 ? "High Data Confidence" : active >= 2 ? "Moderate Data Confidence" : "Low Data Confidence";
  return {
    label,
    note: "This reflects the completeness and consistency of the information entered. It does not predict the complaint outcome."
  };
}

function expenseSchedule(items) {
  return { items: items || [], totals: totalsByCurrency(items || []) };
}

function timeline(events) {
  return sortTimeline(events || []);
}

module.exports = { evidencePosition, readiness, confidence, expenseSchedule, timeline };

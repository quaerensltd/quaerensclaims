"use strict";

const { normaliseText } = require("../utilities/text");

function normaliseName(value) {
  return normaliseText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

class SubmissionDirectory {
  constructor(entries) {
    this.entries = entries || [];
  }

  find(query) {
    const needle = normaliseName(query);
    if (!needle) return null;
    return this.entries.find((entry) => {
      const names = [entry.tradingName, entry.legalEntity, entry.iata, entry.icao, entry.name].filter(Boolean);
      return names.some((name) => normaliseName(name).includes(needle) || needle.includes(normaliseName(name)));
    }) || null;
  }

  resolve(query) {
    const entry = this.find(query);
    if (!entry) {
      return {
        status: "not-listed",
        label: "Organisation not listed",
        preferredMethod: "Use the organisation's official website or current published complaint route.",
        lastVerified: "Not verified"
      };
    }
    return Object.assign({ status: "matched" }, entry);
  }
}

module.exports = { SubmissionDirectory };

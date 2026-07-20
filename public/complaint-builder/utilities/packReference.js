"use strict";

function createPackReference(prefix, date, randomSource) {
  const safePrefix = String(prefix || "QC").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 4) || "QC";
  const year = (date || new Date()).getFullYear();
  const random = randomSource || Math.random;
  const code = Math.floor(random() * 2176782336).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  return safePrefix + "-" + year + "-" + code;
}

module.exports = { createPackReference };

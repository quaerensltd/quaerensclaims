"use strict";

const crypto = require("crypto");

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value instanceof Date) return { __type: "Date", value: value.toISOString() };
  if (
    value &&
    typeof value === "object" &&
    (value.constructor?.name === "Timestamp" ||
      (typeof value.toDate === "function" &&
        "_seconds" in value &&
        "_nanoseconds" in value)) &&
    Number.isFinite(Number(value.seconds ?? value._seconds)) &&
    Number.isFinite(Number(value.nanoseconds ?? value._nanoseconds))
  ) {
    return {
      __type: "Timestamp",
      seconds: String(value.seconds ?? value._seconds),
      nanoseconds: Number(value.nanoseconds ?? value._nanoseconds),
    };
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stable(value));
}

function sha256(value) {
  const input = Buffer.isBuffer(value) ? value : Buffer.from(stableStringify(value));
  return crypto.createHash("sha256").update(input).digest("hex");
}

module.exports = { stable, stableStringify, sha256 };

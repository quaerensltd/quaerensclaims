"use strict";

const { normaliseText } = require("../utilities/text");
const { numberValue } = require("../utilities/currency");

function valueAt(data, path) {
  return String(path || "").split(".").filter(Boolean).reduce((node, key) => node && node[key], data);
}

function validateRule(rule, data) {
  const value = valueAt(data, rule.field);
  const text = normaliseText(value);
  if (rule.required && !text) return rule.message || rule.label || rule.field + " is required.";
  if (!text && !rule.required) return null;
  if (rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return rule.message || "Enter a valid email address.";
  if (rule.type === "telephone" && !/^[0-9+() \-]{7,}$/.test(text)) return rule.message || "Enter a valid telephone number.";
  if (rule.type === "currency" && numberValue(text) <= 0) return rule.message || "Enter a valid amount.";
  if (rule.type === "date" && Number.isNaN(new Date(text).getTime())) return rule.message || "Enter a valid date.";
  if (rule.type === "flightNumber" && !/^[A-Z0-9]{2,4}\s?[0-9]{1,4}[A-Z]?$/i.test(text)) return rule.message || "Enter a valid flight number.";
  if (rule.minLength && text.length < rule.minLength) return rule.message || "Enter more detail.";
  if (rule.custom) return rule.custom(value, data) || null;
  return null;
}

class ValidationEngine {
  constructor(rules) {
    this.rules = rules || [];
  }

  validate(data, context) {
    const errors = [];
    const warnings = [];
    this.rules.forEach((rule) => {
      if (rule.when && !rule.when(data, context)) return;
      const result = validateRule(rule, data || {});
      if (!result) return;
      (rule.warning ? warnings : errors).push({ field: rule.field, message: result });
    });
    return { valid: errors.length === 0, errors, warnings };
  }
}

module.exports = { ValidationEngine, validateRule };

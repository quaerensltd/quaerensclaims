"use strict";

function normaliseText(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

function fallback(value, label) {
  const text = normaliseText(value);
  return text || (label || "Not provided");
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function preventDuplicatedWords(value) {
  return String(value == null ? "" : value).replace(/\b(\w+)(\s+\1\b)+/gi, "$1");
}

function slug(value) {
  return normaliseText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

module.exports = { normaliseText, fallback, escapeHtml, preventDuplicatedWords, slug };

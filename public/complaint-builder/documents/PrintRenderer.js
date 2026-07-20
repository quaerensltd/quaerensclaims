"use strict";

const { escapeHtml } = require("../utilities/text");

function renderPrintHtml(model) {
  return '<article class="qcbf-print-document">' + (model.sections || []).map((section) => {
    if (section.type === "heading") return "<h" + (section.level || 2) + ">" + escapeHtml(section.text) + "</h" + (section.level || 2) + ">";
    if (section.type === "paragraph") return "<p>" + escapeHtml(section.text) + "</p>";
    if (section.type === "callout") return '<p class="qcbf-callout">' + escapeHtml(section.text) + "</p>";
    if (section.type === "checklist") return "<ul>" + (section.items || []).map((item) => "<li>" + escapeHtml(item) + "</li>").join("") + "</ul>";
    if (section.type === "keyValue") return "<dl>" + (section.rows || []).map((row) => "<dt>" + escapeHtml(row[0]) + "</dt><dd>" + escapeHtml(row[1]) + "</dd>").join("") + "</dl>";
    return "";
  }).join("") + "</article>";
}

module.exports = { renderPrintHtml };

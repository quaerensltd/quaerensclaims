"use strict";

const { escapeHtml } = require("../utilities/text");

function statusBadge(label, tone) {
  return '<span class="qcbf-badge qcbf-badge-' + escapeHtml(tone || "neutral") + '">' + escapeHtml(label) + "</span>";
}

function emptyState(title, text) {
  return '<div class="qcbf-empty"><strong>' + escapeHtml(title) + "</strong><p>" + escapeHtml(text || "") + "</p></div>";
}

function progressIndicator(current, total, label) {
  const percent = total ? Math.round((current / total) * 100) : 0;
  return '<div class="qcbf-progress" aria-label="' + escapeHtml(label || "Progress") + '"><span style="width:' + percent + '%"></span></div>';
}

function resourceList(resources) {
  return '<ol class="qcbf-resource-list">' + (resources || []).map((resource) => '<li><a href="' + escapeHtml(resource.url) + '" rel="noopener noreferrer" target="_blank">' + escapeHtml(resource.label) + "</a></li>").join("") + "</ol>";
}

module.exports = { statusBadge, emptyState, progressIndicator, resourceList };

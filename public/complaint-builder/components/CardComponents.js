"use strict";

const { escapeHtml } = require("../utilities/text");
const { statusBadge } = require("./Components");

function card(type, options) {
  const o = options || {};
  const classes = ["qcbf-card", "qcbf-card-" + escapeHtml(type || "overview")].concat(o.classes || []).join(" ");
  const badges = (o.badges || []).map((badge) => typeof badge === "string" ? statusBadge(badge, "neutral") : statusBadge(badge.label, badge.tone)).join("");
  const body = o.html || [
    o.text ? "<p>" + escapeHtml(o.text) + "</p>" : "",
    list(o.items)
  ].join("");
  return [
    '<article class="' + classes + '">',
    o.kicker ? '<p class="qcbf-card-kicker">' + escapeHtml(o.kicker) + "</p>" : "",
    o.title ? '<h3>' + escapeHtml(o.title) + "</h3>" : "",
    badges ? '<div class="qcbf-card-badges">' + badges + "</div>" : "",
    body,
    o.action ? '<a class="qcbf-card-action" href="' + escapeHtml(o.action.href || "#") + '">' + escapeHtml(o.action.label || "Open") + "</a>" : "",
    "</article>"
  ].join("");
}

function list(items) {
  if (!items || !items.length) return "";
  return "<ul>" + items.map((item) => "<li>" + escapeHtml(item) + "</li>").join("") + "</ul>";
}

function overviewCard(options) { return card("overview", options); }
function timelineCard(options) { return card("timeline", options); }
function evidenceCard(options) { return card("evidence", options); }
function readinessCard(options) { return card("readiness", options); }
function confidenceCard(options) { return card("confidence", options); }
function organisationCard(options) { return card("organisation", options); }
function submissionCard(options) { return card("submission", options); }
function downloadsCard(options) { return card("downloads", options); }
function financialCard(options) { return card("financial", options); }

module.exports = {
  card,
  overviewCard,
  timelineCard,
  evidenceCard,
  readinessCard,
  confidenceCard,
  organisationCard,
  submissionCard,
  downloadsCard,
  financialCard
};

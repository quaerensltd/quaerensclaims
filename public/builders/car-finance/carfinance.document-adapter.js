"use strict";

const config = require("./carfinance.config");
const { documentModel, heading, paragraph } = require("../../complaint-builder/documents/DocumentModel");

const SECTION_NAMES = [
  "cover",
  "client summary",
  "vehicle summary",
  "agreement summary",
  "financial analysis",
  "complaint grounds",
  "redress estimate",
  "complaint letter",
  "evidence checklist",
  "timeline",
  "lender submission",
  "disclaimer"
];

const DOC_KEY_MAP = {
  cover: ["summary"],
  "client summary": ["summary"],
  "vehicle summary": ["agreementAnalysis", "agreementReview"],
  "agreement summary": ["agreementAnalysis", "knownRequest"],
  "financial analysis": ["financial"],
  "complaint grounds": ["letter", "informationRequest"],
  "redress estimate": ["redress"],
  "complaint letter": ["letter"],
  "evidence checklist": ["evidence"],
  timeline: ["timeline"],
  "lender submission": ["submissionDetails", "smartSubmission", "submission", "email"],
  disclaimer: ["disclaimer", "resources"]
};

function toDocumentModel(currentDocs, options) {
  const docs = currentDocs || {};
  const opts = options || {};
  const sections = SECTION_NAMES.map((name) => {
    const body = (DOC_KEY_MAP[name] || [])
      .map((key) => docs[key])
      .filter(Boolean)
      .join("\n\n");
    return {
      id: name.replace(/[^a-z0-9]+/g, "-"),
      name,
      nodes: [
        heading(name.replace(/\b\w/g, (char) => char.toUpperCase()), 2),
        paragraph(body || "Section scaffolded for QCBF Phase 1. Current Car Finance renderer remains authoritative.")
      ]
    };
  });

  return documentModel({
    builderId: config.id,
    title: config.documentTitle,
    packReference: opts.packReference || ""
  }, sections);
}

module.exports = { SECTION_NAMES, DOC_KEY_MAP, toDocumentModel };

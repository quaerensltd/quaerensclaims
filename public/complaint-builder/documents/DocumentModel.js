"use strict";

function documentModel(meta, sections) {
  return {
    meta: Object.assign({ generatedAt: new Date().toISOString() }, meta || {}),
    sections: (sections || []).filter(Boolean)
  };
}

function heading(text, level) { return { type: "heading", level: level || 2, text }; }
function paragraph(text) { return text ? { type: "paragraph", text } : null; }
function keyValue(title, rows) { return { type: "keyValue", title, rows: rows || [] }; }
function table(title, columns, rows) { return { type: "table", title, columns: columns || [], rows: rows || [] }; }
function checklist(title, items) { return { type: "checklist", title, items: items || [] }; }
function callout(text, tone) { return { type: "callout", tone: tone || "info", text }; }
function pageBreak() { return { type: "pageBreak" }; }

module.exports = { documentModel, heading, paragraph, keyValue, table, checklist, callout, pageBreak };

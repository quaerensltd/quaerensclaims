"use strict";

const { preventDuplicatedWords } = require("../utilities/text");

function renderText(model) {
  const lines = [];
  lines.push("QUAERENS COMPLAINT PACK™", "Powered by the Quaerens Evidence Engine™", "");
  if (model.meta && model.meta.title) lines.push(model.meta.title.toUpperCase(), "");
  if (model.meta && model.meta.packReference) lines.push("Pack reference: " + model.meta.packReference, "");
  (model.sections || []).forEach((section) => {
    if (section.type === "heading") lines.push(section.text.toUpperCase(), "");
    if (section.type === "paragraph") lines.push(section.text, "");
    if (section.type === "callout") lines.push(section.text, "");
    if (section.type === "keyValue") {
      if (section.title) lines.push(section.title, "");
      (section.rows || []).forEach((row) => lines.push(row[0] + ": " + row[1]));
      lines.push("");
    }
    if (section.type === "table") {
      if (section.title) lines.push(section.title, "");
      (section.rows || []).forEach((row) => lines.push(row.join(" | ")));
      lines.push("");
    }
    if (section.type === "checklist") {
      if (section.title) lines.push(section.title, "");
      (section.items || []).forEach((item) => lines.push("- " + item));
      lines.push("");
    }
    if (section.type === "pageBreak") lines.push("", "---", "");
  });
  return preventDuplicatedWords(lines.join("\n").replace(/\n{3,}/g, "\n\n")).trim() + "\n";
}

module.exports = { renderText };

"use strict";

const { renderText } = require("./TextRenderer");

function renderPdf(model, jsPDFFactory) {
  const factory = jsPDFFactory || (typeof window !== "undefined" && window.jspdf && window.jspdf.jsPDF);
  if (!factory) return null;
  const doc = new factory({ unit: "pt", format: "a4" });
  const lines = renderText(model).split("\n");
  let y = 56;
  lines.forEach((line) => {
    if (y > 780) {
      doc.addPage();
      y = 56;
    }
    doc.text(String(line).slice(0, 110), 48, y);
    y += 16;
  });
  return doc;
}

module.exports = { renderPdf };

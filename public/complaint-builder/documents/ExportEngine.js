"use strict";

const { renderText } = require("./TextRenderer");
const { renderRtf } = require("./RTFRenderer");
const { renderPrintHtml } = require("./PrintRenderer");
const { renderPdf } = require("./PDFRenderer");

function exportComplaintPack(model, formats) {
  const wanted = formats && formats.length ? formats : ["txt", "rtf", "print", "pdf"];
  const output = {};
  wanted.forEach((format) => {
    if (format === "txt") output.txt = renderText(model);
    if (format === "rtf") output.rtf = renderRtf(model);
    if (format === "print") output.print = renderPrintHtml(model);
    if (format === "pdf") output.pdf = renderPdf(model);
  });
  return output;
}

module.exports = { exportComplaintPack };

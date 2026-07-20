"use strict";

const { escapeHtml } = require("../utilities/text");

function downloadPanel(labels) {
  const l = Object.assign({
    pdf: "Download Complete PDF",
    rtf: "Download Editable Word or RTF",
    txt: "Download Plain Text Version",
    copy: "Copy This Document",
    print: "Print My Complaint Pack"
  }, labels || {});
  return [
    ["pdf", l.pdf],
    ["rtf", l.rtf],
    ["txt", l.txt],
    ["copy", l.copy],
    ["print", l.print]
  ].map(([id, label]) => '<button type="button" class="btn btn-outline" data-qcbf-download="' + id + '">' + escapeHtml(label) + "</button>").join("");
}

module.exports = { downloadPanel };

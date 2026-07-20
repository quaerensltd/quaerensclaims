"use strict";

const { renderText } = require("./TextRenderer");

function escapeRtf(value) {
  return String(value).replace(/[\\{}]/g, "").replace(/\n/g, "\\par ");
}

function renderRtf(model) {
  return "{\\rtf1\\ansi\\deff0 " + escapeRtf(renderText(model)) + "}";
}

module.exports = { renderRtf };

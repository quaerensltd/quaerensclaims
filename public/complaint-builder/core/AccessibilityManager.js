"use strict";

function announce(message, region) {
  if (!region) return message;
  region.textContent = message;
  return message;
}

function focusFirstInvalid(root) {
  if (!root || !root.querySelector) return null;
  const field = root.querySelector("[aria-invalid='true'], .is-invalid, .error input, .error select, .error textarea");
  if (field && field.focus) field.focus();
  return field || null;
}

function accordionButton(button, expanded) {
  if (!button || !button.setAttribute) return;
  button.setAttribute("aria-expanded", expanded ? "true" : "false");
}

module.exports = { announce, focusFirstInvalid, accordionButton };

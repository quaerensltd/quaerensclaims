"use strict";

// The corporate emails use a white content background. Use the navy/blue
// transparent brand asset; the white public-footer variant is invisible in
// common email clients on that background.
const LOGO_URL = "https://www.quaerens.co.uk/images/quaerens-logo.png";
const PHONE_DISPLAY = "(+44) 0208 0500 725";
const PHONE_URI = "+442080500725";
const WHATSAPP_DISPLAY = "+442080500725";
const WHATSAPP_URL = "https://wa.me/442080500725";

const escapeHtml = value => String(value == null ? "" : value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function plainBodyToHtml(body) {
  return escapeHtml(body)
    .replace(/(https:\/\/www\.quaerens\.co\.uk\/[^\s<]+)/g, '<a href="$1" style="color:#145dcc;word-break:break-word">$1</a>')
    .replace(/\n/g, "<br>");
}

function corporateFooterText() {
  return [
    "--------------------------------",
    "QUAERENS",
    `Telephone: ${PHONE_DISPLAY}`,
    `WhatsApp: ${WHATSAPP_DISPLAY}`,
    "",
    "Quaerens Ltd",
    "Assessment & Processing Department",
    "3rd Floor, Broadstone Mill",
    "Stockport Business and Innovation Centre",
    "SK5 7DL",
    "Stockport",
    "United Kingdom",
    "",
    "Quaerens Ltd",
    "Administration, Media & Correspondence Department",
    "71-75 Shelton Street",
    "Covent Garden",
    "WC2H 9JQ",
    "London",
    "United Kingdom",
    "",
    "Webpage: https://www.quaerens.co.uk",
    "Email: info@quaerens.co.uk",
    "",
    "Confidentiality Notice:",
    "This email and any attachments are intended only for the person or organisation they are addressed to. If you are not the intended recipient, please notify the sender, delete the email, and do not copy, share, disclose, or act on its contents.",
    "",
    "Data Protection:",
    "This email may contain personal data and should be handled in accordance with applicable data protection laws, including UK GDPR. Quaerens Ltd is registered with the Information Commissioner's Office (ICO), registration reference: ZC158981.",
    "",
    "Disclaimer:",
    "Any views expressed are those of the sender unless expressly stated otherwise. This email does not constitute legal, financial, or professional advice unless confirmed in writing. Quaerens Ltd accepts no liability for loss or damage arising from this email or any attachments, except where liability cannot be excluded by law.",
    "",
    "Quaerens Ltd, registered in England & Wales.",
  ].join("\n");
}

function corporateFooterHtml() {
  const small = "margin:0 0 8px;color:#536174;font-size:12px;line-height:1.5";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;margin-top:28px;border-top:1px solid #ccd6e3;font-family:Arial,sans-serif;color:#172033"><tr><td style="padding:22px 0 0;word-break:normal;overflow-wrap:anywhere"><img src="${LOGO_URL}" alt="Quaerens" width="180" style="display:block;width:180px;max-width:100%;height:auto;border:0;margin:0 0 16px"><p style="margin:0 0 12px;font-size:14px;line-height:1.6"><strong>Telephone:</strong> <a href="tel:${PHONE_URI}" style="color:#145dcc">${PHONE_DISPLAY}</a><br><strong>WhatsApp:</strong> <a href="${WHATSAPP_URL}" style="color:#145dcc">${WHATSAPP_DISPLAY}</a></p><p style="margin:0 0 12px;font-size:13px;line-height:1.55"><strong>Quaerens Ltd<br>Assessment &amp; Processing Department</strong><br>3rd Floor, Broadstone Mill<br>Stockport Business and Innovation Centre<br>SK5 7DL, Stockport<br>United Kingdom</p><p style="margin:0 0 12px;font-size:13px;line-height:1.55"><strong>Quaerens Ltd<br>Administration, Media &amp; Correspondence Department</strong><br>71-75 Shelton Street<br>Covent Garden<br>WC2H 9JQ, London<br>United Kingdom</p><p style="margin:0 0 18px;font-size:13px;line-height:1.55"><strong>Webpage:</strong> <a href="https://www.quaerens.co.uk" style="color:#145dcc">www.quaerens.co.uk</a><br><strong>Email:</strong> <a href="mailto:info@quaerens.co.uk" style="color:#145dcc">info@quaerens.co.uk</a></p><p style="${small}"><strong>Confidentiality Notice:</strong> This email and any attachments are intended only for the person or organisation they are addressed to. If you are not the intended recipient, please notify the sender, delete the email, and do not copy, share, disclose, or act on its contents.</p><p style="${small}"><strong>Data Protection:</strong> This email may contain personal data and should be handled in accordance with applicable data protection laws, including UK GDPR. Quaerens Ltd is registered with the Information Commissioner&#39;s Office (ICO), registration reference: ZC158981.</p><p style="${small}"><strong>Disclaimer:</strong> Any views expressed are those of the sender unless expressly stated otherwise. This email does not constitute legal, financial, or professional advice unless confirmed in writing. Quaerens Ltd accepts no liability for loss or damage arising from this email or any attachments, except where liability cannot be excluded by law.</p><p style="margin:12px 0 0;color:#536174;font-size:12px;line-height:1.5">Quaerens Ltd, registered in England &amp; Wales.</p></td></tr></table>`;
}

function renderCrm2CorporateEmail(bodyText) {
  return {
    text: `${bodyText}\n\n${corporateFooterText()}`,
    html: `<div style="margin:0;padding:0;font-family:Arial,sans-serif;color:#172033;font-size:15px;line-height:1.65;max-width:680px">${plainBodyToHtml(bodyText)}${corporateFooterHtml()}</div>`,
  };
}

module.exports = { renderCrm2CorporateEmail, corporateFooterHtml, corporateFooterText, LOGO_URL };

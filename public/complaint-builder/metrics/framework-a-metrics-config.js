export const FRAMEWORK_A_VERSION = "1.4";
export const FRAMEWORK_A_BUILDERS = Object.freeze({
  airbnb: "Airbnb",
  section75: "Section 75",
  "holiday-compensation": "Holiday Compensation",
  "flight-claim": "Flight Claim"
});
export const FRAMEWORK_A_EVENTS = Object.freeze([
  "pack_started", "pack_completed", "pdf_downloaded", "word_downloaded",
  "txt_downloaded", "print_selected", "complaint_letter_copied",
  "cover_email_copied", "guided_support_clicked", "honest_review_clicked",
  "share_tool_clicked"
]);
export const METRICS_ENDPOINT = "https://us-central1-quaerensclaims.cloudfunctions.net/recordFrameworkAMetric";

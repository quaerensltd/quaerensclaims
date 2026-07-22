"use strict";

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"), require("./flight.compensation"), require("./flight.submission"));
  else {
    root.QCBFFlight = root.QCBFFlight || {};
    root.QCBFFlight.card = factory(root.QCBFFlight.analysis, root.QCBFFlight.compensation, root.QCBFFlight.submission);
  }
})(typeof window !== "undefined" ? window : globalThis, function (analysis, compensation, submission) {
  function esc(value) {
    return String(value == null || value === "" ? "Not known" : value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function badge(text, tone) {
    return '<span class="flight-card-badge flight-card-badge-' + esc(tone || "neutral") + '">' + esc(text) + "</span>";
  }

  function row(label, value) {
    return '<div class="flight-card-row"><span>' + esc(label) + '</span><strong>' + esc(value) + "</strong></div>";
  }

  function flightCardStyles() {
    return [
      ".qcbf-flight-card{background:#fff;border:1px solid #dbeafe;border-radius:20px;padding:1.2rem;box-shadow:0 18px 42px rgba(15,23,42,.12);color:#0f172a}",
      ".flight-card-top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}",
      ".flight-card-label{margin:0;color:#1d4ed8;font-weight:900;text-transform:uppercase;letter-spacing:.06em;font-size:.8rem}",
      ".qcbf-flight-card h3{margin:.15rem 0;font-size:clamp(2rem,5vw,3.4rem);line-height:.98}",
      ".flight-card-route{margin:.25rem 0 0;color:#475569;font-weight:800}",
      ".flight-card-estimate{background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:1rem;min-width:250px}",
      ".flight-card-estimate span{display:block;color:#1e3a8a;font-weight:900;font-size:.82rem;text-transform:uppercase;letter-spacing:.04em}",
      ".flight-card-estimate strong{display:block;color:#1d4ed8;font-size:1.7rem;margin:.2rem 0}",
      ".flight-card-estimate small{color:#475569;font-weight:700}",
      ".flight-card-badges{display:flex;flex-wrap:wrap;gap:.45rem;margin:1rem 0}",
      ".flight-card-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.38rem .6rem;font-weight:900;font-size:.78rem;background:#eef2ff;color:#1e3a8a}",
      ".flight-card-badge-success{background:#dcfce7;color:#166534}",
      ".flight-card-badge-warning{background:#fff7ed;color:#9a3412}",
      ".flight-card-grid,.flight-card-submission{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.65rem;margin-top:.8rem}",
      ".flight-card-row{border:1px solid #e2e8f0;border-radius:14px;padding:.75rem;background:#f8fafc}",
      ".flight-card-row span{display:block;color:#64748b;font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.2rem}",
      ".flight-card-row strong{color:#0f172a}",
      ".flight-card-actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1rem}",
      "@media(max-width:760px){.flight-card-top{display:block}.flight-card-estimate{margin-top:1rem;min-width:0}.flight-card-actions .btn{width:100%}}"
    ].join("\n");
  }

  function renderFlightCard(data, options) {
    const records = (options && options.records) || {};
    const a = analysis.normaliseAnswers(data || {});
    const c = compensation.analyse(a, records);
    const s = submission.resolveAirline(a, records);
    const status = a.issues.includes("cancelled") ? "Cancelled" : c.delayMinutes >= 180 ? "Delayed" : a.delayMinutes ? "On Time / Short Delay" : "Awaiting Data";
    const found = options && options.flightFound;
    const total = c.statutoryTotal ? compensation.money(c.statutoryTotal, c.currency) : "Further review required";
    const perPassenger = c.perPassenger ? compensation.money(c.perPassenger, c.currency) + " per passenger" : "No estimate shown";
    const badges = [
      badge(found ? "Flight Found" : "Awaiting Data", found ? "success" : "neutral"),
      badge(status, status === "Delayed" ? "warning" : "neutral"),
      c.statutoryTotal ? badge("Compensation Estimate Available", "success") : "",
      badge("Complaint Pack Available", "success")
    ].filter(Boolean).join("");

    return [
      '<article class="qcbf-flight-card">',
      '  <div class="flight-card-top">',
      '    <div>',
      '      <p class="flight-card-label">' + esc(a.airline || s.name || "Airline") + "</p>",
      '      <h3>' + esc(a.flightNumber || "Flight number needed") + "</h3>",
      '      <p class="flight-card-route">' + esc(analysis.routeLine(a)) + "</p>",
      "    </div>",
      '    <div class="flight-card-estimate"><span>Estimated Statutory Compensation</span><strong>' + esc(total) + "</strong><small>Estimated only. Subject to airline investigation.</small></div>",
      "  </div>",
      '  <div class="flight-card-badges">' + badges + "</div>",
      '  <div class="flight-card-grid">',
      row("Operating airline", a.operatingAirline || a.airline || s.legalName || s.name),
      row("Travel date", a.flightDate),
      row("Departure airport", a.departureAirport),
      row("Arrival airport", a.finalDestination),
      row("Scheduled departure", analysis.formatDate(a.scheduledDeparture)),
      row("Actual departure", analysis.formatDate(a.actualDeparture)),
      row("Scheduled arrival", analysis.formatDate(a.scheduledArrival)),
      row("Actual arrival", analysis.formatDate(a.actualArrival)),
      row("Arrival delay", c.delayText),
      row("Distance", c.distanceKm ? c.distanceKm + " km" : "Further review required"),
      row("Distance band", c.band),
      row("Possible regulation", c.regulation),
      row("Per passenger", perPassenger),
      row("Passenger count", c.passengers),
      row("Data confidence", options && options.dataConfidence || "Evidence-led estimate"),
      row("Last updated", options && options.lastUpdated || analysis.today()),
      "  </div>",
      '  <div class="flight-card-submission">',
      row("Preferred complaint method", s.preferred),
      row("Official complaint form", s.form || "Check airline website"),
      row("Complaint email", s.email || "Not verified locally"),
      row("Official complaints page", s.website || "Check airline website"),
      "  </div>",
      '  <div class="flight-card-actions">',
      '    <a class="btn btn-blue" href="#flight-builder">Build Complaint Pack</a>',
      '    <a class="btn btn-outline" href="#flight-builder">View Journey Analysis</a>',
      '    <a class="btn btn-outline" href="#smart-submission">View Airline Complaint Route</a>',
      '    <a class="btn btn-outline" href="#flight-builder">View Flight Details</a>',
      '    <a class="btn btn-outline" href="#flight-lookup">Search Another Flight</a>',
      "  </div>",
      "</article>"
    ].join("");
  }

  return { renderFlightCard, flightCardStyles };
});

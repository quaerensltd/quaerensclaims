(function () {
  "use strict";
  function value(form, name) { return form.elements[name]?.value || ""; }
  function set(form, name, next) { if (form.elements[name] && next != null) { form.elements[name].value = String(next).slice(0, 16); form.elements[name].dispatchEvent(new Event("input", { bubbles: true })); } }
  function minutesBetween(start, end) { const a = Date.parse(start); const b = Date.parse(end); return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, Math.round((b - a) / 60000)) : null; }
  function mount(root) {
    if (root.dataset.qcbBuilder !== "flight" || root.dataset.qcbFlightAdapter) return;
    root.dataset.qcbFlightAdapter = "true";
    const form = root.querySelector(".qcb-form");
    const button = root.querySelector("[data-qcb-flight-lookup]");
    const status = root.querySelector("[data-qcb-flight-status]");
    const compensationStatus = root.querySelector("[data-qcb-flight-compensation]");
    const unavailableGatewayLink = root.querySelector('a[href="/guided-support.html"]');
    if (unavailableGatewayLink) {
      const disabledGateway = document.createElement("span");
      disabledGateway.className = unavailableGatewayLink.className;
      disabledGateway.setAttribute("aria-disabled", "true");
      disabledGateway.textContent = "Gateway handoff not available here";
      unavailableGatewayLink.replaceWith(disabledGateway);
    }
    let lookupRecord = null;
    async function lookup() {
      const flightNumber = value(form, "flightNumber").trim(); const date = value(form, "flightDate");
      if (!flightNumber || !date) { status.textContent = "Enter a flight number and date, or continue with manual entry."; return; }
      button.disabled = true; status.textContent = "Checking the protected flight-data service…";
      try {
        const api = window.QCBFFlight?.lookup; if (!api) throw new Error("Flight lookup adapter unavailable");
        const payload = api.buildLookupPayload("exact", { flightNumber, date, departureAirport: value(form, "departureAirport") });
        let response;
        try { response = await api.requestFlightLookup(payload, { endpoint: "/api/flight-lookup" }); }
        catch (_) { response = await api.requestFlightLookup(payload, { endpoint: "https://us-central1-quaerensclaims.cloudfunctions.net/lookupFlight" }); }
        const candidate = response.flight || response.data?.flight || response.items?.[0] || response.flights?.[0] || response;
        lookupRecord = candidate;
        const mapped = api.flightToBuilderAnswers(candidate, payload);
        set(form, "airline", mapped.airline); set(form, "operatingAirline", mapped.operatingAirline); set(form, "flightNumber", mapped.flightNumber);
        set(form, "flightDate", mapped.flightDate); set(form, "departureAirport", mapped.departureAirport); set(form, "arrivalAirport", mapped.finalDestination);
        set(form, "scheduledDeparture", mapped.scheduledDeparture); set(form, "actualDeparture", mapped.actualDeparture); set(form, "scheduledArrival", mapped.scheduledArrival); set(form, "actualArrival", mapped.actualArrival);
        status.textContent = "Flight details found. Check and manually correct every field before continuing.";
        updateCompensation();
      } catch (_) { status.textContent = "No verified flight record was available. Continue using manual entry; your pack remains fully usable."; }
      finally { button.disabled = false; }
    }
    function updateCompensation() {
      const engine = window.QCBFFlight?.compensation;
      if (!engine?.analyse) { compensationStatus.textContent = "Compensation guidance is temporarily unavailable. You can continue and manually record verified figures."; return; }
      const issueMap = { "Flight delay": "late", "Cancellation": "cancelled", "Denied boarding": "denied", "Missed connection": "missedConnection", "Expenses": "expenses", "Refund": "refund" };
      const issues = Array.from(form.querySelectorAll('[name="issue"]:checked')).map(node => issueMap[node.value] || "other");
      const result = engine.analyse({
        issues,
        passengerCount: Math.max(1, Number(value(form, "passengerCount")) || 1),
        scheduledArrival: value(form, "scheduledArrival"),
        actualArrival: value(form, "actualArrival")
      }, {
        distanceKm: Number(lookupRecord?.distanceKm || lookupRecord?.distance || 0),
        departureAirport: lookupRecord?.departureAirport,
        finalDestination: lookupRecord?.arrivalAirport || lookupRecord?.finalDestination,
        airline: lookupRecord?.airline
      });
      set(form, "possibleCompensation", result.statutoryTotal || "");
      compensationStatus.textContent = result.statutoryTotal ? `Possible ${result.regulation} guidance: ${engine.money ? engine.money(result.statutoryTotal, result.currency) : result.statutoryTotal} (${result.passengers} passenger${result.passengers === 1 ? "" : "s"}). This is not a guarantee of entitlement.` : result.delayMinutes == null ? "Add scheduled and actual arrival times to calculate delay guidance." : `Recorded arrival delay: ${result.delayMinutes} minutes. ${result.note}`;
    }
    button.addEventListener("click", lookup);
    form.addEventListener("change", updateCompensation); form.addEventListener("input", event => { if (["scheduledArrival","actualArrival","passengerCount"].includes(event.target.name)) updateCompensation(); });
    updateCompensation();
  }
  document.querySelectorAll('[data-qcb-builder="flight"][data-qcb-version="4"]').forEach(mount);
}());

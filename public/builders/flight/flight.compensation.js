"use strict";

(function(root, factory) {
  const compensation = factory(root.QCBFFlight && root.QCBFFlight.analysis);
  if (typeof module === "object" && module.exports) module.exports = factory(require("./flight.analysis"));
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.compensation = compensation;
})(typeof globalThis !== "undefined" ? globalThis : this, function(analysis) {
  const EC261_COUNTRIES = new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","NO","CH"]);

  function radians(value) {
    return Number(value) * Math.PI / 180;
  }

  function getCoordinates(record) {
    if (!record) return null;
    const lat = Number(record.lat || record.latitude || (record.coordinates && record.coordinates.lat));
    const lon = Number(record.lon || record.lng || record.longitude || (record.coordinates && (record.coordinates.lon || record.coordinates.lng)));
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lat, lon };
  }

  function greatCircleKm(from, to) {
    const a = getCoordinates(from);
    const b = getCoordinates(to);
    if (!a || !b) return null;
    const dLat = radians(b.lat - a.lat);
    const dLon = radians(b.lon - a.lon);
    const lat1 = radians(a.lat);
    const lat2 = radians(b.lat);
    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
  }

  function countryCode(record, fallback) {
    return String((record && (record.countryCode || record.iso2 || record.country)) || fallback || "").toUpperCase().slice(0, 2);
  }

  function supportsUk261(airline) {
    return ["GB", "UK"].includes(countryCode(airline, airline && airline.baseCountry));
  }

  function supportsEc261(airline) {
    return EC261_COUNTRIES.has(countryCode(airline, airline && airline.baseCountry));
  }

  function regulationAnalysis(data, records) {
    const dep = records && records.departureAirport;
    const arr = records && records.finalDestination;
    const airline = records && records.airline;
    const depCode = countryCode(dep, data && data.countryDeparture);
    const arrCode = countryCode(arr, data && data.countryDestination);
    const depUk = depCode === "GB" || depCode === "UK";
    const arrUk = arrCode === "GB" || arrCode === "UK";
    const depEu = EC261_COUNTRIES.has(depCode);
    const arrEu = EC261_COUNTRIES.has(arrCode);
    const uk = depUk || (arrUk && supportsUk261(airline));
    const ec = depEu || (arrEu && supportsEc261(airline));
    let label = "Neither";
    if (uk && ec) label = "Both";
    else if (uk) label = "UK261";
    else if (ec) label = "EC261";
    if (!depCode && !arrCode) label = "Further review required";
    return { label, depCode, arrCode };
  }

  function distanceBand(distanceKm) {
    if (!distanceKm) return "Further review required";
    if (distanceKm <= 1500) return "Short haul";
    if (distanceKm <= 3500) return "Medium haul";
    return "Long haul";
  }

  function money(value, currency) {
    const n = Number(value);
    if (!n) return "";
    return (currency === "EUR" ? "€" : "£") + n.toLocaleString("en-GB");
  }

  function compensationAmount(distanceKm, currency) {
    const band = currency === "EUR" ? [250, 400, 600] : [220, 350, 520];
    if (!distanceKm) return 0;
    if (distanceKm <= 1500) return band[0];
    if (distanceKm <= 3500) return band[1];
    return band[2];
  }

  function expenseTotals(expenses) {
    return (expenses || []).reduce((totals, item) => {
      const currency = item.currency || "GBP";
      const amount = Number(item.amount);
      if (!Number.isNaN(amount)) totals[currency] = (totals[currency] || 0) + amount;
      return totals;
    }, {});
  }

  function analyse(data, records) {
    const a = analysis.normaliseAnswers(data);
    const distanceKm = records && records.distanceKm ? Math.round(Number(records.distanceKm)) : greatCircleKm(records && records.departureAirport, records && records.finalDestination);
    const regulation = regulationAnalysis(a, records || {});
    const currency = regulation.label === "EC261" ? "EUR" : "GBP";
    const passengers = analysis.passengerList(a).length;
    const delay = Number(a.delayMinutes);
    const eligibleTiming = !Number.isNaN(delay) && delay >= 180;
    const eligibleIssue = analysis.has(a, "late") || analysis.has(a, "cancelled") || analysis.has(a, "denied") || analysis.has(a, "missedConnection");
    const perPassenger = distanceKm && eligibleTiming && eligibleIssue ? compensationAmount(distanceKm, currency) : 0;
    const statutoryTotal = perPassenger * passengers;
    const expenseByCurrency = expenseTotals(a.expenses);
    return {
      regulation: regulation.label,
      distanceKm,
      distanceBand: distanceBand(distanceKm),
      currency,
      passengers,
      delayMinutes: a.delayMinutes,
      delayText: a.delayText,
      perPassenger,
      statutoryTotal,
      expenseByCurrency,
      note: perPassenger ? "Estimated only. Subject to airline investigation, evidence and any airline defence." : "Further review required before a statutory compensation estimate is shown."
    };
  }

  function totalRequestedText(data, records) {
    const result = analyse(data, records);
    const parts = [];
    if (result.statutoryTotal) parts.push(money(result.statutoryTotal, result.currency) + " estimated statutory compensation");
    Object.keys(result.expenseByCurrency).forEach(currency => parts.push(money(result.expenseByCurrency[currency], currency) + " recorded expenses"));
    return parts.length ? parts.join(" plus ") : "No monetary total calculated";
  }

  return { EC261_COUNTRIES, greatCircleKm, regulationAnalysis, distanceBand, money, compensationAmount, expenseTotals, analyse, totalRequestedText };
});

"use strict";

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function sortTimeline(events) {
  return (events || [])
    .filter(Boolean)
    .filter((event) => event.date || event.description || event.label)
    .slice()
    .sort((a, b) => {
      const ad = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
}

module.exports = { formatDate, formatDateTime, sortTimeline };

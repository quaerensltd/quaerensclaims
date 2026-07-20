"use strict";

function evaluateCondition(condition, data) {
  if (!condition) return true;
  if (typeof condition === "function") return !!condition(data);
  if (condition.any) return condition.any.some((item) => evaluateCondition(item, data));
  if (condition.all) return condition.all.every((item) => evaluateCondition(item, data));
  const value = String(condition.field || "").split(".").filter(Boolean).reduce((node, key) => node && node[key], data);
  if (condition.equals !== undefined) return value === condition.equals;
  if (condition.includes !== undefined) return Array.isArray(value) && value.includes(condition.includes);
  if (condition.exists) return value !== undefined && value !== null && String(value).trim() !== "";
  return false;
}

module.exports = { evaluateCondition };

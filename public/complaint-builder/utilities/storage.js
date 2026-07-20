"use strict";

function namespace(builderId, version) {
  return "qcbf:" + String(builderId || "builder") + ":" + String(version || 1);
}

function safeStorage(storage) {
  const memory = {};
  const target = storage || (typeof window !== "undefined" ? window.localStorage : null);
  return {
    getItem(key) {
      try { return target ? target.getItem(key) : memory[key] || null; } catch (_) { return memory[key] || null; }
    },
    setItem(key, value) {
      try { if (target) target.setItem(key, value); else memory[key] = value; } catch (_) { memory[key] = value; }
    },
    removeItem(key) {
      try { if (target) target.removeItem(key); else delete memory[key]; } catch (_) { delete memory[key]; }
    }
  };
}

module.exports = { namespace, safeStorage };

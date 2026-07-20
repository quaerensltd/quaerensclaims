"use strict";

const { createPackReference } = require("../utilities/packReference");
const { namespace, safeStorage } = require("../utilities/storage");

function clone(value) {
  return JSON.parse(JSON.stringify(value == null ? {} : value));
}

function pathParts(path) {
  return Array.isArray(path) ? path : String(path || "").split(".").filter(Boolean);
}

class StateManager {
  constructor(config, options) {
    this.config = config || {};
    this.version = this.config.schemaVersion || 1;
    this.storageKey = namespace(this.config.storageNamespace || this.config.id, this.version);
    this.storage = safeStorage(options && options.storage);
    this.state = clone((options && options.initialState) || this.config.initialState || {});
    this.state.meta = this.state.meta || {};
    if (!this.state.meta.packReference) {
      this.state.meta.packReference = createPackReference(this.config.packPrefix || "QC");
    }
  }

  get(path, fallback) {
    let node = this.state;
    for (const part of pathParts(path)) {
      if (node == null || !Object.prototype.hasOwnProperty.call(node, part)) return fallback;
      node = node[part];
    }
    return node == null ? fallback : node;
  }

  set(path, value) {
    const parts = pathParts(path);
    let node = this.state;
    parts.slice(0, -1).forEach((part) => {
      if (!node[part] || typeof node[part] !== "object") node[part] = {};
      node = node[part];
    });
    node[parts[parts.length - 1]] = value;
    return this.state;
  }

  update(path, updater) {
    return this.set(path, updater(this.get(path)));
  }

  add(path, item) {
    const list = Array.isArray(this.get(path)) ? this.get(path) : [];
    list.push(Object.assign({ id: createPackReference("I").slice(-6) }, item || {}));
    this.set(path, list);
    return list;
  }

  remove(path, id) {
    const list = Array.isArray(this.get(path)) ? this.get(path) : [];
    const next = list.filter((item) => item && item.id !== id);
    this.set(path, next);
    return next;
  }

  save() {
    const payload = { schemaVersion: this.version, savedAt: new Date().toISOString(), state: this.state };
    this.storage.setItem(this.storageKey, JSON.stringify(payload));
    return payload;
  }

  restore() {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return null;
    const payload = JSON.parse(raw);
    if (!payload || !payload.state) return null;
    this.state = Object.assign({}, clone(this.config.initialState || {}), payload.state);
    return this.state;
  }

  clear() {
    this.storage.removeItem(this.storageKey);
  }
}

module.exports = { StateManager };

"use strict";

class AutosaveManager {
  constructor(stateManager, options) {
    this.stateManager = stateManager;
    this.enabled = !!(options && options.enabled);
    this.onStatus = (options && options.onStatus) || function () {};
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  saveIfEnabled() {
    if (!this.enabled) return null;
    const payload = this.stateManager.save();
    this.onStatus("Progress saved on this device.");
    return payload;
  }
}

module.exports = { AutosaveManager };

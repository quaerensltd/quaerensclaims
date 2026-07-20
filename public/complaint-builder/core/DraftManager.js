"use strict";

class DraftManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  restore() {
    return this.stateManager.restore();
  }

  clear() {
    this.stateManager.clear();
    return true;
  }
}

module.exports = { DraftManager };

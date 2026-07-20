"use strict";

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, handler) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this.listeners[event] = (this.listeners[event] || []).filter((item) => item !== handler);
  }

  emit(event, payload) {
    (this.listeners[event] || []).forEach((handler) => handler(payload));
  }
}

module.exports = { EventBus };

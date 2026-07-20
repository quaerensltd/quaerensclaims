"use strict";

class ErrorManager {
  constructor() {
    this.errors = [];
  }

  add(code, message, detail) {
    const error = { code, message, detail: detail || "" };
    this.errors.push(error);
    return error;
  }

  clear() {
    this.errors = [];
  }

  publicErrors() {
    return this.errors.map((error) => ({ code: error.code, message: error.message }));
  }
}

module.exports = { ErrorManager };

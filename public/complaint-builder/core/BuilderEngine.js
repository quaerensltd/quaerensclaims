"use strict";

const { StateManager } = require("./StateManager");
const { StepController } = require("./StepController");
const { ValidationEngine } = require("./ValidationEngine");
const { EventBus } = require("./EventBus");
const { AutosaveManager } = require("./AutosaveManager");
const { DraftManager } = require("./DraftManager");
const { ErrorManager } = require("./ErrorManager");

class BuilderEngine {
  constructor(config, options) {
    this.config = config || {};
    this.events = new EventBus();
    this.errors = new ErrorManager();
    this.state = new StateManager(this.config, options);
    this.steps = new StepController(this.config.stages);
    this.validation = new ValidationEngine(this.config.validation || []);
    this.autosave = new AutosaveManager(this.state, options && options.autosave);
    this.drafts = new DraftManager(this.state);
  }

  collect() {
    return this.state.state;
  }

  validate(context) {
    return this.validation.validate(this.collect(), context);
  }

  next(context) {
    const result = this.validate(context);
    if (!result.valid) {
      this.events.emit("validation:error", result);
      return { advanced: false, validation: result, step: this.steps.current() };
    }
    const step = this.steps.next();
    this.events.emit("step:changed", step);
    this.autosave.saveIfEnabled();
    return { advanced: true, validation: result, step };
  }
}

module.exports = { BuilderEngine };

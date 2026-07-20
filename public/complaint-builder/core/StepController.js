"use strict";

class StepController {
  constructor(stages) {
    this.stages = stages && stages.length ? stages : [{ id: "start", label: "Start" }];
    this.index = 0;
  }

  current() {
    return Object.assign({ number: this.index + 1, total: this.stages.length }, this.stages[this.index]);
  }

  progress() {
    return Math.round(((this.index + 1) / this.stages.length) * 100);
  }

  next() {
    this.index = Math.min(this.index + 1, this.stages.length - 1);
    return this.current();
  }

  previous() {
    this.index = Math.max(this.index - 1, 0);
    return this.current();
  }

  goTo(idOrIndex) {
    const next = typeof idOrIndex === "number" ? idOrIndex : this.stages.findIndex((stage) => stage.id === idOrIndex);
    if (next >= 0 && next < this.stages.length) this.index = next;
    return this.current();
  }
}

module.exports = { StepController };

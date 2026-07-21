"use strict";

const { documentModel } = require("./DocumentModel");
const { createPackReference } = require("../utilities/packReference");

class ComplaintPack {
  constructor(meta, sections) {
    this.model = documentModel(Object.assign({
      title: "Quaerens Consumer Complaint File",
      packReference: meta && meta.packReference ? meta.packReference : createPackReference(meta && meta.packPrefix ? meta.packPrefix : "QC")
    }, meta || {}), sections || []);
  }

  add(section) {
    if (section) this.model.sections.push(section);
    return this;
  }

  toModel() {
    return this.model;
  }
}

function complaintPack(meta, sections) {
  return new ComplaintPack(meta, sections).toModel();
}

module.exports = { ComplaintPack, complaintPack };

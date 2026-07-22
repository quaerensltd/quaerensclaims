"use strict";

const config = require("./carfinance.config");
const { createPackReference } = require("../../complaint-builder/utilities/packReference");

function createCarFinancePackReference(existingReference, options) {
  if (isValidPackReference(existingReference)) return existingReference;
  const opts = options || {};
  return createPackReference(config.packPrefix, opts.date, opts.randomSource);
}

function isValidPackReference(reference) {
  return /^QC-\d{4}-[A-Z0-9]{6}$/.test(String(reference || ""));
}

function createDraftEnvelope(draft, options) {
  const body = draft || {};
  const existing = body.meta && body.meta.packReference ? body.meta.packReference : body.packReference;
  const packReference = createCarFinancePackReference(existing, options);
  return {
    meta: {
      builderId: config.id,
      frameworkVersion: config.frameworkVersion,
      builderVersion: config.builderVersion,
      schemaVersion: config.schemaVersion,
      draftVersion: config.draftVersion,
      storageNamespace: config.storageNamespace,
      packReference
    },
    step: body.step || 1,
    answers: body.answers || {},
    packReference
  };
}

function normaliseDraftEnvelope(rawDraft, options) {
  const parsed = typeof rawDraft === "string" ? JSON.parse(rawDraft) : rawDraft || {};
  if (parsed.meta && parsed.answers) return createDraftEnvelope(parsed, options);
  return createDraftEnvelope({ step: parsed.step, answers: parsed.answers || parsed, packReference: parsed.packReference }, options);
}

const storageKeys = {
  session: config.draftStorageKey,
  remembered: config.rememberedDraftStorageKey,
  legacy: config.legacyStorageKeys.slice()
};

module.exports = {
  createCarFinancePackReference,
  createDraftEnvelope,
  normaliseDraftEnvelope,
  isValidPackReference,
  storageKeys
};

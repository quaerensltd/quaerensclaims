"use strict";

const { QCBF_VERSION_LABEL } = require("../version");

class BuilderRegistry {
  constructor(options) {
    this.frameworkVersion = options && options.frameworkVersion ? options.frameworkVersion : QCBF_VERSION_LABEL;
    this.builders = new Map();
  }

  register(config, details) {
    if (!config || !config.id) throw new Error("Builder registration requires an id");
    const record = normaliseBuilder(config, details);
    this.builders.set(record.id, record);
    return record;
  }

  get(id) {
    return this.builders.get(id) || null;
  }

  list() {
    return Array.from(this.builders.values()).sort((a, b) => a.id.localeCompare(b.id));
  }

  migrationStatus() {
    return this.list().map((builder) => ({
      id: builder.id,
      title: builder.title,
      version: builder.version,
      status: builder.status,
      modules: builder.modules,
      resources: builder.resources,
      apiIntegration: builder.apiIntegration,
      exportSupport: builder.exportSupport
    }));
  }
}

function normaliseBuilder(config, details) {
  const extra = details || {};
  return {
    id: config.id,
    title: config.productName || config.title || config.pageTitle || config.id,
    shortName: config.shortName || config.id,
    version: config.builderVersion || config.version || config.frameworkVersion || "1.0",
    frameworkVersion: config.frameworkVersion || QCBF_VERSION_LABEL,
    packPrefix: config.packPrefix || "QC",
    stages: (config.stages || []).map((stage) => ({ id: stage.id, label: stage.label || stage.id })),
    modules: extra.modules || config.modules || [],
    resources: extra.resources || config.resources || [],
    status: extra.status || config.status || "registered",
    publicUrl: config.canonicalUrl || extra.publicUrl || "",
    storageNamespace: config.storageNamespace || config.storageKey || "",
    apiIntegration: extra.apiIntegration || config.apiIntegration || null,
    exportSupport: extra.exportSupport || config.exportSupport || []
  };
}

function createDefaultRegistry(builders) {
  const registry = new BuilderRegistry();
  (builders || []).forEach((entry) => {
    if (entry && entry.config) registry.register(entry.config, entry);
    else if (entry) registry.register(entry);
  });
  return registry;
}

module.exports = { BuilderRegistry, createDefaultRegistry, normaliseBuilder };

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

  publicProducts() {
    return this.list()
      .filter((builder) => builder.isPublicProduct && builder.dashboardVisible !== false && builder.isLive !== false)
      .map((builder) => ({
        id: builder.id,
        productName: builder.productName,
        packName: builder.packName,
        shortName: builder.shortName,
        shortDescription: builder.shortDescription,
        category: builder.category,
        canonicalUrl: builder.canonicalUrl,
        storageNamespace: builder.storageNamespace,
        storageKeys: builder.storageKeys,
        packPrefix: builder.packPrefix,
        version: builder.version,
        status: builder.publicStatus,
        isLive: builder.isLive,
        isFree: builder.isFree,
        dashboardVisible: builder.dashboardVisible,
        supportedExports: builder.supportedExports,
        knownLimitations: builder.knownLimitations
      }));
  }
}

function normaliseBuilder(config, details) {
  const extra = details || {};
  const publicMeta = extra.publicMeta || {};
  const hasPublicMeta = Boolean(extra.publicMeta);
  return {
    id: config.id,
    internalName: publicMeta.internalName || config.id,
    title: publicMeta.productName || config.productName || config.title || config.pageTitle || config.id,
    productName: publicMeta.productName || config.productName || config.title || config.pageTitle || config.id,
    packName: publicMeta.packName || config.packName || config.productName || config.id,
    shortName: publicMeta.shortName || config.shortName || config.id,
    shortDescription: publicMeta.shortDescription || config.shortDescription || "",
    category: publicMeta.category || config.category || "Consumer Complaints",
    version: publicMeta.version || config.builderVersion || config.version || config.frameworkVersion || "1.0",
    frameworkVersion: config.frameworkVersion || QCBF_VERSION_LABEL,
    packPrefix: publicMeta.packPrefix || config.packPrefix || "QC",
    stages: (config.stages || []).map((stage) => ({ id: stage.id, label: stage.label || stage.id })),
    modules: extra.modules || config.modules || [],
    resources: extra.resources || config.resources || [],
    status: extra.status || config.status || "registered",
    publicStatus: publicMeta.status || "Available",
    publicUrl: publicMeta.canonicalUrl || config.canonicalUrl || extra.publicUrl || "",
    canonicalUrl: publicMeta.canonicalUrl || config.canonicalUrl || extra.publicUrl || "",
    dashboardUrl: publicMeta.dashboardUrl || "",
    storageNamespace: publicMeta.storageNamespace || config.storageNamespace || config.storageKey || "",
    storageKeys: publicMeta.storageKeys || [config.storageKey, config.draftStorageKey].filter(Boolean),
    apiIntegration: extra.apiIntegration || config.apiIntegration || null,
    exportSupport: extra.exportSupport || config.exportSupport || config.exports || [],
    supportedExports: publicMeta.supportedExports || extra.exportSupport || config.exportSupport || config.exports || [],
    isLive: publicMeta.isLive !== undefined ? publicMeta.isLive : true,
    isFree: publicMeta.isFree !== undefined ? publicMeta.isFree : true,
    dashboardVisible: publicMeta.dashboardVisible !== undefined ? publicMeta.dashboardVisible : true,
    isPublicProduct: hasPublicMeta,
    icon: publicMeta.icon || "",
    image: publicMeta.image || "",
    accentLabel: publicMeta.accentLabel || "",
    draftSchemaVersion: publicMeta.draftSchemaVersion || config.schemaVersion || 1,
    lastVerified: publicMeta.lastVerified || config.lastVerified || "",
    knownLimitations: publicMeta.knownLimitations || []
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

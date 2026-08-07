(function () {
  "use strict";

  const allowedCategories = new Set(["car-finance", "cruise", "train", "travel-insurance"]);
  const allowedHooks = new Set([
    "deriveFinancials", "quality", "completion", "analysis",
    "complaintLetter", "coverEmail", "pages", "coverMetadata", "fileLabel"
  ]);
  const adapters = Object.create(null);

  function validate(categoryId, adapter) {
    if (!allowedCategories.has(categoryId)) throw new Error(`Framework A adapter category is not allow-listed: ${categoryId}`);
    if (!adapter || typeof adapter !== "object") throw new TypeError("Framework A category adapter must be an object.");
    Object.keys(adapter).forEach((hook) => {
      if (!allowedHooks.has(hook)) throw new Error(`Framework A adapter hook is not permitted: ${hook}`);
      if (typeof adapter[hook] !== "function") throw new TypeError(`Framework A adapter hook must be a function: ${hook}`);
    });
    if (!adapter.pages || !adapter.complaintLetter || !adapter.coverEmail) {
      throw new Error("Framework A specialist adapters must provide pages, complaintLetter and coverEmail hooks.");
    }
  }

  function register(categoryId, adapter) {
    validate(categoryId, adapter);
    if (adapters[categoryId]) throw new Error(`Framework A adapter already registered: ${categoryId}`);
    adapters[categoryId] = Object.freeze(Object.assign(Object.create(null), adapter));
    return adapters[categoryId];
  }

  function get(categoryId) { return adapters[categoryId] || null; }

  window.QCBFrameworkACategoryAdapters = Object.freeze({
    version: "1.6",
    register,
    get,
    allowedCategories: Object.freeze(Array.from(allowedCategories)),
    allowedHooks: Object.freeze(Array.from(allowedHooks))
  });
}());

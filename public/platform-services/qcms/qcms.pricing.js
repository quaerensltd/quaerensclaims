const { SERVICE_LEVELS } = typeof require === "function" ? require("./qcms.config") : window.QuaerensQCMSConfig;

function getPricingConfig() {
  return SERVICE_LEVELS;
}

function getServiceLevel(serviceCode) {
  return SERVICE_LEVELS[serviceCode] || SERVICE_LEVELS["QCMS-REVIEW"];
}

function formatIndicativeFee(serviceLevel) {
  if (!serviceLevel || serviceLevel.standardFeePence === null) {
    return "Manual review required";
  }
  return `${serviceLevel.currency} ${(serviceLevel.standardFeePence / 100).toFixed(0)}`;
}

const QCMS_PRICING_API = {
  getPricingConfig,
  getServiceLevel,
  formatIndicativeFee
};

if (typeof module === "object" && module.exports) module.exports = QCMS_PRICING_API;
if (typeof window !== "undefined") window.QuaerensQCMSPricing = QCMS_PRICING_API;

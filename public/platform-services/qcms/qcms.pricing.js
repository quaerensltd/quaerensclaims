const { SERVICE_LEVELS } = require("./qcms.config");

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

module.exports = {
  getPricingConfig,
  getServiceLevel,
  formatIndicativeFee
};

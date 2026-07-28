const { TRANSFER_STATES, PART1A_LOCAL_ONLY_NOTICE } = require("./qcms.config");

function hasLocalStorage() {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch (error) {
    return false;
  }
}

function safeParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function readLocalCaseSummary(key) {
  if (!hasLocalStorage()) return null;
  return safeParse(window.localStorage.getItem(key), null);
}

function writeLocalCaseSummary(key, value) {
  if (!hasLocalStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function removeLocalCaseSummary(key) {
  if (!hasLocalStorage()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

const PART1A_STORAGE_POLICY = Object.freeze({
  transferStatus: TRANSFER_STATES.LOCAL_ONLY,
  localOnly: true,
  notice: PART1A_LOCAL_ONLY_NOTICE,
  sendsPersonalData: false,
  createsCRMCase: false,
  collectsPayment: false,
  createsInstruction: false
});

module.exports = {
  PART1A_STORAGE_POLICY,
  safeParse,
  readLocalCaseSummary,
  writeLocalCaseSummary,
  removeLocalCaseSummary
};

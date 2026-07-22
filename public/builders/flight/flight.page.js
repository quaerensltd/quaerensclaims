"use strict";

(function(root) {
  root.QCBFFlight = root.QCBFFlight || {};
  root.QCBFFlight.page = {
    version: "QCBF 1.2",
    publicPage: "/freeflightclaim.html",
    init: function initFlightPage() {
      root.QCBFFlight.page.loaded = true;
      return root.QCBFFlight;
    }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

"use strict";

(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QCBFParking = root.QCBFParking || {};
  root.QCBFParking.grounds = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  const groundMap = [
    { id: "paid", label: "Payment made or payment system issue", match: /paid|payment|machine|app/i },
    { id: "vrm", label: "Vehicle registration entry issue", match: /registration/i },
    { id: "signage", label: "Signage, lighting or layout concern", match: /signage|visible|lit|understand/i },
    { id: "permit", label: "Permit, authorisation or resident/user entitlement", match: /permit|authorisation/i },
    { id: "loading", label: "Loading, unloading, delivery or exemption issue", match: /loading|delivery/i },
    { id: "blue-badge", label: "Blue Badge, disability or Equality Act context", match: /Blue Badge|disability|vulnerability/i },
    { id: "breakdown", label: "Breakdown, emergency or circumstances outside normal parking", match: /broke|emergency/i },
    { id: "keeper", label: "Keeper liability, driver identity or notice compliance", match: /driver|keeper|late|defective|hirer|leaseholder|company/i },
    { id: "amount", label: "Amount, add-on fees or debt costs require checking", match: /amount|add-ons|debt/i },
    { id: "ownership", label: "Sold, cloned or unauthorised vehicle issue", match: /sold|cloned|permission/i }
  ];

  function inferGrounds(data) {
    const text = []
      .concat(data.whatHappened || [])
      .concat(data.potentialGrounds || [])
      .concat([data.narrative, data.noticeType, data.currentStage])
      .join(" ");
    const grounds = groundMap.filter(item => item.match.test(text)).map(item => item.label);
    if (/Council|local authority|TfL|Notice to Owner|tribunal/i.test([data.noticeType, data.issuerCategory, data.currentStage].join(" "))) {
      grounds.push("Council PCN statutory or procedural points may need checking against the notice wording.");
    }
    if (/Private|POPLA|IAS|operator/i.test([data.noticeType, data.issuerCategory, data.currentStage].join(" "))) {
      grounds.push("Private parking operator evidence, signage, contract and keeper-liability issues may be relevant.");
    }
    return Array.from(new Set(grounds));
  }

  return { inferGrounds, groundMap };
});

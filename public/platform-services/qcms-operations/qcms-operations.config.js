(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.QCMSOperationsConfig = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const stages = [
    "New Instruction",
    "Evidence Review",
    "Evidence Requested",
    "Complaint Preparation",
    "Ready for Submission",
    "Submitted",
    "Awaiting Response",
    "Response Received",
    "Resolved",
    "Closed"
  ];

  return {
    productName: "QCMS Operations",
    version: "1.2.0-foundation",
    stages,
    serviceLevels: [
      "Complaint Submission Service",
      "Managed Complaint Service",
      "Enhanced Managed Complaint Service"
    ],
    complaintRoutes: [
      "Solar",
      "Spray Foam Insulation",
      "Energy",
      "Caravan/Holiday Park",
      "Section 75",
      "Car Finance",
      "Broadband/Mobile",
      "Travel"
    ],
    priorities: ["Critical", "High", "Medium", "Low"],
    managers: ["Amelia Hart", "Daniel Price", "Priya Shah"],
    navigation: [
      ["dashboard", "Dashboard"],
      ["cases", "Cases"],
      ["new-instructions", "New Instructions"],
      ["assigned-cases", "Assigned Cases"],
      ["documents", "Documents"],
      ["messages", "Messages"],
      ["tasks", "Tasks"],
      ["reports", "Reports"],
      ["partners", "Partners"],
      ["administration", "Administration"]
    ]
  };
});

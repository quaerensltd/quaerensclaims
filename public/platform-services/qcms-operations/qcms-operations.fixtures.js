(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.QCMSOperationsFixtures = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const managers = [
    { id: "mgr-amelia", name: "Amelia Hart", role: "Complaint Manager" },
    { id: "mgr-daniel", name: "Daniel Price", role: "Complaint Manager" },
    { id: "mgr-priya", name: "Priya Shah", role: "Complaint Manager" }
  ];

  const cases = [
    ["QCMS-2026-0001", "Olivia Turner", "Spray Foam Insulation", "Enhanced Managed Complaint Service", "Evidence Review", "High", "Amelia Hart", "Developing", "Request missing lender comments", "2026-07-31", "Northern Retrofit Ltd", "SK5 7DL", 72, 34000],
    ["QCMS-2026-0002", "George Evans", "Solar", "Managed Complaint Service", "New Instruction", "Medium", "Daniel Price", "Limited", "Check authority and invoice pack", "2026-08-01", "Bright Roof Solar", "M21 8AA", 18, 9200],
    ["QCMS-2026-0003", "Aisha Khan", "Energy", "Complaint Submission Service", "Ready for Submission", "High", "Priya Shah", "Supported", "Final complaint review", "2026-07-30", "North Grid Energy", "B13 9QW", 88, 760],
    ["QCMS-2026-0004", "Thomas Reed", "Car Finance", "Enhanced Managed Complaint Service", "Complaint Preparation", "High", "Amelia Hart", "Supported", "Prepare lender complaint draft", "2026-08-02", "County Motor Finance", "LS2 4RT", 64, 4300],
    ["QCMS-2026-0005", "Emily Brooks", "Caravan/Holiday Park", "Managed Complaint Service", "Evidence Requested", "Medium", "Daniel Price", "Developing", "Chase site-fee history", "2026-08-04", "Coastal View Parks", "EX39 3LU", 41, 18500],
    ["QCMS-2026-0006", "Noah Bennett", "Section 75", "Complaint Submission Service", "Submitted", "Low", "Priya Shah", "Supported", "Diary response deadline", "2026-08-12", "Card Issuer A", "SW1A 1AA", 91, 1250],
    ["QCMS-2026-0007", "Mia Foster", "Broadband/Mobile", "Managed Complaint Service", "Awaiting Response", "Medium", "Amelia Hart", "Supported", "Monitor provider response", "2026-08-05", "Metro Broadband", "NE1 6EE", 77, 460],
    ["QCMS-2026-0008", "Harry Walker", "Travel", "Complaint Submission Service", "Response Received", "High", "Daniel Price", "Developing", "Review operator response", "2026-07-31", "Aero Holiday Group", "EH1 1YZ", 84, 2100],
    ["QCMS-2026-0009", "Sophia Green", "Energy", "Managed Complaint Service", "Resolved", "Low", "Priya Shah", "Supported", "Close once client confirms", "2026-08-06", "River Energy", "CF10 1EP", 96, 380],
    ["QCMS-2026-0010", "Jack Morgan", "Solar", "Enhanced Managed Complaint Service", "Evidence Review", "Critical", "Amelia Hart", "Limited", "Escalate missing finance agreement", "2026-07-30", "Eco Future Installations", "WA1 2HT", 34, 12800],
    ["QCMS-2026-0011", "Grace Hall", "Spray Foam Insulation", "Managed Complaint Service", "Complaint Preparation", "Medium", "Daniel Price", "Supported", "Complete chronology", "2026-08-03", "Home Foam Services", "YO1 7PX", 69, 22500],
    ["QCMS-2026-0012", "Leo Carter", "Car Finance", "Complaint Submission Service", "New Instruction", "Low", "Priya Shah", "Limited", "Confirm agreement type", "2026-08-07", "DriveFirst Finance", "BN1 4GH", 12, 2900],
    ["QCMS-2026-0013", "Isabella James", "Caravan/Holiday Park", "Enhanced Managed Complaint Service", "Ready for Submission", "High", "Amelia Hart", "Supported", "Approve park complaint route", "2026-07-30", "Harbour Fields", "PL1 2AA", 82, 27600],
    ["QCMS-2026-0014", "Oscar Murphy", "Travel", "Managed Complaint Service", "Evidence Requested", "Medium", "Daniel Price", "Developing", "Request hotel photographs", "2026-08-02", "Suntrail Holidays", "N1 9GU", 46, 1350],
    ["QCMS-2026-0015", "Freya Clarke", "Section 75", "Managed Complaint Service", "Submitted", "Medium", "Priya Shah", "Supported", "Track issuer final response", "2026-08-09", "Card Issuer B", "G1 3DX", 90, 5200],
    ["QCMS-2026-0016", "William Cooper", "Broadband/Mobile", "Complaint Submission Service", "Closed", "Low", "Amelia Hart", "Supported", "Archive pack", "2026-08-10", "Signal Mobile", "BS1 5TR", 100, 120],
    ["QCMS-2026-0017", "Ella Richardson", "Energy", "Enhanced Managed Complaint Service", "Billing Review", "High", "Daniel Price", "Developing", "Reconcile direct debit evidence", "2026-08-01", "Beacon Utilities", "ME14 1XX", 53, 1180],
    ["QCMS-2026-0018", "Alfie Wood", "Solar", "Complaint Submission Service", "Awaiting Response", "Medium", "Priya Shah", "Supported", "Prepare ombudsman bundle if needed", "2026-08-08", "Sunrise PV", "OX1 2JD", 79, 6400],
    ["QCMS-2026-0019", "Charlotte King", "Spray Foam Insulation", "Managed Complaint Service", "Evidence Requested", "Critical", "Amelia Hart", "Limited", "Urgent survey note request", "2026-07-30", "Attic Shield UK", "RM1 1AA", 29, 31500],
    ["QCMS-2026-0020", "James Scott", "Car Finance", "Enhanced Managed Complaint Service", "Response Received", "High", "Daniel Price", "Supported", "Assess final response gaps", "2026-08-01", "Meridian Vehicle Credit", "LE1 3AB", 86, 7400]
  ].map(function (row, index) {
    const ref = row[0];
    return {
      id: ref,
      reference: ref,
      client: row[1],
      complaintType: row[2],
      serviceLevel: row[3],
      status: row[4] === "Billing Review" ? "Evidence Review" : row[4],
      priority: row[5],
      manager: row[6],
      caseHealth: row[7],
      nextAction: row[8],
      dueDate: row[9],
      provider: row[10],
      postcode: row[11],
      progress: row[12],
      value: row[13],
      responsible: row[6],
      milestone: row[8],
      reason: "The case is at the current operational stage and needs the listed action before it can progress.",
      authorityStatus: index % 4 === 0 ? "Needs Review" : "Complete",
      evidenceCompleteness: row[7],
      complaintReadiness: row[12] > 80 ? "Ready" : row[12] > 45 ? "Developing" : "Needs Information",
      timelineCompleteness: row[12] > 70 ? "Complete" : "Developing",
      summary: "Instructed QCMS case for " + row[2].toLowerCase() + " support involving " + row[10] + ".",
      outstanding: [
        "Confirm the latest client instruction position",
        "Check evidence against the service scope",
        row[8]
      ],
      dates: {
        instructed: "2026-07-" + String(10 + (index % 15)).padStart(2, "0"),
        lastActivity: "2026-07-" + String(20 + (index % 9)).padStart(2, "0"),
        due: row[9]
      },
      activity: [
        { at: "2026-07-29 09:" + String(10 + index).padStart(2, "0"), actor: row[6], action: "Next action updated", detail: row[8] },
        { at: "2026-07-28 15:" + String(20 + index).padStart(2, "0"), actor: "QCMS", action: "Case assigned", detail: "Assigned to " + row[6] },
        { at: "2026-07-27 11:" + String(30 + index).padStart(2, "0"), actor: "QCMS", action: "Instruction received", detail: "Commercial instruction record created from QCMS." }
      ],
      timeline: [
        { date: "2026-07-12", title: "Instruction received", detail: "Authority, agreement and instruction checked in QCMS." },
        { date: "2026-07-18", title: "Evidence reviewed", detail: "Initial evidence position reviewed by complaint manager." },
        { date: row[9], title: "Next milestone", detail: row[8] }
      ],
      evidence: [
        { name: "Authority to Act", status: index % 4 === 0 ? "Needs Review" : "Complete" },
        { name: "Client Agreement", status: "Complete" },
        { name: "Core Evidence Pack", status: row[7] === "Limited" ? "Needs Evidence" : "Developing" },
        { name: "Complaint Timeline", status: row[12] > 70 ? "Complete" : "Developing" }
      ]
    };
  });

  return { managers, cases };
});

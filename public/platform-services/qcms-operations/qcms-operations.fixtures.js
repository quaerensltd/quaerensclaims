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

  const rows = [
    ["QCMS-2026-0001", "Olivia Turner", "Spray Foam Insulation", "Enhanced Managed Complaint Service", "Evidence Review", "High", "Amelia Hart", "Needs Evidence", "Request missing lender comments", "2026-07-29", "Northern Retrofit Ltd", "SK5 7DL", 72, 34000, "Waiting on Documents", "Surveyor comments have not been uploaded", "Ask client for lender and surveyor notes", 35],
    ["QCMS-2026-0002", "George Evans", "Solar", "Managed Complaint Service", "New Instruction", "Medium", "Unassigned", "Needs Evidence", "Assign manager and check authority pack", "2026-08-01", "Bright Roof Solar", "M21 8AA", 18, 9200, "Waiting on Complaint Manager", "New instruction needs triage", "Assign owner and open instruction", 20],
    ["QCMS-2026-0003", "Aisha Khan", "Energy Switch", "Complaint Submission Service", "Ready for Submission", "High", "Priya Shah", "Good", "Final complaint review", "2026-07-30", "North Grid Energy", "B13 9QW", 88, 760, "Waiting on Complaint Manager", "Pack is ready for final check", "Complete final complaint review", 25],
    ["QCMS-2026-0004", "Thomas Reed", "Car Finance", "Enhanced Managed Complaint Service", "Complaint Preparation", "High", "Amelia Hart", "Good", "Prepare lender complaint draft", "2026-08-02", "County Motor Finance", "LS2 4RT", 64, 4300, "Waiting on Complaint Manager", "Draft is next operational task", "Prepare complaint draft", 55],
    ["QCMS-2026-0005", "Emily Brooks", "Caravan/Holiday Park", "Managed Complaint Service", "Evidence Requested", "Medium", "Daniel Price", "Needs Evidence", "Chase site-fee history", "2026-08-04", "Coastal View Parks", "EX39 3LU", 41, 18500, "Waiting on Client", "Client needs to upload site-fee statements", "Send evidence reminder", 15],
    ["QCMS-2026-0006", "Noah Bennett", "Section 75", "Complaint Submission Service", "Submitted", "Low", "Priya Shah", "Excellent", "Diary response deadline", "2026-08-12", "Card Issuer A", "SW1A 1AA", 91, 1250, "Waiting on Authority", "Awaiting card issuer response", "Monitor deadline", 10],
    ["QCMS-2026-0007", "Mia Foster", "Broadband/Mobile", "Managed Complaint Service", "Awaiting Response", "Medium", "Amelia Hart", "Good", "Monitor provider response", "2026-08-05", "Metro Broadband", "NE1 6EE", 77, 460, "Waiting on Provider", "Awaiting provider final position", "Check response date", 10],
    ["QCMS-2026-0008", "Harry Walker", "Flight Delay", "Complaint Submission Service", "Response Received", "High", "Daniel Price", "Good", "Review airline response", "2026-07-31", "Aero Holiday Group", "EH1 1YZ", 84, 2100, "Waiting on Complaint Manager", "Airline response needs decision", "Assess response gaps", 40],
    ["QCMS-2026-0009", "Sophia Green", "Lost Luggage", "Managed Complaint Service", "Resolved", "Low", "Priya Shah", "Excellent", "Close once client confirms", "2026-08-06", "Riverline Airways", "CF10 1EP", 96, 380, "Waiting on Client", "Client confirmation requested", "Ask client to confirm closure", 10],
    ["QCMS-2026-0010", "Jack Morgan", "Solar", "Enhanced Managed Complaint Service", "Evidence Review", "Critical", "Amelia Hart", "Blocked", "Escalate missing finance agreement", "2026-07-27", "Eco Future Installations", "WA1 2HT", 34, 12800, "Waiting on Finance", "Finance agreement missing and overdue", "Urgently request finance agreement", 45],
    ["QCMS-2026-0011", "Grace Hall", "Spray Foam Insulation", "Managed Complaint Service", "Complaint Preparation", "Medium", "Daniel Price", "Good", "Complete chronology", "2026-08-03", "Home Foam Services", "YO1 7PX", 69, 22500, "Waiting on Complaint Manager", "Chronology needs completion", "Finish chronology", 30],
    ["QCMS-2026-0012", "Leo Carter", "Car Finance", "Complaint Submission Service", "New Instruction", "Low", "Unassigned", "Needs Evidence", "Confirm agreement type", "2026-08-07", "DriveFirst Finance", "BN1 4GH", 12, 2900, "Waiting on Client", "Agreement type not yet confirmed", "Request agreement type", 15],
    ["QCMS-2026-0013", "Isabella James", "Caravan/Holiday Park", "Enhanced Managed Complaint Service", "Ready for Submission", "High", "Amelia Hart", "Good", "Approve park complaint route", "2026-07-30", "Harbour Fields", "PL1 2AA", 82, 27600, "Waiting on Complaint Manager", "Pack is ready for approval", "Approve complaint route", 30],
    ["QCMS-2026-0014", "Oscar Murphy", "Cruise", "Managed Complaint Service", "Evidence Requested", "Medium", "Daniel Price", "Needs Evidence", "Request cruise photographs", "2026-08-02", "Suntrail Cruises", "N1 9GU", 46, 1350, "Waiting on Client", "Cabin and itinerary evidence missing", "Send document request", 15],
    ["QCMS-2026-0015", "Freya Clarke", "Section 75", "Managed Complaint Service", "Submitted", "Medium", "Priya Shah", "Excellent", "Track issuer final response", "2026-08-09", "Card Issuer B", "G1 3DX", 90, 5200, "Waiting on Authority", "Issuer response window is running", "Track response deadline", 10],
    ["QCMS-2026-0016", "William Cooper", "Broadband/Mobile", "Complaint Submission Service", "Closed", "Low", "Amelia Hart", "Excellent", "Archive pack", "2026-08-10", "Signal Mobile", "BS1 5TR", 100, 120, "Complete", "Case closed", "Archive record", 5],
    ["QCMS-2026-0017", "Ella Richardson", "Energy Switch", "Enhanced Managed Complaint Service", "Evidence Review", "High", "Daniel Price", "Needs Evidence", "Reconcile direct debit evidence", "2026-08-01", "Beacon Utilities", "ME14 1XX", 53, 1180, "Waiting on Business", "Supplier billing records need review", "Compare supplier billing records", 50],
    ["QCMS-2026-0018", "Alfie Wood", "Solar", "Complaint Submission Service", "Awaiting Response", "Medium", "Priya Shah", "Good", "Prepare ombudsman bundle if needed", "2026-08-08", "Sunrise PV", "OX1 2JD", 79, 6400, "Waiting on Provider", "Awaiting installer response", "Monitor provider response", 10],
    ["QCMS-2026-0019", "Charlotte King", "Spray Foam Insulation", "Managed Complaint Service", "Evidence Requested", "Critical", "Amelia Hart", "Blocked", "Urgent survey note request", "2026-07-28", "Attic Shield UK", "RM1 1AA", 29, 31500, "Waiting on Documents", "Survey note request is overdue", "Call client about survey notes", 35],
    ["QCMS-2026-0020", "James Scott", "Car Finance", "Enhanced Managed Complaint Service", "Response Received", "High", "Daniel Price", "Good", "Assess final response gaps", "2026-08-01", "Meridian Vehicle Credit", "LE1 3AB", 86, 7400, "Waiting on Complaint Manager", "Final response needs gap analysis", "Assess final response gaps", 45]
  ];

  const cases = rows.map(function (row, index) {
    const ref = row[0];
    const instructed = "2026-07-" + String(8 + (index % 17)).padStart(2, "0");
    const lastActivity = "2026-07-" + String(20 + (index % 9)).padStart(2, "0");
    const assignedState = row[6] === "Unassigned" ? "Unassigned" : "Assigned";
    return {
      id: ref,
      reference: ref,
      client: row[1],
      complaintType: row[2],
      serviceLevel: row[3],
      status: row[4],
      priority: row[5],
      manager: row[6],
      assignedState,
      caseHealth: row[7],
      nextAction: row[8],
      dueDate: row[9],
      provider: row[10],
      postcode: row[11],
      progress: row[12],
      value: row[13],
      waitingStatus: row[14],
      waitingReason: row[15],
      recommendedNextAction: row[16],
      estimatedEffortMinutes: row[17],
      responsible: row[6],
      milestone: row[8],
      reason: row[15],
      authorityStatus: index % 4 === 0 ? "Needs Review" : "Complete",
      evidenceCompleteness: row[7] === "Blocked" ? "Needs Evidence" : row[7],
      complaintReadiness: row[12] > 80 ? "Ready" : row[12] > 45 ? "Good" : "Needs Information",
      timelineCompleteness: row[12] > 70 ? "Complete" : "Needs Work",
      summary: "Instructed QCMS case for " + row[2].toLowerCase() + " support involving " + row[10] + ".",
      outstanding: [
        "Confirm the latest client instruction position",
        "Check evidence against the service scope",
        row[8]
      ],
      dates: {
        instructed,
        lastActivity,
        due: row[9]
      },
      activity: [
        { at: "2026-07-29 09:" + String(10 + index).padStart(2, "0"), actor: row[6], action: "Next action updated", detail: row[8] },
        { at: "2026-07-28 15:" + String(20 + index).padStart(2, "0"), actor: "QCMS", action: assignedState === "Assigned" ? "Case assigned" : "Instruction awaiting assignment", detail: assignedState === "Assigned" ? "Assigned to " + row[6] : "No Complaint Manager assigned yet" },
        { at: "2026-07-27 11:" + String(30 + index).padStart(2, "0"), actor: "QCMS", action: "Instruction received", detail: "Commercial instruction record created from QCMS." }
      ],
      timeline: [
        { date: instructed, title: "Instruction received", detail: "Authority, agreement and instruction checked in QCMS." },
        { date: lastActivity, title: "Evidence reviewed", detail: "Initial evidence position reviewed by complaint manager." },
        { date: row[9], title: "Next milestone", detail: row[8] }
      ],
      evidence: [
        { name: "Authority to Act", status: index % 4 === 0 ? "Needs Review" : "Complete" },
        { name: "Client Agreement", status: "Complete" },
        { name: "Core Evidence Pack", status: row[7] === "Blocked" || row[7] === "Needs Evidence" ? "Needs Evidence" : "Good" },
        { name: "Complaint Timeline", status: row[12] > 70 ? "Complete" : "Needs Work" }
      ]
    };
  });

  return { managers, cases };
});

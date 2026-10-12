"use strict";

const { FieldPath } = require("firebase-admin/firestore");

const crypto = require("node:crypto");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { FieldValue } = require("firebase-admin/firestore");
const { renderCrm2CorporateEmail } = require("./crm4CorporateEmail");
const { onboardingCompletionEligibility } = require("./crm4AdministrationOnboarding");

const LEADS = "crm4Leads";
const CASES = "clientPortalCases";
const ACCESS = "clientPortalAccess";
const REQUIREMENTS = "clientPortalRequirements";
const DOCUMENTS = "clientPortalDocuments";
const MESSAGES = "clientPortalMessages";
const AUDIT = "clientPortalAudit";
const NOTIFICATIONS = "clientPortalNotifications";
const ACTIVITY = "clientPortalActivity";
const APPOINTMENTS = "crm4AdministrationOnboardingAppointments";
const PROCESSING = "processingCases";
const HISTORIC_SEARCH_SOURCES = Object.freeze({
  claimSubmissions: "Historic Claim Submission",
  leadAssignments: "Historic Referral / Lead Assignment",
  closerAssignments: "Historic Closer Assignment",
  closedLeadsArchive: "Archived CRM Lead",
  claims: "Legacy Claim Enquiry",
  flightClaimLetters: "Historic Claim Letter Submission",
  holidayClaims: "Historic Holiday Claim",
  guidedSupportCases: "Guided Support Case",
});
const ROLES = new Set(["processing", "administrator"]);
const MANDATORY = [
  "identityReviewed",
  "portalActivated",
  "loginExplained",
  "documentChecklistCreated",
  "uploadExplained",
  "messageBoardExplained",
  "agreementConfirmed",
  "notesRecorded",
];
const HUMAN_CHECKS = new Set([
  "identityReviewed",
  "loginExplained",
  "uploadExplained",
  "messageBoardExplained",
  "notesRecorded",
]);
const CLIENT_NOTIFICATION_FROM =
  "Quaerens Client Portal <noreply@quaerens.co.uk>";
const clientNotificationPayload = ({ to, subject, body, type }) => ({
  from: CLIENT_NOTIFICATION_FROM,
  to,
  subject,
  ...renderCrm2CorporateEmail(body),
  tags: [{ name: "type", value: type }],
});
const internalNotificationPayload = ({ subject, body, type }) => ({
  from: "Quaerens CRM4 <clientsupport@quaerens.co.uk>",
  to: "support@quaerens.co.uk",
  cc: "info@quaerens.co.uk",
  subject,
  ...renderCrm2CorporateEmail(body),
  tags: [{ name: "type", value: type }],
});
async function extractImportedAssessment(bytes, contentType) {
  if (contentType === "application/pdf") return text((await pdfParse(bytes)).text, 120000);
  if (contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    return text((await mammoth.extractRawText({ buffer: bytes })).value, 120000);
  if (contentType === "text/plain") return text(bytes.toString("utf8"), 120000);
  return "";
}
const ROUTE_STEPS = {
  solar: [
    "Administration Onboarding",
    "Evidence Collection",
    "First Letter of Complaint",
    "Client Approval",
    "Complaint Pack Preparation",
    "Dispatch / Presentation",
    "Await Response",
    "Response Review",
    "Follow-Up / Escalation",
    "ADR / Ombudsman",
    "Resolution / Outcome",
  ],
  "spray-foam": [
    "Administration Onboarding",
    "Evidence Collection",
    "First Letter of Complaint",
    "Client Approval",
    "Complaint Pack Preparation",
    "Dispatch / Presentation",
    "Await Response",
    "Response Review",
    "Follow-Up / Escalation",
    "Appropriate Escalation",
    "Resolution / Outcome",
  ],
  default: [
    "Administration Onboarding",
    "Evidence Collection",
    "First Letter of Complaint",
    "Client Approval",
    "Complaint Pack Preparation",
    "Dispatch / Presentation",
    "Await Response",
    "Response Review",
    "Follow-Up / Escalation",
    "Resolution / Outcome",
  ],
};
const ROUTE_TEMPLATES = {
  solar: [
    [
      "Installation contract / order form",
      "The signed contract, quotation or order paperwork.",
      true,
    ],
    [
      "Finance agreement",
      "Any loan, credit or finance agreement connected with the installation.",
      false,
    ],
    [
      "Invoices and payment evidence",
      "Invoices, receipts or bank evidence showing payments.",
      true,
    ],
    [
      "System and installation documents",
      "Survey, design, MCS, warranty and commissioning documents where held.",
      false,
    ],
    [
      "Relevant correspondence",
      "Emails, letters or messages with the installer, lender or other organisation.",
      true,
    ],
  ],
  "spray-foam": [
    [
      "Installation contract / invoice",
      "The contract, quotation, invoice and payment evidence.",
      true,
    ],
    [
      "Survey or mortgage evidence",
      "Survey, valuation, lender or broker evidence concerning the insulation.",
      true,
    ],
    [
      "Product and warranty documents",
      "Product information, guarantee or warranty paperwork.",
      false,
    ],
    [
      "Photographs and inspection evidence",
      "Clear photographs or specialist inspection evidence where available.",
      false,
    ],
    [
      "Relevant correspondence",
      "Emails, letters or messages with the installer, lender or other organisation.",
      true,
    ],
  ],
  default: [
    [
      "Contract or agreement",
      "The relevant contract, agreement or order paperwork.",
      true,
    ],
    ["Payment evidence", "Invoices, receipts or other payment evidence.", true],
    [
      "Relevant correspondence",
      "Emails, letters or messages relevant to the complaint.",
      true,
    ],
    [
      "Supporting evidence",
      "Photographs, reports or other supporting material.",
      false,
    ],
  ],
};

const text = (value, limit = 5000) =>
  String(value == null ? "" : value)
    .trim()
    .slice(0, limit);
const lower = (value) => text(value, 320).toLowerCase();
const now = () => FieldValue.serverTimestamp();
const hash = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");
const caseIdFor = (leadId) => `crm4-${text(leadId, 180)}`;
const requirementId = (caseId, title) =>
  `${caseId}:${hash(lower(title)).slice(0, 20)}`;
const accessId = (uid, caseId) => `${uid}_${caseId}`;
const fail = (HttpsError, code, message) => {
  throw new HttpsError(code, message);
};
const clientName = (lead) =>
  text(
    lead.clientName ||
      lead.name ||
      `${lead.forename || ""} ${lead.surname || ""}`,
    200,
  ) || "Client";
const routeKey = (lead) => {
  const value = lower(lead.assessmentRoute || lead.claimType);
  return value.includes("spray")
    ? "spray-foam"
    : value.includes("solar")
      ? "solar"
      : "default";
};
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower(value));
const normaliseTelephone = (value) => {
  const raw = text(value, 60),
    digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0044")) return `+44${digits.slice(4)}`;
  if (digits.startsWith("440")) return `+44${digits.slice(3)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  return `+${digits}`;
};
const normalisePostcode = (value) =>
  text(value, 16).toUpperCase().replace(/\s+/g, " ");
const successFeeFrom = (lead, agreement) => {
  const explicit = Number(
    lead.successFeePercentage || agreement?.successFeePercentage || 0,
  );
  if (explicit > 0) return explicit;
  const match = text(
    agreement?.successFee || agreement?.agreementText,
    60000,
  ).match(/(?:^|\s)(\d+(?:\.\d+)?)%\s+Success Fee/i);
  return match ? Number(match[1]) : 0;
};
const searchText = (value) =>
  lower(value)
    .replace(/[^a-z0-9@+ ]/g, " ")
    .replace(/\s+/g, " ");
const isoTimestamp = value => {
  if (!value) return null;
  const candidate = typeof value.toDate === "function" ? value.toDate()
    : value instanceof Date ? value
    : typeof value === "object" && Number.isFinite(Number(value.seconds ?? value._seconds))
      ? new Date(Number(value.seconds ?? value._seconds) * 1000)
      : new Date(value);
  return Number.isNaN(candidate.getTime()) || candidate.getTime() <= 0 ? null : candidate.toISOString();
};
const historicIdentity = (source, row = {}) => {
  const nested = row.client || row.customer || row.applicantDetails || {}, appointment = row.appointment || {};
  return {
    clientName: text(nested.name || nested.fullName || row.clientName || row.fullName || row.name || `${row.forename || ""} ${row.surname || ""}`, 200),
    email: lower(nested.email || row.email || row.emailAddress || row.clientEmail),
    telephone: text(nested.telephone || nested.phone || row.telephone || row.phone || row.landline, 80),
    mobile: text(nested.mobile || row.mobile || row.mobileNumber, 80),
    postcode: normalisePostcode(nested.postcode || row.postcode),
    address: text(nested.address || row.address || [row.address1, row.address2, row.address3, row.address4, row.address5].filter(Boolean).join(", "), 500),
    reference: text(row.reference || row.caseReference || row.caseId || row.complaintPackReference || row.gatewayReference || row.bookingRef || row.originalLeadId || row.sourceLeadId || row.leadAssignmentId || row.submissionId, 120),
    qar: text(row.assessmentQar || row.qarReference, 120),
    route: text(row.claimType || row.route || row.category || row.type, 120),
    status: text(row.status || row.leadStatus || row.outcome, 80),
    appointmentDate: text(appointment.date || row.closerAppointmentDate, 20),
    appointmentTime: text(appointment.time || row.closerAppointmentTime, 20),
    source: HISTORIC_SEARCH_SOURCES[source] || source,
  };
};
const routeProjection = (lead, progress) =>
  (ROUTE_STEPS[routeKey(lead)] || ROUTE_STEPS.default).map((title, index) => {
    let state = "not_started";
    if (index === 0)
      state =
        progress.administrationOnboarding === "completed"
          ? "completed"
          : progress.administrationOnboarding === "booked"
            ? "in_progress"
            : "ready";
    else if (index === 1)
      state =
        progress.documents.status === "ready" ? "ready" : "awaiting_client";
    return { index: index + 1, title, state, implemented: index < 2 };
  });

async function actor(request, db, HttpsError) {
  if (!request.auth?.uid)
    fail(HttpsError, "unauthenticated", "Sign in to the Processing workspace.");
  const snap = await db
    .collection("crm4Memberships")
    .doc(request.auth.uid)
    .get();
  const member = snap.exists ? snap.data() || {} : {};
  const platformAdmin = request.auth.token?.platformAdmin === true;
  const role = platformAdmin ? "administrator" : text(member.role, 40);
  if (
    (!snap.exists || member.active !== true || member.workspaceId !== "CRM4") &&
    !platformAdmin
  )
    fail(
      HttpsError,
      "permission-denied",
      "Active CRM4 membership is required.",
    );
  if (!ROLES.has(role))
    fail(
      HttpsError,
      "permission-denied",
      "Paid Client Workspace access is limited to Processing and Administration.",
    );
  return {
    uid: request.auth.uid,
    role,
    name: text(member.displayName || member.name || "Quaerens Processing", 160),
  };
}

function eligible(lead) {
  return (
    lead.paymentStatus === "payment_confirmed" &&
    (
      (lead.processingStatus === "ready_for_administration_onboarding" &&
        ["ready", "booked", "confirmation_sent", "rescheduled"].includes(
          text(lead.administrationOnboardingStatus, 80),
        )) ||
      text(lead.administrationOnboardingStatus, 80) === "completed"
    )
  );
}

function workspaceLifecycleStatus(lead) {
  if (lead.processingStatus === "accepted" || lead.administrationOnboardingStatus === "completed")
    return "Active Processing";
  if (["booked", "confirmation_sent", "rescheduled"].includes(text(lead.administrationOnboardingStatus, 80)))
    return "Administration Onboarding Booked";
  return "Ready for Administration Onboarding";
}

async function authoritative(db, leadId, HttpsError) {
  const snap = await db.collection(LEADS).doc(text(leadId, 180)).get();
  if (!snap.exists)
    fail(HttpsError, "not-found", "The CRM4 lead was not found.");
  const lead = { id: snap.id, ...snap.data() };
  if (
    !eligible(lead) &&
    lead.processingStatus !== "accepted" &&
    !["legacy_existing_client", "existing_crm_record"].includes(
      text(lead.workspaceOrigin, 80),
    )
  )
    fail(
      HttpsError,
      "failed-precondition",
      "Payment confirmation and a booked Administration Onboarding appointment are required.",
    );
  return lead;
}

function leadProjection(lead) {
  const telephone = text(lead.telephone || lead.phone || lead.landline, 80),
    mobile = text(lead.mobile || lead.mobileNumber || lead.cell, 80);
  return {
    leadId: lead.id,
    caseId: caseIdFor(lead.id),
    title: text(lead.title, 40),
    firstName: text(lead.firstName || lead.forename, 100),
    lastName: text(lead.lastName || lead.surname, 100),
    clientName: clientName(lead),
    clientEmail: lower(lead.email || lead.emailAddress),
    telephone,
    mobile,
    addressLine1: text(lead.addressLine1, 160),
    addressLine2: text(lead.addressLine2, 160),
    town: text(lead.town || lead.city, 100),
    county: text(lead.county || lead.region, 100),
    postcode: normalisePostcode(lead.postcode),
    country: text(lead.country, 100),
    address: text(
      lead.fullAddress ||
        lead.address ||
        [
          lead.addressLine1,
          lead.addressLine2,
          lead.town || lead.city,
          lead.county || lead.region,
          lead.postcode,
        ]
          .filter(Boolean)
          .join(", "),
      1000,
    ),
    route: text(lead.assessmentRoute || lead.claimType, 120),
    campaign: text(lead.campaign || lead.referralSource, 160),
    assignedCloserName: text(lead.assignedToName || lead.assignedUserName, 160),
    assessmentId: text(lead.assessmentId, 180),
    qar: text(lead.assessmentQar, 120),
    reportStatus: text(
      lead.assessmentReportStatus || (lead.assessmentId ? "generated" : ""),
      80,
    ),
    agreementStatus: text(lead.agreementStatus, 80),
    agreedFeeAmount: Number(lead.agreedFeeAmount || 0),
    agreedFeeCurrency: text(lead.agreedFeeCurrency, 8) || "GBP",
    paymentStatus: text(lead.paymentStatus, 80),
    paymentConfirmedAt: lead.paymentConfirmedAt || null,
    createdAt: lead.createdAt || null,
    onboardingStatus: text(lead.administrationOnboardingStatus, 80),
    onboardingDate: text(lead.administrationOnboardingDate, 20),
    onboardingTime: text(lead.administrationOnboardingTime, 20),
    processingStatus: text(lead.processingStatus, 80),
    workspaceOrigin: text(lead.workspaceOrigin, 80),
  };
}

function commercialProjection(lead, agreement) {
  const legacy = ["legacy_existing_client", "existing crm record", "existing_crm_record"].includes(lower(lead.workspaceOrigin)),
    nativeCommercialAuthority = Boolean(
      lead.securePaymentLink || lead.paymentProviderTransactionId || lead.paymentRequestSentAt ||
      (lead.agreementDocumentId && lead.agreementSignedAt) ||
      (lead.paymentStatus === "payment_confirmed" && lead.paymentConfirmedAt)
    ),
    provenance = lead.historicalCommercialImport || {},
    serviceFeeRecorded = !legacy || provenance.serviceFeeRecorded === true || Number(lead.agreedFeeAmount) > 0,
    paidRecorded = !legacy || provenance.amountPaidRecorded === true || Number(lead.amountPaidNow || lead.paidNow) > 0,
    serviceFee = serviceFeeRecorded ? Number(lead.agreedFeeAmount ?? agreement?.agreedFeeAmount ?? 0) : null,
    paid = paidRecorded
      ? (lead.paymentStatus === "payment_confirmed" ? Number(serviceFee || 0) : Number(lead.amountPaidNow ?? lead.paidNow ?? 0))
      : null,
    outstandingRecorded = !legacy || provenance.outstandingRecorded === true || (serviceFeeRecorded && paidRecorded),
    outstanding = outstandingRecorded ? Math.max(0, Number(serviceFee || 0) - Number(paid || 0)) : null;
  const successFeePercentage = successFeeFrom(lead, agreement);
  return {
    agreementStatus: text(lead.agreementStatus, 80),
    agreementDate: lead.agreementDate || lead.agreementSignedAt || null,
    agreementReference: text(lead.agreementReference || lead.agreementDocumentId, 180),
    agreementSource: text(lead.agreementSource || provenance.source, 160),
    serviceFee,
    currency:
      text(lead.agreedFeeCurrency || agreement?.agreedFeeCurrency, 8) || "GBP",
    successFeePercentage,
    successFeeRecorded: !legacy || provenance.successFeeRecorded === true || successFeePercentage > 0,
    paid,
    outstanding,
    paymentStatus: text(lead.paymentStatus, 80),
    paymentDate: lead.historicalPaymentDate || lead.paymentConfirmedAt || null,
    resultFeeStatus: text(lead.resultFeeStatus, 80),
    historicalEditable: legacy && !nativeCommercialAuthority,
    commercialSource: text(provenance.source, 160),
    serviceFeeCreditsSuccessFee:
      /Service Fee is deducted from the Success Fee/i.test(
        text(agreement?.agreementText, 60000),
      ),
  };
}

function progressProjection(lead, portal, requirements, documents) {
  const received = new Set(
    documents
      .filter((item) => item.requirementId && item.status !== "removed")
      .map((item) => item.requirementId),
  );
  const required = requirements.filter((item) => item.required === true),
    receivedRequired = required.filter((item) => received.has(item.id)).length;
  const future = lead.caseProgress || {};
  return {
    administrationOnboarding:
      text(lead.administrationOnboardingStatus, 80) || "not_started",
    portal:
      portal?.accessState === "ACTIVE" ? "activated" : "awaiting_activation",
    agreement: text(lead.agreementStatus, 80) || "not_started",
    documents: {
      required: required.length,
      received: receivedRequired,
      status:
        required.length && receivedRequired < required.length
          ? "awaiting_required_documents"
          : "ready",
    },
    processing:
      lead.processingStatus === "accepted" ? "active" : "awaiting_onboarding",
    firstLetterOfComplaint:
      text(future.firstLetterOfComplaint, 80) || "not_implemented",
    laterCorrespondence:
      text(future.laterCorrespondence, 80) || "not_implemented",
  };
}

function nextActionProjection(progress, portal) {
  if (portal?.accessState !== "ACTIVE")
    return { code: "activate_client_portal", label: "Activate Client Portal" };
  if (progress.documents.status === "awaiting_required_documents")
    return {
      code: "await_required_documents",
      label: "Awaiting Required Documents",
    };
  if (!["completed"].includes(progress.administrationOnboarding))
    return {
      code: "complete_administration_onboarding",
      label: "Complete Administration Onboarding",
    };
  if (progress.processing !== "active")
    return {
      code: "activate_processing",
      label: "Activate Processing after governed onboarding checks",
    };
  return {
    code: "processing_active",
    label: "Continue governed case processing",
  };
}

async function assessmentProjection(db, lead, HttpsError) {
  const assessmentId = text(lead.assessmentId, 180);
  if (!assessmentId && lead.importedAssessmentDocumentId) {
    const imported = await db.collection(DOCUMENTS).doc(text(lead.importedAssessmentDocumentId, 256)).get();
    if (!imported.exists || imported.data().caseId !== caseIdFor(lead.id) || imported.data().documentType !== "imported_assessment")
      fail(HttpsError, "failed-precondition", "The imported assessment authority could not be verified.");
    const row = imported.data();
    return {
      id: imported.id,
      origin: "LEGACY_IMPORTED",
      source: "Legacy / Imported Quaerens Assessment",
      qarReference: text(row.qarReference || lead.assessmentQar || lead.reference, 120),
      status: text(row.assessmentStatus, 80) || "completed",
      reportStatus: "AVAILABLE",
      version: Number(row.version || 1),
      generatedAt: row.assessmentDate || row.uploadedAt || null,
      documentId: imported.id,
      reportAvailable: Boolean(text(row.storagePath, 1500)),
      completionMethod: "Imported historical assessment",
      contentType: text(row.contentType, 120),
      hash: text(row.sha256, 128),
    };
  }
  if (!assessmentId) return null;
  const assessmentSnap = await db
    .collection("professionalAssessments")
    .doc(assessmentId)
    .get();
  if (
    !assessmentSnap.exists ||
    assessmentSnap.data().crmLink?.crm4LeadId !== lead.id
  )
    fail(
      HttpsError,
      "failed-precondition",
      "The linked Framework B assessment could not be verified.",
    );
  const assessment = assessmentSnap.data(),
    documents = await db
      .collection("professionalAssessmentDocuments")
      .where("assessmentId", "==", assessmentId)
      .get(),
    currentVersion = Number(assessment.currentVersion || 1);
  const documentSnap =
    documents.docs
      .sort(
        (a, b) => Number(b.data().version || 0) - Number(a.data().version || 0),
      )
      .find(
        (item) =>
          Number(item.data().version || currentVersion) === currentVersion,
      ) || documents.docs[0];
  const document = documentSnap?.data() || {};
  return {
    id: assessmentId,
    origin: "FRAMEWORK_B_NATIVE",
    source: "Native Framework B Assessment",
    qarReference: text(assessment.qarReference || lead.assessmentQar, 120),
    status: text(assessment.status || lead.assessmentStatus, 80),
    reportStatus: text(
      lead.assessmentReportStatus ||
        (documentSnap ? "GENERATED" : "NOT_GENERATED"),
      80,
    ),
    version: Number(document.version || assessment.currentVersion || 1),
    generatedAt:
      document.generatedAt ||
      assessment.updatedAt ||
      assessment.createdAt ||
      null,
    documentId: documentSnap?.id || "",
    reportAvailable: Boolean(documentSnap && text(document.pdfPath, 500)),
    completionMethod: text(
      assessment.completionMethod ||
        assessment.source ||
        lead.assessmentCompletionMethod,
      80,
    ),
  };
}

async function ensureWorkspace(db, admin, lead, staff) {
  const caseId = caseIdFor(lead.id),
    ref = db.collection(CASES).doc(caseId),
    snap = await ref.get();
  const projection = leadProjection(lead);
  if (!snap.exists) {
    await ref.create({
      ...projection,
      crm4LeadId: lead.id,
      caseRef: text(lead.reference || lead.leadReference || lead.id, 120),
      claimType: projection.route,
      status: workspaceLifecycleStatus(lead),
      accessState: "ACTIVATION_REQUIRED",
      portalVersion: 3,
      workspaceOrigin: "native_crm4_paid_client",
      crmLink: { workspaceId: "CRM4", collection: LEADS, caseId: lead.id },
      onboardingChecklist: {},
      createdAt: now(),
      updatedAt: now(),
      updatedBy: staff.uid,
    });
  } else
    await ref.set(
      {
        ...projection,
        status: workspaceLifecycleStatus(lead),
        // Workspace provenance belongs to the portal record. A CRM lead normally
        // has no workspaceOrigin, so never let a later deterministic reopen erase it.
        workspaceOrigin:
          text(snap.data()?.workspaceOrigin, 80) || "native_crm4_paid_client",
        updatedAt: now(),
        updatedBy: staff.uid,
      },
      { merge: true },
    );
  const template = ROUTE_TEMPLATES[routeKey(lead)] || ROUTE_TEMPLATES.default;
  const existing = await db
    .collection(REQUIREMENTS)
    .where("caseId", "==", caseId)
    .limit(1)
    .get();
  if (existing.empty) {
    const batch = db.batch();
    template.forEach(([title, description, required]) =>
      batch.create(
        db.collection(REQUIREMENTS).doc(requirementId(caseId, title)),
        {
          caseId,
          crm4LeadId: lead.id,
          title,
          description,
          required,
          clientVisible: true,
          status: "outstanding",
          source: "route-template",
          route: routeKey(lead),
          createdAt: now(),
          createdByUid: staff.uid,
        },
      ),
    );
    batch.set(
      ref,
      {
        onboardingChecklist: { documentChecklistCreated: true },
        documentTemplate: routeKey(lead),
        updatedAt: now(),
      },
      { merge: true },
    );
    await batch.commit();
  }
  return caseId;
}

async function audit(db, caseId, action, staff, details = {}) {
  await db.collection(AUDIT).add({
    caseId,
    action,
    actorUid: staff.uid,
    actorType: "staff",
    actorRole: staff.role,
    details,
    createdAt: now(),
  });
}

function registerPaidClientWorkspace({
  admin,
  db,
  onCall,
  HttpsError,
  resend,
  resendSecret,
}) {
  async function clientCase(request) {
    if (!request.auth?.uid)
      fail(HttpsError, "unauthenticated", "Sign in to the Client Portal.");
    const caseId = text(request.data?.caseId, 256),
      mapping = await db
        .collection(ACCESS)
        .doc(accessId(request.auth.uid, caseId))
        .get();
    if (
      !mapping.exists ||
      mapping.data().active !== true ||
      mapping.data().uid !== request.auth.uid ||
      mapping.data().caseId !== caseId
    )
      fail(
        HttpsError,
        "permission-denied",
        "This account is not authorised for that client case.",
      );
    const portal = await db.collection(CASES).doc(caseId).get();
    if (!portal.exists || portal.data().accessState !== "ACTIVE")
      fail(
        HttpsError,
        "permission-denied",
        "Client Portal access is unavailable.",
      );
    return {
      uid: request.auth.uid,
      caseId,
      portal: { id: portal.id, ...portal.data() },
    };
  }
  const list = onCall(async (request) => {
    await actor(request, db, HttpsError);
    const snap = await db.collection(LEADS).limit(1000).get();
    return {
      cases: snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (lead) =>
            eligible(lead) ||
            lead.processingStatus === "accepted" ||
            ["legacy_existing_client", "existing_crm_record"].includes(
              text(lead.workspaceOrigin, 80),
            ),
        )
        .map(leadProjection),
    };
  });

  const get = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff);
    const agreementId = text(lead.agreementDocumentId, 180),
      [
        caseSnap,
        requirements,
        documents,
        messages,
        events,
        activities,
        agreementSnap,
        assessment,
        appointmentSnap,
        processingCaseSnap,
      ] = await Promise.all([
        db.collection(CASES).doc(caseId).get(),
        db.collection(REQUIREMENTS).where("caseId", "==", caseId).get(),
        db.collection(DOCUMENTS).where("caseId", "==", caseId).get(),
        db.collection(MESSAGES).where("caseId", "==", caseId).get(),
        db.collection(AUDIT).where("caseId", "==", caseId).limit(100).get(),
        db.collection(ACTIVITY).where("caseId", "==", caseId).limit(100).get(),
        agreementId
          ? db.collection("crm4AgreementRecords").doc(agreementId).get()
          : Promise.resolve(null),
        assessmentProjection(db, lead, HttpsError),
        db.collection(APPOINTMENTS).doc(`crm4:${lead.id}:administration-onboarding`).get(),
        db.collection(PROCESSING).doc(`crm4-${lead.id}`).get(),
      ]);
    const requirementRows = requirements.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      documentRows = documents.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      agreement = agreementSnap?.exists ? agreementSnap.data() : null;
    const derived = {
      portalActivated: caseSnap.data()?.accessState === "ACTIVE",
      documentChecklistCreated: requirementRows.length > 0,
      agreementConfirmed: lead.agreementStatus === "signed",
    };
    const portal = {
        id: caseId,
        ...caseSnap.data(),
        onboardingChecklist: {
          ...(caseSnap.data()?.onboardingChecklist || {}),
          ...derived,
        },
      },
      progress = progressProjection(
        lead,
        portal,
        requirementRows,
        documentRows,
      );
    return {
      lead: leadProjection(lead),
      case: portal,
      portalUsername: lower(lead.email || lead.emailAddress),
      assessment,
      commercial: {
        ...commercialProjection(lead, agreement),
        resultFeeStatus: text(lead.resultFeeStatus, 40) || "pending",
      },
      progress,
      nextAction: nextActionProjection(progress, portal),
      onboardingCompletion: onboardingCompletionEligibility({
        lead,
        portal,
        appointment: appointmentSnap.exists ? appointmentSnap.data() : {},
        processingCaseExists: processingCaseSnap.exists,
      }),
      caseRoute: routeProjection(lead, progress),
      requirements: requirementRows,
      documents: documentRows,
      messages: messages.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      activity: activities.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      audit: events.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  });

  const workInbox = onCall(async (request) => {
    await actor(request, db, HttpsError);
    const [cases, messages, documents, requirements, aiArtifacts] = await Promise.all([
      db.collection(CASES).limit(1000).get(),
      db.collection(MESSAGES).limit(2000).get(),
      db.collection(DOCUMENTS).limit(2000).get(),
      db.collection(REQUIREMENTS).limit(2000).get(),
      db.collection("crm4AiProcessingArtifacts").limit(1000).get(),
    ]);
    const byCase = new Map(
        cases.docs.map((doc) => [doc.id, { id: doc.id, ...doc.data() }]),
      ),
      items = [];
    messages.docs.forEach((doc) => {
      const row = doc.data(),
        portal = byCase.get(row.caseId);
      if (row.senderType === "client" && !row.staffFirstSeenAt && portal)
        items.push({
          id: `message:${doc.id}`,
          queue: "unread_client_messages",
          priority: "HIGH",
          caseId: row.caseId,
          leadId: portal.crm4LeadId,
          clientName: portal.clientName,
          route: portal.route || portal.claimType,
          processingOwner: text(portal.processingOwnerName, 160) || "Unassigned",
          action: "New secure client message",
          messageId: doc.id,
          messagePreview: text(row.body || row.message, 500),
          createdAt: row.createdAt,
        });
    });
    documents.docs.forEach((doc) => {
      const row = doc.data(),
        portal = byCase.get(row.caseId);
      if (portal && row.uploadedBy === "client" && !row.reviewedAt)
        items.push({
          id: `document:${doc.id}`,
          queue: "documents_awaiting_review",
          priority: "HIGH",
          caseId: row.caseId,
          leadId: portal.crm4LeadId,
          clientName: portal.clientName,
          route: portal.route || portal.claimType,
          processingOwner: text(portal.processingOwnerName, 160) || "Unassigned",
          action: `Review evidence: ${text(row.title, 180)}`,
          createdAt: row.uploadedAt,
        });
    });
    requirements.docs.forEach((doc) => {
      const row = doc.data(),
        portal = byCase.get(row.caseId),
        priority = text(row.priority, 20) || "STANDARD";
      if (
        portal &&
        !["uploaded", "present", "reviewed"].includes(lower(row.status)) &&
        ["CRITICAL", "HIGH"].includes(priority)
      )
        items.push({
          id: `requirement:${doc.id}`,
          queue:
            priority === "CRITICAL"
              ? "critical_evidence_missing"
              : "high_priority_evidence_outstanding",
          priority,
          caseId: row.caseId,
          leadId: portal.crm4LeadId,
          clientName: portal.clientName,
          route: portal.route || portal.claimType,
          processingOwner: text(portal.processingOwnerName, 160) || "Unassigned",
          action: `Evidence outstanding: ${text(row.title, 180)}`,
          createdAt: row.createdAt,
        });
    });
    cases.docs.forEach((doc) => {
      const row = doc.data();
      if (row.accessState !== "ACTIVE")
        items.push({
          id: `portal:${doc.id}`,
          queue: "portal_activations_outstanding",
          priority: "NORMAL",
          caseId: doc.id,
          leadId: row.crm4LeadId,
          clientName: row.clientName,
          route: row.route || row.claimType,
          processingOwner: text(row.processingOwnerName, 160) || "Unassigned",
          action: "Activate Client Portal",
          createdAt: row.createdAt,
        });
      if (row.administrationOnboardingStatus !== "completed")
        items.push({
          id: `onboarding:${doc.id}`,
          queue: "administration_onboarding_incomplete",
          priority: "HIGH",
          caseId: doc.id,
          leadId: row.crm4LeadId,
          clientName: row.clientName,
          route: row.route || row.claimType,
          processingOwner: text(row.processingOwnerName, 160) || "Unassigned",
          action: "Complete Administration Onboarding",
          createdAt: row.createdAt,
        });
    });
    const latestAi = new Map();
    aiArtifacts.docs.forEach((doc) => {
      const row = doc.data();
      if (row.status !== "AI_GENERATED" || !row.output) return;
      const key = `${row.leadId}:${row.type}`, existing = latestAi.get(key);
      if (!existing || Number(row.version || 0) > Number(existing.version || 0)) latestAi.set(key, { id: doc.id, ...row });
    });
    latestAi.forEach((row) => {
      const portal = byCase.get(row.caseId);
      if (!portal) return;
      let queue = "", action = "";
      if (Number(row.output.evidenceReadiness?.criticalMissing || 0) > 0) {
        queue = "ai_critical_evidence_missing";
        action = "AI advisory — review critical missing evidence";
      } else if (row.type === "draft_evidence_request") {
        queue = "ai_evidence_request_recommended";
        action = "AI advisory — review evidence request draft";
      } else if (row.output.firstComplaintReadiness === "READY_FOR_PROCESSING_DRAFT") {
        queue = "ai_first_complaint_ready";
        action = "AI advisory — review first complaint draft readiness";
      }
      if (!queue) return;
      items.push({ id: `ai:${row.id}`, queue, priority: "ADVISORY", advisory: true, caseId: row.caseId, leadId: row.leadId, clientName: portal.clientName, route: row.route, processingOwner: text(portal.processingOwnerName, 160) || "Unassigned", action, createdAt: row.createdAt });
    });
    const counts = {};
    items.forEach((item) => {
      counts[item.queue] = (counts[item.queue] || 0) + 1;
    });
    return { items, counts };
  });

  const globalSearch = onCall(async (request) => {
    await actor(request, db, HttpsError);
    const query = searchText(request.data?.query);
    if (query.length < 2)
      fail(
        HttpsError,
        "invalid-argument",
        "Enter at least two search characters.",
      );
    // Search sequentially in bounded pages. This avoids concurrent whole-database
    // snapshots without silently imposing a maximum source-record count.
    const scan = async (collectionName, visit) => {
      let cursor = null;
      do {
        let pageQuery = db.collection(collectionName)
          .orderBy(FieldPath.documentId()).limit(250);
        if (cursor) pageQuery = pageQuery.startAfter(cursor);
        const page = await pageQuery.get();
        page.docs.forEach(visit);
        cursor = page.docs.at(-1) || null;
        if (page.size < 250 || results.length >= 100) break;
      } while (cursor);
    };
    const terms = query.split(" ").filter(Boolean),
      matches = (value) => {
        const hay = searchText(value);
        return terms.every((term) => hay.includes(term));
      },
      results = [];
    await scan(LEADS, (doc) => {
          const lead = { id: doc.id, ...doc.data() },
            hay = searchText(
              [
                clientName(lead),
                lead.forename,
                lead.surname,
                lead.email,
                lead.telephone,
                lead.mobile,
                lead.postcode,
                lead.address,
                lead.reference,
                lead.leadReference,
                lead.assessmentQar,
                lead.agreementDocumentId,
              ].join(" "),
            );
          if (!matches(hay)) return;
          results.push({
            leadId: doc.id,
            clientName: clientName(lead),
            email: lower(lead.email || lead.emailAddress),
            telephone: text(lead.telephone || lead.phone, 80),
            mobile: text(lead.mobile, 80),
            postcode: text(lead.postcode, 20),
            address: text(lead.fullAddress || lead.address, 500),
            reference: text(lead.reference || lead.leadReference, 120),
            qar: text(lead.assessmentQar, 120),
            route: text(lead.assessmentRoute || lead.claimType, 120),
            status: text(lead.leadStatus || lead.status, 80),
            source: "CRM4",
            sourceRecordId: doc.id,
            action: "OPEN_EXISTING_CLIENT",
            paidWorkspaceId: "",
            portalStatus: "",
            processingCaseId: "",
            createdAt: lead.createdAt || null,
          });
        });
    const representedLeads = new Set(results.map((row) => row.leadId));
    await scan(CASES, (doc) => {
      const row = doc.data() || {}, leadId = text(row.crm4LeadId, 180);
      if (leadId && representedLeads.has(leadId)) return;
      if (!matches([
        row.clientName, row.clientEmail, row.telephone, row.mobile,
        row.postcode, row.address, row.caseRef, row.route, row.claimType,
        row.qar, row.assessmentQar,
      ].join(" "))) return;
      results.push({
        leadId,
        clientName: text(row.clientName, 200) || "Existing client",
        email: lower(row.clientEmail || row.email),
        telephone: text(row.telephone, 80), mobile: text(row.mobile, 80),
        postcode: text(row.postcode, 20), reference: text(row.caseRef, 120),
        qar: text(row.qar || row.assessmentQar, 120),
        route: text(row.route || row.claimType, 120), status: text(row.status, 80),
        source: "Paid Client Workspace", sourceRecordId: doc.id,
        action: leadId ? "OPEN_EXISTING_CLIENT" : "OPEN_EXISTING_SOURCE",
        paidWorkspaceId: doc.id,
        openUrl: leadId ? "" : `/paid-client-workspace.html?case=${encodeURIComponent(doc.id)}`,
        createdAt: row.createdAt || null,
      });
    });
    await scan(PROCESSING, (doc) => {
      const row = doc.data() || {}, leadId = text(row.crm4LeadId, 180);
      if ((leadId && representedLeads.has(leadId)) || !matches([
        row.client?.name, row.client?.email, row.client?.telephone, row.client?.mobile,
        row.client?.postcode, row.caseReference, row.claimType, row.assessmentQar,
      ].join(" "))) return;
      results.push({
        leadId, clientName: text(row.client?.name, 200) || "Existing Processing client",
        email: lower(row.client?.email), telephone: text(row.client?.telephone, 80),
        mobile: text(row.client?.mobile, 80), postcode: text(row.client?.postcode, 20),
        reference: text(row.caseReference, 120), qar: text(row.assessmentQar, 120),
        route: text(row.claimType, 120), status: text(row.caseStage, 80),
        source: "Legacy Processing", sourceRecordId: doc.id,
        action: leadId ? "OPEN_EXISTING_CLIENT" : "OPEN_EXISTING_SOURCE",
        processingCaseId: doc.id,
        openUrl: leadId ? "" : `/processing-case-detail.html?id=${encodeURIComponent(doc.id)}`,
        createdAt: row.createdAt || null,
      });
    });
    const historicalSources = ["claimSubmissions", "leadAssignments", "closerAssignments", "closedLeadsArchive", "claims", "flightClaimLetters", "holidayClaims", "guidedSupportCases"];
    for (const source of results.length ? [] : historicalSources) {
      if (results.length >= 100) break;
      await scan(source, (doc) => {
        const identity = historicIdentity(source, doc.data() || {});
        if (!matches(Object.values(identity).join(" "))) return;
        results.push({
          ...identity, leadId: "", sourceRecordId: doc.id,
          historicalSource: source, action: "LINK_EXISTING_HISTORIC_SOURCE",
        });
      });
    }
    results.splice(100);
    return {
      query,
      results,
      sources: ["crm4Leads", "clientPortalCases", "processingCases", "claimSubmissions", "leadAssignments", "closerAssignments", "closedLeadsArchive", "claims", "flightClaimLetters", "holidayClaims", "guidedSupportCases"],
      noMatchToken: results.length
        ? ""
        : hash(`${request.auth.uid}|${query}|NO_MATCH`),
    };
  });

  const linkHistorical = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      source = text(request.data?.source, 80), recordId = text(request.data?.recordId, 180);
    if (!Object.hasOwn(HISTORIC_SEARCH_SOURCES, source) || !recordId)
      fail(HttpsError, "invalid-argument", "A governed historic client source and record are required.");
    const sourceSnap = await db.collection(source).doc(recordId).get();
    if (!sourceSnap.exists) fail(HttpsError, "not-found", "The governed historic client record was not found.");
    const identity = historicIdentity(source, sourceSnap.data() || {});
    if (!identity.clientName || (!identity.email && !identity.telephone && !identity.mobile))
      fail(HttpsError, "failed-precondition", "The historic record lacks sufficient governed identity data for migration.");
    const leads = await db.collection(LEADS).limit(1500).get(),
      identityKeys = [identity.email, normaliseTelephone(identity.telephone), normaliseTelephone(identity.mobile), searchText(`${identity.clientName} ${identity.postcode}`), lower(identity.reference)].filter(Boolean);
    const existing = leads.docs.find((doc) => {
      const row = doc.data() || {};
      return identityKeys.some((key) => [
        lower(row.email || row.emailAddress), normaliseTelephone(row.telephone || row.phone),
        normaliseTelephone(row.mobile), searchText(`${clientName(row)} ${row.postcode || ""}`),
        lower(row.reference || row.leadReference),
      ].includes(key));
    });
    if (existing) {
      const lead = { id: existing.id, ...existing.data() }, caseId = await ensureWorkspace(db, admin, lead, staff);
      return { status: "EXISTING_IDENTITY_OPENED", leadId: existing.id, caseId, idempotent: true };
    }
    const leadId = `legacy-${hash(`${source}:${recordId}`).slice(0, 24)}`,
      leadRef = db.collection(LEADS).doc(leadId), caseId = caseIdFor(leadId), caseRef = db.collection(CASES).doc(caseId), at = new Date().toISOString();
    await db.runTransaction(async (transaction) => {
      const [leadSnap, portalSnap] = await Promise.all([transaction.get(leadRef), transaction.get(caseRef)]);
      if (leadSnap.exists && portalSnap.exists) return;
      const lead = {
        id: leadId, clientName: identity.clientName, email: identity.email, emailNormalized: identity.email,
        telephone: identity.telephone, telephoneNormalized: normaliseTelephone(identity.telephone),
        mobile: identity.mobile, mobileNormalized: normaliseTelephone(identity.mobile), postcode: identity.postcode,
        address: identity.address, claimType: identity.route, reference: identity.reference,
        workspaceOrigin: "legacy_existing_client", source: "Legacy / Existing Client Import",
        migrationState: "Existing Client — Details Incomplete", processingStatus: "legacy_migration",
        administrationOnboardingStatus: "migration_required",
        migrationProvenance: { sourceCollection: source, sourceRecordId: recordId, linkedByUid: staff.uid, linkedAt: at },
        createdAt: now(), lastUpdatedAt: now(),
        actionHistory: [{ action: "legacy_existing_client_linked", byUid: staff.uid, at, source, sourceRecordId: recordId }],
      };
      if (!leadSnap.exists) transaction.create(leadRef, lead);
      if (!portalSnap.exists) transaction.create(caseRef, {
        ...leadProjection(lead), crm4LeadId: leadId, caseRef: identity.reference || leadId,
        claimType: identity.route, status: lead.migrationState, accessState: "ACTIVATION_REQUIRED",
        workspaceOrigin: "Existing CRM Record", originatingRecordId: recordId,
        originatingSource: source, migrationProvenance: lead.migrationProvenance,
        onboardingChecklist: {}, createdAt: now(), updatedAt: now(), updatedBy: staff.uid,
      });
    });
    await audit(db, caseId, "HISTORIC_CLIENT_SOURCE_LINKED", staff, { source, sourceRecordId: recordId });
    return { status: "HISTORIC_SOURCE_LINKED", leadId, caseId, idempotent: false };
  });

  const linkExisting = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      leadId = text(request.data?.leadId, 180),
      leadRef = db.collection(LEADS).doc(leadId),
      leadSnap = await leadRef.get();
    if (!leadSnap.exists)
      fail(
        HttpsError,
        "not-found",
        "The existing CRM4 identity was not found.",
      );
    const lead = { id: leadSnap.id, ...leadSnap.data() },
      caseId = await ensureWorkspace(db, admin, lead, staff),
      caseRef = db.collection(CASES).doc(caseId),
      existing = await caseRef.get();
    await caseRef.set(
      {
        workspaceOrigin: "Existing CRM Record",
        originatingRecordId: lead.id,
        originatingSource: "crm4Leads",
        linkedByUid: staff.uid,
        linkedAt: existing.data()?.linkedAt || now(),
        migrationState:
          text(request.data?.migrationState, 80) ||
          "Existing Client — Details Incomplete",
        migrationNotes: text(request.data?.notes, 5000),
        updatedAt: now(),
        updatedBy: staff.uid,
      },
      { merge: true },
    );
    await leadRef.set(
      {
        paidClientWorkspaceId: caseId,
        workspaceOrigin:
          text(lead.workspaceOrigin, 80) || "existing_crm_record",
        lastUpdatedAt: now(),
      },
      { merge: true },
    );
    await audit(db, caseId, "EXISTING_CRM_IDENTITY_LINKED", staff, {
      originatingRecordId: lead.id,
      source: "crm4Leads",
    });
    return {
      status: "LINKED",
      caseId,
      idempotent: Boolean(existing.data()?.linkedAt),
    };
  });

  const createLegacy = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      data = request.data?.client || {},
      searchQuery = searchText(request.data?.searchQuery),
      token = text(request.data?.noMatchToken, 128);
    if (!searchQuery || token !== hash(`${staff.uid}|${searchQuery}|NO_MATCH`))
      fail(
        HttpsError,
        "failed-precondition",
        "Complete the governed global client search before manual creation.",
      );
    const fullName = text(
        data.fullName || `${data.firstName || ""} ${data.lastName || ""}`,
        200,
      ),
      clientEmail = lower(data.email),
      telephone = text(data.telephone, 60),
      mobile = text(data.mobile, 60),
      postcode = normalisePostcode(data.postcode),
      reference = text(request.data?.case?.reference, 120);
    if (!fullName || (!clientEmail && !telephone && !mobile))
      fail(
        HttpsError,
        "invalid-argument",
        "A name and at least one governed contact value are required.",
      );
    const [leads, portals, processing] = await Promise.all([
        db.collection(LEADS).limit(1500).get(),
        db.collection(CASES).limit(1500).get(),
        db.collection(PROCESSING).limit(1500).get(),
      ]),
      keys = [
        clientEmail,
        normaliseTelephone(telephone),
        normaliseTelephone(mobile),
        searchText(`${fullName} ${postcode}`),
        lower(reference),
        lower(request.data?.case?.assessmentReference),
      ].filter(Boolean);
    const duplicateRows = [
      ...leads.docs.map((doc) => ({ id: doc.id, source: "CRM4", row: doc.data() || {} })),
      ...portals.docs.map((doc) => ({ id: doc.id, source: "Paid Client Workspace", row: doc.data() || {} })),
      ...processing.docs.map((doc) => ({ id: doc.id, source: "Legacy Processing", row: doc.data() || {} })),
    ];
    const duplicate = duplicateRows.find(({ row }) => {
      const nested = row.client || {};
      return keys.some((key) =>
        [
          lower(row.email || row.emailAddress || row.clientEmail || nested.email),
          normaliseTelephone(row.telephone || row.phone || nested.telephone),
          normaliseTelephone(row.mobile || nested.mobile),
          searchText(`${row.clientName || nested.name || clientName(row)} ${row.postcode || nested.postcode || ""}`),
          lower(row.reference || row.leadReference || row.caseReference || row.caseRef),
          lower(row.assessmentQar || row.qar || nested.qar),
        ].includes(key),
      );
    });
    if (duplicate)
      fail(
        HttpsError,
        "already-exists",
        `A probable existing governed client was found in ${duplicate.source}: ${duplicate.id}. Open the existing client instead.`,
      );
    const leadRef = db.collection(LEADS).doc(),
      leadId = leadRef.id,
      caseId = caseIdFor(leadId),
      caseData = request.data?.case || {},
      commercial = request.data?.commercial || {},
      at = new Date().toISOString(),
      lead = {
        id: leadId,
        clientName: fullName,
        title: text(data.title, 40),
        forename: text(data.firstName, 100),
        surname: text(data.lastName, 100),
        email: clientEmail,
        emailNormalized: clientEmail,
        telephone,
        telephoneNormalized: normaliseTelephone(telephone),
        mobile,
        mobileNormalized: normaliseTelephone(mobile),
        addressLine1: text(data.addressLine1, 160),
        addressLine2: text(data.addressLine2, 160),
        town: text(data.town, 100),
        county: text(data.county, 100),
        postcode,
        country: text(data.country, 80),
        claimType: text(caseData.route, 120),
        reference,
        originalClientStartDate: text(caseData.originalStartDate, 20),
        workspaceOrigin: "legacy_existing_client",
        migrationState:
          text(caseData.migrationState, 80) ||
          "Existing Client — Details Incomplete",
        currentCaseStage: text(caseData.currentStage, 120),
        migrationNotes: text(caseData.notes, 5000),
        source: "Legacy / Existing Client Import",
        processingOwnerUid: text(caseData.processingOwnerUid, 180),
        processingOwnerName: text(caseData.processingOwnerName, 160),
        historicalAssessmentMetadata: {
          reference: text(caseData.assessmentReference, 120),
          date: text(caseData.assessmentDate, 40),
          status: text(caseData.assessmentStatus, 80) || "historical_unverified",
          source: "Legacy / Existing Client Import",
        },
        agreementStatus:
          text(commercial.agreementStatus, 80) || "not_available",
        agreedFeeAmount: Number(commercial.serviceFee || 0),
        agreedFeeCurrency: text(commercial.currency, 8) || "GBP",
        paymentStatus:
          text(commercial.paymentStatus, 80) || "historical_unverified",
        amountPaidNow: Number(commercial.amountPaid || 0),
        amountDueNow: Math.max(0, Number(commercial.outstandingAmount || 0)),
        successFeePercentage: Number(commercial.successFeePercentage || 0),
        resultFeeStatus: text(commercial.resultFeeStatus, 80) || "historical_unverified",
        paymentConfirmedAt: isoTimestamp(commercial.paymentDate),
        historicalCommercialImport: {
          source: "Legacy / Existing Client Import",
          paymentProviderTransactionCreated: false,
          paymentDate: text(commercial.paymentDate, 40),
          importedByUid: staff.uid,
          importedAt: at,
        },
        processingStatus: "legacy_migration",
        administrationOnboardingStatus: "migration_required",
        createdAt: now(),
        lastUpdatedAt: now(),
        actionHistory: [
          { action: "legacy_existing_client_imported", byUid: staff.uid, at },
        ],
      };
    await db.runTransaction(async (transaction) => {
      transaction.create(leadRef, lead);
      transaction.create(db.collection(CASES).doc(caseId), {
        ...leadProjection(lead),
        crm4LeadId: leadId,
        caseRef: reference || leadId,
        claimType: lead.claimType,
        status: lead.migrationState,
        accessState: "ACTIVATION_REQUIRED",
        workspaceOrigin: "Existing CRM Record",
        originatingRecordId: leadId,
        originatingSource: "manual_legacy_import",
        importedByUid: staff.uid,
        importedAt: now(),
        migrationState: lead.migrationState,
        currentCaseStage: lead.currentCaseStage,
        processingOwnerUid: lead.processingOwnerUid,
        processingOwnerName: lead.processingOwnerName,
        migrationNotes: lead.migrationNotes,
        historicalCommercialImport: lead.historicalCommercialImport,
        historicalAssessmentMetadata: lead.historicalAssessmentMetadata,
        onboardingChecklist: {},
        createdAt: now(),
        updatedAt: now(),
        updatedBy: staff.uid,
      });
    });
    await audit(db, caseId, "LEGACY_EXISTING_CLIENT_IMPORTED", staff, {
      originatingRecordId: leadId,
      source: "manual_legacy_import",
      migrationState: lead.migrationState,
    });
    return { status: "CREATED", leadId, caseId };
  });

  const updateClientDetails = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      data = request.data?.details || {};
    const fullName = text(data.fullName, 200),
      title = text(data.title, 40),
      firstName = text(data.firstName, 100),
      lastName = text(data.lastName, 100),
      email = lower(data.email),
      telephone = text(data.telephone, 60),
      mobile = text(data.mobile, 60),
      addressLine1 = text(data.addressLine1, 160),
      addressLine2 = text(data.addressLine2, 160),
      town = text(data.town, 100),
      county = text(data.county, 100),
      postcode = normalisePostcode(data.postcode),
      country = text(data.country, 100);
    if (!fullName)
      fail(HttpsError, "invalid-argument", "Full name is required.");
    if (email && !validEmail(email))
      fail(HttpsError, "invalid-argument", "Enter a valid email address.");
    const emailNormalized = email,
      telephoneNormalized = normaliseTelephone(telephone),
      beforeEmail = lower(lead.email || lead.emailAddress),
      beforeTelephone = normaliseTelephone(lead.telephone || lead.phone),
      portalRef = db.collection(CASES).doc(caseId),
      leadRef = db.collection(LEADS).doc(lead.id),
      portalSnap = await portalRef.get(),
      clientUid = text(portalSnap.data()?.clientUid, 180);
    if (clientUid && emailNormalized !== beforeEmail && !emailNormalized)
      fail(
        HttpsError,
        "failed-precondition",
        "An active Client Portal identity requires an email address. Use the governed identity update rather than clearing it.",
      );
    if (emailNormalized !== beforeEmail) {
      const duplicate = await db
        .collection(LEADS)
        .where("emailNormalized", "==", emailNormalized)
        .limit(1)
        .get();
      if (!duplicate.empty && duplicate.docs[0].id !== lead.id)
        fail(
          HttpsError,
          "already-exists",
          "That email address is already assigned to another CRM4 identity.",
        );
    }
    let authEmailChanged = false;
    if (clientUid && emailNormalized && emailNormalized !== beforeEmail) {
      const existing = await admin
        .auth()
        .getUserByEmail(emailNormalized)
        .catch((error) =>
          error.code === "auth/user-not-found" ? null : Promise.reject(error),
        );
      if (existing && existing.uid !== clientUid)
        fail(
          HttpsError,
          "already-exists",
          "That email address belongs to another authenticated identity.",
        );
      await admin
        .auth()
        .updateUser(clientUid, { email: emailNormalized, emailVerified: true });
      authEmailChanged = true;
    }
    const address = [addressLine1, addressLine2, town, county, postcode, country]
        .filter(Boolean)
        .join(", "),
      at = new Date().toISOString(),
      changedFields = [
        "clientName",
        "title",
        "firstName",
        "lastName",
        "email",
        "telephone",
        "mobile",
        "addressLine1",
        "addressLine2",
        "town",
        "county",
        "postcode",
        "country",
      ].filter(
        (key) =>
          String(
            {
              clientName: clientName(lead),
              title: text(lead.title, 40),
              firstName: text(lead.firstName || lead.forename, 100),
              lastName: text(lead.lastName || lead.surname, 100),
              email: beforeEmail,
              telephone: text(lead.telephone || lead.phone, 60),
              mobile: text(lead.mobile || lead.mobileNumber, 60),
              addressLine1: text(lead.addressLine1, 160),
              addressLine2: text(lead.addressLine2, 160),
              town: text(lead.town || lead.city, 100),
              county: text(lead.county || lead.region, 100),
              postcode: normalisePostcode(lead.postcode),
              country: text(lead.country, 100),
            }[key] || "",
          ) !==
          String(
            {
              clientName: fullName,
              title,
              firstName,
              lastName,
              email: emailNormalized,
              telephone,
              mobile,
              addressLine1,
              addressLine2,
              town,
              county,
              postcode,
              country,
            }[key] || "",
          ),
      );
    try {
      await db.runTransaction(async (transaction) => {
        const oldEmailKey = beforeEmail
            ? db
                .collection("crm4LeadDuplicateKeys")
                .doc(`email_${hash(beforeEmail)}`)
            : null,
          newEmailKey = emailNormalized
            ? db
                .collection("crm4LeadDuplicateKeys")
                .doc(`email_${hash(emailNormalized)}`)
            : null,
          oldPhoneKey = beforeTelephone
            ? db
                .collection("crm4LeadDuplicateKeys")
                .doc(`telephone_${hash(beforeTelephone)}`)
            : null,
          newPhoneKey = telephoneNormalized
            ? db
                .collection("crm4LeadDuplicateKeys")
                .doc(`telephone_${hash(telephoneNormalized)}`)
            : null;
        const refs = [
            leadRef,
            portalRef,
            ...[newEmailKey, newPhoneKey, oldEmailKey, oldPhoneKey].filter(
              (ref, index, all) =>
                ref &&
                all.findIndex((item) => item?.path === ref.path) === index,
            ),
          ],
          snapshots = await Promise.all(
            refs.map((ref) => transaction.get(ref)),
          ),
          byPath = new Map(
            refs.map((ref, index) => [ref.path, snapshots[index]]),
          ),
          freshLead = byPath.get(leadRef.path),
          freshPortal = byPath.get(portalRef.path);
        if (!freshLead.exists || !freshPortal.exists)
          fail(
            HttpsError,
            "failed-precondition",
            "The authoritative CRM4 and portal identities are required.",
          );
        for (const ref of [newEmailKey, newPhoneKey].filter(Boolean)) {
          const reservation = byPath.get(ref.path);
          if (reservation.exists && reservation.data().leadId !== lead.id)
            fail(
              HttpsError,
              "already-exists",
              "Those contact details are assigned to another CRM4 identity.",
            );
        }
        const leadUpdate = {
          clientName: fullName,
          title,
          firstName,
          lastName,
          email: emailNormalized,
          emailNormalized,
          telephone,
          phone: telephone,
          telephoneNormalized,
          mobile,
          addressLine1,
          addressLine2,
          town,
          county,
          postcode,
          country,
          address,
          fullAddress: address,
          clientDetailsUpdatedAt: now(),
          clientDetailsUpdatedByUid: staff.uid,
          clientDetailsUpdatedByName: staff.name,
          lastUpdatedAt: now(),
          actionHistory: FieldValue.arrayUnion({
            action: "paid_client_details_updated",
            byUid: staff.uid,
            at,
            changedFields,
          }),
        };
        transaction.update(leadRef, leadUpdate);
        transaction.set(
          portalRef,
          {
            clientName: fullName,
            title,
            firstName,
            lastName,
            clientEmail: emailNormalized,
            telephone,
            mobile,
            addressLine1,
            addressLine2,
            town,
            county,
            postcode,
            country,
            address,
            personalDetails: {
              fullName,
              title,
              firstName,
              lastName,
              email: emailNormalized,
              telephone,
              mobile,
              addressLine1,
              addressLine2,
              town,
              county,
              postcode,
              country,
            },
            updatedAt: now(),
            updatedBy: staff.uid,
          },
          { merge: true },
        );
        for (const ref of [newEmailKey, newPhoneKey].filter(Boolean))
          transaction.set(
            ref,
            { leadId: lead.id, ownerUid: staff.uid, updatedAt: now() },
            { merge: true },
          );
        for (const ref of [oldEmailKey, oldPhoneKey].filter(Boolean)) {
          if (![newEmailKey?.path, newPhoneKey?.path].includes(ref.path)) {
            const old = byPath.get(ref.path);
            if (old.exists && old.data().leadId === lead.id)
              transaction.delete(ref);
          }
        }
      });
    } catch (error) {
      if (authEmailChanged && beforeEmail)
        await admin
          .auth()
          .updateUser(clientUid, { email: beforeEmail, emailVerified: true })
          .catch(() => {});
      throw error;
    }
    await audit(db, caseId, "CLIENT_DETAILS_UPDATED", staff, {
      changedFields,
      crm4LeadId: lead.id,
      portalIdentityUpdated: Boolean(clientUid),
    });
    return { status: "UPDATED", changedFields };
  });

  const updateLegacyCommercial = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      origin = lower(lead.workspaceOrigin),
      nativeCommercialAuthority = Boolean(
        lead.securePaymentLink ||
        lead.paymentProviderTransactionId ||
        lead.paymentRequestSentAt ||
        (lead.agreementDocumentId && lead.agreementSignedAt) ||
        (lead.paymentStatus === "payment_confirmed" && lead.paymentConfirmedAt)
      );
    if (!["legacy_existing_client", "existing crm record", "existing_crm_record"].includes(origin) || nativeCommercialAuthority)
      fail(HttpsError, "permission-denied", "CRM4-native commercial authority cannot be overridden from the migration workspace.");
    const input = request.data?.commercial || {},
      currency = text(input.currency, 8).toUpperCase(),
      agreementStatus = text(input.agreementStatus, 80) || "not_recorded",
      paymentStatus = text(input.paymentStatus, 80) || "not_recorded",
      resultFeeStatus = text(input.resultFeeStatus, 80) || "not_recorded",
      agreementStatuses = new Set(["not_recorded", "historical_unverified", "executed", "signed"]),
      paymentStatuses = new Set(["not_recorded", "unpaid", "part_paid", "completed"]),
      resultStatuses = new Set(["not_recorded", "pending", "part_paid", "paid", "completed"]);
    if (!["GBP", "EUR"].includes(currency) || !agreementStatuses.has(agreementStatus) || !paymentStatuses.has(paymentStatus) || !resultStatuses.has(resultFeeStatus))
      fail(HttpsError, "invalid-argument", "The historical commercial status or currency is invalid.");
    const optionalAmount = (value, labelValue) => {
      if (value === "" || value === null || value === undefined) return null;
      const amount = Number(value);
      if (!Number.isFinite(amount) || amount < 0 || amount > 10000000)
        fail(HttpsError, "invalid-argument", `${labelValue} must be a valid non-negative amount.`);
      return Math.round(amount * 100) / 100;
    };
    const serviceFee = optionalAmount(input.serviceFee, "Service Fee"),
      amountPaid = optionalAmount(input.amountPaid, "Amount Paid"),
      successFee = optionalAmount(input.successFeePercentage, "Result Fee percentage");
    if (successFee !== null && successFee > 100)
      fail(HttpsError, "invalid-argument", "Result Fee percentage must be between 0 and 100.");
    if (serviceFee !== null && amountPaid !== null && amountPaid > serviceFee)
      fail(HttpsError, "invalid-argument", "Amount Paid cannot exceed the Service Fee without separate exceptional authority.");
    const outstanding = serviceFee !== null && amountPaid !== null ? Math.round((serviceFee - amountPaid) * 100) / 100 : null,
      at = new Date().toISOString(),
      update = {
        agreementStatus,
        agreementDate: text(input.agreementDate, 20) || null,
        agreementReference: text(input.agreementReference, 180),
        agreementSource: text(input.agreementSource, 160) || "Legacy / Imported",
        agreedFeeAmount: serviceFee,
        agreedFeeCurrency: currency,
        amountPaidNow: amountPaid,
        amountDueNow: outstanding,
        paymentStatus,
        historicalPaymentDate: text(input.paymentDate, 20) || null,
        successFeePercentage: successFee,
        resultFeeStatus,
        historicalCommercialImport: {
          source: "Legacy / Imported",
          serviceFeeRecorded: serviceFee !== null,
          amountPaidRecorded: amountPaid !== null,
          outstandingRecorded: outstanding !== null,
          successFeeRecorded: successFee !== null,
          paymentProviderTransactionCreated: false,
          paymentLinkCreated: false,
          importedByUid: staff.uid,
          importedAt: at,
        },
        lastUpdatedAt: now(),
      },
      changedFields = Object.keys(update).filter((field) => field !== "lastUpdatedAt");
    const batch = db.batch();
    batch.set(db.collection(LEADS).doc(lead.id), update, { merge: true });
    batch.set(db.collection(CASES).doc(caseId), {
      historicalCommercialImport: update.historicalCommercialImport,
      updatedAt: now(), updatedBy: staff.uid,
    }, { merge: true });
    await batch.commit();
    await audit(db, caseId, "LEGACY_COMMERCIAL_DETAILS_UPDATED", staff, {
      changedFields,
      source: "Legacy / Imported",
      paymentProviderOperation: false,
      communicationSent: false,
    });
    return { status: "UPDATED", changedFields, outstanding };
  });

  const downloadAssessmentReport = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      assessment = await assessmentProjection(db, lead, HttpsError);
    if (!assessment?.reportAvailable)
      fail(
        HttpsError,
        "not-found",
        "The authoritative assessment report was not found.",
      );
    if (assessment.origin === "LEGACY_IMPORTED") {
      const imported = await db.collection(DOCUMENTS).doc(assessment.documentId).get(), row = imported.data(),
        [bytes] = await admin.storage().bucket().file(text(row.storagePath, 1500)).download(),
        actualHash = crypto.createHash("sha256").update(bytes).digest("hex");
      if (!row.sha256 || actualHash !== row.sha256) fail(HttpsError, "data-loss", "Stored imported assessment verification failed.");
      await audit(db, caseIdFor(lead.id), request.data?.intent === "download" ? "IMPORTED_ASSESSMENT_DOWNLOADED" : "IMPORTED_ASSESSMENT_VIEWED", staff, { documentId: assessment.documentId, qarReference: assessment.qarReference });
      return { filename: text(row.originalFilename || row.title, 300) || "Quaerens-Imported-Assessment", content: bytes.toString("base64"), contentType: text(row.contentType, 120), hash: actualHash };
    }
    const documentSnap = await db
        .collection("professionalAssessmentDocuments")
        .doc(assessment.documentId)
        .get(),
      document = documentSnap.data(),
      [bytes] = await admin
        .storage()
        .bucket()
        .file(document.pdfPath)
        .download(),
      actualHash = crypto.createHash("sha256").update(bytes).digest("hex");
    if (!document.pdfHash || actualHash !== document.pdfHash)
      fail(HttpsError, "data-loss", "Stored report verification failed.");
    const intent = request.data?.intent === "download" ? "DOWNLOAD" : "VIEW";
    await db.collection("professionalAssessmentAudit").add({
      assessmentId: assessment.id,
      event: `CRM4_PROCESSING_REPORT_${intent}ED`,
      actorUid: staff.uid,
      actorRole: staff.role,
      metadata: {
        crm4LeadId: lead.id,
        documentId: assessment.documentId,
        qarReference: assessment.qarReference,
      },
      createdAt: now(),
    });
    return {
      filename: `${assessment.qarReference || "Quaerens-Assessment"}-Report.pdf`,
      content: bytes.toString("base64"),
      contentType: "application/pdf",
      hash: actualHash,
    };
  });

  const addRequirement = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff);
    const title = text(request.data?.title, 300),
      description = text(request.data?.description, 3000);
    if (!title || !description)
      fail(
        HttpsError,
        "invalid-argument",
        "A document title and description are required.",
      );
    const id = requirementId(caseId, title),
      ref = db.collection(REQUIREMENTS).doc(id);
    if ((await ref.get()).exists)
      return { id, status: "ALREADY_EXISTS", idempotent: true };
    await ref.create({
      caseId,
      crm4LeadId: lead.id,
      title,
      description,
      required: request.data?.required === true,
      clientVisible: request.data?.clientVisible !== false,
      status: "outstanding",
      dueDate: text(request.data?.dueDate, 20),
      source: "case-custom",
      createdAt: now(),
      createdByUid: staff.uid,
    });
    await audit(db, caseId, "DOCUMENT_REQUIREMENT_ADDED", staff, {
      requirementId: id,
    });
    return { id, status: "CREATED", idempotent: false };
  });

  const updateChecklist = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      key = text(request.data?.key, 80);
    if (!HUMAN_CHECKS.has(key))
      fail(
        HttpsError,
        "failed-precondition",
        "That onboarding step is derived from authoritative system state.",
      );
    const value = request.data?.complete === true;
    const update = {
      [`onboardingChecklist.${key}`]: value,
      updatedAt: now(),
      updatedBy: staff.uid,
    };
    if (key === "notesRecorded")
      update.onboardingNotes = text(request.data?.notes, 8000);
    await db.collection(CASES).doc(caseId).update(update);
    await audit(db, caseId, "ONBOARDING_CHECKLIST_UPDATED", staff, {
      key,
      complete: value,
    });
    return { status: "UPDATED" };
  });

  const activate = onCall({ secrets: [resendSecret] }, async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      password = String(request.data?.password || ""),
      clientEmail = lower(lead.email || lead.emailAddress);
    if (!validEmail(clientEmail))
      fail(
        HttpsError,
        "failed-precondition",
        "The authoritative CRM4 client email is invalid.",
      );
    if (
      password.length < 12 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    )
      fail(
        HttpsError,
        "invalid-argument",
        "Use at least 12 characters with upper-case, lower-case and a number.",
      );
    const caseRef = db.collection(CASES).doc(caseId),
      before = await caseRef.get();
    const alreadyActive = Boolean(
      before.data()?.clientUid && before.data()?.accessState === "ACTIVE",
    );
    let user;
    try {
      user = await admin.auth().getUserByEmail(clientEmail);
      if ((await db.collection("crm4Memberships").doc(user.uid).get()).exists)
        fail(
          HttpsError,
          "already-exists",
          "A staff identity cannot be used as a client account.",
        );
      user = await admin.auth().updateUser(user.uid, {
        password,
        emailVerified: true,
        disabled: false,
      });
    } catch (error) {
      if (error.code !== "auth/user-not-found") throw error;
      user = await admin.auth().createUser({
        email: clientEmail,
        password,
        emailVerified: true,
        disabled: false,
      });
    }
    const conflicts = await db
      .collection(ACCESS)
      .where("uid", "==", user.uid)
      .where("active", "==", true)
      .get();
    if (conflicts.docs.some((doc) => doc.data().caseId !== caseId))
      fail(
        HttpsError,
        "already-exists",
        "This authenticated account is already linked to another governed client case.",
      );
    await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(caseRef);
      if (fresh.data()?.clientUid && fresh.data().clientUid !== user.uid)
        fail(
          HttpsError,
          "already-exists",
          "This client case is already linked to another account.",
        );
      transaction.set(
        db.collection(ACCESS).doc(accessId(user.uid, caseId)),
        {
          uid: user.uid,
          caseId,
          emailLower: clientEmail,
          active: true,
          activatedAt: now(),
          activatedByUid: staff.uid,
        },
        { merge: true },
      );
      transaction.update(caseRef, {
        clientUid: user.uid,
        accessState: "ACTIVE",
        portalActivatedAt: now(),
        portalActivatedByUid: staff.uid,
        "onboardingChecklist.portalActivated": true,
        updatedAt: now(),
      });
    });
    const eventId = `portal-activation:${caseId}`,
      eventRef = db.collection(NOTIFICATIONS).doc(eventId);
    let eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      await eventRef.create({
        caseId,
        crm4LeadId: lead.id,
        type: "portal_activation",
        status: "PENDING",
        createdAt: now(),
      });
      eventSnap = await eventRef.get();
    }
    if (eventSnap.data().status !== "SENT") {
      const loginUrl = "https://www.quaerens.co.uk/client-portal.html";
      const clientBody = `Dear ${clientName(lead)},\n\nYour secure Quaerens Client Portal is now active.\n\nUsername: ${clientEmail}\nOpen Client Portal: ${loginUrl}\n\nYour password was agreed during your Administration Onboarding call and is not included in this email. If you forget it, use Forgot Password on the login page.\n\nFor efficiency, security and to ensure your complete case history remains in one place, written case communications are managed through your secure Quaerens Client Portal. This is an automated notification and replies to this email are not monitored.\n\nDocuments, messages, requests and case progress will be managed through the secure Client Portal.\n\nKind regards,\n\nQuaerens Administration & Processing Team`;
      const internalBody = `A governed Client Portal account has been activated.\n\nClient: ${clientName(lead)}\nEmail: ${clientEmail}\nTelephone: ${text(lead.telephone || lead.phone, 80) || "Not recorded"}\nAddress: ${text(lead.fullAddress || lead.address, 1000) || "Not recorded"}\nCRM4 Lead ID: ${lead.id}\nRoute: ${text(lead.assessmentRoute || lead.claimType, 120)}\nAssigned Closer: ${text(lead.assignedToName || lead.assignedUserName, 160) || "Not recorded"}\nPortal account UID: ${user.uid}\nActivation event: ${eventId}\nAdministration Onboarding: ${text(lead.administrationOnboardingDate, 20)} ${text(lead.administrationOnboardingTime, 20)}\n\nOpen the protected workspace: https://www.quaerens.co.uk/paid-client-workspace.html?lead=${encodeURIComponent(lead.id)}`;
      const clientResult = await resend.emails.send(
        clientNotificationPayload({
          to: clientEmail,
          subject: "Your Quaerens Client Portal is active",
          body: clientBody,
          type: "portal_activation",
        }),
        { idempotencyKey: `crm4-${eventId}-client` },
      );
      const internalResult = await resend.emails.send(
        internalNotificationPayload({
          subject: `Client Portal Activated — ${clientName(lead)}`,
          body: internalBody,
          type: "portal_activation_internal",
        }),
        { idempotencyKey: `crm4-${eventId}-internal` },
      );
      await eventRef.update({
        status: "SENT",
        clientProviderMessageId: text(clientResult?.data?.id, 200),
        internalProviderMessageId: text(internalResult?.data?.id, 200),
        sentAt: now(),
        recipient: clientEmail,
        internalRecipient: "support@quaerens.co.uk",
        internalCc: "info@quaerens.co.uk",
      });
    }
    await db.collection(ACTIVITY).doc(`portal-activated:${caseId}`).set(
      {
        caseId,
        type: "portal_activated",
        title: "Portal Activated",
        detail: "Your secure Quaerens Client Portal was activated.",
        clientVisible: true,
        occurredAt: now(),
        sourceEventId: eventId,
      },
      { merge: true },
    );
    await audit(db, caseId, "CLIENT_PORTAL_ACTIVATED", staff, {
      clientUid: user.uid,
      notificationEventId: eventId,
    });
    return {
      status: alreadyActive ? "ALREADY_ACTIVE" : "ACTIVATED",
      idempotent: alreadyActive,
      clientUid: user.uid,
    };
  });

  const clientMessage = onCall({ secrets: [resendSecret] }, async (request) => {
    const client = await clientCase(request),
      body = text(request.data?.body, 8000),
      requestId = text(request.data?.requestId, 80);
    if (!body || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId))
      fail(
        HttpsError,
        "invalid-argument",
        "A message and unique request identity are required.",
      );
    const ref = db
        .collection(MESSAGES)
        .doc(`client-${client.caseId}-${requestId}`),
      eventId = `portal-message:${ref.id}:internal`,
      eventRef = db.collection(NOTIFICATIONS).doc(eventId);
    if ((await ref.get()).exists)
      return { id: ref.id, status: "ALREADY_CREATED", idempotent: true };
    await ref.create({
      caseId: client.caseId,
      body,
      senderType: "client",
      senderUid: client.uid,
      senderName: "Client",
      recipientType: "processing",
      visibleToClient: true,
      staffReadState: "unread",
      clientReadState: "sent",
      createdAt: now(),
    });
    await eventRef.create({
      caseId: client.caseId,
      messageId: ref.id,
      type: "client_message_internal",
      status: "PENDING",
      createdAt: now(),
    });
    const leadId = text(
        client.portal.crm4LeadId || client.portal.crmLink?.caseId,
        180,
      ),
      mailBody = `A new secure Client Portal message is waiting.\n\nClient case: ${text(client.portal.caseRef, 120)}\nCRM4 Lead ID: ${leadId}\n\nOpen the protected workspace: https://www.quaerens.co.uk/paid-client-workspace.html?lead=${encodeURIComponent(leadId)}\n\nFor privacy, the message content is not reproduced in this email.`;
    const result = await resend.emails.send(
      internalNotificationPayload({
        subject: "New secure Client Portal message",
        body: mailBody,
        type: "portal_client_message_internal",
      }),
      { idempotencyKey: `crm4-${eventId}` },
    );
    await eventRef.update({
      status: "SENT",
      providerMessageId: text(result?.data?.id, 200),
      recipient: "support@quaerens.co.uk",
      cc: "info@quaerens.co.uk",
      sentAt: now(),
    });
    await db.collection(AUDIT).add({
      caseId: client.caseId,
      action: "CLIENT_MESSAGE_CREATED",
      actorUid: client.uid,
      actorType: "client",
      details: { messageId: ref.id },
      createdAt: now(),
    });
    await db.collection(ACTIVITY).doc(`client-message:${ref.id}`).create({
      caseId: client.caseId,
      type: "client_message",
      title: "New message received from client",
      detail: "A secure portal message was sent to Quaerens Processing.",
      clientVisible: true,
      occurredAt: now(),
      sourceEventId: eventId,
    });
    return { id: ref.id, status: "CREATED", idempotent: false };
  });

  const clientUpload = onCall({ secrets: [resendSecret] }, async (request) => {
    const client = await clientCase(request),
      documentId = text(request.data?.documentId, 256),
      requirementIdValue = text(request.data?.requirementId, 256),
      storagePath = text(request.data?.storagePath, 1500),
      contentType = lower(request.data?.contentType),
      size = Number(request.data?.size || 0);
    const allowed = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    if (
      !documentId ||
      !requirementIdValue ||
      !allowed.has(contentType) ||
      size <= 0 ||
      size > 15 * 1024 * 1024 ||
      !storagePath.startsWith(
        `clientPortal/${client.caseId}/client-uploads/${client.uid}/`,
      )
    )
      fail(HttpsError, "invalid-argument", "The upload metadata is invalid.");
    const requirement = await db
      .collection(REQUIREMENTS)
      .doc(requirementIdValue)
      .get();
    if (
      !requirement.exists ||
      requirement.data().caseId !== client.caseId ||
      requirement.data().clientVisible !== true
    )
      fail(
        HttpsError,
        "permission-denied",
        "That document requirement is not authorised.",
      );
    if (!(await admin.storage().bucket().file(storagePath).exists())[0])
      fail(
        HttpsError,
        "failed-precondition",
        "The uploaded object was not found.",
      );
    const ref = db.collection(DOCUMENTS).doc(documentId),
      eventId = `portal-upload:${documentId}:internal`;
    await ref.create({
      caseId: client.caseId,
      requirementId: requirementIdValue,
      title: text(request.data?.title, 300),
      originalFilename: text(request.data?.title, 300),
      category: text(requirement.data().title, 120),
      uploadedBy: "client",
      uploadedByUid: client.uid,
      uploadedAt: now(),
      visibility: "CLIENT_SHARED",
      clientVisible: true,
      status: "UPLOADED",
      version: 1,
      storagePath,
      contentType,
      size,
    });
    await requirement.ref.update({
      status: "uploaded",
      latestDocumentId: documentId,
      uploadedAt: now(),
      updatedAt: now(),
    });
    const eventRef = db.collection(NOTIFICATIONS).doc(eventId);
    await eventRef.create({
      caseId: client.caseId,
      documentId,
      type: "client_upload_internal",
      status: "PENDING",
      createdAt: now(),
    });
    const leadId = text(
        client.portal.crm4LeadId || client.portal.crmLink?.caseId,
        180,
      ),
      mailBody = `A client uploaded a document to the secure portal.\n\nClient: ${text(client.portal.clientName, 200)}\nCRM4 Lead ID: ${leadId}\nRoute: ${text(client.portal.route || client.portal.claimType, 120)}\nDocument requirement: ${text(requirement.data().title, 300)}\nFilename: ${text(request.data?.title, 300)}\n\nOpen the protected workspace: https://www.quaerens.co.uk/paid-client-workspace.html?lead=${encodeURIComponent(leadId)}`;
    const result = await resend.emails.send(
      internalNotificationPayload({
        subject: "New secure Client Portal document",
        body: mailBody,
        type: "portal_client_document_internal",
      }),
      { idempotencyKey: `crm4-${eventId}` },
    );
    await eventRef.update({
      status: "SENT",
      providerMessageId: text(result?.data?.id, 200),
      recipient: "support@quaerens.co.uk",
      cc: "info@quaerens.co.uk",
      sentAt: now(),
    });
    return { id: documentId, status: "REGISTERED" };
  });

  const staffMessage = onCall({ secrets: [resendSecret] }, async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      body = text(request.data?.body, 8000),
      requestId = text(request.data?.requestId, 80);
    if (!body || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId))
      fail(
        HttpsError,
        "invalid-argument",
        "A message and unique request identity are required.",
      );
    const ref = db.collection(MESSAGES).doc(`staff-${caseId}-${requestId}`),
      eventId = `portal-message:${ref.id}:client`;
    if ((await ref.get()).exists)
      return { id: ref.id, status: "ALREADY_CREATED", idempotent: true };
    await ref.create({
      caseId,
      body,
      senderType: "support",
      senderUid: staff.uid,
      senderName: "Quaerens Processing Team",
      recipientType: "client",
      visibleToClient: true,
      clientReadState: "unread",
      staffReadState: "sent",
      createdAt: now(),
    });
    const eventRef = db.collection(NOTIFICATIONS).doc(eventId);
    await eventRef.create({
      caseId,
      messageId: ref.id,
      type: "staff_message_client",
      status: "PENDING",
      createdAt: now(),
    });
    const recipient = lower(lead.email || lead.emailAddress),
      mailBody = `Dear ${clientName(lead)},\n\nA new secure message is waiting in your Quaerens Client Portal. For privacy, the message is not reproduced in this email.\n\nFor efficiency, security and to ensure your complete case history remains in one place, written case communications are managed through your secure Quaerens Client Portal. This is an automated notification and replies to this email are not monitored.\n\nOpen Client Portal: https://www.quaerens.co.uk/client-portal.html\n\nKind regards,\n\nQuaerens Administration & Processing Team`;
    const result = await resend.emails.send(
      clientNotificationPayload({
        to: recipient,
        subject: "New secure message in your Quaerens Client Portal",
        body: mailBody,
        type: "portal_staff_message_client",
      }),
      { idempotencyKey: `crm4-${eventId}` },
    );
    await eventRef.update({
      status: "SENT",
      providerMessageId: text(result?.data?.id, 200),
      recipient,
      sentAt: now(),
    });
    await db.collection(ACTIVITY).doc(`staff-message:${ref.id}`).create({
      caseId,
      type: "message_to_client",
      title: "Message sent to client",
      detail: "A secure portal message was shared by Quaerens Processing.",
      clientVisible: true,
      occurredAt: now(),
      sourceEventId: eventId,
    });
    await audit(db, caseId, "STAFF_MESSAGE_SHARED", staff, {
      messageId: ref.id,
    });
    return { id: ref.id, status: "CREATED", idempotent: false };
  });

  const importAssessmentReport = onCall(
    { timeoutSeconds: 120, memory: "512MiB" },
    async (request) => {
      const staff = await actor(request, db, HttpsError),
        lead = await authoritative(db, request.data?.leadId, HttpsError),
        caseId = await ensureWorkspace(db, admin, lead, staff),
        documentId = text(request.data?.documentId, 180),
        filename = text(request.data?.filename, 300).replace(/[\\/:*?"<>|]/g, "_"),
        contentType = lower(request.data?.contentType),
        encoded = String(request.data?.content || ""),
        declaredSize = Number(request.data?.size || 0),
        clientVisible = request.data?.clientVisible === true,
        allowed = new Map([
          ["application/pdf", ".pdf"],
          ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
          ["text/plain", ".txt"],
        ]);
      if (
        !documentId ||
        !/^[A-Za-z0-9_-]{8,180}$/.test(documentId) ||
        !filename ||
        !allowed.has(contentType) ||
        !filename.toLowerCase().endsWith(allowed.get(contentType)) ||
        declaredSize <= 0 ||
        declaredSize > 15 * 1024 * 1024 ||
        !encoded ||
        encoded.length > 21 * 1024 * 1024
      )
        fail(HttpsError, "invalid-argument", "The imported assessment file or metadata is invalid.");
      const bytes = Buffer.from(encoded, "base64");
      if (bytes.length !== declaredSize)
        fail(HttpsError, "invalid-argument", "The imported assessment size verification failed.");
      const extractedText = await extractImportedAssessment(bytes, contentType);
      if (!extractedText)
        fail(HttpsError, "failed-precondition", "The imported assessment contains no readable text.");
      const sha256 = crypto.createHash("sha256").update(bytes).digest("hex"),
        ref = db.collection(DOCUMENTS).doc(documentId),
        existing = await ref.get();
      if (existing.exists) {
        const row = existing.data() || {};
        if (row.caseId === caseId && row.documentType === "imported_assessment" && row.sha256 === sha256)
          return { id: documentId, status: "ALREADY_IMPORTED", version: Number(row.version || 1), hash: sha256, idempotent: true };
        fail(HttpsError, "already-exists", "That import identity is already in use.");
      }
      const prior = await db.collection(DOCUMENTS).where("caseId", "==", caseId).get(),
        version = 1 + prior.docs
          .filter((doc) => doc.data().documentType === "imported_assessment")
          .reduce((max, doc) => Math.max(max, Number(doc.data().version || 1)), 0),
        storagePath = `clientPortal/${caseId}/shared/imported-assessment/${documentId}_${filename}`,
        bucketFile = admin.storage().bucket().file(storagePath),
        assessmentStatus = text(request.data?.assessmentStatus, 80) || "completed",
        assessmentDate = text(request.data?.assessmentDate, 20),
        assessmentRoute = text(request.data?.assessmentRoute || lead.claimType, 120),
        qarReference = text(request.data?.qarReference || lead.assessmentQar, 120),
        documentData = {
          caseId,
          crm4LeadId: lead.id,
          requirementId: "",
          title: filename,
          originalFilename: filename,
          category: "Legacy / Imported Quaerens Assessment",
          documentType: "imported_assessment",
          uploadedBy: "staff",
          uploadedByUid: staff.uid,
          uploadedByName: staff.name,
          uploadedAt: now(),
          visibility: clientVisible ? "CLIENT_SHARED" : "INTERNAL",
          clientVisible,
          status: clientVisible ? "SHARED" : "INTERNAL",
          internalNote: "Governed legacy assessment migration; notifications suppressed.",
          historicalImported: true,
          notificationSuppressed: true,
          version,
          storagePath,
          contentType,
          size: bytes.length,
          sha256,
          extractedText,
          assessmentStatus,
          assessmentDate,
          assessmentRoute,
          assessmentSource: "Legacy / Imported Quaerens Assessment",
          qarReference,
        };
      await bucketFile.save(bytes, {
        resumable: false,
        contentType,
        metadata: {
          cacheControl: "private, no-store",
          metadata: {
            caseId,
            documentId,
            clientVisible: String(clientVisible),
            uploadedByUid: staff.uid,
            sha256,
          },
        },
      });
      try {
        const batch = db.batch();
        batch.create(ref, documentData);
        batch.set(db.collection(LEADS).doc(lead.id), {
          importedAssessmentDocumentId: documentId,
          assessmentOrigin: "LEGACY_IMPORTED",
          assessmentSource: "Legacy / Imported Quaerens Assessment",
          assessmentQar: qarReference,
          assessmentStatus,
          assessmentReportStatus: "AVAILABLE",
          assessmentRoute,
          aiProcessingMaterialVersion: sha256,
          aiProcessingLastAssessmentChangedAt: now(),
          lastUpdatedAt: now(),
        }, { merge: true });
        batch.set(db.collection(CASES).doc(caseId), {
          importedAssessmentDocumentId: documentId,
          assessmentOrigin: "LEGACY_IMPORTED",
          assessmentSource: "Legacy / Imported Quaerens Assessment",
          updatedAt: now(),
          updatedBy: staff.uid,
        }, { merge: true });
        await batch.commit();
      } catch (error) {
        await bucketFile.delete({ ignoreNotFound: true }).catch(() => {});
        throw error;
      }
      await audit(db, caseId, "LEGACY_ASSESSMENT_IMPORTED", staff, {
        documentId,
        qarReference,
        sha256,
        version,
        clientVisible,
        notificationSuppressed: true,
        aiAnalysisInvalidated: true,
      });
      return { id: documentId, status: "IMPORTED", version, hash: sha256, idempotent: false };
    },
  );

  const importAgreementDocument = onCall(
    { timeoutSeconds: 120, memory: "512MiB", secrets: [resendSecret] },
    async (request) => {
      const staff = await actor(request, db, HttpsError),
        lead = await authoritative(db, request.data?.leadId, HttpsError),
        caseId = await ensureWorkspace(db, admin, lead, staff),
        documentId = text(request.data?.documentId, 180),
        filename = text(request.data?.filename, 300).replace(/[\\/:*?"<>|]/g, "_"),
        contentType = lower(request.data?.contentType),
        encoded = String(request.data?.content || ""),
        declaredSize = Number(request.data?.size || 0),
        clientVisible = request.data?.clientVisible === true,
        historicalMigration = request.data?.historicalMigration === true,
        allowed = new Map([
          ["application/pdf", ".pdf"],
          ["application/msword", ".doc"],
          ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
        ]);
      if (
        !documentId ||
        !/^[A-Za-z0-9_-]{8,180}$/.test(documentId) ||
        !filename ||
        !allowed.has(contentType) ||
        !filename.toLowerCase().endsWith(allowed.get(contentType)) ||
        declaredSize <= 0 ||
        declaredSize > 15 * 1024 * 1024 ||
        !encoded ||
        encoded.length > 21 * 1024 * 1024
      )
        fail(HttpsError, "invalid-argument", "The imported agreement file or metadata is invalid.");
      const bytes = Buffer.from(encoded, "base64");
      if (bytes.length !== declaredSize)
        fail(HttpsError, "invalid-argument", "The imported agreement size verification failed.");
      const sha256 = crypto.createHash("sha256").update(bytes).digest("hex"),
        ref = db.collection(DOCUMENTS).doc(documentId),
        existing = await ref.get();
      if (existing.exists) {
        const row = existing.data() || {};
        if (row.caseId === caseId && row.documentType === "agreement" && row.sha256 === sha256)
          return { id: documentId, status: "ALREADY_IMPORTED", version: Number(row.version || 1), hash: sha256, idempotent: true };
        fail(HttpsError, "already-exists", "That import identity is already in use.");
      }
      const prior = await db.collection(DOCUMENTS).where("caseId", "==", caseId).get(),
        version = 1 + prior.docs
          .filter((doc) => doc.data().documentType === "agreement")
          .reduce((max, doc) => Math.max(max, Number(doc.data().version || 1)), 0),
        storagePath = `clientPortal/${caseId}/shared/imported-agreement/${documentId}_${filename}`,
        bucketFile = admin.storage().bucket().file(storagePath),
        agreementReference = text(request.data?.agreementReference || lead.agreementReference || lead.agreementDocumentId, 180),
        agreementDate = text(request.data?.agreementDate, 20),
        agreementStatus = text(request.data?.agreementStatus, 80) || "historical_unverified",
        documentData = {
          caseId,
          crm4LeadId: lead.id,
          requirementId: "",
          title: filename,
          originalFilename: filename,
          category: "Executed Agreement",
          documentType: "agreement",
          agreementReference,
          agreementDate,
          agreementStatus,
          agreementSource: historicalMigration ? "Legacy / Imported Agreement" : "Imported Executed Agreement",
          agreementVersion: version,
          uploadedBy: "staff",
          uploadedByUid: staff.uid,
          uploadedByName: staff.name,
          uploadedAt: now(),
          visibility: clientVisible ? "CLIENT_SHARED" : "INTERNAL",
          clientVisible,
          status: clientVisible ? "SHARED" : "INTERNAL",
          historicalImported: historicalMigration,
          notificationSuppressed: historicalMigration,
          version,
          storagePath,
          contentType,
          size: bytes.length,
          sha256,
        };
      await bucketFile.save(bytes, {
        resumable: false,
        contentType,
        metadata: {
          cacheControl: "private, no-store",
          metadata: { caseId, documentId, clientVisible: String(clientVisible), uploadedByUid: staff.uid, sha256 },
        },
      });
      try {
        const batch = db.batch();
        batch.create(ref, documentData);
        batch.set(db.collection(LEADS).doc(lead.id), {
          importedAgreementDocumentId: documentId,
          importedAgreementSource: documentData.agreementSource,
          importedAgreementVersion: version,
          lastUpdatedAt: now(),
        }, { merge: true });
        batch.set(db.collection(CASES).doc(caseId), {
          importedAgreementDocumentId: documentId,
          importedAgreementSource: documentData.agreementSource,
          updatedAt: now(),
          updatedBy: staff.uid,
        }, { merge: true });
        await batch.commit();
      } catch (error) {
        await bucketFile.delete({ ignoreNotFound: true }).catch(() => {});
        throw error;
      }
      await audit(db, caseId, "IMPORTED_AGREEMENT_VERSION_ADDED", staff, {
        documentId, agreementReference, agreementDate, agreementStatus, sha256, version,
        clientVisible, historicalMigration, notificationSuppressed: historicalMigration,
      });
      if (clientVisible && !historicalMigration) {
        const eventId = `portal-document:${documentId}:client`,
          eventRef = db.collection(NOTIFICATIONS).doc(eventId),
          recipient = lower(lead.email || lead.emailAddress);
        await eventRef.create({ caseId, documentId, type: "staff_document_client", status: "PENDING", createdAt: now() });
        const mailBody = `Dear ${clientName(lead)},\n\nAn executed agreement has been added to your secure Quaerens Client Portal.\n\nDocument: ${filename}\n\nOpen Client Portal: https://www.quaerens.co.uk/client-portal.html\n\nKind regards,\n\nQuaerens Administration & Processing Team`;
        const result = await resend.emails.send(clientNotificationPayload({
          to: recipient, subject: "Agreement added to your secure Client Portal", body: mailBody,
          type: "portal_staff_document_client",
        }), { idempotencyKey: `crm4-${eventId}` });
        await eventRef.update({ status: "SENT", providerMessageId: text(result?.data?.id, 200), recipient, sentAt: now() });
      }
      return { id: documentId, status: "IMPORTED", version, hash: sha256, idempotent: false };
    },
  );

  const createStaffUploadUrl = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      filename = text(request.data?.filename, 240).replace(/[^a-zA-Z0-9._-]/g, "_"),
      contentType = lower(request.data?.contentType),
      size = Number(request.data?.size || 0),
      clientVisible = request.data?.clientVisible === true,
      allowed = new Set([
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]);
    if (!filename || !allowed.has(contentType) || size <= 0 || size > 15 * 1024 * 1024)
      fail(HttpsError, "invalid-argument", "Select an approved evidence file between 1 byte and 15 MB.");
    const documentId = crypto.randomUUID(),
      storagePath = `clientPortal/${caseId}/shared/${documentId}_${filename}`;
    let uploadUrl;
    if (process.env.FUNCTIONS_EMULATOR === "true") {
      // The emulator's application-default credentials deliberately have no
      // signing identity. Keep the production grant path unchanged while
      // allowing the authenticated contract to be exercised locally.
      uploadUrl = `http://127.0.0.1:9199/v0/b/${encodeURIComponent(admin.storage().bucket().name)}/o/${encodeURIComponent(storagePath)}?uploadType=media`;
    } else {
      try {
        [uploadUrl] = await admin.storage().bucket().file(storagePath).getSignedUrl({
          version: "v4",
          action: "write",
          expires: Date.now() + 10 * 60 * 1000,
          contentType,
        });
      } catch (error) {
        console.error("Paid Client upload grant signing failed", {
          code: text(error?.code, 80),
        });
        fail(
          HttpsError,
          "unavailable",
          "The secure upload could not be prepared. Please try again.",
        );
      }
    }
    await audit(db, caseId, "STAFF_DOCUMENT_UPLOAD_AUTHORISED", staff, {
      documentId,
      clientVisible,
      expiresMinutes: 10,
    });
    return { documentId, storagePath, uploadUrl, contentType, expiresMinutes: 10 };
  });

  const staffDocument = onCall({ secrets: [resendSecret] }, async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      documentId = text(request.data?.documentId, 256),
      storagePath = text(request.data?.storagePath, 1500),
      contentType = lower(request.data?.contentType),
      size = Number(request.data?.size || 0),
      requestedType = text(request.data?.documentType, 60) || "evidence",
      importedAssessment = requestedType === "imported_assessment",
      clientVisible = importedAssessment ? request.data?.clientVisible === true : request.data?.clientVisible === true,
      requirementIdValue = text(request.data?.requirementId, 256);
    const allowed = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    if (
      !documentId ||
      !allowed.has(contentType) ||
      size <= 0 ||
      size > 15 * 1024 * 1024 ||
      !storagePath.startsWith(`clientPortal/${caseId}/shared/${documentId}_`)
    )
      fail(
        HttpsError,
        "invalid-argument",
        "The staff upload metadata is invalid.",
      );
    const bucketFile = admin.storage().bucket().file(storagePath);
    if (!(await bucketFile.exists())[0])
      fail(
        HttpsError,
        "failed-precondition",
        "The uploaded object was not found.",
      );
    const [objectMetadata] = await bucketFile.getMetadata(),
      actualContentType = lower(objectMetadata.contentType),
      actualSize = Number(objectMetadata.size || 0);
    if (actualContentType !== contentType || actualSize !== size)
      fail(HttpsError, "failed-precondition", "The uploaded object does not match the authorised evidence file.");
    await bucketFile.setMetadata({
      cacheControl: "private, no-store",
      metadata: {
        caseId,
        documentId,
        clientVisible: String(clientVisible),
        uploadedByUid: staff.uid,
      },
    });
    if (requirementIdValue) {
      const requirement = await db
        .collection(REQUIREMENTS)
        .doc(requirementIdValue)
        .get();
      if (!requirement.exists || requirement.data().caseId !== caseId)
        fail(
          HttpsError,
          "permission-denied",
          "That document requirement is not authorised.",
        );
    }
    const title = text(request.data?.title, 300),
      category = text(request.data?.category || "Case document", 120),
      documentType = requestedType,
      prior = await db
        .collection(DOCUMENTS)
        .where("caseId", "==", caseId)
        .get(),
      version =
        1 +
        prior.docs
          .filter(
            (doc) =>
              text(doc.data().documentType, 60) === documentType &&
              (documentType !== "evidence" ||
                text(doc.data().requirementId, 256) === requirementIdValue),
          )
          .reduce(
            (max, doc) => Math.max(max, Number(doc.data().version || 1)),
            0,
          ),
      ref = db.collection(DOCUMENTS).doc(documentId),
      [uploadedBytes] = await admin.storage().bucket().file(storagePath).download(),
      sha256 = crypto.createHash("sha256").update(uploadedBytes).digest("hex"),
      extractedText = importedAssessment ? await extractImportedAssessment(uploadedBytes, contentType) : "";
    if (importedAssessment && !["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(contentType))
      fail(HttpsError, "invalid-argument", "Imported assessments must be PDF, DOCX or plain text.");
    if (importedAssessment && !extractedText) fail(HttpsError, "failed-precondition", "The imported assessment contains no readable text.");
    const documentData = {
      caseId,
      requirementId: requirementIdValue,
      title,
      originalFilename: title,
      category,
      documentType,
      agreementReference:
        documentType === "agreement" ? text(lead.agreementDocumentId, 180) : "",
      agreementVersion:
        documentType === "agreement"
          ? Number(lead.agreementVersion || version)
          : null,
      uploadedBy: "staff",
      uploadedByUid: staff.uid,
      uploadedByName: staff.name,
      uploadedAt: now(),
      visibility: clientVisible ? "CLIENT_SHARED" : "INTERNAL",
      clientVisible,
      status: clientVisible ? "SHARED" : "INTERNAL",
      internalNote: text(request.data?.internalNote, 3000),
      historicalImported: request.data?.historicalImported === true,
      notificationSuppressed: importedAssessment || request.data?.historicalMigration === true,
      version,
      storagePath,
      contentType,
      size,
      sha256,
      extractedText,
      assessmentStatus: importedAssessment ? text(request.data?.assessmentStatus, 80) || "completed" : "",
      assessmentDate: importedAssessment ? text(request.data?.assessmentDate, 20) : "",
      assessmentRoute: importedAssessment ? text(request.data?.assessmentRoute || lead.claimType, 120) : "",
      assessmentSource: importedAssessment ? "Legacy / Imported Quaerens Assessment" : "",
      qarReference: importedAssessment ? text(request.data?.qarReference, 120) : "",
    };
    if (importedAssessment) {
      const batch = db.batch();
      batch.create(ref, documentData);
      batch.set(db.collection(LEADS).doc(lead.id), { importedAssessmentDocumentId: documentId, assessmentOrigin: "LEGACY_IMPORTED", assessmentSource: "Legacy / Imported Quaerens Assessment", assessmentQar: documentData.qarReference || text(lead.assessmentQar, 120), assessmentStatus: documentData.assessmentStatus, assessmentReportStatus: "AVAILABLE", assessmentRoute: documentData.assessmentRoute, lastUpdatedAt: now() }, { merge: true });
      batch.set(db.collection(CASES).doc(caseId), { importedAssessmentDocumentId: documentId, assessmentOrigin: "LEGACY_IMPORTED", assessmentSource: "Legacy / Imported Quaerens Assessment", updatedAt: now(), updatedBy: staff.uid }, { merge: true });
      await batch.commit();
      await audit(db, caseId, "LEGACY_ASSESSMENT_IMPORTED", staff, { documentId, qarReference: documentData.qarReference, sha256, version, notificationSuppressed: true });
    } else await ref.create(documentData);
    if (requirementIdValue)
      await db
        .collection(REQUIREMENTS)
        .doc(requirementIdValue)
        .update({
          status: clientVisible ? "uploaded" : "reviewed",
          latestDocumentId: documentId,
          updatedAt: now(),
        });
    if (clientVisible && !importedAssessment && request.data?.historicalMigration !== true) {
      const eventId = `portal-document:${documentId}:client`,
        eventRef = db.collection(NOTIFICATIONS).doc(eventId),
        recipient = lower(lead.email || lead.emailAddress);
      await eventRef.create({
        caseId,
        documentId,
        type: "staff_document_client",
        status: "PENDING",
        createdAt: now(),
      });
      const mailBody = `Dear ${clientName(lead)},\n\nA new document has been added to your secure Quaerens Client Portal.\n\nDocument: ${title}\nDate added: ${new Date().toLocaleDateString("en-GB")}\n\nFor efficiency, security and to ensure your complete case history remains in one place, written case communications are managed through your secure Quaerens Client Portal. This is an automated notification and replies to this email are not monitored.\n\nOpen Client Portal: https://www.quaerens.co.uk/client-portal.html\n\nKind regards,\n\nQuaerens Administration & Processing Team`;
      const result = await resend.emails.send(
        clientNotificationPayload({
          to: recipient,
          subject: "New document in your Quaerens Client Portal",
          body: mailBody,
          type: "portal_staff_document_client",
        }),
        { idempotencyKey: `crm4-${eventId}` },
      );
      await eventRef.update({
        status: "SENT",
        providerMessageId: text(result?.data?.id, 200),
        recipient,
        sentAt: now(),
      });
      await db
        .collection(ACTIVITY)
        .doc(`staff-document:${documentId}`)
        .create({
          caseId,
          type: "document_shared",
          title: "New document available",
          detail: `${title} was added to your secure case.`,
          clientVisible: true,
          occurredAt: now(),
          sourceEventId: eventId,
        });
    }
    await audit(
      db,
      caseId,
      clientVisible ? "DOCUMENT_SHARED" : "INTERNAL_DOCUMENT_ADDED",
      staff,
      { documentId, requirementId: requirementIdValue },
    );
    return {
      id: documentId,
      status: clientVisible ? "SHARED" : "INTERNAL",
      visibility: clientVisible ? "CLIENT_SHARED" : "INTERNAL",
      clientVisible,
    };
  });

  const discardStaffUpload = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = await ensureWorkspace(db, admin, lead, staff),
      documentId = text(request.data?.documentId, 256),
      storagePath = text(request.data?.storagePath, 1500);
    if (
      !documentId ||
      !storagePath.startsWith(`clientPortal/${caseId}/shared/${documentId}_`)
    )
      fail(HttpsError, "invalid-argument", "The failed upload identity is invalid.");
    const document = await db.collection(DOCUMENTS).doc(documentId).get();
    if (document.exists) {
      if (document.data().caseId !== caseId || document.data().storagePath !== storagePath)
        fail(HttpsError, "permission-denied", "That document is not authorised.");
      return { status: "REGISTERED", deleted: false };
    }
    await admin.storage().bucket().file(storagePath).delete({ ignoreNotFound: true });
    await audit(db, caseId, "STAFF_DOCUMENT_UPLOAD_DISCARDED", staff, {
      documentId,
      reason: "registration_failed",
    });
    return { status: "DISCARDED", deleted: true };
  });

  const updateEvidence = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = caseIdFor(lead.id),
      requirementIdValue = text(request.data?.requirementId, 256),
      documentId = text(request.data?.documentId, 256),
      priority = text(request.data?.priority, 20).toUpperCase();
    if (
      priority &&
      !["CRITICAL", "HIGH", "STANDARD", "SUPPORTING"].includes(priority)
    )
      fail(
        HttpsError,
        "invalid-argument",
        "Choose a governed evidence priority.",
      );
    if (requirementIdValue) {
      const ref = db.collection(REQUIREMENTS).doc(requirementIdValue),
        snap = await ref.get();
      if (!snap.exists || snap.data().caseId !== caseId)
        fail(
          HttpsError,
          "permission-denied",
          "That evidence requirement is not authorised.",
        );
      await ref.update({
        priority: priority || "STANDARD",
        requested: request.data?.requested === true,
        updatedAt: now(),
        updatedByUid: staff.uid,
      });
    }
    if (documentId) {
      const ref = db.collection(DOCUMENTS).doc(documentId),
        snap = await ref.get();
      if (!snap.exists || snap.data().caseId !== caseId)
        fail(
          HttpsError,
          "permission-denied",
          "That evidence document is not authorised.",
        );
      await ref.update({
        reviewed: request.data?.reviewed === true,
        reviewedAt:
          request.data?.reviewed === true
            ? snap.data().reviewedAt || now()
            : null,
        relevantToFirstComplaint:
          request.data?.relevantToFirstComplaint === true,
        includeInComplaintPack: request.data?.includeInComplaintPack === true,
        updatedAt: now(),
        updatedByUid: staff.uid,
      });
    }
    await audit(db, caseId, "EVIDENCE_GOVERNANCE_UPDATED", staff, {
      requirementId: requirementIdValue,
      documentId,
      priority,
    });
    return { status: "UPDATED" };
  });

  const downloadDocument = onCall(async (request) => {
    const staff = await actor(request, db, HttpsError),
      lead = await authoritative(db, request.data?.leadId, HttpsError),
      caseId = caseIdFor(lead.id),
      documentId = text(request.data?.documentId, 256),
      snap = await db.collection(DOCUMENTS).doc(documentId).get();
    if (!snap.exists || snap.data().caseId !== caseId)
      fail(
        HttpsError,
        "permission-denied",
        "That case document is not authorised.",
      );
    const row = snap.data(),
      [bytes] = await admin
        .storage()
        .bucket()
        .file(text(row.storagePath, 1500))
        .download();
    const expectedHash = text(row.sha256, 128),
      actualHash = crypto.createHash("sha256").update(bytes).digest("hex");
    if (expectedHash && expectedHash !== actualHash)
      fail(HttpsError, "data-loss", "The protected document integrity check failed.");
    await audit(
      db,
      caseId,
      request.data?.intent === "download"
        ? "EVIDENCE_DOWNLOADED"
        : "EVIDENCE_VIEWED",
      staff,
      { documentId },
    );
    return {
      filename:
        text(row.originalFilename || row.title, 300) || "Quaerens-document",
      contentType: text(row.contentType, 120) || "application/octet-stream",
      content: bytes.toString("base64"),
    };
  });

  const markMessageRead = onCall(async (request) => {
    const messageId = text(request.data?.messageId, 256),
      ref = db.collection(MESSAGES).doc(messageId),
      snap = await ref.get();
    if (!snap.exists)
      fail(HttpsError, "not-found", "The secure message was not found.");
    const row = snap.data(),
      caseId = text(row.caseId, 256);
    let readerType, readerUid;
    if (row.senderType === "client") {
      const staff = await actor(request, db, HttpsError);
      readerType = "processing";
      readerUid = staff.uid;
    } else {
      const client = await clientCase({
        ...request,
        data: { ...request.data, caseId },
      });
      readerType = "client";
      readerUid = client.uid;
    }
    const field =
        readerType === "client" ? "clientFirstSeenAt" : "staffFirstSeenAt",
      stateField =
        readerType === "client" ? "clientReadState" : "staffReadState";
    if (row[field])
      return {
        status: "ALREADY_READ",
        firstSeenAt: row[field],
        idempotent: true,
      };
    await db.runTransaction(async (transaction) => {
      const fresh = await transaction.get(ref);
      if (!fresh.data()?.[field])
        transaction.update(ref, {
          [field]: now(),
          [stateField]: "read",
          [`${readerType}FirstSeenByUid`]: readerUid,
        });
    });
    await db
      .collection(ACTIVITY)
      .doc(`message-read:${messageId}:${readerType}`)
      .set(
        {
          caseId,
          type: "message_read",
          title:
            readerType === "client"
              ? "Client viewed message"
              : "Message viewed by Processing",
          detail:
            readerType === "client"
              ? "The client viewed a secure message."
              : "Quaerens Processing viewed a secure client message.",
          clientVisible: true,
          occurredAt: now(),
          sourceMessageId: messageId,
        },
        { merge: true },
      );
    return { status: "READ", idempotent: false };
  });

  return {
    paidClientListWorkspaces: list,
    paidClientGetWorkInbox: workInbox,
    paidClientGlobalClientSearch: globalSearch,
    paidClientLinkExistingCrm2Record: linkExisting,
    paidClientLinkExistingHistoricalRecord: linkHistorical,
    paidClientCreateLegacyClient: createLegacy,
    paidClientGetWorkspace: get,
    paidClientUpdateClientDetails: updateClientDetails,
    paidClientUpdateLegacyCommercial: updateLegacyCommercial,
    paidClientDownloadAssessmentReport: downloadAssessmentReport,
    paidClientDownloadDocument: downloadDocument,
    paidClientUpdateEvidence: updateEvidence,
    paidClientMarkMessageRead: markMessageRead,
    paidClientAddDocumentRequirement: addRequirement,
    paidClientUpdateOnboardingChecklist: updateChecklist,
    paidClientActivateLogin: activate,
    paidClientCreateMessage: clientMessage,
    paidClientRegisterUpload: clientUpload,
    paidClientStaffCreateMessage: staffMessage,
    paidClientImportAssessmentReport: importAssessmentReport,
    paidClientImportAgreementDocument: importAgreementDocument,
    paidClientCreateStaffUploadUrl: createStaffUploadUrl,
    paidClientStaffRegisterDocument: staffDocument,
    paidClientDiscardStaffUpload: discardStaffUpload,
  };
}

module.exports = {
  registerPaidClientWorkspace,
  caseIdFor,
  requirementId,
  leadProjection,
  commercialProjection,
  progressProjection,
  nextActionProjection,
  eligible,
  workspaceLifecycleStatus,
  MANDATORY,
  HUMAN_CHECKS,
  ROUTE_TEMPLATES,
  ROUTE_STEPS,
  routeProjection,
  clientNotificationPayload,
  internalNotificationPayload,
};

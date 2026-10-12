"use strict";

const { actorFor } = require("./caseActionPhase1");

const text = (value, limit = 1000) => String(value == null ? "" : value).trim().slice(0, limit);
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

function safeLegacyCase(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    caseReference: text(data.caseReference, 120),
    claimType: text(data.claimType, 120),
    campaign: text(data.campaign, 160),
    client: {
      name: text(data.client?.name, 200), email: text(data.client?.email, 320),
      telephone: text(data.client?.telephone || data.client?.phone, 80)
    },
    assignedToUid: text(data.assignedToUid, 128), assignedToName: text(data.assignedToName, 160),
    assignedToEmail: text(data.assignedToEmail, 320), caseStage: text(data.caseStage, 80),
    priority: text(data.priority, 40), paymentStatus: text(data.paymentStatus, 80),
    amountDueNow: number(data.amountDueNow), amountPaidNow: number(data.amountPaidNow),
    followUpDue: number(data.followUpDue), paymentLink: text(data.paymentLink, 1000),
    assessmentId: text(data.assessmentId, 180), assessmentReportUrl: text(data.assessmentReportUrl, 1000),
    strategyReportUrl: text(data.strategyReportUrl, 1000), assessmentSummary: text(data.assessmentSummary, 3000),
    generatedAssessmentText: text(data.generatedAssessmentText, 3000), strategySummary: text(data.strategySummary, 3000),
    waitingOn: text(data.waitingOn, 160), nextActionDate: text(data.nextActionDate, 80),
    createdAt: data.createdAt || null, updatedAt: data.updatedAt || null, lastActivityAt: data.lastActivityAt || null,
    dataAuthority: data.dataAuthority === "CRM4_PROCESSING" ? "CRM4_PROCESSING" : "LEGACY_PROCESSING_RECORD"
  };
}

function safePaidClientCase(doc, lead = {}) {
  const data = doc.data() || {};
  const paid = lead.paymentStatus === "payment_confirmed"
    ? number(lead.agreedFeeAmount)
    : number(lead.amountPaidNow);
  return {
    id: doc.id,
    paidClientWorkspaceId: doc.id,
    crm4LeadId: text(data.crm4LeadId || lead.id, 180),
    caseReference: text(data.caseRef || lead.reference || lead.leadReference || doc.id, 120),
    claimType: text(data.route || data.claimType || lead.assessmentRoute || lead.claimType, 120),
    campaign: text(data.campaign || lead.campaign || lead.referralSource, 160),
    client: {
      name: text(data.clientName || lead.clientName || lead.name || `${lead.forename || ""} ${lead.surname || ""}`, 200),
      email: text(data.clientEmail || lead.email || lead.emailAddress, 320),
      telephone: text(data.telephone || lead.telephone || lead.phone, 80),
      mobile: text(data.mobile || lead.mobile, 80),
      postcode: text(data.postcode || lead.postcode, 20)
    },
    assignedToUid: text(data.processingOwnerUid || lead.processingOwnerUid, 128),
    assignedToName: text(data.processingOwnerName || lead.processingOwnerName, 160),
    caseStage: text(data.status || data.migrationState || lead.processingStatus || lead.administrationOnboardingStatus, 80),
    priority: text(data.priority, 40), paymentStatus: text(lead.paymentStatus || data.paymentStatus, 80),
    amountDueNow: Math.max(0, number(lead.agreedFeeAmount) - paid), amountPaidNow: paid,
    followUpDue: number(lead.followUpDue), paymentLink: text(lead.securePaymentLink, 1000),
    assessmentId: text(lead.assessmentId || lead.importedAssessmentDocumentId, 180),
    assessmentSummary: text(data.assessmentSummary, 3000),
    createdAt: data.createdAt || lead.createdAt || null,
    updatedAt: data.updatedAt || lead.lastUpdatedAt || null,
    lastActivityAt: data.updatedAt || lead.lastUpdatedAt || null,
    dataAuthority: "PAID_CLIENT_WORKSPACE"
  };
}

function paymentStatus(row) {
  if (["awaiting_payment", "part_paid", "fully_paid"].includes(row.paymentStatus)) return row.paymentStatus;
  return "unverified";
}

function hasLegacyReportPack(row) {
  return Boolean(row.assessmentReportUrl || row.strategyReportUrl || row.assessmentSummary || row.generatedAssessmentText || row.strategySummary);
}

function safeAttendance(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id, uid: text(data.uid, 128), date: text(data.date, 20), name: text(data.name, 160),
    firstLoginAt: data.firstLoginAt || null, lastLoginAt: data.lastLoginAt || null,
    lastSeenAt: data.lastSeenAt || null, lastLogoutAt: data.lastLogoutAt || null,
    currentSessionStartAt: data.currentSessionStartAt || null, totalLoggedInMs: number(data.totalLoggedInMs),
    isOnline: data.isOnline === true, workspaceId: text(data.workspaceId, 40) || "CRM4"
  };
}

function registerProcessingOperations({ db, onCall, HttpsError }) {
  const listDashboard = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError);
    const [legacy, crm, actionCases, paidWorkspaces] = await Promise.all([
      db.collection("processingCases").get(),
      db.collection("crm4Leads").limit(1000).get(),
      db.collection("caseActionCases").limit(500).get(),
      db.collection("clientPortalCases").limit(1000).get()
    ]);
    const crmById = new Map(crm.docs.map(doc => [doc.id, { id: doc.id, ...(doc.data() || {}) }]));
    const legacyCases = legacy.docs.map(safeLegacyCase);
    const representedLeads = new Set(legacyCases.map(row => text(row.crm4LeadId, 180)).filter(Boolean));
    const paidCases = paidWorkspaces.docs
      .map(doc => safePaidClientCase(doc, crmById.get(text(doc.data()?.crm4LeadId, 180)) || {}))
      .filter(row => row.crm4LeadId && !representedLeads.has(row.crm4LeadId));
    const cases = [...legacyCases, ...paidCases];
    const crmProcessingEligible = crm.docs.filter(doc => {
      const data = doc.data() || {};
      return data.processingStatus === "accepted" || Boolean(data.processingCaseId) || Boolean(data.caseActionCaseId);
    }).length;
    const paymentQueue = crm.docs.filter(doc => {
      const data = doc.data() || {};
      return data.status === "closed-deal-awaiting-payment" && data.outcome === "Closed Deal" && data.agreementStatus === "signed" && Boolean(data.agreementSignedAt) && data.paymentStatus === "payment_requested" && data.processingStatus !== "accepted";
    }).map(doc => {
      const data = doc.data() || {};
      return { id: doc.id, clientName: text(data.clientName || data.name || `${data.forename || ""} ${data.surname || ""}`, 200), clientReference: text(data.reference || data.leadReference || doc.id, 180), agreedFeeAmount: number(data.agreedFeeAmount), agreedFeeCurrency: text(data.agreedFeeCurrency, 8) || "GBP", paymentOptionId: text(data.paymentOptionId || data.paymentRequestOptionId, 80) || "legacy_manual", paymentOptionType: text(data.paymentOptionType || data.paymentRequestOptionType, 40) || "legacy", paymentRequestSentAt: data.paymentRequestSentAt || null, paymentStatus: text(data.paymentStatus, 40), agreementStatus: text(data.agreementStatus, 40) || "legacy_exception_missing", assignedCloserName: text(data.assignedToName || data.assignedUserName, 160), assessmentQar: text(data.assessmentQar, 120) };
    });
    const agreementQueue = crm.docs.filter(doc => { const data=doc.data()||{}; return data.outcome==="Closed Deal" && data.agreementStatus==="sent" && !data.agreementSignedAt && data.processingStatus!=="accepted"; }).map(doc=>{const data=doc.data()||{};return {id:doc.id,clientName:text(data.clientName||data.name||`${data.forename||""} ${data.surname||""}`,200),clientReference:text(data.reference||data.leadReference||doc.id,180),claimType:text(data.claimType||data.assessmentRoute,120),assignedCloserName:text(data.assignedToName||data.assignedUserName,160),agreementDocumentId:text(data.agreementDocumentId,180),agreementVersion:number(data.agreementVersion),agreementSentAt:data.agreementSentAt||null,agreedFeeAmount:number(data.agreedFeeAmount),agreedFeeCurrency:text(data.agreedFeeCurrency,8)||"GBP",agreementStatus:"sent",paymentStatus:text(data.paymentStatus,40)||"not_requested"};});
    const counts = {
      totalCases: cases.length,
      myCases: cases.filter(row => row.assignedToUid === actor.uid).length,
      unassigned: cases.filter(row => !row.assignedToUid).length,
      urgent: cases.filter(row => ["urgent", "high"].includes(row.priority.toLowerCase())).length,
      withPaymentLink: cases.filter(row => Boolean(row.paymentLink)).length,
      awaitingPayment: cases.filter(row => paymentStatus(row) === "awaiting_payment").length,
      partPaid: cases.filter(row => paymentStatus(row) === "part_paid").length,
      fullyPaid: cases.filter(row => paymentStatus(row) === "fully_paid").length,
      unverifiedPayment: cases.filter(row => paymentStatus(row) === "unverified").length,
      legacyReportPackPresent: cases.filter(hasLegacyReportPack).length,
      crmProcessingEligible,
      caseActionCases: actionCases.size
      ,awaitingSignedAgreement: agreementQueue.length, awaitingIntakePayment: paymentQueue.length, paymentConfirmedReady: crm.docs.filter(doc=>{const d=doc.data()||{};return d.paymentStatus==="payment_confirmed"&&d.processingStatus!=="accepted";}).length, activeProcessingCases: cases.filter(row=>row.dataAuthority==="CRM4_PROCESSING").length
    };
    return {
      authority: {
        crmMaster: "crm4Leads", operationalLegacy: "processingCases", caseAction: "caseActionCases",
        paidClientWorkspaces: "clientPortalCases",
        payment: "LEGACY_UNVERIFIED", reportPack: "LEGACY_CONCEPT_NOT_REINTERPRETED",
        crm4EntryCondition: "processingStatus=accepted OR explicit processingCaseId/caseActionCaseId",
        convergence: crmProcessingEligible ? "PARTIAL" : "NO_AUTOMATIC_CRM4_TO_PROCESSING_LINK"
      },
      cases, agreementQueue, paymentQueue, counts
    };
  });

  const markAgreementSigned = onCall(async request => {
    const actor=await actorFor(request,db,HttpsError); if(actor.role!=="processing"&&!actor.supervisor)throw new HttpsError("permission-denied","Processing authority is required.");
    const leadId=text(request.data?.leadId,180),version=number(request.data?.agreementVersion),documentId=text(request.data?.agreementDocumentId,180); if(!leadId||!version||!documentId)throw new HttpsError("invalid-argument","The exact CRM4 lead and agreement version/reference are required.");
    const ref=db.collection("crm4Leads").doc(leadId); return db.runTransaction(async transaction=>{const snap=await transaction.get(ref);if(!snap.exists)throw new HttpsError("not-found","The CRM4 lead was not found.");const lead=snap.data()||{};if(lead.agreementStatus==="signed"&&lead.agreementSignedAt)return {status:"ALREADY_SIGNED",idempotent:true};if(lead.agreementStatus!=="sent"||!lead.agreementSentAt||Number(lead.agreementVersion)!==version||text(lead.agreementDocumentId,180)!==documentId)throw new HttpsError("failed-precondition","The authoritative sent Agreement version/reference does not match.");const serverNow=require("firebase-admin/firestore").FieldValue.serverTimestamp(),at=new Date().toISOString();transaction.update(ref,{agreementStatus:"signed",agreementSignedAt:serverNow,agreementSignedByUid:actor.uid,agreementSignedVersion:version,agreementSignedDocumentId:documentId,lastUpdatedAt:serverNow,actionHistory:require("firebase-admin/firestore").FieldValue.arrayUnion({action:"agreement_signed_confirmed",byUid:actor.uid,at,notes:`Processing confirmed signed Agreement ${documentId} version ${version}.`})});return {status:"AGREEMENT_SIGNED",idempotent:false};});
  });

  const confirmCrm2Payment = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError);
    if (actor.role !== "processing" && !actor.supervisor) throw new HttpsError("permission-denied", "Processing & Admin / Payments authority is required.");
    const leadId = text(request.data?.leadId, 180), confirmedAmount = number(request.data?.confirmedAmount), reference = text(request.data?.paymentReference, 180);
    if (!leadId || confirmedAmount <= 0) throw new HttpsError("invalid-argument", "A CRM4 lead and exact confirmed amount are required.");
    const leadRef = db.collection("crm4Leads").doc(leadId), caseRef = db.collection("processingCases").doc(`crm4-${leadId}`);
    return db.runTransaction(async transaction => {
      const [leadSnap, caseSnap] = await Promise.all([transaction.get(leadRef), transaction.get(caseRef)]);
      if (!leadSnap.exists) throw new HttpsError("not-found", "The CRM4 lead was not found.");
      const lead = leadSnap.data() || {};
      if (lead.paymentStatus === "payment_confirmed" && lead.processingStatus === "ready_for_administration_onboarding")
        return { status: "ALREADY_CONFIRMED_READY_FOR_ADMINISTRATION_ONBOARDING", idempotent: true };
      if (caseSnap.exists || lead.processingStatus === "accepted" || lead.processingCaseId) throw new HttpsError("failed-precondition", "An Active Processing case already exists or conflicts with this lead.");
      if (!text(lead.assessmentId, 180) || lead.assessmentStatus !== "COMPLETED" || !text(lead.assessmentQar, 120))
        throw new HttpsError("failed-precondition", "A completed Framework B assessment and QAR are required before payment can advance to Administration Onboarding.");
      if (lead.status !== "closed-deal-awaiting-payment" || lead.outcome !== "Closed Deal" || lead.agreementStatus !== "signed" || !lead.agreementSignedAt || lead.paymentStatus !== "payment_requested" || Number(lead.agreedFeeAmount) !== confirmedAmount || !text(lead.agreedFeeCurrency, 8))
        throw new HttpsError("failed-precondition", "Closed Deal, signed agreement, requested payment and the exact governed amount/currency are required.");
      const now = new Date().toISOString(), serverNow = require("firebase-admin/firestore").FieldValue.serverTimestamp();
      transaction.update(leadRef, { paymentStatus: "payment_confirmed", paymentConfirmedAmount: confirmedAmount, paymentConfirmedCurrency: text(lead.agreedFeeCurrency, 8), paymentConfirmedAt: serverNow, paymentConfirmedByUid: actor.uid, paymentProviderReference: reference, amountDueNow: 0, amountPaidNow: confirmedAmount, processingStatus: "ready_for_administration_onboarding", administrationOnboardingStatus: "ready", status: "ready-for-administration-onboarding", leadStatus: "ready_for_administration_onboarding", lastUpdatedAt: serverNow, actionHistory: require("firebase-admin/firestore").FieldValue.arrayUnion({ action: "intake_assessment_fee_paid", byUid: actor.uid, at: now, notes: `Processing & Admin confirmed ${text(lead.agreedFeeCurrency, 8)} ${confirmedAmount.toFixed(2)}. The matter is ready for Administration Onboarding; Active Processing has not started.` }) });
      return { status: "PAYMENT_CONFIRMED_READY_FOR_ADMINISTRATION_ONBOARDING", idempotent: false };
    });
  });

  const listAttendance = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError);
    const [memberships, current, legacy] = await Promise.all([
      db.collection("crm4Memberships").where("workspaceId", "==", "CRM4").get(),
      db.collection("crm4Attendance").limit(1000).get(),
      db.collection("staffAttendance").limit(2000).get()
    ]);
    const staff = memberships.docs.filter(doc => doc.data().active === true && doc.data().role === "processing")
      .map(doc => ({ id: doc.id, name: text(doc.data().displayName || doc.data().name || "Processing staff", 160) }));
    const staffIds = new Set(staff.map(row => row.id));
    const currentRows = current.docs.map(safeAttendance).filter(row => staffIds.has(row.uid));
    const currentKeys = new Set(currentRows.map(row => `${row.uid}_${row.date}`));
    const legacyRows = legacy.docs.map(safeAttendance).filter(row => staffIds.has(row.uid) && !currentKeys.has(`${row.uid}_${row.date}`));
    return {
      staff: actor.supervisor ? staff : staff.filter(row => row.id === actor.uid),
      attendance: [...currentRows, ...legacyRows],
      authority: "crm4Attendance with non-duplicating staffAttendance history fallback",
      timezone: "Europe/Madrid",
      actorScope: actor.supervisor ? "SUPERVISOR" : "ASSIGNED_PROCESSOR"
    };
  });

  return { processingListOperationalDashboard: listDashboard, processingMarkAgreementSigned: markAgreementSigned, processingConfirmCrm2Payment: confirmCrm2Payment, processingListAttendance: listAttendance };
}

module.exports = { registerProcessingOperations, safeLegacyCase, safePaidClientCase, safeAttendance, paymentStatus, hasLegacyReportPack };

"use strict";

const crypto = require("node:crypto");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const solarSchema = require("./frameworkBGuidedSolarSchema");
const nlSolarSchema = require("./frameworkBNlSolarSchema");
const sprayFoamSchema = require("./frameworkBSprayFoamSchema");

const COLLECTIONS = Object.freeze({
  cases: "caseActionCases", links: "caseActionAssessmentLinks", requirements: "caseActionEvidenceRequirements",
  documents: "caseActionDocuments", events: "caseActionEvents", notifications: "caseActionNotifications",
  assessments: "professionalAssessments", versions: "professionalAssessmentVersions", reports: "professionalAssessmentDocuments",
  crm: "crm4Leads", memberships: "crm4Memberships", portalCases: "clientPortalCases", portalAccess: "clientPortalAccess",
  portalInvites: "clientPortalInvitations", portalMessages: "clientPortalMessages", portalDocuments: "clientPortalDocuments", portalAudit: "clientPortalAudit"
});
const SUPPORTED_ROUTES = new Set(["solar", "nl-solar", "spray-foam"]);
const ONBOARDING = new Set(["NOT_ONBOARDED", "ONBOARDING_IN_PROGRESS", "ONBOARDED", "DID_NOT_PROCEED", "DUPLICATE", "CLOSED"]);
const PROCESSING_STATES = new Set(["ASSESSMENT_AVAILABLE", "ONBOARDING_REQUIRED", "ONBOARDING_IN_PROGRESS", "PORTAL_INVITATION_REQUIRED", "PORTAL_ACTIVATION_PENDING", "EVIDENCE_REQUESTED", "EVIDENCE_COLLECTION", "EVIDENCE_REVIEW", "EVIDENCE_COMPLETE", "READY_FOR_PHASE_2", "CLOSED"]);
const EVIDENCE_STATUSES = new Set(["REQUESTED", "UPLOADED", "UNDER_REVIEW", "ACCEPTED_AS_EVIDENCE", "REJECTED_WRONG_DOCUMENT", "REPLACEMENT_REQUESTED", "NOT_APPLICABLE"]);
const APPLICABILITY = new Set(["REQUIRED", "CONDITIONALLY_REQUIRED", "OPTIONAL", "NOT_APPLICABLE"]);
const STAFF_ROLES = new Set(["processing", "administrator"]);
const SUPERVISOR_ROLES = new Set(["administrator", "platformAdmin"]);
const COMPLETE_ASSESSMENT_STATES = new Set(["ISSUED", "GENERATED"]);
const ASSESSMENT_CLASSES = new Set(["PRODUCTION_CLIENT", "QA_TEST", "SYNTHETIC", "CORE_VALIDATION", "UNKNOWN"]);

const text = (value, limit = 5000) => String(value == null ? "" : value).trim().slice(0, limit);
const lower = value => text(value, 320).toLowerCase();
const digits = value => text(value, 80).replace(/\D/g, "").replace(/^00/, "");
const now = () => FieldValue.serverTimestamp();
const hash = value => crypto.createHash("sha256").update(text(value, 1000)).digest("hex");
const randomToken = () => crypto.randomBytes(32).toString("base64url");
const getPath = (object, path) => path.split(".").reduce((value, key) => value && value[key] != null ? value[key] : undefined, object);
const yes = value => ["yes", "ja", "true", "used", "available now", "nu beschikbaar"].includes(lower(value));
const cleanObject = value => JSON.parse(JSON.stringify(value == null ? {} : value));
const fail = (HttpsError, code, message) => { throw new HttpsError(code, message); };

function assessmentInput(assessment) { return cleanObject(assessment.publicIntake || assessment.structuredIntake || {}); }
function identityFromAssessment(assessment) {
  const input = assessmentInput(assessment), client = input.client || {}, crm = assessment.crmLink && assessment.crmLink.snapshot || {};
  return {
    name: text(client.name || crm.clientName || crm.name, 200), email: lower(client.email || crm.email || crm.clientEmail),
    telephone: text(client.phone || crm.telephone || crm.mobile, 80), address: text(client.address || getPath(input, "property.address") || crm.address, 1000)
  };
}
function providerFromAssessment(assessment) {
  const input = assessmentInput(assessment);
  return text(getPath(input, "installation.supplier") || getPath(input, "installation.installer") || getPath(input, "parties.seller") || getPath(input, "parties.installer"), 240);
}
function schemaFor(category) {
  if (category === "solar") return solarSchema;
  if (category === "nl-solar") return nlSolarSchema;
  if (category === "spray-foam") return sprayFoamSchema;
  return null;
}
function conditionalEvidence(category, title, input) {
  const name = lower(title);
  if (/finance|lender|financier|krediet/.test(name)) return yes(getPath(input, "finance.used")) ? "CONDITIONALLY_REQUIRED" : "NOT_APPLICABLE";
  if (/grant|funding|subsid/.test(name)) return yes(getPath(input, "grant.used")) ? "CONDITIONALLY_REQUIRED" : "NOT_APPLICABLE";
  if (/mortgage|lender correspondence|valuation/.test(name) && category === "spray-foam") return yes(getPath(input, "lending.affected")) ? "CONDITIONALLY_REQUIRED" : "NOT_APPLICABLE";
  if (/removal/.test(name) && category === "spray-foam") return (yes(getPath(input, "remedial.considered")) || yes(getPath(input, "remedial.completed"))) ? "CONDITIONALLY_REQUIRED" : "NOT_APPLICABLE";
  if (/survey|technical report|engineer|inspection/.test(name)) {
    const relevant = yes(getPath(input, "professional.inspected")) || yes(getPath(input, "engineer.attended"));
    return relevant ? "CONDITIONALLY_REQUIRED" : "OPTIONAL";
  }
  if (/faillissement|curator|insolvency|ingediende vordering/.test(name)) {
    const relevant = Boolean(text(getPath(input, "insolvency.status") || getPath(input, "insolvency.party")));
    return relevant ? "CONDITIONALLY_REQUIRED" : "NOT_APPLICABLE";
  }
  if (/contract|agreement|overeenkomst|invoice|factuur|payment|betaling|proof of payment|betalingsbewijs/.test(name)) return "REQUIRED";
  return "OPTIONAL";
}
function sourceEvidenceStatus(input, evidence) {
  const value = getPath(input, evidence.id);
  const state = lower(value);
  if (/not applicable|niet van toepassing/.test(state)) return "NOT_APPLICABLE";
  if (/available now|nu beschikbaar|document reviewed/.test(state)) return "UPLOADED";
  return "REQUESTED";
}
function deriveEvidenceRequirements(category, rawInput, caseId = "") {
  const schema = schemaFor(category), input = cleanObject(rawInput || {});
  if (!schema) return [];
  return schema.evidence.map(item => {
    const applicability = conditionalEvidence(category, item.title, input);
    return {
      requirementId: `${category}:${item.ref}`, caseId, route: category, processingStage: "INITIAL_COMPLAINT",
      evidenceType: text(item.title, 240), description: text(item.question || item.title, 600),
      whyRequired: applicability === "REQUIRED" ? "Core assessment record" : applicability === "CONDITIONALLY_REQUIRED" ? "Required by recorded case facts" : "Potentially useful supporting evidence",
      sourceReference: `${category}@${schema.VERSION || "1"}:${item.ref}`, applicability,
      conditionalApplicability: applicability === "CONDITIONALLY_REQUIRED", status: applicability === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : sourceEvidenceStatus(input, item),
      requestedAt: null, receivedAt: null, reviewedAt: null, reviewedBy: "", acceptedDocumentId: "", acceptedDocumentVersion: null,
      replacementReason: "", notApplicableReason: applicability === "NOT_APPLICABLE" ? "Not applicable from structured assessment facts" : "", history: []
    };
  });
}
function readiness(requirements) {
  const applicable = requirements.filter(item => item.applicability !== "NOT_APPLICABLE" && item.applicability !== "OPTIONAL");
  const satisfied = applicable.filter(item => item.status === "ACCEPTED_AS_EVIDENCE" || item.status === "NOT_APPLICABLE");
  const awaitingReview = requirements.filter(item => ["UPLOADED", "UNDER_REVIEW"].includes(item.status)).length;
  return { satisfied: satisfied.length, required: applicable.length, missing: Math.max(0, applicable.length - satisfied.length), awaitingReview, complete: applicable.length > 0 && satisfied.length === applicable.length };
}
function rankMatch(assessment, lead) {
  const identity = identityFromAssessment(assessment), provider = lower(providerFromAssessment(assessment));
  let score = 0; const reasons = [];
  if (assessment.qarReference && lower(lead.qarReference || lead.sourceQar || lead.reference) === lower(assessment.qarReference)) { score += 100; reasons.push("reference"); }
  if (identity.email && identity.email === lower(lead.email || lead.clientEmail)) { score += 60; reasons.push("email"); }
  if (digits(identity.telephone).length >= 8 && digits(identity.telephone) === digits(lead.telephone || lead.mobile)) { score += 50; reasons.push("telephone"); }
  if (lower(assessment.category) && [lower(lead.category), lower(lead.issue), lower(lead.claimType)].some(value => value.includes(lower(assessment.category)))) { score += 15; reasons.push("category"); }
  if (provider && [lower(lead.provider), lower(lead.installer), lower(lead.supplier), lower(lead.company)].includes(provider)) { score += 15; reasons.push("provider"); }
  return { score, reasons, confidence: score >= 100 || (score >= 60 && reasons.length >= 2) ? "HIGH" : score >= 50 ? "POSSIBLE" : "LOW" };
}
function phase2Ready(caseData, requirements) {
  const state = readiness(requirements);
  return caseData.onboardingStatus === "ONBOARDED" && Boolean(caseData.crmCaseId) && Boolean(caseData.assessmentId) && Boolean(caseData.assignedProcessorUid) && state.complete;
}

async function actorFor(request, db, HttpsError) {
  if (!request.auth || !request.auth.uid) fail(HttpsError, "unauthenticated", "Sign in is required.");
  if (request.auth.token.platformAdmin === true) return { uid: request.auth.uid, role: "platformAdmin", supervisor: true };
  const snap = await db.collection(COLLECTIONS.memberships).doc(request.auth.uid).get(), member = snap.exists ? snap.data() : {};
  if (!snap.exists || member.active !== true || member.workspaceId !== "CRM4" || !STAFF_ROLES.has(member.role)) fail(HttpsError, "permission-denied", "Case Action access is not authorised.");
  return { uid: request.auth.uid, role: member.role, supervisor: SUPERVISOR_ROLES.has(member.role), displayName: text(member.displayName || member.name, 160) };
}
function canAccessCase(actor, data) { return actor.supervisor || (actor.role === "processing" && data.assignedProcessorUid === actor.uid); }
async function requireCase(actor, caseId, db, HttpsError) {
  const id = text(caseId, 180), snap = await db.collection(COLLECTIONS.cases).doc(id).get();
  if (!snap.exists) fail(HttpsError, "not-found", "Processing case not found.");
  const data = snap.data(); if (!canAccessCase(actor, data)) fail(HttpsError, "permission-denied", "This processing case is not assigned to you.");
  return { id: snap.id, ref: snap.ref, data };
}
async function event(db, admin, caseId, action, actor, details = {}, clientVisible = false) {
  return db.collection(COLLECTIONS.events).add({ caseId, action, actorUid: actor.uid, actorRole: actor.role, details: cleanObject(details), clientVisible, createdAt: now(admin) });
}
function safeAssessmentRow(doc, report = null) {
  const data = doc.data(), identity = identityFromAssessment(data);
  return { id: doc.id, qarReference: text(data.qarReference, 120), category: text(data.category, 80), status: text(data.status, 80), currentVersion: Number(data.currentVersion || 0), currentVersionId: text(data.currentVersionId, 180), clientName: identity.name, provider: providerFromAssessment(data), assessmentClass: classifyAssessment(data), completedAt: data.issuedAt || data.completedAt || data.assessmentCompletedAt || data.assessmentDate || data.historicalAssessmentMetadata?.date || report?.generatedAt || null };
}

function classifyAssessment(data = {}) {
  const governed = text(data.operationalClassification || data.assessmentClassification, 60).toUpperCase();
  if (ASSESSMENT_CLASSES.has(governed)) return governed;
  const input = assessmentInput(data), client = input.client || data.client || {};
  const signal = [client.name, client.email, data.qarReference, data.internalAgent?.name].filter(Boolean).join(" ").toLowerCase();
  if (/controlled\s+core\s+qa|\bqa\b|\btest\b|fixture|example\.invalid/.test(signal) || /\.invalid\b/.test(lower(client.email))) return "QA_TEST";
  if (/synthetic/.test(signal)) return "SYNTHETIC";
  return "UNKNOWN";
}

function registerCaseActionPhase1({ admin, db, onCall, HttpsError }) {
  const listDashboard = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError);
    const [assessments, reports, links, cases, requirements, portalCases] = await Promise.all([
      db.collection(COLLECTIONS.assessments).orderBy("updatedAt", "desc").limit(250).get(),
      db.collection(COLLECTIONS.reports).limit(500).get(), db.collection(COLLECTIONS.links).limit(500).get(),
      db.collection(COLLECTIONS.cases).orderBy("updatedAt", "desc").limit(250).get(), db.collection(COLLECTIONS.requirements).limit(1000).get(), db.collection(COLLECTIONS.portalCases).limit(250).get()
    ]);
    const reportsByAssessment = new Map();
    for (const document of reports.docs) {
      const row = document.data(), assessmentId = text(row.assessmentId, 180), current = reportsByAssessment.get(assessmentId);
      if (assessmentId && (!current || Number(row.version || 0) >= Number(current.version || 0))) reportsByAssessment.set(assessmentId, row);
    }
    const linked = new Map(links.docs.map(doc => [doc.data().assessmentId, doc.data()]));
    const portal = new Map(portalCases.docs.map(doc => [doc.data().crmLink && doc.data().crmLink.caseId, doc.data().accessState || "NOT_ACTIVATED"]));
    const eligible = assessments.docs.filter(doc => SUPPORTED_ROUTES.has(doc.data().category) && COMPLETE_ASSESSMENT_STATES.has(doc.data().status));
    const visibleCases = cases.docs.filter(doc => canAccessCase(actor, doc.data()));
    const allRows = eligible.map(doc => ({ ...safeAssessmentRow(doc, reportsByAssessment.get(doc.id)), onboardingStatus: linked.get(doc.id)?.onboardingStatus || "NOT_ONBOARDED", processingCaseId: linked.get(doc.id)?.caseActionCaseId || "" }));
    const rows = actor.supervisor ? allRows : allRows.filter(row => row.assessmentClass === "PRODUCTION_CLIENT");
    const operationalRows = allRows.filter(row => row.assessmentClass === "PRODUCTION_CLIENT");
    const caseRows = visibleCases.map(doc => {
      const data = doc.data(), req = requirements.docs.filter(item => item.data().caseId === doc.id).map(item => item.data()), ready = readiness(req);
      return { id: doc.id, caseReference: text(data.caseReference, 120), clientName: text(data.clientName, 200), category: text(data.category, 80), provider: text(data.provider, 200), assignedProcessorUid: text(data.assignedProcessorUid, 128), assignedProcessorName: text(data.assignedProcessorName, 160), processingState: text(data.processingState, 80), onboardingStatus: text(data.onboardingStatus, 80), portalStatus: portal.get(data.crmCaseId) || text(data.portalStatus || "NOT_ACTIVATED", 80), evidenceReadiness: ready, clientActionRequired: Boolean(data.clientActionRequired), agentActionRequired: Boolean(data.agentActionRequired), updatedAt: data.updatedAt || null };
    });
    return { supportedRoutes: [...SUPPORTED_ROUTES], completedAssessments: rows, cases: caseRows, assessmentClassification: { total: allRows.length, productionClient: allRows.filter(x => x.assessmentClass === "PRODUCTION_CLIENT").length, qaTestSynthetic: allRows.filter(x => ["QA_TEST", "SYNTHETIC", "CORE_VALIDATION"].includes(x.assessmentClass)).length, unknown: allRows.filter(x => x.assessmentClass === "UNKNOWN").length, defaultOperationalCount: operationalRows.length, supervisorCanFilter: actor.supervisor }, counts: { completedAssessments: operationalRows.length, notOnboarded: operationalRows.filter(x => x.onboardingStatus === "NOT_ONBOARDED").length, onboardingInProgress: operationalRows.filter(x => x.onboardingStatus === "ONBOARDING_IN_PROGRESS").length, onboarded: operationalRows.filter(x => x.onboardingStatus === "ONBOARDED").length, didNotProceed: operationalRows.filter(x => x.onboardingStatus === "DID_NOT_PROCEED").length, duplicate: operationalRows.filter(x => x.onboardingStatus === "DUPLICATE").length, closed: operationalRows.filter(x => x.onboardingStatus === "CLOSED").length, activeCases: caseRows.filter(x => x.processingState !== "CLOSED").length, portalActive: caseRows.filter(x => x.portalStatus === "ACTIVE").length, documentsAwaitingReview: requirements.docs.filter(x => ["UPLOADED", "UNDER_REVIEW"].includes(x.data().status)).length, evidenceComplete: caseRows.filter(x => x.evidenceReadiness.complete).length, readyForPhase2: caseRows.filter(x => x.processingState === "READY_FOR_PHASE_2").length } };
  });

  const listProcessingStaff = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError);
    if (!actor.supervisor) fail(HttpsError, "permission-denied", "Supervisory access is required.");
    const snap = await db.collection(COLLECTIONS.memberships).where("workspaceId", "==", "CRM4").get();
    return { staff: snap.docs.filter(doc => doc.data().active === true && doc.data().role === "processing").map(doc => ({ uid: doc.id, name: text(doc.data().displayName || doc.data().name || doc.id, 160) })) };
  });

  const findMatches = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), assessmentId = text(request.data?.assessmentId, 180), assessmentSnap = await db.collection(COLLECTIONS.assessments).doc(assessmentId).get();
    if (!actor.supervisor && actor.role !== "processing") fail(HttpsError, "permission-denied", "Onboarding access is required.");
    if (!assessmentSnap.exists || !SUPPORTED_ROUTES.has(assessmentSnap.data().category) || !COMPLETE_ASSESSMENT_STATES.has(assessmentSnap.data().status)) fail(HttpsError, "failed-precondition", "A completed supported assessment is required.");
    if (classifyAssessment(assessmentSnap.data()) !== "PRODUCTION_CLIENT") fail(HttpsError, "failed-precondition", "Only a governed production/client assessment can enter onboarding.");
    const leadSnap = await db.collection(COLLECTIONS.crm).limit(500).get(), candidates = leadSnap.docs.map(doc => ({ id: doc.id, ...rankMatch(assessmentSnap.data(), doc.data()), clientName: text(doc.data().clientName || doc.data().name, 200), caseReference: text(doc.data().reference, 120), category: text(doc.data().category || doc.data().issue || doc.data().claimType, 120) })).filter(row => row.score >= 50).sort((a, b) => b.score - a.score).slice(0, 10);
    return { assessment: safeAssessmentRow(assessmentSnap), candidates, requiresConfirmation: candidates.length !== 1 || candidates[0]?.confidence !== "HIGH" };
  });

  const startOnboarding = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), assessmentId = text(request.data?.assessmentId, 180), assessmentSnap = await db.collection(COLLECTIONS.assessments).doc(assessmentId).get();
    if (!assessmentSnap.exists || !SUPPORTED_ROUTES.has(assessmentSnap.data().category) || !COMPLETE_ASSESSMENT_STATES.has(assessmentSnap.data().status)) fail(HttpsError, "failed-precondition", "A completed supported assessment is required.");
    if (classifyAssessment(assessmentSnap.data()) !== "PRODUCTION_CLIENT") fail(HttpsError, "failed-precondition", "Only a governed production/client assessment can enter onboarding.");
    const linkRef = db.collection(COLLECTIONS.links).doc(assessmentId), existing = await linkRef.get();
    if (existing.exists && existing.data().caseActionCaseId) fail(HttpsError, "already-exists", "This assessment is already linked.");
    await linkRef.set({ assessmentId, qarReference: text(assessmentSnap.data().qarReference, 120), category: assessmentSnap.data().category, onboardingStatus: "ONBOARDING_IN_PROGRESS", startedBy: actor.uid, startedAt: now(admin), updatedAt: now(admin) }, { merge: true });
    return { assessmentId, onboardingStatus: "ONBOARDING_IN_PROGRESS" };
  });

  const decideOnboarding = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), data = request.data || {}, assessmentId = text(data.assessmentId, 180), decision = text(data.decision, 40), assessmentSnap = await db.collection(COLLECTIONS.assessments).doc(assessmentId).get();
    if (!assessmentSnap.exists || !SUPPORTED_ROUTES.has(assessmentSnap.data().category) || !COMPLETE_ASSESSMENT_STATES.has(assessmentSnap.data().status)) fail(HttpsError, "failed-precondition", "A completed supported assessment is required.");
    if (classifyAssessment(assessmentSnap.data()) !== "PRODUCTION_CLIENT") fail(HttpsError, "failed-precondition", "Only a governed production/client assessment can enter onboarding.");
    if (["DID_NOT_PROCEED", "DUPLICATE", "CLOSED"].includes(decision)) {
      await db.collection(COLLECTIONS.links).doc(assessmentId).set({ assessmentId, qarReference: assessmentSnap.data().qarReference, category: assessmentSnap.data().category, onboardingStatus: decision, decisionBy: actor.uid, decisionReason: text(data.reason, 500), candidateIds: Array.isArray(data.candidateIds) ? data.candidateIds.slice(0, 10).map(x => text(x, 180)) : [], decidedAt: now(admin), updatedAt: now(admin) }, { merge: true });
      return { onboardingStatus: decision };
    }
    if (!["LINK_EXISTING", "CREATE_NEW"].includes(decision)) fail(HttpsError, "invalid-argument", "Select a valid onboarding decision.");
    const identity = identityFromAssessment(assessmentSnap.data()), provider = providerFromAssessment(assessmentSnap.data()); let crmRef, crmData;
    if (decision === "LINK_EXISTING") { crmRef = db.collection(COLLECTIONS.crm).doc(text(data.crmCaseId, 180)); const snap = await crmRef.get(); if (!snap.exists) fail(HttpsError, "not-found", "The selected CRM4 case does not exist."); crmData = snap.data(); }
    else {
      if (!actor.supervisor) fail(HttpsError, "permission-denied", "Supervisory confirmation is required to create a new CRM4 case.");
      crmRef = db.collection(COLLECTIONS.crm).doc(); crmData = { workspaceId: "CRM4", workspaceLabel: "CRM4", sourceWorkspace: "CRM4", source: "manual_crm4", clientName: identity.name, email: identity.email, telephone: identity.telephone, address: identity.address, issue: assessmentSnap.data().category, category: assessmentSnap.data().category, provider, status: "onboarded", reference: `CAE-${Date.now().toString(36).toUpperCase()}`, createdBy: actor.uid, createdByName: actor.displayName || actor.role, createdAt: now(admin), updatedAt: now(admin), caseActionSource: { assessmentId, qarReference: assessmentSnap.data().qarReference, versionId: assessmentSnap.data().currentVersionId || "", version: assessmentSnap.data().currentVersion || 1 } }; await crmRef.create(crmData);
    }
    const caseRef = db.collection(COLLECTIONS.cases).doc(), input = assessmentInput(assessmentSnap.data()), requirements = deriveEvidenceRequirements(assessmentSnap.data().category, input, caseRef.id);
    const casePayload = { workspaceId: "CRM4", caseReference: text(crmData.reference || `CAE-${caseRef.id.slice(0, 8).toUpperCase()}`, 120), crmCaseId: crmRef.id, clientName: text(crmData.clientName || identity.name, 200), clientEmail: lower(crmData.email || identity.email), clientTelephone: text(crmData.telephone || identity.telephone, 80), category: assessmentSnap.data().category, provider, assessmentId, sourceQar: text(assessmentSnap.data().qarReference, 120), sourceVersion: Number(assessmentSnap.data().currentVersion || 1), sourceVersionId: text(assessmentSnap.data().currentVersionId, 180), sourceAssessmentStatus: text(assessmentSnap.data().status, 80), sourceCompletedAt: assessmentSnap.data().issuedAt || assessmentSnap.data().updatedAt || null, onboardingStatus: "ONBOARDED", processingState: "PORTAL_INVITATION_REQUIRED", portalStatus: "NOT_ACTIVATED", assignedProcessorUid: "", assignedProcessorName: "", clientActionRequired: false, agentActionRequired: true, nextInternalAction: "Assign a processing agent and prepare portal invitation", createdBy: actor.uid, createdAt: now(admin), updatedAt: now(admin) };
    const batch = db.batch(); batch.create(caseRef, casePayload); batch.set(db.collection(COLLECTIONS.links).doc(assessmentId), { assessmentId, qarReference: assessmentSnap.data().qarReference, category: assessmentSnap.data().category, onboardingStatus: "ONBOARDED", caseActionCaseId: caseRef.id, crmCaseId: crmRef.id, decision, candidateIds: Array.isArray(data.candidateIds) ? data.candidateIds.slice(0, 10) : [], decisionReason: text(data.reason, 500), decisionBy: actor.uid, decidedAt: now(admin), updatedAt: now(admin) }, { merge: true }); requirements.forEach(item => batch.set(db.collection(COLLECTIONS.requirements).doc(`${caseRef.id}_${hash(item.requirementId).slice(0, 16)}`), { ...item, createdAt: now(admin), updatedAt: now(admin) })); await batch.commit(); await event(db, admin, caseRef.id, decision === "LINK_EXISTING" ? "EXISTING_CRM_CASE_LINKED" : "NEW_CRM_CASE_CREATED", actor, { assessmentId, crmCaseId: crmRef.id, candidateIds: Array.isArray(data.candidateIds) ? data.candidateIds.slice(0, 10) : [], reason: text(data.reason, 500) });
    return { caseId: caseRef.id, crmCaseId: crmRef.id, onboardingStatus: "ONBOARDED", requirementsCreated: requirements.length };
  });

  const assignProcessor = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError); if (!actor.supervisor) fail(HttpsError, "permission-denied", "Supervisory access is required.");
    const caseId = text(request.data?.caseId, 180), uid = text(request.data?.processorUid, 128), member = await db.collection(COLLECTIONS.memberships).doc(uid).get();
    if (!member.exists || member.data().active !== true || member.data().workspaceId !== "CRM4" || member.data().role !== "processing") fail(HttpsError, "failed-precondition", "Select an active CRM4 Processing agent.");
    await db.collection(COLLECTIONS.cases).doc(caseId).update({ assignedProcessorUid: uid, assignedProcessorName: text(member.data().displayName || member.data().name, 160), processingState: "PORTAL_INVITATION_REQUIRED", nextInternalAction: "Prepare or send client portal invitation", updatedAt: now(admin) }); await event(db, admin, caseId, "PROCESSOR_ASSIGNED", actor, { processorUid: uid }); return { status: "ASSIGNED" };
  });

  const getCase = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError);
    const [assessment, version, reportDocs, reqs, docs, portalDocs, messages, events, notifications, portalCase] = await Promise.all([
      db.collection(COLLECTIONS.assessments).doc(found.data.assessmentId).get(), found.data.sourceVersionId ? db.collection(COLLECTIONS.versions).doc(found.data.sourceVersionId).get() : Promise.resolve(null),
      db.collection(COLLECTIONS.reports).where("assessmentId", "==", found.data.assessmentId).limit(10).get(), db.collection(COLLECTIONS.requirements).where("caseId", "==", found.id).get(),
      db.collection(COLLECTIONS.documents).where("caseId", "==", found.id).get(), db.collection(COLLECTIONS.portalDocuments).where("caseId", "==", found.id).get(),
      db.collection(COLLECTIONS.portalMessages).where("caseId", "==", found.id).limit(100).get(), db.collection(COLLECTIONS.events).where("caseId", "==", found.id).limit(200).get(),
      db.collection(COLLECTIONS.notifications).where("caseId", "==", found.id).limit(100).get(), db.collection(COLLECTIONS.portalCases).doc(found.id).get()
    ]);
    const requirements = reqs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { case: { id: found.id, ...found.data, evidenceReadiness: readiness(requirements) }, assessment: assessment.exists ? { ...safeAssessmentRow(assessment), input: assessmentInput(assessment.data()), immutable: true } : null, sourceVersion: version && version.exists ? { id: version.id, version: version.data().version, status: version.data().status, immutable: version.data().immutable === true, projectionHash: text(version.data().projectionHash, 128) } : null, assessmentDocuments: reportDocs.docs.map(doc => ({ id: doc.id, version: doc.data().version, pdfPath: text(doc.data().pdfPath, 1000), docxPath: text(doc.data().docxPath, 1000), pdfHash: text(doc.data().pdfHash, 128), immutable: doc.data().immutable === true })), requirements, documents: [...docs.docs.map(doc => ({ id: doc.id, ...doc.data() })), ...portalDocs.docs.map(doc => ({ id: doc.id, source: "CLIENT_PORTAL", ...doc.data() }))], messages: messages.docs.map(doc => ({ id: doc.id, ...doc.data() })), timeline: events.docs.map(doc => ({ id: doc.id, ...doc.data() })), notifications: notifications.docs.map(doc => ({ id: doc.id, ...doc.data() })), portal: portalCase.exists ? { accessState: text(portalCase.data().accessState, 80), clientUid: portalCase.data().clientUid ? "ACTIVE" : "" } : { accessState: "NOT_ACTIVATED" }, phase2Ready: phase2Ready(found.data, requirements), placeholders: { correspondence: "PHASE 2 — NOT YET ENABLED", clientReview: "PHASE 2 — NOT YET ENABLED", actions: "Phase 1 evidence and onboarding actions only" } };
  });

  const updateEvidence = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError), status = text(request.data?.status, 80), requirementRef = db.collection(COLLECTIONS.requirements).doc(text(request.data?.requirementId, 240)), snap = await requirementRef.get();
    if (!EVIDENCE_STATUSES.has(status) || !snap.exists || snap.data().caseId !== found.id) fail(HttpsError, "invalid-argument", "A valid case evidence requirement and status are required.");
    const documentId = text(request.data?.documentId, 180);
    if (status === "ACCEPTED_AS_EVIDENCE") {
      if (!documentId) fail(HttpsError, "failed-precondition", "Accepted evidence must identify a case document.");
      const [internalDoc, portalDoc] = await Promise.all([db.collection(COLLECTIONS.documents).doc(documentId).get(), db.collection(COLLECTIONS.portalDocuments).doc(documentId).get()]);
      const sourceDoc = internalDoc.exists ? internalDoc : portalDoc;
      if (!sourceDoc.exists || sourceDoc.data().caseId !== found.id) fail(HttpsError, "failed-precondition", "Accepted evidence must belong to this processing case.");
    }
    const patch = { status, reviewedAt: ["ACCEPTED_AS_EVIDENCE", "REJECTED_WRONG_DOCUMENT", "REPLACEMENT_REQUESTED", "NOT_APPLICABLE"].includes(status) ? now() : snap.data().reviewedAt || null, reviewedBy: actor.uid, acceptedDocumentId: status === "ACCEPTED_AS_EVIDENCE" ? documentId : "", acceptedDocumentVersion: status === "ACCEPTED_AS_EVIDENCE" ? Math.max(1, Number(request.data?.documentVersion || 1)) : null, replacementReason: status === "REPLACEMENT_REQUESTED" || status === "REJECTED_WRONG_DOCUMENT" ? text(request.data?.reason, 1000) : "", notApplicableReason: status === "NOT_APPLICABLE" ? text(request.data?.reason, 1000) : "", history: FieldValue.arrayUnion({ status, actorUid: actor.uid, at: new Date().toISOString(), reason: text(request.data?.reason, 500) }), updatedAt: now() }; await requirementRef.update(patch);
    if (documentId) {
      const portalDocument = await db.collection(COLLECTIONS.portalDocuments).doc(documentId).get();
      if (portalDocument.exists && portalDocument.data().caseId === found.id) {
        await portalDocument.ref.update({ status: status === "ACCEPTED_AS_EVIDENCE" ? "ACCEPTED" : status, reviewedBy: actor.uid, reviewedAt: now(admin), updatedAt: now(admin) });
      }
    }
    const all = await db.collection(COLLECTIONS.requirements).where("caseId", "==", found.id).get(), state = readiness(all.docs.map(doc => doc.id === snap.id ? { ...doc.data(), ...patch, status } : doc.data()));
    await found.ref.update({ processingState: state.complete ? "EVIDENCE_COMPLETE" : status === "UNDER_REVIEW" ? "EVIDENCE_REVIEW" : "EVIDENCE_COLLECTION", clientActionRequired: ["REQUESTED", "REPLACEMENT_REQUESTED"].includes(status), agentActionRequired: ["UPLOADED", "UNDER_REVIEW"].includes(status), nextInternalAction: state.complete ? "Confirm Phase 2 readiness" : "Continue evidence collection and review", evidenceReadiness: state, updatedAt: now(admin) }); await event(db, admin, found.id, `EVIDENCE_${status}`, actor, { requirementId: snap.id, documentId: text(request.data?.documentId, 180) }, ["REQUESTED", "REPLACEMENT_REQUESTED", "ACCEPTED_AS_EVIDENCE"].includes(status));
    if (["REQUESTED", "REPLACEMENT_REQUESTED"].includes(status)) await db.collection(COLLECTIONS.notifications).add({ caseId: found.id, type: status, audience: "CLIENT", status: "PORTAL", actionRequired: true, createdAt: now(admin) });
    return { status, evidenceReadiness: state };
  });

  const registerStaffDocument = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError), path = text(request.data?.storagePath, 1200), expected = `caseAction/${found.id}/staff-uploads/${actor.uid}/`;
    if (!path.startsWith(expected)) fail(HttpsError, "permission-denied", "The staff upload path is not authorised."); const [exists] = await admin.storage().bucket().file(path).exists(); if (!exists) fail(HttpsError, "failed-precondition", "The uploaded object was not found.");
    const ref = db.collection(COLLECTIONS.documents).doc(); await ref.create({ caseId: found.id, source: text(request.data?.source || "STAFF_UPLOAD", 60), documentType: text(request.data?.documentType, 160), category: found.data.category, storageReference: path, uploadedBy: actor.uid, uploadedAt: now(admin), visibility: "INTERNAL", version: 1, evidenceStatus: "UPLOADED", reviewer: "", sharedStatus: "NOT_SHARED", contentType: text(request.data?.contentType, 160), size: Number(request.data?.size || 0) }); await event(db, admin, found.id, "STAFF_DOCUMENT_UPLOADED", actor, { documentId: ref.id, source: text(request.data?.source || "STAFF_UPLOAD", 60) }); return { id: ref.id, status: "REGISTERED" };
  });

  const createStaffUploadUrl = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError);
    const fileName = text(request.data?.fileName, 240).replace(/[^a-zA-Z0-9._-]/g, "-");
    const contentType = text(request.data?.contentType, 160);
    if (!fileName || !["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(contentType)) fail(HttpsError, "invalid-argument", "Select an approved evidence file type.");
    const storagePath = `caseAction/${found.id}/staff-uploads/${actor.uid}/${Date.now()}-${fileName}`;
    const [uploadUrl] = await admin.storage().bucket().file(storagePath).getSignedUrl({ version: "v4", action: "write", expires: Date.now() + 10 * 60 * 1000, contentType });
    await event(db, admin, found.id, "STAFF_UPLOAD_AUTHORISED", actor, { storagePath, expiresMinutes: 10 });
    return { storagePath, uploadUrl, expiresMinutes: 10 };
  });

  const activatePortal = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError), data = found.data;
    if (!data.crmCaseId || data.onboardingStatus !== "ONBOARDED" || !data.clientEmail) fail(HttpsError, "failed-precondition", "An onboarded CRM4 case with client email is required.");
    const reqSnap = await db.collection(COLLECTIONS.requirements).where("caseId", "==", found.id).get(), tasks = reqSnap.docs.filter(doc => ["REQUESTED", "REPLACEMENT_REQUESTED"].includes(doc.data().status)).map(doc => ({ title: doc.data().evidenceType, status: doc.data().status, note: doc.data().whyRequired, clientVisible: true }));
    await db.collection(COLLECTIONS.portalCases).doc(found.id).set({ clientName: data.clientName, clientEmail: data.clientEmail, clientEmailLower: lower(data.clientEmail), caseRef: data.caseReference, claimType: data.category, status: "Evidence collection", summary: "Your Quaerens case has been onboarded. Documents and updates shared here are controlled by your case team.", nextStep: tasks.length ? "Upload the requested evidence shown below." : "Your case team is reviewing the available information.", timeline: [], tasks, portalVersion: 2, crmLink: { workspaceId: "CRM4", collection: COLLECTIONS.crm, caseId: data.crmCaseId, caseRef: data.caseReference }, accessState: "INVITATION_REQUIRED", updatedAt: now(admin), updatedBy: actor.uid }, { merge: true });
    const token = randomToken(), invitationId = hash(token), hours = Math.min(Math.max(Number(request.data?.expiresHours || 48), 1), 168); await db.collection(COLLECTIONS.portalInvites).doc(invitationId).create({ caseId: found.id, emailLower: lower(data.clientEmail), status: "ACTIVE", createdBy: actor.uid, createdAt: now(), expiresAt: Timestamp.fromMillis(Date.now() + hours * 3600000) }); await db.collection(COLLECTIONS.portalCases).doc(found.id).update({ accessState: "INVITED", updatedAt: now() }); await found.ref.update({ portalStatus: "INVITED", processingState: "PORTAL_ACTIVATION_PENDING", clientActionRequired: true, agentActionRequired: false, nextInternalAction: "Await portal activation and requested evidence", updatedAt: now() }); await db.collection(COLLECTIONS.portalAudit).add({ caseId: found.id, action: "CLIENT_INVITATION_CREATED", actorUid: actor.uid, actorType: "staff", createdAt: now(), details: { invitationId, expiresHours: hours, source: "CASE_ACTION_PHASE_1" } }); await event(db, admin, found.id, "PORTAL_INVITATION_SENT", actor, { expiresHours: hours }, true); return { token, expiresHours: hours, claimUrl: `https://www.quaerens.co.uk/client-portal.html?claim=${encodeURIComponent(token)}` };
  });

  const sendMessage = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError), body = text(request.data?.body, 8000); if (!body) fail(HttpsError, "invalid-argument", "A client message is required.");
    const ref = await db.collection(COLLECTIONS.portalMessages).add({ caseId: found.id, body, senderType: "support", senderUid: actor.uid, senderName: "Quaerens Support", visibleToClient: true, createdAt: now(admin) }); await event(db, admin, found.id, "CLIENT_MESSAGE_SHARED", actor, { messageId: ref.id }, true); return { id: ref.id, status: "CREATED" };
  });

  const markReady = onCall(async request => {
    const actor = await actorFor(request, db, HttpsError), found = await requireCase(actor, request.data?.caseId, db, HttpsError), reqs = await db.collection(COLLECTIONS.requirements).where("caseId", "==", found.id).get(), list = reqs.docs.map(doc => doc.data());
    if (!phase2Ready(found.data, list)) fail(HttpsError, "failed-precondition", "Onboarding, assignment and required evidence must be complete."); await found.ref.update({ processingState: "READY_FOR_PHASE_2", clientActionRequired: false, agentActionRequired: false, nextInternalAction: "Await separate Phase 2 authorisation", readyForPhase2At: now(admin), readyForPhase2By: actor.uid, updatedAt: now(admin) }); await event(db, admin, found.id, "READY_FOR_PHASE_2", actor, { operationalOnly: true }); return { status: "READY_FOR_PHASE_2" };
  });

    return { caseActionListDashboard: listDashboard, caseActionListProcessingStaff: listProcessingStaff, caseActionFindMatches: findMatches, caseActionStartOnboarding: startOnboarding, caseActionDecideOnboarding: decideOnboarding, caseActionAssignProcessor: assignProcessor, caseActionGetCase: getCase, caseActionUpdateEvidence: updateEvidence, caseActionCreateStaffUploadUrl: createStaffUploadUrl, caseActionRegisterStaffDocument: registerStaffDocument, caseActionActivatePortal: activatePortal, caseActionSendClientMessage: sendMessage, caseActionMarkReadyForPhase2: markReady };
}

module.exports = { registerCaseActionPhase1, actorFor, deriveEvidenceRequirements, readiness, rankMatch, phase2Ready, identityFromAssessment, providerFromAssessment, classifyAssessment, safeAssessmentRow, SUPPORTED_ROUTES, ONBOARDING, PROCESSING_STATES, EVIDENCE_STATUSES, APPLICABILITY, STAFF_ROLES, SUPERVISOR_ROLES, COLLECTIONS };

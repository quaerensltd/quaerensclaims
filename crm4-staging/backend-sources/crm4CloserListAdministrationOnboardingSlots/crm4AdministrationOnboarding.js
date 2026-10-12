"use strict";

const crypto = require("node:crypto");
const { renderCrm2CorporateEmail } = require("./crm4CorporateEmail");
const { FieldValue } = require("firebase-admin/firestore");

const SLOTS = "crm4AdministrationOnboardingSlots";
const APPOINTMENTS = "crm4AdministrationOnboardingAppointments";
const LEADS = "crm4Leads";
const PROCESSING = "processingCases";
const PORTAL = "clientPortalCases";
const REQUIRED_ONBOARDING_CHECKS = ["identityReviewed", "loginExplained", "uploadExplained", "messageBoardExplained", "notesRecorded"];
const text = (value, limit = 5000) => String(value == null ? "" : value).trim().slice(0, limit);
const email = value => { const result = text(value, 320).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result : ""; };
const now = () => FieldValue.serverTimestamp();
const hash = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const fail = (HttpsError, code, message) => { throw new HttpsError(code, message); };
const dateOk = value => /^\d{4}-\d{2}-\d{2}$/.test(value);
const timeOk = value => /^\d{2}:\d{2}$/.test(value);
const appointmentId = leadId => `crm4:${leadId}:administration-onboarding`;
const slotId = (date, startTime, durationMinutes) => `admin-onboarding:${date}:${startTime}:${durationMinutes}`.replaceAll(":", "-");
const clientName = lead => text(lead.clientName || lead.name || `${lead.forename || ""} ${lead.surname || ""}`, 200) || "Client";
const displayDate = value => { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value, 20)); return match ? `${match[3]}/${match[2]}/${match[1]}` : text(value, 20); };
const londonNowKey = (date = new Date()) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};
const slotIsFuture = (slot, date = new Date()) => dateOk(text(slot?.date, 20)) && timeOk(text(slot?.startTime, 20)) && `${text(slot.date, 20)}T${text(slot.startTime, 20)}` > londonNowKey(date);

async function authority(request, db, HttpsError, roles) {
  if (!request.auth?.uid) fail(HttpsError, "unauthenticated", "Sign in to CRM4.");
  const membership = await db.collection("crm4Memberships").doc(request.auth.uid).get(), claims = request.auth.token || {}, data = membership.exists ? membership.data() || {} : {};
  if ((!membership.exists || data.active !== true || data.workspaceId !== "CRM4") && claims.platformAdmin !== true) fail(HttpsError, "permission-denied", "Active CRM4 staff membership is required.");
  const actor = { uid: request.auth.uid, role: text(data.role, 40) || (claims.platformAdmin === true ? "administrator" : ""), name: text(data.displayName || data.name || "CRM4 staff", 160), supervisor: claims.platformAdmin === true || data.role === "administrator" };
  if (!roles.includes(actor.role) && !actor.supervisor) fail(HttpsError, "permission-denied", "This Administration Onboarding action is not authorised for your role.");
  return actor;
}
function leadReady(lead) {
  return lead.outcome === "Closed Deal"
    && lead.paymentStatus === "payment_confirmed" && Boolean(lead.paymentConfirmedAt)
    && lead.processingStatus === "ready_for_administration_onboarding";
}
function onboardingCompletionEligibility({ lead = {}, portal = {}, appointment = {}, processingCaseExists = false } = {}) {
  const checks = {
    identityReviewed: portal.onboardingChecklist?.identityReviewed === true,
    portalActivated: portal.accessState === "ACTIVE",
    loginExplained: portal.onboardingChecklist?.loginExplained === true,
    documentChecklistCreated: portal.onboardingChecklist?.documentChecklistCreated === true,
    uploadExplained: portal.onboardingChecklist?.uploadExplained === true,
    messageBoardExplained: portal.onboardingChecklist?.messageBoardExplained === true,
    agreementConfirmed: lead.agreementStatus === "signed",
    notesRecorded: portal.onboardingChecklist?.notesRecorded === true && Boolean(text(portal.onboardingNotes, 8000)),
    paymentConfirmed: lead.paymentStatus === "payment_confirmed" && Boolean(lead.paymentConfirmedAt),
    appointmentBooked: ["booked", "confirmation_sent", "rescheduled"].includes(text(appointment.status, 40)),
    assessmentCompleted: Boolean(text(lead.assessmentId, 180)) && lead.assessmentStatus === "COMPLETED",
    processingNotStarted: !processingCaseExists && !lead.processingCaseId && lead.processingStatus === "ready_for_administration_onboarding",
  };
  return { eligible: Object.values(checks).every(Boolean), checks, missing: Object.entries(checks).filter(([, complete]) => !complete).map(([key]) => key) };
}
function slotProjection(doc, includeInternal = false) {
  const data = doc.data() || {};
  const row = { id: doc.id, date: text(data.date, 20), startTime: text(data.startTime, 20), durationMinutes: Number(data.durationMinutes || 60), status: text(data.status, 40), bookedLeadId: text(data.bookedLeadId, 180), appointmentId: text(data.appointmentId, 240), createdAt: data.createdAt || null, bookedAt: data.bookedAt || null };
  if (includeInternal) Object.assign(row, { createdByUid: text(data.createdByUid, 180), createdByName: text(data.createdByName, 160), blockedReason: text(data.blockedReason, 1000), recurrenceId: text(data.recurrenceId, 180) });
  return row;
}
function confirmationTemplate(lead, appointment) {
  const subject = "Your Quaerens Administration Onboarding Call has been confirmed";
  const body = `Dear ${clientName(lead)},\n\nWe are pleased to confirm that your Administration Onboarding Call has been booked with our Administration & Processing Team.\n\nDate: ${displayDate(appointment.date)}\nTime: ${appointment.startTime}\nDuration: approximately ${appointment.durationMinutes} minutes\nAppointment with: Administration & Processing Team\n\nDuring this call, the Administration & Processing Team will take you through the onboarding process, confirm your case-administration arrangements and explain how your case progress and documents will be managed.\n\nWhere applicable, we will also establish your Quaerens Client Portal arrangements and explain how relevant documents and evidence can be securely provided or uploaded.\n\nPlease keep your telephone available around the scheduled time.\n\nKind regards,\n\nQuaerens Administration & Processing Team`;
  const previewKey = hash(JSON.stringify({ leadId: lead.id, appointmentId: appointment.id, slotId: appointment.slotId, date: appointment.date, time: appointment.startTime, version: appointment.version, recipient: email(lead.email || lead.emailAddress) }));
  return { subject, body, previewKey, content: renderCrm2CorporateEmail(body) };
}

const recorded = (value, fallback = "Not recorded") => text(value, 1000) || fallback;
const bookingEventId = (leadId, version) => `admin-onboarding:${leadId}:v${Number(version || 0)}:confirmed`;

function clientBookingProviderRequest(lead, appointment) {
  const recipient = email(lead.email || lead.emailAddress), template = confirmationTemplate(lead, appointment);
  return {
    recipient,
    template,
    payload: { from: "Quaerens Client Support <clientsupport@quaerens.co.uk>", to: recipient, subject: template.subject, ...template.content, tags: [{ name: "type", value: "crm4_administration_onboarding" }] },
    options: { idempotencyKey: `crm4-admin-onboarding-client-${lead.id}-${appointment.version}-${template.previewKey}` }
  };
}

function internalBookingProviderRequest(lead, appointment, actor) {
  const eventId = bookingEventId(lead.id, appointment.version), recipient = email(lead.email || lead.emailAddress), directLink = `https://www.quaerens.co.uk/processing-dashboard.html?queue=administration-onboarding&lead=${encodeURIComponent(lead.id)}`;
  const address = text(lead.address || lead.fullAddress || [lead.addressLine1, lead.addressLine2, lead.town, lead.county].filter(Boolean).join(", "), 1000);
  const body = `A governed Administration Onboarding Call has been booked.\n\nFull client name: ${clientName(lead)}\nEmail: ${recorded(recipient)}\nTelephone/mobile: ${recorded(lead.telephone || lead.phone || lead.mobile || lead.mobileNumber)}\nFull postal address: ${recorded(address)}\nPostcode: ${recorded(lead.postcode || lead.postalCode)}\nCRM4 Lead ID: ${lead.id}\nRoute/claim type: ${recorded(lead.claimType || lead.assessmentRoute)}\nCampaign/source: ${recorded(lead.campaign || lead.referralSource)}\nAssigned Closer: ${recorded(lead.assignedToName || lead.assignedUserName || actor.name)}\nAgreed fee: ${recorded(lead.agreedFeeCurrency, "GBP")} ${Number(lead.agreedFeeAmount || 0).toFixed(2)}\nAgreement status: ${recorded(lead.agreementStatus)}\nPayment status: ${recorded(lead.paymentStatus)}\nConfirmed payment amount: ${recorded(lead.paymentConfirmedCurrency || lead.agreedFeeCurrency, "GBP")} ${Number(lead.paymentConfirmedAmount || lead.agreedFeeAmount || 0).toFixed(2)}\nAdministration Onboarding date: ${displayDate(appointment.date)}\nAdministration Onboarding time: ${appointment.startTime}\nDuration: ${appointment.durationMinutes} minutes\nAppointment with: Administration & Processing Team\nCurrent onboarding/lifecycle state: Administration Onboarding Booked\n\nAction required: complete the Administration Onboarding Call through the governed Processing/Admin workflow. Active Processing must not begin until that completion action succeeds.\n\nOpen exact client in Processing CRM: ${directLink}`;
  return {
    eventId,
    payload: { from: "Quaerens CRM4 <clientsupport@quaerens.co.uk>", to: "support@quaerens.co.uk", cc: "info@quaerens.co.uk", subject: `Administration Onboarding Call Booked — ${clientName(lead)} — ${displayDate(appointment.date)} ${appointment.startTime}`, ...renderCrm2CorporateEmail(body), tags: [{ name: "type", value: "crm4_administration_onboarding_internal" }] },
    options: { idempotencyKey: `crm4-admin-onboarding-support-${eventId}` }
  };
}

function registerCrm2AdministrationOnboarding({ db, onCall, HttpsError, resend, resendSecret }) {
  const publishSlots = onCall(async request => {
    const actor = await authority(request, db, HttpsError, ["processing", "administrator"]), data = request.data || {};
    const startDate = text(data.startDate || data.date, 20), endDate = text(data.endDate || startDate, 20), startTime = text(data.startTime, 20), durationMinutes = Number(data.durationMinutes || 60), repeatWeekdays = Array.isArray(data.repeatWeekdays) ? data.repeatWeekdays.map(Number).filter(day => day >= 0 && day <= 6) : [];
    if (!dateOk(startDate) || !dateOk(endDate) || !timeOk(startTime) || durationMinutes < 15 || durationMinutes > 240 || endDate < startDate) fail(HttpsError, "invalid-argument", "Valid availability dates, start time and duration are required.");
    const start = new Date(`${startDate}T00:00:00Z`), end = new Date(`${endDate}T00:00:00Z`), recurrenceId = startDate === endDate ? "" : hash(`${startDate}|${endDate}|${startTime}|${durationMinutes}|${repeatWeekdays.join(",")}`).slice(0, 24), refs = [];
    for (let cursor = new Date(start); cursor <= end && refs.length < 366; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      if (repeatWeekdays.length && !repeatWeekdays.includes(cursor.getUTCDay())) continue;
      const date = cursor.toISOString().slice(0, 10), id = slotId(date, startTime, durationMinutes); refs.push({ ref: db.collection(SLOTS).doc(id), date, id });
    }
    if (!refs.length) fail(HttpsError, "invalid-argument", "The recurrence produced no publishable slots.");
    const existing = await db.getAll(...refs.map(item => item.ref)), batch = db.batch(), created = [];
    refs.forEach((item, index) => {
      if (existing[index].exists) return;
      batch.create(item.ref, { date: item.date, startTime, durationMinutes, status: "available", createdByUid: actor.uid, createdByName: actor.name || "Processing", createdAt: now(), recurrenceId, updatedAt: now(), audit: [{ action: "administration_onboarding_slot_published", byUid: actor.uid, at: new Date().toISOString() }] });
      created.push(item.id);
    });
    if (created.length) await batch.commit();
    return { status: created.length ? "PUBLISHED" : "ALREADY_PUBLISHED", count: created.length, recurrenceId, slotIds: created, idempotent: created.length === 0 };
  });

  const blockSlot = onCall(async request => {
    const actor = await authority(request, db, HttpsError, ["processing", "administrator"]), id = text(request.data?.slotId, 240), reason = text(request.data?.reason, 1000), action = text(request.data?.action, 20) || "block";
    if (!id || !["block", "cancel", "release"].includes(action)) fail(HttpsError, "invalid-argument", "A slot and governed availability action are required.");
    const ref = db.collection(SLOTS).doc(id);
    return db.runTransaction(async transaction => { const snap = await transaction.get(ref); if (!snap.exists) fail(HttpsError, "not-found", "The slot was not found."); const slot = snap.data(); if (slot.status === "booked") fail(HttpsError, "failed-precondition", "A booked slot must be rescheduled or cancelled through its appointment."); const status = action === "release" ? "available" : action === "cancel" ? "cancelled" : "blocked"; transaction.update(ref, { status, blockedReason: status === "blocked" ? reason : FieldValue.delete(), updatedAt: now(), audit: FieldValue.arrayUnion({ action: status === "blocked" ? "administration_onboarding_slot_blocked" : `administration_onboarding_slot_${status}`, byUid: actor.uid, at: new Date().toISOString() }) }); return { status: status.toUpperCase() }; });
  });

  const listProcessing = onCall(async request => {
    await authority(request, db, HttpsError, ["processing", "administrator"]);
    const [slots, appointments, leads] = await Promise.all([db.collection(SLOTS).orderBy("date").limit(500).get(), db.collection(APPOINTMENTS).orderBy("date").limit(500).get(), db.collection(LEADS).limit(1000).get()]);
    const leadMap = new Map(leads.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }]));
    const slotRows = slots.docs.map(doc => slotProjection(doc, true));
    const appointmentRows = appointments.docs.map(doc => { const row = doc.data() || {}, lead = leadMap.get(row.leadId) || {}; return { id: doc.id, ...row, clientName: clientName(lead), paymentConfirmedAt: lead.paymentConfirmedAt || null, route: text(lead.claimType || lead.assessmentRoute, 120), assignedCloserName: text(lead.assignedToName || lead.assignedUserName, 160), agreementStatus: text(lead.agreementStatus, 80), paymentStatus: text(lead.paymentStatus, 80), onboardingStatus: text(lead.administrationOnboardingStatus, 80), processingStatus: text(lead.processingStatus, 80) }; });
    return { slots: slotRows.filter(row => slotIsFuture(row)), appointments: appointmentRows.filter(row => slotIsFuture(row)), historicalAppointments: appointmentRows.filter(row => !slotIsFuture(row)), queues: { ready: [...leadMap.values()].filter(lead => leadReady(lead) && !lead.administrationOnboardingAppointmentId).length, booked: [...leadMap.values()].filter(lead => ["booked", "confirmation_sent", "rescheduled"].includes(lead.administrationOnboardingStatus)).length, active: [...leadMap.values()].filter(lead => lead.processingStatus === "accepted").length } };
  });

  const listCloserSlots = onCall(async request => {
    const actor = await authority(request, db, HttpsError, ["closer"]), leadId = text(request.data?.leadId, 180), leadSnap = await db.collection(LEADS).doc(leadId).get();
    if (!leadSnap.exists) fail(HttpsError, "not-found", "The CRM4 lead was not found."); const lead = leadSnap.data();
    if (lead.closerUid !== actor.uid && lead.assignedUserId !== actor.uid) fail(HttpsError, "permission-denied", "This lead is not assigned to the signed-in Closer.");
    if (!leadReady(lead) && lead.administrationOnboardingStatus !== "booked" && lead.administrationOnboardingStatus !== "confirmation_sent" && lead.administrationOnboardingStatus !== "rescheduled") fail(HttpsError, "failed-precondition", "The lead is not ready for Administration Onboarding.");
    const slots = await db.collection(SLOTS).where("status", "==", "available").limit(300).get(), appointment = await db.collection(APPOINTMENTS).doc(appointmentId(leadId)).get();
    return { slots: slots.docs.map(doc => slotProjection(doc, false)).filter(row => slotIsFuture(row)), appointment: appointment.exists ? { id: appointment.id, ...appointment.data() } : null, appointmentWith: "Administration & Processing Team" };
  });

  async function dispatchBookingCommunications({ leadId, actor, expectedPreviewKey = "" }) {
    const leadRef = db.collection(LEADS).doc(leadId), apptRef = db.collection(APPOINTMENTS).doc(appointmentId(leadId));
    const [leadSnap, apptSnap] = await Promise.all([leadRef.get(), apptRef.get()]);
    if (!leadSnap.exists || !apptSnap.exists) fail(HttpsError, "failed-precondition", "Book an Administration Onboarding Call first.");
    const lead = { id: leadId, ...leadSnap.data() }, appointment = { id: apptSnap.id, ...apptSnap.data() };
    if (lead.closerUid !== actor.uid && lead.assignedUserId !== actor.uid) fail(HttpsError, "permission-denied", "This lead is not assigned to the signed-in Closer.");
    const clientRequest = clientBookingProviderRequest(lead, appointment), internalRequest = internalBookingProviderRequest(lead, appointment, actor);
    if (!clientRequest.recipient) fail(HttpsError, "failed-precondition", "The CRM4 client email is unavailable.");
    if (expectedPreviewKey && expectedPreviewKey !== clientRequest.template.previewKey) fail(HttpsError, "failed-precondition", "Refresh the Administration Onboarding confirmation preview before sending.");

    let freshAppointment = (await apptRef.get()).data() || {};
    const clientAlreadySent = freshAppointment.confirmationEventId === internalRequest.eventId && Boolean(freshAppointment.confirmationSentAt);
    if (!clientAlreadySent) {
      const clientResult = process.env.FUNCTIONS_EMULATOR === "true" ? { data: { id: `emulator-admin-onboarding-client-${leadId}-${appointment.version}` } } : await resend.emails.send(clientRequest.payload, clientRequest.options);
      if (clientResult?.error) fail(HttpsError, "internal", clientResult.error.message || "The client confirmation could not be sent.");
      const clientProviderId = text(clientResult?.data?.id || clientResult?.id, 200), at = new Date().toISOString();
      await db.runTransaction(async transaction => {
        const current = await transaction.get(apptRef), data = current.data() || {};
        if (data.confirmationEventId === internalRequest.eventId && data.confirmationSentAt) return;
        transaction.update(apptRef, { status: "confirmation_sent", confirmationKey: clientRequest.template.previewKey, confirmationSentAt: now(), confirmationSentByUid: actor.uid, confirmationProviderId: clientProviderId, confirmationEventId: internalRequest.eventId, updatedAt: now() });
        transaction.update(leadRef, { administrationOnboardingStatus: "confirmation_sent", administrationOnboardingConfirmationSentAt: now(), administrationOnboardingConfirmationProviderId: clientProviderId, lastUpdatedAt: now(), actionHistory: FieldValue.arrayUnion({ action: "administration_onboarding_confirmation_sent", byUid: actor.uid, at, eventId: internalRequest.eventId }) });
      });
    }

    freshAppointment = (await apptRef.get()).data() || {};
    const internalAlreadySent = freshAppointment.internalNotificationEventId === internalRequest.eventId && Boolean(freshAppointment.internalNotificationSentAt);
    if (!internalAlreadySent) {
      const internalResult = process.env.FUNCTIONS_EMULATOR === "true" ? { data: { id: `emulator-admin-onboarding-support-${leadId}-${appointment.version}` } } : await resend.emails.send(internalRequest.payload, internalRequest.options);
      if (internalResult?.error) fail(HttpsError, "internal", internalResult.error.message || "The internal onboarding notification could not be sent.");
      const internalProviderId = text(internalResult?.data?.id || internalResult?.id, 200), at = new Date().toISOString();
      await db.runTransaction(async transaction => {
        const current = await transaction.get(apptRef), data = current.data() || {};
        if (data.internalNotificationEventId === internalRequest.eventId && data.internalNotificationSentAt) return;
        transaction.update(apptRef, { internalNotificationSentAt: now(), internalNotificationRecipient: "support@quaerens.co.uk", internalNotificationManagementCopyRecipient: "info@quaerens.co.uk", internalNotificationProviderId: internalProviderId, internalNotificationEventId: internalRequest.eventId, internalNotificationRetryState: "sent", updatedAt: now() });
        transaction.update(leadRef, { administrationOnboardingInternalNotificationSentAt: now(), administrationOnboardingInternalNotificationRecipient: "support@quaerens.co.uk", administrationOnboardingInternalNotificationManagementCopyRecipient: "info@quaerens.co.uk", administrationOnboardingInternalNotificationProviderId: internalProviderId, actionHistory: FieldValue.arrayUnion({ action: "administration_onboarding_internal_notification_sent", byUid: actor.uid, at, eventId: internalRequest.eventId, primaryRecipient: "support@quaerens.co.uk", managementCopyRecipient: "info@quaerens.co.uk" }), lastUpdatedAt: now() });
      });
    }
    return { status: clientAlreadySent && internalAlreadySent ? "ALREADY_SENT" : "SENT", idempotent: clientAlreadySent && internalAlreadySent, eventId: internalRequest.eventId };
  }

  const book = onCall({ secrets: [resendSecret] }, async request => {
    const actor = await authority(request, db, HttpsError, ["closer"]), leadId = text(request.data?.leadId, 180), requestedSlotId = text(request.data?.slotId, 240), leadRef = db.collection(LEADS).doc(leadId), slotRef = db.collection(SLOTS).doc(requestedSlotId), apptRef = db.collection(APPOINTMENTS).doc(appointmentId(leadId));
    if (!leadId || !requestedSlotId) fail(HttpsError, "invalid-argument", "A CRM4 lead and available Administration Onboarding slot are required.");
    const booking = await db.runTransaction(async transaction => {
      const [leadSnap, slotSnap, appointmentSnap] = await Promise.all([transaction.get(leadRef), transaction.get(slotRef), transaction.get(apptRef)]); if (!leadSnap.exists || !slotSnap.exists) fail(HttpsError, "not-found", "The lead or slot was not found."); const lead = leadSnap.data(), slot = slotSnap.data(), previous = appointmentSnap.exists ? appointmentSnap.data() : null;
      if (lead.closerUid !== actor.uid && lead.assignedUserId !== actor.uid) fail(HttpsError, "permission-denied", "This lead is not assigned to the signed-in Closer."); if (!leadReady(lead)) fail(HttpsError, "failed-precondition", "Commercial prerequisites are incomplete.");
      if (!slotIsFuture(slot)) fail(HttpsError, "failed-precondition", "Past Administration Onboarding slots cannot be booked.");
      if (previous && previous.slotId === requestedSlotId && ["booked", "confirmation_sent", "rescheduled"].includes(previous.status)) return { status: "ALREADY_BOOKED", idempotent: true, appointmentId: apptRef.id };
      if (slot.status !== "available" || slot.bookedLeadId) fail(HttpsError, "already-exists", "Slot no longer available");
      const version = Number(previous?.version || 0) + 1, event = previous ? "administration_onboarding_rescheduled" : "administration_onboarding_booked", at = new Date().toISOString();
      if (previous?.slotId) { const oldRef = db.collection(SLOTS).doc(previous.slotId), oldSnap = await transaction.get(oldRef); if (oldSnap.exists && oldSnap.data().bookedLeadId === leadId) transaction.update(oldRef, { status: "available", bookedLeadId: FieldValue.delete(), appointmentId: FieldValue.delete(), bookedAt: FieldValue.delete(), updatedAt: now() }); }
      transaction.update(slotRef, { status: "booked", bookedLeadId: leadId, appointmentId: apptRef.id, bookedAt: now(), bookedByUid: actor.uid, updatedAt: now() });
      const appointment = { leadId, slotId: requestedSlotId, date: slot.date, startTime: slot.startTime, durationMinutes: Number(slot.durationMinutes || 60), appointmentWith: "Administration & Processing Team", status: previous ? "rescheduled" : "booked", version, previous: previous ? { slotId: previous.slotId, date: previous.date, startTime: previous.startTime } : null, bookedAt: now(), bookedByUid: actor.uid, updatedAt: now() };
      transaction.set(apptRef, appointment, { merge: true }); transaction.update(leadRef, { administrationOnboardingAppointmentId: apptRef.id, administrationOnboardingSlotId: requestedSlotId, administrationOnboardingDate: slot.date, administrationOnboardingTime: slot.startTime, administrationOnboardingDurationMinutes: Number(slot.durationMinutes || 60), administrationOnboardingAppointmentWith: "Administration & Processing Team", administrationOnboardingStatus: appointment.status, administrationOnboardingVersion: version, status: "administration-onboarding-booked", lastUpdatedAt: now(), actionHistory: FieldValue.arrayUnion({ action: event, byUid: actor.uid, at, appointmentId: apptRef.id, previous: appointment.previous, next: { slotId: requestedSlotId, date: slot.date, startTime: slot.startTime } }) });
      return { status: previous ? "RESCHEDULED" : "BOOKED", idempotent: false, appointmentId: apptRef.id };
    });
    const communications = await dispatchBookingCommunications({ leadId, actor });
    return { ...booking, communications };
  });

  const preview = onCall(async request => {
    const actor = await authority(request, db, HttpsError, ["closer"]), leadId = text(request.data?.leadId, 180), [leadSnap, apptSnap] = await Promise.all([db.collection(LEADS).doc(leadId).get(), db.collection(APPOINTMENTS).doc(appointmentId(leadId)).get()]);
    if (!leadSnap.exists || !apptSnap.exists) fail(HttpsError, "failed-precondition", "Book an Administration Onboarding Call first."); const lead = { id: leadId, ...leadSnap.data() }; if (lead.closerUid !== actor.uid && lead.assignedUserId !== actor.uid) fail(HttpsError, "permission-denied", "This lead is not assigned to the signed-in Closer."); const template = confirmationTemplate(lead, { id: apptSnap.id, ...apptSnap.data() }); return { subject: template.subject, text: template.content.text, html: template.content.html, previewKey: template.previewKey, date: apptSnap.data().date, time: apptSnap.data().startTime, appointmentWith: "Administration & Processing Team" };
  });

  const sendConfirmation = onCall({ secrets: [resendSecret] }, async request => {
    const actor = await authority(request, db, HttpsError, ["closer"]), leadId = text(request.data?.leadId, 180), expectedPreviewKey = text(request.data?.previewKey, 100);
    if (!expectedPreviewKey) fail(HttpsError, "failed-precondition", "Refresh the Administration Onboarding confirmation preview before sending.");
    return dispatchBookingCommunications({ leadId, actor, expectedPreviewKey });
  });

  const cancel = onCall(async request => {
    const actor = await authority(request, db, HttpsError, ["closer", "processing", "administrator"]), leadId = text(request.data?.leadId, 180), reason = text(request.data?.reason, 1000), leadRef = db.collection(LEADS).doc(leadId), apptRef = db.collection(APPOINTMENTS).doc(appointmentId(leadId));
    return db.runTransaction(async transaction => { const [leadSnap, apptSnap] = await Promise.all([transaction.get(leadRef), transaction.get(apptRef)]); if (!leadSnap.exists || !apptSnap.exists) return { status: "ALREADY_CANCELLED", idempotent: true }; const lead = leadSnap.data(), appt = apptSnap.data(); if (actor.role === "closer" && lead.closerUid !== actor.uid && lead.assignedUserId !== actor.uid) fail(HttpsError, "permission-denied", "This lead is not assigned to the signed-in Closer."); if (appt.status === "cancelled") return { status: "ALREADY_CANCELLED", idempotent: true }; const slotRef = db.collection(SLOTS).doc(appt.slotId), slotSnap = await transaction.get(slotRef); if (slotSnap.exists && slotSnap.data().bookedLeadId === leadId) transaction.update(slotRef, { status: "available", bookedLeadId: FieldValue.delete(), appointmentId: FieldValue.delete(), bookedAt: FieldValue.delete(), updatedAt: now() }); transaction.update(apptRef, { status: "cancelled", cancelledAt: now(), cancelledByUid: actor.uid, cancellationReason: reason, updatedAt: now() }); transaction.update(leadRef, { administrationOnboardingStatus: "cancelled", status: "ready-for-administration-onboarding", actionHistory: FieldValue.arrayUnion({ action: "administration_onboarding_cancelled", byUid: actor.uid, at: new Date().toISOString(), reason }), lastUpdatedAt: now() }); return { status: "CANCELLED", idempotent: false }; });
  });

  const complete = onCall(async request => {
    const actor = await authority(request, db, HttpsError, ["processing", "administrator"]), leadId = text(request.data?.leadId, 180), notes = text(request.data?.notes, 8000), leadRef = db.collection(LEADS).doc(leadId), apptRef = db.collection(APPOINTMENTS).doc(appointmentId(leadId)), caseRef = db.collection(PROCESSING).doc(`crm4-${leadId}`), portalRef = db.collection(PORTAL).doc(`crm4-${leadId}`);
    return db.runTransaction(async transaction => { const activityRef = db.collection("clientPortalActivity").doc(`administration-onboarding-completed:${portalRef.id}`), auditRef = db.collection("clientPortalAudit").doc(`administration-onboarding-completed:${portalRef.id}`); const [leadSnap, apptSnap, caseSnap, portalSnap, activitySnap] = await Promise.all([transaction.get(leadRef), transaction.get(apptRef), transaction.get(caseRef), transaction.get(portalRef), transaction.get(activityRef)]); if (!leadSnap.exists || !apptSnap.exists) fail(HttpsError, "failed-precondition", "The exact CRM4 lead and Administration Onboarding appointment are required."); const lead = leadSnap.data(), appt = apptSnap.data(), portal = portalSnap.exists ? portalSnap.data() : {}; if (lead.processingStatus === "accepted" && caseSnap.exists && lead.administrationOnboardingStatus === "completed") return { status: "ALREADY_COMPLETED", idempotent: true, processingCaseId: caseRef.id, portalCaseId: portalRef.id }; const eligibility = onboardingCompletionEligibility({ lead, portal, appointment: appt, processingCaseExists: caseSnap.exists }); if (!portalSnap.exists || !eligibility.eligible) fail(HttpsError, "failed-precondition", `Administration Onboarding cannot be completed. Outstanding governed checks: ${eligibility.missing.join(", ") || "workspace authority"}.`); const assessmentId = text(lead.assessmentId, 180); const at = new Date().toISOString(); transaction.create(caseRef, { sourceWorkspace: "CRM4", dataAuthority: "CRM4_PROCESSING", paidClientWorkspaceId: portalRef.id, crm4LeadId: leadId, caseReference: text(lead.reference || lead.leadReference || leadId, 120), claimType: text(lead.claimType || lead.assessmentRoute, 120), campaign: text(lead.campaign || lead.referralSource, 160), client: { name: clientName(lead), email: email(lead.email || lead.emailAddress), telephone: text(lead.telephone || lead.phone, 80) }, assessmentId, assessmentQar: text(lead.assessmentQar, 120), assessmentStatus: "COMPLETED", agreementDocumentId: text(lead.agreementDocumentId, 180), agreementStatus: "signed", agreedFeeAmount: Number(lead.agreedFeeAmount || 0), agreedFeeCurrency: text(lead.agreedFeeCurrency, 8) || "GBP", paymentOptionId: text(lead.paymentOptionId, 80), paymentStatus: "fully_paid", administrationOnboardingAppointmentId: apptRef.id, administrationOnboardingStatus: "completed", caseStage: "new", createdAt: now(), updatedAt: now(), createdByUid: actor.uid }); transaction.update(portalRef, {status:"Active Processing", nextStep:"Your case is now in active processing. Updates, document requests and secure messages will appear here.", administrationOnboardingStatus:"completed", processingStatus:"accepted", processingCaseId:caseRef.id, updatedAt:now(), updatedBy:actor.uid}); transaction.update(apptRef, { status: "completed", completedAt: now(), completedByUid: actor.uid, completionNotes: notes, updatedAt: now() }); transaction.update(leadRef, { administrationOnboardingStatus: "completed", administrationOnboardingCompletedAt: now(), administrationOnboardingCompletedByUid: actor.uid, administrationOnboardingNotes: notes, processingStatus: "accepted", processingAcceptedAt: now(), processingAcceptedByUid: actor.uid, processingCaseId: caseRef.id, portalCaseId: portalRef.id, portalStatus: text(portal.accessState, 40), status: "onboarded", leadStatus: "converted", actionHistory: FieldValue.arrayUnion({ action: "administration_onboarding_completed", byUid: actor.uid, at, appointmentId: apptRef.id }, { action: "processing_activated_after_administration_onboarding", byUid: actor.uid, at, processingCaseId: caseRef.id }), lastUpdatedAt: now() }); if (!activitySnap.exists) transaction.create(activityRef, { caseId: portalRef.id, type: "administration_onboarding_completed", title: "Administration Onboarding completed", detail: "Your case has moved into Active Processing.", visibleToClient: true, createdAt: now(), createdByUid: actor.uid }); transaction.set(auditRef, { caseId: portalRef.id, event: "ADMINISTRATION_ONBOARDING_COMPLETED", actorUid: actor.uid, actorName: actor.name, appointmentId: apptRef.id, processingCaseId: caseRef.id, createdAt: now() }, { merge: false }); return { status: "ADMINISTRATION_ONBOARDING_COMPLETED", idempotent: false, processingCaseId: caseRef.id, portalCaseId: portalRef.id }; });
  });

  return { processingPublishAdministrationOnboardingSlots: publishSlots, processingBlockAdministrationOnboardingSlot: blockSlot, processingListAdministrationOnboarding: listProcessing, crm4CloserListAdministrationOnboardingSlots: listCloserSlots, crm4CloserBookAdministrationOnboarding: book, crm4CloserPreviewAdministrationOnboardingConfirmation: preview, crm4CloserSendAdministrationOnboardingConfirmation: sendConfirmation, crm4CancelAdministrationOnboarding: cancel, processingCompleteAdministrationOnboarding: complete };
}

module.exports = { registerCrm2AdministrationOnboarding, appointmentId, slotId, confirmationTemplate, clientBookingProviderRequest, internalBookingProviderRequest, bookingEventId, leadReady, onboardingCompletionEligibility, slotIsFuture, londonNowKey };

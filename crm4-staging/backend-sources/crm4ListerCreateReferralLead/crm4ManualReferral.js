"use strict";

const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

const text = (value, max = 500) => String(value == null ? "" : value).trim().slice(0, max);
const normaliseEmail = value => text(value, 320).toLowerCase();
const normaliseTelephone = value => {
  const raw = text(value, 60);
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0044")) return `+44${digits.slice(4)}`;
  if (digits.startsWith("440")) return `+44${digits.slice(3)}`;
  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  return `+${digits}`;
};
const normalisePostcode = value => text(value, 16).toUpperCase().replace(/\s+/g, " ");
const hash = value => crypto.createHash("sha256").update(value).digest("hex");

const ROUTES = Object.freeze({
  solar_support: "Solar Support",
  foam_insulation: "Spray Foam Loft Insulation",
});
const REFERRAL_SOURCES = new Set(["existing_client_referral", "partner_referral", "direct_enquiry", "professional_referral", "other"]);

function registerCrm2ManualReferral({ db, onCall, HttpsError }) {
  const fail = (code, message) => { throw new HttpsError(code, message); };

  async function lister(request) {
    if (!request.auth) fail("unauthenticated", "Sign in is required.");
    const snapshot = await db.collection("crm4Memberships").doc(request.auth.uid).get();
    const member = snapshot.exists ? snapshot.data() : null;
    if (!member || member.active !== true || member.workspaceId !== "CRM4" || member.role !== "lister")
      fail("permission-denied", "Only an authorised CRM4 Lister may create a referral lead.");
    return { uid: request.auth.uid, name: text(member.displayName || member.name, 160) || "CRM4 Lister" };
  }

  async function duplicate(field, value) {
    if (!value) return null;
    const snapshot = await db.collection("crm4Leads").where(field, "==", value).limit(1).get();
    return snapshot.empty ? null : snapshot.docs[0];
  }

  const create = onCall(async request => {
    const actor = await lister(request), data = request.data || {};
    const requestId = text(data.requestId, 100);
    if (!/^[a-zA-Z0-9_-]{16,100}$/.test(requestId)) fail("invalid-argument", "A valid submission reference is required.");
    const requestHash = hash(requestId).slice(0, 32);
    const respond = result => {
      logger.info("crm4_manual_referral_outcome", {
        requestHash, outcome: result.outcome, leadId: result.leadId || null,
        existingLeadId: result.existingLeadId || null, actorUid: actor.uid,
      });
      return { ...result, requestHash };
    };
    const replayResult = snapshot => {
      const previous = snapshot.data() || {};
      if (previous.outcome === "EXISTING_DUPLICATE_FOUND") {
        const visibleId = previous.ownerUid === actor.uid ? previous.visibleExistingLeadId || null : null;
        return respond({ status: "POSSIBLE_DUPLICATE", outcome: "EXISTING_DUPLICATE_FOUND", existingLeadId: visibleId, idempotent: true });
      }
      return respond({ status: "CREATED", outcome: "IDEMPOTENT_REPLAY", leadId: previous.leadId, idempotent: true });
    };

    const title = text(data.title, 20), forename = text(data.forename, 100), surname = text(data.surname, 100);
    const email = normaliseEmail(data.email), telephone = normaliseTelephone(data.telephone);
    const route = text(data.claimType, 60), referralSource = text(data.referralSource, 60);
    if (!forename || !surname || (!email && !telephone)) fail("invalid-argument", "Forename, surname and an email address or telephone number are required.");
    if (!Object.hasOwn(ROUTES, route)) fail("invalid-argument", "Select a supported CRM4 assessment route.");
    if (!REFERRAL_SOURCES.has(referralSource)) fail("invalid-argument", "Select a governed referral source.");
    const referralSourceOther = referralSource === "other" ? text(data.referralSourceOther, 160) : "";
    if (referralSource === "other" && !referralSourceOther) fail("invalid-argument", "Describe the referral source briefly.");

    const requestRef = db.collection("crm4ManualReferralRequests").doc(`${actor.uid}_${requestHash}`);
    const existingRequest = await requestRef.get();
    if (existingRequest.exists) return replayResult(existingRequest);

    const candidates = [
      await duplicate("emailNormalized", email),
      await duplicate("email", email),
      await duplicate("telephoneNormalized", telephone),
      await duplicate("telephone", text(data.telephone, 60)),
    ].filter(Boolean);
    if (candidates.length) {
      const candidate = candidates[0], existing = candidate.data();
      const visibleExistingLeadId = [existing.assignedUserId, existing.assignedToUid].includes(actor.uid) ? candidate.id : null;
      const duplicateResult = await db.runTransaction(async transaction => {
        const replay = await transaction.get(requestRef);
        if (replay.exists) return { replay };
        transaction.create(requestRef, { outcome: "EXISTING_DUPLICATE_FOUND", existingLeadId: candidate.id, visibleExistingLeadId, ownerUid: actor.uid, createdAt: FieldValue.serverTimestamp() });
        return { existingLeadId: visibleExistingLeadId };
      });
      if (duplicateResult.replay) return replayResult(duplicateResult.replay);
      return respond({ status: "POSSIBLE_DUPLICATE", outcome: "EXISTING_DUPLICATE_FOUND", existingLeadId: duplicateResult.existingLeadId, idempotent: false });
    }

    const leadRef = db.collection("crm4Leads").doc();
    const reservations = [email && db.collection("crm4LeadDuplicateKeys").doc(`email_${hash(email)}`), telephone && db.collection("crm4LeadDuplicateKeys").doc(`telephone_${hash(telephone)}`)].filter(Boolean);
    const created = await db.runTransaction(async transaction => {
      const replay = await transaction.get(requestRef);
      if (replay.exists) return { replay };
      for (const reservation of reservations) {
        const occupied = await transaction.get(reservation);
        if (occupied.exists) {
          const existingLeadId = occupied.data().leadId || null;
          transaction.create(requestRef, { outcome: "EXISTING_DUPLICATE_FOUND", existingLeadId, visibleExistingLeadId: null, ownerUid: actor.uid, createdAt: FieldValue.serverTimestamp() });
          return { duplicate: true, existingLeadId };
        }
      }
      const now = FieldValue.serverTimestamp(), at = new Date().toISOString();
      const addressLine1 = text(data.addressLine1, 160), addressLine2 = text(data.addressLine2, 160), town = text(data.town, 100), county = text(data.county, 100), postcode = normalisePostcode(data.postcode);
      const clientName = [title, forename, surname].filter(Boolean).join(" ");
      const provenance = { mechanism: "lister_manual_referral", referralSource, referralSourceOther, createdByUid: actor.uid, createdByName: actor.name, createdAt: at };
      const event = { action: "manual_referral_lead_created", byUid: actor.uid, at, notes: `Referral source: ${referralSource}${referralSourceOther ? ` (${referralSourceOther})` : ""}.` };
      transaction.create(leadRef, {
        workspaceId: "CRM4", workspaceLabel: "CRM4", sourceWorkspace: "CRM4", source: "manual_crm4",
        title, forename, surname, clientName, telephone: text(data.telephone, 60), phone: text(data.telephone, 60), telephoneNormalized: telephone,
        email, emailNormalized: email, addressLine1, addressLine2, town, county, postcode,
        address: [addressLine1, addressLine2, town, county, postcode].filter(Boolean).join(", "),
        claimType: route, intakeClaimType: route, issue: ROUTES[route], campaign: "manual_referral",
        referralSource, referralSourceOther, referralProvenance: provenance, notes: text(data.notes, 1200),
        assignedUserId: actor.uid, assignedUserName: actor.name, assignedToUid: actor.uid, assignedToName: actor.name,
        status: "new", leadStatus: "new", reference: `CRM4-REF-${leadRef.id.slice(0, 8).toUpperCase()}`,
        createdBy: actor.uid, createdByName: actor.name, createdAt: now, updatedAt: now, lastUpdatedAt: now,
        audit: [event], actionHistory: [event], assessmentStatus: "NOT_STARTED",
      });
      for (const reservation of reservations) transaction.create(reservation, { leadId: leadRef.id, ownerUid: actor.uid, createdAt: now });
      transaction.create(requestRef, { outcome: "NEW_LEAD_CREATED", leadId: leadRef.id, ownerUid: actor.uid, createdAt: now });
      return { leadId: leadRef.id, idempotent: false };
    });
    if (created.replay) return replayResult(created.replay);
    if (created.duplicate) return respond({ status: "POSSIBLE_DUPLICATE", outcome: "EXISTING_DUPLICATE_FOUND", existingLeadId: null, idempotent: false });
    return respond({ status: "CREATED", outcome: "NEW_LEAD_CREATED", leadId: created.leadId, idempotent: false });
  });

  return { crm4ListerCreateReferralLead: create };
}

module.exports = { registerCrm2ManualReferral, normaliseEmail, normaliseTelephone, normalisePostcode, ROUTES };

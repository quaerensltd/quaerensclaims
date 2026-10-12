"use strict";
/* eslint-disable max-len, require-jsdoc, arrow-parens, brace-style, block-spacing, object-curly-spacing, one-var */

const crypto = require("node:crypto");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const CASES = "clientPortalCases";
const ACCESS = "clientPortalAccess";
const INVITES = "clientPortalInvitations";
const MESSAGES = "clientPortalMessages";
const DOCUMENTS = "clientPortalDocuments";
const AUDIT = "clientPortalAudit";
const CRM_COLLECTION = "crm4Leads";
const STAFF_ROLES = new Set(["administrator", "manager", "processing"]);
const DOCUMENT_STATUSES = new Set([
  "DRAFT",
  "INTERNAL REVIEW",
  "READY FOR CLIENT REVIEW",
  "CLIENT CHANGES REQUESTED",
  "CLIENT APPROVED",
  "READY TO SEND",
  "SENT",
]);
const UPLOAD_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const text = (value, limit = 5000) =>
  String(value == null ? "" : value)
    .trim()
    .slice(0, limit);
const lower = (value) => text(value, 320).toLowerCase();
const tokenHash = (token) =>
  crypto.createHash("sha256").update(text(token, 512)).digest("hex");
const accessId = (uid, caseId) => `${text(uid, 128)}_${text(caseId, 256)}`;
const randomToken = () => crypto.randomBytes(32).toString("base64url");
const nowMillis = (value) =>
  value && typeof value.toMillis === "function"
    ? value.toMillis()
    : new Date(value || 0).getTime();

function fail(HttpsError, code, message) {
  throw new HttpsError(code, message);
}
function requireAuth(request, HttpsError) {
  if (!request.auth || !request.auth.uid)
    fail(HttpsError, "unauthenticated", "Sign in is required.");
  return request.auth;
}
function requireVerifiedClient(request, HttpsError) {
  const auth = requireAuth(request, HttpsError);
  if (auth.token.platformAdmin === true)
    fail(
      HttpsError,
      "permission-denied",
      "Staff accounts cannot claim client access.",
    );
  if (auth.token.email_verified !== true)
    fail(
      HttpsError,
      "failed-precondition",
      "Verify the account email before claiming portal access.",
    );
  if (!lower(auth.token.email))
    fail(
      HttpsError,
      "failed-precondition",
      "The authenticated account has no verified email.",
    );
  return auth;
}
async function staffActor(request, db, HttpsError) {
  const auth = requireAuth(request, HttpsError);
  if (auth.token.platformAdmin === true)
    return { uid: auth.uid, role: "platformAdmin" };
  const snap = await db.collection("crm4Memberships").doc(auth.uid).get();
  const member = snap.exists ? snap.data() : {};
  if (
    !snap.exists ||
    member.active !== true ||
    member.workspaceId !== "CRM4" ||
    !STAFF_ROLES.has(member.role)
  ) {
    fail(
      HttpsError,
      "permission-denied",
      "Authorised portal staff access is required.",
    );
  }
  return { uid: auth.uid, role: member.role };
}
async function clientAccess(request, caseId, db, HttpsError) {
  const auth = requireAuth(request, HttpsError);
  const cleanCaseId = text(caseId, 256);
  if (!cleanCaseId)
    fail(HttpsError, "invalid-argument", "A portal case is required.");
  const snap = await db
    .collection(ACCESS)
    .doc(accessId(auth.uid, cleanCaseId))
    .get();
  const mapping = snap.exists ? snap.data() : {};
  if (
    !snap.exists ||
    mapping.active !== true ||
    mapping.uid !== auth.uid ||
    mapping.caseId !== cleanCaseId
  ) {
    fail(
      HttpsError,
      "permission-denied",
      "This account is not authorised for that portal case.",
    );
  }
  return { auth, caseId: cleanCaseId, mapping };
}
function clientProjection(caseId, data) {
  return {
    id: caseId,
    caseReference: text(data.caseRef || data.caseReference, 120),
    category: text(data.claimType || data.category, 120),
    status: text(data.status, 120),
    summary: text(data.summary || data.clientSummary, 12000),
    nextStep: text(data.nextStep, 5000),
    timeline: Array.isArray(data.timeline)
      ? data.timeline.slice(0, 100).map((item) => ({
          date: text(item.date, 80),
          title: text(item.title || item.label, 300),
          detail: text(item.detail || item.note || item.body, 5000),
        }))
      : [],
    tasks: Array.isArray(data.tasks)
      ? data.tasks
          .filter((item) => item.clientVisible !== false)
          .slice(0, 100)
          .map((item) => ({
            title: text(item.title, 300),
            status: text(item.status, 80),
            note: text(item.note, 3000),
          }))
      : [],
    accessState: text(data.accessState || "ACTIVE", 40),
  };
}
function validateUpload(data, HttpsError) {
  const caseId = text(data.caseId, 256),
    documentId = text(data.documentId, 256);
  const storagePath = text(data.storagePath, 1500),
    contentType = lower(data.contentType),
    size = Number(data.size || 0);
  if (!caseId || !documentId || !storagePath)
    fail(
      HttpsError,
      "invalid-argument",
      "Complete upload metadata is required.",
    );
  if (!UPLOAD_TYPES.has(contentType))
    fail(HttpsError, "invalid-argument", "That file type is not allowed.");
  if (!Number.isFinite(size) || size <= 0 || size > 15 * 1024 * 1024)
    fail(
      HttpsError,
      "invalid-argument",
      "The upload must be between 1 byte and 15 MB.",
    );
  return { caseId, documentId, storagePath, contentType, size };
}
async function audit(db, admin, caseId, action, actor, details = {}) {
  await db.collection(AUDIT).add({
    caseId: text(caseId, 256),
    action: text(action, 120),
    actorUid: text(actor.uid, 128),
    actorType: text(actor.type, 40),
    createdAt: FieldValue.serverTimestamp(),
    details,
  });
}

function registerClientPortal({
  admin,
  db,
  onCall,
  HttpsError,
  resend,
  resendSecret,
}) {
  const claimInvitation = onCall(async (request) => {
    const auth = requireVerifiedClient(request, HttpsError),
      token = text(request.data && request.data.token, 512);
    if (token.length < 32)
      fail(
        HttpsError,
        "invalid-argument",
        "A valid invitation token is required.",
      );
    const inviteRef = db.collection(INVITES).doc(tokenHash(token)),
      inviteSnap = await inviteRef.get();
    if (!inviteSnap.exists)
      fail(
        HttpsError,
        "permission-denied",
        "The invitation is invalid or has expired.",
      );
    const invite = inviteSnap.data();
    if (invite.status !== "ACTIVE" || nowMillis(invite.expiresAt) <= Date.now())
      fail(
        HttpsError,
        "permission-denied",
        "The invitation is invalid or has expired.",
      );
    if (lower(invite.emailLower) !== lower(auth.token.email))
      fail(
        HttpsError,
        "permission-denied",
        "The invitation does not belong to this account.",
      );
    const caseRef = db.collection(CASES).doc(text(invite.caseId, 256)),
      caseSnap = await caseRef.get();
    if (!caseSnap.exists || caseSnap.data().accessState === "REVOKED")
      fail(HttpsError, "permission-denied", "Portal access is unavailable.");
    const mappingRef = db
      .collection(ACCESS)
      .doc(accessId(auth.uid, caseSnap.id));
    await db.runTransaction(async (transaction) => {
      const freshInvite = await transaction.get(inviteRef);
      if (!freshInvite.exists || freshInvite.data().status !== "ACTIVE")
        fail(
          HttpsError,
          "permission-denied",
          "The invitation has already been used.",
        );
      transaction.set(mappingRef, {
        uid: auth.uid,
        caseId: caseSnap.id,
        emailLower: lower(auth.token.email),
        active: true,
        claimedAt: FieldValue.serverTimestamp(),
        invitationId: inviteRef.id,
      });
      transaction.update(inviteRef, {
        status: "CLAIMED",
        claimedByUid: auth.uid,
        claimedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(caseRef, {
        clientUid: auth.uid,
        accessState: "ACTIVE",
        portalVersion: 2,
        portalCode: FieldValue.delete(),
        accessCode: FieldValue.delete(),
        authUid: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await audit(db, admin, caseSnap.id, "CLIENT_ACCOUNT_CLAIMED", {
      uid: auth.uid,
      type: "client",
    });
    return { caseId: caseSnap.id, status: "CLAIMED" };
  });

  const getDashboard = onCall(async (request) => {
    const { auth, caseId } = await clientAccess(
      request,
      request.data && request.data.caseId,
      db,
      HttpsError,
    );
    const [caseSnap, messageSnap, documentSnap, requirementSnap, activitySnap] =
      await Promise.all([
        db.collection(CASES).doc(caseId).get(),
        db
          .collection(MESSAGES)
          .where("caseId", "==", caseId)
          .where("visibleToClient", "==", true)
          .orderBy("createdAt", "desc")
          .limit(50)
          .get(),
        db
          .collection(DOCUMENTS)
          .where("caseId", "==", caseId)
          .where("clientVisible", "==", true)
          .orderBy("uploadedAt", "desc")
          .limit(50)
          .get(),
        db
          .collection("clientPortalRequirements")
          .where("caseId", "==", caseId)
          .where("clientVisible", "==", true)
          .limit(100)
          .get(),
        db
          .collection("clientPortalActivity")
          .where("caseId", "==", caseId)
          .where("clientVisible", "==", true)
          .limit(100)
          .get(),
      ]);
    if (!caseSnap.exists || caseSnap.data().accessState === "REVOKED")
      fail(HttpsError, "permission-denied", "Portal access has been revoked.");
    await audit(db, admin, caseId, "CLIENT_PORTAL_OPENED", {
      uid: auth.uid,
      type: "client",
    });
    return {
      case: clientProjection(caseId, caseSnap.data()),
      messages: messageSnap.docs.map((doc) => ({
        id: doc.id,
        body: text(doc.data().body, 8000),
        senderType: text(doc.data().senderType, 40),
        senderName: text(doc.data().senderName, 160),
        createdAt: doc.data().createdAt || null,
        clientReadState: text(doc.data().clientReadState, 40),
        staffReadState: text(doc.data().staffReadState, 40),
        clientFirstSeenAt: doc.data().clientFirstSeenAt || null,
        staffFirstSeenAt: doc.data().staffFirstSeenAt || null,
      })),
      documents: documentSnap.docs.map((doc) => ({
        id: doc.id,
        requirementId: text(doc.data().requirementId, 256),
        title: text(doc.data().title || doc.data().name, 300),
        category: text(doc.data().category, 120),
        status: text(doc.data().status, 80),
        version: Number(doc.data().version || 1),
        uploadedAt: doc.data().uploadedAt || null,
      })),
      requirements: requirementSnap.docs.map((doc) => ({
        id: doc.id,
        title: text(doc.data().title, 300),
        description: text(doc.data().description, 3000),
        required: doc.data().required === true,
        status: text(doc.data().status, 80),
        priority: text(doc.data().priority, 20) || "STANDARD",
      })),
      activity: activitySnap.docs.map((doc) => ({
        id: doc.id,
        title: text(doc.data().title, 200),
        detail: text(doc.data().detail, 1000),
        occurredAt: doc.data().occurredAt || null,
        type: text(doc.data().type, 80),
      })),
    };
  });

  const listClientCases = onCall(async (request) => {
    const auth = requireAuth(request, HttpsError);
    const accessSnap = await db
      .collection(ACCESS)
      .where("uid", "==", auth.uid)
      .where("active", "==", true)
      .limit(20)
      .get();
    if (accessSnap.empty)
      fail(
        HttpsError,
        "permission-denied",
        "This account has no authorised portal case.",
      );
    const rows = [];
    for (const accessDoc of accessSnap.docs) {
      const mapping = accessDoc.data(),
        caseSnap = await db
          .collection(CASES)
          .doc(text(mapping.caseId, 256))
          .get();
      if (caseSnap.exists && caseSnap.data().accessState !== "REVOKED") {
        rows.push({
          id: caseSnap.id,
          caseReference: text(caseSnap.data().caseRef, 120),
          category: text(caseSnap.data().claimType, 120),
          status: text(caseSnap.data().status, 120),
        });
      }
    }
    return { cases: rows };
  });

  const createMessage = onCall(async (request) => {
    const { auth, caseId } = await clientAccess(
      request,
      request.data && request.data.caseId,
      db,
      HttpsError,
    );
    const body = text(request.data && request.data.body, 8000);
    if (!body) fail(HttpsError, "invalid-argument", "A message is required.");
    const ref = await db
      .collection(MESSAGES)
      .add({
        caseId,
        body,
        senderType: "client",
        senderUid: auth.uid,
        senderName: "Client",
        visibleToClient: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    await audit(
      db,
      admin,
      caseId,
      "CLIENT_MESSAGE_CREATED",
      { uid: auth.uid, type: "client" },
      { messageId: ref.id },
    );
    return { id: ref.id, status: "CREATED" };
  });

  const registerUpload = onCall(async (request) => {
    requireAuth(request, HttpsError);
    const meta = validateUpload(request.data || {}, HttpsError),
      { auth, caseId } = await clientAccess(
        request,
        meta.caseId,
        db,
        HttpsError,
      );
    const requirementId = text(request.data.requirementId, 256),
      requirement = requirementId
        ? await db
            .collection("clientPortalRequirements")
            .doc(requirementId)
            .get()
        : null;
    if (
      !requirement ||
      !requirement.exists ||
      requirement.data().caseId !== caseId ||
      requirement.data().clientVisible !== true
    )
      fail(
        HttpsError,
        "failed-precondition",
        "Choose an authorised document requirement for this upload.",
      );
    const expectedPrefix = `clientPortal/${caseId}/client-uploads/${auth.uid}/`;
    if (!meta.storagePath.startsWith(expectedPrefix))
      fail(
        HttpsError,
        "permission-denied",
        "The upload path is not authorised.",
      );
    const [exists] = await admin
      .storage()
      .bucket()
      .file(meta.storagePath)
      .exists();
    if (!exists)
      fail(
        HttpsError,
        "failed-precondition",
        "The uploaded object was not found.",
      );
    const ref = db.collection(DOCUMENTS).doc(meta.documentId);
    await ref.create({
      caseId,
      requirementId,
      title: text(request.data.title, 300),
      category: text(requirement.data().title, 120),
      uploadedBy: "client",
      uploadedByUid: auth.uid,
      uploadedAt: FieldValue.serverTimestamp(),
      visibility: "CLIENT_SHARED",
      clientVisible: true,
      status: "UPLOADED",
      version: 1,
      storagePath: meta.storagePath,
      contentType: meta.contentType,
      size: meta.size,
      originalFilename: text(request.data.title, 300),
    });
    await requirement.ref.update({
      status: "uploaded",
      latestDocumentId: ref.id,
      uploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await audit(
      db,
      admin,
      caseId,
      "CLIENT_DOCUMENT_UPLOADED",
      { uid: auth.uid, type: "client" },
      { documentId: ref.id },
    );
    return { id: ref.id, status: "REGISTERED" };
  });

  const getDocumentUrl = onCall(async (request) => {
    const caseId = text(request.data && request.data.caseId, 256),
      documentId = text(request.data && request.data.documentId, 256);
    const { auth } = await clientAccess(request, caseId, db, HttpsError),
      snap = await db.collection(DOCUMENTS).doc(documentId).get();
    if (
      !snap.exists ||
      snap.data().caseId !== caseId ||
      snap.data().clientVisible !== true
    )
      fail(
        HttpsError,
        "permission-denied",
        "That document is not shared with this client.",
      );
    const [url] = await admin
      .storage()
      .bucket()
      .file(text(snap.data().storagePath, 1500))
      .getSignedUrl({ action: "read", expires: Date.now() + 5 * 60 * 1000 });
    await audit(
      db,
      admin,
      caseId,
      "CLIENT_DOCUMENT_ACCESSED",
      { uid: auth.uid, type: "client" },
      { documentId },
    );
    return { url, expiresInSeconds: 300 };
  });

  const staffListCases = onCall(async (request) => {
    await staffActor(request, db, HttpsError);
    const snap = await db
      .collection(CASES)
      .orderBy("updatedAt", "desc")
      .limit(100)
      .get();
    return {
      cases: snap.docs.map((doc) => ({
        id: doc.id,
        clientName: text(doc.data().clientName, 200),
        clientEmail: text(doc.data().clientEmail, 320),
        caseRef: text(doc.data().caseRef, 120),
        claimType: text(doc.data().claimType, 120),
        status: text(doc.data().status, 120),
        summary: text(doc.data().summary, 12000),
        nextStep: text(doc.data().nextStep, 5000),
        accessState: text(doc.data().accessState || "MIGRATION_REQUIRED", 40),
        crmLink: doc.data().crmLink || null,
      })),
    };
  });

  const staffUpsertCase = onCall(async (request) => {
    const actor = await staffActor(request, db, HttpsError),
      data = request.data || {},
      caseId = text(data.caseId, 256);
    const crmCaseId = text(data.crmCaseId, 256),
      crmSnap = await db.collection(CRM_COLLECTION).doc(crmCaseId).get();
    if (!crmCaseId || !crmSnap.exists)
      fail(
        HttpsError,
        "failed-precondition",
        "A verified CRM4 case link is required.",
      );
    const payload = {
      clientName: text(data.clientName, 200),
      clientEmail: text(data.clientEmail, 320),
      clientEmailLower: lower(data.clientEmail),
      caseRef: text(data.caseRef, 120),
      claimType: text(data.claimType, 120),
      status: text(data.status, 120),
      summary: text(data.summary, 12000),
      nextStep: text(data.nextStep, 5000),
      timeline: Array.isArray(data.timeline) ? data.timeline.slice(0, 100) : [],
      tasks: Array.isArray(data.tasks) ? data.tasks.slice(0, 100) : [],
      portalVersion: 2,
      crmLink: {
        workspaceId: "CRM4",
        collection: CRM_COLLECTION,
        caseId: crmCaseId,
        caseRef: text(data.caseRef, 120),
      },
      accessState: text(data.accessState || "INVITATION_REQUIRED", 40),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    };
    const ref = caseId
      ? db.collection(CASES).doc(caseId)
      : db.collection(CASES).doc();
    if (caseId) {
      await ref.set(
        {
          ...payload,
          portalCode: FieldValue.delete(),
          accessCode: FieldValue.delete(),
          authUid: FieldValue.delete(),
        },
        { merge: true },
      );
    } else {
      await ref.create({ ...payload, createdAt: FieldValue.serverTimestamp() });
    }
    await audit(
      db,
      admin,
      ref.id,
      "STAFF_SHARED_PROJECTION_UPDATED",
      { uid: actor.uid, type: "staff" },
      { crmCaseId },
    );
    return { id: ref.id, status: "SAVED" };
  });

  const staffCreateInvitation = onCall(async (request) => {
    const actor = await staffActor(request, db, HttpsError),
      caseId = text(request.data && request.data.caseId, 256),
      caseSnap = await db.collection(CASES).doc(caseId).get();
    if (
      !caseSnap.exists ||
      !caseSnap.data().crmLink ||
      caseSnap.data().portalVersion !== 2
    )
      fail(
        HttpsError,
        "failed-precondition",
        "The case must be linked to CRM4 and migrated first.",
      );
    const token = randomToken(),
      hash = tokenHash(token),
      hours = Math.min(
        Math.max(Number(request.data.expiresHours || 48), 1),
        168,
      );
    await db
      .collection(INVITES)
      .doc(hash)
      .create({
        caseId,
        emailLower: lower(caseSnap.data().clientEmail),
        status: "ACTIVE",
        createdBy: actor.uid,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + hours * 3600000),
      });
    await db
      .collection(CASES)
      .doc(caseId)
      .update({
        accessState: "INVITED",
        updatedAt: FieldValue.serverTimestamp(),
      });
    await audit(
      db,
      admin,
      caseId,
      "CLIENT_INVITATION_CREATED",
      { uid: actor.uid, type: "staff" },
      { invitationId: hash, expiresHours: hours },
    );
    return {
      token,
      expiresHours: hours,
      claimUrl: `https://www.quaerens.co.uk/client-portal.html?claim=${encodeURIComponent(token)}`,
    };
  });

  const staffRevokeAccess = onCall(async (request) => {
    const actor = await staffActor(request, db, HttpsError),
      caseId = text(request.data && request.data.caseId, 256),
      reason = text(request.data && request.data.reason, 500);
    if (!caseId || !reason)
      fail(
        HttpsError,
        "invalid-argument",
        "A case and revocation reason are required.",
      );
    const mappings = await db
        .collection(ACCESS)
        .where("caseId", "==", caseId)
        .get(),
      batch = db.batch();
    mappings.docs.forEach((doc) =>
      batch.update(doc.ref, {
        active: false,
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: actor.uid,
        reason,
      }),
    );
    batch.set(
      db.collection(CASES).doc(caseId),
      {
        accessState: "REVOKED",
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: actor.uid,
      },
      { merge: true },
    );
    await batch.commit();
    await audit(
      db,
      admin,
      caseId,
      "PORTAL_ACCESS_REVOKED",
      { uid: actor.uid, type: "staff" },
      { reason },
    );
    return { status: "REVOKED" };
  });

  const staffCreateMessage = onCall(async (request) => {
    const actor = await staffActor(request, db, HttpsError),
      caseId = text(request.data && request.data.caseId, 256),
      body = text(request.data && request.data.body, 8000);
    if (!caseId || !body)
      fail(HttpsError, "invalid-argument", "A case and message are required.");
    const ref = await db
      .collection(MESSAGES)
      .add({
        caseId,
        body,
        senderType: "support",
        senderUid: actor.uid,
        senderName: "Quaerens Support",
        visibleToClient: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    await audit(
      db,
      admin,
      caseId,
      "STAFF_MESSAGE_SHARED",
      { uid: actor.uid, type: "staff" },
      { messageId: ref.id },
    );
    return { id: ref.id, status: "CREATED" };
  });

  const staffRegisterDocument = onCall(async (request) => {
    const actor = await staffActor(request, db, HttpsError),
      meta = validateUpload(request.data || {}, HttpsError);
    if (!meta.storagePath.startsWith(`clientPortal/${meta.caseId}/shared/`))
      fail(
        HttpsError,
        "permission-denied",
        "The shared document path is invalid.",
      );
    const [exists] = await admin
      .storage()
      .bucket()
      .file(meta.storagePath)
      .exists();
    if (!exists)
      fail(
        HttpsError,
        "failed-precondition",
        "The shared object was not found.",
      );
    const status = text(request.data.status || "READY FOR CLIENT REVIEW", 80);
    if (!DOCUMENT_STATUSES.has(status))
      fail(HttpsError, "invalid-argument", "The document status is invalid.");
    const ref = db.collection(DOCUMENTS).doc(meta.documentId);
    await ref.create({
      caseId: meta.caseId,
      title: text(request.data.title, 300),
      category: text(request.data.category, 120),
      uploadedBy: "staff",
      uploadedByUid: actor.uid,
      uploadedAt: FieldValue.serverTimestamp(),
      visibility: "CLIENT_SHARED",
      clientVisible: true,
      status,
      version: Math.max(1, Number(request.data.version || 1)),
      storagePath: meta.storagePath,
      contentType: meta.contentType,
      size: meta.size,
      approvalFoundation: {
        approvedAt: null,
        approvedVersion: null,
        approvedHash: null,
        clientComments: "",
      },
    });
    await audit(
      db,
      admin,
      meta.caseId,
      "DOCUMENT_SHARED",
      { uid: actor.uid, type: "staff" },
      { documentId: ref.id, status },
    );
    return { id: ref.id, status: "SHARED" };
  });

  return {
    portalClientClaimInvitation: claimInvitation,
    portalClientListCases: listClientCases,
    portalClientGetDashboard: getDashboard,
    portalClientCreateMessage: createMessage,
    portalClientRegisterUpload: registerUpload,
    portalClientGetDocumentUrl: getDocumentUrl,
    portalStaffListCases: staffListCases,
    portalStaffUpsertCase: staffUpsertCase,
    portalStaffCreateInvitation: staffCreateInvitation,
    portalStaffRevokeAccess: staffRevokeAccess,
    portalStaffCreateMessage: staffCreateMessage,
    portalStaffRegisterDocument: staffRegisterDocument,
  };
}

module.exports = {
  registerClientPortal,
  requireAuth,
  requireVerifiedClient,
  staffActor,
  clientAccess,
  clientProjection,
  validateUpload,
  tokenHash,
  accessId,
  STAFF_ROLES,
  UPLOAD_TYPES,
  DOCUMENT_STATUSES,
};

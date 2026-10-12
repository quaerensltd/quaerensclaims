"use strict";

// Generated-report corrections share Framework B's assessments, immutable draft
// revisions, final versions, documents, deliveries and append-only audit store.
// The historical GENERATED assessment is never reset to DRAFT or ISSUED.
const crypto = require("node:crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { stableStringify } = require("./quaerensCore/stable");
const A = "professionalAssessments", R = "professionalAssessmentDraftVersions",
  V = "professionalAssessmentVersions", D = "professionalAssessmentDocuments",
  L = "professionalAssessmentDeliveries", E = "professionalAssessmentAudit",
  C = "crm4AssessmentAssistantArtifacts";
const digest = value => crypto.createHash("sha256").update(value).digest("hex");
const canonicalHash = value => digest(stableStringify(value));
const stamp = () => FieldValue.serverTimestamp();
const BASE = ["leadId", "expectedAssessmentId", "expectedQarReference",
  "expectedCurrentRevision", "expectedCurrentFinalVersion"];
function validateInput(data, action, H) {
  const extra = action === "start" ? ["correctionReason", "confirmStartCorrection"]
    : action === "finalise" ? ["confirmFinaliseCorrection", "confirmPreviewReviewed"] : [];
  const allowed = new Set([...BASE, ...extra]);
  const bad = msg => { throw new H("invalid-argument", msg); };
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).some(k => !allowed.has(k))) bad("Only governed correction inputs are accepted.");
  for (const key of BASE.slice(0, 3)) if (typeof data[key] !== "string" || !data[key].trim() || data[key].length > 180 || data[key].includes("/")) bad("Exact lead, assessment and QAR identifiers are required.");
  for (const key of BASE.slice(3)) if (!Number.isSafeInteger(data[key]) || data[key] < 1) bad("Exact revision and final-version numbers are required.");
  if (action === "start" && (data.confirmStartCorrection !== true || typeof data.correctionReason !== "string" || data.correctionReason.trim().length < 10 || data.correctionReason.length > 1000)) bad("Explicit confirmation and a correction reason (10–1000 characters) are required.");
  if (action === "finalise" && (data.confirmFinaliseCorrection !== true || data.confirmPreviewReviewed !== true)) bad("Explicit finalisation and human preview-review confirmation are required.");
  return data;
}
function registerCorrection(deps) {
  const {admin, db, onCall, HttpsError: H, actor, finalisationReviewMatches,
    latestArtifact, safe, governedProjection, pdfBuffer, docxBuffer, TEMPLATE,
    contentModel, deliverGeneratedTarget, resendSecret, generationContractVersion} = deps;
  const ensure = (condition, message, code = "failed-precondition") => { if (!condition) throw new H(code, message); };
  const auditRef = (id, event) => db.collection(E).doc(`${id}-${event}`);
  const audit = (tx, id, event, who, metadata) => tx.create(auditRef(id, event), {
    assessmentId: who.lead.assessmentId, event, actorUid: who.uid, metadata, createdAt: stamp(),
  });
  async function authorised(request, action) {
    const input = validateInput(request.data, action, H);
    const who = await actor(request, db, H, input.leadId, ["manager", "administrator"]);
    ensure(who.lead.assessmentId === input.expectedAssessmentId && who.lead.assessmentQar === input.expectedQarReference, "The authoritative lead linkage changed.");
    return { input, who };
  }
  // All lifecycle reads participate in the caller's transaction. Canonical
  // equality ignores object-key ordering, but not values, arrays or provenance.
  // Historical reviewedOutputHash is an opaque, preserved identity: never
  // reinterpret its historical JSON ordering or rewrite it to make it match.
  async function source(tx, who, input) {
    const ref = db.collection(A).doc(input.expectedAssessmentId), snap = await tx.get(ref);
    ensure(snap.exists, "Assessment not found.");
    const assessment = {id: snap.id, ...snap.data()};
    ensure(assessment.status === "GENERATED" && assessment.assessmentSource === "AI_ASSISTED" && assessment.crmLink?.workspaceId === "CRM4" && assessment.crmLink?.caseRef === input.leadId && assessment.qarReference === input.expectedQarReference, "Only a linked generated AI-assisted assessment can use correction.");
    const lead = await tx.get(db.collection("crm4Leads").doc(input.leadId));
    ensure(lead.exists && lead.data().workspaceId === "CRM4" && lead.data().assessmentId === assessment.id && lead.data().assessmentQar === assessment.qarReference, "Lead linkage changed.");
    const confirmationId = assessment.restricted?.assistantArtifactId;
    ensure(confirmationId, "A governed confirmation is required.");
    const confirmation = await tx.get(db.collection(C).doc(confirmationId));
    const artifacts = await tx.get(db.collection(C).where("leadId", "==", input.leadId).limit(101));
    ensure(artifacts.size < 101, "Confirmation history requires governed review before correction.");
    ensure(confirmation.exists && latestArtifact(artifacts.docs)?.id === confirmationId, "The latest extraction must be the existing confirmed review.");
    const c = confirmation.data();
    ensure(finalisationReviewMatches({assessment, artifact: c, artifactId: confirmationId, leadId: input.leadId}) && /^[a-f0-9]{64}$/.test(c.reviewedOutputHash || "") && c.inputHash && c.inputHash === assessment.restricted?.inputStateHash, "The current confirmation and confirmed facts do not match.");
    const version = await tx.get(db.collection(V).doc(assessment.currentVersionId));
    ensure(version.exists && version.data().immutable === true && version.data().assessmentId === assessment.id && version.data().qarReference === assessment.qarReference && version.data().version === assessment.currentVersion, "The immutable current final version is invalid.");
    const docs = await tx.get(db.collection(D).where("versionId", "==", version.id).limit(2));
    ensure(docs.size === 1 && docs.docs[0].data().immutable === true && docs.docs[0].data().assessmentId === assessment.id && docs.docs[0].data().pdfHash, "The immutable current final document is invalid.");
    return {ref, assessment, confirmationId, reviewedOutputHash: c.reviewedOutputHash,
      inputStateHash: c.inputHash, canonicalConfirmedHash: canonicalHash(safe(c.staffCorrections)),
      sourceVersion: version, sourceDocument: docs.docs[0]};
  }
  function bindingMatches(row, s) {
    return row.confirmationId === s.confirmationId && row.reviewedOutputHash === s.reviewedOutputHash && row.inputStateHash === s.inputStateHash && row.canonicalConfirmedHash === s.canonicalConfirmedHash;
  }
  const start = onCall({timeoutSeconds: 120}, async request => {
    const {input, who} = await authorised(request, "start");
    return db.runTransaction(async tx => {
      const s = await source(tx, who, input), a = s.assessment;
      const id = `correction-${digest(`${a.id}|${input.expectedCurrentRevision}|${input.expectedCurrentFinalVersion}|${generationContractVersion}`).slice(0, 40)}`;
      const ref = db.collection(R).doc(id), prior = await tx.get(ref);
      if (prior.exists) {
        const p = prior.data();
        ensure(a.activeCorrectionId === id && p.reason === input.correctionReason.trim() && bindingMatches(p, s), "Correction replay does not match the authoritative correction.");
        return {result:"CORRECTION_EXISTS", correctionId:id, assessmentId:a.id, qarReference:a.qarReference, revision:p.revision, generationContractVersion:p.generationContractVersion, idempotent:true};
      }
      ensure((!a.activeCorrectionId || a.correctionStatus === "COMPLETE") && a.revision === input.expectedCurrentRevision && a.currentVersion === input.expectedCurrentFinalVersion, "Expected revision/final version changed or a correction already exists.");
      const revision = a.revision + 1, versionNumber = a.currentVersion + 1;
      const projection = safe(await governedProjection(a, versionNumber, {db:null, admin:null, persistComparison:false}));
      tx.create(ref, {
        assessmentId:a.id, qarReference:a.qarReference, leadId:input.leadId,
        revision, status:"SUPERSEDING_DRAFT", generationContractVersion,
        confirmationId:s.confirmationId, reviewedOutputHash:s.reviewedOutputHash,
        inputStateHash:s.inputStateHash, canonicalConfirmedHash:s.canonicalConfirmedHash,
        supersedesVersionId:s.sourceVersion.id, supersedesVersion:a.currentVersion,
        supersedesDocumentId:s.sourceDocument.id, nextVersion:versionNumber,
        reason:input.correctionReason.trim(), projection, projectionHash:canonicalHash(projection),
        createdBy:who.uid, createdAt:stamp(), immutable:true,
      });
      // Original draft, final pointers, completion and delivery remain untouched.
      tx.update(s.ref, {revision, activeCorrectionId:id, correctionStatus:"SUPERSEDING_DRAFT", updatedAt:stamp()});
      audit(tx,id,"ASSESSMENT_CORRECTION_STARTED",who,{correctionId:id,revision,priorVersionId:s.sourceVersion.id,reason:input.correctionReason.trim()});
      audit(tx,id,"ASSESSMENT_CORRECTION_DRAFT_PROJECTED",who,{correctionId:id,generationContractVersion,confirmationId:s.confirmationId});
      return {result:"CORRECTION_STARTED", correctionId:id,assessmentId:a.id,qarReference:a.qarReference,revision,generationContractVersion,confirmationId:s.confirmationId,idempotent:false};
    });
  });
  async function current(tx, who, input) {
    const s = await source(tx, who, input), a = s.assessment;
    ensure(a.activeCorrectionId && a.revision === input.expectedCurrentRevision, "Current correction revision changed.");
    const draft = await tx.get(db.collection(R).doc(a.activeCorrectionId));
    ensure(draft.exists, "Correction draft missing.");
    const row = draft.data();
    ensure(row.assessmentId === a.id && row.qarReference === a.qarReference && row.leadId === input.leadId && row.revision === a.revision && row.supersedesVersion === input.expectedCurrentFinalVersion && row.generationContractVersion === generationContractVersion && bindingMatches(row,s) && canonicalHash(row.projection) === row.projectionHash, "Correction identity, generation contract or confirmed facts changed.");
    ensure((a.currentVersionId === row.supersedesVersionId && a.currentVersion === row.supersedesVersion) || (a.correctedFinalIdentities?.correctionId === draft.id && a.currentVersion === row.nextVersion), "The expected prior final version changed.");
    return {...s, correctionId:draft.id, row};
  }
  const preview = onCall({timeoutSeconds:120,memory:"512MiB"}, async request => {
    const {input,who} = await authorised(request,"preview");
    const s = await db.runTransaction(tx => current(tx,who,input));
    ensure(s.assessment.correctionStatus === "SUPERSEDING_DRAFT", "Only the current unfinalised correction may be previewed.");
    const pdf = await pdfBuffer(s.row.projection,{draftPreview:true});
    return {assessmentId:s.assessment.id,qarReference:s.assessment.qarReference,revision:s.row.revision,
      generationContractVersion,content:pdf.toString("base64"),contentType:"application/pdf",
      filename:`${s.assessment.qarReference}-DRAFT-Assessment-Report.pdf`,draft:true,persisted:false};
  });
  const finalise = onCall({secrets:[resendSecret].filter(Boolean),timeoutSeconds:300,memory:"1GiB"}, async request => {
    const {input,who} = await authorised(request,"finalise"), owner = crypto.randomUUID();
    const s = await db.runTransaction(async tx => {
      const s = await current(tx,who,input), a = s.assessment;
      if (a.correctionStatus === "COMPLETE") return {...s,complete:true};
      ensure(!a.correctionLease || a.correctionLease.expiresAt < Date.now(), "Correction finalisation is already running. Check its state before retrying.", "aborted");
      tx.update(s.ref,{correctionLease:{owner,expiresAt:Date.now()+360000}});
      return s;
    });
    const id = s.correctionId, suffix = digest(id).slice(0,40);
    const ids = {versionId:`gen-${suffix}`,documentId:`doc-${suffix}`,deliveryId:`delivery-${suffix}`,finalizationKey:suffix,correctionId:id};
    const result = () => ({result:"CORRECTION_FINALISED",assessmentId:s.assessment.id,qarReference:s.assessment.qarReference,revision:s.row.revision,version:s.row.nextVersion,generationContractVersion,...ids});
    if (s.complete) return {...result(),idempotent:true};
    try {
      const vr = db.collection(V).doc(ids.versionId), dr = db.collection(D).doc(ids.documentId), lr = db.collection(L).doc(ids.deliveryId);
      let documentSnap = await dr.get();
      if (!documentSnap.exists) {
        const [pdf,docx] = await Promise.all([pdfBuffer(s.row.projection),docxBuffer(s.row.projection)]);
        const base = `professional-assessments/${s.assessment.id}/versions/${ids.versionId}`;
        // Create-only objects recover an interrupted upload without overwriting.
        async function store(ext,bytes,type) {
          const path = `${base}/${ext}`, file = admin.storage().bucket().file(path);
          try {await file.save(bytes,{resumable:false,contentType:type,preconditionOpts:{ifGenerationMatch:0},metadata:{cacheControl:"private,no-store",metadata:{assessmentId:s.assessment.id,versionId:ids.versionId}}});}
          catch(e){if(Number(e.code)!==412)throw e; const [existing]=await file.download();bytes=existing;}
          return {path,hash:digest(bytes),size:bytes.length};
        }
        const [p,w] = await Promise.all([store("report.pdf",pdf,"application/pdf"),store("internal.docx",docx,"application/vnd.openxmlformats-officedocument.wordprocessingml.document")]);
        await db.runTransaction(async tx => {
          const fresh = await current(tx,who,input);
          ensure(fresh.assessment.correctionLease?.owner === owner,"Correction finalisation ownership changed.");
          const [v,d] = await Promise.all([tx.get(vr),tx.get(dr)]);
          ensure(!v.exists && !d.exists,"Correction assets already committed; reload before retrying.");
          const common = {assessmentId:s.assessment.id,qarReference:s.assessment.qarReference,assessmentSource:"AI_ASSISTED",version:s.row.nextVersion,generationContractVersion,correctionId:id,supersedesVersionId:s.row.supersedesVersionId,immutable:true};
          tx.create(vr,{...common,status:"GENERATED",reportMode:"PRELIMINARY",projection:s.row.projection,projectionHash:s.row.projectionHash,createdAt:stamp()});
          tx.create(dr,{...common,versionId:ids.versionId,pdfPath:p.path,pdfHash:p.hash,pdfSize:p.size,docxPath:w.path,docxHash:w.hash,docxSize:w.size,internalDocx:true,templateVersion:TEMPLATE.version,contentModelHash:canonicalHash(contentModel(s.row.projection)),generatedAt:stamp()});
          tx.create(lr,{...common,documentId:ids.documentId,versionId:ids.versionId,pdfHash:p.hash,status:"SENDING",client:{status:"PENDING",attempt:0},archive:{status:"PENDING",attempt:0},createdAt:stamp()});
          tx.update(s.ref,{correctionStatus:"FINALISED"});
          audit(tx,id,"ASSESSMENT_CORRECTED_VERSION_FINALISED",who,{correctionId:id,versionId:ids.versionId,version:s.row.nextVersion});
        });
        documentSnap = await dr.get();
      }
      const versionSnap = await vr.get();
      ensure(versionSnap.exists && documentSnap.data().correctionId === id && versionSnap.data().projectionHash === s.row.projectionHash,"Correction document/version binding is invalid.");
      // Shared governed client/PDF+brochure and independent archive sender;
      // distinct version/document identity yields a distinct provider key.
      const args = {assessment:s.assessment,version:{id:vr.id,...versionSnap.data()},document:{id:dr.id,...documentSnap.data()},deliveryRef:lr};
      const client = await deliverGeneratedTarget({...args,target:"client"});
      const archive = await deliverGeneratedTarget({...args,target:"archive"});
      const complete = client.status === "SENT" && archive.status === "SENT";
      await db.runTransaction(async tx => {
        const fresh = await current(tx,who,input);
        ensure(fresh.assessment.correctionLease?.owner === owner,"Correction finalisation ownership changed.");
        const done = await tx.get(auditRef(id,"ASSESSMENT_CORRECTED_DELIVERY_COMPLETED"));
        tx.update(lr,{status:complete?"COMPLETE":"RETRY REQUIRED",updatedAt:stamp()});
        tx.update(s.ref,{correctionStatus:complete?"COMPLETE":"DELIVERY_PENDING",correctionLease:FieldValue.delete(),...(complete?{currentVersion:s.row.nextVersion,currentVersionId:vr.id,generatedDocumentId:dr.id,correctedFinalIdentities:ids}:{})});
        if (complete && !done.exists) {
          // Supersession is recorded forwards on the new version/audit; the old
          // version's status, timestamps, documents and sends remain byte-exact.
          audit(tx,id,"ASSESSMENT_SUPERSESSION_ESTABLISHED",who,{previousVersionId:s.row.supersedesVersionId,currentVersionId:vr.id,correctionId:id});
          audit(tx,id,"ASSESSMENT_CORRECTED_DELIVERY_COMPLETED",who,{versionId:vr.id,deliveryId:lr.id,correctionId:id});
          tx.update(db.collection("crm4Leads").doc(input.leadId),{assessmentCorrectedVersionId:vr.id,assessmentCorrectedReportDeliveredAt:stamp()});
        }
      });
      return {...result(),result:complete?"CORRECTION_FINALISED":"CORRECTION_DELIVERY_PENDING",clientStatus:client.status,archiveStatus:archive.status,idempotent:false};
    } finally {
      await db.runTransaction(async tx=>{const a=await tx.get(s.ref);if(a.data()?.correctionLease?.owner===owner)tx.update(s.ref,{correctionLease:FieldValue.delete()});});
    }
  });
  return {crm4AssessmentAssistantStartCorrection:start,
    crm4AssessmentAssistantPreviewCorrectionPdf:preview,
    crm4AssessmentAssistantFinaliseCorrection:finalise};
}
module.exports = {registerCorrection,validateInput,canonicalHash};

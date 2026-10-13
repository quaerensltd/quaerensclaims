'use strict';
// CRM4-only compatibility. Immutable pinned sources remain historical evidence.
const MANUAL_ISSUED=Symbol('verified CRM4 manual completion');
function validateLink(leadId, lead, assessmentId, assessment, documents, fail, proof) {
  const link = assessment?.crmLink;
  const id = v => typeof v === 'string' && v.length > 0 && !v.includes('/');
  if (!id(leadId) || lead?.workspaceId !== 'CRM4' || !id(assessmentId) || lead.assessmentId !== assessmentId ||
      !link || link.workspaceId !== 'CRM4' || link.sourceCollection !== 'crm4Leads' ||
      ![link.caseRef, link.crm4LeadId].some(v => v === leadId) ||
      ['caseRef', 'crm4LeadId', 'clientRef'].some(k => link[k] !== undefined && link[k] !== leadId) ||
      !id(lead.assessmentQar) || assessment.qarReference !== lead.assessmentQar ||
      lead.assessmentStatus !== 'COMPLETED' || (!['GENERATED', 'COMPLETED'].includes(assessment.status) && !(proof===MANUAL_ISSUED&&assessment.status==='ISSUED')) ||
      !Number.isInteger(assessment.currentVersion) || assessment.currentVersion < 1 ||
      (lead.assessmentVersion !== undefined && lead.assessmentVersion !== assessment.currentVersion)) fail();
  const current = documents.filter(d => d.assessmentId === assessmentId && d.version === assessment.currentVersion);
  if (current.length !== 1 || !current[0].pdfPath || (current[0].qarReference && current[0].qarReference !== assessment.qarReference)) fail();
  return { ...assessment, crmLink: { ...link, crm4LeadId: leadId } };
}

// Run the existing workspace projection inside a Firestore transaction. Buffer
// writes until every read/projection succeeds; implement read-your-writes for the
// two creation collections. No partial workspace survives a thrown projection.
function transactionalView(db, tx, assessmentId, canonical) {
  const pending = new Map();
  const merge = (a, b) => {
    const out = { ...a };
    for (const [k,v] of Object.entries(b)) out[k] = v && Object.getPrototypeOf(v) === Object.prototype ? merge(out[k] || {}, v) : v;
    return out;
  };
  function snap(ref, original, value) {
    return { id: ref.id, ref, exists: value !== undefined, data: () => value, get: k => value?.[k] };
  }
  function value(ref, original) {
    if (ref.path === 'professionalAssessments/' + assessmentId) return canonical;
    const p = pending.get(ref.path);
    return p ? (p.merge ? merge(original, p.data) : p.data) : original;
  }
  function write(ref, data, options, create) {
    if (!['clientPortalCases', 'clientPortalRequirements'].includes(ref.parent.id)) throw Error('Unexpected workspace projection write');
    const old = pending.get(ref.path);
    pending.set(ref.path, { ref, data: old && options?.merge ? merge(old.data, data) : data, merge: old ? old.merge : !!options?.merge, create: old?.create || create });
    return Promise.resolve();
  }
  function document(ref) {
    return { id: ref.id, path: ref.path, _ref: ref,
      get: async () => { const s = await tx.get(ref); return snap(ref, s, value(ref, s.data())); },
      create: d => write(ref,d,null,true), set: (d,o) => write(ref,d,o,false) };
  }
  function collection(name, query = db.collection(name), filters = [], limit) {
    return { doc: id => document(db.collection(name).doc(id)),
      where: (k,op,v) => { if(op !== '==') throw Error('Unsupported projection query'); return collection(name,query.where(k,op,v),[...filters,[k,v]],limit); },
      limit: n => collection(name,query.limit(n),filters,n),
      get: async () => {
        const s = await tx.get(query), rows = new Map(s.docs.map(d => [d.id, snap(d.ref,d,value(d.ref,d.data()))]));
        for (const p of pending.values()) if (p.ref.parent.id === name && filters.every(([k,v]) => p.data[k] === v)) rows.set(p.ref.id,snap(p.ref,null,value(p.ref,rows.get(p.ref.id)?.data())));
        const docs = [...rows.values()].slice(0,limit); return { docs, empty: !docs.length, size: docs.length };
      } };
  }
  return { db: { collection, batch: () => { const batch = { create: (r,d) => { write(r._ref,d,null,true); return batch; }, set: (r,d,o) => { write(r._ref,d,o,false); return batch; }, commit: async () => {} }; return batch; } },
    commit: () => { for (const p of pending.values()) { if(p.create) tx.create(p.ref,p.data); else tx.set(p.ref,p.data,{merge:p.merge}); } } };
}

async function verifyRequest(db, tx, request, deps) {
    const fail = () => { throw new deps.HttpsError('failed-precondition','CRM4 assessment linkage/version could not be verified'); };
    if (!request.auth?.uid) throw new deps.HttpsError('unauthenticated','Authentication required');
    const member = (await tx.get(db.collection('crm4Memberships').doc(request.auth.uid))).data();
    if (member?.active !== true || member.workspaceId !== 'CRM4' || !['processing','administrator'].includes(member.role)) throw new deps.HttpsError('permission-denied','Active CRM4 Processing/Administrator required');
    const leadId = request.data?.leadId;
    if(typeof leadId !== 'string' || !leadId || leadId.includes('/')) fail();
    const lead = (await tx.get(db.collection('crm4Leads').doc(leadId))).data();
    if (!lead?.assessmentId || typeof lead.assessmentId !== 'string' || lead.assessmentId.includes('/')) fail();
    const assessmentId = lead.assessmentId;
    const assessment = (await tx.get(db.collection('professionalAssessments').doc(assessmentId))).data();
    const documents = await tx.get(db.collection('professionalAssessmentDocuments').where('assessmentId','==',assessmentId));
    let proof;
    if(assessment?.assessmentSource==='FRAMEWORK_B'){
      const hash=v=>require('node:crypto').createHash('sha256').update(v).digest('hex');
      const versionId=assessment.currentVersionId;
      if(typeof versionId!=='string'||!/^[\w-]+$/.test(versionId)||assessment.status!=='ISSUED'||assessment.generationContractVersion||assessment.structuredIntake?.crm4ManualAuthoringVersion!==1||lead.assessmentSource!=='FRAMEWORK_B'||lead.assessmentVersionId!==versionId||lead.assessmentCompletionMethod!=='CRM4_MANUAL_CAPTURE_ONLY')fail();
      const version=(await tx.get(db.collection('professionalAssessmentVersions').doc(versionId))).data();
      const audit=(await tx.get(db.collection('professionalAssessmentAudit').doc('manual-completion-'+hash(assessmentId+':'+versionId)))).data();
      const delivery=(await tx.get(db.collection('professionalAssessmentDeliveries').doc(assessmentId+'_'+versionId))).data();
      const current=documents.docs.filter(d=>d.data().versionId===versionId);
      if(current.length!==1)fail();const doc=current[0].data();
      if(!version||version.status!=='ISSUED'||version.immutable!==true||version.assessmentId!==assessmentId||version.qarReference!==assessment.qarReference||version.version!==assessment.currentVersion||hash(JSON.stringify(version.projection))!==version.projectionHash||version.projectionHash!==assessment.approvedContentHash||
         !audit||audit.event!=='CRM4_MANUAL_COMPLETION_LINKED'||audit.captureOnly!==true||audit.leadId!==leadId||audit.assessmentId!==assessmentId||audit.versionId!==versionId||audit.qarReference!==assessment.qarReference||audit.projectionHash!==version.projectionHash||audit.pdfHash!==doc.pdfHash||audit.docxHash!==doc.docxHash||
         !delivery||delivery.status!=='COMPLETE'||delivery.assessmentId!==assessmentId||delivery.versionId!==versionId||delivery.documentId!==current[0].id||delivery.pdfHash!==doc.pdfHash||delivery.qarReference!==assessment.qarReference||delivery.client?.status!=='SENT'||delivery.archive?.status!=='SENT')fail();
      proof=MANUAL_ISSUED;
    }
    const canonical = validateLink(leadId,lead,assessmentId,assessment,documents.docs.map(d=>d.data()),fail,proof);
    return { assessmentId, canonical };
}
function workspaceBoundary(db, deps, factory) {
  return async request => db.runTransaction(async tx => {
    const { assessmentId, canonical } = await verifyRequest(db,tx,request,deps);
    const view = transactionalView(db,tx,assessmentId,canonical);
    const result = await factory({ ...deps, db: view.db }).paidClientGetWorkspace(request);
    view.commit(); return result;
  });
}
module.exports = { validateLink, workspaceBoundary, verifyRequest };

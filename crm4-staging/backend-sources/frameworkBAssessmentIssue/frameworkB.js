/* eslint-disable */
"use strict";

const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = require("docx");
const {pdfBuffer:fixedPdfBuffer,docxBuffer:fixedDocxBuffer,TEMPLATE,contentModel}=require("./frameworkBRenderer");
const {candidateQar,allocateQar,assessmentSource}=require("./assessmentIdentity");
const {INFORMATION_BROCHURE,verifiedInformationBrochure}=require("./crm4InformationBrochure");

const ASSESSMENTS = "professionalAssessments";
const VERSIONS = "professionalAssessmentVersions";
const DOCUMENTS = "professionalAssessmentDocuments";
const DELIVERIES = "professionalAssessmentDeliveries";
const AUDIT = "professionalAssessmentAudit";
const FRAMEWORK_VERSION = "1.0";
const STATUSES = new Set(["DRAFT", "UNDER REVIEW", "APPROVED", "ISSUED", "SUPERSEDED"]);
const EVIDENCE_STATES = new Set(["DOCUMENT VERIFIED", "CLIENT REPORTED", "REQUIRES CONFIRMATION", "TBC", "NOT APPLICABLE"]);
const FINANCIAL_BASIS = new Set(["DOCUMENTED", "CLIENT REPORTED", "ESTIMATED", "TBC"]);
const FINANCIAL_STATE = new Set(["INCURRED", "QUOTED", "ONGOING", "POTENTIAL"]);
const CAPABILITIES = new Set(["assessmentAuthor", "assessmentReviewer", "assessmentApprover", "assessmentIssuer", "assessmentAdministrator"]);
const CLIENT_FIELDS = ["executiveSummary", "background", "preliminaryAssessment", "recommendations", "recommendedCaseDirection", "limitations"];
const CRM_CASE_COLLECTIONS = new Set(["crm4Leads", "leadAssignments", "claimSubmissions", "processingCases"]);

function text(value, max = 5000) { return String(value == null ? "" : value).trim().slice(0, max); }
function cleanObject(value) {
  if (Array.isArray(value)) return value.map(cleanObject);
  if (!value || typeof value !== "object") return typeof value === "string" ? text(value, 20000) : value;
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, cleanObject(v)]));
}
function sha256(buffer) { return crypto.createHash("sha256").update(buffer).digest("hex"); }
function randomId(prefix) { return `${prefix}_${crypto.randomBytes(12).toString("hex")}`; }
function qarReference(now = new Date()) {
  return candidateQar(now);
}
function timestamp() { return FieldValue.serverTimestamp(); }
function assert(condition, HttpsError, code, message) { if (!condition) throw new HttpsError(code, message); }

async function authority({ request, db, HttpsError, capability, assessment }) {
  assert(request.auth, HttpsError, "unauthenticated", "Authentication is required.");
  const uid = request.auth.uid;
  let capabilities = [];
  let categoryAccess = [];
  let workspaceAccess = [];
  if (request.auth.token.platformAdmin === true) {
    capabilities = [...CAPABILITIES]; categoryAccess = ["*"]; workspaceAccess = ["*"];
  } else {
    const profile = await db.collection("users").doc(uid).get();
    const data = profile.exists ? profile.data() : {};
    capabilities = Array.isArray(data.assessmentCapabilities) ? data.assessmentCapabilities.filter(x => CAPABILITIES.has(x)) : [];
    categoryAccess = Array.isArray(data.assessmentCategoryAccess) ? data.assessmentCategoryAccess : [];
    workspaceAccess = Array.isArray(data.assessmentWorkspaceAccess) ? data.assessmentWorkspaceAccess : [];
  }
  // AI-assisted CRM4 authoring deliberately reuses the governed Framework B
  // contract: an active Lister may author only the exact lead assigned to them.
  // Reviewer, approver and issuer authority remains explicitly capability based.
  const derivedCrm2ListerAuthor = Boolean(assessment &&
    assessmentSource(assessment) === "AI_ASSISTED" &&
    assessment.crmLink && assessment.crmLink.workspaceId === "CRM4" &&
    capability === "assessmentAuthor");
  if (!derivedCrm2ListerAuthor)
    assert(capabilities.includes(capability) || capabilities.includes("assessmentAdministrator"), HttpsError, "permission-denied", "Assessment capability is required.");
  if (assessment) {
    if (!derivedCrm2ListerAuthor) {
      assert(categoryAccess.includes("*") || categoryAccess.includes(assessment.category), HttpsError, "permission-denied", "Assessment category access is required.");
      assert(workspaceAccess.includes("*") || workspaceAccess.includes(assessment.crmLink.workspaceId), HttpsError, "permission-denied", "Assessment workspace access is required.");
    }
    if (assessmentSource(assessment) === "AI_ASSISTED" && assessment.crmLink.workspaceId === "CRM4") {
      const membershipSnap = await db.collection("crm4Memberships").doc(uid).get();
      const membership = membershipSnap.exists ? membershipSnap.data() : {};
      const role = text(membership.role, 40).toLowerCase();
      assert(membership.active === true && membership.workspaceId === "CRM4", HttpsError, "permission-denied", "Active CRM4 membership is required.");
      if (capability === "assessmentAuthor") {
        assert(role === "lister", HttpsError, "permission-denied", "An active CRM4 Lister must author this assessment.");
        const leadSnap = await db.collection("crm4Leads").doc(assessment.crmLink.caseRef).get();
        const lead = leadSnap.exists ? leadSnap.data() : {};
        assert(leadSnap.exists && lead.workspaceId === "CRM4" && [lead.assignedToUid, lead.assignedUserId].includes(uid), HttpsError, "permission-denied", "This CRM4 lead is not assigned to the signed-in Lister.");
      } else if (["assessmentReviewer", "assessmentApprover", "assessmentIssuer"].includes(capability)) {
        assert(["manager", "administrator"].includes(role), HttpsError, "permission-denied", "CRM4 Manager or Administrator authority is required.");
      }
    }
    if (assessmentSource(assessment) === "MANUAL_UPLOAD" && ["assessmentApprover", "assessmentIssuer"].includes(capability))
      assert(assessment.manualUpload && assessment.manualUpload.scanState === "CLEAN", HttpsError, "failed-precondition", "The manual assessment security scan must report CLEAN before approval or issue.");
  }
  return { uid, email: text(request.auth.token.email, 320), capabilities };
}

function validateCrmLink(link, HttpsError) {
  const value = cleanObject(link || {});
  assert(value.workspaceId && value.clientRef && value.caseRef, HttpsError, "invalid-argument", "Workspace, client and case references are required.");
  return { workspaceId: text(value.workspaceId, 40), clientRef: text(value.clientRef, 180), caseRef: text(value.caseRef, 180), sourceCollection: text(value.sourceCollection, 80), snapshot: cleanObject(value.snapshot || {}) };
}

async function verifiedCrmLink(link, db, HttpsError) {
  const value = validateCrmLink(link, HttpsError);
  assert(CRM_CASE_COLLECTIONS.has(value.sourceCollection), HttpsError, "invalid-argument", "CRM case source is not authorised for Framework B.");
  const snapshot = await db.collection(value.sourceCollection).doc(value.caseRef).get();
  assert(snapshot.exists, HttpsError, "not-found", "The linked CRM case does not exist.");
  const record = snapshot.data() || {};
  if (value.workspaceId === "CRM4") assert(record.workspaceId === "CRM4", HttpsError, "failed-precondition", "CRM4 case workspace does not match.");
  const clientName = text(record.clientName || record.name || [record.forename, record.surname].filter(Boolean).join(" "), 300);
  const email = text(record.email || record.clientEmail || (record.client && record.client.email), 320);
  return {...value, snapshot:{...value.snapshot, clientName:clientName || text(value.snapshot.clientName,300), email:email || text(value.snapshot.email,320), caseStatus:text(record.status || record.leadStatus,80), claimType:text(record.claimType || record.issue,200), verifiedAt:new Date().toISOString(), verifiedSource:value.sourceCollection}};
}

function validateEvidence(items, HttpsError) {
  assert(Array.isArray(items), HttpsError, "invalid-argument", "Evidence must be a list.");
  const ids = new Set();
  return items.map((raw, index) => {
    const item = cleanObject(raw || {}); const id = text(item.id || `E${index + 1}`, 80);
    assert(id && !ids.has(id), HttpsError, "invalid-argument", "Evidence IDs must be unique."); ids.add(id);
    assert(EVIDENCE_STATES.has(item.state), HttpsError, "invalid-argument", `Invalid evidence state for ${id}.`);
    return { id, category:text(item.category,120), description:text(item.description,3000), state:item.state, source:text(item.source,500), provenance:text(item.provenance,2000), storageReference:text(item.storageReference,500), receivedDate:text(item.receivedDate,40), reviewedDate:text(item.reviewedDate,40), reviewer:cleanObject(item.reviewer || {}), linkedFacts:Array.isArray(item.linkedFacts)?item.linkedFacts.map(x=>text(x,100)):[], linkedChronologyEvents:Array.isArray(item.linkedChronologyEvents)?item.linkedChronologyEvents.map(x=>text(x,100)):[], linkedFindings:Array.isArray(item.linkedFindings)?item.linkedFindings.map(x=>text(x,100)):[], inclusionStatus:text(item.inclusionStatus || "INCLUDED",40), internalObservations:text(item.internalObservations,10000), clientDescription:text(item.clientDescription || item.description,3000) };
  });
}

function validateFinancial(items, HttpsError) {
  assert(Array.isArray(items), HttpsError, "invalid-argument", "Financial exposure must be a list.");
  const seen = new Set();
  return items.map((raw, index) => {
    const item = cleanObject(raw || {}); const id = text(item.id || `F${index + 1}`,80); const amount = Number(item.amount || 0);
    assert(Number.isFinite(amount) && amount >= 0, HttpsError, "invalid-argument", `Invalid financial amount for ${id}.`);
    assert(FINANCIAL_BASIS.has(item.basis), HttpsError, "invalid-argument", `Invalid financial basis for ${id}.`);
    assert(FINANCIAL_STATE.has(item.state), HttpsError, "invalid-argument", `Invalid financial state for ${id}.`);
    const fingerprint = [text(item.description,300).toLowerCase(), amount.toFixed(2), text(item.currency || "GBP",8), item.state].join("|");
    assert(!seen.has(fingerprint) || item.allowPotentialOverlap === true, HttpsError, "invalid-argument", "Possible duplicate financial exposure requires explicit overlap confirmation."); seen.add(fingerprint);
    return { id, description:text(item.description,2000), amount, currency:text(item.currency || "GBP",8), basis:item.basis, state:item.state, evidenceIds:Array.isArray(item.evidenceIds)?item.evidenceIds.map(x=>text(x,80)):[], allowPotentialOverlap:item.allowPotentialOverlap===true, notes:text(item.notes,5000) };
  });
}

function validateChronology(items, HttpsError) {
  assert(Array.isArray(items), HttpsError, "invalid-argument", "Chronology must be a list.");
  return items.map((raw,index)=>{const item=cleanObject(raw||{});return {id:text(item.id||`C${index+1}`,80),date:text(item.date,40),category:text(item.category,120),description:text(item.description,4000),evidenceIds:Array.isArray(item.evidenceIds)?item.evidenceIds.map(x=>text(x,80)):[],source:text(item.source,500)};});
}

function clientProjection(assessment, versionNumber) {
  const content = assessment.clientContent || {};
  const projection = {
    framework:"Quaerens Professional Case Builder Framework", frameworkVersion:FRAMEWORK_VERSION, reportMode:assessment.reportMode || "PROFESSIONAL",
    qarReference:assessment.qarReference, version:versionNumber, category:assessment.category,
    preparedDate:new Date().toISOString().slice(0,10), client:cleanObject(assessment.crmLink.snapshot || {}),
    chronology:(assessment.chronology||[]).map(({id,date,category,description,evidenceIds,source})=>({id,date,category,description,evidenceIds,source})),
    evidence:(assessment.evidence||[]).filter(x=>x.inclusionStatus!=="EXCLUDED").map(x=>({id:x.id,category:x.category,description:x.clientDescription,state:x.state,source:x.source,receivedDate:x.receivedDate,reviewedDate:x.reviewedDate})),
    financialExposure:(assessment.financialExposure||[]).map(({id,description,amount,currency,basis,state,evidenceIds})=>({id,description,amount,currency,basis,state,evidenceIds})),
    findings:(assessment.findings||[]).map(({id,title,clientText,evidenceIds,limitations})=>({id,title,clientText,evidenceIds,limitations})),
    evidenceReadiness:cleanObject(assessment.evidenceReadiness || {}),
    reviewStatement:"This report records a professional assessment of the information and evidence available at the stated version. It does not guarantee a legal, financial or recovery outcome."
  };
  CLIENT_FIELDS.forEach(field => { projection[field] = text(content[field], 30000); });
  return projection;
}

function sentinelScan(projection, sentinels, HttpsError) {
  const serialised = JSON.stringify(projection).toLowerCase();
  for (const sentinel of sentinels || []) assert(!serialised.includes(text(sentinel,500).toLowerCase()), HttpsError, "failed-precondition", "Restricted internal content reached the client projection.");
}

function pdfBuffer(projection) {
  return new Promise((resolve,reject)=>{
    const doc=new PDFDocument({size:"A4",bufferPages:true,margins:{top:54,bottom:54,left:54,right:54},info:{Title:`Quaerens Assessment Report ${projection.qarReference}`,Author:"Quaerens Ltd"}}); const chunks=[]; doc.on("data",c=>chunks.push(c)); doc.on("end",()=>resolve(Buffer.concat(chunks))); doc.on("error",reject);
    const navy="#092653", blue="#1769e0", muted="#52637a", mode=projection.reportMode==="PRELIMINARY"?"PRELIMINARY":"PROFESSIONAL";
    doc.rect(0,0,595,842).fill(navy); doc.fillColor("white").font("Helvetica-Bold").fontSize(30).text("QUAERENS",54,88); doc.fontSize(13).fillColor("#8fc1ff").text(`${mode} ASSESSMENT REPORT`,54,145); doc.fillColor("white").fontSize(22).text(projection.category.toUpperCase(),54,210,{width:480}); doc.fontSize(12).text(`QAR Reference  ${projection.qarReference}`,54,310).text(`Version  ${projection.version}`,54,334).text(`Prepared  ${projection.preparedDate}`,54,358); doc.fontSize(9).fillColor("#c9d7ea").text(projection.reviewStatement,54,700,{width:480});
    const section=(title,body)=>{doc.addPage();doc.fillColor(navy).font("Helvetica-Bold").fontSize(19).text(title,54,54);doc.moveTo(54,83).lineTo(541,83).strokeColor(blue).lineWidth(2).stroke();doc.moveDown(2);doc.fillColor("#17243a").font("Helvetica").fontSize(10.5).text(body||"Not recorded.",{lineGap:4});};
    section("Client Information",Object.entries(projection.client||{}).map(([k,v])=>`${k}: ${typeof v==="object"?JSON.stringify(v):v}`).join("\n"));
    section("Executive Summary",projection.executiveSummary); section("Background",projection.background);
    section("Chronology",projection.chronology.map(x=>`${x.date||"Date TBC"}  |  ${x.category||"Event"}\n${x.description}\nEvidence: ${(x.evidenceIds||[]).join(", ")||"None linked"}`).join("\n\n"));
    section("Structured Findings",projection.findings.map(x=>`${x.title}\n${x.clientText}\nEvidence: ${(x.evidenceIds||[]).join(", ")||"None linked"}${x.limitations?`\nLimitations: ${x.limitations}`:""}`).join("\n\n"));
    section("Evidence Analysis",projection.evidence.map(x=>`${x.id} — ${x.description}\nState: ${x.state}; Source: ${x.source||"Not recorded"}`).join("\n\n"));
    section("Financial Exposure",projection.financialExposure.map(x=>`${x.description}: ${x.currency} ${Number(x.amount).toFixed(2)}\n${x.basis}; ${x.state}`).join("\n\n"));
    section("Preliminary Assessment",projection.preliminaryAssessment); section("Recommendations",projection.recommendations); section("Recommended Case Direction",projection.recommendedCaseDirection); section("Limitations",projection.limitations||projection.reviewStatement);
    const pages=doc.bufferedPageRange(); for(let i=pages.start;i<pages.start+pages.count;i++){doc.switchToPage(i);doc.fillColor(muted).fontSize(8).text(`${projection.qarReference}  •  Version ${projection.version}  •  Page ${i+1} of ${pages.count}`,54,810,{width:487,align:"center"});}
    doc.end();
  });
}

async function docxBuffer(projection) {
  const heading=t=>new Paragraph({text:t,heading:HeadingLevel.HEADING_1}); const para=t=>new Paragraph({children:[new TextRun(String(t||"Not recorded."))]});
  const rows=(projection.financialExposure||[]).map(x=>new TableRow({children:[new TableCell({children:[para(x.description)]}),new TableCell({children:[para(`${x.currency} ${Number(x.amount).toFixed(2)}`)]}),new TableCell({children:[para(`${x.basis} / ${x.state}`)]})]}));
  const doc=new Document({creator:"Quaerens Ltd",title:`Assessment Report ${projection.qarReference}`,sections:[{properties:{},children:[new Paragraph({children:[new TextRun({text:"QUAERENS",bold:true,size:42,color:"092653"})]}),new Paragraph({children:[new TextRun({text:"PROFESSIONAL ASSESSMENT REPORT",bold:true,size:26,color:"1769E0"})]}),para(`${projection.category} | ${projection.qarReference} | Version ${projection.version}`),heading("Client Information"),...Object.entries(projection.client||{}).map(([k,v])=>para(`${k}: ${typeof v==="object"?JSON.stringify(v):v}`)),heading("Executive Summary"),para(projection.executiveSummary),heading("Background"),para(projection.background),heading("Chronology"),...projection.chronology.map(x=>para(`${x.date||"Date TBC"} — ${x.description} [${(x.evidenceIds||[]).join(", ")||"No evidence linked"}]`)),heading("Structured Findings"),...projection.findings.map(x=>para(`${x.title}: ${x.clientText}`)),heading("Evidence Analysis"),...projection.evidence.map(x=>para(`${x.id}: ${x.description} — ${x.state}`)),heading("Financial Exposure"),new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({children:[new TableCell({children:[para("Description")]}),new TableCell({children:[para("Amount")]}),new TableCell({children:[para("Basis / State")]})]}),...rows]}),heading("Preliminary Assessment"),para(projection.preliminaryAssessment),heading("Recommendations"),para(projection.recommendations),heading("Recommended Case Direction"),para(projection.recommendedCaseDirection),heading("Limitations"),para(projection.limitations||projection.reviewStatement)]}]});
  return Packer.toBuffer(doc);
}

function registerFrameworkB({admin,db,onCall,HttpsError,resend}) {
  async function audit(assessmentId,event,actor,metadata={}) { await db.collection(AUDIT).add({assessmentId,event,actorUid:actor.uid,actorEmail:actor.email,capabilities:actor.capabilities,metadata:cleanObject(metadata),createdAt:timestamp(admin)}); }
  async function load(id,HttpsErrorLocal=HttpsError){const snap=await db.collection(ASSESSMENTS).doc(text(id,100)).get();assert(snap.exists,HttpsErrorLocal,"not-found","Assessment not found.");return {id:snap.id,...snap.data()};}
  const create=onCall(async request=>{const actor=await authority({request,db,HttpsError,capability:"assessmentAuthor"});const data=request.data||{};assert(data.category==="spray-foam",HttpsError,"invalid-argument","Only the authorised Spray Foam category is available.");const crmLink=await verifiedCrmLink(data.crmLink,db,HttpsError);const ref=db.collection(ASSESSMENTS).doc(),qar=await allocateQar({db,assessmentId:ref.id,serverTimestamp:()=>timestamp(admin)});const record={qarReference:qar,assessmentSource:"FRAMEWORK_B",frameworkVersion:FRAMEWORK_VERSION,category:"spray-foam",categoryVersion:"1.0",status:"DRAFT",revision:1,currentVersion:0,crmLink,structuredIntake:cleanObject(data.structuredIntake||{}),chronology:[],evidence:[],financialExposure:[],findings:[],evidenceReadiness:{score:0,explanation:"No evidence has been reviewed."},clientContent:{},restricted:{internalNotes:"",commercialDecision:"",assignmentReasoning:"",riskCommentary:"",staffRecommendations:"",approvalDiscussion:"",operationalInstructions:"",sentinels:[]},authorUid:actor.uid,createdAt:timestamp(admin),updatedAt:timestamp(admin)};await ref.create(record);await audit(ref.id,"ASSESSMENT_CREATED",actor,{qarReference:record.qarReference,assessmentSource:"FRAMEWORK_B",category:record.category,revision:1,crmSource:crmLink.sourceCollection,caseRef:crmLink.caseRef});return {id:ref.id,qarReference:record.qarReference,status:record.status,revision:1};});
  const setAuthority=onCall(async request=>{
    assert(request.auth&&request.auth.token.platformAdmin===true,HttpsError,"permission-denied","Platform administrator access is required.");
    const data=request.data||{},email=text(data.email,320).toLowerCase(),capabilities=Array.isArray(data.capabilities)?data.capabilities.filter(x=>CAPABILITIES.has(x)):[],categoryAccess=Array.isArray(data.categoryAccess)?data.categoryAccess.map(x=>text(x,80)):[],workspaceAccess=Array.isArray(data.workspaceAccess)?data.workspaceAccess.map(x=>text(x,80)):[];
    assert(email&&capabilities.length,HttpsError,"invalid-argument","Verified user email and valid assessment capabilities are required.");
    const userRecord=await admin.auth().getUserByEmail(email),uid=userRecord.uid;
    assert(uid!==request.auth.uid,HttpsError,"failed-precondition","Reviewer authority must belong to a separate authenticated identity.");
    const membershipSnap=await db.collection("crm4Memberships").doc(uid).get(),membership=membershipSnap.exists?membershipSnap.data():{};
    assert(membershipSnap.exists&&membership.active===true&&text(membership.workspaceId,40)==="CRM4",HttpsError,"failed-precondition","The verified user must have active CRM4 membership.");
    assert(text(membership.email,320).toLowerCase()===email,HttpsError,"failed-precondition","Authentication and CRM4 membership identity do not match.");
    assert(["manager","administrator"].includes(text(membership.role,40).toLowerCase()),HttpsError,"failed-precondition","Framework B review authority requires an approved Manager or Administrator membership.");
    await db.collection("users").doc(uid).set({assessmentCapabilities:capabilities,assessmentCategoryAccess:categoryAccess,assessmentWorkspaceAccess:workspaceAccess,assessmentAuthorityUpdatedAt:timestamp(admin),assessmentAuthorityUpdatedBy:request.auth.uid},{merge:true});
    await audit("__authority__","ASSESSMENT_AUTHORITY_UPDATED",{uid:request.auth.uid,email:text(request.auth.token.email,320),capabilities:["assessmentAdministrator"]},{targetUid:uid,targetEmail:email,capabilities,categoryAccess,workspaceAccess});
    return{uid,email,capabilities,categoryAccess,workspaceAccess};
  });
  const setClientRecipient=onCall(async request=>{
    assert(request.auth&&request.auth.token.platformAdmin===true,HttpsError,"permission-denied","Platform administrator access is required.");
    const data=request.data||{},assessment=await load(data.id),email=text(data.email,320).toLowerCase();
    assert(["DRAFT","UNDER REVIEW"].includes(assessment.status),HttpsError,"failed-precondition","The client recipient can be corrected only before approval.");
    assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),HttpsError,"invalid-argument","A valid approved client recipient is required.");
    const snapshot={...(assessment.crmLink&&assessment.crmLink.snapshot||{}),email};
    await db.collection(ASSESSMENTS).doc(assessment.id).update({"crmLink.snapshot":snapshot,updatedAt:timestamp(admin)});
    await audit(assessment.id,"CLIENT_RECIPIENT_CORRECTED",{uid:request.auth.uid,email:text(request.auth.token.email,320),capabilities:["assessmentAdministrator"]},{recipientEmail:email,status:assessment.status});
    return{id:assessment.id,email,status:assessment.status};
  });
  const get=onCall(async request=>{const assessment=await load(request.data&&request.data.id);await authority({request,db,HttpsError,capability:"assessmentAuthor",assessment});return {assessment};});
  const save=onCall(async request=>{const data=request.data||{},assessment=await load(data.id),actor=await authority({request,db,HttpsError,capability:"assessmentAuthor",assessment});assert(["DRAFT","UNDER REVIEW"].includes(assessment.status),HttpsError,"failed-precondition","Only draft or correction-stage assessments may be edited.");assert(Number(data.revision)===assessment.revision,HttpsError,"aborted","Assessment revision changed. Reload before saving.");const patch={structuredIntake:cleanObject(data.structuredIntake||{}),chronology:validateChronology(data.chronology||[],HttpsError),evidence:validateEvidence(data.evidence||[],HttpsError),financialExposure:validateFinancial(data.financialExposure||[],HttpsError),findings:cleanObject(data.findings||[]),evidenceReadiness:cleanObject(data.evidenceReadiness||{}),clientContent:cleanObject(data.clientContent||{}),restricted:cleanObject(data.restricted||{}),revision:assessment.revision+1,updatedAt:timestamp(admin)};await db.collection(ASSESSMENTS).doc(assessment.id).update(patch);await audit(assessment.id,"DRAFT_UPDATED",actor,{fromRevision:assessment.revision,toRevision:assessment.revision+1});return {revision:assessment.revision+1,status:assessment.status};});
  const submit=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentAuthor",assessment});assert(assessment.status==="DRAFT"||assessment.correctionsRequested===true,HttpsError,"failed-precondition","Assessment is not ready for review submission.");await db.collection(ASSESSMENTS).doc(assessment.id).update({status:"UNDER REVIEW",correctionsRequested:false,submittedBy:actor.uid,submittedAt:timestamp(admin),revision:assessment.revision+1,updatedAt:timestamp(admin)});await audit(assessment.id,assessment.correctionsRequested?"ASSESSMENT_RESUBMITTED":"REVIEW_SUBMITTED",actor,{revision:assessment.revision+1});return {status:"UNDER REVIEW",revision:assessment.revision+1};});
  const corrections=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentReviewer",assessment});assert(assessment.status==="UNDER REVIEW",HttpsError,"failed-precondition","Assessment is not under review.");await db.collection(ASSESSMENTS).doc(assessment.id).update({status:"DRAFT",correctionsRequested:true,correctionRequest:text(request.data.reason,10000),reviewerUid:actor.uid,updatedAt:timestamp(admin)});await audit(assessment.id,"CORRECTIONS_REQUESTED",actor,{reason:text(request.data.reason,10000)});return {status:"DRAFT"};});
  const approve=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentApprover",assessment});assert(assessment.status==="UNDER REVIEW",HttpsError,"failed-precondition","Assessment is not under review.");assert(actor.uid!==assessment.authorUid,HttpsError,"permission-denied","Authors cannot approve their own assessment.");const checklist=cleanObject(request.data.checklist||{});assert(Object.keys(checklist).length>=5&&Object.values(checklist).every(Boolean),HttpsError,"failed-precondition","The review checklist must be complete.");const versionNumber=(assessment.currentVersion||0)+1,projection=assessmentSource(assessment)==="AI_ASSISTED"?cleanObject({...assessment.draftProjection,version:versionNumber,qar_reference:assessment.qarReference}):clientProjection(assessment,versionNumber);sentinelScan(projection,assessment.restricted&&assessment.restricted.sentinels,HttpsError);const versionId=randomId("ver");await db.runTransaction(async tx=>{const ref=db.collection(ASSESSMENTS).doc(assessment.id),fresh=await tx.get(ref);assert(fresh.data().status==="UNDER REVIEW",HttpsError,"aborted","Assessment status changed.");tx.create(db.collection(VERSIONS).doc(versionId),{assessmentId:assessment.id,qarReference:assessment.qarReference,assessmentSource:assessmentSource(assessment),version:versionNumber,status:"APPROVED",projection,projectionHash:sha256(Buffer.from(JSON.stringify(projection))),checklist,approvedBy:actor.uid,approvedAt:timestamp(admin),createdAt:timestamp(admin),immutable:true});tx.update(ref,{status:"APPROVED",currentVersion:versionNumber,currentVersionId:versionId,approvedContentHash:sha256(Buffer.from(JSON.stringify(projection))),approvedBy:actor.uid,approvedAt:timestamp(admin),updatedAt:timestamp(admin)});});await audit(assessment.id,"ASSESSMENT_APPROVED",actor,{version:versionNumber,versionId});return {status:"APPROVED",version:versionNumber,versionId};});
  const generate=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentApprover",assessment});assert(assessment.status==="APPROVED",HttpsError,"failed-precondition","Only an approved assessment can generate final documents.");const version=await db.collection(VERSIONS).doc(assessment.currentVersionId).get();assert(version.exists,HttpsError,"not-found","Approved version not found.");const existing=await db.collection(DOCUMENTS).where("versionId","==",version.id).limit(1).get();if(!existing.empty)return {documentId:existing.docs[0].id,...existing.docs[0].data(),reused:true};const projection=version.data().projection;sentinelScan(projection,assessment.restricted&&assessment.restricted.sentinels,HttpsError);const [pdf,docx]=await Promise.all([fixedPdfBuffer(projection),fixedDocxBuffer(projection)]);const base=`professional-assessments/${assessment.id}/versions/${version.id}`,bucket=admin.storage().bucket();await bucket.file(`${base}/report.pdf`).save(pdf,{contentType:"application/pdf",resumable:false,metadata:{cacheControl:"private,no-store",metadata:{assessmentId:assessment.id,versionId:version.id,qarReference:assessment.qarReference}}});await bucket.file(`${base}/internal.docx`).save(docx,{contentType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",resumable:false,metadata:{cacheControl:"private,no-store",metadata:{assessmentId:assessment.id,versionId:version.id,qarReference:assessment.qarReference}}});const ref=db.collection(DOCUMENTS).doc();const metadata={assessmentId:assessment.id,versionId:version.id,version:version.data().version,qarReference:assessment.qarReference,pdfPath:`${base}/report.pdf`,docxPath:`${base}/internal.docx`,pdfHash:sha256(pdf),docxHash:sha256(docx),pdfSize:pdf.length,docxSize:docx.length,generatedAt:timestamp(admin),generatedBy:actor.uid,templateVersion:TEMPLATE.version,contentModelHash:sha256(Buffer.from(JSON.stringify(contentModel(projection)))),immutable:true};await ref.create(metadata);await audit(assessment.id,"DOCUMENTS_GENERATED",actor,{documentId:ref.id,pdfHash:metadata.pdfHash,docxHash:metadata.docxHash,version:metadata.version});return {documentId:ref.id,...metadata};});
  async function sendOne({assessment,version,document,recipient,type,attempt}){const [pdf]=await admin.storage().bucket().file(document.pdfPath).download();assert(sha256(pdf)===document.pdfHash,HttpsError,"data-loss","Stored report hash verification failed.");const brochure=type==="CLIENT"&&assessment.crmLink?.workspaceId==="CRM4"?verifiedInformationBrochure(HttpsError):null;const result=await resend.emails.send({from:"Quaerens Assessment Reports <client@quaerens.co.uk>",to:recipient,subject:`Quaerens Assessment Report — ${assessment.qarReference}`,text:`Please find attached your Quaerens Professional Assessment Report.\n\nReference: ${assessment.qarReference}\nVersion: ${version.version}\n\nThis report reflects the information and evidence reviewed at the issue date and does not guarantee an outcome.${type==="CLIENT"&&assessment.crmLink?.workspaceId==="CRM4"?"\n\n"+require("./solicitorPartnerEmail").text():""}`,attachments:[{filename:`${assessment.qarReference}-Assessment-Report.pdf`,content:pdf.toString("base64")},...(brochure?[{filename:INFORMATION_BROCHURE.filename,content:brochure.toString("base64")}]:[])],tags:[{name:"type",value:`assessment_${type.toLowerCase()}`} ]},{idempotencyKey:`assessment-${assessment.id}-${version.version}-${type.toLowerCase()}-${document.pdfHash}`});return {providerMessageId:result?.data?.id||result?.id||"",attempt,status:"SENT",sentAt:timestamp(admin),error:"",brochure:brochure?{id:INFORMATION_BROCHURE.id,version:INFORMATION_BROCHURE.version,sha256:INFORMATION_BROCHURE.sha256}:null};}
  const issue=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentIssuer",assessment});assert(assessment.status==="APPROVED",HttpsError,"failed-precondition","Only an approved assessment can be issued.");const versionSnap=await db.collection(VERSIONS).doc(assessment.currentVersionId).get();assert(versionSnap.exists&&versionSnap.data().status==="APPROVED",HttpsError,"failed-precondition","Approved immutable version is required.");const documentSnap=await db.collection(DOCUMENTS).where("versionId","==",versionSnap.id).limit(1).get();assert(!documentSnap.empty,HttpsError,"failed-precondition","Canonical documents must be generated first.");const document={id:documentSnap.docs[0].id,...documentSnap.docs[0].data()},version=versionSnap.data();const clientEmail=text(assessment.crmLink.snapshot.email||assessment.crmLink.snapshot.clientEmail,320),archiveEmail=text(process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL,320);assert(clientEmail,HttpsError,"failed-precondition","Client email is required.");assert(archiveEmail,HttpsError,"failed-precondition","Assessment archive email is not configured.");const deliveryId=`${assessment.id}_${versionSnap.id}`,deliveryRef=db.collection(DELIVERIES).doc(deliveryId),existing=await deliveryRef.get();if(existing.exists)return {status:existing.data().status==="COMPLETE"?"ISSUED":"DELIVERY_PARTIAL",deliveryId,reused:true,clientStatus:existing.data().client.status,archiveStatus:existing.data().archive.status};await deliveryRef.create({assessmentId:assessment.id,versionId:versionSnap.id,documentId:document.id,qarReference:assessment.qarReference,pdfHash:document.pdfHash,client:{status:"PENDING",attempt:0},archive:{status:"PENDING",attempt:0},status:"SENDING",createdAt:timestamp(admin),updatedAt:timestamp(admin)});let client,archive;try{client=await sendOne({assessment,version,document,recipient:clientEmail,type:"CLIENT",attempt:1});}catch(error){client={status:"FAILED",attempt:1,error:text(error.message,2000),failedAt:timestamp(admin)};}try{archive=await sendOne({assessment,version,document,recipient:archiveEmail,type:"ARCHIVE",attempt:1});}catch(error){archive={status:"FAILED",attempt:1,error:text(error.message,2000),failedAt:timestamp(admin)};}const complete=client.status==="SENT"&&archive.status==="SENT";await deliveryRef.update({client,archive,status:complete?"COMPLETE":"PARTIAL",updatedAt:timestamp(admin)});if(complete){await db.collection(VERSIONS).doc(versionSnap.id).update({status:"ISSUED",issuedAt:timestamp(admin),issuedBy:actor.uid});if(assessment.previousIssuedVersionId)await db.collection(VERSIONS).doc(assessment.previousIssuedVersionId).update({status:"SUPERSEDED",supersededBy:versionSnap.id,supersededAt:timestamp(admin)});await db.collection(ASSESSMENTS).doc(assessment.id).update({status:"ISSUED",issuedAt:timestamp(admin),issuedBy:actor.uid,previousIssuedVersionId:FieldValue.delete(),updatedAt:timestamp(admin)});}await audit(assessment.id,"ASSESSMENT_ISSUE_ATTEMPT",actor,{deliveryId,clientStatus:client.status,archiveStatus:archive.status,pdfHash:document.pdfHash});return {status:complete?"ISSUED":"DELIVERY_PARTIAL",deliveryId,clientStatus:client.status,archiveStatus:archive.status};});
  const retry=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentIssuer",assessment}),deliveryRef=db.collection(DELIVERIES).doc(text(request.data.deliveryId,200)),deliverySnap=await deliveryRef.get();assert(deliverySnap.exists,HttpsError,"not-found","Delivery not found.");const delivery=deliverySnap.data(),versionSnap=await db.collection(VERSIONS).doc(delivery.versionId).get(),documentSnap=await db.collection(DOCUMENTS).doc(delivery.documentId).get();assert(versionSnap.exists&&documentSnap.exists,HttpsError,"failed-precondition","Immutable delivery assets are missing.");const targets=Array.isArray(request.data.targets)?request.data.targets:[];const patch={};for(const target of targets){assert(["client","archive"].includes(target)&&delivery[target].status==="FAILED",HttpsError,"failed-precondition","Only failed delivery targets may be retried.");const recipient=target==="client"?text(assessment.crmLink.snapshot.email||assessment.crmLink.snapshot.clientEmail,320):text(process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL,320);try{patch[target]=await sendOne({assessment,version:versionSnap.data(),document:documentSnap.data(),recipient,type:target.toUpperCase(),attempt:Number(delivery[target].attempt||0)+1});}catch(error){patch[target]={status:"FAILED",attempt:Number(delivery[target].attempt||0)+1,error:text(error.message,2000),failedAt:timestamp(admin)};}}const merged={client:patch.client||delivery.client,archive:patch.archive||delivery.archive};patch.status=merged.client.status==="SENT"&&merged.archive.status==="SENT"?"COMPLETE":"PARTIAL";patch.updatedAt=timestamp(admin);await deliveryRef.update(patch);if(patch.status==="COMPLETE"){await db.collection(VERSIONS).doc(delivery.versionId).update({status:"ISSUED",issuedAt:timestamp(admin),issuedBy:actor.uid});await db.collection(ASSESSMENTS).doc(assessment.id).update({status:"ISSUED",issuedAt:timestamp(admin),issuedBy:actor.uid,updatedAt:timestamp(admin)});}await audit(assessment.id,"DELIVERY_RETRIED",actor,{deliveryId:deliverySnap.id,targets,status:patch.status,pdfHash:documentSnap.data().pdfHash});return {status:patch.status,clientStatus:merged.client.status,archiveStatus:merged.archive.status};});
  const newRevision=onCall(async request=>{const assessment=await load(request.data&&request.data.id),actor=await authority({request,db,HttpsError,capability:"assessmentAuthor",assessment});assert(assessment.status==="ISSUED",HttpsError,"failed-precondition","Only an issued assessment can start a superseding revision.");await db.collection(ASSESSMENTS).doc(assessment.id).update({status:"DRAFT",previousIssuedVersionId:assessment.currentVersionId,revision:assessment.revision+1,updatedAt:timestamp(admin)});await audit(assessment.id,"SUPERSEDING_REVISION_STARTED",actor,{previousVersionId:assessment.currentVersionId,previousVersion:assessment.currentVersion,revision:assessment.revision+1});return {status:"DRAFT",revision:assessment.revision+1};});
  const list=onCall(async request=>{const actor=await authority({request,db,HttpsError,capability:"assessmentAuthor"});const snap=await db.collection(ASSESSMENTS).orderBy("updatedAt","desc").limit(100).get();return {assessments:snap.docs.map(d=>{const x=d.data();return{id:d.id,qarReference:x.qarReference,category:x.category,status:x.status,revision:x.revision,currentVersion:x.currentVersion,clientName:x.crmLink&&x.crmLink.snapshot&&(x.crmLink.snapshot.clientName||x.crmLink.snapshot.name)||"",updatedAt:x.updatedAt};}),actor:{uid:actor.uid}};});
  return {frameworkBAdminSetAuthority:setAuthority,frameworkBAdminSetClientRecipient:setClientRecipient,frameworkBAssessmentCreate:create,frameworkBAssessmentGet:get,frameworkBAssessmentList:list,frameworkBAssessmentSaveDraft:save,frameworkBAssessmentSubmitReview:submit,frameworkBAssessmentRequestCorrections:corrections,frameworkBAssessmentApprove:approve,frameworkBAssessmentGenerateDocuments:generate,frameworkBAssessmentIssue:issue,frameworkBAssessmentRetryDelivery:retry,frameworkBAssessmentStartSupersedingRevision:newRevision};
}

module.exports={registerFrameworkB,clientProjection,validateEvidence,validateFinancial,validateChronology,qarReference,pdfBuffer:fixedPdfBuffer,docxBuffer:fixedDocxBuffer,sentinelScan,TEMPLATE,contentModel};

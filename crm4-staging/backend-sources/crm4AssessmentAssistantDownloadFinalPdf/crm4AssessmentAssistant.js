"use strict";
const crypto = require("node:crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { allocateQar, QAR_RESERVATIONS } = require("./assessmentIdentity");
const {
  authoritativeClient,
  validateClientIdentity,
} = require("./universalAssessment");
const {
  pdfBuffer,
  docxBuffer,
  TEMPLATE,
  contentModel,
} = require("./frameworkBRenderer");
const {
  INFORMATION_BROCHURE,
  verifiedInformationBrochure,
} = require("./crm4InformationBrochure");
const { renderCrm2CorporateEmail } = require("./crm4CorporateEmail");
const { stableStringify } = require("./quaerensCore/stable");
const {
  buildSprayFoamProjection,
} = require("./crm4AssessmentAssistantSprayFoamAdapter");
const {
  buildSolarProjection,
} = require("./crm4AssessmentAssistantSolarAdapter");
const {
  MODEL,
  INSTRUCTION_VERSION,
  SCHEMA_VERSION,
  CATEGORIES,
  OUTPUT_SCHEMA,
  instruction,
} = require("./crm4AssessmentAssistantSchema");
const A = "professionalAssessments",
  DRAFT_VERSIONS = "professionalAssessmentDraftVersions",
  VERSIONS = "professionalAssessmentVersions",
  DOCUMENTS = "professionalAssessmentDocuments",
  DELIVERIES = "professionalAssessmentDeliveries",
  AUDIT = "professionalAssessmentAudit",
  ARTIFACTS = "crm4AssessmentAssistantArtifacts",
  USAGE = "crm4AiUsage",
  LIMITS = "crm4AssessmentAssistantUsageLimits";
// Increment only when deterministic adapter/report semantics materially change
// (for example financial, evidence, chronology, or report-content projection).
// Cosmetic-only rendering changes do not require a new generation contract.
const GENERATION_CONTRACT_VERSION = "assessment-generation-v4",
  LEGACY_GENERATION_CONTRACT_VERSION = "LEGACY_UNVERSIONED";
const FAILURE_STAGES = new Set([
  "SECRET_RESOLUTION",
  "REQUEST_BUILD",
  "NETWORK_REQUEST",
  "OPENAI_HTTP_ERROR",
  "OPENAI_RESPONSE_PARSE",
  "OUTPUT_TEXT_MISSING",
  "OUTPUT_JSON_PARSE",
  "LOCAL_SCHEMA_VALIDATION",
  "ARTIFACT_PERSISTENCE",
]);
const GENERIC_FAILURE =
  "Assessment Assistant is temporarily unavailable. No assessment was created.";
const clean = (v, n = 12000) =>
    String(v == null ? "" : v)
      .trim()
      .slice(0, n),
  hash = (v) =>
    crypto
      .createHash("sha256")
      .update(typeof v === "string" ? v : JSON.stringify(v))
      .digest("hex"),
  now = () => FieldValue.serverTimestamp();
const safe = (v, d = 0) => {
  if (d > 6) return "[DEPTH_LIMIT]";
  if (v == null || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "string") return clean(v);
  if (Array.isArray(v)) return v.slice(0, 200).map((x) => safe(x, d + 1));
  if (typeof v === "object")
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k]) => !/(secret|token|password|api.?key)/i.test(k))
        .slice(0, 250)
        .map(([k, x]) => [k, safe(x, d + 1)]),
    );
  return clean(v);
};
function fail(H, c, m) {
  throw new H(c, m);
}
function finalisationReviewMatches({ assessment, artifact, artifactId, leadId }) {
  if (
    !assessment ||
    !artifact ||
    !artifactId ||
    assessment.restricted?.assistantArtifactId !== artifactId ||
    artifact.leadId !== leadId ||
    artifact.status !== "STAFF_CONFIRMED" ||
    !["CONFIRMED_UNCHANGED", "CORRECTED"].includes(
      artifact.confirmationOutcome,
    ) ||
    (assessment.restricted?.inputStateHash &&
      artifact.inputHash &&
      assessment.restricted.inputStateHash !== artifact.inputHash)
  )
    return false;
  return (
    stableStringify(safe(assessment.confirmedExtraction)) ===
    stableStringify(safe(artifact.staffCorrections))
  );
}
function diagnosticValue(v, n = 160) {
  const x = clean(v, n);
  return /^[A-Za-z0-9_.:/\[\]-]+$/.test(x) ? x : "";
}
function diagnosticError(stage, error = {}, metadata = {}) {
  const e = new Error(stage);
  e.name = "AssessmentAssistantDiagnosticError";
  e.diagnostic = {
    failureStage: FAILURE_STAGES.has(stage) ? stage : "NETWORK_REQUEST",
    errorClass: diagnosticValue(error.name || "Error", 80) || "Error",
    upstreamHttpStatus: Number.isInteger(metadata.upstreamHttpStatus)
      ? metadata.upstreamHttpStatus
      : null,
    openaiErrorType: diagnosticValue(metadata.openaiErrorType),
    openaiErrorCode: diagnosticValue(metadata.openaiErrorCode),
    openaiErrorParam: diagnosticValue(metadata.openaiErrorParam),
    openaiRequestId: diagnosticValue(metadata.openaiRequestId, 200),
    networkErrorClass: diagnosticValue(
      metadata.networkErrorClass || error.code || error.name,
      80,
    ),
    timeout: metadata.timeout === true || error.name === "AbortError",
  };
  return e;
}
function diagnosticOf(error, stage = "NETWORK_REQUEST") {
  return error && error.diagnostic
    ? error.diagnostic
    : diagnosticError(stage, error).diagnostic;
}
function categoryFor(lead, requested) {
  const raw = clean(
    requested || lead.assessmentRoute || lead.claimType,
    100,
  ).toLowerCase();
  if (CATEGORIES[raw]) return raw;
  if (/foam/.test(raw)) return "spray-foam";
  if (/solar/.test(raw)) return "solar";
  if (/caravan|holiday.?park/.test(raw)) return "holiday-park-static-caravan";
  return "general-consumer";
}
function addressText(address) {
  return [
    address?.addressLine1,
    address?.addressLine2,
    address?.town,
    address?.county,
    address?.postcode,
    address?.country,
  ]
    .map((x) => clean(x, 200))
    .filter(Boolean)
    .join(", ");
}
function comparableAddress(value) {
  return clean(typeof value === "string" ? value : addressText(value), 1000)
    .toLowerCase()
    .replace(/[\r\n,.;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function normaliseCaseContext(raw, category, client) {
  const x = safe(raw || {}),
    same = x.sameAsClientAddress === true,
    explicitSeparate = x.explicitSeparateAddressConfirmed === true,
    clientAddress = client.address || {},
    suppliedAddress = {
      addressLine1: clean(x.address?.addressLine1, 200),
      addressLine2: clean(x.address?.addressLine2, 200),
      town: clean(x.address?.town, 120),
      county: clean(x.address?.county, 120),
      postcode: clean(x.address?.postcode, 30),
      country: clean(x.address?.country, 100),
    },
    labels = {
      "spray-foam": "Affected property address",
      solar: "Installation / property address",
      "holiday-park-static-caravan": "Park / site / pitch location",
      "general-consumer": "Case address / location (optional)",
    };
  if (
    category === "general-consumer" &&
    !same &&
    !Object.values(suppliedAddress).some(Boolean)
  )
    return {
      sameAsClientAddress: false,
      explicitSeparateAddressConfirmed: false,
      address: {},
      addressText: "",
      addressRelationship: "NOT_APPLICABLE",
      label: labels[category],
    };
  const address = same ? clientAddress : suppliedAddress,
    addressMatchesClient =
      !!comparableAddress(address) &&
      comparableAddress(address) === comparableAddress(clientAddress);
  return {
    sameAsClientAddress: same,
    explicitSeparateAddressConfirmed:
      !same && addressMatchesClient && explicitSeparate,
    address,
    addressText: addressText(address),
    addressMatchesClient,
    addressRelationship: same
      ? "SAME_AS_CLIENT"
      : addressMatchesClient && explicitSeparate
        ? "EXPLICITLY_SEPARATE_DESPITE_MATCHING_TEXT"
        : "SEPARATE",
    requiresAddressConfirmation:
      !same && addressMatchesClient && !explicitSeparate,
    label: labels[category],
  };
}
function injectAuthoritative(output, client, caseContext) {
  const ambiguities =
    caseContext.addressRelationship ===
    "EXPLICITLY_SEPARATE_DESPITE_MATCHING_TEXT"
      ? (output.ambiguities || []).filter(
          (item) =>
            !(
              /address|property|correspondence/i.test(clean(item, 1000)) &&
              /same|match|identical|contradict|clarif/i.test(clean(item, 1000))
            ),
        )
      : output.ambiguities;
  return {
    ...output,
    ambiguities,
    client: { firstName: client.firstName, lastName: client.lastName },
    contact: {
      email: client.email,
      mobile: client.mobile,
      telephone: client.telephone,
      secondaryEmail: client.secondaryEmail,
    },
    address: caseContext.addressText,
  };
}
async function actor(request, db, H, leadId, roles = ["lister"]) {
  if (!request.auth?.uid) fail(H, "unauthenticated", "Sign in to CRM4.");
  const [m, l] = await Promise.all([
    db.collection("crm4Memberships").doc(request.auth.uid).get(),
    db.collection("crm4Leads").doc(clean(leadId, 180)).get(),
  ]);
  if (
    !m.exists ||
    m.data().active !== true ||
    m.data().workspaceId !== "CRM4" ||
    !roles.includes(clean(m.data().role, 40).toLowerCase())
  )
    fail(
      H,
      "permission-denied",
      "Authorised CRM4 assessment access is required.",
    );
  if (!l.exists || l.data().workspaceId !== "CRM4")
    fail(H, "not-found", "CRM4 lead not found.");
  const lead = { id: l.id, ...l.data() },
    role = clean(m.data().role, 40).toLowerCase();
  if (role === "lister") {
    if (![lead.assignedToUid, lead.assignedUserId].includes(request.auth.uid))
      fail(
        H,
        "permission-denied",
        "This lead is not assigned to the signed-in Lister.",
      );
  } else {
    const u = await db.collection("users").doc(request.auth.uid).get(),
      caps =
        u.exists && Array.isArray(u.data().assessmentCapabilities)
          ? u.data().assessmentCapabilities
          : [];
    if (
      !caps.includes("assessmentIssuer") &&
      !caps.includes("assessmentAdministrator")
    )
      fail(H, "permission-denied", "Assessment issuer capability is required.");
  }
  return {
    uid: request.auth.uid,
    role,
    name:
      clean(m.data().displayName || m.data().name, 160) || "Quaerens Lister",
    lead,
  };
}
function deterministicCalculations(output) {
  const calculated = [],
    conflicts = [...(output.conflicts || [])];
  for (const fact of [
    ...(output.finance || []),
    ...(output.reportedFacts || []),
  ]) {
    const s = `${fact.label} ${fact.value}`;
    const m = s.match(
      /(\d+)\s*(?:payments?|instalments?)\s*[x×]\s*£?([\d,.]+)\s*(?:=|is|totals?)\s*£?([\d,.]+)/i,
    );
    if (!m) continue;
    const count = Number(m[1]),
      payment = Number(m[2].replace(/,/g, "")),
      stated = Number(m[3].replace(/,/g, "")),
      actual = Math.round(count * payment * 100) / 100;
    calculated.push({
      label: `${count} payments × £${payment}`,
      amount: actual,
      status: "CALCULATED",
      basis: "Deterministic multiplication",
    });
    if (Math.abs(actual - stated) > 0.009)
      conflicts.push(
        `Requires clarification: supplied total £${stated.toFixed(2)} differs from calculated total £${actual.toFixed(2)}.`,
      );
  }
  return {
    ...output,
    calculatedValues: [...(output.calculatedValues || []), ...calculated],
    conflicts: [...new Set(conflicts)],
  };
}
function validate(output, category, H) {
  if (!output || typeof output !== "object" || Array.isArray(output))
    fail(H, "data-loss", "Assessment extraction was invalid.");
  for (const key of OUTPUT_SCHEMA.required)
    if (!(key in output))
      fail(H, "data-loss", `Assessment extraction omitted ${key}.`);
  if (output.category !== category)
    fail(H, "data-loss", "Assessment category mismatch.");
  const allowed = new Set(CATEGORIES[category]);
  output.reportModules = (output.reportModules || []).filter((x) =>
    allowed.has(x),
  );
  return deterministicCalculations(safe(output));
}
async function callOpenAI({ apiKey, category, input, fetchImpl = fetch }) {
  if (!apiKey) throw diagnosticError("SECRET_RESOLUTION");
  let requestBody;
  try {
    requestBody = JSON.stringify({
      model: MODEL,
      store: false,
      input: [
        {
          role: "developer",
          content: [{ type: "input_text", text: instruction(category) }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: JSON.stringify(input) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "quaerens_assessment",
          strict: true,
          schema: OUTPUT_SCHEMA,
        },
      },
    });
  } catch (e) {
    throw diagnosticError("REQUEST_BUILD", e);
  }
  let response;
  try {
    response = await fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });
  } catch (e) {
    throw diagnosticError("NETWORK_REQUEST", e, {
      timeout: e.name === "AbortError",
    });
  }
  const requestId = response.headers?.get?.("x-request-id") || "";
  if (!response.ok) {
    let details = {};
    try {
      const body = await response.json();
      details = body && typeof body.error === "object" ? body.error : {};
    } catch (_e) {}
    throw diagnosticError(
      "OPENAI_HTTP_ERROR",
      {},
      {
        upstreamHttpStatus: Number(response.status),
        openaiErrorType: details.type,
        openaiErrorCode: details.code,
        openaiErrorParam: details.param,
        openaiRequestId: requestId,
      },
    );
  }
  let body;
  try {
    body = await response.json();
  } catch (e) {
    throw diagnosticError("OPENAI_RESPONSE_PARSE", e, {
      openaiRequestId: requestId,
    });
  }
  const outputText =
    body.output_text ||
    body.output
      ?.flatMap((x) => x.content || [])
      .find((x) => x.type === "output_text")?.text;
  if (!outputText)
    throw diagnosticError(
      "OUTPUT_TEXT_MISSING",
      {},
      { openaiRequestId: requestId },
    );
  let output;
  try {
    output = JSON.parse(outputText);
  } catch (e) {
    throw diagnosticError("OUTPUT_JSON_PARSE", e, {
      openaiRequestId: requestId,
    });
  }
  return {
    output,
    responseId: clean(body.id, 200),
    requestId: diagnosticValue(requestId, 200),
    usage: safe(body.usage || {}),
  };
}
async function analyseProvider({
  apiKey,
  category,
  input,
  fetchImpl = fetch,
  validateImpl = validate,
}) {
  const result = await callOpenAI({ apiKey, category, input, fetchImpl });
  try {
    result.output = validateImpl(result.output, category);
  } catch (e) {
    throw diagnosticError("LOCAL_SCHEMA_VALIDATION", e, {
      openaiRequestId: result.requestId,
    });
  }
  return result;
}
async function persistArtifact(create, record) {
  try {
    return await create(record);
  } catch (e) {
    throw diagnosticError("ARTIFACT_PERSISTENCE", e);
  }
}
function diagnosticTelemetry({ error, leadId, actorUid, inputHash }) {
  const d = diagnosticOf(error);
  return {
    operation: "assessment_extract",
    model: MODEL,
    instructionVersion: INSTRUCTION_VERSION,
    schemaVersion: SCHEMA_VERSION,
    status: "FAILED",
    leadHash: hash(leadId),
    actorUid,
    inputHash,
    failureStage: d.failureStage,
    errorClass: d.errorClass,
    upstreamHttpStatus: d.upstreamHttpStatus,
    openaiErrorType: d.openaiErrorType,
    openaiErrorCode: d.openaiErrorCode,
    openaiErrorParam: d.openaiErrorParam,
    openaiRequestId: d.openaiRequestId,
    networkErrorClass: d.networkErrorClass,
    timeout: d.timeout,
    functionRevision:
      diagnosticValue(
        process.env.K_REVISION || process.env.FUNCTION_TARGET || "unknown",
        200,
      ) || "unknown",
  };
}
function projection(assessment, version) {
  const x = assessment.confirmedExtraction || {},
    facts = [...(x.confirmedFacts || []), ...(x.reportedFacts || [])];
  return {
    report_title: "Quaerens Client Assessment Report",
    assessment_type: "PROFESSIONAL ASSESSMENT",
    reportMode: "PROFESSIONAL",
    matter_type: `${clean(x.category || assessment.category)} assessment`,
    qar_reference: assessment.qarReference,
    version,
    prepared_date: new Date().toLocaleDateString("en-GB"),
    prepared_for:
      `${x.client?.firstName || ""} ${x.client?.lastName || ""}`.trim(),
    client_information_matrix: [
      {
        field: "Client",
        information:
          `${x.client?.firstName || ""} ${x.client?.lastName || ""}`.trim(),
      },
      { field: "Address", information: x.address || "Not supplied" },
      { field: "Email", information: x.contact?.email || "Not supplied" },
      { field: "Mobile", information: x.contact?.mobile || "Not supplied" },
    ],
    important_status_note: (x.conflicts || []).join(" "),
    executive_summary: (x.preliminaryMerits || []).map(
      (i) => `${i.label}: ${i.value}`,
    ),
    preliminary_position: x.caseDirection || "Requires Manager review.",
    chronology: (x.transactions || []).map((i) => ({
      date_or_stage: i.label,
      event_or_relevance: `${i.basis}: ${i.amount == null ? "Not supplied" : `£${i.amount}`}`,
    })),
    technical_findings: {
      include: true,
      heading: "Core Factual / Technical Findings Analysis",
      intro: "Facts are classified by source and remain subject to evidence.",
      table: facts.map((i) => ({
        issue: i.label,
        current_position: i.value,
        evidence_or_clarification_needed: i.status,
      })),
    },
    financial_exposure: (x.financialItems || []).map((i) => ({
      field: i.label,
      amount: i.amount,
      basis_or_comment: `${i.status}: ${i.basis}`,
    })),
    evidence_readiness: {
      include: true,
      intro: "Evidence position at review.",
      items: (x.evidenceReadiness || []).map((i) => ({
        category: i.label,
        status: `${i.value} (${i.status})`,
      })),
    },
    evidence_required: (x.evidenceRequired || []).map((i) => ({
      priority: "TBC",
      requirement: i,
      why_it_matters: "Required to verify the reported position.",
    })),
    preliminary_assessment: {
      table: (x.preliminaryMerits || []).map((i) => ({
        assessment_factor: i.label,
        position: `${i.value} (${i.status})`,
      })),
      narrative: [...(x.risks || [])],
    },
    recommendations_next_steps: x.recommendations || [],
    information_to_confirm: [
      ...(x.ambiguities || []),
      ...(x.missingInformation || []),
    ],
    recommended_case_direction:
      x.caseDirection || "Further evidence and Manager review required.",
  };
}
async function governedProjection(
  assessment,
  version,
  { db, admin, persistComparison = false } = {},
) {
  const builder =
    assessment.category === "spray-foam"
      ? buildSprayFoamProjection
      : assessment.category === "solar"
        ? buildSolarProjection
        : null;
  if (!builder) return projection(assessment, version);
  const built = await builder({
    extraction: assessment.confirmedExtraction,
    clientProjection:
      assessment.authoritativeClient ||
      assessment.crmLink?.snapshot ||
      {
        postalAddress: assessment.clientCorrespondenceAddressText,
        address: assessment.clientCorrespondenceAddress,
      },
    qar: assessment.qarReference,
    db,
    admin,
    persistComparison,
  });
  return { ...built.report, version };
}
function deterministicAssessmentId(leadId) {
  return `ai-${hash(`CRM4|${clean(leadId, 180)}|AI_ASSISTED`).slice(0, 40)}`;
}
function semanticDraftCreationKey(leadId, confirmationId, reviewedOutputHash) {
  return hash(
    `${clean(leadId, 180)}|${clean(confirmationId, 180)}|${clean(reviewedOutputHash, 180)}`,
  );
}
function versionedDraftCreationKey(
  leadId,
  confirmationId,
  reviewedOutputHash,
  generationContractVersion = GENERATION_CONTRACT_VERSION,
) {
  return hash(
    `${clean(leadId, 180)}|${clean(confirmationId, 180)}|${clean(reviewedOutputHash, 180)}|${clean(generationContractVersion, 120)}`,
  );
}
function persistedGenerationContract(assessment) {
  return (
    clean(assessment?.generationContractVersion, 120) ||
    LEGACY_GENERATION_CONTRACT_VERSION
  );
}
function draftRevisionIdentity(assessmentId, revision, draftCreationKey) {
  return `${clean(assessmentId, 180)}-r${Number(revision || 0)}-${clean(draftCreationKey, 180).slice(0, 24)}`;
}
function bytesHash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
function validEmail(value) {
  const email = clean(value, 320).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}
function assessmentDeliverySalutation(lead) {
  const client =
      lead?.client && typeof lead.client === "object" ? lead.client : {},
    first = (...values) => {
      const value = values.find((candidate) => clean(candidate, 120));
      return clean(value, 120)
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ");
    },
    primary = first(
      lead?.firstName,
      lead?.forename,
      client.firstName,
      client.forename,
    ),
    joint = first(
      lead?.firstName2,
      lead?.jointFirstName,
      lead?.jointClientFirstName,
      lead?.secondClientFirstName,
      client.firstName2,
      client.jointFirstName,
      lead?.jointClient?.firstName,
      lead?.jointApplicant?.firstName,
      lead?.secondClient?.firstName,
      client.jointClient?.firstName,
    ),
    names = [primary, joint].filter(
      (name, index, all) =>
        name &&
        all.findIndex(
          (candidate) => candidate.toLowerCase() === name.toLowerCase(),
        ) === index,
    );
  return names.length ? `Dear ${names.join(" and ")},` : "Dear Client,";
}
function generatedIdentity(assessment) {
  if (assessment.correctedFinalIdentities) return assessment.correctedFinalIdentities;
  const key =
      clean(assessment.draftCreationKey, 180) ||
      hash(assessment.draftProjection || {}),
    suffix = hash(`${assessment.qarReference}|${key}`).slice(0, 40);
  return {
    versionId: `gen-${suffix}`,
    documentId: `doc-${suffix}`,
    deliveryId: `delivery-${suffix}`,
    finalizationKey: suffix,
  };
}
function confirmedArtifactId(leadId, sourceId, actorUid) {
  return `review-${hash(`${clean(leadId, 180)}|${clean(sourceId, 180)}|${clean(actorUid, 180)}|CONFIRMED_UNCHANGED`).slice(0, 48)}`;
}
function artifactOutput(artifact) {
  const value =
    artifact && typeof artifact === "object" && !Array.isArray(artifact)
      ? artifact.staffCorrections || artifact.originalExtraction
      : null;
  return value && typeof value === "object" && !Array.isArray(value)
    ? safe(value)
    : null;
}
function analyseResponse(id, artifact, cacheHit) {
  return {
    id: clean(id, 180),
    output: artifactOutput(artifact),
    model: clean(artifact?.model || MODEL, 120),
    instructionVersion: clean(
      artifact?.instructionVersion || INSTRUCTION_VERSION,
      120,
    ),
    schemaVersion: clean(artifact?.schemaVersion || SCHEMA_VERSION, 120),
    cacheHit: cacheHit === true,
  };
}
function artifactMillis(artifact) {
  for (const value of [artifact?.reviewedAt, artifact?.createdAt]) {
    if (value && typeof value.toMillis === "function") return value.toMillis();
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}
function latestArtifact(docs) {
  return (
    [...(docs || [])].sort(
      (a, b) =>
        artifactMillis(b.data()) - artifactMillis(a.data()) ||
        a.id.localeCompare(b.id),
    )[0] || null
  );
}
function assessmentStateProjection(assessmentSnap, artifactSnap) {
  let assessment = null;
  if (assessmentSnap?.exists) {
    const x = assessmentSnap.data();
    if (x.assessmentSource === "AI_ASSISTED")
      assessment = {
        id: assessmentSnap.id,
        status: clean(x.status, 60),
        qarReference: clean(x.qarReference, 80),
        revision: Number(x.revision || 0),
        projection: safe(x.draftProjection || null),
      };
  }
  let artifact = null;
  if (artifactSnap) {
    const x = artifactSnap.data(),
      output = artifactOutput(x);
    if (output)
      artifact = {
        id: artifactSnap.id,
        status: clean(x.status, 60),
        confirmationOutcome: clean(x.confirmationOutcome, 60) || null,
        output,
        model: clean(x.model, 120),
        instructionVersion: clean(x.instructionVersion, 120),
        schemaVersion: clean(x.schemaVersion, 120),
      };
  }
  return {
    lifecycle: assessment
      ? "DRAFT"
      : artifact?.status === "STAFF_CONFIRMED"
        ? artifact.confirmationOutcome || "STAFF_CONFIRMED"
        : artifact
          ? "AI_GENERATED"
          : "NO_EXTRACTION",
    artifact,
    assessment,
  };
}
function registerCrm2AssessmentAssistant({
  admin,
  db,
  onCall,
  HttpsError,
  openaiSecret,
  resend,
  resendSecret,
}) {
  const getState = onCall(async (r) => {
    const who = await actor(r, db, HttpsError, r.data?.leadId, [
        "lister",
        "manager",
        "administrator",
      ]),
      id = clean(who.lead.assessmentId, 180),
      [assessmentSnap, artifacts] = await Promise.all([
        id ? db.collection(A).doc(id).get() : Promise.resolve(null),
        db
          .collection(ARTIFACTS)
          .where("leadId", "==", who.lead.id)
          .limit(100)
          .get(),
      ]),
      restoration = assessmentStateProjection(
        assessmentSnap,
        latestArtifact(artifacts.docs),
      );
    return {
      leadId: who.lead.id,
      category: categoryFor(who.lead),
      client: authoritativeClient(who.lead),
      assessment: restoration.assessment,
      restoration,
    };
  });
  const updateClient = onCall(async (r) => {
    const who = await actor(r, db, HttpsError, r.data?.leadId),
      raw = safe(r.data?.client || {}),
      address = {
        addressLine1: clean(raw.address?.addressLine1, 200),
        addressLine2: clean(raw.address?.addressLine2, 200),
        town: clean(raw.address?.town, 120),
        county: clean(raw.address?.county, 120),
        postcode: clean(raw.address?.postcode, 30),
        country: clean(raw.address?.country, 100),
      },
      client = {
        firstName: clean(raw.firstName, 120),
        lastName: clean(raw.lastName, 160),
        mobile: clean(raw.mobile, 80),
        email: clean(raw.email, 320).toLowerCase(),
        postalAddress: addressText(address),
        telephone: clean(raw.telephone, 80),
        secondaryEmail: clean(raw.secondaryEmail, 320).toLowerCase(),
        address,
      };
    validateClientIdentity(client, HttpsError);
    for (const key of ["addressLine1", "town", "postcode", "country"])
      if (!address[key])
        fail(
          HttpsError,
          "failed-precondition",
          `Complete the authoritative CRM4 client field: ${key}.`,
        );
    if (
      client.secondaryEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.secondaryEmail)
    )
      fail(HttpsError, "invalid-argument", "The secondary email is invalid.");
    const event = {
      action: "assessment_client_identity_updated",
      byUid: who.uid,
      at: new Date().toISOString(),
      eventId: `assessment-client:${who.lead.id}:${hash(client).slice(0, 16)}`,
    };
    await db
      .collection("crm4Leads")
      .doc(who.lead.id)
      .set(
        {
          firstName: client.firstName,
          lastName: client.lastName,
          mobile: client.mobile,
          email: client.email,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          town: address.town,
          county: address.county,
          postcode: address.postcode,
          country: address.country,
          fullPostalAddress: client.postalAddress,
          telephone: client.telephone,
          secondaryEmail: client.secondaryEmail,
          lastUpdatedAt: now(),
          actionHistory: FieldValue.arrayUnion(event),
        },
        { merge: true },
      );
    return {
      client: {
        ...client,
        legacyPostalAddress: "",
        addressSource: "STRUCTURED_CRM4",
      },
      status: "UPDATED",
    };
  });
  const analyse = onCall(
    { secrets: [openaiSecret], timeoutSeconds: 300, memory: "1GiB" },
    async (r) => {
      const who = await actor(r, db, HttpsError, r.data?.leadId),
        category = categoryFor(who.lead, r.data?.category),
        client = authoritativeClient(who.lead),
        caseContext = normaliseCaseContext(
          r.data?.caseContext,
          category,
          client,
        ),
        rawNarrative = clean(r.data?.narrative, 50000),
        sections = safe(r.data?.sections || {});
      validateClientIdentity(client, HttpsError);
      if (caseContext.requiresAddressConfirmation)
        fail(
          HttpsError,
          "failed-precondition",
          "The case address matches the client correspondence address. Confirm whether it is the same address before analysis.",
        );
      if (!rawNarrative && !Object.values(sections).some(Boolean))
        fail(
          HttpsError,
          "invalid-argument",
          "Enter assessment notes or structured case information.",
        );
      const input = {
          category,
          authoritativeClient: client,
          caseContext,
          assessmentNotes: rawNarrative,
          structuredSections: sections,
        },
        inputHash = hash(input),
        requestKey = hash(
          `${who.lead.id}|${inputHash}|${MODEL}|${INSTRUCTION_VERSION}|${SCHEMA_VERSION}`,
        ),
        cached = await db
          .collection(ARTIFACTS)
          .where("requestKey", "==", requestKey)
          .limit(1)
          .get();
      if (!cached.empty)
        return analyseResponse(cached.docs[0].id, cached.docs[0].data(), true);
      const hour = new Date().toISOString().slice(0, 13),
        limit = db.collection(LIMITS).doc(`${who.uid}_${hour}`);
      await db.runTransaction(async (tx) => {
        const s = await tx.get(limit),
          count = Number(s.data()?.count || 0);
        if (count >= 20)
          fail(
            HttpsError,
            "resource-exhausted",
            "Assessment Assistant hourly limit reached.",
          );
        tx.set(
          limit,
          { actorUid: who.uid, hour, count: count + 1, updatedAt: now(admin) },
          { merge: true },
        );
      });
      let result, ref;
      try {
        let secret;
        try {
          secret = openaiSecret.value();
        } catch (e) {
          throw diagnosticError("SECRET_RESOLUTION", e);
        }
        result = await analyseProvider({
          apiKey: secret,
          category,
          input,
          validateImpl: (output, selectedCategory) =>
            injectAuthoritative(
              validate(output, selectedCategory, HttpsError),
              client,
              caseContext,
            ),
        });
        ref = db.collection(ARTIFACTS).doc();
        await persistArtifact((record) => ref.create(record), {
          leadId: who.lead.id,
          category,
          type: "EXTRACTION",
          status: "AI_GENERATED",
          requestKey,
          inputHash,
          rawInput: { narrative: rawNarrative, sections, caseContext },
          authoritativeClient: client,
          caseContext,
          originalExtraction: result.output,
          model: MODEL,
          instructionVersion: INSTRUCTION_VERSION,
          schemaVersion: SCHEMA_VERSION,
          providerResponseIdHash: hash(result.responseId),
          usage: result.usage,
          createdByUid: who.uid,
          createdAt: now(admin),
        });
      } catch (e) {
        const telemetry = {
          ...diagnosticTelemetry({
            error: e,
            leadId: who.lead.id,
            actorUid: who.uid,
            inputHash,
          }),
          createdAt: now(admin),
        };
        console.error(
          "CRM4_ASSESSMENT_ASSISTANT_FAILURE",
          JSON.stringify({ ...telemetry, createdAt: "SERVER_TIMESTAMP" }),
        );
        try {
          await db.collection(USAGE).add(telemetry);
        } catch (_auditError) {
          console.error(
            "CRM4_ASSESSMENT_ASSISTANT_FAILURE_AUDIT_WRITE",
            JSON.stringify({
              failureStage: telemetry.failureStage,
              functionRevision: telemetry.functionRevision,
            }),
          );
        }
        fail(HttpsError, "unavailable", GENERIC_FAILURE);
      }
      return analyseResponse(
        ref.id,
        {
          originalExtraction: result.output,
          model: MODEL,
          instructionVersion: INSTRUCTION_VERSION,
          schemaVersion: SCHEMA_VERSION,
        },
        false,
      );
    },
  );
  const confirmReview = onCall(async (r) => {
    const who = await actor(r, db, HttpsError, r.data?.leadId),
      requestedRef = db
        .collection(ARTIFACTS)
        .doc(clean(r.data?.artifactId, 180)),
      requested = await requestedRef.get(),
      submitted = safe(r.data?.reviewedExtraction);
    if (!requested.exists || requested.data().leadId !== who.lead.id)
      fail(
        HttpsError,
        "failed-precondition",
        "A current AI extraction is required before confirming review.",
      );
    if (requested.data().status === "STAFF_CONFIRMED") {
      const existing = requested.data(),
        sourceId = clean(existing.sourceArtifactId, 180),
        source = sourceId
          ? await db.collection(ARTIFACTS).doc(sourceId).get()
          : null,
        reviewed = safe(existing.staffCorrections),
        reviewedOutputHash = hash(reviewed);
      if (
        existing.type !== "STAFF_REVIEW_CONFIRMATION" ||
        existing.confirmationOutcome !== "CONFIRMED_UNCHANGED" ||
        existing.reviewedByUid !== who.uid ||
        existing.createdByUid !== who.uid ||
        existing.reviewedOutputHash !== reviewedOutputHash ||
        hash(submitted) !== reviewedOutputHash ||
        !source?.exists ||
        source.data().status !== "AI_GENERATED" ||
        source.data().leadId !== who.lead.id ||
        confirmedArtifactId(who.lead.id, source.id, who.uid) !== requested.id
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The governed review confirmation does not match the current reviewed extraction.",
        );
      return {
        id: requested.id,
        output: reviewed,
        status: "STAFF_CONFIRMED",
        confirmationOutcome: "CONFIRMED_UNCHANGED",
        idempotent: true,
        reused: true,
      };
    }
    if (requested.data().status !== "AI_GENERATED")
      fail(
        HttpsError,
        "failed-precondition",
        "A current AI extraction is required before confirming review.",
      );
    const source = requested,
      original = safe(source.data().originalExtraction);
    if (hash(submitted) !== hash(original))
      fail(
        HttpsError,
        "failed-precondition",
        "The reviewed extraction has changed. Save it as a correction before continuing.",
      );
    validate(safe(original), source.data().category, HttpsError);
    const client =
        source.data().authoritativeClient || authoritativeClient(who.lead),
      caseContext =
        source.data().caseContext ||
        normaliseCaseContext({}, source.data().category, client),
      reviewed = injectAuthoritative(original, client, caseContext),
      ref = db
        .collection(ARTIFACTS)
        .doc(confirmedArtifactId(who.lead.id, source.id, who.uid)),
      reviewedOutputHash = hash(reviewed),
      idempotent = await db.runTransaction(async (tx) => {
        const existing = await tx.get(ref);
        if (existing.exists) {
          const x = existing.data();
          if (
            x.leadId !== who.lead.id ||
            x.sourceArtifactId !== source.id ||
            x.status !== "STAFF_CONFIRMED" ||
            x.confirmationOutcome !== "CONFIRMED_UNCHANGED" ||
            x.reviewedByUid !== who.uid ||
            x.createdByUid !== who.uid ||
            x.reviewedOutputHash !== reviewedOutputHash ||
            hash(safe(x.staffCorrections)) !== reviewedOutputHash
          )
            fail(
              HttpsError,
              "already-exists",
              "The governed review confirmation identity conflicts with an existing record.",
            );
          return true;
        }
        tx.create(ref, {
          leadId: who.lead.id,
          category: source.data().category,
          type: "STAFF_REVIEW_CONFIRMATION",
          status: "STAFF_CONFIRMED",
          confirmationOutcome: "CONFIRMED_UNCHANGED",
          sourceArtifactId: source.id,
          rawInput: source.data().rawInput || {},
          authoritativeClient: client,
          caseContext,
          originalExtraction: source.data().originalExtraction,
          staffCorrections: reviewed,
          inputHash: clean(source.data().inputHash, 180),
          reviewedOutputHash,
          model: clean(source.data().model, 120),
          instructionVersion: clean(source.data().instructionVersion, 120),
          schemaVersion: clean(source.data().schemaVersion, 120),
          reviewedByUid: who.uid,
          createdByUid: who.uid,
          reviewedAt: now(admin),
          createdAt: now(admin),
        });
        return false;
      });
    return {
      id: ref.id,
      output: reviewed,
      status: "STAFF_CONFIRMED",
      confirmationOutcome: "CONFIRMED_UNCHANGED",
      idempotent,
      reused: idempotent,
    };
  });
  const save = onCall(async (r) => {
    const who = await actor(r, db, HttpsError, r.data?.leadId),
      source = await db
        .collection(ARTIFACTS)
        .doc(clean(r.data?.artifactId, 180))
        .get();
    if (
      !source.exists ||
      source.data().leadId !== who.lead.id ||
      !["AI_GENERATED", "STAFF_CONFIRMED"].includes(source.data().status)
    )
      fail(HttpsError, "not-found", "Current assessment extraction not found.");
    const supplied = safe(r.data?.correctedExtraction),
      reviewedBase = safe(
        source.data().staffCorrections || source.data().originalExtraction,
      );
    if (hash(supplied) === hash(reviewedBase))
      fail(
        HttpsError,
        "failed-precondition",
        "No corrections were detected. Use Confirm Review & Continue when the extraction is correct.",
      );
    const corrected = injectAuthoritative(
        validate(supplied, source.data().category, HttpsError),
        source.data().authoritativeClient || authoritativeClient(who.lead),
        source.data().caseContext ||
          normaliseCaseContext(
            {},
            source.data().category,
            authoritativeClient(who.lead),
          ),
      ),
      ref = db.collection(ARTIFACTS).doc();
    await ref.create({
      leadId: who.lead.id,
      category: source.data().category,
      type: "STAFF_CORRECTION",
      status: "STAFF_CONFIRMED",
      confirmationOutcome: "CORRECTED",
      sourceArtifactId: source.id,
      rawInput: source.data().rawInput,
      authoritativeClient:
        source.data().authoritativeClient || authoritativeClient(who.lead),
      caseContext: source.data().caseContext || {},
      originalExtraction: source.data().originalExtraction,
      staffCorrections: corrected,
      inputHash: source.data().inputHash,
      reviewedOutputHash: hash(corrected),
      model: source.data().model,
      instructionVersion: source.data().instructionVersion,
      schemaVersion: source.data().schemaVersion,
      reviewedByUid: who.uid,
      createdByUid: who.uid,
      reviewedAt: now(admin),
      createdAt: now(admin),
    });
    return {
      id: ref.id,
      output: corrected,
      status: "STAFF_CONFIRMED",
      confirmationOutcome: "CORRECTED",
    };
  });
  const draft = onCall(async (r) => {
    const who = await actor(r, db, HttpsError, r.data?.leadId),
      identity = authoritativeClient(who.lead);
    validateClientIdentity(identity, HttpsError);
    const source = await db
      .collection(ARTIFACTS)
      .doc(clean(r.data?.artifactId, 180))
      .get();
    if (
      !source.exists ||
      source.data().leadId !== who.lead.id ||
      source.data().status !== "STAFF_CONFIRMED" ||
      !["CONFIRMED_UNCHANGED", "CORRECTED"].includes(
        source.data().confirmationOutcome,
      )
    )
      fail(
        HttpsError,
        "failed-precondition",
        "Confirm the Lister review before generating a draft.",
      );
    const assessmentId =
        clean(who.lead.assessmentId, 180) ||
        deterministicAssessmentId(who.lead.id),
      ref = db.collection(A).doc(assessmentId),
      preExisting = await ref.get();
    if (
      preExisting.exists &&
      preExisting.data().assessmentSource !== "AI_ASSISTED"
    )
      fail(
        HttpsError,
        "already-exists",
        "This lead already has another governed assessment.",
      );
    const qar = preExisting.exists
        ? preExisting.data().qarReference
        : await allocateQar({
            db,
            assessmentId,
            leadId: who.lead.id,
            serverTimestamp: () => now(admin),
          }),
      caseContext = source.data().caseContext || {},
      confirmed = {
        ...source.data().staffCorrections,
        client: { firstName: identity.firstName, lastName: identity.lastName },
        address: clean(caseContext.addressText, 1000),
        contact: {
          ...(source.data().staffCorrections.contact || {}),
          email: identity.email,
          mobile: identity.mobile,
          telephone: identity.telephone,
          secondaryEmail: identity.secondaryEmail,
        },
      },
      projectionValue = await governedProjection(
        {
          qarReference: qar,
          category: source.data().category,
          confirmedExtraction: confirmed,
          authoritativeClient: identity,
        },
        1,
        { db, admin, persistComparison: false },
      ),
      reviewedOutputHash =
        source.data().reviewedOutputHash || hash(confirmed),
      legacyDraftCreationKey = semanticDraftCreationKey(
        who.lead.id,
        source.id,
        reviewedOutputHash,
      ),
      draftCreationKey = versionedDraftCreationKey(
        who.lead.id,
        source.id,
        reviewedOutputHash,
      ),
      auditRef = db
        .collection(AUDIT)
        .doc(`draft-${assessmentId}-${draftCreationKey.slice(0, 32)}`),
      leadRef = db.collection("crm4Leads").doc(who.lead.id),
      reservationRef = db.collection(QAR_RESERVATIONS).doc(assessmentId);
    return db.runTransaction(async (tx) => {
      const [freshLead, current, audit, reservation] = await Promise.all([
        tx.get(leadRef),
        tx.get(ref),
        tx.get(auditRef),
        tx.get(reservationRef),
      ]);
      if (
        !freshLead.exists ||
        freshLead.data().workspaceId !== "CRM4" ||
        ![
          freshLead.data().assignedToUid,
          freshLead.data().assignedUserId,
        ].includes(who.uid)
      )
        fail(
          HttpsError,
          "permission-denied",
          "This lead is no longer assigned to the signed-in Lister.",
        );
      if (
        freshLead.data().assessmentId &&
        freshLead.data().assessmentId !== assessmentId
      )
        fail(
          HttpsError,
          "already-exists",
          "This lead already has another governed assessment.",
        );
      if (current.exists && current.data().assessmentSource !== "AI_ASSISTED")
        fail(
          HttpsError,
          "already-exists",
          "This lead already has another governed assessment.",
        );
      if (
        current.exists &&
        current.data().restricted?.assistantArtifactId === source.id &&
        [legacyDraftCreationKey, draftCreationKey].includes(
          current.data().draftCreationKey,
        )
      )
        return {
          assessmentId,
          qarReference: current.data().qarReference,
          status: current.data().status,
          projection: current.data().draftProjection,
          idempotent: true,
        };
      if (current.exists && current.data().status !== "DRAFT")
        fail(
          HttpsError,
          "failed-precondition",
          "The assessment can no longer be regenerated from Lister review.",
        );
      if (
        reservation.exists &&
        (reservation.data().assessmentId !== assessmentId ||
          reservation.data().qarReference !== qar ||
          (reservation.data().leadId &&
            reservation.data().leadId !== who.lead.id))
      )
        fail(
          HttpsError,
          "failed-precondition",
          "Assessment/QAR reservation verification failed.",
        );
      const revision = Number(current.data()?.revision || 0) + 1,
        record = {
          qarReference: qar,
          assessmentSource: "AI_ASSISTED",
          frameworkVersion: "UNIVERSAL-ASSESSMENT-v1",
          category: source.data().category,
          categoryVersion: "AI-ASSISTED-v1",
          generationContractVersion: GENERATION_CONTRACT_VERSION,
          status: "DRAFT",
          revision,
          currentVersion: Number(current.data()?.currentVersion || 0),
          crmLink: {
            workspaceId: "CRM4",
            sourceCollection: "crm4Leads",
            caseRef: who.lead.id,
            clientRef: who.lead.id,
            snapshot: identity,
          },
          clientCorrespondenceAddress: identity.address,
          clientCorrespondenceAddressText: identity.postalAddress,
          caseContext,
          authorUid: who.uid,
          rawListerInput:
            source.data().rawInput || source.data().originalExtraction,
          originalAiExtraction: source.data().originalExtraction,
          staffCorrections: source.data().staffCorrections,
          confirmedExtraction: confirmed,
          structuredIntake: confirmed,
          chronology: [],
          evidence: [],
          financialExposure: confirmed.financialItems || [],
          findings: [],
          evidenceReadiness: {
            score: 0,
            explanation: "Subject to Manager review.",
          },
          clientContent: {
            executiveSummary:
              "AI-assisted structured draft awaiting Manager review.",
            background: "",
            preliminaryAssessment: confirmed.caseDirection,
            recommendations: (confirmed.recommendations || []).join(" "),
            recommendedCaseDirection: confirmed.caseDirection,
            limitations:
              "Prepared from supplied information and subject to evidence.",
          },
          restricted: {
            assistantArtifactId: source.id,
            confirmationOutcome: source.data().confirmationOutcome,
            model: source.data().model,
            instructionVersion: source.data().instructionVersion,
            schemaVersion: source.data().schemaVersion,
            inputStateHash: source.data().inputHash || "",
            calculations: confirmed.calculatedValues || [],
            ambiguities: confirmed.ambiguities || [],
            missingInformation: confirmed.missingInformation || [],
            staffEditHistory: [{ artifactId: source.id, actorUid: who.uid }],
          },
          draftCreationKey,
          draftProjection: { ...projectionValue, version: revision },
          updatedAt: now(admin),
        };
      if (current.exists) tx.set(ref, record, { merge: true });
      else tx.create(ref, { ...record, createdAt: now(admin) });
      tx.set(
        leadRef,
        {
          assessmentId,
          assessmentQar: qar,
          assessmentSource: "AI_ASSISTED",
          assessmentRoute: source.data().category,
          assessmentStatus: "DRAFT",
          lastUpdatedAt: now(admin),
        },
        { merge: true },
      );
      tx.set(
        reservationRef,
        {
          assessmentId,
          qarReference: qar,
          leadId: who.lead.id,
          state: "DRAFT_CREATED",
          draftCreationKey,
          draftCreatedAt: now(admin),
          immutableIdentity: true,
        },
        { merge: true },
      );
      if (!audit.exists)
        tx.create(auditRef, {
          assessmentId,
          event: "AI_ASSISTED_DRAFT_GENERATED",
          actorUid: who.uid,
          metadata: {
            leadId: who.lead.id,
            artifactId: source.id,
            inputHash: source.data().inputHash || "",
            draftCreationKey,
          },
          createdAt: now(admin),
        });
      return {
        assessmentId,
        qarReference: qar,
        status: "DRAFT",
        projection: record.draftProjection,
        idempotent: false,
      };
    });
  });
  const reprojectDraft = onCall(async (r) => {
    const who = await actor(
        r,
        db,
        HttpsError,
        r.data?.leadId,
        ["manager", "administrator"],
      ),
      assessmentId = clean(who.lead.assessmentId, 180),
      assessmentRef = assessmentId ? db.collection(A).doc(assessmentId) : null;
    if (!assessmentRef)
      fail(
        HttpsError,
        "failed-precondition",
        "An existing governed draft is required for reprojection.",
      );
    const initial = await assessmentRef.get();
    if (!initial.exists)
      fail(HttpsError, "not-found", "The linked assessment was not found.");
    const initialAssessment = initial.data(),
      confirmationId = clean(
        initialAssessment.restricted?.assistantArtifactId,
        180,
      ),
      confirmationRef = confirmationId
        ? db.collection(ARTIFACTS).doc(confirmationId)
        : null,
      confirmation = confirmationRef ? await confirmationRef.get() : null;
    if (
      initialAssessment.assessmentSource !== "AI_ASSISTED" ||
      initialAssessment.status !== "DRAFT" ||
      initialAssessment.crmLink?.workspaceId !== "CRM4" ||
      initialAssessment.crmLink?.caseRef !== who.lead.id ||
      initialAssessment.qarReference !== who.lead.assessmentQar ||
      !confirmation?.exists ||
      !finalisationReviewMatches({
        assessment: initialAssessment,
        artifact: confirmation.data(),
        artifactId: confirmation.id,
        leadId: who.lead.id,
      }) ||
      !confirmation.data().inputHash ||
      initialAssessment.restricted?.inputStateHash !==
        confirmation.data().inputHash ||
      confirmation.data().reviewedOutputHash !==
        hash(safe(confirmation.data().staffCorrections))
    )
      fail(
        HttpsError,
        "failed-precondition",
        "The current draft does not match the latest governed confirmed review.",
      );
    const artifactQuery = db
        .collection(ARTIFACTS)
        .where("leadId", "==", who.lead.id)
        .limit(100),
      artifacts = await artifactQuery.get(),
      latest = latestArtifact(artifacts.docs);
    if (!latest || latest.id !== confirmation.id)
      fail(
        HttpsError,
        "failed-precondition",
        "A newer extraction or review state must be confirmed before reprojection.",
      );
    const reviewedOutputHash = confirmation.data().reviewedOutputHash,
      nextCreationKey = versionedDraftCreationKey(
        who.lead.id,
        confirmation.id,
        reviewedOutputHash,
      ),
      previousGenerationContractVersion = persistedGenerationContract(
        initialAssessment,
      );
    if (
      previousGenerationContractVersion === GENERATION_CONTRACT_VERSION &&
      initialAssessment.draftCreationKey === nextCreationKey
    )
      return {
        result: "ALREADY_CURRENT",
        assessmentId,
        qarReference: initialAssessment.qarReference,
        revision: Number(initialAssessment.revision || 0),
        generationContractVersion: GENERATION_CONTRACT_VERSION,
        idempotent: true,
      };
    const nextRevision = Number(initialAssessment.revision || 0) + 1,
      projectionValue = await governedProjection(
        {
          qarReference: initialAssessment.qarReference,
          category: initialAssessment.category,
          confirmedExtraction: initialAssessment.confirmedExtraction,
          authoritativeClient: initialAssessment.crmLink?.snapshot,
        },
        nextRevision,
        { db, admin, persistComparison: false },
      ),
      leadRef = db.collection("crm4Leads").doc(who.lead.id),
      reservationRef = db.collection(QAR_RESERVATIONS).doc(assessmentId),
      previousRevisionRef = db
        .collection(DRAFT_VERSIONS)
        .doc(
          draftRevisionIdentity(
            assessmentId,
            initialAssessment.revision,
            initialAssessment.draftCreationKey,
          ),
        ),
      nextRevisionRef = db
        .collection(DRAFT_VERSIONS)
        .doc(draftRevisionIdentity(assessmentId, nextRevision, nextCreationKey)),
      auditRef = db
        .collection(AUDIT)
        .doc(`reproject-${assessmentId}-${nextCreationKey.slice(0, 32)}`);
    return db.runTransaction(async (tx) => {
      const [
        freshLead,
        current,
        freshConfirmation,
        freshArtifacts,
        reservation,
        previousRevisionSnapshot,
        nextRevisionSnapshot,
        auditSnapshot,
      ] = await Promise.all([
        tx.get(leadRef),
        tx.get(assessmentRef),
        tx.get(confirmationRef),
        tx.get(artifactQuery),
        tx.get(reservationRef),
        tx.get(previousRevisionRef),
        tx.get(nextRevisionRef),
        tx.get(auditRef),
      ]);
      if (
        !freshLead.exists ||
        freshLead.data().workspaceId !== "CRM4" ||
        freshLead.data().assessmentId !== assessmentId ||
        freshLead.data().assessmentQar !== initialAssessment.qarReference
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The CRM4 lead-to-assessment identity changed before reprojection.",
        );
      if (!current.exists || !freshConfirmation.exists)
        fail(
          HttpsError,
          "failed-precondition",
          "The governed draft or confirmation is no longer available.",
        );
      const assessment = current.data(),
        artifact = freshConfirmation.data(),
        newest = latestArtifact(freshArtifacts.docs);
      if (
        assessment.assessmentSource !== "AI_ASSISTED" ||
        assessment.status !== "DRAFT" ||
        assessment.qarReference !== initialAssessment.qarReference ||
        assessment.restricted?.assistantArtifactId !== confirmation.id ||
        !newest ||
        newest.id !== confirmation.id ||
        artifact.inputHash !== assessment.restricted?.inputStateHash ||
        artifact.reviewedOutputHash !== reviewedOutputHash ||
        artifact.reviewedOutputHash !== hash(safe(artifact.staffCorrections)) ||
        !finalisationReviewMatches({
          assessment,
          artifact,
          artifactId: confirmation.id,
          leadId: who.lead.id,
        })
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The confirmed semantic state changed before reprojection.",
        );
      if (
        persistedGenerationContract(assessment) ===
          GENERATION_CONTRACT_VERSION &&
        assessment.draftCreationKey === nextCreationKey
      )
        return {
          result: "ALREADY_CURRENT",
          assessmentId,
          qarReference: assessment.qarReference,
          revision: Number(assessment.revision || 0),
          generationContractVersion: GENERATION_CONTRACT_VERSION,
          idempotent: true,
        };
      if (
        Number(assessment.revision || 0) !==
          Number(initialAssessment.revision || 0) ||
        assessment.draftCreationKey !== initialAssessment.draftCreationKey
      )
        fail(
          HttpsError,
          "aborted",
          "The draft revision changed. Reload before reprojection.",
        );
      if (
        !reservation.exists ||
        reservation.data().assessmentId !== assessmentId ||
        reservation.data().qarReference !== assessment.qarReference ||
        (reservation.data().leadId &&
          reservation.data().leadId !== who.lead.id)
      )
        fail(
          HttpsError,
          "failed-precondition",
          "Assessment/QAR reservation verification failed.",
        );
      const previousVersion = persistedGenerationContract(assessment),
        previousRecord = {
          assessmentId,
          qarReference: assessment.qarReference,
          revision: Number(assessment.revision || 0),
          confirmationId: confirmation.id,
          reviewedOutputHash,
          draftCreationKey: assessment.draftCreationKey,
          generationContractVersion: previousVersion,
          draftProjection: assessment.draftProjection,
          immutable: true,
          preservedAt: now(admin),
        },
        nextRecord = {
          assessmentId,
          qarReference: assessment.qarReference,
          revision: nextRevision,
          confirmationId: confirmation.id,
          reviewedOutputHash,
          draftCreationKey: nextCreationKey,
          generationContractVersion: GENERATION_CONTRACT_VERSION,
          draftProjection: { ...projectionValue, version: nextRevision },
          immutable: true,
          createdByUid: who.uid,
          createdAt: now(admin),
        };
      if (!previousRevisionSnapshot.exists)
        tx.create(previousRevisionRef, previousRecord);
      if (!nextRevisionSnapshot.exists) tx.create(nextRevisionRef, nextRecord);
      tx.update(assessmentRef, {
        revision: nextRevision,
        draftCreationKey: nextCreationKey,
        generationContractVersion: GENERATION_CONTRACT_VERSION,
        draftProjection: nextRecord.draftProjection,
        updatedAt: now(admin),
      });
      tx.set(
        reservationRef,
        {
          state: "DRAFT_REPROJECTED",
          draftCreationKey: nextCreationKey,
          generationContractVersion: GENERATION_CONTRACT_VERSION,
          draftRevision: nextRevision,
          draftReprojectedAt: now(admin),
        },
        { merge: true },
      );
      tx.set(
        leadRef,
        {
          assessmentStatus: "DRAFT",
          lastUpdatedAt: now(admin),
        },
        { merge: true },
      );
      if (!auditSnapshot.exists)
        tx.create(auditRef, {
          assessmentId,
          event: "ASSESSMENT_DRAFT_REPROJECTED",
          actorUid: who.uid,
          actorRole: who.role,
          metadata: {
            qarReference: assessment.qarReference,
            confirmationId: confirmation.id,
            previousRevision: Number(assessment.revision || 0),
            newRevision: nextRevision,
            previousGenerationContractVersion: previousVersion,
            newGenerationContractVersion: GENERATION_CONTRACT_VERSION,
          },
          createdAt: now(admin),
        });
      return {
        result: "REPROJECTED",
        assessmentId,
        qarReference: assessment.qarReference,
        revision: nextRevision,
        generationContractVersion: GENERATION_CONTRACT_VERSION,
        confirmationId: confirmation.id,
        reviewedOutputHash,
        idempotent: false,
      };
    });
  });
  async function linkedDraft(request) {
    const who = await actor(request, db, HttpsError, request.data?.leadId),
      assessmentId = clean(who.lead.assessmentId, 180),
      snap = assessmentId
        ? await db.collection(A).doc(assessmentId).get()
        : null;
    if (!snap?.exists)
      fail(
        HttpsError,
        "not-found",
        "The linked AI-assisted draft was not found.",
      );
    const assessment = { id: snap.id, ...snap.data() };
    if (
      assessment.assessmentSource !== "AI_ASSISTED" ||
      assessment.crmLink?.workspaceId !== "CRM4" ||
      assessment.crmLink?.caseRef !== who.lead.id ||
      assessment.qarReference !== who.lead.assessmentQar
    )
      fail(
        HttpsError,
        "permission-denied",
        "Assessment-to-lead linkage could not be verified.",
      );
    if (!assessment.draftProjection || !assessment.qarReference)
      fail(
        HttpsError,
        "failed-precondition",
        "The authoritative draft projection is unavailable.",
      );
    return { who, assessment };
  }
  const previewDraft = onCall(
    { timeoutSeconds: 120, memory: "512MiB" },
    async (r) => {
      const { assessment } = await linkedDraft(r);
      if (assessment.status !== "DRAFT")
        fail(
          HttpsError,
          "failed-precondition",
          "Only the current draft can be previewed.",
        );
      const projectionValue = safe(await governedProjection(
          assessment,
          Number(assessment.revision || 1),
          { db, admin, persistComparison: false },
        )),
        pdf = await pdfBuffer(projectionValue, { draftPreview: true });
      return {
        assessmentId: assessment.id,
        qarReference: assessment.qarReference,
        filename: `${assessment.qarReference}-DRAFT-Assessment-Report.pdf`,
        content: pdf.toString("base64"),
        contentType: "application/pdf",
        draft: true,
        persisted: false,
      };
    },
  );
  async function sendGeneratedTarget({
    assessment,
    version,
    document,
    target,
    attempt,
  }) {
    const [pdf] = await admin
      .storage()
      .bucket()
      .file(document.pdfPath)
      .download();
    if (bytesHash(pdf) !== document.pdfHash)
      fail(HttpsError, "data-loss", "Stored report hash verification failed.");
    const client = target === "client",
      recipient = client
        ? validEmail(assessment.crmLink?.snapshot?.email)
        : validEmail(process.env.ASSESSMENT_REPORT_ARCHIVE_EMAIL);
    if (!recipient)
      fail(
        HttpsError,
        "failed-precondition",
        client
          ? "The authoritative CRM4 client email is unavailable."
          : "Assessment report archive email is not configured.",
      );
    let salutation = "";
    if (client) {
      const leadId = clean(assessment.crmLink?.caseRef, 180);
      if (
        assessment.crmLink?.workspaceId !== "CRM4" ||
        assessment.crmLink?.sourceCollection !== "crm4Leads" ||
        !leadId
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The authoritative CRM4 client linkage is unavailable.",
        );
      const leadSnapshot = await db.collection("crm4Leads").doc(leadId).get();
      if (!leadSnapshot.exists || leadSnapshot.data()?.workspaceId !== "CRM4")
        fail(
          HttpsError,
          "failed-precondition",
          "The authoritative CRM4 client record is unavailable.",
        );
      salutation = assessmentDeliverySalutation(leadSnapshot.data());
    }
    const brochure = client ? verifiedInformationBrochure(HttpsError) : null,
      body = client
        ? `${salutation}\n\nPlease find attached your Quaerens Preliminary Assessment Report.\n\nReference: ${assessment.qarReference}\n\nThe report has been prepared from the information reviewed and confirmed during your assessment. It identifies the current evidence position and possible next steps. It does not guarantee an outcome.\n\nWe recommend that you read the report carefully, particularly the sections covering evidence required and recommended next steps.\n\nIf you have any questions or would like to discuss the assessment and the options available to you, please contact us using the details below.\n\nKind regards,\n\nQuaerens`
        : `New AI-assisted Quaerens Preliminary Assessment\n\nReference: ${assessment.qarReference}\nClient: ${clean(assessment.crmLink?.snapshot?.firstName, 120)} ${clean(assessment.crmLink?.snapshot?.lastName, 160)}\nClient email: ${validEmail(assessment.crmLink?.snapshot?.email)}\nStored PDF hash: ${document.pdfHash}`,
      content = client ? renderCrm2CorporateEmail(body) : null,
      payload = {
        from: "Quaerens Assessment Reports <client@quaerens.co.uk>",
        to: recipient,
        subject: client
          ? `Your Quaerens Preliminary Assessment Report — ${assessment.qarReference}`
          : `NEW PRELIMINARY ASSESSMENT — ${assessment.qarReference}`,
        text: content?.text || body,
        ...(content ? { html: content.html } : {}),
        attachments: [
          {
            filename: `${assessment.qarReference}-Preliminary-Assessment.pdf`,
            content: pdf.toString("base64"),
          },
          ...(brochure
            ? [
                {
                  filename: INFORMATION_BROCHURE.filename,
                  content: brochure.toString("base64"),
                },
              ]
            : []),
        ],
        tags: [{ name: "type", value: `framework_b_preliminary_${target}` }],
      };
    const result =
      process.env.FUNCTIONS_EMULATOR === "true"
        ? { data: { id: `emulator-${target}-${assessment.qarReference}` } }
        : await resend.emails.send(payload, {
            idempotencyKey: `ai-assessment-${assessment.id}-${version.id}-${target}-${document.pdfHash}`,
          });
    if (result?.error) throw result.error;
    return {
      status: "SENT",
      attempt,
      providerMessageId: clean(result?.data?.id || result?.id, 200),
      sentAt: now(admin),
      brochure: brochure
        ? {
            id: INFORMATION_BROCHURE.id,
            version: INFORMATION_BROCHURE.version,
            filename: INFORMATION_BROCHURE.filename,
            sha256: INFORMATION_BROCHURE.sha256,
          }
        : null,
    };
  }
  async function deliverGeneratedTarget({
    assessment,
    version,
    document,
    deliveryRef,
    target,
    retryFailed = false,
  }) {
    let attempt = 0,
      skip = null;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(deliveryRef),
        delivery = snap.exists ? snap.data() : {};
      if (delivery[target]?.status === "SENT") {
        skip = delivery[target];
        return;
      }
      if (retryFailed && delivery[target]?.status !== "FAILED")
        fail(
          HttpsError,
          "failed-precondition",
          "Only failed delivery targets may be retried.",
        );
      attempt = Number(delivery[target]?.attempt || 0) + 1;
      tx.set(
        deliveryRef,
        {
          [target]: { status: "SENDING", attempt, startedAt: now(admin) },
          updatedAt: now(admin),
        },
        { merge: true },
      );
    });
    if (skip) return skip;
    try {
      const sent = await sendGeneratedTarget({
        assessment,
        version,
        document,
        target,
        attempt,
      });
      await deliveryRef.set(
        { [target]: sent, updatedAt: now(admin) },
        { merge: true },
      );
      return sent;
    } catch (error) {
      const failed = {
        status: "FAILED",
        attempt,
        error: clean(error?.message || "Delivery failed.", 1000),
        failedAt: now(admin),
      };
      await deliveryRef.set(
        { [target]: failed, updatedAt: now(admin) },
        { merge: true },
      );
      return failed;
    }
  }
  const finalise = onCall(
    {
      secrets: [resendSecret].filter(Boolean),
      timeoutSeconds: 300,
      memory: "1GiB",
    },
    async (r) => {
      const { who, assessment } = await linkedDraft(r),
        artifactId = clean(assessment.restricted?.assistantArtifactId, 180),
        artifact = artifactId
          ? await db.collection(ARTIFACTS).doc(artifactId).get()
          : null;
      if (assessment.activeCorrectionId || assessment.correctedFinalIdentities)
        fail(HttpsError, "failed-precondition", "Use the governed correction lifecycle for this assessment.");
      if (
        assessment.generationContractVersion &&
        assessment.generationContractVersion !== GENERATION_CONTRACT_VERSION
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The current deterministic draft must be reprojected before finalisation.",
        );
      if (
        !artifact?.exists ||
        !finalisationReviewMatches({
          assessment,
          artifact: artifact.data(),
          artifactId,
          leadId: who.lead.id,
        })
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The governed confirmed Lister review no longer matches this draft.",
        );
      if (
        assessment.generationContractVersion &&
        assessment.draftCreationKey !==
          versionedDraftCreationKey(
            who.lead.id,
            artifact.id,
            artifact.data().reviewedOutputHash,
            assessment.generationContractVersion,
          )
      )
        fail(
          HttpsError,
          "failed-precondition",
          "The current deterministic draft identity is invalid and must be reprojected before finalisation.",
        );
      if (!["DRAFT", "GENERATED"].includes(assessment.status))
        fail(
          HttpsError,
          "failed-precondition",
          "This assessment cannot use the ordinary Lister finalisation route.",
        );
      const ids = generatedIdentity(assessment),
        versionRef = db.collection(VERSIONS).doc(ids.versionId),
        documentRef = db.collection(DOCUMENTS).doc(ids.documentId),
        deliveryRef = db.collection(DELIVERIES).doc(ids.deliveryId),
        leadRef = db.collection("crm4Leads").doc(who.lead.id),
        projectionValue = safe(await governedProjection(assessment, 1, { db, admin, persistComparison: false }));
      let versionSnap = await versionRef.get(),
        documentSnap = await documentRef.get();
      if (!versionSnap.exists || !documentSnap.exists) {
        const [pdf, docx] = await Promise.all([
            pdfBuffer(projectionValue),
            docxBuffer(projectionValue),
          ]),
          pdfHash = bytesHash(pdf),
          docxHash = bytesHash(docx),
          base = `professional-assessments/${assessment.id}/versions/${ids.versionId}`,
          pdfPath = `${base}/report.pdf`,
          docxPath = `${base}/internal.docx`;
        await Promise.all([
          admin
            .storage()
            .bucket()
            .file(pdfPath)
            .save(pdf, {
              contentType: "application/pdf",
              resumable: false,
              metadata: {
                cacheControl: "private,no-store",
                metadata: {
                  assessmentId: assessment.id,
                  versionId: ids.versionId,
                  qarReference: assessment.qarReference,
                  reportMode: "PRELIMINARY",
                },
              },
            }),
          admin
            .storage()
            .bucket()
            .file(docxPath)
            .save(docx, {
              contentType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              resumable: false,
              metadata: {
                cacheControl: "private,no-store",
                metadata: {
                  assessmentId: assessment.id,
                  versionId: ids.versionId,
                  qarReference: assessment.qarReference,
                  reportMode: "PRELIMINARY",
                  internalOnly: "true",
                },
              },
            }),
        ]);
        await db.runTransaction(async (tx) => {
          const [v, d, freshLead] = await Promise.all([
            tx.get(versionRef),
            tx.get(documentRef),
            tx.get(leadRef),
          ]);
          if (
            !freshLead.exists ||
            freshLead.data().assessmentId !== assessment.id ||
            ![
              freshLead.data().assignedToUid,
              freshLead.data().assignedUserId,
            ].includes(who.uid)
          )
            fail(
              HttpsError,
              "permission-denied",
              "The authoritative CRM4 assignment changed.",
            );
          if (!v.exists)
            tx.create(versionRef, {
              assessmentId: assessment.id,
              assessmentSource: "AI_ASSISTED",
              qarReference: assessment.qarReference,
              version: 1,
              status: "GENERATED",
              reportMode: "PRELIMINARY",
              projection: projectionValue,
              projectionHash: hash(projectionValue),
              templateVersion: TEMPLATE.version,
              contentModelHash: hash(contentModel(projectionValue)),
              immutable: true,
              createdAt: now(admin),
            });
          if (!d.exists)
            tx.create(documentRef, {
              assessmentId: assessment.id,
              assessmentSource: "AI_ASSISTED",
              versionId: ids.versionId,
              version: 1,
              qarReference: assessment.qarReference,
              reportMode: "PRELIMINARY",
              pdfPath,
              docxPath,
              pdfHash,
              docxHash,
              pdfSize: pdf.length,
              docxSize: docx.length,
              templateVersion: TEMPLATE.version,
              contentModelHash: hash(contentModel(projectionValue)),
              internalDocx: true,
              immutable: true,
              generatedAt: now(admin),
            });
          tx.set(
            db.collection(A).doc(assessment.id),
            {
              status: "GENERATED",
              currentVersion: 1,
              currentVersionId: ids.versionId,
              generatedDocumentId: ids.documentId,
              finalizationKey: ids.finalizationKey,
              updatedAt: now(admin),
            },
            { merge: true },
          );
        });
        versionSnap = await versionRef.get();
        documentSnap = await documentRef.get();
      }
      const version = { id: versionSnap.id, ...versionSnap.data() },
        document = { id: documentSnap.id, ...documentSnap.data() };
      if (!document.pdfHash || !document.docxHash)
        fail(
          HttpsError,
          "data-loss",
          "Generated document metadata is incomplete.",
        );
      const existingDelivery = await deliveryRef.get();
      if (!existingDelivery.exists)
        await deliveryRef.create({
          assessmentId: assessment.id,
          assessmentSource: "AI_ASSISTED",
          versionId: version.id,
          documentId: document.id,
          qarReference: assessment.qarReference,
          reportMode: "PRELIMINARY",
          pdfHash: document.pdfHash,
          client: { status: "PENDING", attempt: 0 },
          archive: { status: "PENDING", attempt: 0 },
          status: "SENDING",
          createdAt: now(admin),
          updatedAt: now(admin),
        });
      const client = await deliverGeneratedTarget({
          assessment,
          version,
          document,
          deliveryRef,
          target: "client",
        }),
        archive = await deliverGeneratedTarget({
          assessment,
          version,
          document,
          deliveryRef,
          target: "archive",
        }),
        deliveryStatus =
          client.status === "SENT" && archive.status === "SENT"
            ? "COMPLETE"
            : "RETRY REQUIRED",
        auditRef = db
          .collection(AUDIT)
          .doc(`final-${assessment.id}-${ids.finalizationKey}`),
        event = {
          action: "framework_b_assessment_completed",
          byUid: who.uid,
          at: new Date().toISOString(),
          notes: `Governed AI-assisted assessment ${assessment.qarReference} completed and linked (staff assisted).`,
          eventId: `ai-assessment-generated:${assessment.id}:${ids.versionId}`,
        };
      await db.runTransaction(async (tx) => {
        const audit = await tx.get(auditRef);
        tx.set(
          deliveryRef,
          {
            clientDeliveryStatus: client.status,
            archiveDeliveryStatus: archive.status,
            status: deliveryStatus,
            updatedAt: now(admin),
          },
          { merge: true },
        );
        if (!audit.exists) {
          tx.set(
            leadRef,
            {
              assessmentId: assessment.id,
              assessmentSource: "AI_ASSISTED",
              assessmentQar: assessment.qarReference,
              assessmentRoute: assessment.category,
              assessmentStatus: "COMPLETED",
              assessmentCompletionMethod: "STAFF_ASSISTED",
              assessmentReportStatus: "GENERATED",
              assessmentReportDeliveryStatus: client.status,
              assessmentCompletedAt: now(admin),
              assessmentVersionId: ids.versionId,
              leadStatus: "qualified",
              status: "information-requested",
              lastAction: "framework_b_assessment_completed",
              lastUpdatedAt: now(admin),
              actionHistory: FieldValue.arrayUnion(event),
            },
            { merge: true },
          );
          tx.create(auditRef, {
            assessmentId: assessment.id,
            event: "PRELIMINARY_REPORT_CREATED",
            actorUid: who.uid,
            metadata: {
              qarReference: assessment.qarReference,
              assessmentSource: "AI_ASSISTED",
              reportMode: "PRELIMINARY",
              completionMethod: "STAFF_ASSISTED",
              documentId: document.id,
              deliveryId: deliveryRef.id,
              pdfHash: document.pdfHash,
              clientStatus: client.status,
              archiveStatus: archive.status,
            },
            createdAt: now(admin),
          });
        }
      });
      return {
        assessmentId: assessment.id,
        qarReference: assessment.qarReference,
        status: "COMPLETED",
        documentId: document.id,
        deliveryId: deliveryRef.id,
        downloadId: document.id,
        clientDeliveryStatus: client.status,
        archiveDeliveryStatus: archive.status,
        idempotent: existingDelivery.exists,
      };
    },
  );
  const downloadGenerated = onCall(async (r) => {
    const { assessment } = await linkedDraft(r),
      ids = generatedIdentity(assessment),
      document = await db.collection(DOCUMENTS).doc(ids.documentId).get();
    if (
      !document.exists ||
      document.data().assessmentId !== assessment.id ||
      document.data().versionId !== ids.versionId
    )
      fail(HttpsError, "not-found", "The final report is not available.");
    const [bytes] = await admin
      .storage()
      .bucket()
      .file(document.data().pdfPath)
      .download();
    if (bytesHash(bytes) !== document.data().pdfHash)
      fail(HttpsError, "data-loss", "Stored report verification failed.");
    return {
      filename: `${assessment.qarReference}-Preliminary-Assessment.pdf`,
      content: bytes.toString("base64"),
      contentType: "application/pdf",
      hash: document.data().pdfHash,
    };
  });
  const retryGenerated = onCall(
    { secrets: [resendSecret].filter(Boolean) },
    async (r) => {
      const { assessment } = await linkedDraft(r),
        ids = generatedIdentity(assessment),
        versionSnap = await db.collection(VERSIONS).doc(ids.versionId).get(),
        documentSnap = await db.collection(DOCUMENTS).doc(ids.documentId).get(),
        deliveryRef = db.collection(DELIVERIES).doc(ids.deliveryId),
        deliverySnap = await deliveryRef.get();
      if (assessment.activeCorrectionId)
        fail(HttpsError, "failed-precondition", "Use the governed correction lifecycle; historical delivery cannot be retried here.");
      if (!versionSnap.exists || !documentSnap.exists || !deliverySnap.exists)
        fail(
          HttpsError,
          "failed-precondition",
          "Immutable generated assessment assets are missing.",
        );
      const targets = Array.isArray(r.data?.targets) ? r.data.targets : [];
      if (
        !targets.length ||
        targets.some((x) => !["client", "archive"].includes(x))
      )
        fail(
          HttpsError,
          "invalid-argument",
          "Choose a failed delivery target.",
        );
      const version = { id: versionSnap.id, ...versionSnap.data() },
        document = { id: documentSnap.id, ...documentSnap.data() },
        patch = {};
      for (const target of targets)
        patch[target] = await deliverGeneratedTarget({
          assessment,
          version,
          document,
          deliveryRef,
          target,
          retryFailed: true,
        });
      const current = (await deliveryRef.get()).data(),
        status =
          current.client?.status === "SENT" &&
          current.archive?.status === "SENT"
            ? "COMPLETE"
            : "RETRY REQUIRED";
      await deliveryRef.set(
        {
          status,
          clientDeliveryStatus: current.client?.status,
          archiveDeliveryStatus: current.archive?.status,
          updatedAt: now(admin),
        },
        { merge: true },
      );
      return {
        status,
        clientStatus: current.client?.status,
        archiveStatus: current.archive?.status,
        reused: true,
      };
    },
  );
  const completeIssue = onCall(async (r) => {
    const who = await actor(r, db, HttpsError, r.data?.leadId, [
        "manager",
        "administrator",
      ]),
      assessmentId = clean(r.data?.assessmentId, 180),
      ref = db.collection(A).doc(assessmentId),
      snap = await ref.get();
    if (!snap.exists) fail(HttpsError, "not-found", "Assessment not found.");
    const assessment = snap.data();
    if (
      assessment.assessmentSource !== "AI_ASSISTED" ||
      assessment.crmLink?.workspaceId !== "CRM4" ||
      assessment.crmLink?.caseRef !== who.lead.id ||
      who.lead.assessmentId !== assessmentId
    )
      fail(
        HttpsError,
        "permission-denied",
        "Assessment-to-lead linkage could not be verified.",
      );
    if (assessment.status !== "ISSUED")
      fail(
        HttpsError,
        "failed-precondition",
        "The immutable assessment has not been issued.",
      );
    const deliveries = await db
        .collection("professionalAssessmentDeliveries")
        .where("assessmentId", "==", assessmentId)
        .get(),
      complete = deliveries.docs.some((d) => d.data().status === "COMPLETE");
    if (!complete)
      fail(
        HttpsError,
        "failed-precondition",
        "Both governed delivery targets have not completed.",
      );
    if (
      who.lead.assessmentStatus === "COMPLETED" &&
      who.lead.assessmentVersionId === assessment.currentVersionId
    )
      return { status: "COMPLETED", idempotent: true };
    const event = {
      action: "professional_assessment_completed",
      displayType: "Assessment completed",
      byUid: who.uid,
      at: new Date().toISOString(),
      notes: `Governed AI-assisted assessment ${assessment.qarReference} completed and linked.`,
      eventId: `ai-assessment-issued:${assessmentId}:${assessment.currentVersionId}`,
    };
    await db
      .collection("crm4Leads")
      .doc(who.lead.id)
      .set(
        {
          assessmentStatus: "COMPLETED",
          assessmentSource: "AI_ASSISTED",
          assessmentQar: assessment.qarReference,
          assessmentVersionId: assessment.currentVersionId,
          assessmentReportStatus: "ISSUED",
          assessmentReportDeliveryStatus: "COMPLETE",
          assessmentCompletedAt: now(admin),
          lastUpdatedAt: now(admin),
          actionHistory: FieldValue.arrayUnion(event),
        },
        { merge: true },
      );
    await db
      .collection(AUDIT)
      .add({
        assessmentId,
        event: "AI_ASSISTED_CRM4_COMPLETION_LINKED",
        actorUid: who.uid,
        metadata: {
          leadId: who.lead.id,
          versionId: assessment.currentVersionId,
        },
        createdAt: now(admin),
      });
    return { status: "COMPLETED", idempotent: false };
  });
  return {
    ...require("./crm4AssessmentAssistantCorrection").registerCorrection({
      admin, db, onCall, HttpsError, actor, finalisationReviewMatches,
      latestArtifact, safe, governedProjection, pdfBuffer, docxBuffer,
      TEMPLATE, contentModel, deliverGeneratedTarget, resendSecret,
      generationContractVersion: GENERATION_CONTRACT_VERSION,
    }),
    crm4AssessmentAssistantGetState: getState,
    crm4AssessmentAssistantUpdateClientIdentity: updateClient,
    crm4AssessmentAssistantAnalyse: analyse,
    crm4AssessmentAssistantConfirmReview: confirmReview,
    crm4AssessmentAssistantSaveCorrections: save,
    crm4AssessmentAssistantGenerateDraft: draft,
    crm4AssessmentAssistantReprojectDraft: reprojectDraft,
    crm4AssessmentAssistantPreviewDraftPdf: previewDraft,
    crm4AssessmentAssistantFinalise: finalise,
    crm4AssessmentAssistantDownloadFinalPdf: downloadGenerated,
    crm4AssessmentAssistantRetryDelivery: retryGenerated,
    crm4AssessmentAssistantCompleteIssue: completeIssue,
  };
}
module.exports = {
  registerCrm2AssessmentAssistant,
  callOpenAI,
  analyseProvider,
  persistArtifact,
  diagnosticOf,
  diagnosticTelemetry,
  GENERIC_FAILURE,
  validateOutput: validate,
  deterministicCalculations,
  projection,
  categoryFor,
  addressText,
  comparableAddress,
  normaliseCaseContext,
  injectAuthoritative,
  deterministicAssessmentId,
  confirmedArtifactId,
  artifactOutput,
  analyseResponse,
  latestArtifact,
  assessmentStateProjection,
  assessmentDeliverySalutation,
  finalisationReviewMatches,
  semanticDraftCreationKey,
  versionedDraftCreationKey,
  persistedGenerationContract,
  draftRevisionIdentity,
  GENERATION_CONTRACT_VERSION,
  LEGACY_GENERATION_CONTRACT_VERSION,
  MODEL,
  INSTRUCTION_VERSION,
  SCHEMA_VERSION,
  OUTPUT_SCHEMA,
  CATEGORIES,
};

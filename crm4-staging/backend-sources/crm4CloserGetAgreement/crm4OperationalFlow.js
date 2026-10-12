"use strict";
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");
const { renderCrm2CorporateEmail } = require("./crm4CorporateEmail");
const { INFORMATION_BROCHURE, verifiedInformationBrochure: loadInformationBrochure } = require("./crm4InformationBrochure");

const text = (value, max = 500) => String(value == null ? "" : value).trim().slice(0, max);
const email = value => text(value, 320).toLowerCase();
const number = (value, max = 10000000) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : null;
};
const htmlSafe = value => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function commercialInternalProviderRequest({ kind, eventId, subject, content }) {
  return {
    payload: {
      from: "Quaerens CRM4 <clientsupport@quaerens.co.uk>",
      to: "support@quaerens.co.uk",
      cc: "info@quaerens.co.uk",
      subject,
      ...content,
      tags: [{ name: "type", value: `crm4_${kind}_internal` }],
    },
    options: { idempotencyKey: `crm4-${kind}-internal-${eventId}` },
  };
}

function projectionText(value, max = 4000) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return text(value, max);
  if (Array.isArray(value)) return text(value.map(item => projectionText(item, max)).filter(Boolean).join("\n"), max);
  if (value && typeof value === "object") {
    return text(Object.entries(value).map(([key, item]) => {
      const rendered = projectionText(item, max);
      return rendered ? `${key.replaceAll("_", " ")}: ${rendered}` : "";
    }).filter(Boolean).join("\n"), max);
  }
  return "";
}

const uniqueNames = values => {
  const seen = new Set();
  return values.flatMap(value => Array.isArray(value) ? value : [value]).map(value => text(value, 200)).filter(value => {
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function clientNames(lead, assessment) {
  const publicClient = assessment?.publicIntake?.client || {};
  const joint = uniqueNames([
    assessment?.client?.names,
    publicClient.names,
    lead.clientNames,
    lead.jointClientNames,
  ]);
  if (joint.length) return joint.join(" and ");
  return uniqueNames([
    assessment?.client?.name,
    publicClient.name,
    lead.clientName,
    lead.name,
    `${lead.title || ""} ${lead.forename || ""} ${lead.surname || ""}`,
  ])[0] || "Client";
}
const clientName = lead => clientNames(lead);

function naturalDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value, 20));
  if (!match) return text(value, 40);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
}

const valueAt = (source, path) => path.split(".").reduce((value, key) => value && value[key], source);
const addUnique = (list, item) => { if (item && !list.includes(item)) list.push(item); };
const APPOINTMENT_TEMPLATE_ID = "crm4-appointment-readiness";
const APPOINTMENT_TEMPLATE_VERSION = "2026-08-23.2";
const PAYMENT_TEMPLATE_ID = "crm4-secure-payment-request";
const PAYMENT_TEMPLATE_VERSION = "2026-09-15.1";
const AGREEMENT_TEMPLATE_VERSION = 1;
const APPOINTMENT_STATUSES = new Set(["scheduled", "confirmed", "completed", "rescheduled", "cancelled", "no_show"]);
const CALLBACK_TYPES = new Set(["lister", "closer"]);
const CALLBACK_REASONS = new Set(["Documents / paperwork required", "Partner / joint applicant unavailable", "Client needs time", "Other"]);
const GENERAL_INFORMATION_TEMPLATE_ID = "crm4-general-information";
const GENERAL_INFORMATION_TEMPLATE_VERSION = "2026-09-06.1";
const APPROVED_PAYMENT_OPTIONS = Object.freeze({
  bank_transfer_gbp_950: { amount: 950, url: "https://wise.com/pay/r/pm5kGtmOaCb7kNI" },
  bank_transfer_gbp_1000: { amount: 1000, url: "https://wise.com/pay/r/WaN0dfzMS-RlCNw" },
  bank_transfer_gbp_1100: { amount: 1100, url: "https://wise.com/pay/r/Vgd_bRMSIEDNvUA" },
  bank_transfer_gbp_1200: { amount: 1200, url: "https://wise.com/pay/r/zGYgTXZy49qRrx8" },
  bank_transfer_gbp_1300: { amount: 1300, url: "https://wise.com/pay/r/QszboJSR4Cr0Ehg" },
  bank_transfer_gbp_1400: { amount: 1400, url: "https://wise.com/pay/r/t8oEw4dhwE0RrYg" },
  bank_transfer_gbp_1500: { amount: 1500, url: "https://wise.com/pay/r/QxFqrhCKBiR0rxI" },
  bank_transfer_gbp_1700: { amount: 1700, url: "https://wise.com/pay/r/7cm566ToJeIjS_A" },
  bank_transfer_gbp_1800: { amount: 1800, url: "https://wise.com/pay/r/yQgDU-VH9ApnUHA" },
  bank_transfer_gbp_1900: { amount: 1900, url: "https://wise.com/pay/r/SVNhwVJUEurUZs0" },
  bank_transfer_gbp_2000: { amount: 2000, url: "https://wise.com/pay/r/Jauw1dXZ_IyzsBU" },
  bank_transfer_gbp_2200: { amount: 2200, url: "https://wise.com/pay/r/A8_E5j6m7ALopFg" },
  bank_transfer_gbp_2400: { amount: 2400, url: "https://wise.com/pay/r/1ekIO0nTjBcYdTA" },
});

function paymentOption(data) {
  const id = text(data.paymentOptionId, 80);
  if (id === "stripe_case_specific") {
    const amount = number(data.customAgreedFeeAmount);
    if (amount == null || amount <= 0) return null;
    return { id, type: "stripe_live", currency: "GBP", amount, url: "" };
  }
  if (APPROVED_PAYMENT_OPTIONS[id]) return { id, type: "bank_transfer", currency: "GBP", ...APPROVED_PAYMENT_OPTIONS[id] };
  return null;
}

function storedPaymentOption(lead) {
  if (lead.paymentOptionId === "stripe_case_specific") {
    const amount = number(lead.agreedFeeAmount), url = secureCheckoutUrl(lead.securePaymentLink);
    return amount > 0 ? { id: "stripe_case_specific", type: "stripe_live", currency: "GBP", amount, url } : null;
  }
  if (APPROVED_PAYMENT_OPTIONS[lead.paymentOptionId]) return { id: lead.paymentOptionId, type: "bank_transfer", currency: "GBP", ...APPROVED_PAYMENT_OPTIONS[lead.paymentOptionId] };
  if (String(lead.paymentOptionId || "").startsWith("revolut_") || lead.paymentOptionId === "custom") return null;
  const amount = number(lead.agreedFeeAmount), url = secureCheckoutUrl(lead.securePaymentLink);
  if (url && new URL(url).hostname === "checkout.revolut.com") return null;
  return amount > 0 && url ? { id: "legacy_manual", type: "legacy", currency: text(lead.agreedFeeCurrency, 8) || "GBP", amount, url } : null;
}

function authoritativeAgreementCommercial(lead) {
  const amount = number(lead.agreedFeeAmount), currency = text(lead.agreedFeeCurrency, 8) || "GBP", option = storedPaymentOption(lead);
  if (lead.outcome !== "Closed Deal" || lead.status !== "closed-deal-awaiting-payment" || amount == null || amount <= 0 || currency !== "GBP" || !option || option.amount !== amount || option.currency !== currency)
    return null;
  const serviceFeeDisplay = new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
  return { agreedFeeAmount: amount, agreedFeeCurrency: currency, paymentOptionId: option.id, paymentOptionType: option.type, serviceFeeDisplay };
}

function callbackEmailTemplate({ lead, callbackDate, callbackTime }) {
  const subject = "Your Quaerens callback has been scheduled";
  const body = `Dear ${clientNames(lead)},\n\nThank you for speaking with Quaerens.\n\nI have scheduled our telephone callback for:\n\nDate: ${naturalDate(callbackDate)}\nTime: ${callbackTime}\n\nI will contact you at approximately the scheduled time.\n\nIf you need to change the callback, please reply to this email or contact us.\n\nKind regards,\n\nQuaerens Intake Team`;
  const previewKey = crypto.createHash("sha256").update(JSON.stringify({ type: "crm4-callback", leadId: lead.id || "", callbackDate, callbackTime, recipient: email(lead.email || lead.emailAddress) })).digest("hex");
  return { subject, body, previewKey, content: renderCrm2CorporateEmail(body) };
}

function secureCheckoutUrl(value) {
  const raw = text(value, 1000);
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.toString() : "";
  } catch { return ""; }
}

function paymentEmailTemplate({ lead, amount, currency = "GBP", securePaymentLink, provider = "" }) {
  const subject = "Your secure Quaerens payment link";
  const route = text(lead.claimType || lead.intakeClaimType || lead.assessmentRoute, 160).toLowerCase();
  const caseType = route.includes("spray") || route.includes("foam") ? "spray foam insulation" : route.includes("solar") ? "solar installation" : "consumer complaint";
  const paymentInstructions = provider === "bank_transfer"
    ? "Payment method: Bank Transfer.\n\nUse the secure Bank Transfer link below and follow the instructions shown by your bank. The transfer should be made to Quaerens Ltd."
    : "Once you have entered your payment details, your bank may ask you to approve the transaction through your banking app. Alternatively, you may receive a one-time password (OTP) on your mobile phone which you will need to enter to complete the payment.\n\nThese are normal banking security checks for online card transactions.\n\nThe transaction should appear as a payment to Quaerens Ltd.";
  const body = `Dear ${clientNames(lead)},\n\nFurther to your assessment regarding your ${caseType} matter, please find below your secure payment link for the Quaerens Ltd – Consumer Assessment Fee.\n\nSecure Payment Link:\n\n${securePaymentLink}\n\n${paymentInstructions}\n\nOnce your payment has been successfully completed, you will receive confirmation and we can proceed with the next steps on your ${caseType} matter straight away.\n\nIf your bank temporarily declines or blocks the transaction, please contact your bank and confirm that you are intentionally making a payment to Quaerens Ltd for your Consumer Assessment Fee. Your bank can normally authorise the transaction once they have confirmed that it is genuine.\n\nIf you experience any difficulty with the payment process or have any questions, please contact us and we will be happy to assist.\n\nKind regards,\n\nQuaerens Client Support Team`;
  const previewKey = crypto.createHash("sha256").update(JSON.stringify({ templateId: PAYMENT_TEMPLATE_ID, templateVersion: PAYMENT_TEMPLATE_VERSION, leadId: lead.id || "", recipient: email(lead.email || lead.emailAddress), amount, currency, securePaymentLink, provider })).digest("hex");
  const content = renderCrm2CorporateEmail(body), escapedLink = htmlSafe(securePaymentLink);
  const linkLabel = "Click here to make your secure payment";
  content.html = content.html.replace(escapedLink, `<a href="${escapedLink}" target="_blank" rel="noopener noreferrer" style="color:#145dcc;font-weight:700">${linkLabel}</a>`);
  const previewText = body.replace(securePaymentLink, linkLabel);
  return { subject, body, previewText, previewKey, content };
}

function appointmentChecklist(lead, assessment) {
  const route = text(assessment?.category || lead.assessmentRoute || lead.claimType || lead.intakeClaimType, 80).toLowerCase();
  const facts = assessment?.publicIntake || assessment || {};
  const factText = JSON.stringify(facts).toLowerCase();
  const finance = text(valueAt(facts, "finance.used") || valueAt(facts, "finance.financeUsed") || lead.financeUsed, 80).toLowerCase();
  const financeIdentified = /yes|finance|loan|credit|lender/.test(finance) && !/^no\b|none|not used/.test(finance);
  const bankIdentified = /bank|card|chargeback|section 75/.test(factText);
  const technicalIdentified = /technical report|inspection report|engineer report|surveyor report|survey report/.test(factText);
  let items;
  if (route.includes("spray") || route.includes("foam")) {
    items = ["installation contract or agreement", "invoice or proof of payment", "warranty or guarantee documentation", "sales literature or representations", "grant or government-scheme documentation where relevant", "photographs", "installer correspondence", "previous complaint correspondence"];
    if (financeIdentified) items.splice(2, 0, "finance agreement and finance-provider correspondence");
    if (/mortgage|remortgage|equity release/.test(factText)) addUnique(items, "mortgage, remortgage or equity-release correspondence");
    if (/removal|remedial/.test(factText)) addUnique(items, "removal quotation, report or certificate where available");
    if (technicalIdentified) addUnique(items, "surveyor or technical report already available");
  } else {
    items = ["solar installation or purchase agreement", "invoice or proof of payment", "warranty or guarantee documentation", "original quotation or proposal", "sales literature or representations", "system specifications or details", "generation or performance information where available", "inverter or battery information where relevant", "installer correspondence", "previous complaint correspondence"];
    if (financeIdentified) items.splice(2, 0, "finance agreement and finance-provider correspondence");
    if (technicalIdentified) addUnique(items, "technical inspection or report already available");
  }
  if (bankIdentified) addUnique(items, "relevant bank or card correspondence");
  return { category: route.includes("spray") || route.includes("foam") ? "spray-foam" : "solar", items };
}

function appointmentEmailTemplate({ lead, assessment, appointmentDate, appointmentTime, agentName }) {
  const name = clientNames(lead, assessment), checklist = appointmentChecklist(lead, assessment);
  const checklistText = checklist.items.map(item => `- ${item}`).join("\n");
  const subject = "Your Quaerens appointment has been confirmed";
  const body = `Dear ${name},\n\nThank you for completing your assessment.\n\nWe have now reviewed your details and can confirm your telephone appointment with your Quaerens Onboarding Agent:\n\nDate: ${naturalDate(appointmentDate)}\nTime: ${appointmentTime}\nAppointment with: ${agentName || "your assigned Onboarding Agent"}\n\nDuring the call, your Onboarding Agent will review the information provided in your assessment, discuss the next steps with you and confirm any further information or documentation that may be required.\n\nTo help make the appointment as useful as possible, please have any of the following available if you have them:\n\n${checklistText}\n\nPlease do not worry if you do not have all of these documents. Your appointment can still go ahead. Having as much information as you can readily find simply helps us understand the matter more efficiently.\n\nPlease keep your telephone available around the appointment time. If you need to change your appointment, please reply to this email or contact us.\n\nKind regards,\n\nOn behalf of the Quaerens Intake Team`;
  const previewKey = crypto.createHash("sha256").update(JSON.stringify({ templateId: APPOINTMENT_TEMPLATE_ID, templateVersion: APPOINTMENT_TEMPLATE_VERSION, assessmentId: text(lead.assessmentId, 180), appointmentDate, appointmentTime, agentName, category: checklist.category })).digest("hex");
  return { templateId: APPOINTMENT_TEMPLATE_ID, templateVersion: APPOINTMENT_TEMPLATE_VERSION, subject, body, previewKey, category: checklist.category, checklist: checklist.items, content: renderCrm2CorporateEmail(body) };
}

function appointmentValues(lead) {
  const closerAppointment = Boolean(text(lead.closerUid, 180)) &&
    Boolean(text(lead.closerAppointmentDate || lead.appointmentDate, 20)) &&
    Boolean(text(lead.closerAppointmentTime || lead.appointmentTime, 20));
  const storedAgentName = text(lead.onboardingAppointmentAgentName, 160);
  return {
    date: text(closerAppointment ? (lead.closerAppointmentDate || lead.appointmentDate) : lead.onboardingAppointmentDate, 20),
    time: text(closerAppointment ? (lead.closerAppointmentTime || lead.appointmentTime) : lead.onboardingAppointmentTime, 20),
    agentName: storedAgentName.toLowerCase() === "onboarding agent" ? "Onboarding Agent" : (storedAgentName || "Onboarding Agent"),
    source: closerAppointment ? "CLOSER_APPOINTMENT" : "LISTER_ONBOARDING_APPOINTMENT",
  };
}

function registerCrm2OperationalFlow({ admin, db, onCall, HttpsError, resend, resendSecret }) {
  const now = () => FieldValue.serverTimestamp();
  const history = item => FieldValue.arrayUnion(item);
  const fail = (code, message) => { throw new HttpsError(code, message); };

  async function actor(request, roles) {
    if (!request.auth) fail("unauthenticated", "Sign in is required.");
    const member = await db.collection("crm4Memberships").doc(request.auth.uid).get();
    if (!member.exists || member.data().active !== true || member.data().workspaceId !== "CRM4" || !roles.includes(member.data().role))
      fail("permission-denied", "This CRM4 operation is not authorised for the signed-in role.");
    return { uid: request.auth.uid, role: member.data().role, name: text(member.data().displayName || member.data().name, 160) };
  }

  async function leadFor(id) {
    const ref = db.collection("crm4Leads").doc(text(id, 180)), snap = await ref.get();
    if (!snap.exists) fail("not-found", "The CRM4 lead was not found.");
    return { ref, data: snap.data() };
  }

  const verifiedInformationBrochure = () => loadInformationBrochure(HttpsError);

  function generalInformationEmailContent(lead) {
    const fullName = clientName(lead);
    const firstName = text(lead.firstName || lead.forename || lead.clientFirstName, 100) || fullName.split(/\s+/)[0] || "Client";
    const subject = "Welcome to Quaerens – information about your free assessment";
    const body = `Dear ${firstName},\n\nFollowing your recent conversation, we would like to introduce you to Quaerens and explain what will happen next.\n\nQuaerens helps consumers understand and document problems they may have experienced with products or services they have purchased. As part of this process, an assessment can be completed to establish the circumstances of your situation and the evidence available.\n\nThere is no charge for this assessment or for the assessment report, and there is no obligation to proceed with any further service.\n\nThe person you have been speaking with will contact you again and complete the assessment with you.\n\nDuring that conversation, they will ask you for information about your circumstances, which may include:\n- the product or service you purchased;\n- who supplied or sold it to you;\n- when it was purchased;\n- how much you paid;\n- payments you have already made;\n- any finance agreement or payment plan that was arranged;\n- what you were told at the time of purchase;\n- the problems or issues you are currently experiencing; and\n- any steps you have already taken to try to resolve the matter.\n\nThey will also discuss the evidence and documents you have available. Depending on your circumstances, this could include contracts, invoices, finance agreements, payment records, correspondence, photographs, surveys, reports or other relevant documentation.\n\nYou do not need to have everything available immediately. The assessment will also help identify what information or evidence may still be useful.\n\nOnce the assessment has been completed and the information has been submitted, Quaerens will use the information and evidence provided to prepare your assessment report free of charge.\n\nThe report will bring together the circumstances of your case, identify the key issues and supporting evidence, and provide you with a clearer understanding of your position and the options that may be available to you.\n\nThere is no charge for the assessment or assessment report and no obligation to proceed with any further service.\n\nWe have attached our Quaerens Information Brochure to this email. We recommend taking a few minutes to read it before your next conversation, as it explains more about Quaerens, how we work and what you can expect from the assessment process.\n\nThe person you have been speaking with will then contact you again to complete the assessment and help you identify the information and evidence relevant to your circumstances.\n\nWe look forward to helping you gain a clearer understanding of your position and the next steps available to you.\n\nKind regards,\n\nAssessment Department`;
    return { subject, body, firstName };
  }

  async function assessmentContext(lead) {
    const assessmentId = text(lead.assessmentId, 180);
    if (!assessmentId) return { assessment: null, reportSentence: "Your assessment report has been prepared and is available through the assessment process." };
    const assessmentSnap = await db.collection("professionalAssessments").doc(assessmentId).get();
    const deliverySnaps = await db.collection("professionalAssessmentDeliveries").where("assessmentId", "==", assessmentId).get();
    const deliveries = deliverySnaps.docs.map(doc => doc.data());
    const emailed = deliveries.some(delivery => delivery.clientDeliveryStatus === "SENT" || delivery.client?.status === "SENT");
    const delivered = lead.assessmentReportDeliveredAt || lead.assessmentReportDeliveryConfirmedAt;
    return {
      assessment: assessmentSnap.exists ? assessmentSnap.data() : null,
      reportSentence: delivered
        ? "Your assessment report has been provided to you."
        : emailed
          ? "Your assessment report has been sent to your email address."
          : "Your assessment report has been prepared and is available through the assessment process.",
    };
  }

  async function appointmentContext(lead) {
    const values = appointmentValues(lead);
    if (values.source === "CLOSER_APPOINTMENT") {
      const assigned = await db.collection("crm4Memberships").doc(text(lead.closerUid, 180)).get();
      if (assigned.exists && assigned.data().active === true && assigned.data().role === "closer")
        values.agentName = text(assigned.data().displayName || assigned.data().name, 160) || "Onboarding Agent";
    }
    return values;
  }

  async function authorisedLinkedAssessment(request, roles) {
    const who = await actor(request, roles);
    const found = await leadFor(request.data?.leadId);
    if (who.role === "closer" && found.data.closerUid !== who.uid && found.data.assignedUserId !== who.uid)
      fail("permission-denied", "This assessment is not assigned to the signed-in Closer.");
    const assessmentId = text(found.data.assessmentId, 180);
    if (!assessmentId) return { who, found, assessmentId, assessmentSnap: null };
    const assessmentSnap = await db.collection("professionalAssessments").doc(assessmentId).get();
    const linkedLeadId = assessmentSnap.exists ? text(assessmentSnap.data().crmLink?.crm4LeadId || assessmentSnap.data().crmLink?.caseRef, 180) : "";
    if (!assessmentSnap.exists || assessmentSnap.data().crmLink?.workspaceId !== "CRM4" || linkedLeadId !== found.ref.id)
      fail("failed-precondition", "The linked governed assessment could not be verified.");
    return { who, found, assessmentId, assessmentSnap };
  }

  async function linkedAssessmentProjection(request, roles) {
    const linked = await authorisedLinkedAssessment(request, roles);
    if (!linked.assessmentSnap) return { assessment: null };
    const assessment = linked.assessmentSnap.data();
    let projection = {};
    const versionId = text(assessment.currentVersionId, 180);
    if (versionId) {
      const versionSnap = await db.collection("professionalAssessmentVersions").doc(versionId).get();
      if (!versionSnap.exists || versionSnap.data().assessmentId !== linked.assessmentId)
        fail("failed-precondition", "The current governed assessment version could not be verified.");
      projection = versionSnap.data().projection || {};
    }
    const summary = {
      executiveSummary: projectionText(projection.executive_summary),
      matterSummary: projectionText(projection.matter_summary),
      preliminaryPosition: projectionText(projection.preliminary_position),
      evidenceReadiness: projectionText(projection.evidence_readiness),
      recommendedCaseDirection: projectionText(projection.recommended_case_direction),
    };
    const summaryText = [summary.executiveSummary, summary.matterSummary, summary.preliminaryPosition, summary.recommendedCaseDirection]
      .filter(Boolean).join("\n\n");
    return {
      assessment: {
        id: linked.assessmentSnap.id,
        qarReference: text(assessment.qarReference, 120),
        assessmentSource: text(assessment.assessmentSource, 40) || "FRAMEWORK_B",
        category: text(assessment.category, 80),
        status: text(assessment.status, 80),
        currentVersion: Number(assessment.currentVersion || 1),
        intakeMode: text(assessment.intakeMode, 40),
        completionMethod: text(assessment.completionMethod || linked.found.data.assessmentCompletionMethod, 60),
        reportStatus: text(linked.found.data.assessmentReportStatus || assessment.status, 60),
        reportDeliveryStatus: text(linked.found.data.assessmentReportDeliveryStatus, 60),
        reportMode: text(assessment.reportMode, 40),
        completedAt: assessment.updatedAt || assessment.createdAt || null,
        summary,
        summaryText: text(summaryText, 12000),
        ...(linked.who.role === "closer" ? {} : { publicIntake: assessment.publicIntake || {} }),
      },
      appointment: await appointmentContext(linked.found.data),
    };
  }

  async function linkedAssessmentReport(request, roles) {
    const linked = await authorisedLinkedAssessment(request, roles);
    if (!linked.assessmentSnap) fail("failed-precondition", "This CRM4 lead has no linked governed assessment.");
    const assessment = linked.assessmentSnap.data();
    const documents = await db.collection("professionalAssessmentDocuments").where("assessmentId", "==", linked.assessmentId).get();
    const currentVersion = Number(assessment.currentVersion || 1);
    const documentSnap = documents.docs
      .sort((a, b) => Number(b.data().version || 0) - Number(a.data().version || 0))
      .find(item => Number(item.data().version || currentVersion) === currentVersion) || documents.docs[0];
    if (!documentSnap || !text(documentSnap.data().pdfPath, 500)) fail("not-found", "The governed assessment report was not found.");
    const document = documentSnap.data(), [bytes] = await admin.storage().bucket().file(document.pdfPath).download();
    const actualHash = crypto.createHash("sha256").update(bytes).digest("hex");
    if (!document.pdfHash || actualHash !== document.pdfHash) fail("data-loss", "Stored report verification failed.");
    const event = linked.who.role === "closer" ? "CRM4_CLOSER_REPORT_ACCESSED" : "CRM4_MANAGER_REPORT_ACCESSED";
    await db.collection("professionalAssessmentAudit").add({ assessmentId: linked.assessmentId, event, actorUid: linked.who.uid, actorRole: linked.who.role, metadata: { crm4LeadId: linked.found.ref.id, documentId: documentSnap.id, qarReference: text(document.qarReference || assessment.qarReference, 120) }, createdAt: now() });
    return { filename: `${text(document.qarReference || assessment.qarReference, 120) || "Quaerens-Assessment"}-Report.pdf`, content: bytes.toString("base64"), contentType: "application/pdf", hash: actualHash };
  }

  async function sendManagerReviewNotification({ leadId, lead, who, eventId }) {
    if (!eventId || lead.managerReviewNotificationSentAt) return;
    const route = text(lead.claimType || lead.intakeClaimType || lead.assessmentRoute, 160) || "Not recorded";
    const directLink = `https://www.quaerens.co.uk/manager-leads-overview.html?lead=${encodeURIComponent(leadId)}`;
    const subject = `New CRM4 Manager Review — ${clientNames(lead)} — ${route}`;
    const body = `A new CRM4 lead is waiting for Manager review and Closer assignment.\n\nClient name: ${clientNames(lead)}\nCRM4 lead ID: ${leadId}\nClaim type / route: ${route}\nCampaign / source: ${text(lead.campaignName || lead.campaign || lead.referralSource || lead.source, 240) || "Not recorded"}\nOriginating Lister: ${who.name || "Authorised CRM4 Lister"}\nFramework B assessment status: ${text(lead.assessmentStatus, 80) || "Not recorded"}\nQAR reference: ${text(lead.assessmentQar, 120) || "Not recorded"}\nReport status: ${text(lead.assessmentReportStatus, 80) || "Not recorded"}\nAppointment: ${text(lead.onboardingAppointmentDate, 20) || "Not recorded"} ${text(lead.onboardingAppointmentTime, 20)}\nCurrent workflow status: awaiting-manager-review\nManager action required: Review the completed assessment and appointment, record the Manager decision, and assign the appropriate Closer.\n\nOpen the exact protected CRM4 lead:\n${directLink}\n\nThis is an internal operational notification.`;
    const content = renderCrm2CorporateEmail(body);
    const result = process.env.FUNCTIONS_EMULATOR === "true" ? { data: { id: `emulator-manager-review-${leadId}-${eventId}` } } : await resend.emails.send({ from: "Quaerens CRM4 <clientsupport@quaerens.co.uk>", to: "info@quaerens.co.uk", subject, ...content, tags: [{ name: "type", value: "crm4_manager_review_internal" }] }, { idempotencyKey: `crm4-manager-review-${eventId}` });
    if (result?.error) fail("internal", result.error.message || "The internal Manager-review notification could not be sent.");
    const providerId = text(result?.data?.id || result?.id, 200), at = new Date().toISOString(), ref = db.collection("crm4Leads").doc(leadId);
    await db.runTransaction(async transaction => {
      const current = await transaction.get(ref), currentLead = current.data() || {};
      if (currentLead.managerHandoffEventId !== eventId || currentLead.managerReviewNotificationSentAt) return;
      transaction.update(ref, { managerReviewNotificationSentAt: now(), managerReviewNotificationRecipient: "info@quaerens.co.uk", managerReviewNotificationSender: "crm4ListerSubmitToManager", managerReviewNotificationProviderId: providerId, managerReviewNotificationEventId: eventId, lastUpdatedAt: now(), actionHistory: history({ action: "manager_review_notification_sent", byUid: who.uid, at, notes: "Internal Manager-review notification sent to the governed operational recipient.", eventId }) });
    });
  }

  const listerSubmit = onCall({ secrets: [resendSecret].filter(Boolean) }, async request => {
    const who = await actor(request, ["lister"]), data = request.data || {}, leadId = text(data.leadId, 180);
    if (!leadId) fail("invalid-argument", "A CRM4 lead is required.");
    const appointmentDate = text(data.appointmentDate, 20), appointmentTime = text(data.appointmentTime, 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime)) fail("failed-precondition", "A valid onboarding appointment date and time are required.");
    const outcome = await db.runTransaction(async transaction => {
      const ref = db.collection("crm4Leads").doc(leadId), snap = await transaction.get(ref);
      if (!snap.exists) fail("not-found", "The CRM4 lead was not found.");
      const lead = snap.data();
      if (lead.assignedToUid !== who.uid && lead.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Lister.");
      if (lead.status === "awaiting-manager-review" && lead.sentToManagerAt) {
        return { status: "ALREADY_SENT_TO_MANAGER", assessmentStatus: lead.assessmentStatus || "NOT_STARTED", idempotent: true, notification: lead.managerHandoffEventId && !lead.managerReviewNotificationSentAt ? { eventId: lead.managerHandoffEventId, lead } : null };
      }
      const recoverableQualifiedState = lead.status === "awaiting-manager-review" && lead.leadStatus === "qualified" && !lead.sentToManagerAt;
      if (!["new", "information-requested"].includes(lead.status) && !recoverableQualifiedState) fail("failed-precondition", "Only an active assigned lead can be sent to Manager.");
      const claimType = text(data.claimType || lead.claimType, 160), supported = ["solar_support", "foam_insulation"].includes(claimType);
      if (!claimType) fail("failed-precondition", "A claim type is required.");
      if (supported && (!lead.assessmentId || lead.assessmentStatus !== "COMPLETED" || !lead.assessmentQar)) fail("failed-precondition", "The governed assessment must be completed first.");
      const eventId = `crm4:${leadId}:manager-handoff:${crypto.randomUUID()}`, event = { action: "sent_to_manager", byUid: who.uid, at: new Date().toISOString(), notes: "Validated Lister handoff to Manager.", eventId };
      const notificationLead = { ...lead, claimType, intakeClaimType: claimType, status: "awaiting-manager-review", leadStatus: "awaiting_manager", onboardingAppointmentDate: appointmentDate, onboardingAppointmentTime: appointmentTime, onboardingAppointmentAgentName: text(data.appointmentAgentName, 160) };
      transaction.update(ref, { claimType, intakeClaimType: claimType, status: "awaiting-manager-review", leadStatus: "awaiting_manager", onboardingAppointmentDate: appointmentDate, onboardingAppointmentTime: appointmentTime, onboardingAppointmentAgentName: text(data.appointmentAgentName, 160), appointmentId: `crm4:${leadId}:onboarding`, appointmentStatus: "scheduled", appointmentOriginatingListerUid: who.uid, appointmentOriginatingListerName: who.name, managerHandoffEventId: eventId, sentToManagerAt: now(), lastAction: "sent_to_manager", lastUpdatedAt: now(), actionHistory: history(event), appointmentAudit: history({ action: "lister_onboarding_appointment_recorded", byUid: who.uid, at: event.at, previous: { date: text(lead.onboardingAppointmentDate, 20), time: text(lead.onboardingAppointmentTime, 20), agentName: text(lead.onboardingAppointmentAgentName, 160) }, next: { date: appointmentDate, time: appointmentTime, agentName: text(data.appointmentAgentName, 160) } }) });
      return { status: "SENT_TO_MANAGER", assessmentStatus: lead.assessmentStatus || "NOT_STARTED", idempotent: false, notification: { eventId, lead: notificationLead } };
    });
    let notificationStatus=outcome.notification?"PENDING":"ALREADY_SENT";
    if(outcome.notification){try{await sendManagerReviewNotification({leadId,lead:outcome.notification.lead,who,eventId:outcome.notification.eventId});notificationStatus="SENT"}catch(error){console.error("CRM4 Manager notification failed after authoritative handoff",{leadId,eventId:outcome.notification.eventId,error:error?.message||String(error)});notificationStatus="FAILED_RETRY_REQUIRED"}}
    return { status: outcome.status, assessmentStatus: outcome.assessmentStatus, idempotent: outcome.idempotent, notificationStatus };
  });

  const listerRetryManagerNotification=onCall({secrets:[resendSecret].filter(Boolean)},async request=>{const who=await actor(request,["lister"]),found=await leadFor(request.data?.leadId);if(found.data.assignedToUid!==who.uid&&found.data.assignedUserId!==who.uid)fail("permission-denied","This lead is not assigned to the signed-in Lister.");if(found.data.status!=="awaiting-manager-review"||!found.data.managerHandoffEventId)fail("failed-precondition","This lead has no completed Manager handoff.");if(found.data.managerReviewNotificationSentAt)return{status:"ALREADY_SENT",idempotent:true};try{await sendManagerReviewNotification({leadId:found.ref.id,lead:found.data,who,eventId:found.data.managerHandoffEventId});return{status:"SENT",idempotent:false}}catch(error){console.error("CRM4 Manager notification retry failed",{leadId:found.ref.id,eventId:found.data.managerHandoffEventId,error:error?.message||String(error)});fail("internal","The lead remains with Manager, but the internal notification could not be delivered.")}});

  const listerSendAssessmentEmail = onCall({ secrets: [resendSecret].filter(Boolean) }, async request => {
    const who = await actor(request, ["lister"]), found = await leadFor(request.data?.leadId);
    if (found.data.assignedToUid !== who.uid && found.data.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Lister.");
    if (!found.data.assessmentId || found.data.assessmentStatus !== "COMPLETED") fail("failed-precondition", "A linked completed assessment is required before this email can be sent.");
    if (found.data.assessmentCompletionEmailSentAt && found.data.assessmentCompletionEmailAssessmentId === found.data.assessmentId)
      return { status: "ALREADY_SENT", idempotent: true };
    const recipient = email(found.data.email || found.data.emailAddress);
    if (!recipient) fail("failed-precondition", "The assigned lead has no client email address.");
    const context = await assessmentContext(found.data), name = clientNames(found.data, context.assessment);
    const subject = "Thank you for completing your Quaerens assessment";
    const body = `Dear ${name},\n\nThank you for taking the time to complete your assessment questionnaire.\n\nYour assessment has now been completed. ${context.reportSentence}\n\nIf the assessment was completed with the assistance of a member of the Quaerens team, your assessment report will be provided to you through the normal assessment process.\n\nYou will receive a separate confirmation of the agreed date and time for your appointment with our onboarding team.\n\nDuring that appointment, your onboarding agent will discuss your assessment, your options and the next steps with you.\n\nKind regards,\n\nQuaerens Intake Team`;
    const content = renderCrm2CorporateEmail(body);
    let result;
    try { result = await resend.emails.send({ from: "Quaerens Client Support <clientsupport@quaerens.co.uk>", to: recipient, subject, ...content, tags: [{ name: "type", value: "crm4_assessment_completion" }] }, { idempotencyKey: `crm4-assessment-completion-${found.ref.id}-${found.data.assessmentId}` }); }
    catch (error) { console.error("CRM4 assessment completion provider failure", { leadId: found.ref.id, error: error?.message || String(error) }); fail("internal", "The assessment email could not be delivered. Please try again later."); }
    if (result?.error) {
      console.error("CRM4 assessment completion provider rejection", { leadId: found.ref.id, error: result.error.message || String(result.error) });
      fail("internal", "The assessment email could not be delivered. Please try again later.");
    }
    const at = new Date().toISOString();
    await found.ref.update({ assessmentCompletionEmailSentAt: now(), assessmentCompletionEmailAssessmentId: found.data.assessmentId, assessmentCompletionEmailProviderId: text(result?.data?.id || result?.id, 200), lastUpdatedAt: now(), actionHistory: history({ action: "assessment_completion_email_sent", byUid: who.uid, at, notes: "Assessment completion email sent from the governed client-support identity." }) });
    return { status: "SENT", idempotent: false };
  });

  const listerSendGeneralInformationEmail = onCall({ secrets: [resendSecret].filter(Boolean) }, async request => {
    const who = await actor(request, ["lister"]), found = await leadFor(request.data?.leadId);
    if (found.data.assignedToUid !== who.uid && found.data.assignedUserId !== who.uid)
      fail("permission-denied", "This lead is not assigned to the signed-in Lister.");
    const recipient = email(found.data.email || found.data.emailAddress);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) fail("failed-precondition", "The assigned lead has no valid client email address.");
    if (found.data.generalInformationEmailSentAt)
      return { status: "ALREADY_SENT", idempotent: true, brochureId: INFORMATION_BROCHURE.id, brochureVersion: INFORMATION_BROCHURE.version };

    const brochure = verifiedInformationBrochure(), attemptId = crypto.randomUUID(), at = new Date().toISOString();
    let alreadySent = false;
    await db.runTransaction(async transaction => {
      const current = await transaction.get(found.ref), lead = current.data() || {};
      if (lead.generalInformationEmailSentAt) { alreadySent = true; return; }
      if (lead.generalInformationEmailState === "SENDING" && lead.generalInformationEmailAttemptId)
        fail("already-exists", "This email is already being sent.");
      transaction.update(found.ref, { generalInformationEmailState: "SENDING", generalInformationEmailAttemptId: attemptId, generalInformationEmailLastAttemptAt: now(), lastUpdatedAt: now() });
    });
    if (alreadySent) return { status: "ALREADY_SENT", idempotent: true, brochureId: INFORMATION_BROCHURE.id, brochureVersion: INFORMATION_BROCHURE.version };

    const content = generalInformationEmailContent(found.data);
    const rendered = renderCrm2CorporateEmail(content.body, { emailAddress: "assessment@quaerens.co.uk", phoneDisplay: "0208 0502 528", phoneUri: "+442080502528" });
    try {
      const result = process.env.FUNCTIONS_EMULATOR === "true"
        ? { data: { id: `emulator-crm4-general-information-${found.ref.id}` } }
        : await resend.emails.send({ from: "Quaerens Assessment Department <assessment@quaerens.co.uk>", to: recipient, subject: content.subject, ...rendered, attachments: [{ filename: INFORMATION_BROCHURE.filename, content: brochure.toString("base64") }], tags: [{ name: "type", value: "crm4_general_information" }] }, { idempotencyKey: `crm4-general-information-${found.ref.id}-${GENERAL_INFORMATION_TEMPLATE_VERSION}` });
      if (result?.error) fail("internal", result.error.message || "The general information email could not be sent.");
      const providerId = text(result?.data?.id || result?.id, 200);
      await found.ref.update({ generalInformationEmailState: "PROVIDER_ACCEPTED", generalInformationEmailAcceptedAt: now(), generalInformationEmailSentAt: now(), generalInformationEmailRecipient: recipient, generalInformationEmailTriggeredByUid: who.uid, generalInformationEmailProviderId: providerId, generalInformationEmailTemplateId: GENERAL_INFORMATION_TEMPLATE_ID, generalInformationEmailTemplateVersion: GENERAL_INFORMATION_TEMPLATE_VERSION, generalInformationEmailBrochureId: INFORMATION_BROCHURE.id, generalInformationEmailBrochureVersion: INFORMATION_BROCHURE.version, generalInformationEmailBrochureSha256: INFORMATION_BROCHURE.sha256, generalInformationEmailAttemptId: FieldValue.delete(), introEmailNeeded: false, lastAction: "general_information_email_provider_accepted", lastUpdatedAt: now(), actionHistory: history({ action: "general_information_email_provider_accepted", byUid: who.uid, byName: who.name, at, notes: "General information email accepted by the governed provider with the approved brochure attached.", brochureId: INFORMATION_BROCHURE.id, brochureVersion: INFORMATION_BROCHURE.version, providerMessageId: providerId }) });
      return { status: "SENT", idempotent: false, brochureId: INFORMATION_BROCHURE.id, brochureVersion: INFORMATION_BROCHURE.version };
    } catch (error) {
      await found.ref.update({ generalInformationEmailState: "FAILED", generalInformationEmailAttemptId: FieldValue.delete(), generalInformationEmailLastErrorAt: now(), lastUpdatedAt: now() }).catch(() => {});
      console.error("CRM4 general information provider failure", { leadId: found.ref.id, error: error?.message || String(error) });
      fail("internal", "The general information email could not be delivered. Please try again later.");
    }
  });

  async function listerAppointmentAuthority(request) {
    const who = await actor(request, ["lister"]), found = await leadFor(request.data?.leadId);
    if (found.data.assignedToUid !== who.uid && found.data.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Lister.");
    if (!found.data.assessmentId || found.data.assessmentStatus !== "COMPLETED") fail("failed-precondition", "A linked completed governed assessment is required.");
    return { who, found };
  }

  const listerSaveAppointment = onCall(async request => {
    const { who, found } = await listerAppointmentAuthority(request), date = text(request.data?.appointmentDate, 20), time = text(request.data?.appointmentTime, 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) fail("invalid-argument", "A valid onboarding appointment date and time are required.");
    const same = text(found.data.onboardingAppointmentDate, 20) === date && text(found.data.onboardingAppointmentTime, 20) === time;
    if (same) return { status: "UNCHANGED", idempotent: true, appointmentId: `crm4:${found.ref.id}:onboarding` };
    const at = new Date().toISOString();
    await found.ref.update({ onboardingAppointmentDate: date, onboardingAppointmentTime: time, onboardingAppointmentAgentName: "Onboarding Agent", appointmentId: `crm4:${found.ref.id}:onboarding`, appointmentStatus: found.data.appointmentConfirmationSentAt ? "rescheduled" : "scheduled", appointmentOriginatingListerUid: who.uid, appointmentOriginatingListerName: who.name,
      appointmentConfirmationKey: FieldValue.delete(), appointmentConfirmationSentAt: FieldValue.delete(), appointmentConfirmationProviderId: FieldValue.delete(), lastUpdatedAt: now(), appointmentAudit: history({ action: "lister_onboarding_appointment_saved", byUid: who.uid, at, previous: { date: text(found.data.onboardingAppointmentDate,20), time: text(found.data.onboardingAppointmentTime,20) }, next: { date, time, agentName: "Onboarding Agent" } }) });
    return { status: "SAVED", idempotent: false, appointmentId: `crm4:${found.ref.id}:onboarding`, rescheduled: Boolean(found.data.appointmentConfirmationSentAt) };
  });

  const listerPreviewAppointment = onCall(async request => {
    const { found } = await listerAppointmentAuthority(request), date = text(found.data.onboardingAppointmentDate,20), time = text(found.data.onboardingAppointmentTime,20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) fail("failed-precondition", "Save a valid onboarding appointment first.");
    const context = await assessmentContext(found.data), template = appointmentEmailTemplate({ lead: found.data, assessment: context.assessment, appointmentDate: date, appointmentTime: time, agentName: "Onboarding Agent" });
    return { subject: template.subject, body: template.body, previewKey: template.previewKey, appointmentId: `crm4:${found.ref.id}:onboarding`, alreadySent: found.data.appointmentConfirmationKey === template.previewKey && Boolean(found.data.appointmentConfirmationSentAt) };
  });

  const listerSendAppointment = onCall({ secrets: [resendSecret] }, async request => {
    const { who, found } = await listerAppointmentAuthority(request), date = text(found.data.onboardingAppointmentDate,20), time = text(found.data.onboardingAppointmentTime,20), recipient = email(found.data.email || found.data.emailAddress), context = await assessmentContext(found.data);
    const template = appointmentEmailTemplate({ lead: found.data, assessment: context.assessment, appointmentDate: date, appointmentTime: time, agentName: "Onboarding Agent" });
    if (!recipient || text(request.data?.previewKey,100) !== template.previewKey) fail("failed-precondition", "Refresh the current appointment confirmation before sending.");
    if (found.data.appointmentConfirmationKey === template.previewKey && found.data.appointmentConfirmationSentAt) return { status:"ALREADY_SENT", idempotent:true };
    const result = process.env.FUNCTIONS_EMULATOR === "true" ? { data:{ id:`emulator-crm4-lister-appointment-${found.ref.id}` } } : await resend.emails.send({from:"Quaerens Client Support <clientsupport@quaerens.co.uk>",to:recipient,subject:template.subject,...template.content,tags:[{name:"type",value:"crm4_lister_appointment"}]},{idempotencyKey:`crm4-lister-appointment-${found.ref.id}-${template.previewKey}`});
    if(result?.error) fail("internal",result.error.message||"The appointment confirmation could not be sent.");
    const at=new Date().toISOString(); await found.ref.update({appointmentStatus:"confirmed",appointmentConfirmationKey:template.previewKey,appointmentConfirmationSentAt:now(),appointmentConfirmationSentByUid:who.uid,appointmentConfirmationProviderId:text(result?.data?.id||result?.id,200),lastUpdatedAt:now(),actionHistory:history({action:"lister_onboarding_appointment_confirmation_sent",byUid:who.uid,at,notes:`Appointment confirmation sent for ${date} ${time}.`}),appointmentAudit:history({action:"lister_onboarding_appointment_confirmed",byUid:who.uid,at,next:{date,time,agentName:"Onboarding Agent"}})});
    return {status:"SENT",idempotent:false,previewKey:template.previewKey};
  });

  const managerConfirmAppointment = onCall(async request => {
    const who = await actor(request, ["manager", "administrator"]), found = await leadFor(request.data?.leadId), data = request.data || {};
    if (!["awaiting-manager-review", "approved", "closer-assigned", "appointment-booked"].includes(found.data.status)) fail("failed-precondition", "The lead is not in a Manager appointment stage.");
    if (!found.data.assessmentId || found.data.assessmentStatus !== "COMPLETED") fail("failed-precondition", "A linked completed governed assessment is required before confirming an onboarding appointment.");
    const appointmentDate = text(data.appointmentDate, 20), appointmentTime = text(data.appointmentTime, 20), recipient = email(found.data.email || found.data.emailAddress);
    if (!recipient || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime)) fail("failed-precondition", "Client email and a valid appointment are required.");
    const appointment = await appointmentContext(found.data);
    const storedDate = appointment.date;
    const storedTime = appointment.time;
    if (appointmentDate !== storedDate || appointmentTime !== storedTime) fail("failed-precondition", "The appointment details changed. Refresh the appointment email before sending.");
    const agentName = appointment.agentName;
    const context = await assessmentContext(found.data), template = appointmentEmailTemplate({ lead: found.data, assessment: context.assessment, appointmentDate, appointmentTime, agentName });
    const confirmationKey = template.previewKey;
    const legacyKey = `${appointmentDate}|${appointmentTime}|${agentName}`;
    if ([confirmationKey, legacyKey].includes(found.data.appointmentConfirmationKey) && found.data.appointmentConfirmationSentAt)
      return { status: "ALREADY_CURRENT", idempotent: true, updateRequired: false };
    if (text(data.previewKey, 100) !== template.previewKey) fail("failed-precondition", "The appointment email preview is stale. Refresh it before sending.");
    const isClientUpdate = Boolean(found.data.appointmentConfirmationSentAt);
    const updateNumber = isClientUpdate ? Number(found.data.appointmentConfirmationResendCount || 0) + 1 : 0;
    const result = process.env.FUNCTIONS_EMULATOR === "true"
      ? { data: { id: `emulator-crm4-manager-appointment-${found.ref.id}-${updateNumber}` } }
      : await resend.emails.send({ from: "Quaerens Client Support <clientsupport@quaerens.co.uk>", to: recipient, subject: template.subject, ...template.content, tags: [{ name: "type", value: "crm4_manager_appointment_update" }] }, { idempotencyKey: `crm4-manager-appointment-update-${found.ref.id}-${template.previewKey}` });
    if (result?.error) fail("internal", result.error.message || "The appointment confirmation could not be sent.");
    const at = new Date().toISOString();
    await found.ref.update({ onboardingAppointmentDate: appointmentDate, onboardingAppointmentTime: appointmentTime, onboardingAppointmentAgentName: agentName, appointmentId: `crm4:${found.ref.id}:onboarding`, appointmentStatus: "confirmed", appointmentConfirmationKey: confirmationKey, appointmentConfirmationSentAt: now(), appointmentConfirmationProviderId: text(result?.data?.id || result?.id, 200), appointmentConfirmationResendCount: updateNumber, lastUpdatedAt: now(), actionHistory: history({ action: isClientUpdate ? "manager_updated_appointment_confirmation_sent" : "manager_appointment_confirmation_sent", byUid: who.uid, at, notes: `${isClientUpdate ? "Updated a" : "A"}ppointment confirmation sent for ${appointmentDate} ${appointmentTime}.` }), appointmentAudit: history({ action: isClientUpdate ? "manager_updated_appointment_confirmed" : "manager_appointment_confirmed", byUid: who.uid, at, previous: { date: text(found.data.onboardingAppointmentDate, 20), time: text(found.data.onboardingAppointmentTime, 20), agentName: text(found.data.onboardingAppointmentAgentName, 160) }, next: { date: appointmentDate, time: appointmentTime, agentName } }) });
    return { status: isClientUpdate ? "UPDATED_SENT" : "SENT", idempotent: false, updateRequired: false, templateId: template.templateId, templateVersion: template.templateVersion, previewKey: template.previewKey };
  });

  const managerPreviewAppointment = onCall(async request => {
    await actor(request, ["manager", "administrator"]);
    const found = await leadFor(request.data?.leadId);
    if (!found.data.assessmentId || found.data.assessmentStatus !== "COMPLETED") fail("failed-precondition", "A linked completed governed assessment is required.");
    const appointment = await appointmentContext(found.data);
    const appointmentDate = appointment.date;
    const appointmentTime = appointment.time;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime)) fail("failed-precondition", "A valid appointment date and time are required.");
    const agentName = appointment.agentName;
    const context = await assessmentContext(found.data);
    const template = appointmentEmailTemplate({ lead: found.data, assessment: context.assessment, appointmentDate, appointmentTime, agentName });
    const legacyKey = `${appointmentDate}|${appointmentTime}|${agentName}`;
    const alreadyCurrent = [template.previewKey, legacyKey].includes(found.data.appointmentConfirmationKey) && Boolean(found.data.appointmentConfirmationSentAt);
    return { subject: template.subject, text: template.content.text, html: template.content.html, previewKey: template.previewKey, templateId: template.templateId, templateVersion: template.templateVersion, appointmentDate, appointmentTime, agentName, category: template.category, checklist: template.checklist, alreadyCurrent, updateRequired: !alreadyCurrent };
  });

  const managerGetAssessment = onCall(request => linkedAssessmentProjection(request, ["manager", "administrator"]));
  const managerDownloadAssessmentReport = onCall(request => linkedAssessmentReport(request, ["manager", "administrator"]));
  const closerGetAssessment = onCall(request => linkedAssessmentProjection(request, ["closer"]));
  const closerDownloadAssessmentReport = onCall(request => linkedAssessmentReport(request, ["closer"]));

  async function agreementForCloser(request) {
    const who = await actor(request, ["closer"]), found = await leadFor(request.data?.leadId);
    if (found.data.closerUid !== who.uid && found.data.assignedUserId !== who.uid)
      fail("permission-denied", "This lead is not assigned to the signed-in Closer.");
    if (found.data.outcome !== "Closed Deal" || found.data.status !== "closed-deal-awaiting-payment")
      fail("failed-precondition", "Record the Closed Deal and agreed fee before preparing the agreement.");
    return { who, found };
  }

  const closerGetAgreement = onCall(async request => {
    const { found } = await agreementForCloser(request);
    const commercial = authoritativeAgreementCommercial(found.data);
    if (!commercial) fail("failed-precondition", "The authoritative CRM4 Closed Deal fee cannot be resolved. Agreement generation is blocked.");
    const documentId = text(found.data.agreementDocumentId, 180) || `${found.ref.id}-v${AGREEMENT_TEMPLATE_VERSION}`;
    const snap = await db.collection("crm4AgreementRecords").doc(documentId).get();
    const record = snap.exists ? snap.data() : null;
    const recordMatches = Boolean(record && Number(record.agreedFeeAmount) === commercial.agreedFeeAmount && record.agreedFeeCurrency === commercial.agreedFeeCurrency && record.paymentOptionId === commercial.paymentOptionId && text(record.agreementText, 60000).includes(commercial.serviceFeeDisplay));
    return { agreement: recordMatches ? { id: snap.id, ...record } : null, agreementIntegrity: !record ? "NOT_GENERATED" : recordMatches ? "PASS" : "REGENERATION_REQUIRED", commercial, leadStatus: text(found.data.agreementStatus, 40) || "not_generated" };
  });

  const closerPreviewAgreementEmail = onCall(async request => {
    await agreementForCloser(request);
    const body = text(request.data?.emailBody, 20000);
    if (!body) fail("invalid-argument", "Agreement email wording is required.");
    return renderCrm2CorporateEmail(body);
  });

  const closerSaveAgreement = onCall(async request => {
    const { who, found } = await agreementForCloser(request), data = request.data || {};
    const agreementText = text(data.agreementText, 60000), subject = text(data.subject, 300), emailBody = text(data.emailBody, 20000);
    if (!agreementText || !subject || !emailBody) fail("invalid-argument", "Agreement wording, email subject and email body are required.");
    const documentId = `${found.ref.id}-v${AGREEMENT_TEMPLATE_VERSION}`, agreementRef = db.collection("crm4AgreementRecords").doc(documentId);
    return db.runTransaction(async transaction => {
      const [leadSnap, agreementSnap] = await Promise.all([transaction.get(found.ref), transaction.get(agreementRef)]), lead = leadSnap.data(), commercial = authoritativeAgreementCommercial(lead);
      if (lead.closerUid !== who.uid && lead.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Closer.");
      if (!commercial || Number(data.agreedFeeAmount) !== commercial.agreedFeeAmount || text(data.agreedFeeCurrency, 8) !== commercial.agreedFeeCurrency || text(data.paymentOptionId, 80) !== commercial.paymentOptionId || !agreementText.includes(commercial.serviceFeeDisplay)) fail("failed-precondition", "The agreement fee does not match the authoritative CRM4 Closed Deal. Refresh before generating the agreement.");
      const contentHash = crypto.createHash("sha256").update(JSON.stringify({ agreementText, subject, emailBody, commercial, version: AGREEMENT_TEMPLATE_VERSION })).digest("hex");
      if (["sent","signed"].includes(lead.agreementStatus)) return { status: "ALREADY_SENT", idempotent: true, agreementDocumentId: documentId };
      if (agreementSnap.exists && agreementSnap.data().contentHash === contentHash) return { status: "ALREADY_GENERATED", idempotent: true, agreementDocumentId: documentId };
      const at = new Date().toISOString();
      transaction.set(agreementRef, { crm4LeadId: found.ref.id, source: "crm4Leads", sourceId: found.ref.id, clientName: clientNames(lead), clientEmail: email(lead.email || lead.emailAddress), agreementText, subject, emailBody, agreedFeeAmount: commercial.agreedFeeAmount, agreedFeeCurrency: commercial.agreedFeeCurrency, paymentOptionId: commercial.paymentOptionId, paymentOptionType: commercial.paymentOptionType, serviceFeeDisplay: commercial.serviceFeeDisplay, commercialAuthority: "crm4Leads", contentHash, agreementVersion: AGREEMENT_TEMPLATE_VERSION, status: "generated", generatedAt: now(), generatedByUid: who.uid, updatedAt: now() }, { merge: false });
      transaction.update(found.ref, { agreementStatus: "generated", agreementGeneratedAt: now(), agreementGeneratedByUid: who.uid, agreementDocumentId: documentId, agreementVersion: AGREEMENT_TEMPLATE_VERSION, agreementContentHash: contentHash, lastUpdatedAt: now(), actionHistory: history({ action: "agreement_generated", byUid: who.uid, at, notes: `Agreement version ${AGREEMENT_TEMPLATE_VERSION} generated through the governed CRM4 agreement workflow.` }) });
      return { status: "GENERATED", idempotent: false, agreementDocumentId: documentId };
    });
  });

  async function sendCommercialInternalNotification({ leadRef, lead, who, kind }) {
    const agreement = kind === "agreement", eventId = text(agreement ? lead.agreementSentEventId : lead.paymentRequestEventId, 240);
    const sentField = agreement ? "agreementSentInternalNotificationAt" : "processingPaymentNotificationAt";
    if (!eventId || lead[sentField]) return { idempotent: true };
    // Processing/Support operational notifications are one provider event:
    // Support owns the action and Info receives the governed management copy.
    const recipient = "support@quaerens.co.uk";
    const directLink = agreement ? `https://www.quaerens.co.uk/processing-dashboard.html?queue=awaiting-signed-agreement&lead=${encodeURIComponent(leadRef.id)}` : `https://www.quaerens.co.uk/processing-dashboard.html?queue=awaiting-intake-payment&lead=${encodeURIComponent(leadRef.id)}`;
    const amount = Number(lead.agreedFeeAmount || 0), route = text(lead.claimType || lead.assessmentRoute, 160) || "Not recorded";
    const subject = agreement ? `CRM4 Agreement Sent — ${clientNames(lead)} — ${route}` : `New CRM4 Payment Awaiting — ${clientNames(lead)} — ${new Intl.NumberFormat("en-GB", { style:"currency", currency:"GBP" }).format(amount)}`;
    const body = agreement
      ? `A CRM4 Agreement has been sent successfully and is awaiting signed-return verification.\n\nClient: ${clientNames(lead)}\nCRM4 Lead ID: ${leadRef.id}\nRoute: ${route}\nCampaign/source: ${text(lead.campaign || lead.referralSource,160) || "Not recorded"}\nAssigned Closer: ${who.name || text(lead.assignedToName,160) || "Assigned Closer"}\nFramework B assessment: ${text(lead.assessmentStatus,80)}\nQAR: ${text(lead.assessmentQar,120)}\nAgreement reference/version: ${text(lead.agreementDocumentId,180)} / ${lead.agreementVersion || AGREEMENT_TEMPLATE_VERSION}\nAgreed fee: GBP ${amount.toFixed(2)}\nAppointment: ${text(lead.onboardingAppointmentDate,20)} ${text(lead.onboardingAppointmentTime,20)}\nAgreement status: Agreement Sent\nPayment status: ${text(lead.paymentStatus,60) || "not_requested"}\nProcessing status: ${text(lead.processingStatus,60) || "not_started"}\n\nAction required: verify the returned/signed agreement when received.\n\nProtected record: ${directLink}\n\nCRM4 remains authoritative; this email is an operational notification only.`
      : `A CRM4 secure payment request has been sent successfully and is awaiting Intake Assessment Fee confirmation.\n\nClient: ${clientNames(lead)}\nCRM4 Lead ID: ${leadRef.id}\nRoute: ${route}\nAssigned Closer: ${who.name || text(lead.assignedToName,160) || "Assigned Closer"}\nFramework B / QAR: ${text(lead.assessmentQar,120)}\nAgreement status: Signed\nAgreement reference/version: ${text(lead.agreementDocumentId,180)} / ${lead.agreementVersion || AGREEMENT_TEMPLATE_VERSION}\nExpected fee: GBP ${amount.toFixed(2)}\nPayment option: ${text(lead.paymentOptionId,80)}\nSecure payment link used: ${text(lead.securePaymentLink,1000)}\nPayment status: Awaiting Payment\nProcessing status: Not Started\n\nAction required: confirm the Intake Assessment Fee when payment is received.\n\nProtected payment record: ${directLink}`;
    const managementCopy = "info@quaerens.co.uk";
    const content = renderCrm2CorporateEmail(body), providerRequest = commercialInternalProviderRequest({ kind, eventId, subject, content });
    const result = process.env.FUNCTIONS_EMULATOR === "true" ? { data:{ id:`emulator-${kind}-internal-${leadRef.id}` } } : await resend.emails.send(providerRequest.payload, providerRequest.options);
    if (result?.error) fail("internal", result.error.message || "The internal commercial notification could not be sent.");
    const patch = agreement
      ? { agreementSentInternalNotificationAt:now(), agreementSentInternalNotificationRecipient:recipient, agreementSentInternalNotificationManagementCopyRecipient:managementCopy, agreementSentInternalNotificationProviderId:text(result?.data?.id||result?.id,200), agreementSentInternalNotificationEventId:eventId, agreementSentInternalNotificationRetryState:"sent" }
      : { processingPaymentNotificationAt:now(), processingPaymentNotificationRecipient:recipient, processingPaymentNotificationManagementCopyRecipient:managementCopy, processingPaymentNotificationProviderId:text(result?.data?.id||result?.id,200), processingPaymentNotificationEventId:eventId, processingPaymentNotificationRetryState:"sent" };
    patch.actionHistory = history({ action:agreement?"agreement_sent_internal_notification":"processing_payment_notification_sent", byUid:who.uid, at:new Date().toISOString(), notes:`Silent governed internal notification sent to ${recipient}${managementCopy ? ` with management copy to ${managementCopy}` : ""}.`, eventId }); patch.lastUpdatedAt=now();
    await leadRef.update(patch); return { idempotent:false };
  }

  const closerSendAgreement = onCall({ secrets: [resendSecret] }, async request => {
    const { who, found } = await agreementForCloser(request), data = request.data || {};
    if (["sent","signed"].includes(found.data.agreementStatus) && found.data.agreementSentAt) { await sendCommercialInternalNotification({leadRef:found.ref,lead:found.data,who,kind:"agreement"}); return { status: "ALREADY_SENT", idempotent: true }; }
    const documentId = text(found.data.agreementDocumentId, 180), agreementSnap = documentId ? await db.collection("crm4AgreementRecords").doc(documentId).get() : null;
    if (!agreementSnap?.exists || found.data.agreementStatus !== "generated") fail("failed-precondition", "Generate and save the governed agreement before sending it.");
    const agreement = agreementSnap.data(), commercial = authoritativeAgreementCommercial(found.data), pdfBase64 = text(data.pdfBase64, 9000000), filename = text(data.pdfFileName, 180) || "Quaerens-Agreement.pdf";
    if (!commercial || Number(agreement.agreedFeeAmount) !== commercial.agreedFeeAmount || agreement.agreedFeeCurrency !== commercial.agreedFeeCurrency || agreement.paymentOptionId !== commercial.paymentOptionId || !text(agreement.agreementText, 60000).includes(commercial.serviceFeeDisplay)) fail("failed-precondition", "The saved agreement no longer matches the authoritative CRM4 commercial state. Regenerate it before sending.");
    if (!pdfBase64 || agreement.contentHash !== found.data.agreementContentHash) fail("failed-precondition", "The agreement PDF or governed agreement version could not be verified.");
    const recipient = email(found.data.email || found.data.emailAddress);
    if (!recipient || recipient !== email(agreement.clientEmail)) fail("failed-precondition", "The authoritative client email changed. Regenerate the agreement before sending.");
    const content = renderCrm2CorporateEmail(agreement.emailBody);
    const result = process.env.FUNCTIONS_EMULATOR === "true" ? { data: { id: `emulator-crm4-agreement-${found.ref.id}` } } : await resend.emails.send({ from: "Quaerens Client Support <clientsupport@quaerens.co.uk>", to: recipient, subject: agreement.subject, ...content, attachments: [{ filename, content: pdfBase64 }], tags: [{ name: "type", value: "crm4_agreement" }] }, { idempotencyKey: `crm4-agreement-${found.ref.id}-${agreement.contentHash}` });
    if (result?.error) fail("internal", result.error.message || "The agreement email could not be sent.");
    const outcome = await db.runTransaction(async transaction => {
      const [leadSnap, recordSnap] = await Promise.all([transaction.get(found.ref), transaction.get(agreementSnap.ref)]), lead = leadSnap.data();
      if (lead.agreementStatus === "sent" && lead.agreementSentAt) return { status: "ALREADY_SENT", idempotent: true };
      if (!recordSnap.exists || lead.agreementContentHash !== agreement.contentHash || lead.agreementStatus !== "generated") fail("failed-precondition", "Agreement state changed while sending; no duplicate local state was recorded.");
      const providerId = text(result?.data?.id || result?.id, 200), at = new Date().toISOString();
      transaction.update(agreementSnap.ref, { status: "sent", sentAt: now(), sentByUid: who.uid, providerId, updatedAt: now() });
      const eventId=`crm4:${found.ref.id}:agreement-sent:v${AGREEMENT_TEMPLATE_VERSION}:${agreement.contentHash}`;
      transaction.update(found.ref, { agreementStatus: "sent", agreementSentAt: now(), agreementSentByUid: who.uid, agreementProviderId: providerId, agreementSentEventId:eventId, lastUpdatedAt: now(), actionHistory: history({ action: "agreement_sent", byUid: who.uid, at, notes: `Governed agreement version ${AGREEMENT_TEMPLATE_VERSION} sent to the authoritative client email.`, eventId }) });
      return { status: "SENT", idempotent: false, eventId };
    });
    const refreshed=(await found.ref.get()).data(); await sendCommercialInternalNotification({leadRef:found.ref,lead:refreshed,who,kind:"agreement"}); return outcome;
  });

  const closerRecordClosedDeal = onCall(async request => {
    const who = await actor(request, ["closer"]), data = request.data || {}, leadId = text(data.leadId, 180);
    const option = paymentOption(data);
    if (!leadId || !option) fail("invalid-argument", "Select Stripe with a valid case-specific amount or an approved Bank Transfer amount. No approved Bank Transfer payment link is configured for unsupported amounts.");
    const agreedFeeAmount = option.amount, agreedFeeCurrency = option.currency;
    const payload = { closerNotes: text(data.closerNotes, 8000), processingNotes: text(data.processingNotes, 8000), agreedFeeAmount, agreedFeeCurrency, paymentOptionId: option.id, paymentOptionType: option.type, securePaymentLink: option.url, securePaymentLinkHash: crypto.createHash("sha256").update(option.url).digest("hex") };
    const requestHash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const leadRef = db.collection("crm4Leads").doc(leadId);
    return db.runTransaction(async transaction => {
      const snap = await transaction.get(leadRef);
      if (!snap.exists) fail("not-found", "The CRM4 lead was not found.");
      const lead = snap.data();
      if (lead.closerUid !== who.uid && lead.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Closer.");
      if (lead.status === "closed-deal-awaiting-payment") {
        if (lead.closedDealRequestHash !== requestHash) fail("failed-precondition", "This Closed Deal retry conflicts with the governed record.");
        return { status: "ALREADY_AWAITING_PAYMENT", idempotent: true };
      }
      if (!["closer-assigned", "appointment-booked"].includes(lead.status) || lead.managerDecision !== "approved") fail("failed-precondition", "A Manager-approved assigned Closer lead is required.");
      if (!lead.assessmentId || lead.assessmentStatus !== "COMPLETED") fail("failed-precondition", "A linked completed assessment is required.");
      const at = new Date().toISOString();
      transaction.update(leadRef, { outcome: "Closed Deal", status: "closed-deal-awaiting-payment", leadStatus: "awaiting_payment", ...payload, paymentStatus: "not_requested", closedDealRecordedAt: now(), closedDealRecordedByUid: who.uid, closedDealRequestHash: requestHash, lastUpdatedAt: now(), actionHistory: history({ action: "closed_deal_awaiting_payment", byUid: who.uid, at, notes: `Closed Deal recorded at ${agreedFeeCurrency} ${agreedFeeAmount.toFixed(2)}; Processing remains gated pending verified payment.` }) });
      return { status: "CLOSED_DEAL_AWAITING_PAYMENT", idempotent: false };
    });
  });

  const closerPreparePaymentEmail = onCall(async request => {
    const who = await actor(request, ["closer"]), data = request.data || {}, found = await leadFor(data.leadId);
    if (found.data.closerUid !== who.uid && found.data.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Closer.");
    if (found.data.status !== "closed-deal-awaiting-payment" || found.data.outcome !== "Closed Deal") fail("failed-precondition", "Record the Closed Deal before preparing payment.");
    const option = storedPaymentOption(found.data), recipient = email(found.data.email || found.data.emailAddress);
    const agreementSent = ["sent", "signed"].includes(found.data.agreementStatus) && Boolean(found.data.agreementSentAt);
    const agreementSigned = found.data.agreementStatus === "signed" && Boolean(found.data.agreementSignedAt);
    if (option?.type === "stripe_live" ? !agreementSent : !agreementSigned) fail("failed-precondition", option?.type === "stripe_live" ? "Send the governed Agreement before preparing a Stripe payment request." : "Processing must confirm the Agreement Signed before preparing this Bank Transfer payment request.");
    if (!recipient || !option || option.amount !== Number(found.data.agreedFeeAmount)) fail("failed-precondition", "The authoritative client email and governed payment option are required.");
    if (option.type === "stripe_live" && !option.url) fail("failed-precondition", "Create the governed Stripe payment request first.");
    const amount = option.amount, link = option.url;
    const template = paymentEmailTemplate({ lead: { ...found.data, id: found.ref.id }, amount, securePaymentLink: link, provider: option.type });
    const linkHash = crypto.createHash("sha256").update(link).digest("hex");
    const duplicate = await db.runTransaction(async transaction => {
      const snap = await transaction.get(found.ref), current = snap.data();
      if (current.closerUid !== who.uid && current.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Closer.");
      if (current.status !== "closed-deal-awaiting-payment" || Number(current.agreedFeeAmount) !== amount) fail("failed-precondition", "The Closed Deal or agreed fee changed. Refresh before preparing payment.");
      if (current.securePaymentLinkHash === linkHash && current.paymentEmailPreviewKey === template.previewKey && ["PREPARED", "PROVIDER_ACCEPTED", "DELIVERED"].includes(current.paymentEmailStatus)) return true;
      const patch = { securePaymentLink: link, securePaymentLinkHash: linkHash, paymentOptionId: option.id, paymentOptionType: option.type, paymentLinkEnteredAt: now(), paymentLinkEnteredByUid: who.uid, paymentEmailStatus: "PREPARED", paymentEmailPreparedAt: now(), paymentEmailPreparedByUid: who.uid, paymentEmailPreviewKey: template.previewKey, lastUpdatedAt: now(), actionHistory: history({ action: "secure_payment_email_prepared", byUid: who.uid, at: new Date().toISOString(), notes: `Secure payment email prepared for GBP ${amount.toFixed(2)} using ${option.id}; URL omitted from audit.` }) };
      if (option.type !== "stripe_live") patch.paymentStatus = "link_ready";
      transaction.update(found.ref, patch);
      return false;
    });
    return { subject: template.subject, text: template.content.text, previewText: template.previewText, html: template.content.html, previewKey: template.previewKey, recipient, amount, currency: "GBP", idempotent: duplicate };
  });

  const closerSendPaymentEmail = onCall({ secrets: [resendSecret] }, async request => {
    const who = await actor(request, ["closer"]), found = await leadFor(request.data?.leadId);
    if (found.data.closerUid !== who.uid && found.data.assignedUserId !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in Closer.");
    if (["PROVIDER_ACCEPTED", "DELIVERED"].includes(found.data.paymentEmailStatus) && found.data.paymentEmailProviderAcceptedAt) { await sendCommercialInternalNotification({leadRef:found.ref,lead:found.data,who,kind:"payment"}); return { status: "ALREADY_SENT", idempotent: true }; }
    const stripeReady = found.data.paymentOptionType === "stripe_live" && found.data.paymentStatus === "payment_requested";
    const agreementSent = ["sent", "signed"].includes(found.data.agreementStatus) && Boolean(found.data.agreementSentAt);
    const agreementSigned = found.data.agreementStatus === "signed" && Boolean(found.data.agreementSignedAt);
    if (stripeReady ? !agreementSent : !agreementSigned) fail("failed-precondition", stripeReady ? "Send the governed Agreement before sending the Stripe payment request." : "Processing must confirm the Agreement Signed before sending this Bank Transfer payment request.");
    if (!stripeReady && found.data.paymentStatus !== "link_ready") fail("failed-precondition", "Generate the current secure payment email before sending.");
    if (found.data.paymentEmailStatus !== "PREPARED") fail("failed-precondition", "Generate and review the current secure payment email before sending.");
    const option = storedPaymentOption(found.data), amount = option?.amount, link = option?.url, recipient = email(found.data.email || found.data.emailAddress);
    if (!option || amount !== Number(found.data.agreedFeeAmount) || !recipient || !link) fail("failed-precondition", "The governed payment option is no longer valid. Refresh before sending.");
    const template = paymentEmailTemplate({ lead: { ...found.data, id: found.ref.id }, amount, securePaymentLink: link, provider: option.type });
    if (text(request.data?.previewKey, 100) !== template.previewKey || found.data.paymentEmailPreviewKey !== template.previewKey) fail("failed-precondition", "The payment email preview is stale. Refresh it before sending.");
    const result = process.env.FUNCTIONS_EMULATOR === "true" ? { data: { id: `emulator-crm4-payment-${found.ref.id}` } } : await resend.emails.send({ from: "Quaerens Client Support <clientsupport@quaerens.co.uk>", to: recipient, subject: template.subject, ...template.content, tags: [{ name: "type", value: "crm4_secure_payment" }] }, { idempotencyKey: `crm4-secure-payment-${found.ref.id}-${template.previewKey}` });
    if (result?.error) fail("internal", result.error.message || "The secure payment email could not be sent.");
    const duplicate = await db.runTransaction(async transaction => {
      const snap = await transaction.get(found.ref), current = snap.data();
      if (["PROVIDER_ACCEPTED", "DELIVERED"].includes(current.paymentEmailStatus) && current.paymentEmailProviderAcceptedAt) return true;
      const currentStripeReady = current.paymentOptionType === "stripe_live" && current.paymentStatus === "payment_requested";
      if ((!currentStripeReady && current.paymentStatus !== "link_ready") || current.paymentEmailStatus !== "PREPARED" || current.paymentEmailPreviewKey !== template.previewKey) fail("failed-precondition", "Payment state changed while sending; no local duplicate state was recorded.");
      const eventId=`crm4:${found.ref.id}:payment-request:${template.previewKey}`;
      transaction.update(found.ref, { paymentStatus: "payment_requested", paymentEmailStatus: "PROVIDER_ACCEPTED", paymentEmailProviderAcceptedAt: now(), paymentEmailProviderId: text(result?.data?.id || result?.id, 200), paymentEmailRecipient: recipient, paymentEmailSentByUid: who.uid, paymentRequestSentAt: now(), paymentRequestSentByUid: who.uid, paymentRequestRecipient: recipient, paymentRequestProviderId: text(result?.data?.id || result?.id, 200), paymentRequestOptionId: option.id, paymentRequestOptionType: option.type, paymentRequestEventId:eventId, lastUpdatedAt: now(), actionHistory: history({ action: "secure_payment_link_sent", byUid: who.uid, at: new Date().toISOString(), notes: `Secure payment email accepted by the provider for GBP ${amount.toFixed(2)} using ${option.id}.`, eventId }) });
      return false;
    });
    const refreshed=(await found.ref.get()).data(); await sendCommercialInternalNotification({leadRef:found.ref,lead:refreshed,who,kind:"payment"}); return { status: duplicate ? "ALREADY_SENT" : "SENT", idempotent: duplicate };
  });

  const adminConfirmPayment = onCall(async request => {
    if (!request.auth || request.auth.token.platformAdmin !== true) fail("permission-denied", "Platform administrator access is required.");
    fail("failed-precondition", "Use Processing & Admin / Payments for atomic payment confirmation and Processing activation.");
  });

  const managerUpdateLead = onCall(async request => {
    const data = request.data || {}, leadId = text(data.leadId, 180), action = text(data.action, 40).toUpperCase();
    const allowedActions = new Set(["SAVE_NOTES", "SAVE_REVIEW", "QUALIFY", "REQUEST_INFORMATION", "APPROVE", "REJECT", "CLOSE"]);
    const allowedRequestFields = new Set(["leadId", "action", "managerNotes", "managerOutcome"]);
    if (Object.keys(data).some(field => !allowedRequestFields.has(field))) fail("invalid-argument", "Unsupported CRM4 Manager fields were supplied.");
    if (!leadId || !allowedActions.has(action)) fail("invalid-argument", "Select a governed CRM4 Manager action.");
    const who = await actor(request, ["manager", "administrator"]);
    const leadRef = db.collection("crm4Leads").doc(leadId), memberRef = db.collection("crm4Memberships").doc(who.uid);
    const managerNotes = text(data.managerNotes, 8000), managerOutcome = text(data.managerOutcome, 160);
    const noteStages = new Set(["awaiting-manager-review", "information-requested", "approved", "rejected", "closer-assigned", "appointment-booked"]);
    const reviewStages = new Set(["awaiting-manager-review", "information-requested", "approved"]), at = new Date().toISOString();
    return db.runTransaction(async transaction => {
      const [leadSnap, memberSnap] = await Promise.all([transaction.get(leadRef), transaction.get(memberRef)]);
      if (!leadSnap.exists) fail("not-found", "The CRM4 lead was not found.");
      const member = memberSnap.exists ? memberSnap.data() : {};
      if (member.active !== true || member.workspaceId !== "CRM4" || !["manager", "administrator"].includes(member.role))
        fail("permission-denied", "This CRM4 Manager action is not authorised for the signed-in role.");
      const lead = leadSnap.data(), stage = text(lead.status, 80), actorName = text(member.displayName || member.name, 160);
      if (lead.workspaceId !== "CRM4") fail("failed-precondition", "The lead is not an authoritative CRM4 record.");
      if (!noteStages.has(stage)) fail("failed-precondition", "The lead is not in a valid CRM4 Manager stage.");
      const reviewed = { managerReviewedAt: now(), managerReviewedByUid: who.uid, managerReviewedByName: actorName, lastUpdatedAt: now() };
      let patch = {}, historyAction = "", historyNotes = "", alreadyApplied = false;
      if (action === "SAVE_NOTES") {
        alreadyApplied = text(lead.managerNotes, 8000) === managerNotes;
        patch = { managerNotes, lastAction: "notes_saved", lastUpdatedAt: now() };
        historyAction = "manager_notes_saved"; historyNotes = "Manager notes saved.";
      } else {
        if (!reviewStages.has(stage) && !(["REJECT", "CLOSE"].includes(action) && stage === "rejected")) fail("failed-precondition", "This CRM4 Manager review transition is not valid from the current stage.");
        if (action === "SAVE_REVIEW") {
          alreadyApplied = text(lead.managerNotes, 8000) === managerNotes && text(lead.managerOutcome, 160) === managerOutcome;
          patch = { ...reviewed, managerNotes, managerOutcome, lastAction: "manager_review_saved" };
          historyAction = "manager_review_saved"; historyNotes = "Manager review saved.";
        } else if (action === "QUALIFY") {
          alreadyApplied = lead.leadStatus === "qualified" && lead.lastAction === "qualified";
          patch = { ...reviewed, leadStatus: "qualified", managerOutcome: managerOutcome || text(lead.managerOutcome, 160), managerNotes: managerNotes || text(lead.managerNotes, 8000), lastAction: "qualified" };
          historyAction = "qualified"; historyNotes = "Lead marked as qualified by Manager.";
        } else if (action === "REQUEST_INFORMATION") {
          alreadyApplied = stage === "information-requested" && lead.managerDecision === "information-requested";
          patch = { ...reviewed, status: "information-requested", leadStatus: "awaiting_information", managerDecision: "information-requested", managerOutcome, managerNotes, callbackRequired: true, lastAction: "manager_information_requested" };
          historyAction = "manager_information_requested"; historyNotes = "Manager requested further information.";
        } else if (action === "APPROVE") {
          alreadyApplied = stage === "approved" && lead.managerDecision === "approved";
          patch = { ...reviewed, status: "approved", leadStatus: "converted", managerDecision: "approved", managerOutcome, managerNotes, closed: false, usable: true, callbackRequired: false, introEmailNeeded: false, lastAction: "manager_approved" };
          historyAction = "manager_approved"; historyNotes = "Lead approved by Manager for governed Closer handoff.";
        } else if (action === "REJECT") {
          alreadyApplied = stage === "rejected" && lead.managerDecision === "rejected";
          patch = { ...reviewed, status: "rejected", leadStatus: "closed", managerDecision: "rejected", managerOutcome, managerNotes, closed: true, usable: false, callbackRequired: false, introEmailNeeded: false, lastAction: "manager_rejected" };
          historyAction = "manager_rejected"; historyNotes = "Lead rejected by Manager.";
        } else if (action === "CLOSE") {
          alreadyApplied = lead.closed === true && lead.leadStatus === "closed";
          patch = { ...reviewed, status: "rejected", leadStatus: "closed", managerDecision: text(lead.managerDecision, 80) || "rejected", managerOutcome, managerNotes, closed: true, usable: false, callbackRequired: false, introEmailNeeded: false, lastAction: "closed" };
          historyAction = "manager_closed"; historyNotes = "Lead closed by Manager.";
        }
      }
      if (alreadyApplied) return { status: "UNCHANGED", action, idempotent: true, currentStage: stage };
      patch.actionHistory = history({ action: historyAction, byUid: who.uid, byName: actorName, at, notes: historyNotes });
      transaction.update(leadRef, patch);
      return { status: "UPDATED", action, idempotent: false, currentStage: patch.status || stage };
    });
  });

  const managerSendToCloser = onCall(async request => {
    const who = await actor(request, ["manager", "administrator"]), data = request.data || {};
    const leadId = text(data.leadId, 180), closerUid = text(data.closerUid, 180);
    if (!leadId || !closerUid) fail("invalid-argument", "A CRM4 lead and governed Closer are required.");
    const leadRef = db.collection("crm4Leads").doc(leadId), closerRef = db.collection("crm4Memberships").doc(closerUid);
    return db.runTransaction(async transaction => {
      const [leadSnap, closerSnap] = await Promise.all([transaction.get(leadRef), transaction.get(closerRef)]);
      if (!leadSnap.exists) fail("not-found", "The CRM4 lead was not found.");
      if (!closerSnap.exists || closerSnap.data().active !== true || closerSnap.data().workspaceId !== "CRM4" || closerSnap.data().role !== "closer")
        fail("failed-precondition", "The selected CRM4 Closer is not active or authorised.");
      const lead = leadSnap.data();
      if (["closer-assigned", "appointment-booked", "onboarded"].includes(lead.status) || lead.sentToCloserAt) {
        if (text(lead.closerUid, 180) !== closerUid)
          fail("failed-precondition", "This lead has already been sent to a different Closer. Use a separately governed reassignment workflow.");
        return { status: "ALREADY_SENT_TO_CLOSER", idempotent: true, closerUid, currentStage: lead.status };
      }
      if (lead.status !== "approved" || lead.managerDecision !== "approved")
        fail("failed-precondition", "Only an approved CRM4 lead can be sent to a Closer.");
      const closerName = text(closerSnap.data().displayName || closerSnap.data().name, 160) || "Assigned Closer";
      const mode = data.mode === "book" ? "book" : "send";
      const appointmentDate = text(data.appointmentDate || lead.onboardingAppointmentDate, 20);
      const appointmentTime = text(data.appointmentTime || lead.onboardingAppointmentTime, 20);
      if (mode === "book" && (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime)))
        fail("failed-precondition", "A valid appointment date and time are required.");
      const at = new Date().toISOString(), nextStatus = mode === "book" ? "appointment-booked" : "closer-assigned";
      const patch = {
        assignedUserId: closerUid, assignedUserName: closerName, assignedToUid: closerUid, assignedToName: closerName,
        closerUid, status: nextStatus, leadStatus: "sent_to_closer", sentToCloserAt: now(), callbackRequired: false,
        introEmailNeeded: false, lastAction: mode === "book" ? "closer_appointment_booked" : "sent_to_closer",
        lastUpdatedAt: now(), updatedAt: now(), actionHistory: history({ action: mode === "book" ? "closer_appointment_booked" : "sent_to_closer", byUid: who.uid, at, notes: mode === "book" ? `Closer appointment booked for ${appointmentDate} ${appointmentTime}.` : "Lead sent to closer by manager." })
      };
      if (appointmentDate) patch.appointmentDate = appointmentDate;
      if (appointmentTime) patch.appointmentTime = appointmentTime;
      for (const [field, max] of [["assessmentOutcome", 160], ["recommendedCloser", 240], ["assessmentSummary", 8000], ["generatedAssessmentText", 12000], ["assessmentReportText", 12000], ["strategicAnalysisText", 12000], ["recommendedNextStepsText", 12000], ["complaintLetterText", 12000], ["statementOfTruthText", 12000], ["lossSummaryText", 12000], ["evidenceChecklistText", 12000], ["escalationLetterText", 12000], ["internalFileNoteText", 12000], ["processingPackText", 12000], ["clientEmailPreviewText", 12000], ["managerNotes", 8000]]) {
        if (data[field] != null) patch[field] = text(data[field], max);
      }
      transaction.update(leadRef, patch);
      return { status: mode === "book" ? "APPOINTMENT_BOOKED" : "SENT_TO_CLOSER", idempotent: false, closerUid, closerName, currentStage: nextStatus };
    });
  });

  const closerAcceptProcessing = onCall(async request => {
    await actor(request, ["closer"]);
    fail("permission-denied", "Processing & Admin / Payments confirms receipt and activates Processing. A Closer cannot perform this action.");
  });

  function agendaProjection(id, lead) {
    const appointment = appointmentValues(lead);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointment.date) || !/^\d{2}:\d{2}$/.test(appointment.time)) return null;
    const status = APPOINTMENT_STATUSES.has(text(lead.appointmentStatus, 40)) ? text(lead.appointmentStatus, 40) : (lead.appointmentConfirmationSentAt ? "confirmed" : "scheduled");
    return {
      id: `crm4:${id}:onboarding`, leadId: id, clientName: clientNames(lead), claimType: text(lead.claimType || lead.assessmentRoute || lead.intakeClaimType, 120),
      campaign: text(lead.campaign || lead.referralSource || lead.source, 160), appointmentDate: appointment.date, appointmentTime: appointment.time,
      timezone: "Europe/London", appointmentStatus: status, currentStage: text(lead.status || lead.leadStatus, 80), paymentStatus: text(lead.paymentStatus, 60) || "not_requested",
      processingStatus: text(lead.processingStatus, 60) || "not_started", originatingListerUid: text(lead.appointmentOriginatingListerUid || lead.createdBy || lead.createdByUid, 180),
      originatingListerName: text(lead.appointmentOriginatingListerName || lead.createdByName, 160), assignedCloserUid: text(lead.closerUid || lead.assignedUserId, 180),
      assignedCloserName: text(lead.assignedToName || lead.assignedUserName, 160), assessmentId: text(lead.assessmentId, 180), assessmentQar: text(lead.assessmentQar, 120),
      canConfirmPayment: lead.status === "closed-deal-awaiting-payment" && lead.agreementStatus === "signed" && Boolean(lead.agreementSignedAt) && lead.paymentStatus === "payment_requested" && lead.processingStatus !== "accepted",
    };
  }

  function callbackProjection(id, lead, type) {
    const prefix = type === "lister" ? "listerCallback" : "closerCallback";
    const date = text(lead[`${prefix}Date`] || (type === "lister" ? lead.callbackDate : ""), 20);
    const time = text(lead[`${prefix}Time`] || (type === "lister" ? lead.callbackTime : ""), 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
    return { id: `crm4:${id}:${type}-callback`, type: `${type}-callback`, leadId: id, clientName: clientNames(lead), appointmentDate: date, appointmentTime: time,
      appointmentStatus: text(lead[`${prefix}Status`], 40) || "scheduled", reason: text(lead[`${prefix}Reason`], 160), notes: text(lead[`${prefix}Notes`] || (type === "lister" ? lead.callbackNotes : ""), 2000),
      staffUid: text(lead[`${prefix}StaffUid`] || (type === "lister" ? lead.assignedToUid || lead.assignedUserId : lead.closerUid || lead.assignedUserId), 180),
      staffName: text(lead[`${prefix}StaffName`] || lead.assignedToName || lead.assignedUserName, 160), currentStage: text(lead.status || lead.leadStatus, 80),
      outcome: text(lead.outcome, 80), paymentStatus: text(lead.paymentStatus, 60) || "not_requested", confirmationSent: Boolean(lead[`${prefix}ConfirmationSentAt`]),
      claimType: text(lead.claimType || lead.assessmentRoute || lead.intakeClaimType, 120) };
  }

  const listAgenda = onCall(async request => {
    const who = await actor(request, ["lister", "closer", "manager", "processing", "administrator"]);
    const [snap, administrationSnap] = await Promise.all([db.collection("crm4Leads").limit(1000).get(), db.collection("crm4AdministrationOnboardingAppointments").limit(500).get()]);
    const docs = snap.docs.map(doc => ({ id: doc.id, lead: doc.data() }));
    const all = docs.map(({id, lead}) => agendaProjection(id, lead)).filter(Boolean);
    const callbacks = docs.flatMap(({id, lead}) => [callbackProjection(id, lead, "lister"), callbackProjection(id, lead, "closer")]).filter(Boolean);
    const appointments = who.role === "lister" ? all.filter(item => item.originatingListerUid === who.uid)
      : who.role === "closer" ? all.filter(item => item.assignedCloserUid === who.uid)
        : all;
    const visibleCallbacks = who.role === "lister" ? callbacks.filter(item => item.type === "lister-callback" && item.staffUid === who.uid)
      : who.role === "closer" ? callbacks.filter(item => item.type === "closer-callback" && item.staffUid === who.uid)
        : who.role === "administrator" ? callbacks : [];
    const leadMap = new Map(docs.map(({ id, lead }) => [id, lead]));
    const administrationOnboarding = administrationSnap.docs.map(doc => { const appointment = doc.data() || {}, lead = leadMap.get(appointment.leadId) || {}; return { id: doc.id, type: "administration-onboarding", leadId: appointment.leadId, clientName: clientName(lead), claimType: text(lead.claimType || lead.assessmentRoute, 120), appointmentDate: text(appointment.date, 20), appointmentTime: text(appointment.startTime, 20), durationMinutes: Number(appointment.durationMinutes || 60), appointmentWith: "Administration & Processing Team", assignedCloserUid: text(lead.closerUid || lead.assignedUserId, 180), assignedCloserName: text(lead.assignedToName || lead.assignedUserName, 160), agreementStatus: text(lead.agreementStatus, 80), paymentStatus: text(lead.paymentStatus, 80), administrationOnboardingStatus: text(lead.administrationOnboardingStatus, 80), processingStatus: text(lead.processingStatus, 80), appointmentStatus: text(appointment.status, 80), currentStage: text(appointment.status, 80), deterministicId: doc.id }; }).filter(item => item.appointmentDate && (who.role === "closer" ? item.assignedCloserUid === who.uid : who.role !== "lister"));
    return { appointments: [...appointments, ...visibleCallbacks, ...administrationOnboarding], callbacks: visibleCallbacks, administrationOnboarding, scope: who.role === "lister" ? "ORIGINATED_BY_SIGNED_IN_LISTER" : who.role === "closer" ? "ASSIGNED_TO_SIGNED_IN_CLOSER" : "GLOBAL_OPERATIONAL", role: who.role, deterministicIdentities: ["crm4:<leadId>:onboarding", "crm4:<leadId>:lister-callback", "crm4:<leadId>:closer-callback", "crm4:<leadId>:administration-onboarding"] };
  });

  async function callbackAuthority(request) {
    const type = text(request.data?.callbackType, 20);
    if (!CALLBACK_TYPES.has(type)) fail("invalid-argument", "Select a governed callback type.");
    const who = await actor(request, [type]), found = await leadFor(request.data?.leadId);
    const owner = type === "lister" ? text(found.data.listerCallbackStaffUid || found.data.assignedToUid || found.data.assignedUserId || found.data.createdByUid, 180) : text(found.data.closerCallbackStaffUid || found.data.closerUid || found.data.assignedUserId, 180);
    if (owner !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in staff member.");
    return { type, who, found, prefix: type === "lister" ? "listerCallback" : "closerCallback" };
  }

  const saveCallback = onCall(async request => {
    const type = text(request.data?.callbackType, 20);
    if (!CALLBACK_TYPES.has(type)) fail("invalid-argument", "Select a governed callback type.");
    const who = await actor(request, [type]), leadId = text(request.data?.leadId, 180), callbackDate = text(request.data?.callbackDate, 20), callbackTime = text(request.data?.callbackTime, 20), reason = text(request.data?.reason, 160), notes = text(request.data?.notes, 2000);
    if (!leadId || !/^\d{4}-\d{2}-\d{2}$/.test(callbackDate) || !/^\d{2}:\d{2}$/.test(callbackTime)) fail("invalid-argument", "A lead and valid callback date/time are required.");
    if (!CALLBACK_REASONS.has(reason)) fail("invalid-argument", "Select a governed callback reason.");
    const ref = db.collection("crm4Leads").doc(leadId), prefix = type === "lister" ? "listerCallback" : "closerCallback";
    return db.runTransaction(async transaction => {
      const snap = await transaction.get(ref); if (!snap.exists) fail("not-found", "The CRM4 lead was not found."); const lead = snap.data();
      const owner = type === "lister" ? text(lead.assignedToUid || lead.assignedUserId || lead.createdByUid, 180) : text(lead.closerUid || lead.assignedUserId, 180);
      if (owner !== who.uid) fail("permission-denied", "This lead is not assigned to the signed-in staff member.");
      if (text(lead[`${prefix}Date`], 20) === callbackDate && text(lead[`${prefix}Time`], 20) === callbackTime && text(lead[`${prefix}Reason`], 160) === reason && text(lead[`${prefix}Notes`], 2000) === notes) return { status: "UNCHANGED", idempotent: true, callbackId: `crm4:${leadId}:${type}-callback` };
      const patch = { [`${prefix}Date`]: callbackDate, [`${prefix}Time`]: callbackTime, [`${prefix}Reason`]: reason, [`${prefix}Notes`]: notes, [`${prefix}Status`]: "scheduled", [`${prefix}StaffUid`]: who.uid, [`${prefix}StaffName`]: who.name,
        [`${prefix}ConfirmationKey`]: FieldValue.delete(), [`${prefix}ConfirmationSentAt`]: FieldValue.delete(), [`${prefix}ConfirmationSentByUid`]: FieldValue.delete(), [`${prefix}ConfirmationProviderId`]: FieldValue.delete(), lastUpdatedAt: now(),
        actionHistory: history({ action: `${type}_callback_scheduled`, byUid: who.uid, at: new Date().toISOString(), notes: `Callback scheduled for ${callbackDate} ${callbackTime}.` }) };
      if (type === "lister") Object.assign(patch, { callbackDate, callbackTime, callbackRequired: true });
      transaction.update(ref, patch); return { status: "SAVED", idempotent: false, callbackId: `crm4:${leadId}:${type}-callback` };
    });
  });

  const previewCallback = onCall(async request => {
    const { found, prefix } = await callbackAuthority(request), template = callbackEmailTemplate({ lead: { ...found.data, id: found.ref.id }, callbackDate: text(found.data[`${prefix}Date`], 20), callbackTime: text(found.data[`${prefix}Time`], 20) });
    return { subject: template.subject, body: template.body, previewKey: template.previewKey };
  });

  const sendCallback = onCall({ secrets: [resendSecret] }, async request => {
    const { type, who, found, prefix } = await callbackAuthority(request), template = callbackEmailTemplate({ lead: { ...found.data, id: found.ref.id }, callbackDate: text(found.data[`${prefix}Date`], 20), callbackTime: text(found.data[`${prefix}Time`], 20) }), recipient = email(found.data.email || found.data.emailAddress);
    if (!recipient) fail("failed-precondition", "The client has no governed email address.");
    if (text(request.data?.previewKey, 100) !== template.previewKey) fail("failed-precondition", "Refresh the callback confirmation preview before sending.");
    if (found.data[`${prefix}ConfirmationKey`] === template.previewKey && found.data[`${prefix}ConfirmationSentAt`]) return { status: "ALREADY_SENT", idempotent: true };
    const result = process.env.FUNCTIONS_EMULATOR === "true" ? { data: { id: `emulator-${type}-callback-${found.ref.id}` } } : await resend.emails.send({ from: "Quaerens Client Support <clientsupport@quaerens.co.uk>", to: recipient, subject: template.subject, ...template.content, tags: [{ name: "type", value: `crm4_${type}_callback` }] }, { idempotencyKey: `crm4-${type}-callback-${found.ref.id}-${template.previewKey}` });
    if (result?.error) fail("internal", result.error.message || "The callback confirmation could not be sent.");
    await found.ref.update({ [`${prefix}ConfirmationKey`]: template.previewKey, [`${prefix}ConfirmationSentAt`]: now(), [`${prefix}ConfirmationSentByUid`]: who.uid, [`${prefix}ConfirmationProviderId`]: text(result?.data?.id || result?.id, 200), lastUpdatedAt: now(), actionHistory: history({ action: `${type}_callback_confirmation_sent`, byUid: who.uid, byName: who.name, at: new Date().toISOString(), notes: "Callback confirmation sent." }) });
    return { status: "SENT", idempotent: false };
  });

  const updateAppointment = onCall(async request => {
    const who = await actor(request, ["manager", "processing", "administrator"]), leadId = text(request.data?.leadId, 180);
    const appointmentDate = text(request.data?.appointmentDate, 20), appointmentTime = text(request.data?.appointmentTime, 20), requestedStatus = text(request.data?.appointmentStatus, 40);
    if (!leadId || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime)) fail("invalid-argument", "A CRM4 lead and valid appointment date/time are required.");
    if (requestedStatus && !APPOINTMENT_STATUSES.has(requestedStatus)) fail("invalid-argument", "Select a governed appointment status.");
    const ref = db.collection("crm4Leads").doc(leadId);
    return db.runTransaction(async transaction => {
      const snap = await transaction.get(ref); if (!snap.exists) fail("not-found", "The CRM4 lead was not found.");
      const lead = snap.data(), previous = appointmentValues(lead), same = previous.date === appointmentDate && previous.time === appointmentTime && (!requestedStatus || requestedStatus === (lead.appointmentStatus || "scheduled"));
      if (same) return { status: "UNCHANGED", idempotent: true };
      const appointmentStatus = requestedStatus || "rescheduled", at = new Date().toISOString(), patch = { onboardingAppointmentDate: appointmentDate, onboardingAppointmentTime: appointmentTime, appointmentDate, appointmentTime, appointmentStatus, appointmentId: `crm4:${leadId}:onboarding`, lastUpdatedAt: now(), appointmentAudit: history({ action: "crm4_appointment_updated", byUid: who.uid, at, previous: { date: previous.date, time: previous.time, status: text(lead.appointmentStatus, 40) || "scheduled" }, next: { date: appointmentDate, time: appointmentTime, status: appointmentStatus } }) };
      if (lead.closerAppointmentDate || lead.closerAppointmentTime) { patch.closerAppointmentDate = appointmentDate; patch.closerAppointmentTime = appointmentTime; }
      transaction.update(ref, patch);
      return { status: "UPDATED", idempotent: false, appointmentId: patch.appointmentId };
    });
  });

  return { crm4ManagerUpdateLead: managerUpdateLead, crm4ListerSubmitToManager: listerSubmit, crm4ListerRetryManagerNotification: listerRetryManagerNotification, crm4ListerSendAssessmentCompletionEmail: listerSendAssessmentEmail, crm4ListerSendGeneralInformationEmail: listerSendGeneralInformationEmail, crm4ListerSaveOnboardingAppointment: listerSaveAppointment, crm4ListerPreviewAppointmentConfirmation: listerPreviewAppointment, crm4ListerSendAppointmentConfirmation: listerSendAppointment, crm4SaveCallback: saveCallback, crm4PreviewCallbackConfirmation: previewCallback, crm4SendCallbackConfirmation: sendCallback, crm4ManagerGetLinkedAssessment: managerGetAssessment, crm4ManagerDownloadLinkedAssessmentReport: managerDownloadAssessmentReport, crm4CloserGetLinkedAssessment: closerGetAssessment, crm4CloserDownloadLinkedAssessmentReport: closerDownloadAssessmentReport, crm4CloserGetAgreement: closerGetAgreement, crm4CloserPreviewAgreementEmail: closerPreviewAgreementEmail, crm4CloserSaveAgreement: closerSaveAgreement, crm4CloserSendAgreement: closerSendAgreement, crm4ListAgenda: listAgenda, crm4UpdateAppointment: updateAppointment, crm4ManagerPreviewAppointmentEmail: managerPreviewAppointment, crm4ManagerSendAppointmentConfirmation: managerConfirmAppointment, crm4ManagerSendToCloser: managerSendToCloser, crm4CloserRecordClosedDeal: closerRecordClosedDeal, crm4CloserPreparePaymentEmail: closerPreparePaymentEmail, crm4CloserSendPaymentEmail: closerSendPaymentEmail, crm4AdminConfirmPayment: adminConfirmPayment, crm4CloserAcceptToProcessing: closerAcceptProcessing };
}

module.exports = { registerCrm2OperationalFlow, appointmentValues, APPROVED_PAYMENT_OPTIONS, paymentOption, storedPaymentOption, commercialInternalProviderRequest, INFORMATION_BROCHURE, GENERAL_INFORMATION_TEMPLATE_ID, GENERAL_INFORMATION_TEMPLATE_VERSION };

require("dotenv").config();

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { Resend } = require("resend");
const crypto = require("crypto");
const cors = require("cors")({ origin: true });
const STORAGE_BUCKET = "quaerensclaims.firebasestorage.app";

admin.initializeApp({ storageBucket: STORAGE_BUCKET });

const db = admin.firestore();

if (!process.env.RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Test sender first. Later change back to:
// const FROM_EMAIL = "FreeFlightClaim <noreply@quaerens.co.uk>";
const FROM_EMAIL = "FreeFlightClaim <noreply@quaerens.co.uk>";

exports.sendClaimEmailV2 = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const data = req.body || {};

    if (!data.email) {
      return res.status(400).json({ success: false, message: "Missing customer email" });
    }

    const emailContent = buildEmail({
      template: data.template || "claim_created",
      product: data.product || "freeflightclaim",
      fullName: data.fullName,
      airline: data.airline,
      company: data.company,
      flightNumber: data.flightNumber,
      referenceNumber: data.referenceNumber,
      depAirport: data.depAirport,
      arrAirport: data.arrAirport,
      issueTypeLabel: data.issueTypeLabel,
      compensation: data.compensation,
      amountClaimed: data.amountClaimed
    });

    let attachments = [];

if (data.pdfURL) {
  const pdfResponse = await fetch(data.pdfURL);
  const pdfArrayBuffer = await pdfResponse.arrayBuffer();
  const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");

  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
}

    try {
      const result = await resend.emails.send({
  from: senderEmail(data),
  to: data.email,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text,
  attachments,
headers: {
  "List-Unsubscribe": "<mailto:noreply@quaerens.co.uk?subject=Unsubscribe>"
},
tags: [
    { name: "type", value: "claim_created" },
    { name: "product", value: data.product || "freeflightclaim" }
  ]
});

      await db.collection("sentEmails").add({
  to: data.email,
  subject: emailContent.subject,
  source: "sendClaimEmailV2-resend",
  resendId: result?.data?.id || "",
  product: data.product || "freeflightclaim",
  type: data.template || "claim_created",
  sent: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp()
});

      return res.status(200).json({
        success: true,
        resendId: result?.data?.id || ""
      });
    } catch (error) {
      console.error("sendClaimEmailV2 Resend error:", error);

      await db.collection("sentEmails").add({
        to: data.email,
        subject: emailContent.subject,
        source: "sendClaimEmailV2-resend",
        sent: false,
        error: error.message,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
});

exports.sendQueuedEmails = onSchedule("every 5 minutes", async () => {
  const now = new Date();

  const snapshot = await db
    .collection("emailQueue")
    .where("sent", "==", false)
    .limit(50)
    .get();

  for (const emailDoc of snapshot.docs) {
    const data = emailDoc.data();

    try {
      let isDue = false;

      if (data.sendAt && data.sendAt.toDate) {
        isDue = data.sendAt.toDate() <= now;
      } else if (data.sendAfterDays && data.createdAt && data.createdAt.toDate) {
        const dueDate = data.createdAt.toDate();
        dueDate.setDate(dueDate.getDate() + Number(data.sendAfterDays));
        isDue = dueDate <= now;
      }

      if (!isDue || !data.to) continue;

      const emailContent = buildEmail(data);
let attachments = [];

if (data.pdfURL) {
  const pdfResponse = await fetch(data.pdfURL);
  const pdfArrayBuffer = await pdfResponse.arrayBuffer();
  const pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");

  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
} else if (data.pdfBase64) {
  attachments.push({
    filename: data.pdfFileName || buildAttachmentName(data),
    content: data.pdfBase64
  });
}
      const result = await resend.emails.send({
  from: senderEmail(data),
  to: data.to,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text,
  attachments,
headers: {
  "List-Unsubscribe": "<mailto:noreply@quaerens.co.uk?subject=Unsubscribe>"
},
tags: [
    { name: "type", value: data.template || "queued_email" },
    { name: "product", value: data.product || "freeflightclaim" }
  ]
});

      await emailDoc.ref.update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        resendId: result?.data?.id || "",
        error: admin.firestore.FieldValue.delete()
      });

    } catch (error) {
      console.error("Queued email failed:", emailDoc.id, error);

      await emailDoc.ref.update({
        sent: false,
        error: error.message,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  return null;
});

function productEmailConfig(product) {
  const configs = {
    freeholidaycompensation: {
      title: "Your holiday compensation letter is ready",
      brand: "Holiday Compensation by Quaerens",
      logo: "logoemailholidayclaim.png",
      refLabel: "Booking reference",
      companyLabel: "Travel company"
    },
    "train-delay": {
      title: "Your train delay claim letter is ready",
      brand: "Train Delay by Quaerens",
      logo: "logoemailtraindelay.png",
      refLabel: "Ticket reference",
      companyLabel: "Train company"
    },
    "lost-luggage": {
      title: "Your lost luggage claim letter is ready",
      brand: "Lost Luggage by Quaerens",
      logo: "logoemaillostluggage.png",
      refLabel: "Booking or PIR reference",
      companyLabel: "Airline or provider"
    },
    "gym-cancellation": {
      title: "Your gym cancellation letter is ready",
      brand: "Gym Cancellation by Quaerens",
      logo: "logoemailgymcancellation.png",
      refLabel: "Membership number",
      companyLabel: "Gym"
    },
    "parking-appeal": {
      title: "Your parking appeal letter is ready",
      brand: "Parking Appeal by Quaerens",
      logo: "logoemailparkingappeal.png",
      refLabel: "PCN reference",
      companyLabel: "Parking operator"
    },
    "energy-switch": {
      title: "Your energy complaint letter is ready",
      brand: "Energy Switch by Quaerens",
      logo: "logoemailenergyswitch.png",
      refLabel: "Account reference",
      companyLabel: "Energy supplier"
    },
    freeflightclaim: {
      title: "Your FreeFlightClaim letter is ready",
      brand: "FreeFlightClaim by Quaerens",
      logo: "logoemail.png",
      refLabel: "Flight number",
      companyLabel: "Airline"
    }
  };

  return configs[product] || configs.freeflightclaim;
}

function buildAttachmentName(data) {
  const config = productEmailConfig(data.product || "freeflightclaim");
  const ref = data.referenceNumber || data.flightNumber || "claim";
  const safeRef = String(ref).replace(/[^a-z0-9-]+/gi, "-");
  return config.title.replace(/^Your /, "").replace(/ is ready$/, "").replace(/[^a-z0-9]+/gi, "-") + "-" + safeRef + ".pdf";
}

function senderEmail(data) {
  const config = productEmailConfig(data.product || "freeflightclaim");
  return config.brand + " <noreply@quaerens.co.uk>";
}

function buildEmail(data) {
  const product = data.product || "freeflightclaim";
  const config = productEmailConfig(product);
  const name = data.fullName || "there";
  const company = data.company || data.airline || "the company";
  const ref = data.referenceNumber || data.flightNumber || "your reference";
  const compensation = data.amountClaimed || data.compensation || 0;
  const depAirport = data.depAirport || "";
  const arrAirport = data.arrAirport || "";
  const issue = data.issueTypeLabel || "";

  if (data.template === "airline_reply_check") {
    return {
      subject: "Has the airline replied to your claim?",
      html: [
        "<p>Hi " + name + ",</p>",
        "<p>Has " + company + " replied about " + ref + "?</p>",
        "<p>If not, Quaerens can help with the next step.</p>"
      ].join("")
    };
  }

  if (data.template === "rejected_claim_help") {
    return {
      subject: "Airline rejected or ignored your claim?",
      html: [
        "<p>Hi " + name + ",</p>",
        "<p>If " + company + " rejected or ignored your claim for " + ref + ", Quaerens can help prepare a stronger response.</p>"
      ].join("")
    };
  }

  if (product === "freeflightclaim") {
    return {
      subject: "Your FreeFlightClaim letter is ready",
      text:
        "Hi " + name + ",\n\n" +
        "Your claim letter for " + ref + " with " + company + " is ready.\n" +
        "Route: " + (depAirport || "-") + " to " + (arrAirport || "-") + "\n" +
        "Estimated compensation: EUR " + compensation + "\n\n" +
        "You can send it directly to the airline and keep proof of submission. If you need help later, we are here.\n\n" +
        "Kind regards,\nFreeFlightClaim / Quaerens",
      html: [
        "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:auto;'>",
        "<div style='text-align:center;margin-bottom:20px;'>",
        "<img src='https://www.quaerens.co.uk/images/logoemail.png' alt='FreeFlightClaim by Quaerens' style='display:block;margin:0 auto;max-width:320px;width:100%;height:auto;border:0;'>",
        "</div>",
        "<h2 style='color:#1e3a8a;text-align:center;'>Your FreeFlightClaim letter is ready</h2>",
        "<p>Hi " + name + ",</p>",
        "<p>Your claim letter for <strong>" + ref + "</strong> with <strong>" + company + "</strong> is ready.</p>",
        "<p><a href='https://www.quaerens.co.uk/thank-you.html' style='color:#1e3a8a;font-weight:bold;'>View your claim summary</a></p>",
        "<p><strong>Route:</strong> " + (depAirport || "-") + " to " + (arrAirport || "-") + "</p>",
        "<p><strong>Estimated compensation:</strong> EUR " + compensation + "</p>",
        "<p>Please send your claim letter to the airline and keep proof of submission.</p>",
        "<p style='margin-top:25px;'>Kind regards,<br><strong>FreeFlightClaim</strong><br><span style='color:#666;'>by Quaerens</span></p>",
        "<hr style='margin:30px 0;border:none;border-top:1px solid #eee;'>",
        "<p style='font-size:12px;color:#666;text-align:center;'>Quaerens Ltd<br>London, United Kingdom<br><br>You received this email because you requested a claim letter on FreeFlightClaim.com.<br><br><a href='mailto:noreply@quaerens.co.uk?subject=Unsubscribe'>Unsubscribe</a></p>",
        "</div>"
      ].join("")
    };
  }

  return {
    subject: config.title,
    text:
      "Hi " + name + ",\n\n" +
      config.title + ".\n" +
      config.companyLabel + ": " + company + "\n" +
      config.refLabel + ": " + ref + "\n" +
      (issue ? "Issue: " + issue + "\n" : "") +
      (compensation ? "Amount: " + compensation + "\n" : "") +
      "\nPlease send the PDF to the relevant company and keep proof of submission.\n\nKind regards,\nQuaerens",
    html: [
      "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:auto;'>",
      "<div style='text-align:center;margin-bottom:20px;'>",
      "<img src='https://www.quaerens.co.uk/images/" + config.logo + "' alt='" + config.brand + "' style='display:block;margin:0 auto;max-width:320px;width:100%;height:auto;border:0;'>",
      "</div>",
      "<h2 style='color:#1e3a8a;text-align:center;'>" + config.title + "</h2>",
      "<p>Hi " + name + ",</p>",
      "<p>Your letter has been prepared and is attached to this email.</p>",
      "<p><strong>" + config.companyLabel + ":</strong> " + company + "</p>",
      "<p><strong>" + config.refLabel + ":</strong> " + ref + "</p>",
      issue ? "<p><strong>Issue:</strong> " + issue + "</p>" : "",
      compensation ? "<p><strong>Amount entered:</strong> " + compensation + "</p>" : "",
      "<p>Please send the PDF to the relevant company and keep proof of submission.</p>",
      "<p style='margin-top:25px;'>Kind regards,<br><strong>Quaerens</strong></p>",
      "<hr style='margin:30px 0;border:none;border-top:1px solid #eee;'>",
      "<p style='font-size:12px;color:#666;text-align:center;'>Quaerens Ltd<br>London, United Kingdom<br><br>You received this email because you requested a free letter from Quaerens.<br><br><a href='mailto:noreply@quaerens.co.uk?subject=Unsubscribe'>Unsubscribe</a></p>",
      "</div>"
    ].join("")
  };
}


const QUAERENS_EMAIL_SIGNATURE = "Best regards,\nQuaerens Ltd\n71-75 Shelton Street\nCovent Garden\nWC2H 9JQ\nLondon\n\nUnited Kingdom\n\nTelephone: 020 8050 0725\nWhatsapp: 07459775812\n\nWebpage: www.quaerens.co.uk\nEmail: admin@quaerens.co.uk";

const QUAERENS_CLIENT_SUPPORT_SIGNATURE = "Best regards,\n\nQuaerens Ltd\n71-75 Shelton Street\nCovent Garden\nWC2H 9JQ\nLondon\n\nUnited Kingdom\n\nTelephone: 020 8050 0725\nWhatsapp: 07459775812\n\nWebpage: www.quaerens.co.uk\nEmail: admin@quaerens.co.uk";

const QUAERENS_PROCESSING_SUPPORT_SIGNATURE = "Best regards,\n\nQuaerens Ltd\n71-75 Shelton Street\nCovent Garden\nWC2H 9JQ\nLondon\n\nUnited Kingdom\n\nTelephone: 020 8050 0725\nWhatsapp: 07459775812\n\nWebpage: www.quaerens.co.uk\nEmail: support@quaerens.co.uk";

const AGREEMENT_EMAIL_NOTICE = "Confidentiality Notice: This email and any attachments are intended solely for the use of the individual or entity to whom they are addressed. They may contain confidential, privileged, proprietary, or legally protected information. If you are not the intended recipient, you must immediately notify the sender, delete this email and any attachments from your system, and must not copy, distribute, disclose, or take any action based on the contents of this email. Unauthorized use of this email may constitute a violation of law. Accuracy and Liability: Quaerens Ltd makes no representations or warranties regarding the accuracy, completeness, or reliability of the information contained in this email. Any opinions expressed are those of the sender and do not necessarily represent the views of Quaerens Ltd, its directors, employees, or affiliates. Limitation of Liability: To the fullest extent permitted by law, Quaerens Ltd shall not be liable for any loss or damage, direct or indirect, arising from or in connection with this email, including but not limited to any loss of data, profits, or other consequential or incidental damages. This includes any viruses or malware that may be transmitted with this email. Recipients should carry out their own checks before opening attachments or acting on the content. Data Protection - GDPR / UK GDPR: This email may contain personal data. Any such data must be handled in accordance with applicable data protection laws, including the EU General Data Protection Regulation (GDPR) and UK GDPR. Personal data must not be disclosed, shared, or processed without lawful justification and consent where required. If you are not the intended recipient, you must delete this email immediately. Third-Party Content: This email may contain links, references, or attachments relating to third parties. Quaerens Ltd does not accept responsibility for the content, accuracy, or availability of third-party material, and inclusion of such content does not imply endorsement. Legal Privilege and Professional Opinions: Any opinions, statements, or information contained in this email are provided for informational purposes only unless explicitly stated to be made on behalf of Quaerens Ltd. Nothing in this email should be taken as legal, financial, or professional advice unless specifically confirmed in writing. Governing Law: This email and its contents are governed by the laws of England and Wales. Any disputes arising in connection with this email shall be subject to the exclusive jurisdiction of the courts of England and Wales. By reading or acting upon this email, you acknowledge and agree to be bound by the terms of this disclaimer.";

function escapeAgreementHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[char]));
}


exports.sendCloserClientEmail = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      const authHeader = req.get("authorization") || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ success: false, error: "Missing CRM authorisation." });

      const decoded = await admin.auth().verifyIdToken(token);
      const userSnap = await db.collection("users").doc(decoded.uid).get();
      const userData = userSnap.exists ? userSnap.data() : {};
      const role = userData.role || (userData.admin === true ? "admin" : "");
      if (!["admin", "manager", "closer", "processing"].includes(role)) {
        return res.status(403).json({ success: false, error: "CRM user is not allowed to send client emails." });
      }

      const data = req.body || {};
      const to = String(data.to || "").trim();
      const clientName = String(data.clientName || "Client").trim();
      const subject = String(data.subject || "Quaerens - update regarding your claim").trim();
      const customText = String(data.text || "").trim();
      const attachment = data.attachment && typeof data.attachment === "object" ? data.attachment : null;

      if (!to) return res.status(400).json({ success: false, error: "Missing recipient email." });
      if (!customText) return res.status(400).json({ success: false, error: "Email body is empty." });

      let safeText = customText;
      if (!safeText.includes("71-75 Shelton Street")) {
        safeText += "\n\n" + QUAERENS_CLIENT_SUPPORT_SIGNATURE;
      }
      if (!safeText.includes("Confidentiality Notice:")) {
        safeText += "\n\n" + AGREEMENT_EMAIL_NOTICE;
      }

      const htmlBody = escapeAgreementHtml(safeText).replace(/\n/g, "<br>");

      const emailPayload = {
        from: "Quaerens Client Support <clientsupport@quaerens.co.uk>",
        to,
        subject,
        text: safeText,
        html: [
          "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:680px;margin:auto;'>",
          "<div style='text-align:center;margin-bottom:20px;'>",
          "<img src='https://www.quaerens.co.uk/images/quaerens-logo.png' alt='Quaerens' style='display:block;margin:0 auto;max-width:260px;width:100%;height:auto;border:0;'>",
          "</div>",
          "<h2 style='color:#1e3a8a;text-align:center;'>Message from Quaerens</h2>",
          "<p>", htmlBody, "</p>",
          "<hr style='margin:30px 0;border:none;border-top:1px solid #eee;'>",
          "<p style='font-size:12px;color:#666;text-align:center;'>Quaerens Ltd<br>71-75 Shelton Street, Covent Garden, London WC2H 9JQ<br>Company No. 16176152</p>",
          "</div>"
        ].join(""),
        tags: [
          { name: "type", value: "closer_client_email" }
        ]
      };

      if (attachment?.content) {
        emailPayload.attachments = [{
          filename: String(attachment.filename || "Assessment-Report.pdf"),
          content: String(attachment.content || "")
        }];
      }

      const result = await resend.emails.send(emailPayload);

      if (result?.error) {
        throw new Error(result.error.message || "Resend rejected the client email.");
      }

      const sentEmail = {
        type: "closer_client_email",
        source: data.source || "closerAssignments",
        sourceId: data.sourceId || "",
        clientKey: data.clientKey || "",
        to,
        clientName,
        subject,
        from: "clientsupport@quaerens.co.uk",
        attachmentFileName: attachment?.content ? String(attachment.filename || "Assessment-Report.pdf") : "",
        resendId: result?.data?.id || result?.id || "",
        sentByUid: decoded.uid,
        sentByEmail: decoded.email || "",
        sentByRole: role,
        sentByName: userData.name || decoded.email || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const emailRef = await db.collection("sentEmails").add(sentEmail);

      if (sentEmail.clientKey || sentEmail.sourceId) {
        await db.collection("clientTimeline").add({
          clientKey: sentEmail.clientKey,
          source: sentEmail.source,
          sourceId: sentEmail.sourceId,
          type: "email",
          title: "Client email sent",
          body: "Subject: " + subject + (attachment?.content ? "\nAttachment: " + String(attachment.filename || "Assessment-Report.pdf") : ""),
          sentEmailId: emailRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          createdByUid: decoded.uid,
          createdByEmail: decoded.email || "",
          createdByName: userData.name || decoded.email || ""
        });
      }

      res.json({ success: true, resendId: sentEmail.resendId, sentEmailId: emailRef.id });
    } catch (err) {
      console.error("sendCloserClientEmail error:", err);
      res.status(500).json({ success: false, error: err.message || "Email failed." });
    }
  });
});


exports.sendProcessingClientEmail = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      const authHeader = req.get("authorization") || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ success: false, error: "Missing CRM authorisation." });

      const decoded = await admin.auth().verifyIdToken(token);
      const userSnap = await db.collection("users").doc(decoded.uid).get();
      const userData = userSnap.exists ? userSnap.data() : {};
      const role = userData.role || (userData.admin === true ? "admin" : "");
      if (!["admin", "manager", "processing"].includes(role)) {
        return res.status(403).json({ success: false, error: "CRM user is not allowed to send processing emails." });
      }

      const data = req.body || {};
      const to = String(data.to || "").trim();
      const clientName = String(data.clientName || "Client").trim();
      const subject = String(data.subject || "Quaerens - update regarding your case").trim();
      const customText = String(data.text || "").trim();

      if (!to) return res.status(400).json({ success: false, error: "Missing recipient email." });
      if (!customText) return res.status(400).json({ success: false, error: "Email body is empty." });

      let safeText = customText;
      if (!safeText.includes("71-75 Shelton Street")) {
        safeText += "\n\n" + QUAERENS_PROCESSING_SUPPORT_SIGNATURE;
      }
      if (!safeText.includes("Confidentiality Notice:")) {
        safeText += "\n\n" + AGREEMENT_EMAIL_NOTICE;
      }

      const htmlBody = escapeAgreementHtml(safeText).replace(/\n/g, "<br>");

      const result = await resend.emails.send({
        from: "Quaerens Support <support@quaerens.co.uk>",
        to,
        subject,
        text: safeText,
        html: [
          "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:680px;margin:auto;'>",
          "<div style='text-align:center;margin-bottom:20px;'>",
          "<img src='https://www.quaerens.co.uk/images/quaerens-logo.png' alt='Quaerens' style='display:block;margin:0 auto;max-width:260px;width:100%;height:auto;border:0;'>",
          "</div>",
          "<h2 style='color:#1e3a8a;text-align:center;'>Message from Quaerens</h2>",
          "<p>", htmlBody, "</p>",
          "<hr style='margin:30px 0;border:none;border-top:1px solid #eee;'>",
          "<p style='font-size:12px;color:#666;text-align:center;'>Quaerens Ltd<br>71-75 Shelton Street, Covent Garden, London WC2H 9JQ<br>Company No. 16176152</p>",
          "</div>"
        ].join(""),
        tags: [
          { name: "type", value: "processing_client_email" }
        ]
      });

      if (result?.error) {
        throw new Error(result.error.message || "Resend rejected the processing email.");
      }

      const sentEmail = {
        type: "processing_client_email",
        source: data.source || "processingCases",
        sourceId: data.sourceId || "",
        clientKey: data.clientKey || "",
        to,
        clientName,
        subject,
        from: "support@quaerens.co.uk",
        resendId: result?.data?.id || result?.id || "",
        sentByUid: decoded.uid,
        sentByEmail: decoded.email || "",
        sentByRole: role,
        sentByName: userData.name || decoded.email || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const emailRef = await db.collection("sentEmails").add(sentEmail);

      await db.collection("clientTimeline").add({
        clientKey: sentEmail.clientKey,
        source: sentEmail.source,
        sourceId: sentEmail.sourceId,
        type: "email",
        title: "Processing email sent",
        body: "Subject: " + subject,
        sentEmailId: emailRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdByUid: decoded.uid,
        createdByEmail: decoded.email || "",
        createdByName: userData.name || decoded.email || ""
      });

      res.json({ success: true, resendId: sentEmail.resendId, sentEmailId: emailRef.id });
    } catch (err) {
      console.error("sendProcessingClientEmail error:", err);
      res.status(500).json({ success: false, error: err.message || "Email failed." });
    }
  });
});

exports.uploadProcessingCaseDocument = onRequest({ maxInstances: 10, memory: "512MiB" }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ success: false, error: "Missing authentication token." });

      await admin.auth().verifyIdToken(token);

      const data = req.body || {};
      const caseId = String(data.caseId || "").trim();
      const fileName = String(data.fileName || "document.pdf").trim();
      const contentType = String(data.contentType || "application/octet-stream").trim();
      const fileBase64 = String(data.fileBase64 || "").trim();

      if (!caseId) return res.status(400).json({ success: false, error: "Missing case ID." });
      if (!fileBase64) return res.status(400).json({ success: false, error: "Missing file content." });

      const buffer = Buffer.from(fileBase64, "base64");
      if (!buffer.length) return res.status(400).json({ success: false, error: "The uploaded file is empty." });
      if (buffer.length > 15 * 1024 * 1024) {
        return res.status(413).json({ success: false, error: "File is too large. Please keep uploads under 15MB." });
      }

      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-") || "document.pdf";
      const storagePath = `processing-cases/${caseId}/${Date.now()}-${safeName}`;
      const downloadToken = crypto.randomUUID();
      const storageBucket = admin.storage().bucket(STORAGE_BUCKET);

      await storageBucket.file(storagePath).save(buffer, {
        resumable: false,
        metadata: {
          contentType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken
          }
        }
      });

      const fileURL = `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;

      return res.json({
        success: true,
        storagePath,
        fileURL,
        fileSize: buffer.length
      });
    } catch (err) {
      console.error("uploadProcessingCaseDocument error:", err);
      return res.status(500).json({ success: false, error: err.message || "Could not upload document." });
    }
  });
});

exports.sendAgreementEmail = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      const authHeader = req.get("authorization") || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ success: false, error: "Missing CRM authorisation." });

      const decoded = await admin.auth().verifyIdToken(token);
      const userSnap = await db.collection("users").doc(decoded.uid).get();
      const userData = userSnap.exists ? userSnap.data() : {};
      const role = userData.role || (userData.admin === true ? "admin" : "");
      if (!["admin", "manager", "closer", "processing"].includes(role)) {
        return res.status(403).json({ success: false, error: "CRM user is not allowed to send agreements." });
      }

      const data = req.body || {};
      const to = String(data.to || "").trim();
      const clientName = String(data.clientName || "Client").trim();
      const subject = String(data.subject || "Next Step - Getting Started").trim();
      const text = String(data.text || "").trim();
      const pdfBase64 = String(data.pdfBase64 || "").trim();
      const pdfFileName = String(data.pdfFileName || "Quaerens-Agreement.pdf").trim();

      if (!to) return res.status(400).json({ success: false, error: "Missing recipient email." });
      if (!pdfBase64) return res.status(400).json({ success: false, error: "Missing PDF attachment." });

      let safeText = text || ("Dear " + clientName + ",\n\nPlease find your Quaerens agreement attached.\n\nKind regards,\nQuaerens Ltd");
      if (!safeText.includes("Confidentiality Notice:")) {
        safeText += "\n\n" + AGREEMENT_EMAIL_NOTICE;
      }
      const htmlBody = escapeAgreementHtml(safeText).replace(/\n/g, "<br>");

      const result = await resend.emails.send({
        from: "Quaerens Admin <admin@quaerens.co.uk>",
        to,
        subject,
        text: safeText,
        html: [
          "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:680px;margin:auto;'>",
          "<div style='text-align:center;margin-bottom:20px;'>",
          "<img src='https://www.quaerens.co.uk/images/quaerens-logo.png' alt='Quaerens' style='display:block;margin:0 auto;max-width:260px;width:100%;height:auto;border:0;'>",
          "</div>",
          "<h2 style='color:#1e3a8a;text-align:center;'>Your Quaerens agreement</h2>",
          "<p>", htmlBody, "</p>",
          "<hr style='margin:30px 0;border:none;border-top:1px solid #eee;'>",
          "<p style='font-size:12px;color:#666;text-align:center;'>Quaerens Ltd<br>71-75 Shelton Street, Covent Garden, London WC2H 9JQ<br>Company No. 16176152<br><br>You received this email because you asked Quaerens to prepare an agreement for your matter.</p>",
          "</div>"
        ].join(""),
        attachments: [
          {
            filename: pdfFileName,
            content: pdfBase64
          }
        ],
        tags: [
          { name: "type", value: "agreement" }
        ]
      });

      if (result?.error) {
        throw new Error(result.error.message || "Resend rejected the agreement email.");
      }

      await db.collection("sentEmails").add({
        type: "agreement",
        source: data.source || "",
        sourceId: data.sourceId || "",
        clientKey: data.clientKey || "",
        to,
        clientName,
        subject,
        pdfFileName,
        from: "admin@quaerens.co.uk",
        resendId: result?.data?.id || result?.id || "",
        sentByUid: decoded.uid,
        sentByEmail: decoded.email || "",
        sentByRole: role,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, resendId: result?.data?.id || result?.id || "" });
    } catch (err) {
      console.error("sendAgreementEmail error:", err);
      res.status(500).json({ success: false, error: err.message || "Email failed." });
    }
  });
});

exports.resendWebhook = onRequest(async (req, res) => {
  try {
    const event = req.body;
    console.log("Resend webhook:", JSON.stringify(event, null, 2));

    const { type, data } = event;

    await db.collection("emailEvents").add({
      resendId: data?.email_id || "",
      type: type || "",
      email: data?.to || "",
      subject: data?.subject || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send("ok");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("error");
  }
});

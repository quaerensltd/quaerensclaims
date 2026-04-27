require("dotenv").config();

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { Resend } = require("resend");
const cors = require("cors")({ origin: true });

admin.initializeApp();

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
      template: "claim_created",
      fullName: data.fullName,
      airline: data.airline,
      flightNumber: data.flightNumber,
      depAirport: data.depAirport,
      arrAirport: data.arrAirport,
      compensation: data.compensation
    });

    try {
      const result = await resend.emails.send({
  from: FROM_EMAIL,
  to: data.email,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text,
  tags: [
    { name: "type", value: "claim_created" },
    { name: "product", value: "freeflightclaim" }
  ]
});

      await db.collection("sentEmails").add({
  to: data.email,
  subject: emailContent.subject,
  source: "sendClaimEmailV2-resend",
  resendId: result?.data?.id || "",
  product: "freeflightclaim",
  type: "claim_created",
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

      const result = await resend.emails.send({
  from: FROM_EMAIL,
  to: data.to,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text,
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

function buildEmail(data) {
  const name = data.fullName || "there";
  const airline = data.airline || "the airline";
  const flight = data.flightNumber || "your flight";
  const compensation = data.compensation || 0;
  const depAirport = data.depAirport || "—";
  const arrAirport = data.arrAirport || "—";

  if (data.template === "airline_reply_check") {
    return {
      subject: "Has the airline replied to your claim?",
      html: [
        "<p>Hi " + name + ",</p>",
        "<p>Has " + airline + " replied about " + flight + "?</p>",
        "<p>If not, Quaerens can help with the next step.</p>"
      ].join("")
    };
  }

  if (data.template === "rejected_claim_help") {
    return {
      subject: "Airline rejected or ignored your claim?",
      html: [
        "<p>Hi " + name + ",</p>",
        "<p>If " + airline + " rejected or ignored your claim for " + flight + ", Quaerens can help prepare a stronger response.</p>"
      ].join("")
    };
  }

  return {
    subject: "Your FreeFlightClaim letter is ready",
    text:
      "Hi " + name + ",\n\n" +
      "Your claim letter for " + flight + " with " + airline + " is ready.\n" +
      "Route: " + depAirport + " to " + arrAirport + "\n" +
      "Estimated compensation: EUR " + compensation + "\n\n" +
      "Please send your claim letter to the airline and keep proof of submission.\n\n" +
      "Kind regards,\nFreeFlightClaim / Quaerens",
    html: [
      "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:auto;'>",
"<div style='text-align:center;margin-bottom:20px;'>",
"<img src='https://www.quaerens.co.uk/images/quaerens-logo.png' alt='Quaerens' style='height:70px;margin:0 10px;vertical-align:middle;'>",
"<img src='https://www.freeflightclaim.com/images/logo-freeflightclaim.png' alt='FreeFlightClaim' style='height:70px;margin:0 10px;vertical-align:middle;'>",
"</div>",
"<h2 style='color:#1e3a8a;text-align:center;'>Your FreeFlightClaim letter is ready</h2>",
      "<p>Hi " + name + ",</p>",
      "<p>Your claim letter for <strong>" + flight + "</strong> with <strong>" + airline + "</strong> is ready.</p>",
      "<p><strong>Route:</strong> " + depAirport + " → " + arrAirport + "</p>",
      "<p><strong>Estimated compensation:</strong> EUR " + compensation + "</p>",
      "<p>Please send your claim letter to the airline and keep proof of submission.</p>",
      "<p>Kind regards,<br>FreeFlightClaim / Quaerens</p>",
      "</div>"
    ].join("")
  };
}

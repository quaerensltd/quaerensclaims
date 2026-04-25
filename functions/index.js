require("dotenv").config();

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { Resend } = require("resend");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const db = admin.firestore();
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "FreeFlightClaim <claims@freeflightclaim.com>";

exports.sendClaimEmailV2 = onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const data = req.body || {};

    if (!data.email) {
      return res.status(400).json({ success: false, message: "Missing customer email" });
    }

    const subject = "Your FreeFlightClaim letter is ready";
    const html = buildEmail({
      template: "claim_created",
      fullName: data.fullName,
      airline: data.airline,
      flightNumber: data.flightNumber,
      compensation: data.compensation
    }).html;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject,
        html
      });

      await db.collection("sentEmails").add({
        to: data.email,
        subject,
        source: "sendClaimEmail",
        sent: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("sendClaimEmail error:", error);
      return res.status(500).json({ success: false, message: error.message });
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

      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.to,
        subject: emailContent.subject,
        html: emailContent.html
      });

      await emailDoc.ref.update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
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
    html: [
      "<p>Hi " + name + ",</p>",
      "<p>Your claim letter for " + flight + " with " + airline + " is ready.</p>",
      "<p>Estimated compensation: EUR " + compensation + "</p>",
      "<p>Kind regards,<br>FreeFlightClaim / Quaerens</p>"
    ].join("")
  };
}
const functions = require("firebase-functions");
const { Resend } = require("resend");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

const resend = new Resend("re_1234567890abcdef"); // your real Resend API key here

exports.sendClaimEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      // Handle preflight requests
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      // Reject anything that is not POST
      return res.status(405).send("Method Not Allowed");
    }

    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
      // Save claim to Firestore
      const docRef = await db.collection("claims").add({
        to,
        subject,
        html,
        status: "Pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send email with Resend
      await resend.emails.send({
        from: "claims@quaerens.co.uk", // or your consultant.com if needed temporarily
        to,
        subject,
        html,
      });

      return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      console.error("Function error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
});

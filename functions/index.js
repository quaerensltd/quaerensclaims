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
}

    try {
      const result = await resend.emails.send({
  from: FROM_EMAIL,
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
}
      const result = await resend.emails.send({
  from: FROM_EMAIL,
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

"use strict";
const crypto = require("crypto");
const QAR_REGISTRY = "professionalAssessmentQarRegistry";
const QAR_RESERVATIONS = "professionalAssessmentQarReservations";
const QAR_PATTERN = /^QAR-\d{8}-[A-F0-9]{8}$/;
function candidateQar(now = new Date(), randomBytes = crypto.randomBytes) {
  return `QAR-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(4).toString("hex").toUpperCase()}`;
}
async function allocateQar({ db, assessmentId, leadId = "", now = new Date(), randomBytes = crypto.randomBytes, serverTimestamp }) {
  if (!assessmentId) throw new Error("An assessment identity is required before allocating a QAR.");
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const qarReference = candidateQar(now, randomBytes), ref = db.collection(QAR_REGISTRY).doc(qarReference), reservationRef = db.collection(QAR_RESERVATIONS).doc(assessmentId), historicalQuery = db.collection("professionalAssessments").where("qarReference", "==", qarReference).limit(1);
    try {
      const allocated = await db.runTransaction(async (tx) => {
        const reservation = await tx.get(reservationRef);
        if (reservation.exists) {
          const data = reservation.data();
          if (data.assessmentId !== assessmentId || (leadId && data.leadId && data.leadId !== leadId)) throw new Error("Assessment/QAR reservation identity mismatch.");
          return data.qarReference;
        }
        const [registered, historical] = await Promise.all([tx.get(ref), tx.get(historicalQuery)]);
        if (registered.exists || !historical.empty) { const error = new Error("QAR collision"); error.code = "QAR_COLLISION"; throw error; }
        const allocatedAt = serverTimestamp ? serverTimestamp() : now.toISOString();
        tx.create(ref, { assessmentId, qarReference, leadId, allocatedAt, immutable: true });
        tx.create(reservationRef, { assessmentId, qarReference, leadId, state: "RESERVED", allocatedAt, immutableIdentity: true });
        return qarReference;
      });
      return allocated;
    } catch (error) { if (error?.code === "QAR_COLLISION") continue; throw error; }
  }
  throw new Error("A unique Quaerens Assessment Reference could not be allocated.");
}
function assessmentSource(record = {}) {
  const source = String(record.assessmentSource || "").trim().toUpperCase();
  return ["FRAMEWORK_B", "AI_ASSISTED", "MANUAL_UPLOAD"].includes(source) ? source : "FRAMEWORK_B";
}
module.exports = { QAR_REGISTRY, QAR_RESERVATIONS, QAR_PATTERN, candidateQar, allocateQar, assessmentSource };

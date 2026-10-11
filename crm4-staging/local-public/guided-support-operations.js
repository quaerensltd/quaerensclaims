// Extends the existing administrator queue; no new CRM authority.
export function installGuidedOperations({ container, body, message, call, onLegacy }) {
  const selector = document.createElement("select"), label = document.createElement("label");
  label.textContent = "Commerce queue "; selector.setAttribute("aria-label", "Commerce queue mode");
  for (const [value, text] of [["LEGACY", "Historical test cases"], ["TEST", "TEST — synthetic work"], ["LIVE", "LIVE — paid consumer work"]]) { const option = document.createElement("option"); option.value = value; option.textContent = text; selector.append(option); }
  label.append(selector); container.prepend(label);
  const detail = document.createElement("section"); detail.hidden = true; detail.setAttribute("aria-label", "Guided Support case detail"); container.append(detail);
  const notice = text => { message.textContent = text; };
  const action = (label, fn, parent = detail) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-secondary"; b.textContent = label; b.onclick = async () => { b.disabled = true; try { await fn(); } catch (e) { notice(e.message || "Action failed. Reload before retrying."); } finally { b.disabled = false; } }; parent.append(b); };
  async function open(id) {
    detail.replaceChildren(); detail.hidden = true;
    const r = await call("guidedSupportAdminCaseDetail", { caseId: id, mode: selector.value }), c = r.case;
    const h = document.createElement("h3"); h.textContent = `${c.mode} · ${c.complaintPackReference} · ${c.reviewStatus}`; detail.append(h);
    const context = document.createElement("pre"); context.style.whiteSpace = "pre-wrap"; context.textContent = JSON.stringify({ customer: c.customer, passengers: c.passengers, context: c.complaintPackSnapshot, paymentStatus: c.paymentStatus, paidPence: c.amountPaid, refundedPence: c.refundedAmount, serviceStart: c.serviceStartEligibilityDate, cancellation: c.cancellation || null }, null, 2); detail.append(context);
    const reviewer = document.createElement("input"); reviewer.setAttribute("aria-label", "Platform administrator reviewer UID"); reviewer.value = c.assignedReviewer || ""; detail.append(reviewer);
    const review = document.createElement("textarea"); review.setAttribute("aria-label", "Client-facing bounded Guided Support review"); review.value = c.review || ""; review.rows = 10; detail.append(review);
    const update = async (actionName, extra = {}) => { await call("guidedSupportAdminWorkCase", { caseId: id, mode: c.mode, expectedRevision: c.revision, action: actionName, ...extra }); notice("Case updated."); await open(id); };
    action("Assign reviewer", () => update("assign-reviewer", { reviewerUid: reviewer.value.trim() }));
    action("Save review", () => update("save-review", { review: review.value }));
    const information = document.createElement("textarea"); information.setAttribute("aria-label","Client-visible information request"); information.value=c.informationRequest||""; detail.append(information);
    for (const [status, title] of [["review-in-progress", "Start / resume review"], ["information-required", "Information required"], ["review-ready", "Review ready"], ["completed", "Complete and queue consumer notification"], ["record-cancellation-request", "Record cancellation request"]]) action(title, () => update(status,status==='information-required'?{informationRequest:information.value}:{}));
    const amount = document.createElement("input"); amount.type = "number"; amount.min = "1"; amount.max = String(c.amountPaid - c.refundedAmount); amount.setAttribute("aria-label", "Refund amount in pence");
    const reason = document.createElement("input"); reason.setAttribute("aria-label", "Refund reason"); detail.append(amount, reason);
    // Keep operation ID stable after uncertain responses. A new operation requires reopening detail.
    const operationId = crypto.randomUUID(); action("Request governed refund", async () => { await call("guidedSupportAdminRefundPurchase", { purchaseId: c.transactionId, operationId, amount: Number(amount.value), reason: reason.value }); notice("Refund request reconciled; refresh for confirmed state."); });
    const audit = document.createElement("pre"); audit.textContent = JSON.stringify(r.audit, null, 2); detail.append(audit); detail.hidden = false;
  }
  async function load() {
    detail.hidden = true;
    if (selector.value === "LEGACY") return false;
    const data = await call("guidedSupportAdminListModeCases", { mode: selector.value }); body.replaceChildren();
    for (const c of data.cases) {
      const row = document.createElement("tr");
      for (const value of [c.complaintPackReference, c.customer?.email, c.productName, `£${(c.amountPaid / 100).toFixed(2)} · ${c.paymentStatus}`, c.serviceStartEligibilityDate, c.reviewStatus, c.assignedReviewer || "Unassigned"]) { const td = document.createElement("td"); td.textContent = value; row.append(td); }
      const td = document.createElement("td"); action("Open review", () => open(c.caseId), td); row.append(td); body.append(row);
    }
    notice(`${selector.value}: ${data.cases.length} cases. Test and live work are separate.`);
    return true;
  }
  action("Notification queue", async () => {
    if (selector.value === "LEGACY") return;
    const jobs = await call("guidedSupportAdminListNotifications", { mode: selector.value }); detail.replaceChildren(); detail.hidden = false;
    for (const j of jobs.jobs) { const p = document.createElement("p"); p.textContent = `${j.type} · ${j.state} · ${j.purchaseId}`; detail.append(p); if (j.state !== "SENT") action("Dispatch / retry notification", async () => { await call("guidedSupportAdminDispatchNotification", { notificationId: j.id }); notice("Notification accepted. Refresh to verify."); }); }
  }, container);
  selector.onchange = async () => {
    detail.hidden=true; body.replaceChildren();
    for(const id of ['guidedSupportTestProduct','openGuidedSupportTestBtn','provisionGuidedSupportTestBtn']){const element=document.getElementById(id);if(element)element.hidden=selector.value==='LIVE';}
    try { if(selector.value==='LEGACY')await onLegacy();else await load(); }catch(e){notice(e.message);}
  };
  return { load, mode: () => selector.value };
}

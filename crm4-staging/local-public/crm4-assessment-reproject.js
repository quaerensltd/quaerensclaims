(function (root) {
  "use strict";
  function authority(member) {
    return member?.active === true && member.workspaceId === "CRM4" &&
      ["manager", "administrator"].includes(String(member.role || "").trim().toLowerCase());
  }
  function eligible(s) {
    const a = s?.restoration?.assessment, r = s?.restoration?.artifact;
    // GetState returns assessments only for AI_ASSISTED sources and checks
    // manager/administrator issuer capabilities server-side before returning.
    return s?.reprojectAuthority === true && a?.status === "DRAFT" &&
      !!a.id && !!a.qarReference && Number.isInteger(a.revision) && a.revision > 0 &&
      r?.status === "STAFF_CONFIRMED" &&
      ["CONFIRMED_UNCHANGED", "CORRECTED"].includes(r.confirmationOutcome);
  }
  function identity(s) {
    const a = s.restoration.assessment;
    return JSON.stringify([s.client, a.id, a.qarReference, a.revision, a.status, s.restoration.artifact]);
  }
  function create({ load, invoke, render, refresh }) {
    let state = null, confirmation = null, pending = false;
    function update(s) { state = s; confirmation = null; render({ state, eligible: eligible(state), pending, confirming: false }); }
    async function open() {
      if (pending) return;
      pending = true;
      render({ state, pending, message: "Checking current draft…" });
      try {
        const fresh = await load();
        if (!eligible(fresh)) throw new Error("An authorised Manager/Administrator and a confirmed existing AI-assisted DRAFT are required.");
        state = fresh; confirmation = identity(fresh);
        render({ state, eligible: true, confirming: true, pending: false });
      } catch (e) { confirmation = null; render({ state, eligible: false, pending: false, error: e.message }); }
      finally { pending = false; }
    }
    function cancel() { if (!pending) update(state); }
    async function confirm() {
      if (pending || !confirmation || !eligible(state)) return;
      pending = true;
      const approved = confirmation, original = state.restoration.assessment;
      confirmation = null;
      render({ state, pending: true, message: "Reprojecting existing draft — do not submit again…" });
      let succeeded = false;
      try {
        const fresh = await load();
        if (!eligible(fresh) || identity(fresh) !== approved) throw new Error("The draft or confirmed review changed. Reload and review before confirming again.");
        const result = await invoke();
        if (!["REPROJECTED", "ALREADY_CURRENT"].includes(result.result) ||
            result.assessmentId !== original.id || result.qarReference !== original.qarReference)
          throw new Error("Unexpected reprojection result. Do not retry; inspect the current draft.");
        succeeded = true;
        const current = await load(), a = current.restoration?.assessment;
        if (a?.id !== original.id || a.qarReference !== original.qarReference || a.status !== "DRAFT" || a.revision !== result.revision)
          throw new Error("Reprojection returned, but draft read-back did not match. Do not retry.");
        state = current;
        refresh(current);
        render({ state, eligible: eligible(state), pending: false, message: result.result === "ALREADY_CURRENT" ? "Existing draft is already current. No new revision created." : "Existing draft reprojected. Review the DRAFT preview. Nothing was approved, finalised or sent." });
      } catch (e) {
        render({ state, eligible: false, pending: false, error: (succeeded ? "Reprojection succeeded; read-back needs attention. " : "") + e.message });
      } finally { pending = false; }
    }
    return { update, open, cancel, confirm };
  }
  const api = { authority, eligible, create };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AssessmentReproject = api;
})(typeof window === "undefined" ? {} : window);

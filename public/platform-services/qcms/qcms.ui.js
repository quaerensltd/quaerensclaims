const { renderQCMSExperience } = require("./qcms.render");

function mountQCMSExperience(target, caseSummary, options = {}) {
  if (!target || typeof target.innerHTML === "undefined") {
    return {
      ok: false,
      error: "A valid target element is required.",
      html: renderQCMSExperience(caseSummary, options)
    };
  }
  const html = renderQCMSExperience(caseSummary, options);
  target.innerHTML = html;
  return { ok: true, html };
}

module.exports = {
  mountQCMSExperience,
  renderQCMSExperience
};

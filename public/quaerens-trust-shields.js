(function () {
  var path = (window.location.pathname || "").toLowerCase();
  if (/admin|dashboard|login|agenda|assessment-detail/.test(path)) return;

  var styleId = "quaerens-trust-shield-style";
  if (!document.getElementById(styleId)) {
    var style = document.createElement("style");
    style.id = styleId;
    style.textContent = [
      ".quaerens-trust-shield{margin-top:.85rem;border:1px solid #bfdbfe;background:#f8fbff;border-radius:14px;padding:.85rem 1rem;color:#1e3a8a;font-size:.88rem;line-height:1.45;text-align:left}",
      ".quaerens-trust-shield strong{display:block;color:#0f172a;font-size:.92rem;margin-bottom:.25rem}",
      ".quaerens-trust-shield span{display:block;color:#334155}"
    ].join("");
    document.head.appendChild(style);
  }

  function addShield(button) {
    if (!button || button.dataset.quaerensTrustShield === "true") return;
    var form = button.closest("form");
    if (!form || form.querySelector(".quaerens-trust-shield")) return;
    var shield = document.createElement("div");
    shield.className = "quaerens-trust-shield";
    shield.innerHTML = "<strong>Data privacy &amp; security</strong><span>Your details are sent over HTTPS and used only to understand and respond to your enquiry. Case information is treated as confidential and is not sold to third-party marketing brokers.</span><span>Quaerens Ltd is currently registered with the UK Information Commissioner's Office (ICO). Application reference: C1944311 (Official Registration Number publishing shortly).</span>";
    button.insertAdjacentElement("afterend", shield);
    button.dataset.quaerensTrustShield = "true";
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form button[type='submit'], form input[type='submit']").forEach(addShield);
  });
})();

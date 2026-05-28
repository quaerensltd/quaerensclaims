(() => {
  const clean = (value) => String(value || "")
    .replace(/[^a-zA-Z0-9_:-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

  const page = clean(location.pathname.split("/").pop() || "home");

  function send(name, details = {}) {
    const eventName = clean(name);
    const payload = {
      event_category: "quaerens_conversion",
      page,
      ...details
    };

    try {
      if (typeof window.clarity === "function") {
        window.clarity("event", eventName);
      }
    } catch (_) {}

    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      }
    } catch (_) {}

    try {
      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", eventName, payload);
      }
    } catch (_) {}
  }

  let formStarted = new WeakSet();

  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest("a,button");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const text = clean(link.textContent || link.getAttribute("aria-label") || "");

    if (href.startsWith("tel:")) {
      send("phone_click", { cta_text: text });
      return;
    }

    if (href.startsWith("mailto:")) {
      send("email_click", { cta_text: text });
      return;
    }

    if (/wa\.me|whatsapp/i.test(href)) {
      send("whatsapp_click", { cta_text: text });
      return;
    }

    if (href.includes("claim.html")) {
      send("claim_start_click", { cta_text: text });
      return;
    }

    if (href.includes("#request-callback") || /request.*call.*back/i.test(link.textContent || "")) {
      send("callback_cta_click", { cta_text: text });
    }
  }, { passive: true });

  document.addEventListener("focusin", (event) => {
    const form = event.target.closest && event.target.closest("form");
    if (!form || formStarted.has(form)) return;
    formStarted.add(form);

    if (form.classList.contains("quaerens-callback-form")) {
      send("callback_form_start", {
        issue: clean(form.dataset.callbackIssue || form.querySelector("[name='issue']")?.value || "unknown")
      });
    } else if (form.id) {
      send("form_start", { form_id: clean(form.id) });
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.classList.contains("quaerens-callback-form")) {
      send("callback_form_submit", {
        issue: clean(form.dataset.callbackIssue || form.querySelector("[name='issue']")?.value || "unknown")
      });
    } else if (form.id) {
      send("form_submit", { form_id: clean(form.id) });
    }
  }, true);

  window.quaerensTrack = send;
})();
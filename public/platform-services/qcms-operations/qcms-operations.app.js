(function () {
  const root = document.getElementById("qcms-operations-root");
  const render = window.QCMSOperationsRender;
  const model = window.QCMSOperationsModel;
  const state = { filters: {}, flash: "" };
  const storageKey = "qcms-operations-1-4-1-mock-state";
  let lastFocus = null;

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "") || "dashboard";
    const parts = raw.split("/");
    return { route: parts[0], reference: parts[1], tab: parts[2] };
  }

  function hydrate() {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) model.setCases(JSON.parse(saved));
    } catch (error) {
      console.warn("QCMS Operations mock state could not be restored.", error);
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(model.allCases()));
    } catch (error) {
      console.warn("QCMS Operations mock state could not be saved.", error);
    }
  }

  function mount() {
    const route = parseHash();
    if (route.route === "cases") {
      root.innerHTML = render.casesRegister(state.filters);
    } else if (route.route === "case") {
      root.innerHTML = render.caseWorkspace(route.reference, route.tab || "overview");
    } else if (route.route === "dashboard") {
      root.innerHTML = render.dashboard();
    } else {
      root.innerHTML = render.placeholder(route.route);
    }
    if (state.flash) showToast(state.flash);
    bind();
  }

  function bind() {
    root.querySelectorAll("tr[data-href]").forEach(function (row) {
      row.addEventListener("click", function (event) {
        if (event.target.tagName !== "A") window.location.hash = row.getAttribute("data-href");
      });
    });

    const filters = root.querySelector("[data-qops-filters]");
    if (filters) {
      filters.addEventListener("submit", function (event) {
        event.preventDefault();
        const form = new FormData(filters);
        state.filters = {
          query: form.get("query"),
          status: form.get("status"),
          type: form.get("type"),
          priority: form.get("priority"),
          manager: form.get("manager"),
          sort: form.get("sort")
        };
        root.innerHTML = render.casesRegister(state.filters);
        bind();
      });
    }

    const noteForm = root.querySelector("[data-qops-note]");
    if (noteForm) {
      noteForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const note = String(new FormData(noteForm).get("note") || "").trim();
        const result = model.applyWorkspaceAction(noteForm.getAttribute("data-qops-note"), "send-reminder", {
          recipient: "Internal team",
          reminderType: "Internal note",
          message: note || "Prototype note added.",
          actor: "Prototype User"
        });
        persist();
        document.getElementById("qops-note-result").innerHTML = '<p class="qops-success">Mock internal note added to the visible activity trail for this browser session.</p>';
        state.flash = result.entry ? "Internal note added to mock activity." : "";
      });
    }

    root.querySelectorAll("[data-qops-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        openAction(button.getAttribute("data-qops-case"), button.getAttribute("data-qops-action"), button);
      });
    });

    root.querySelectorAll("[data-qops-reset]").forEach(function (button) {
      button.addEventListener("click", function () {
        model.resetMockState();
        try { window.localStorage.removeItem(storageKey); } catch (error) {}
        state.flash = "Mock data reset to original fixtures.";
        mount();
      });
    });
  }

  function openAction(reference, actionKey, trigger) {
    const caseItem = model.findCase(reference);
    lastFocus = trigger || document.activeElement;
    const holder = document.createElement("div");
    holder.innerHTML = render.actionDialog(caseItem, actionKey);
    document.body.appendChild(holder.firstChild);
    bindModal();
  }

  function bindModal() {
    const modal = document.querySelector("[data-qops-modal]");
    if (!modal) return;
    const dialog = modal.querySelector(".qops-action-modal");
    const closeButtons = modal.querySelectorAll("[data-qops-close]");
    const form = modal.querySelector("[data-qops-action-form]");
    const focusable = getFocusable(dialog);

    closeButtons.forEach(function (button) { button.addEventListener("click", closeModal); });
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", handleModalKeydown);
    if (focusable[0]) focusable[0].focus();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = formDataToObject(new FormData(form));
      const result = model.applyWorkspaceAction(form.getAttribute("data-qops-case"), form.getAttribute("data-qops-action-form"), data);
      if (result.error) {
        showToast(result.error);
        return;
      }
      persist();
      state.flash = "Mock action completed and activity trail updated.";
      closeModal();
      mount();
    });
  }

  function formDataToObject(formData) {
    const output = {};
    formData.forEach(function (value, key) { output[key] = value; });
    output.followUpRequired = output.followUpRequired === "yes";
    output.confirmClose = output.confirmClose === "yes";
    return output;
  }

  function getFocusable(container) {
    return Array.prototype.slice.call(container.querySelectorAll("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])"))
      .filter(function (item) { return !item.disabled && item.offsetParent !== null; });
  }

  function handleModalKeydown(event) {
    const modal = document.querySelector("[data-qops-modal]");
    if (!modal) return;
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusable(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function closeModal() {
    const modal = document.querySelector("[data-qops-modal]");
    if (modal) modal.remove();
    document.removeEventListener("keydown", handleModalKeydown);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function showToast(message) {
    if (!message) return;
    const existing = document.querySelector(".qops-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "qops-toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () {
      if (toast.parentNode) toast.remove();
      state.flash = "";
    }, 2800);
  }

  window.addEventListener("hashchange", mount);
  hydrate();
  mount();
})();

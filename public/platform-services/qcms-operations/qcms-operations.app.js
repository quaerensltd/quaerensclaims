(function () {
  const root = document.getElementById("qcms-operations-root");
  const render = window.QCMSOperationsRender;
  const model = window.QCMSOperationsModel;
  const state = { filters: {} };

  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "") || "dashboard";
    const parts = raw.split("/");
    return { route: parts[0], reference: parts[1], tab: parts[2] };
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
        const caseItem = model.findCase(noteForm.getAttribute("data-qops-note"));
        const note = String(new FormData(noteForm).get("note") || "").trim();
        const entry = model.createActivity(caseItem, "Internal note added", note || "Prototype note added.", "Prototype User");
        caseItem.activity.unshift(entry);
        document.getElementById("qops-note-result").innerHTML = '<p class="qops-success">Mock internal note added to the visible activity trail for this browser session.</p>';
      });
    }
  }

  window.addEventListener("hashchange", mount);
  mount();
})();

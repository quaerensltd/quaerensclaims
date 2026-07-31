(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-scroll-target]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) {
        return;
      }

      const target = document.querySelector(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const ecosystemButtons = Array.from(document.querySelectorAll("[data-focus-ecosystem]"));
  const ecosystemPanels = Array.from(document.querySelectorAll("[data-ecosystem]"));

  ecosystemButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.focusEcosystem;

      ecosystemButtons.forEach((control) => {
        const isSelected = control.dataset.focusEcosystem === selected;
        control.setAttribute("aria-pressed", String(isSelected));
        control.classList.toggle("is-active", isSelected);
      });

      ecosystemPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.ecosystem === selected);
      });
    });
  });

  const journeyStages = Array.from(document.querySelectorAll(".journey-stage"));
  const journeyFocus = document.getElementById("journey-focus");

  journeyStages.forEach((stage) => {
    stage.addEventListener("click", () => setJourneyFocus(stage));
  });

  function setJourneyFocus(stage) {
    journeyStages.forEach((item) => item.classList.toggle("is-active", item === stage));

    if (!journeyFocus) {
      return;
    }

    const title = stage.dataset.stage || stage.querySelector("strong")?.textContent || "Journey stage";
    const detail = stage.dataset.detail || "";
    journeyFocus.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p>`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}());

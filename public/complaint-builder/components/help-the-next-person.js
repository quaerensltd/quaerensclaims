const COMPONENT_SELECTOR = "[data-qcb-help-next-person]";
const REVIEW_URL = "https://www.trustpilot.com/evaluate/quaerens.co.uk";

function shareUrl() {
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (canonical) return canonical;
  return `${window.location.origin}${window.location.pathname}`;
}

function builderName(root) {
  const heading = root.closest("[data-qcb-builder]")?.querySelector(".qcb-builder-head h2");
  return heading?.textContent?.trim() || "Quaerens Free Complaint Pack Builder";
}

function componentMarkup(id) {
  return `
    <section class="qcb-help-next-person" data-qcb-help-next-person aria-labelledby="${id}-title">
      <div class="qcb-help-heading">
        <p class="qcb-builder-kicker"><span aria-hidden="true">&#10084;&#65039;</span> Help the Next Person</p>
        <h3 id="${id}-title">Help the Next Person</h3>
        <p>If today's free Complaint Pack has helped you, perhaps you could help the next person.</p>
        <p>There are several ways you can make a difference.</p>
      </div>
      <div class="qcb-help-options">
        <article class="qcb-help-card">
          <span class="qcb-help-icon" aria-hidden="true">&#11088;</span>
          <h4>Leave an Honest Review</h4>
          <p>Your honest experience helps future users decide whether Quaerens is the right platform for them.</p>
          <p>We are not asking for a positive review.</p>
          <p>We are simply asking for an honest one.</p>
          <a class="qcb-btn secondary" href="${REVIEW_URL}" target="_blank" rel="noopener noreferrer">Leave an Honest Review</a>
        </article>
        <article class="qcb-help-card">
          <span class="qcb-help-icon" aria-hidden="true">&#128227;</span>
          <h4>Share This Free Tool</h4>
          <p>Someone else may be struggling with the same problem today.</p>
          <p>Sharing this free Complaint Pack Builder could genuinely help them save time, money and unnecessary stress.</p>
          <button class="qcb-btn secondary" type="button" data-qcb-share-tool>Share This Tool</button>
          <p class="qcb-help-status" data-qcb-share-status role="status" aria-live="polite"></p>
        </article>
      </div>
      <div class="qcb-help-thanks">
        <p>Thank you for using The Quaerens Platform.</p>
        <p>We believe consumers deserve clear, evidence-first support before they ever feel pressured to pay for help.</p>
        <p>If today's free Complaint Pack has helped you, thank you for helping the next person.</p>
      </div>
    </section>`;
}

async function copyShareLink(url, status) {
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = "The link has been copied. You can now share it wherever it may help.";
    return;
  } catch (_) {
    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    status.textContent = copied ? "The link has been copied. You can now share it wherever it may help." : `Share this link: ${url}`;
  }
}

async function shareTool(button, root) {
  const status = root.querySelector("[data-qcb-share-status]");
  const url = shareUrl();
  const title = builderName(root);
  const text = "This free Quaerens Complaint Pack Builder may help someone organise their evidence and prepare their complaint.";

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      status.textContent = "Thank you for helping the next person.";
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        status.textContent = "Sharing was cancelled. Nothing was sent.";
        return;
      }
    }
  }

  await copyShareLink(url, status);
  button.focus();
}

function mountHelpTheNextPerson() {
  document.querySelectorAll('[data-qcb-version="4"]').forEach((builder, index) => {
    const steps = builder.querySelectorAll('.qcb-step-page[data-qcb-step]');
    const completion = steps[steps.length - 1];
    if (!completion) return;
    if (completion.querySelector(COMPONENT_SELECTOR)) return;
    const anchor = completion.querySelector(".qcb-separate-support") || completion.querySelector(".qcb-support-card") || completion.lastElementChild;
    if (!anchor) return;
    anchor.insertAdjacentHTML("afterend", componentMarkup(`qcb-help-next-person-${index + 1}`));
    const root = completion.querySelector(COMPONENT_SELECTOR);
    const shareButton = root.querySelector("[data-qcb-share-tool]");
    shareButton.addEventListener("click", () => shareTool(shareButton, root));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountHelpTheNextPerson, { once: true });
} else {
  mountHelpTheNextPerson();
}

export { mountHelpTheNextPerson };

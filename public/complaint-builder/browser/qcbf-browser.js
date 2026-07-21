"use strict";

(function(root) {
  const QCBF = root.QCBF || {};

  function qs(id) {
    return document.getElementById(id);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function fallback(value, text) {
    return value && String(value).trim() ? String(value).trim() : text || "Not provided";
  }

  function lines(items) {
    return items.filter(Boolean).join("\n");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, match => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[match]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function money(value) {
    const parsed = parseFloat(value || "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function StateManager(config, options) {
    this.storageKey = (config && (config.storageKey || config.storageNamespace)) || "quaerensComplaintBuilderDraft";
    this.storage = (options && options.storage) || root.sessionStorage;
  }

  StateManager.prototype.save = function(data) {
    if (!this.storage) return;
    this.storage.setItem(this.storageKey, JSON.stringify(data || {}));
  };

  StateManager.prototype.restore = function() {
    if (!this.storage) return null;
    try {
      return JSON.parse(this.storage.getItem(this.storageKey) || "null");
    } catch (error) {
      return null;
    }
  };

  StateManager.prototype.clear = function() {
    if (this.storage) this.storage.removeItem(this.storageKey);
  };

  function StepController(steps) {
    this.steps = steps || [];
    this.index = 0;
  }

  StepController.prototype.set = function(index) {
    this.index = Math.max(0, Math.min(this.steps.length - 1, index));
    return this.index;
  };

  StepController.prototype.next = function() {
    return this.set(this.index + 1);
  };

  StepController.prototype.previous = function() {
    return this.set(this.index - 1);
  };

  function downloadBlob(name, type, content) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function textToRtf(text) {
    return "{\\rtf1\\ansi\\deff0\n" + String(text || "")
      .replace(/[\\{}]/g, "\\$&")
      .replace(/\n/g, "\\line\n") + "\n}";
  }

  function downloadPdf(name, title, text) {
    if (!root.jspdf || !root.jspdf.jsPDF) {
      root.print();
      return;
    }
    const pdf = new root.jspdf.jsPDF({ unit: "pt", format: "a4" });
    const margin = 42;
    const maxWidth = 510;
    let y = 48;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(title || "Quaerens Complaint Pack", margin, y);
    y += 26;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    String(text || "").split("\n").forEach(line => {
      const wrapped = pdf.splitTextToSize(line || " ", maxWidth);
      wrapped.forEach(part => {
        if (y > 770) {
          pdf.addPage();
          y = 48;
        }
        pdf.text(part, margin, y);
        y += 14;
      });
    });
    pdf.save(name);
  }

  function expenseTotal(expenses) {
    return (expenses || []).reduce((sum, expense) => sum + money(expense.amount), 0);
  }

  function expenseLines(expenses) {
    if (!expenses || !expenses.length) return "No additional expenses listed.";
    return expenses.map((expense, index) => `${index + 1}. ${fallback(expense.type, "Expense")} - ${fallback(expense.currency, "GBP")} ${fallback(expense.amount, "0")} - ${fallback(expense.note, "No note")}`).join("\n");
  }

  function announce(message) {
    let live = qs("qcbf-live-region");
    if (!live) {
      live = document.createElement("div");
      live.id = "qcbf-live-region";
      live.setAttribute("aria-live", "polite");
      live.style.position = "absolute";
      live.style.left = "-9999px";
      document.body.appendChild(live);
    }
    live.textContent = message;
  }

  QCBF.dom = { qs, qsa };
  QCBF.text = { fallback, lines, escapeHtml, escapeAttr, money };
  QCBF.StateManager = StateManager;
  QCBF.StepController = StepController;
  QCBF.downloadBlob = downloadBlob;
  QCBF.textToRtf = textToRtf;
  QCBF.downloadPdf = downloadPdf;
  QCBF.expenses = { total: expenseTotal, lines: expenseLines };
  QCBF.accessibility = { announce };

  root.QCBF = QCBF;
})(typeof globalThis !== "undefined" ? globalThis : window);

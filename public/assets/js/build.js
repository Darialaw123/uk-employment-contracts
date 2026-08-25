/**
 * The document builder.
 *
 * State is a single answers object. Every edit writes to it, re-renders the
 * step (because a change can reveal or hide later questions) and re-assembles
 * the preview. Answers persist to localStorage so a refresh or an accidental
 * back-navigation does not lose the work.
 */
(function (global) {
  "use strict";

  const UK = global.UK;
  const doc = global.document;

  const slug = new URLSearchParams(global.location.search).get("template") || "employment-contract";
  const meta = UK.getTemplate(slug);
  const template = UK.getBuilderTemplate(slug);

  const els = {
    title: doc.getElementById("builder-title"),
    steps: doc.getElementById("step-nav"),
    form: doc.getElementById("step-form"),
    stepTitle: doc.getElementById("step-title"),
    stepBlurb: doc.getElementById("step-blurb"),
    preview: doc.getElementById("preview"),
    progress: doc.getElementById("progress-bar"),
    progressText: doc.getElementById("progress-text"),
    prev: doc.getElementById("prev-step"),
    next: doc.getElementById("next-step"),
    gaps: doc.getElementById("gaps"),
    downloadDocx: doc.getElementById("download-docx"),
    downloadPdf: doc.getElementById("download-pdf"),
    copyText: doc.getElementById("copy-text"),
    reset: doc.getElementById("reset-answers"),
  };

  if (!template || !meta) {
    if (els.title) els.title.textContent = "Template not found";
    if (els.form) {
      els.form.innerHTML =
        '<p>We could not find that template. <a href="/templates">Browse the catalogue</a> to pick one.</p>';
    }
    return;
  }

  const STORAGE_KEY = `uk-site:answers:${slug}`;

  let answers = UK.initialAnswers(template);
  let stepIndex = 0;

  /* localStorage can throw outright in a private window or with site data
     blocked, so every access is guarded and the builder works without it. */
  try {
    const saved = global.localStorage.getItem(STORAGE_KEY);
    if (saved) answers = Object.assign(answers, JSON.parse(saved));
  } catch {
    /* carry on with defaults */
  }

  function persist() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* nothing to do — the builder still works in memory */
    }
  }

  /* ---------------------------------------------------------------- render */

  function fieldId(question) {
    return `q-${question.id}`;
  }

  function renderControl(question) {
    const value = answers[question.id];
    const id = fieldId(question);
    const common = `id="${id}" name="${question.id}" data-question="${question.id}"`;

    switch (question.type) {
      case "textarea":
        return `<textarea ${common} rows="3" placeholder="${escapeAttr(question.placeholder)}">${escapeHtml(value || "")}</textarea>`;

      case "select":
        return `<select ${common}>${(question.options || [])
          .map(
            (o) =>
              `<option value="${escapeAttr(o.value)}"${String(value) === String(o.value) ? " selected" : ""}>${escapeHtml(o.label)}</option>`
          )
          .join("")}</select>`;

      case "radio":
        return `<div class="field__radios" role="radiogroup" aria-labelledby="${id}-label">${(question.options || [])
          .map(
            (o, i) => `
            <label class="radio">
              <input type="radio" name="${question.id}" value="${escapeAttr(o.value)}" data-question="${question.id}"
                ${String(value) === String(o.value) ? "checked" : ""} ${i === 0 ? `id="${id}"` : ""}>
              <span>${escapeHtml(o.label)}</span>
            </label>`
          )
          .join("")}</div>`;

      case "multi":
        return `<div class="field__checks">${(question.options || [])
          .map(
            (o) => `
            <label class="check">
              <input type="checkbox" value="${escapeAttr(o.value)}" data-question="${question.id}" data-multi="1"
                ${Array.isArray(value) && value.includes(o.value) ? "checked" : ""}>
              <span>${escapeHtml(o.label)}</span>
            </label>`
          )
          .join("")}</div>`;

      case "toggle":
        return `<label class="toggle">
          <input type="checkbox" ${common} ${value ? "checked" : ""}>
          <span>${escapeHtml(question.label)}</span>
        </label>`;

      case "number":
      case "money":
        return `<div class="field__prefixed">${question.type === "money" ? '<span aria-hidden="true">£</span>' : ""}
          <input type="number" ${common} value="${escapeAttr(value ?? "")}"
            ${question.min != null ? `min="${question.min}"` : ""}
            ${question.max != null ? `max="${question.max}"` : ""}
            step="${question.step || (question.type === "money" ? "0.01" : "1")}"
            placeholder="${escapeAttr(question.placeholder)}"></div>`;

      case "date":
        return `<input type="date" ${common} value="${escapeAttr(value || "")}">`;

      default:
        return `<input type="text" ${common} value="${escapeAttr(value || "")}" placeholder="${escapeAttr(question.placeholder)}">`;
    }
  }

  function renderStep() {
    const steps = UK.visibleSteps(template, answers);
    if (stepIndex >= steps.length) stepIndex = steps.length - 1;
    if (stepIndex < 0) stepIndex = 0;
    const step = steps[stepIndex];

    els.stepTitle.textContent = step.title;
    els.stepBlurb.textContent = step.blurb || "";
    els.stepBlurb.hidden = !step.blurb;

    els.form.innerHTML = UK.visibleQuestions(step, answers)
      .map((question) => {
        const isToggle = question.type === "toggle";
        return `
        <div class="field${isToggle ? " field--toggle" : ""}" data-field="${question.id}">
          ${isToggle ? "" : `<label class="field__label" id="${fieldId(question)}-label" for="${fieldId(question)}">${escapeHtml(question.label)}${question.required ? ' <span class="field__required" title="Required">*</span>' : ""}</label>`}
          ${renderControl(question)}
          ${question.help ? `<p class="field__help">${escapeHtml(question.help)}</p>` : ""}
        </div>`;
      })
      .join("");

    els.steps.innerHTML = steps
      .map(
        (s, i) => `
        <li>
          <button type="button" class="step-link${i === stepIndex ? " is-current" : ""}" data-step="${i}">
            <span class="step-link__index">${i + 1}</span>
            <span>${escapeHtml(s.title)}</span>
          </button>
        </li>`
      )
      .join("");

    els.prev.disabled = stepIndex === 0;
    els.next.disabled = stepIndex === steps.length - 1;
    els.next.textContent = stepIndex === steps.length - 1 ? "Last step" : "Next";

    renderProgress(steps);
  }

  function renderProgress(steps) {
    const gaps = UK.outstanding(template, answers);
    const required = [];
    for (const step of steps) {
      for (const q of UK.visibleQuestions(step, answers)) if (q.required) required.push(q);
    }
    const done = required.length - gaps.length;
    const pct = required.length === 0 ? 100 : Math.round((done / required.length) * 100);

    els.progress.style.width = `${pct}%`;
    els.progress.parentElement.setAttribute("aria-valuenow", String(pct));
    els.progressText.textContent = `${done} of ${required.length} required answers`;

    if (gaps.length === 0) {
      els.gaps.innerHTML = '<p class="gaps__done">Every required question is answered. Your document is ready to download.</p>';
    } else {
      els.gaps.innerHTML = `
        <p class="gaps__title">${gaps.length} ${gaps.length === 1 ? "question still needs" : "questions still need"} an answer</p>
        <ul>${gaps
          .slice(0, 6)
          .map((g) => `<li><button type="button" class="gap-link" data-goto="${g.stepId}" data-question="${g.questionId}">${escapeHtml(g.label)}</button></li>`)
          .join("")}</ul>
        ${gaps.length > 6 ? `<p class="field__help">and ${gaps.length - 6} more</p>` : ""}`;
    }

    const ready = gaps.length === 0;
    els.downloadDocx.disabled = !ready;
    els.downloadPdf.disabled = !ready;
  }

  function renderPreview() {
    const assembled = UK.assemble(template, answers);

    const clauses = assembled.clauses
      .map(
        (clause) => `
        <section class="doc__clause">
          <h3>${clause.number}. ${escapeHtml(clause.heading)}</h3>
          ${clause.paragraphs
            .map((p) => `<p><span class="doc__num">${p.number}</span>${escapeHtml(p.text)}</p>`)
            .join("")}
        </section>`
      )
      .join("");

    const execution = assembled.execution
      ? `<div class="doc__execution">
          <p>${escapeHtml(assembled.execution.intro)}</p>
          ${assembled.execution.blocks
            .map(
              (b) =>
                `<div class="doc__sign">${b.role ? `<p><strong>${escapeHtml(b.role)}</strong></p>` : ""}<pre>${escapeHtml(b.lines.join("\n"))}</pre></div>`
            )
            .join("")}
        </div>`
      : "";

    els.preview.innerHTML = `
      <h2 class="doc__title">${escapeHtml(assembled.title)}</h2>
      ${assembled.preamble.map((p) => `<p class="doc__preamble">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}
      ${clauses}
      ${execution}`;

    return assembled;
  }

  function render() {
    renderStep();
    renderPreview();
  }

  /* ---------------------------------------------------------------- events */

  els.form.addEventListener("input", onChange);
  els.form.addEventListener("change", onChange);

  function onChange(event) {
    const target = event.target;
    const id = target.dataset.question;
    if (!id) return;

    if (target.dataset.multi) {
      const current = Array.isArray(answers[id]) ? answers[id].slice() : [];
      const index = current.indexOf(target.value);
      if (target.checked && index === -1) current.push(target.value);
      if (!target.checked && index > -1) current.splice(index, 1);
      answers[id] = current;
    } else if (target.type === "checkbox") {
      answers[id] = target.checked;
    } else {
      answers[id] = target.value;
    }

    persist();

    // A text edit must not steal focus by re-rendering the whole step, so only
    // re-render the form when the change could alter which questions show.
    const structural = target.type !== "text" && target.tagName !== "TEXTAREA" && target.type !== "number" && target.type !== "date";
    if (structural) {
      const active = doc.activeElement && doc.activeElement.dataset ? doc.activeElement.dataset.question : null;
      renderStep();
      if (active) {
        const restored = els.form.querySelector(`[data-question="${active}"]`);
        if (restored) restored.focus();
      }
    } else {
      renderProgress(UK.visibleSteps(template, answers));
    }
    renderPreview();
  }

  els.steps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (!button) return;
    stepIndex = Number(button.dataset.step);
    render();
    els.form.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  els.gaps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-goto]");
    if (!button) return;
    const steps = UK.visibleSteps(template, answers);
    const index = steps.findIndex((s) => s.id === button.dataset.goto);
    if (index > -1) {
      stepIndex = index;
      render();
      const field = els.form.querySelector(`[data-question="${button.dataset.question}"]`);
      if (field) field.focus();
    }
  });

  els.prev.addEventListener("click", () => {
    stepIndex -= 1;
    render();
  });
  els.next.addEventListener("click", () => {
    stepIndex += 1;
    render();
  });

  els.reset.addEventListener("click", () => {
    if (!global.confirm("Clear every answer and start this document again?")) return;
    answers = UK.initialAnswers(template);
    stepIndex = 0;
    try {
      global.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear */
    }
    render();
  });

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = doc.createElement("a");
    link.href = url;
    link.download = filename;
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function filename(extension) {
    const who = (answers.employeeName || answers.consultantName || "document")
      .toString()
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    return `${slug}-${who || "document"}.${extension}`;
  }

  els.downloadDocx.addEventListener("click", () => {
    download(UK.toDocxBlob(UK.assemble(template, answers)), filename("docx"));
  });

  els.downloadPdf.addEventListener("click", () => {
    download(UK.toPdfBlob(UK.assemble(template, answers)), filename("pdf"));
  });

  els.copyText.addEventListener("click", async () => {
    const text = UK.toPlainText(UK.assemble(template, answers));
    try {
      await navigator.clipboard.writeText(text);
      els.copyText.textContent = "Copied";
      setTimeout(() => (els.copyText.textContent = "Copy as text"), 1800);
    } catch {
      // Clipboard access can be refused; fall back to a download of the text.
      download(new Blob([text], { type: "text/plain" }), filename("txt"));
    }
  });

  /* ---------------------------------------------------------------- helpers */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  els.title.textContent = meta.name;
  doc.title = `Create your ${meta.name} — Kestrel Contracts`;
  render();
})(window);

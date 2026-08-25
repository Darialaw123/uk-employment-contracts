/**
 * The questionnaire and document engine.
 *
 * One pass turns { template, answers } into a document AST. The same AST feeds
 * the on-screen preview, the DOCX emitter and the PDF emitter, so what someone
 * watches assemble is exactly what they download.
 *
 * Conditions are data, not code: a clause or a question declares `when`, and
 * `matches()` evaluates it against the current answers. That keeps the clause
 * library declarative and makes every branch inspectable.
 */
(function (global) {
  "use strict";

  const UK = (global.UK = global.UK || {});

  /* ---------------------------------------------------------------- format */

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  /** "2026-09-01" -> "1 September 2026". Falls back to a blank placeholder. */
  function fmtDate(value) {
    if (!value) return "[DATE]";
    const [y, m, d] = String(value).split("-").map(Number);
    if (!y || !m || !d) return String(value);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  /** Money always renders with thousands separators; decimals only when present. */
  function fmtMoney(value, symbol) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "[AMOUNT]";
    const hasPence = Math.round(n * 100) % 100 !== 0;
    return (
      (symbol || "£") +
      n.toLocaleString("en-GB", {
        minimumFractionDigits: hasPence ? 2 : 0,
        maximumFractionDigits: 2,
      })
    );
  }

  function fmtNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString("en-GB") : String(value ?? "");
  }

  /** ["a","b","c"] -> "a, b and c" */
  function list(items, conjunction) {
    const clean = (items || []).filter(Boolean);
    if (clean.length === 0) return "";
    if (clean.length === 1) return clean[0];
    return `${clean.slice(0, -1).join(", ")} ${conjunction || "and"} ${clean[clean.length - 1]}`;
  }

  function plural(n, singular, pluralForm) {
    return Number(n) === 1 ? singular : pluralForm || `${singular}s`;
  }

  /** A value the customer has not supplied yet shows as a bracketed placeholder. */
  function orBlank(value, placeholder) {
    const s = value == null ? "" : String(value).trim();
    return s === "" ? `[${placeholder || "TO BE COMPLETED"}]` : s;
  }

  /**
   * The statutory minimum notice an employer must give under s.86 Employment
   * Rights Act 1996: one week from one month's service, then a further week per
   * complete year, capped at twelve.
   */
  function statutoryEmployerNotice(completeYears) {
    const years = Math.max(0, Math.floor(Number(completeYears) || 0));
    return Math.min(12, Math.max(1, years));
  }

  /* ------------------------------------------------------------ conditions */

  const OPS = {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    in: (a, b) => Array.isArray(b) && b.includes(a),
    nin: (a, b) => Array.isArray(b) && !b.includes(a),
    truthy: (a) => a === true || (a != null && a !== "" && a !== false),
    falsy: (a) => !(a === true || (a != null && a !== "" && a !== false)),
    gt: (a, b) => Number(a) > Number(b),
    gte: (a, b) => Number(a) >= Number(b),
    lt: (a, b) => Number(a) < Number(b),
    lte: (a, b) => Number(a) <= Number(b),
    includes: (a, b) => Array.isArray(a) && a.includes(b),
  };

  /**
   * Evaluate a declarative condition against the answer set.
   *
   * Shapes: undefined (always true), a function, { all: [...] }, { any: [...] },
   * { not: cond }, or { field, op, value } with op defaulting to "truthy".
   */
  function matches(condition, answers) {
    if (condition == null) return true;
    if (typeof condition === "function") return Boolean(condition(answers));
    if (Array.isArray(condition)) return condition.every((c) => matches(c, answers));

    if (condition.all) return condition.all.every((c) => matches(c, answers));
    if (condition.any) return condition.any.some((c) => matches(c, answers));
    if (condition.not) return !matches(condition.not, answers);

    const op = OPS[condition.op || "truthy"];
    if (!op) throw new Error(`Unknown condition operator: ${condition.op}`);
    return Boolean(op(answers[condition.field], condition.value));
  }

  /* -------------------------------------------------------------- questions */

  /** Every question across every step, in order, regardless of visibility. */
  function allQuestions(template) {
    return template.steps.flatMap((step) => step.questions);
  }

  /** The questions currently visible in a step, given the answers so far. */
  function visibleQuestions(step, answers) {
    return step.questions.filter((q) => matches(q.when, answers));
  }

  /** The steps that still have at least one visible question. */
  function visibleSteps(template, answers) {
    return template.steps.filter((step) => {
      if (!matches(step.when, answers)) return false;
      return visibleQuestions(step, answers).length > 0;
    });
  }

  /** Seed the answer set from question defaults and the template's fixed values. */
  function initialAnswers(template) {
    const answers = Object.assign({}, template.fixed || {});
    for (const question of allQuestions(template)) {
      if (question.default !== undefined && answers[question.id] === undefined) {
        answers[question.id] =
          typeof question.default === "function" ? question.default(answers) : question.default;
      } else if (answers[question.id] === undefined) {
        answers[question.id] = question.type === "multi" ? [] : question.type === "toggle" ? false : "";
      }
    }
    return answers;
  }

  /**
   * Which visible, required questions are still unanswered.
   * Returned per-step so the UI can mark exactly where the gaps are.
   */
  function outstanding(template, answers) {
    const gaps = [];
    for (const step of visibleSteps(template, answers)) {
      for (const question of visibleQuestions(step, answers)) {
        if (!question.required) continue;
        const value = answers[question.id];
        const empty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);
        if (empty) gaps.push({ stepId: step.id, questionId: question.id, label: question.label });
      }
    }
    return gaps;
  }

  /* -------------------------------------------------------------- assembly */

  /**
   * Build the document AST.
   *
   * Clause numbering is assigned here rather than in the clause library, so
   * that a clause dropping out on a condition renumbers everything after it
   * without any clause needing to know its own position.
   */
  function assemble(template, answers) {
    const clauses = [];

    for (const clause of template.clauses) {
      if (!matches(clause.when, answers)) continue;

      const paragraphs = [];
      for (const para of clause.paras) {
        if (typeof para === "function") {
          const text = para(answers, { fmtDate, fmtMoney, fmtNumber, list, plural, orBlank });
          if (text) paragraphs.push(...(Array.isArray(text) ? text : [text]));
          continue;
        }
        if (!matches(para.when, answers)) continue;
        const text =
          typeof para.text === "function"
            ? para.text(answers, { fmtDate, fmtMoney, fmtNumber, list, plural, orBlank })
            : para.text;
        if (text) paragraphs.push(...(Array.isArray(text) ? text : [text]));
      }

      if (paragraphs.length === 0) continue;

      const number = clauses.length + 1;
      clauses.push({
        id: clause.id,
        number,
        heading: typeof clause.heading === "function" ? clause.heading(answers) : clause.heading,
        paragraphs: paragraphs.map((text, index) => ({
          number: `${number}.${index + 1}`,
          text: String(text).replace(/\s+/g, " ").trim(),
        })),
      });
    }

    const helpers = { fmtDate, fmtMoney, fmtNumber, list, plural, orBlank };

    return {
      templateSlug: template.slug,
      title: typeof template.docTitle === "function" ? template.docTitle(answers) : template.docTitle,
      preamble: (template.preamble || []).map((fn) => fn(answers, helpers)).filter(Boolean),
      clauses,
      execution: template.execution ? template.execution(answers, helpers) : null,
      generatedAt: new Date(),
    };
  }

  /** Flatten the AST to plain text — used by the clipboard and plain-text export. */
  function toPlainText(doc) {
    const lines = [doc.title.toUpperCase(), ""];
    for (const para of doc.preamble) lines.push(para, "");
    for (const clause of doc.clauses) {
      lines.push(`${clause.number}. ${clause.heading.toUpperCase()}`, "");
      for (const para of clause.paragraphs) lines.push(`${para.number}  ${para.text}`, "");
    }
    if (doc.execution) {
      lines.push(doc.execution.intro, "");
      for (const block of doc.execution.blocks) lines.push(block.role, block.lines.join("\n"), "");
    }
    return lines.join("\n");
  }

  Object.assign(UK, {
    fmtDate,
    fmtMoney,
    fmtNumber,
    list,
    plural,
    orBlank,
    statutoryEmployerNotice,
    matches,
    allQuestions,
    visibleQuestions,
    visibleSteps,
    initialAnswers,
    outstanding,
    assemble,
    toPlainText,
  });
})(window);

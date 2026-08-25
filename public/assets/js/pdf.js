/**
 * A PDF emitter with no dependencies.
 *
 * PDF's core-14 fonts are available in every reader without embedding, so the
 * only real work is line breaking — which needs the Adobe font metrics below.
 * Everything written to the file is escaped to 7-bit ASCII (non-ASCII becomes
 * an octal escape in WinAnsiEncoding), so string length equals byte length and
 * the cross-reference offsets can be counted straight off the string.
 */
(function (global) {
  "use strict";

  const UK = (global.UK = global.UK || {});

  /* Adobe core-14 widths, per 1000 units of em, for characters 32..126. */
  const ROMAN_WIDTHS = [
    250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278,
    500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444,
    921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722,
    556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469, 500,
    333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500,
    500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541,
  ];

  const BOLD_WIDTHS = [
    250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278,
    500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500,
    930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778,
    611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333, 278, 333, 581, 500,
    333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500,
    556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520,
  ];

  /* Characters the drafting actually produces that fall outside ASCII. */
  const WINANSI = {
    "£": 163, // £
    "‘": 145,
    "’": 146,
    "“": 147,
    "”": 148,
    "–": 150, // en dash
    "—": 151, // em dash
    "…": 133, // ellipsis
    "©": 169,
    "é": 233,
    " ": 32,
  };

  function charWidth(ch, bold) {
    const table = bold ? BOLD_WIDTHS : ROMAN_WIDTHS;
    const code = ch.charCodeAt(0);
    if (code >= 32 && code <= 126) return table[code - 32];
    // £ and the punctuation above all sit close to these defaults.
    if (ch === "£") return 500;
    if (ch === "–") return 500;
    if (ch === "—") return 1000;
    if (ch === "‘" || ch === "’") return bold ? 278 : 333;
    if (ch === "“" || ch === "”") return bold ? 500 : 444;
    return table[('n'.charCodeAt(0)) - 32];
  }

  function textWidth(text, size, bold) {
    let total = 0;
    for (const ch of String(text)) total += charWidth(ch, bold);
    return (total * size) / 1000;
  }

  /** Greedy word wrap against a measured width. */
  function wrap(text, size, bold, maxWidth) {
    const words = String(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (textWidth(candidate, size, bold) <= maxWidth || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  /** Escape to a PDF literal string, octal-encoding anything above ASCII. */
  function pdfString(text) {
    let out = "";
    for (const ch of String(text)) {
      if (ch === "(" || ch === ")" || ch === "\\") {
        out += `\\${ch}`;
      } else {
        const code = ch.charCodeAt(0);
        if (code >= 32 && code <= 126) {
          out += ch;
        } else {
          const mapped = WINANSI[ch];
          out += mapped ? `\\${mapped.toString(8).padStart(3, "0")}` : "?";
        }
      }
    }
    return out;
  }

  /* -------------------------------------------------------------- layout */

  const PAGE = { width: 595.28, height: 841.89, margin: 72 };
  const BODY_SIZE = 10.5;
  const LEADING = 14.5;
  const INDENT = 30;

  /**
   * Turn the document AST into positioned lines, breaking pages as it goes.
   * Each line is { text, x, y, size, bold }.
   */
  function layout(doc) {
    const maxWidth = PAGE.width - PAGE.margin * 2;
    const bottom = PAGE.margin + 40; // leave room for the page number
    const pages = [];
    let current = [];
    let y = PAGE.height - PAGE.margin;

    function newPage() {
      pages.push(current);
      current = [];
      y = PAGE.height - PAGE.margin;
    }

    function push(text, options) {
      const o = options || {};
      const size = o.size || BODY_SIZE;
      const indent = o.indent || 0;
      const lines = wrap(text, size, o.bold, maxWidth - indent);
      const leading = o.leading || LEADING;

      // Keep a heading with at least its first line of body text.
      if (o.keepNext && y - leading * 2 < bottom) newPage();

      lines.forEach((line, index) => {
        if (y - leading < bottom) newPage();
        y -= leading;
        const width = textWidth(line, size, o.bold);
        const x = o.align === "center" ? (PAGE.width - width) / 2 : PAGE.margin + indent + (index > 0 ? o.hanging || 0 : 0);
        current.push({ text: line, x, y, size, bold: Boolean(o.bold) });
      });
      y -= o.spaceAfter == null ? 8 : o.spaceAfter;
    }

    push(doc.title.toUpperCase(), { bold: true, size: 15, align: "center", spaceAfter: 22, leading: 19 });

    for (const block of doc.preamble) {
      for (const line of String(block).split("\n")) push(line, { spaceAfter: 4 });
      y -= 6;
    }

    for (const clause of doc.clauses) {
      push(`${clause.number}. ${clause.heading.toUpperCase()}`, { bold: true, spaceAfter: 6, keepNext: true });
      for (const p of clause.paragraphs) {
        push(`${p.number}  ${p.text}`, { indent: INDENT, hanging: 0, spaceAfter: 7 });
      }
      y -= 4;
    }

    if (doc.execution) {
      y -= 10;
      push(doc.execution.intro, { spaceAfter: 20 });
      for (const block of doc.execution.blocks) {
        if (block.role) push(block.role, { bold: true, spaceAfter: 8, keepNext: true });
        for (const line of block.lines) push(line, { spaceAfter: 4 });
        y -= 16;
      }
    }

    pages.push(current);
    return pages;
  }

  /* ---------------------------------------------------------------- write */

  function contentStream(lines, pageNumber, total) {
    const parts = ["BT"];
    let font = null;
    let size = null;

    for (const line of lines) {
      const wanted = line.bold ? "/F2" : "/F1";
      if (wanted !== font || line.size !== size) {
        parts.push(`${wanted} ${line.size} Tf`);
        font = wanted;
        size = line.size;
      }
      parts.push(`1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${pdfString(line.text)}) Tj`);
    }

    const label = `Page ${pageNumber} of ${total}`;
    const labelX = (PAGE.width - textWidth(label, 9, false)) / 2;
    parts.push(`/F1 9 Tf`, `1 0 0 1 ${labelX.toFixed(2)} ${(PAGE.margin - 24).toFixed(2)} Tm (${pdfString(label)}) Tj`);
    parts.push("ET");
    return parts.join("\n");
  }

  function toPdfBlob(doc) {
    const pages = layout(doc);
    const objects = [];

    /* Object numbering: 1 catalog, 2 pages, 3 & 4 fonts, then a page and a
       content stream for each rendered page. */
    const firstPageObj = 5;
    const pageIds = pages.map((_, i) => firstPageObj + i * 2);

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>";

    pages.forEach((lines, index) => {
      const pageId = pageIds[index];
      const contentId = pageId + 1;
      const stream = contentStream(lines, index + 1, pages.length);
      objects[pageId] =
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.width.toFixed(2)} ${PAGE.height.toFixed(2)}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
      objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    });

    let out = "%PDF-1.4\n";
    const offsets = [];
    for (let i = 1; i < objects.length; i++) {
      if (!objects[i]) continue;
      offsets[i] = out.length;
      out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefStart = out.length;
    const count = objects.length;
    out += `xref\n0 ${count}\n0000000000 65535 f \n`;
    for (let i = 1; i < count; i++) {
      out += objects[i]
        ? `${String(offsets[i]).padStart(10, "0")} 00000 n \n`
        : `0000000000 65535 f \n`;
    }
    out += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/pdf" });
  }

  Object.assign(UK, { toPdfBlob, _wrap: wrap, _textWidth: textWidth });
})(window);

/**
 * A DOCX emitter with no dependencies.
 *
 * A .docx is a ZIP of XML parts. Everything here is written with the STORE
 * method — no compression — because a contract is a few kilobytes of text and
 * a deflate implementation would be far more code than the saving is worth.
 *
 * The page geometry and the document font are kept in step with the on-screen
 * preview in site.css, so the file a customer opens matches what they watched
 * assemble.
 */
(function (global) {
  "use strict";

  const UK = (global.UK = global.UK || {});
  const encoder = new TextEncoder();

  /* ------------------------------------------------------------------ zip */

  const CRC_TABLE = (function () {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  /** A growable little-endian byte writer. */
  function Writer() {
    this.parts = [];
    this.length = 0;
  }
  Writer.prototype.bytes = function (b) {
    this.parts.push(b);
    this.length += b.length;
  };
  Writer.prototype.u16 = function (v) {
    this.bytes(new Uint8Array([v & 0xff, (v >>> 8) & 0xff]));
  };
  Writer.prototype.u32 = function (v) {
    this.bytes(new Uint8Array([v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]));
  };
  Writer.prototype.concat = function () {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const part of this.parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  };

  /** MS-DOS date/time, which is what the ZIP header format stores. */
  function dosStamp(date) {
    const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xffff;
    const day = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
    return { time, day };
  }

  function zip(files, date) {
    const stamp = dosStamp(date || new Date());
    const out = new Writer();
    const central = [];

    for (const file of files) {
      const name = encoder.encode(file.name);
      const data = encoder.encode(file.content);
      const sum = crc32(data);
      const offset = out.length;

      out.u32(0x04034b50);
      out.u16(20); // version needed
      out.u16(0x0800); // UTF-8 filenames
      out.u16(0); // stored
      out.u16(stamp.time);
      out.u16(stamp.day);
      out.u32(sum);
      out.u32(data.length);
      out.u32(data.length);
      out.u16(name.length);
      out.u16(0);
      out.bytes(name);
      out.bytes(data);

      central.push({ name, sum, size: data.length, offset });
    }

    const dirStart = out.length;
    for (const entry of central) {
      out.u32(0x02014b50);
      out.u16(20); // version made by
      out.u16(20); // version needed
      out.u16(0x0800);
      out.u16(0);
      out.u16(stamp.time);
      out.u16(stamp.day);
      out.u32(entry.sum);
      out.u32(entry.size);
      out.u32(entry.size);
      out.u16(entry.name.length);
      out.u16(0); // extra
      out.u16(0); // comment
      out.u16(0); // disk
      out.u16(0); // internal attrs
      out.u32(0); // external attrs
      out.u32(entry.offset);
      out.bytes(entry.name);
    }

    // Measure the directory before writing the end-of-central-directory
    // record, or its own bytes are counted in the size it reports.
    const dirSize = out.length - dirStart;

    out.u32(0x06054b50);
    out.u16(0);
    out.u16(0);
    out.u16(central.length);
    out.u16(central.length);
    out.u32(dirSize);
    out.u32(dirStart);
    out.u16(0);

    return out.concat();
  }

  /* ---------------------------------------------------------------- ooxml */

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * One paragraph. Options: bold, size (half-points), align, indent (twips),
   * spaceAfter (twips), caps.
   */
  function para(text, options) {
    const o = options || {};
    const pPr = [];
    if (o.align) pPr.push(`<w:jc w:val="${o.align}"/>`);
    if (o.indent) pPr.push(`<w:ind w:left="${o.indent}" w:hanging="${o.hanging || 0}"/>`);
    pPr.push(`<w:spacing w:after="${o.spaceAfter == null ? 160 : o.spaceAfter}" w:line="276" w:lineRule="auto"/>`);
    if (o.keepNext) pPr.push("<w:keepNext/>");

    const rPr = [];
    if (o.bold) rPr.push("<w:b/>");
    if (o.caps) rPr.push("<w:caps/>");
    if (o.size) rPr.push(`<w:sz w:val="${o.size}"/>`);

    // Preserve deliberate line breaks inside a single paragraph (addresses).
    const runs = String(text)
      .split("\n")
      .map((line, index) => (index ? `<w:br/><w:t xml:space="preserve">${esc(line)}</w:t>` : `<w:t xml:space="preserve">${esc(line)}</w:t>`))
      .join("");

    return `<w:p><w:pPr>${pPr.join("")}</w:pPr><w:r><w:rPr>${rPr.join("")}</w:rPr>${runs}</w:r></w:p>`;
  }

  const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  /* Georgia at 11pt matches the .document-surface rule in site.css. */
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Georgia" w:hAnsi="Georgia" w:cs="Georgia"/>
<w:sz w:val="22"/><w:szCs w:val="22"/>
</w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
</w:styles>`;

  function documentXml(doc) {
    const body = [];

    body.push(para(doc.title, { bold: true, caps: true, align: "center", size: 28, spaceAfter: 360 }));

    for (const text of doc.preamble) body.push(para(text, { spaceAfter: 200 }));

    for (const clause of doc.clauses) {
      body.push(
        para(`${clause.number}. ${clause.heading}`, {
          bold: true,
          caps: true,
          spaceAfter: 120,
          keepNext: true,
        })
      );
      for (const p of clause.paragraphs) {
        body.push(para(`${p.number}  ${p.text}`, { indent: 567, hanging: 567 }));
      }
    }

    if (doc.execution) {
      body.push(para(doc.execution.intro, { spaceAfter: 360 }));
      for (const block of doc.execution.blocks) {
        if (block.role) body.push(para(block.role, { bold: true, spaceAfter: 120 }));
        body.push(para(block.lines.join("\n"), { spaceAfter: 400 }));
      }
    }

    // A4 portrait with 1 inch margins: 11906 x 16838 twips.
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
${body.join("\n")}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>
</w:body></w:document>`;
  }

  /** Build the .docx and hand back a Blob ready to download. */
  function toDocxBlob(doc) {
    const bytes = zip(
      [
        { name: "[Content_Types].xml", content: CONTENT_TYPES },
        { name: "_rels/.rels", content: ROOT_RELS },
        { name: "word/_rels/document.xml.rels", content: DOC_RELS },
        { name: "word/styles.xml", content: STYLES },
        { name: "word/document.xml", content: documentXml(doc) },
      ],
      doc.generatedAt
    );
    return new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }

  Object.assign(UK, { toDocxBlob, _zip: zip, _crc32: crc32 });
})(window);

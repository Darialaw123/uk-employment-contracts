# UK Employment Contracts

A self-contained UK employment-document site: a template catalogue, a conditional
questionnaire, a live document preview, and Word/PDF generation.

No framework, no build step, no dependencies. Everything under `public/` is served
exactly as written, so it runs on any static host — or straight from disk.

```bash
npm run dev     # http://localhost:4321
# or simply:
node serve.mjs
```

`serve.mjs` exists only so clean URLs (`/templates`) resolve locally the way they do
behind a CDN. Nothing at runtime depends on it.

## What it does

Ten UK documents, all driven by one engine:

| | |
|---|---|
| Employment contracts | permanent, fixed-term, part-time, apprenticeship |
| Flexible and casual | zero hours, casual worker |
| Senior and consultancy | director's service agreement, consultancy agreement |
| Offer and onboarding | job offer letter, written statement of particulars |

Each contract covers the particulars required by s.1 Employment Rights Act 1996, which
has been a day-one right for employees *and* workers since April 2020.

## How it fits together

```
public/assets/js/
  engine.js      condition evaluation, question visibility, document assembly
  catalogue.js   template metadata for the listing pages
  templates.js   question sets and clause libraries — all the drafting
  docx.js        ZIP writer + OOXML emitter
  pdf.js         PDF writer with Adobe core-14 metrics for line breaking
  build.js       the builder UI
  site.js        nav and catalogue rendering
```

The engine takes `{ template, answers }` and returns a document AST. The preview, the
DOCX emitter and the PDF emitter all consume that same AST, so what someone watches
assemble is what they download.

Conditions are **data, not code**. A question or clause declares `when`, and the engine
evaluates it:

```js
{ all: [ { field: "engagement", op: "eq", value: "fixed-term" },
         { field: "probation",  op: "truthy" } ] }
```

That keeps every branch inspectable and lets a clause be reworded without touching a
question. Clause numbering is assigned at assembly time, so a clause dropping out on a
condition renumbers everything after it automatically.

Both exporters are written from scratch because the alternative was shipping a bundler
for a few kilobytes of text. The DOCX uses the ZIP *store* method — no deflate — and the
PDF relies on the core-14 fonts, so neither embeds anything.

## Pages

Static HTML is generated from one layout so the header and footer live in a single
place, and the output is committed:

```bash
npm run render        # python3 tools/render.py
```

Edit the `PAGES` list in `tools/render.py`, re-run it, and commit both the script and
the regenerated HTML. Nothing at serve time depends on Python.

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). Because the project
is at the repository root there is no Root Directory to set:

- **Framework Preset:** Other
- **Build Command:** leave empty — the HTML is committed
- Everything else comes from `vercel.json`

Or from the CLI:

```bash
npx vercel          # preview
npx vercel --prod   # production
```

`vercel.json` sets `cleanUrls` so `/templates` serves `templates.html`, matching
`serve.mjs`. Assets are cached for ten minutes with `stale-while-revalidate` rather
than `immutable`, because the filenames are not content-hashed and a long cache would
strand visitors on stale CSS and JS.

## Renaming the brand

The site ships as "Kestrel Contracts" with `.example` email addresses — a placeholder.
Change the `BRAND` constant and the footer in `tools/render.py`, re-run
`npm run render`, and commit the regenerated pages.

## Privacy

The questionnaire, the assembly and both exporters run entirely in the browser. Answers
persist to `localStorage` (guarded — a private window that throws on access still
works) and are never transmitted anywhere.

## Not legal advice

The drafting is original, written for the law of England and Wales with Scotland and
Northern Ireland selectable for governing law. It is a starting point for a competent
employer, not advice on anyone's situation, and every page that touches the documents
says so.

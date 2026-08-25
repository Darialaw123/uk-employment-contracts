#!/usr/bin/env python3
"""Render the static pages.

The site is served as plain files, so the generated HTML is committed. This
script exists only so the header, footer and page furniture live in one place
instead of being copy-pasted into every page. Run it after editing PAGES:

    python3 tools/render.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

BRAND = "Kestrel Contracts"

NAV = [
    ("/templates", "Templates"),
    ("/pricing", "Pricing"),
    ("/guides", "Guides"),
    ("/faq", "FAQ"),
    ("/about", "About"),
]

FOOTER_COLUMNS = [
    ("Documents", [
        ("/build?template=employment-contract", "Employment contract"),
        ("/build?template=fixed-term-contract", "Fixed-term contract"),
        ("/build?template=zero-hours-contract", "Zero hours contract"),
        ("/build?template=consultancy-agreement", "Consultancy agreement"),
        ("/templates", "All templates"),
    ]),
    ("Learn", [
        ("/guides", "Employment law guides"),
        ("/guides#particulars", "Written particulars"),
        ("/guides#notice", "Notice periods"),
        ("/guides#restrictions", "Restrictive covenants"),
        ("/faq", "Frequently asked questions"),
    ]),
    ("Company", [
        ("/about", "About us"),
        ("/pricing", "Pricing"),
        ("/contact", "Contact"),
        ("/legal#terms", "Terms of use"),
        ("/legal#privacy", "Privacy notice"),
    ]),
]

LAYOUT = """<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="https://kestrelcontracts.example{path}">
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>&#128196;</text></svg>">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead">
  <div class="shell masthead__inner">
    <a class="wordmark" href="/">Kestrel<span>Contracts</span></a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="nav" id="site-nav" aria-label="Primary">
      {nav}
      <a class="btn btn--primary btn--small" href="/templates">Build a document</a>
    </nav>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="footer">
  <div class="shell">
    <div class="footer__grid">
      <div>
        <a class="wordmark" href="/">Kestrel<span>Contracts</span></a>
        <p style="margin-top:0.75rem;color:var(--slate);max-width:34ch">
          UK employment documents you answer your way through, then download in Word and PDF.
        </p>
      </div>
      {footer_columns}
    </div>
    <div class="footer__legal">
      <span>&copy; {year} Kestrel Contracts. Templates for the law of England and Wales, Scotland and Northern Ireland.</span>
      <span>Kestrel Contracts is not a law firm and does not provide legal advice.</span>
    </div>
  </div>
</footer>
{scripts}
</body>
</html>
"""

DISCLAIMER = """
<div class="callout callout--warning">
  <strong>This is not legal advice.</strong> Kestrel Contracts supplies document templates, not advice on
  your situation. The generated document is a starting point drafted for common circumstances. If the
  role is senior, the money is significant, or anything about the arrangement is unusual, have a
  solicitor review it before anyone signs.
</div>
"""


def nav_html():
    return "\n      ".join(f'<a href="{href}">{label}</a>' for href, label in NAV)


def footer_columns_html():
    blocks = []
    for heading, links in FOOTER_COLUMNS:
        items = "\n          ".join(f'<li><a href="{href}">{label}</a></li>' for href, label in links)
        blocks.append(f"""<div>
        <h4>{heading}</h4>
        <ul>
          {items}
        </ul>
      </div>""")
    return "\n      ".join(blocks)


def render(page):
    scripts = "\n".join(
        f'<script src="/assets/js/{name}"></script>' for name in page.get("scripts", ["catalogue.js", "site.js"])
    )
    html = LAYOUT.format(
        title=page["title"],
        description=page["description"],
        path=page["path"],
        nav=nav_html(),
        body=page["body"],
        footer_columns=footer_columns_html(),
        year=2026,
        scripts=scripts,
    )
    out = PUBLIC / page["file"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    return out


HOME_BODY = """
<section class="hero">
  <div class="shell hero__grid">
    <div>
      <h1>The employment contract you keep meaning to sort out.</h1>
      <p class="hero__lede">
        Answer a series of plain-English questions and download a finished UK employment
        document in Word and PDF. Every contract covers the written particulars the law
        requires on day one.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="/templates">Find your document</a>
        <a class="btn btn--secondary" href="#how">See how it works</a>
      </div>
      <p class="hero__note">
        No subscription needed &middot; Word and PDF included &middot; Drafted for UK law
      </p>
    </div>
    <div class="card">
      <span class="badge badge--verified">Day-one right</span>
      <h3 style="margin-top:0.75rem">What the law actually requires</h3>
      <p>
        Since April 2020 every employee <em>and</em> worker must be given a written statement of
        particulars on or before their first day &mdash; not within two months, and not only if they
        ask. It has to be one document, and it has to cover a specific list.
      </p>
      <p style="margin-top:0.75rem">
        Missing it is worth up to four weeks' pay if the employee later brings a successful
        tribunal claim about something else.
      </p>
      <p style="margin-top:1rem">
        <a href="/guides#particulars">What has to be in it &rarr;</a>
      </p>
    </div>
  </div>
</section>

<section class="section">
  <div class="shell">
    <h2>Pick a document</h2>
    <p class="prose" style="color:var(--slate)">
      <span id="template-count">10</span> UK employment documents, each with its own set of questions.
    </p>
    <div class="grid" id="featured-templates" style="margin-top:1.75rem"></div>
    <p style="margin-top:1.5rem"><a class="btn btn--secondary" href="/templates">See all templates</a></p>
  </div>
</section>

<section class="section section--edge" id="how">
  <div class="shell">
    <h2>How it works</h2>
    <div class="grid grid--two" style="margin-top:2rem">
      <div class="steps">
        <div class="step">
          <div>
            <h3>Answer the questions</h3>
            <p>Plain English, with guidance on every question that needs it. Skip nothing important, because the questions adapt to what you have already said.</p>
          </div>
        </div>
        <div class="step">
          <div>
            <h3>Watch it assemble</h3>
            <p>The document builds beside you as you type. Change your mind about probation or restrictive covenants and the clauses appear and disappear, renumbering themselves.</p>
          </div>
        </div>
        <div class="step">
          <div>
            <h3>Download and sign</h3>
            <p>Word and PDF, both included, both yours. Edit the Word file however you like &mdash; there is no locked format and nothing expires.</p>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>Why the questions branch</h3>
        <p>
          A zero hours contract that mentions a fixed salary is worse than useless, and a
          part-time contract that quotes 28 days' holiday without pro-rating it is a claim
          waiting to happen.
        </p>
        <p style="margin-top:0.75rem">
          So the questionnaire is conditional throughout. Say the role is hybrid and you get asked
          how many days on site. Say there is a company sick pay scheme and you get asked how many
          weeks at full pay and how many at half. Say there are no restrictive covenants and the
          whole clause never appears.
        </p>
        <p style="margin-top:0.75rem">
          Holiday is calculated for you: enter the days per week and the generator works out the
          pro rata entitlement rather than leaving you to.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="section section--edge">
  <div class="shell">
    <h2>What you get</h2>
    <div class="grid" style="margin-top:1.75rem">
      <div class="card">
        <h3>Every required particular</h3>
        <p>Pay, hours, holiday, place of work, sick pay, pensions, notice, training, probation, benefits and paid leave &mdash; the full s.1 list, in one document.</p>
      </div>
      <div class="card">
        <h3>Word and PDF</h3>
        <p>Both formats, generated in your browser. The Word file is a real .docx you can edit, not a PDF with a different extension.</p>
      </div>
      <div class="card">
        <h3>Sensible defaults</h3>
        <p>28 days' holiday, statutory sick pay, a three-month probationary period. Change any of it, or accept it and move on.</p>
      </div>
      <div class="card">
        <h3>Guidance where it matters</h3>
        <p>The questions that catch people out &mdash; rolled-up holiday pay, the 48-hour opt-out, non-compete length &mdash; come with an explanation of what is at stake.</p>
      </div>
      <div class="card">
        <h3>Nothing leaves your browser</h3>
        <p>The questionnaire and both exporters run entirely client-side. Your answers are saved to your own browser and go nowhere else.</p>
      </div>
      <div class="card">
        <h3>Three jurisdictions</h3>
        <p>Choose England and Wales, Scotland or Northern Ireland, and the governing law and courts clauses follow.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--edge">
  <div class="shell prose">
    """ + DISCLAIMER + """
  </div>
</section>
"""

TEMPLATES_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>Templates</div>
</div>
<section class="section section--tight">
  <div class="shell">
    <h1>UK employment templates</h1>
    <p class="prose" style="color:var(--slate);font-size:1.1rem">
      Every document here is built from the same questionnaire engine, so the questions adapt to
      your answers and the clauses follow. Pick the one that matches the arrangement you actually
      have &mdash; not the one that sounds closest.
    </p>
  </div>
</section>
<div class="shell" id="all-templates"></div>
<section class="section section--edge">
  <div class="shell prose">
    <h2>Not sure which one?</h2>
    <p>Three questions usually settle it.</p>
    <div class="table-wrap" style="margin-top:1.25rem">
      <table class="data">
        <thead>
          <tr><th>If&hellip;</th><th>Then you want</th></tr>
        </thead>
        <tbody>
          <tr><td>You control when and how they work, and you must offer work</td><td>An employment contract &mdash; permanent, fixed-term or part-time</td></tr>
          <tr><td>You offer work as it comes up and they can turn it down</td><td>A zero hours contract or casual worker agreement</td></tr>
          <tr><td>They run their own business, can send someone else, and invoice you</td><td>A consultancy agreement</td></tr>
          <tr><td>They sit on your board</td><td>A director's service agreement</td></tr>
          <tr><td>You only need to satisfy the day-one statutory duty</td><td>A written statement of particulars</td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:1.5rem">
      Getting this wrong is expensive in one direction in particular: calling someone
      self-employed when a tribunal would call them a worker or an employee. Employment status
      depends on how the relationship works in practice, not on what the paperwork says.
      <a href="/guides#status">More on employment status &rarr;</a>
    </p>
  </div>
</section>
"""


PRICING_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>Pricing</div>
</div>
<section class="section section--tight">
  <div class="shell">
    <h1>Pricing</h1>
    <p class="prose" style="color:var(--slate);font-size:1.1rem">
      Pay once for a document, or once a year if you hire often. No trial that turns into a
      subscription, and no charge to find out what the document says &mdash; you can see it
      assembling before you pay for anything.
    </p>
  </div>
</section>

<section class="section section--tight">
  <div class="shell">
    <div class="grid grid--two">
      <div class="card">
        <span class="badge badge--neutral">Per document</span>
        <h3 style="margin-top:0.75rem">From &pound;9.95</h3>
        <p>One payment, one document, yours to keep and edit. Word and PDF both included.</p>
        <ul style="margin:1rem 0 0;padding-left:1.1rem;color:var(--slate);font-size:0.94rem">
          <li>Offer letter &mdash; &pound;9.95</li>
          <li>Statement of particulars &mdash; &pound;14.95</li>
          <li>Zero hours and casual &mdash; &pound;19.95</li>
          <li>Employment contracts &mdash; &pound;24.95</li>
          <li>Consultancy agreement &mdash; &pound;29.95</li>
          <li>Director's service agreement &mdash; &pound;39.95</li>
        </ul>
      </div>
      <div class="card" style="border-color:var(--clay-line)">
        <span class="badge">Unlimited</span>
        <h3 style="margin-top:0.75rem">&pound;99 a year</h3>
        <p>Every template, as many documents as you need, for twelve months. Worth it from the fourth contract.</p>
        <ul style="margin:1rem 0 0;padding-left:1.1rem;color:var(--slate);font-size:0.94rem">
          <li>All ten templates</li>
          <li>Unlimited documents and regenerations</li>
          <li>Come back and change a document later</li>
          <li>Cancels at the end of the term, not automatically renewed</li>
        </ul>
        <p style="margin-top:1.25rem"><a class="btn btn--primary btn--small" href="/templates">Start a document</a></p>
      </div>
    </div>
  </div>
</section>

<section class="section section--edge">
  <div class="shell prose">
    <h2>What is and is not included</h2>
    <div class="table-wrap">
      <table class="data">
        <tbody>
          <tr><th>Included</th><td>The finished document in Word (.docx) and PDF, and the right to use and adapt it for your own business as many times as you like.</td></tr>
          <tr><th>Included</th><td>Coming back to change your answers and regenerate, for as long as your browser holds the answers or your subscription runs.</td></tr>
          <tr><th>Not included</th><td>Legal advice on your situation. We are not a law firm and cannot tell you which document you need or whether a clause will hold up.</td></tr>
          <tr><th>Not included</th><td>A review of the finished document by a solicitor.</td></tr>
          <tr><th>Not included</th><td>The right to resell the template, or to supply it as a template to others.</td></tr>
        </tbody>
      </table>
    </div>
    <h2 style="margin-top:2.5rem">Refunds</h2>
    <p>
      If the document is not what was described, tell us within 14 days and we will refund you.
      Because the document is delivered digitally and immediately, you agree at checkout to
      immediate performance and give up the statutory 14-day cancellation right under the Consumer
      Contracts Regulations 2013 &mdash; but the refund promise above stands regardless.
    </p>
  </div>
</section>
"""

FAQ_ITEMS = [
    ("Is this a legally binding contract?",
     """The document is a contract in the ordinary sense: once both parties sign it, it binds them.
     What we cannot tell you is whether it is the <em>right</em> contract for your situation, or
     whether every clause in it would survive a challenge. Restrictive covenants in particular are
     enforced only so far as they protect a legitimate business interest and go no further than
     necessary, and that is a judgement about your business."""),
    ("When does an employee have to receive this?",
     """On or before their first day. Since 6 April 2020 the written statement of particulars is a
     day-one right, it extends to workers as well as employees, and the main particulars have to be
     in a single document. Before then employers had two months and it applied to employees only."""),
    ("What happens if I never issue one?",
     """There is no free-standing penalty, but if the employee later brings a successful tribunal
     claim about something else, the tribunal can award two to four weeks' pay on top for the
     failure to provide a statement. It also makes every other dispute harder to defend, because
     you have no agreed record of what was promised."""),
    ("Can I change the contract after it is signed?",
     """Only by agreement, unless the contract itself allows the change. That is why the generated
     documents keep policies and the staff handbook expressly non-contractual &mdash; so you can
     update a policy without needing everyone to re-sign. Imposing a change unilaterally risks a
     claim for breach of contract or constructive dismissal."""),
    ("Do these work in Scotland and Northern Ireland?",
     """The governing law and jurisdiction clauses let you pick England and Wales, Scotland or
     Northern Ireland, and employment law is largely the same across Great Britain. Northern Ireland
     is the one to watch: it has its own employment legislation, different unfair dismissal
     qualifying service, and its own tribunal system. Take advice on a Northern Ireland contract."""),
    ("Is a zero hours contract legal?",
     """Yes, but exclusivity clauses in them are not. Section 27A of the Employment Rights Act 1996
     makes a clause preventing a zero hours worker from working elsewhere void, and dismissing
     someone for ignoring one is automatically unfair. The generated zero hours contract says so
     expressly."""),
    ("Can I still use rolled-up holiday pay?",
     """For irregular-hours and part-year workers, yes &mdash; for holiday years beginning on or
     after 1 April 2024. It has to be calculated at 12.07% of pay for work done and itemised
     separately on the payslip. For everyone else, rolled-up holiday pay is still not permitted."""),
    ("What is the difference between an employee, a worker and a contractor?",
     """Employees have the full set of rights including unfair dismissal and redundancy pay. Workers
     get the core ones &mdash; minimum wage, holiday, working time protection, whistleblowing &mdash;
     but not unfair dismissal. Genuine contractors get almost none. Status is decided on how the
     relationship works in practice, and a tribunal will look past the label on the paperwork."""),
    ("Will my answers be sent anywhere?",
     """No. The questionnaire, the document assembly and both file exporters run entirely in your
     browser. Your answers are saved to your own browser's local storage so you can come back to a
     half-finished document, and they are never transmitted to us."""),
    ("Can I edit the document afterwards?",
     """Yes. The Word file is a real .docx with no protection on it. Edit it however you like. If you
     make substantive changes to the legal wording, though, it is worth having someone check the
     result &mdash; clauses interact, and deleting one can leave another hanging."""),
]

FAQ_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>FAQ</div>
</div>
<section class="section section--tight">
  <div class="shell">
    <h1>Frequently asked questions</h1>
    <p class="prose" style="color:var(--slate);font-size:1.1rem">
      The questions people ask before they start, and the ones they ask afterwards.
    </p>
  </div>
</section>
<section class="section section--tight">
  <div class="shell">
    <div class="faq prose" style="max-width:76ch">
""" + "\n".join(
    f"""      <details>
        <summary>{q}</summary>
        <div>{a}</div>
      </details>"""
    for q, a in FAQ_ITEMS
) + """
    </div>
  </div>
</section>
<section class="section section--edge">
  <div class="shell prose">
    <h2>Still stuck?</h2>
    <p><a href="/contact">Send us a question</a> and we will answer what we can &mdash; about the templates and how they work, rather than about your legal position.</p>
  </div>
</section>
"""


GUIDES_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>Guides</div>
</div>
<section class="section section--tight">
  <div class="shell">
    <h1>UK employment law guides</h1>
    <p class="prose" style="color:var(--slate);font-size:1.1rem">
      Background on the parts of the contract that people most often get wrong. General
      information about the law, not advice about your situation.
    </p>
  </div>
</section>

<section class="section section--tight" id="particulars">
  <div class="shell prose">
    <h2>The written statement of particulars</h2>
    <p>
      Section 1 of the Employment Rights Act 1996 requires an employer to give a written statement
      of employment particulars. Three things about it changed on 6 April 2020, and they are the
      three most people have missed:
    </p>
    <ul>
      <li>It is a <strong>day-one right</strong>. It must be given on or before the first day, not within two months.</li>
      <li>It extends to <strong>workers</strong>, not just employees.</li>
      <li>Most of it must be in a <strong>single document</strong>, rather than spread across several.</li>
    </ul>
    <p>The statement has to cover, at a minimum:</p>
    <div class="table-wrap">
      <table class="data">
        <tbody>
          <tr><th>Who and when</th><td>The names of both parties, the start date, and the date continuous employment began</td></tr>
          <tr><th>Pay</th><td>The amount, how it is calculated, the interval, and the pay day</td></tr>
          <tr><th>Hours</th><td>Normal working hours, the days of the week required, and if hours or days vary, how that is determined</td></tr>
          <tr><th>Holiday</th><td>Entitlement and holiday pay, in enough detail to calculate accrued entitlement on termination</td></tr>
          <tr><th>Place</th><td>Place of work, or a statement that the employee may work at various places, and the employer's address</td></tr>
          <tr><th>The job</th><td>Job title or a brief description of the work</td></tr>
          <tr><th>Duration</th><td>Whether the employment is permanent, and if not, how long it is expected to last or its end date</td></tr>
          <tr><th>Probation</th><td>Any probationary period, including its conditions and duration</td></tr>
          <tr><th>Sickness</th><td>Terms about incapacity for work and sick pay</td></tr>
          <tr><th>Other leave</th><td>Any other paid leave, beyond holiday and sick leave</td></tr>
          <tr><th>Benefits</th><td>Any benefits not already covered</td></tr>
          <tr><th>Training</th><td>Any training entitlement, whether it is mandatory, and whether the employee must pay for it</td></tr>
          <tr><th>Notice</th><td>The notice each party must give</td></tr>
          <tr><th>Pensions</th><td>Terms relating to pensions and pension schemes</td></tr>
          <tr><th>Collective agreements</th><td>Any that directly affect the terms, or a statement that there are none</td></tr>
          <tr><th>Working abroad</th><td>Required particulars if the employee will work outside the UK for more than a month</td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:1.25rem">
      Disciplinary and grievance procedures, and any pensions detail, may be given in a
      reasonably accessible separate document. Everything else belongs in the principal statement.
    </p>
  </div>
</section>

<section class="section section--edge" id="notice">
  <div class="shell prose">
    <h2>Notice periods</h2>
    <p>
      Two things run in parallel: the statutory minimum, and whatever the contract says. Whichever
      is longer applies.
    </p>
    <p>
      Under section 86 of the Employment Rights Act 1996, once an employee has been continuously
      employed for one month, the <strong>employer</strong> must give:
    </p>
    <ul>
      <li>One week, from one month's service up to two years</li>
      <li>One further week for each complete year after that</li>
      <li>Capped at twelve weeks, reached at twelve years' service</li>
    </ul>
    <p>
      The <strong>employee</strong> owes just one week once they have a month's service, however
      long they stay &mdash; unless the contract says otherwise, which is why most contracts do.
    </p>
    <p>
      A contract can require more than the statutory minimum but never less. A clause saying
      "one week either way" is simply overridden by statute once the employee passes two years.
    </p>
    <h3 style="margin-top:1.75rem">Pay in lieu of notice</h3>
    <p>
      Without an express clause, terminating immediately and paying instead of working the notice
      is a breach of contract. Usually the employer would rather pay than have the person around,
      so the breach seems harmless &mdash; but a repudiatory breach can release the employee from
      their post-termination restrictions entirely. That is the real reason to include the clause.
    </p>
    <h3 style="margin-top:1.75rem">Garden leave</h3>
    <p>
      Garden leave keeps the employee employed, and therefore bound by their duties of loyalty and
      confidence, while keeping them away from clients and colleagues. It is generally easier to
      enforce than a non-compete, because the employee is still being paid. A well-drafted contract
      sets off any garden leave against the length of the post-termination restrictions, so the two
      do not stack.
    </p>
  </div>
</section>

<section class="section section--edge" id="restrictions">
  <div class="shell prose">
    <h2>Restrictive covenants</h2>
    <p>
      A post-termination restriction is void as a restraint of trade unless the employer can show
      it protects a legitimate business interest and goes no further than necessary to do so. The
      legitimate interests the courts recognise are confidential information, client connections,
      and the stability of the workforce.
    </p>
    <p>Roughly in order of how readily they are enforced:</p>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>Restriction</th><th>What it stops</th><th>In practice</th></tr></thead>
        <tbody>
          <tr><td>Non-poaching</td><td>Recruiting former colleagues</td><td>Usually enforceable if limited to people they actually worked with</td></tr>
          <tr><td>Non-solicitation</td><td>Approaching clients</td><td>Usually enforceable with a look-back window and a materiality limit</td></tr>
          <tr><td>Non-dealing</td><td>Doing business with clients even if the client approaches first</td><td>Harder, but often justified where solicitation would be impossible to police</td></tr>
          <tr><td>Non-compete</td><td>Working for a competitor at all</td><td>The hardest. Needs real justification and a short period</td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:1.25rem">
      A court will not rewrite a covenant that is too wide. It may sever a discrete, removable
      piece of wording, but it will not narrow a twelve-month restriction to six because six would
      have been reasonable. Drafting too broadly loses the protection altogether &mdash; which is
      why the generator caps the options rather than letting you type any number you like.
    </p>
    <p>
      Restrictions on a junior employee with no client contact and no confidential information
      are unlikely to be worth the paper. Consider whether they are needed at all.
    </p>
  </div>
</section>

<section class="section section--edge" id="holiday">
  <div class="shell prose">
    <h2>Holiday entitlement</h2>
    <p>
      The Working Time Regulations 1998 give 5.6 weeks' paid holiday a year. For someone working
      five days a week that is 28 days. Bank holidays are not a separate entitlement: an employer
      may include them within the 5.6 weeks or give them on top, and the contract must say which.
    </p>
    <p>
      The 5.6 weeks is made up of four weeks of "Euro-derived" leave and 1.6 weeks of additional
      leave, and the two behave differently on carry-over and on how holiday pay is calculated.
      For most employers that distinction only surfaces when someone has been off sick for a long
      period or on family leave.
    </p>
    <h3 style="margin-top:1.75rem">Part-time staff</h3>
    <p>
      Entitlement is pro rata to the days worked. Someone on three days a week gets 16.8 days
      where a five-day colleague gets 28. Where bank holidays are included, part-timers who never
      work Mondays are the usual flashpoint &mdash; the fairest approach is to express entitlement
      in hours rather than days.
    </p>
    <h3 style="margin-top:1.75rem">Irregular hours and part-year workers</h3>
    <p>
      For holiday years starting on or after 1 April 2024, entitlement for irregular-hours and
      part-year workers accrues at 12.07% of the hours worked in each pay period, and rolled-up
      holiday pay is permitted for them provided it is itemised separately on the payslip. For
      everyone else, rolled-up holiday pay remains unlawful.
    </p>
  </div>
</section>

<section class="section section--edge" id="status">
  <div class="shell prose">
    <h2>Employment status</h2>
    <p>
      There are three categories in UK employment law, and the label on the contract does not
      decide which one applies. A tribunal looks at how the relationship actually works.
    </p>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th></th><th>Employee</th><th>Worker</th><th>Self-employed</th></tr></thead>
        <tbody>
          <tr><th>Minimum wage</th><td>Yes</td><td>Yes</td><td>No</td></tr>
          <tr><th>Paid holiday</th><td>Yes</td><td>Yes</td><td>No</td></tr>
          <tr><th>Sick pay</th><td>Yes</td><td>Yes, if earnings qualify</td><td>No</td></tr>
          <tr><th>Auto-enrolment</th><td>Yes</td><td>Yes</td><td>No</td></tr>
          <tr><th>Unfair dismissal</th><td>Yes, after two years</td><td>No</td><td>No</td></tr>
          <tr><th>Redundancy pay</th><td>Yes, after two years</td><td>No</td><td>No</td></tr>
          <tr><th>Family leave</th><td>Yes</td><td>Limited</td><td>No</td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:1.25rem">
      The features that push an arrangement towards employment are control over how the work is
      done, an obligation on both sides to offer and accept work, and personal service &mdash; no
      genuine right to send a substitute. A consultancy agreement that recites independence while
      the reality is a fixed rota, a company laptop and a line manager will not survive scrutiny.
    </p>
    <p>
      Getting it wrong is expensive: back-dated holiday pay, unpaid minimum wage, pension
      contributions, and potentially PAYE and National Insurance from HMRC.
    </p>
  </div>
</section>

<section class="section section--edge">
  <div class="shell prose">
""" + DISCLAIMER + """
  </div>
</section>
"""

ABOUT_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>About</div>
</div>
<section class="section section--tight">
  <div class="shell prose">
    <h1>About Kestrel Contracts</h1>
    <p style="font-size:1.1rem;color:var(--slate)">
      We build UK employment documents that you answer your way through, rather than download and
      fill in the blanks on.
    </p>
    <h2 style="margin-top:2.5rem">Why a questionnaire and not a blank template</h2>
    <p>
      A downloadable template puts the hard part on you. It arrives with square brackets everywhere
      and clauses you are meant to delete if they do not apply &mdash; which assumes you know which
      ones those are. The result is contracts that mention a probationary period that was deleted
      three clauses earlier, or quote a full-time holiday entitlement to a part-timer.
    </p>
    <p>
      A questionnaire moves the decisions to where you can actually make them. You are not asked to
      judge whether a clause is relevant; you are asked what the job is, and the clauses follow.
    </p>
    <h2 style="margin-top:2.5rem">What we are not</h2>
    <p>
      We are not a law firm, we are not regulated by the Solicitors Regulation Authority, and
      nothing here is advice about your situation. We supply documents. If your circumstances are
      unusual &mdash; a senior hire, an equity arrangement, a TUPE transfer, a role that touches
      several countries &mdash; a solicitor is the right answer and we would rather say so.
    </p>
    <h2 style="margin-top:2.5rem">How the documents are kept current</h2>
    <p>
      Employment law moves. The rolled-up holiday pay rules changed in April 2024; the written
      statement became a day-one right in April 2020; the rules on exclusivity clauses changed
      before that. Each template records the law it was drafted against, and we revise them when
      something material changes rather than on a schedule.
    </p>
    <h2 style="margin-top:2.5rem">Your data</h2>
    <p>
      The questionnaire, the document assembly and the Word and PDF exporters all run in your
      browser. Your answers are saved in your browser's local storage so that a refresh does not
      lose your work, and they are not transmitted to us. See the
      <a href="/legal#privacy">privacy notice</a> for the full picture.
    </p>
  </div>
</section>
"""

CONTACT_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>Contact</div>
</div>
<section class="section section--tight">
  <div class="shell prose">
    <h1>Contact</h1>
    <p style="font-size:1.1rem;color:var(--slate)">
      Questions about the templates, the site, or an order.
    </p>
    <div class="grid grid--two" style="margin-top:2rem">
      <div class="card">
        <h3>Support</h3>
        <p>For anything about a document you have built, a download that will not open, or a refund.</p>
        <p style="margin-top:0.75rem"><a href="mailto:support@kestrelcontracts.example">support@kestrelcontracts.example</a></p>
        <p style="margin-top:0.5rem;font-size:0.88rem;color:var(--muted)">We reply within one working day.</p>
      </div>
      <div class="card">
        <h3>Everything else</h3>
        <p>Partnerships, bulk licensing, or a template you wish we had.</p>
        <p style="margin-top:0.75rem"><a href="mailto:hello@kestrelcontracts.example">hello@kestrelcontracts.example</a></p>
      </div>
    </div>
    <div class="callout" style="margin-top:2rem">
      <strong>We cannot answer legal questions.</strong> We can explain what a template covers and
      how the questionnaire works. We cannot tell you which document you need, whether a clause will
      be enforced, or how to handle a dispute with someone who works for you. For that, speak to a
      solicitor, or to <a href="https://www.acas.org.uk">Acas</a>, whose helpline is free.
    </div>
  </div>
</section>
"""


LEGAL_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span>Legal</div>
</div>
<section class="section section--tight" id="terms">
  <div class="shell prose">
    <h1>Terms of use</h1>
    <p style="color:var(--muted);font-size:0.9rem">Last updated 25 August 2026</p>

    <h2 style="margin-top:2rem">1. Who we are</h2>
    <p>
      Kestrel Contracts supplies self-service legal document templates for use in the United
      Kingdom. We are not a law firm, we are not authorised or regulated by the Solicitors
      Regulation Authority, and we do not provide legal services within the meaning of the Legal
      Services Act 2007.
    </p>

    <h2 style="margin-top:2rem">2. What we provide</h2>
    <p>
      We provide document templates and a questionnaire that assembles them from your answers. The
      output is a starting point drafted for common circumstances. It is not advice, it is not
      tailored to your situation, and no solicitor-client relationship arises between us.
    </p>

    <h2 style="margin-top:2rem">3. Your responsibility</h2>
    <p>
      You are responsible for deciding which document you need, for the accuracy of the answers you
      give, and for satisfying yourself that the result is suitable before anyone signs it. Where
      the arrangement is significant, unusual, or you are unsure, you should take advice from a
      solicitor.
    </p>

    <h2 style="margin-top:2rem">4. Licence</h2>
    <p>
      On payment we grant you a non-exclusive, perpetual licence to use and adapt the generated
      document for the business purposes of you or your organisation. You may not resell,
      redistribute or supply the templates as templates to any other person, or use them to operate
      a competing service.
    </p>

    <h2 style="margin-top:2rem">5. Liability</h2>
    <p>
      We do not exclude liability for death or personal injury caused by our negligence, for fraud,
      or for anything else that cannot lawfully be excluded. Subject to that, our total liability
      in connection with these terms is limited to the amount you paid us for the document
      concerned, and we are not liable for loss of profit, loss of business, or any indirect or
      consequential loss.
    </p>
    <p>
      Nothing in these terms affects the rights you have as a consumer under the Consumer Rights
      Act 2015.
    </p>

    <h2 style="margin-top:2rem">6. Cancellation and refunds</h2>
    <p>
      Because documents are delivered digitally and immediately, you consent at checkout to
      immediate performance and acknowledge that you lose the 14-day cancellation right under the
      Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.
      Separately, if a document is not as described, tell us within 14 days and we will refund you.
    </p>

    <h2 style="margin-top:2rem">7. Governing law</h2>
    <p>
      These terms are governed by the law of England and Wales, and the courts of England and Wales
      have exclusive jurisdiction, except that if you are a consumer resident in Scotland or
      Northern Ireland you may also bring proceedings in your own courts.
    </p>
  </div>
</section>

<section class="section section--edge" id="privacy">
  <div class="shell prose">
    <h1>Privacy notice</h1>
    <p style="color:var(--muted);font-size:0.9rem">Last updated 25 August 2026</p>

    <h2 style="margin-top:2rem">The short version</h2>
    <p>
      The answers you type into the questionnaire stay in your browser. They are saved to your
      browser's local storage so that a refresh does not lose your work, and they are never sent to
      us. The document is assembled, and the Word and PDF files are generated, on your own device.
    </p>

    <h2 style="margin-top:2rem">What we do collect</h2>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>Data</th><th>Why</th><th>Lawful basis</th></tr></thead>
        <tbody>
          <tr><td>Your email address and payment reference, if you buy something</td><td>To take payment, provide the document and handle refunds</td><td>Performance of a contract</td></tr>
          <tr><td>Correspondence you send us</td><td>To answer you</td><td>Legitimate interests</td></tr>
          <tr><td>Aggregate, non-identifying usage counts</td><td>To see which templates are used and where people get stuck</td><td>Legitimate interests</td></tr>
        </tbody>
      </table>
    </div>

    <h2 style="margin-top:2rem">What we do not collect</h2>
    <p>
      The contents of your document, the names and addresses of the people in it, salary figures,
      or anything else you type into the questionnaire.
    </p>

    <h2 style="margin-top:2rem">Retention</h2>
    <p>
      Order records are kept for seven years because tax law requires it. Correspondence is kept for
      two years. Local storage in your browser stays until you clear it or use the
      &ldquo;start again&rdquo; button in the builder.
    </p>

    <h2 style="margin-top:2rem">Your rights</h2>
    <p>
      Under the UK GDPR you can ask for a copy of the personal data we hold about you, ask us to
      correct or delete it, object to processing, or ask us to restrict it. Email
      <a href="mailto:privacy@kestrelcontracts.example">privacy@kestrelcontracts.example</a>. If you
      are unhappy with our response you can complain to the Information Commissioner's Office at
      <a href="https://ico.org.uk">ico.org.uk</a>.
    </p>

    <h2 style="margin-top:2rem">Cookies</h2>
    <p>
      We do not set advertising or analytics cookies. The site uses local storage for your
      questionnaire answers, which is a technical necessity for the builder to work and is not used
      to track you.
    </p>
  </div>
</section>
"""

NOT_FOUND_BODY = """
<section class="section">
  <div class="shell prose">
    <h1>Page not found</h1>
    <p style="font-size:1.1rem;color:var(--slate)">
      That page does not exist &mdash; or it moved and we did not leave a forwarding address.
    </p>
    <p style="margin-top:1.5rem">
      <a class="btn btn--primary" href="/templates">Browse the templates</a>
      <a class="btn btn--ghost" href="/">Go home</a>
    </p>
  </div>
</section>
"""

BUILD_BODY = """
<div class="shell">
  <div class="crumbs"><a href="/">Home</a><span>/</span><a href="/templates">Templates</a><span>/</span><span id="builder-title">Build</span></div>
</div>

<div class="shell builder">
  <nav class="builder__nav" aria-label="Questionnaire steps">
    <ol id="step-nav"></ol>
    <div style="margin-top:1.5rem">
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Completion">
        <div class="progress__bar" id="progress-bar" style="width:0%"></div>
      </div>
      <p class="progress__text" id="progress-text">Loading</p>
      <div class="gaps" id="gaps"></div>
    </div>
    <button type="button" class="btn btn--ghost btn--small" id="reset-answers" style="margin-top:1rem;padding-left:0">Start again</button>
  </nav>

  <section class="builder__panel" aria-labelledby="step-title">
    <h2 id="step-title">Loading</h2>
    <p class="builder__blurb" id="step-blurb"></p>
    <form id="step-form" novalidate></form>
    <div class="builder__actions">
      <button type="button" class="btn btn--secondary" id="prev-step">Back</button>
      <button type="button" class="btn btn--primary" id="next-step">Next</button>
    </div>
  </section>

  <section class="builder__preview" aria-label="Document preview">
    <div class="preview__bar">
      <h2>Live preview</h2>
      <div class="preview__tools">
        <button type="button" class="btn btn--secondary btn--small" id="copy-text">Copy as text</button>
        <button type="button" class="btn btn--secondary btn--small" id="download-pdf" disabled>PDF</button>
        <button type="button" class="btn btn--primary btn--small" id="download-docx" disabled>Word</button>
      </div>
    </div>
    <article class="doc" id="preview"></article>
  </section>
</div>

<div class="shell" style="padding-bottom:3rem">
""" + DISCLAIMER + """
</div>
"""

PAGES = [
    dict(file="index.html", path="/", title=f"{BRAND} — UK employment contracts you answer your way through",
         description="Build a UK employment contract, zero hours agreement or consultancy agreement by answering plain-English questions. Download in Word and PDF.",
         body=HOME_BODY),
    dict(file="templates.html", path="/templates", title=f"UK employment templates — {BRAND}",
         description="Ten UK employment documents: employment contracts, fixed-term, part-time, zero hours, casual, director service agreements, consultancy agreements and offer letters.",
         body=TEMPLATES_BODY),
    dict(file="pricing.html", path="/pricing", title=f"Pricing — {BRAND}",
         description="Pay once per document from £9.95, or £99 a year for unlimited documents. No subscription required.",
         body=PRICING_BODY),
    dict(file="guides.html", path="/guides", title=f"UK employment law guides — {BRAND}",
         description="Guides to written particulars, notice periods, restrictive covenants, holiday entitlement and employment status under UK law.",
         body=GUIDES_BODY),
    dict(file="faq.html", path="/faq", title=f"Frequently asked questions — {BRAND}",
         description="Answers about UK employment contracts, the day-one statement of particulars, zero hours contracts, holiday pay and employment status.",
         body=FAQ_BODY),
    dict(file="about.html", path="/about", title=f"About — {BRAND}",
         description="Why we build UK employment documents as a questionnaire rather than a blank template, and what we are not.",
         body=ABOUT_BODY),
    dict(file="contact.html", path="/contact", title=f"Contact — {BRAND}",
         description="Get in touch about the templates, the site or an order.",
         body=CONTACT_BODY),
    dict(file="legal.html", path="/legal", title=f"Terms of use and privacy notice — {BRAND}",
         description="Terms of use and privacy notice for Kestrel Contracts.",
         body=LEGAL_BODY),
    dict(file="404.html", path="/404", title=f"Page not found — {BRAND}",
         description="That page does not exist.",
         body=NOT_FOUND_BODY),
    dict(file="build.html", path="/build", title=f"Build your document — {BRAND}",
         description="Answer the questions and watch your UK employment document assemble, then download it in Word and PDF.",
         body=BUILD_BODY,
         scripts=["catalogue.js", "engine.js", "templates.js", "docx.js", "pdf.js", "site.js", "build.js"]),
]


def main():
    for page in PAGES:
        out = render(page)
        print(f"  {out.relative_to(ROOT)}")


if __name__ == "__main__":
    print("Rendering pages:")
    main()

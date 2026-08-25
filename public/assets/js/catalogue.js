/**
 * The template catalogue.
 *
 * Metadata only — enough to render the listing pages and the product pages
 * without loading the question sets and clause libraries, which are much
 * larger and only needed once someone starts building.
 */
(function (global) {
  "use strict";

  const UK = (global.UK = global.UK || {});

  const CATEGORIES = [
    {
      slug: "employment-contracts",
      name: "Employment contracts",
      blurb:
        "For people on your payroll. Each one satisfies the written statement of particulars every employee must receive on or before their first day.",
    },
    {
      slug: "flexible-and-casual",
      name: "Flexible and casual",
      blurb:
        "Irregular hours, bank staff and seasonal work — drafted so the engagement stays what you intend it to be.",
    },
    {
      slug: "senior-and-consultancy",
      name: "Senior and consultancy",
      blurb:
        "Board-level appointments and genuinely self-employed contractors, where the protections and the risks both run deeper.",
    },
    {
      slug: "offer-and-onboarding",
      name: "Offer and onboarding",
      blurb: "The paperwork that comes before the contract, and the short-form statement that can stand in for one.",
    },
  ];

  const TEMPLATES = [
    {
      slug: "employment-contract",
      name: "Employment Contract",
      category: "employment-contracts",
      price: 2495,
      badge: "Most used",
      time: "10–15 minutes",
      summary:
        "A full contract of employment for a permanent employee, full or part time. Covers pay, hours, holiday, sickness, confidentiality, notice and optional post-termination restrictions.",
      includes: [
        "All particulars required by s.1 Employment Rights Act 1996",
        "Probationary period with its own notice provision",
        "Working Time Regulations 48-hour opt-out (optional)",
        "Confidentiality and intellectual property assignment",
        "Post-termination restrictive covenants (optional)",
        "Pay in lieu of notice and garden leave",
      ],
    },
    {
      slug: "fixed-term-contract",
      name: "Fixed-Term Employment Contract",
      category: "employment-contracts",
      price: 2495,
      time: "10–15 minutes",
      summary:
        "For an employee engaged until a set date, the end of a project, or the return of an absent colleague. Includes the less-favourable-treatment protections fixed-term employees are entitled to.",
      includes: [
        "End by date, task or event",
        "Early termination on notice",
        "Fixed-Term Employees Regulations 2002 wording",
        "Four-year continuous service acknowledgement",
        "Everything in the standard employment contract",
      ],
    },
    {
      slug: "part-time-contract",
      name: "Part-Time Employment Contract",
      category: "employment-contracts",
      price: 2495,
      time: "10–15 minutes",
      summary:
        "A permanent contract for someone working reduced hours, with holiday, pay and benefits calculated pro rata and stated explicitly rather than left to be worked out later.",
      includes: [
        "Pro rata holiday calculated from your inputs",
        "Defined working pattern and days",
        "Part-time Workers Regulations 2000 wording",
        "Overtime treatment for part-time staff",
        "Everything in the standard employment contract",
      ],
    },
    {
      slug: "zero-hours-contract",
      name: "Zero Hours Contract",
      category: "flexible-and-casual",
      price: 1995,
      time: "8–12 minutes",
      summary:
        "For staff you offer work to as it arises, with no obligation on either side to offer or accept it. Includes the statutory ban on exclusivity clauses.",
      includes: [
        "No mutuality of obligation, stated plainly",
        "Exclusivity clauses void — s.27A ERA 1996",
        "Rolled-up or accrued holiday pay",
        "Assignment-by-assignment terms",
        "Worker status acknowledgement",
      ],
    },
    {
      slug: "casual-worker-agreement",
      name: "Casual Worker Agreement",
      category: "flexible-and-casual",
      price: 1995,
      time: "8–12 minutes",
      summary:
        "For bank, seasonal and event staff taken on for discrete assignments. Drafted to keep each engagement separate rather than accumulating into continuous employment by accident.",
      includes: [
        "Separate-assignment framing",
        "Worker rather than employee status",
        "Holiday accrual on hours actually worked",
        "National Minimum Wage confirmation",
        "Termination of an assignment mid-way",
      ],
    },
    {
      slug: "director-service-agreement",
      name: "Director's Service Agreement",
      category: "senior-and-consultancy",
      price: 3995,
      badge: "Most protective",
      time: "15–20 minutes",
      summary:
        "For an executive director on the board. Longer notice, wider restrictions, fiduciary and Companies Act duties, and the resignation-on-termination provisions a company needs.",
      includes: [
        "Companies Act 2006 general duties",
        "Automatic resignation from office on termination",
        "Extended garden leave and notice",
        "Wider post-termination restrictions",
        "Bonus, LTIP and benefits framework",
        "Power of attorney for resignation",
      ],
    },
    {
      slug: "consultancy-agreement",
      name: "Consultancy Agreement",
      category: "senior-and-consultancy",
      price: 2995,
      time: "10–15 minutes",
      summary:
        "For a genuinely self-employed contractor or their personal service company. Written to reflect an arm's-length supply of services, with substitution, control and IR35 addressed head on.",
      includes: [
        "Right of substitution",
        "No mutuality of obligation",
        "IR35 / off-payroll status warranty and indemnity",
        "IP assignment on payment",
        "Fees, expenses and VAT",
        "Insurance obligations",
      ],
    },
    {
      slug: "apprenticeship-agreement",
      name: "Apprenticeship Agreement",
      category: "employment-contracts",
      price: 2495,
      time: "10–15 minutes",
      summary:
        "An approved English apprenticeship agreement, naming the standard, the training provider and the off-the-job training commitment alongside ordinary employment terms.",
      includes: [
        "Apprenticeships, Skills, Children and Learning Act 2009 form",
        "Named standard, level and training provider",
        "Off-the-job training hours",
        "Apprentice National Minimum Wage",
        "End-point assessment",
      ],
    },
    {
      slug: "offer-letter",
      name: "Job Offer Letter",
      category: "offer-and-onboarding",
      price: 995,
      time: "4–6 minutes",
      summary:
        "A conditional offer that sets out the headline terms and the conditions the offer depends on — right to work, references, DBS — without accidentally forming the contract itself.",
      includes: [
        "Conditional on right to work and references",
        "Headline terms without contractual effect",
        "Acceptance and start-date confirmation",
        "Withdrawal of offer",
      ],
    },
    {
      slug: "statement-of-particulars",
      name: "Written Statement of Employment Particulars",
      category: "offer-and-onboarding",
      price: 1495,
      time: "6–10 minutes",
      summary:
        "The statutory minimum every employee and worker must receive on or before day one. Shorter than a full contract, and the right document when you only need to satisfy s.1.",
      includes: [
        "Every particular required by s.1 ERA 1996",
        "Day-one right, in the required single document",
        "Covers workers as well as employees",
        "Training entitlement and paid leave particulars",
      ],
    },
  ];

  const PRICING = {
    single: 2495,
    unlimited: 9900,
    unlimitedPeriod: "year",
  };

  /** Pence to a display string. Prices are stored in pence to avoid float drift. */
  function price(pence) {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function byCategory(slug) {
    return TEMPLATES.filter((t) => t.category === slug);
  }

  function getTemplate(slug) {
    return TEMPLATES.find((t) => t.slug === slug) || null;
  }

  function getCategory(slug) {
    return CATEGORIES.find((c) => c.slug === slug) || null;
  }

  function categoriesWithCounts() {
    return CATEGORIES.map((c) => Object.assign({}, c, { count: byCategory(c.slug).length }));
  }

  Object.assign(UK, {
    CATEGORIES,
    TEMPLATES,
    PRICING,
    price,
    byCategory,
    getTemplate,
    getCategory,
    categoriesWithCounts,
  });
})(window);

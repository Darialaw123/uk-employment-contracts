/**
 * Question sets and clause libraries.
 *
 * All drafting here is original and written for the law of England and Wales
 * (with Scotland and Northern Ireland selectable for governing law). It is a
 * starting point for a competent employer to adapt — not legal advice, and the
 * site says so on every page that touches it.
 *
 * Structure: `steps` drives the questionnaire, `clauses` drives the document.
 * The two are joined only by answer ids, so a clause can be reworded without
 * touching a question and vice versa.
 */
(function (global) {
  "use strict";

  const UK = (global.UK = global.UK || {});

  /* Engagement types the employment family shares. Each template pins one via
     `fixed`, which means the same question set and clause library serve all of
     them and the differences stay visible as conditions. */
  const EMPLOYEE = { field: "engagement", op: "in", value: ["permanent", "fixed-term", "part-time", "apprenticeship"] };
  const CASUAL = { field: "engagement", op: "in", value: ["zero-hours", "casual"] };

  /* ------------------------------------------------------- shared questions */

  const partiesStep = {
    id: "parties",
    title: "The parties",
    blurb: "Exact legal names matter — this is who the agreement binds.",
    questions: [
      {
        id: "employerName",
        label: "Employer's full legal name",
        type: "text",
        required: true,
        placeholder: "Northgate Joinery Limited",
        help: "For a company, use the registered name exactly as it appears at Companies House, including 'Limited' or 'Ltd'.",
      },
      {
        id: "employerCompanyNumber",
        label: "Company registration number",
        type: "text",
        placeholder: "09876543",
        help: "Leave blank if the employer is a sole trader, partnership or unincorporated body.",
      },
      {
        id: "employerAddress",
        label: "Employer's registered or principal address",
        type: "textarea",
        required: true,
        placeholder: "Unit 4, Bell Lane Works\nLeeds\nLS9 8QT",
      },
      {
        id: "employeeName",
        label: "Employee's full name",
        type: "text",
        required: true,
        placeholder: "Priya Raman",
      },
      {
        id: "employeeAddress",
        label: "Employee's home address",
        type: "textarea",
        required: true,
        placeholder: "12 Ashfield Road\nLeeds\nLS8 1PP",
      },
    ],
  };

  const roleStep = {
    id: "role",
    title: "The role",
    blurb: "What the job is, when it starts, and whether there is a probationary period.",
    questions: [
      { id: "jobTitle", label: "Job title", type: "text", required: true, placeholder: "Workshop Supervisor" },
      {
        id: "reportsTo",
        label: "Reports to",
        type: "text",
        placeholder: "the Operations Director",
        help: "A job title rather than a person's name, so the contract survives a reorganisation.",
      },
      {
        id: "duties",
        label: "Main duties",
        type: "textarea",
        placeholder: "Supervising the workshop team, scheduling production, maintaining quality and safety standards.",
        help: "A short summary is enough. The contract also includes a general duty to carry out other reasonable work.",
      },
      { id: "startDate", label: "Start date", type: "date", required: true },
      {
        id: "continuityDiffers",
        label: "Continuous employment started earlier than the start date",
        type: "toggle",
        help: "Tick if the employee transferred under TUPE, or is moving from another group company or an earlier engagement that counts towards continuous service.",
      },
      {
        id: "continuityDate",
        label: "Continuous employment start date",
        type: "date",
        required: true,
        when: { field: "continuityDiffers", op: "truthy" },
      },
      {
        id: "fixedTermBasis",
        label: "The fixed term ends on",
        type: "radio",
        required: true,
        when: { field: "engagement", op: "eq", value: "fixed-term" },
        options: [
          { value: "date", label: "A specific date" },
          { value: "task", label: "Completion of a task or project" },
          { value: "event", label: "A specific event, such as a colleague's return" },
        ],
        default: "date",
      },
      {
        id: "fixedTermEndDate",
        label: "End date",
        type: "date",
        required: true,
        when: { all: [{ field: "engagement", op: "eq", value: "fixed-term" }, { field: "fixedTermBasis", op: "eq", value: "date" }] },
      },
      {
        id: "fixedTermEvent",
        label: "Describe the task or event",
        type: "textarea",
        required: true,
        when: {
          all: [
            { field: "engagement", op: "eq", value: "fixed-term" },
            { field: "fixedTermBasis", op: "in", value: ["task", "event"] },
          ],
        },
        placeholder: "The return to work of Jordan Hale from a period of maternity leave.",
      },
      {
        id: "apprenticeshipStandard",
        label: "Apprenticeship standard and level",
        type: "text",
        required: true,
        when: { field: "engagement", op: "eq", value: "apprenticeship" },
        placeholder: "Furniture Manufacturer, Level 3",
      },
      {
        id: "trainingProvider",
        label: "Training provider",
        type: "text",
        required: true,
        when: { field: "engagement", op: "eq", value: "apprenticeship" },
        placeholder: "Leeds College of Building",
      },
      {
        id: "apprenticeshipEnd",
        label: "Planned end date of the apprenticeship",
        type: "date",
        required: true,
        when: { field: "engagement", op: "eq", value: "apprenticeship" },
      },
      {
        id: "probation",
        label: "There is a probationary period",
        type: "toggle",
        default: true,
        when: EMPLOYEE,
      },
      {
        id: "probationMonths",
        label: "Length of probationary period",
        type: "select",
        when: { all: [EMPLOYEE, { field: "probation", op: "truthy" }] },
        options: [
          { value: "1", label: "1 month" },
          { value: "3", label: "3 months" },
          { value: "6", label: "6 months" },
          { value: "9", label: "9 months" },
          { value: "12", label: "12 months" },
        ],
        default: "3",
      },
      {
        id: "probationNoticeWeeks",
        label: "Notice during probation (either side)",
        type: "select",
        when: { all: [EMPLOYEE, { field: "probation", op: "truthy" }] },
        options: [
          { value: "1", label: "1 week" },
          { value: "2", label: "2 weeks" },
          { value: "4", label: "4 weeks" },
        ],
        default: "1",
        help: "Statutory minimum notice still applies once the employee has one month's service, whatever the contract says.",
      },
      {
        id: "probationExtend",
        label: "The employer may extend probation",
        type: "toggle",
        default: true,
        when: { all: [EMPLOYEE, { field: "probation", op: "truthy" }] },
      },
    ],
  };

  const placeStep = {
    id: "place",
    title: "Place of work",
    blurb: "Where the work is done, and whether that can change.",
    questions: [
      {
        id: "workPattern",
        label: "Working arrangement",
        type: "radio",
        required: true,
        options: [
          { value: "onsite", label: "On site at a fixed location" },
          { value: "hybrid", label: "Hybrid — split between site and home" },
          { value: "remote", label: "Fully remote" },
          { value: "mobile", label: "Mobile — no fixed location" },
        ],
        default: "onsite",
      },
      {
        id: "workplaceAddress",
        label: "Normal place of work",
        type: "textarea",
        required: true,
        when: { field: "workPattern", op: "in", value: ["onsite", "hybrid"] },
        placeholder: "Unit 4, Bell Lane Works, Leeds LS9 8QT",
      },
      {
        id: "homeAddressIsWorkplace",
        label: "The employee's home address is their place of work",
        type: "toggle",
        default: true,
        when: { field: "workPattern", op: "eq", value: "remote" },
      },
      {
        id: "mobileArea",
        label: "Area covered",
        type: "text",
        required: true,
        when: { field: "workPattern", op: "eq", value: "mobile" },
        placeholder: "Yorkshire and the North East",
      },
      {
        id: "hybridSiteDays",
        label: "Days per week on site",
        type: "number",
        when: { field: "workPattern", op: "eq", value: "hybrid" },
        default: "3",
        min: 1,
        max: 6,
      },
      {
        id: "mobilityClause",
        label: "Include a mobility clause",
        type: "toggle",
        default: true,
        help: "Lets the employer require a move to another site within reasonable daily travelling distance. Useful, but a wide clause can be hard to rely on in practice.",
      },
      {
        id: "workOutsideUK",
        label: "The employee will work outside the UK for more than one month",
        type: "toggle",
        help: "If so, s.1 ERA 1996 requires extra particulars — the period abroad, the currency of pay, any additional benefits and the terms of return.",
      },
      {
        id: "outsideUKDetails",
        label: "Details of the overseas work",
        type: "textarea",
        required: true,
        when: { field: "workOutsideUK", op: "truthy" },
        placeholder: "Up to three months a year at the group's Rotterdam site. Pay continues in sterling. Travel and accommodation are met by the Company.",
      },
    ],
  };

  UK._steps = { partiesStep, roleStep, placeStep };
  UK._conditions = { EMPLOYEE, CASUAL };
})(window);

/* Hours, pay, pension, holiday and absence. */
(function (global) {
  "use strict";

  const UK = global.UK;
  const { EMPLOYEE, CASUAL } = UK._conditions;

  const hoursStep = {
    id: "hours",
    title: "Hours of work",
    blurb: "Hours are a required particular, including how variable hours are decided.",
    questions: [
      {
        id: "weeklyHours",
        label: "Normal weekly hours",
        type: "number",
        required: true,
        when: EMPLOYEE,
        default: "37.5",
        step: "0.5",
        min: 0,
        max: 80,
      },
      {
        id: "daysPerWeek",
        label: "Days per week",
        type: "number",
        when: EMPLOYEE,
        default: "5",
        min: 1,
        max: 7,
      },
      {
        id: "workingPattern",
        label: "Working pattern",
        type: "textarea",
        when: EMPLOYEE,
        placeholder: "Monday to Friday, 8.00am to 4.30pm, with an unpaid lunch break of 60 minutes.",
        help: "If hours vary, say how they are decided and who decides them — that is what the statutory statement requires.",
      },
      {
        id: "shiftWork",
        label: "The role involves shift or rota working",
        type: "toggle",
        when: EMPLOYEE,
      },
      {
        id: "shiftDetails",
        label: "How shifts are set",
        type: "textarea",
        required: true,
        when: { all: [EMPLOYEE, { field: "shiftWork", op: "truthy" }] },
        placeholder: "Rotas are published at least two weeks in advance by the Operations Director and rotate on a three-week cycle.",
      },
      {
        id: "casualNoticeOfWork",
        label: "How work is offered",
        type: "textarea",
        required: true,
        when: CASUAL,
        default: "The Company will contact the Individual by telephone or text message when work is available, ordinarily giving at least 48 hours' notice of an assignment.",
      },
      {
        id: "overtime",
        label: "Overtime",
        type: "radio",
        options: [
          { value: "none", label: "Not expected" },
          { value: "included", label: "May be required, included in salary" },
          { value: "paid", label: "Paid at an agreed rate" },
          { value: "toil", label: "Time off in lieu" },
        ],
        default: "included",
        when: EMPLOYEE,
      },
      {
        id: "overtimeRate",
        label: "Overtime rate",
        type: "text",
        required: true,
        when: { field: "overtime", op: "eq", value: "paid" },
        placeholder: "1.5 times the normal hourly rate on weekdays and twice on Sundays",
      },
      {
        id: "optOut48",
        label: "Offer a 48-hour opt-out under the Working Time Regulations 1998",
        type: "toggle",
        help: "The opt-out must be genuinely voluntary and the worker can withdraw it on notice. It cannot be a condition of the job.",
      },
      {
        id: "breaks",
        label: "State rest breaks expressly",
        type: "toggle",
        default: true,
        help: "Workers over 18 are entitled to a 20-minute unpaid break when a shift exceeds six hours, 11 hours' daily rest and a weekly rest period.",
      },
    ],
  };

  const payStep = {
    id: "pay",
    title: "Pay and benefits",
    blurb: "What the employee is paid, when, and what else comes with the job.",
    questions: [
      {
        id: "payBasis",
        label: "Pay is expressed as",
        type: "radio",
        options: [
          { value: "annual", label: "An annual salary" },
          { value: "hourly", label: "An hourly rate" },
        ],
        default: "annual",
        when: EMPLOYEE,
      },
      {
        id: "salary",
        label: "Annual salary (£)",
        type: "money",
        required: true,
        when: { all: [EMPLOYEE, { field: "payBasis", op: "eq", value: "annual" }] },
        placeholder: "34000",
      },
      {
        id: "hourlyRate",
        label: "Hourly rate (£)",
        type: "money",
        required: true,
        when: { any: [CASUAL, { all: [EMPLOYEE, { field: "payBasis", op: "eq", value: "hourly" }] }] },
        placeholder: "13.50",
        help: "Must be at least the National Minimum Wage or National Living Wage for the worker's age band.",
      },
      {
        id: "payFrequency",
        label: "Paid",
        type: "select",
        options: [
          { value: "monthly", label: "Monthly" },
          { value: "four-weekly", label: "Every four weeks" },
          { value: "fortnightly", label: "Fortnightly" },
          { value: "weekly", label: "Weekly" },
        ],
        default: "monthly",
      },
      {
        id: "payDay",
        label: "Pay day",
        type: "text",
        default: "the last working day of each month",
        placeholder: "the last working day of each month",
      },
      {
        id: "payReview",
        label: "Pay is reviewed annually",
        type: "toggle",
        default: true,
        when: EMPLOYEE,
      },
      {
        id: "payReviewMonth",
        label: "Review month",
        type: "text",
        when: { all: [EMPLOYEE, { field: "payReview", op: "truthy" }] },
        default: "April",
        help: "A review is not a promise of an increase, and the contract says so.",
      },
      {
        id: "bonus",
        label: "There is a bonus or commission scheme",
        type: "toggle",
        when: EMPLOYEE,
      },
      {
        id: "bonusDetails",
        label: "Describe the scheme",
        type: "textarea",
        required: true,
        when: { field: "bonus", op: "truthy" },
        placeholder: "An annual discretionary bonus of up to 10% of salary, measured against departmental targets set each January.",
      },
      {
        id: "bonusDiscretionary",
        label: "The scheme is discretionary and non-contractual",
        type: "toggle",
        default: true,
        when: { field: "bonus", op: "truthy" },
        help: "Strongly recommended. A bonus described as contractual becomes a debt you must pay whatever the year looks like.",
      },
      {
        id: "benefits",
        label: "Benefits provided",
        type: "multi",
        when: EMPLOYEE,
        options: [
          { value: "medical", label: "Private medical insurance" },
          { value: "life", label: "Life assurance" },
          { value: "income", label: "Income protection" },
          { value: "car", label: "Company car or car allowance" },
          { value: "travel", label: "Season ticket loan" },
          { value: "cycle", label: "Cycle to work scheme" },
          { value: "eap", label: "Employee assistance programme" },
          { value: "discount", label: "Staff discount" },
        ],
      },
      {
        id: "benefitsDetails",
        label: "Anything to add about the benefits",
        type: "textarea",
        when: { field: "benefits", op: "truthy" },
        placeholder: "Private medical cover begins after six months' service and may be extended to family members at the employee's cost.",
      },
      {
        id: "expenses",
        label: "Reimburse business expenses",
        type: "toggle",
        default: true,
      },
      {
        id: "deductions",
        label: "Include written consent to deduct overpayments and outstanding sums",
        type: "toggle",
        default: true,
        help: "Section 13 ERA 1996 makes deductions unlawful unless the worker has agreed in writing in advance. This clause is that agreement.",
      },
    ],
  };

  const pensionStep = {
    id: "pension",
    title: "Pension",
    blurb: "Auto-enrolment is compulsory. The contract should name the scheme and the contributions.",
    questions: [
      {
        id: "pensionScheme",
        label: "Scheme name",
        type: "text",
        default: "the Company's qualifying automatic enrolment pension scheme",
      },
      { id: "pensionEmployer", label: "Employer contribution (%)", type: "number", default: "3", min: 0, max: 100, step: "0.5" },
      { id: "pensionEmployee", label: "Employee contribution (%)", type: "number", default: "5", min: 0, max: 100, step: "0.5" },
      {
        id: "salarySacrifice",
        label: "Contributions are made by salary sacrifice",
        type: "toggle",
      },
    ],
  };

  const holidayStep = {
    id: "holiday",
    title: "Holiday",
    blurb: "The statutory minimum is 5.6 weeks, which is 28 days for someone working five days a week.",
    questions: [
      {
        id: "holidayDays",
        label: "Annual holiday entitlement (days)",
        type: "number",
        required: true,
        default: "28",
        min: 0,
        max: 60,
        when: EMPLOYEE,
        help: "Part-time staff take this pro rata. The generator works the pro rata figure out for you from the days per week you entered.",
      },
      {
        id: "holidayIncludesBank",
        label: "The entitlement includes bank holidays",
        type: "toggle",
        default: true,
        when: EMPLOYEE,
      },
      {
        id: "bankHolidayCount",
        label: "Number of bank holidays included",
        type: "number",
        default: "8",
        min: 0,
        max: 12,
        when: { all: [EMPLOYEE, { field: "holidayIncludesBank", op: "truthy" }] },
      },
      {
        id: "holidayYear",
        label: "Holiday year runs from",
        type: "select",
        options: [
          { value: "january", label: "1 January" },
          { value: "april", label: "1 April" },
          { value: "anniversary", label: "The employee's start date anniversary" },
          { value: "other", label: "Another date" },
        ],
        default: "january",
        when: EMPLOYEE,
      },
      {
        id: "holidayYearOther",
        label: "Holiday year start date",
        type: "text",
        required: true,
        when: { field: "holidayYear", op: "eq", value: "other" },
        placeholder: "1 October",
      },
      {
        id: "carryOver",
        label: "Carrying holiday into the next year",
        type: "radio",
        options: [
          { value: "none", label: "Not permitted" },
          { value: "limited", label: "A limited number of days, with consent" },
          { value: "statutory", label: "Only where the law requires it" },
        ],
        default: "limited",
        when: EMPLOYEE,
      },
      {
        id: "carryOverDays",
        label: "Maximum days carried over",
        type: "number",
        default: "5",
        min: 1,
        max: 30,
        when: { field: "carryOver", op: "eq", value: "limited" },
      },
      {
        id: "shutdown",
        label: "There is a compulsory shutdown period",
        type: "toggle",
        when: EMPLOYEE,
        help: "Common at Christmas. Employees must use part of their entitlement for it, so the contract needs to say so.",
      },
      {
        id: "shutdownDetails",
        label: "Shutdown details",
        type: "textarea",
        required: true,
        when: { field: "shutdown", op: "truthy" },
        placeholder: "The workshop closes between Christmas and New Year. Three days of the entitlement must be reserved for this period.",
      },
      {
        id: "casualHolidayBasis",
        label: "Holiday pay for casual work",
        type: "radio",
        when: CASUAL,
        options: [
          { value: "accrued", label: "Accrues at 12.07% of hours worked and is taken as leave" },
          { value: "rolled", label: "Rolled up — paid as a separate 12.07% uplift with each payment" },
        ],
        default: "accrued",
        help: "Rolled-up holiday pay is permitted for irregular-hours and part-year workers for holiday years starting on or after 1 April 2024, provided it is itemised separately on the payslip.",
      },
    ],
  };

  const absenceStep = {
    id: "absence",
    title: "Sickness and other leave",
    blurb: "Sick pay and paid leave are both required particulars.",
    questions: [
      {
        id: "sickNotify",
        label: "How absence must be reported",
        type: "text",
        default: "by telephone to their line manager before 9.30am on the first day of absence",
      },
      {
        id: "sickPay",
        label: "Sick pay",
        type: "radio",
        options: [
          { value: "ssp", label: "Statutory Sick Pay only" },
          { value: "company", label: "A company scheme, then SSP" },
          { value: "discretionary", label: "Discretionary, over and above SSP" },
        ],
        default: "ssp",
      },
      {
        id: "sickFullWeeks",
        label: "Weeks at full pay",
        type: "number",
        default: "4",
        min: 0,
        max: 52,
        when: { field: "sickPay", op: "eq", value: "company" },
      },
      {
        id: "sickHalfWeeks",
        label: "Further weeks at half pay",
        type: "number",
        default: "4",
        min: 0,
        max: 52,
        when: { field: "sickPay", op: "eq", value: "company" },
      },
      {
        id: "sickQualifying",
        label: "Company sick pay begins after (months' service)",
        type: "number",
        default: "6",
        min: 0,
        max: 24,
        when: { field: "sickPay", op: "eq", value: "company" },
      },
      {
        id: "medicalExam",
        label: "The employer may require a medical examination",
        type: "toggle",
        default: true,
      },
      {
        id: "familyLeave",
        label: "Family leave",
        type: "radio",
        when: EMPLOYEE,
        options: [
          { value: "statutory", label: "Statutory entitlements only" },
          { value: "enhanced", label: "Enhanced beyond the statutory minimum" },
        ],
        default: "statutory",
      },
      {
        id: "familyLeaveDetails",
        label: "Describe the enhancement",
        type: "textarea",
        required: true,
        when: { field: "familyLeave", op: "eq", value: "enhanced" },
        placeholder: "Sixteen weeks' maternity, adoption or shared parental leave at full pay for employees with two years' service, inclusive of statutory pay.",
      },
      {
        id: "otherLeave",
        label: "Other paid leave",
        type: "multi",
        when: EMPLOYEE,
        options: [
          { value: "jury", label: "Jury service" },
          { value: "bereavement", label: "Compassionate and bereavement leave" },
          { value: "reserve", label: "Reserve forces training" },
          { value: "volunteer", label: "Volunteering days" },
        ],
      },
    ],
  };

  Object.assign(UK._steps, { hoursStep, payStep, pensionStep, holidayStep, absenceStep });
})(window);

/* Confidentiality, restrictions, termination and governance. */
(function (global) {
  "use strict";

  const UK = global.UK;
  const { EMPLOYEE, CASUAL } = UK._conditions;

  const conductStep = {
    id: "conduct",
    title: "Confidentiality, IP and conduct",
    blurb: "What the employee may not disclose, who owns what they create, and what else they may do.",
    questions: [
      { id: "confidentiality", label: "Include a confidentiality clause", type: "toggle", default: true },
      {
        id: "ipAssignment",
        label: "Assign intellectual property to the employer",
        type: "toggle",
        default: true,
        help: "Copyright in work created in the course of employment already vests in the employer, but an express assignment covers everything else and travels better.",
      },
      {
        id: "outsideInterests",
        label: "Other work and outside interests",
        type: "radio",
        options: [
          { value: "consent", label: "Permitted with written consent" },
          { value: "prohibited", label: "Not permitted during the engagement" },
          { value: "permitted", label: "Permitted, provided there is no conflict" },
        ],
        default: "consent",
      },
      {
        id: "exclusivityNote",
        label: "Acknowledge that exclusivity clauses are unenforceable",
        type: "toggle",
        default: true,
        when: CASUAL,
        help: "Section 27A ERA 1996 makes exclusivity clauses in zero hours arrangements void, and dismissal for breaching one is automatically unfair.",
      },
      {
        id: "dataProtection",
        label: "Include a data protection clause",
        type: "toggle",
        default: true,
        help: "References the employer's privacy notice under UK GDPR and the Data Protection Act 2018.",
      },
      {
        id: "monitoring",
        label: "Reserve the right to monitor systems and communications",
        type: "toggle",
        default: true,
      },
      {
        id: "rightToWork",
        label: "Make the engagement conditional on the right to work in the UK",
        type: "toggle",
        default: true,
      },
      {
        id: "dbs",
        label: "The role requires a DBS check",
        type: "toggle",
      },
      {
        id: "dbsLevel",
        label: "Level of check",
        type: "select",
        when: { field: "dbs", op: "truthy" },
        options: [
          { value: "basic", label: "Basic" },
          { value: "standard", label: "Standard" },
          { value: "enhanced", label: "Enhanced" },
        ],
        default: "basic",
      },
    ],
  };

  const restrictionsStep = {
    id: "restrictions",
    title: "Post-termination restrictions",
    blurb:
      "Restrictions are void as a restraint of trade unless they protect a legitimate business interest and go no further than necessary. Keep them narrow and they stand a chance.",
    questions: [
      {
        id: "restrictions",
        label: "Include post-termination restrictions",
        type: "toggle",
        help: "Worth including for client-facing or senior staff. For a junior role with no client contact and no confidential information, a court is unlikely to enforce them.",
      },
      {
        id: "restrictNonCompete",
        label: "Non-compete — cannot work for a competitor",
        type: "toggle",
        when: { field: "restrictions", op: "truthy" },
      },
      {
        id: "nonCompeteMonths",
        label: "Non-compete period",
        type: "select",
        when: { field: "restrictNonCompete", op: "truthy" },
        options: [
          { value: "3", label: "3 months" },
          { value: "6", label: "6 months" },
          { value: "12", label: "12 months" },
        ],
        default: "6",
        help: "The hardest restriction to enforce. Six months is a common ceiling outside genuinely senior roles.",
      },
      {
        id: "restrictNonSolicit",
        label: "Non-solicitation — cannot approach clients",
        type: "toggle",
        default: true,
        when: { field: "restrictions", op: "truthy" },
      },
      {
        id: "restrictNonDeal",
        label: "Non-dealing — cannot do business with clients even if they approach first",
        type: "toggle",
        when: { field: "restrictions", op: "truthy" },
      },
      {
        id: "restrictNonPoach",
        label: "Non-poaching — cannot recruit former colleagues",
        type: "toggle",
        default: true,
        when: { field: "restrictions", op: "truthy" },
      },
      {
        id: "restrictionMonths",
        label: "Period for the client and staff restrictions",
        type: "select",
        when: {
          any: [
            { field: "restrictNonSolicit", op: "truthy" },
            { field: "restrictNonDeal", op: "truthy" },
            { field: "restrictNonPoach", op: "truthy" },
          ],
        },
        options: [
          { value: "3", label: "3 months" },
          { value: "6", label: "6 months" },
          { value: "12", label: "12 months" },
        ],
        default: "6",
      },
      {
        id: "restrictionLookback",
        label: "Only clients dealt with in the last (months)",
        type: "select",
        when: {
          any: [
            { field: "restrictNonSolicit", op: "truthy" },
            { field: "restrictNonDeal", op: "truthy" },
          ],
        },
        options: [
          { value: "6", label: "6 months" },
          { value: "12", label: "12 months" },
        ],
        default: "12",
        help: "A look-back window keeps the restriction tied to actual client relationships, which is what makes it defensible.",
      },
    ],
  };

  const terminationStep = {
    id: "termination",
    title: "Notice and termination",
    blurb: "Notice is a required particular. Statutory minimums apply however short the contractual period.",
    questions: [
      {
        id: "noticeBasis",
        label: "Notice periods",
        type: "radio",
        when: EMPLOYEE,
        options: [
          { value: "statutory", label: "Statutory minimum only" },
          { value: "fixed", label: "A fixed period for both sides" },
          { value: "tiered", label: "Increasing with length of service" },
        ],
        default: "fixed",
      },
      {
        id: "noticeWeeks",
        label: "Notice period",
        type: "select",
        when: { all: [EMPLOYEE, { field: "noticeBasis", op: "eq", value: "fixed" }] },
        options: [
          { value: "1", label: "1 week" },
          { value: "2", label: "2 weeks" },
          { value: "4", label: "4 weeks" },
          { value: "4.34", label: "1 month" },
          { value: "8.7", label: "2 months" },
          { value: "13", label: "3 months" },
          { value: "26", label: "6 months" },
        ],
        default: "4.34",
      },
      {
        id: "fixedTermEarlyNotice",
        label: "Either party may end the fixed term early on notice",
        type: "toggle",
        default: true,
        when: { field: "engagement", op: "eq", value: "fixed-term" },
        help: "Without this, ending a fixed term early is a breach of contract for the whole remaining balance.",
      },
      {
        id: "pilon",
        label: "Include a pay in lieu of notice clause",
        type: "toggle",
        default: true,
        help: "Without one, paying someone off instead of working their notice is itself a breach — which can release them from their restrictive covenants.",
      },
      { id: "gardenLeave", label: "Include a garden leave clause", type: "toggle", default: true, when: EMPLOYEE },
      { id: "suspension", label: "Reserve the right to suspend on full pay during an investigation", type: "toggle", default: true },
      {
        id: "summaryDismissal",
        label: "List examples of gross misconduct",
        type: "toggle",
        default: true,
      },
      { id: "returnProperty", label: "Require the return of company property", type: "toggle", default: true },
      {
        id: "casualAssignmentEnd",
        label: "Either party may end an assignment without notice",
        type: "toggle",
        default: true,
        when: CASUAL,
      },
    ],
  };

  const governanceStep = {
    id: "governance",
    title: "Policies and governing law",
    blurb: "The last few particulars, and the law the contract runs under.",
    questions: [
      {
        id: "policiesNonContractual",
        label: "State that policies are non-contractual",
        type: "toggle",
        default: true,
        help: "Keeps the staff handbook out of the contract, so you can change a policy without needing everyone's agreement.",
      },
      {
        id: "trainingEntitlement",
        label: "Training",
        type: "radio",
        when: EMPLOYEE,
        options: [
          { value: "mandatory", label: "Mandatory training only, paid for by the employer" },
          { value: "described", label: "A described entitlement" },
          { value: "none", label: "No training entitlement" },
        ],
        default: "mandatory",
        help: "Since April 2020 the statutory statement must cover any training entitlement and whether the employee has to pay for it.",
      },
      {
        id: "trainingDetails",
        label: "Describe the training entitlement",
        type: "textarea",
        required: true,
        when: { field: "trainingEntitlement", op: "eq", value: "described" },
        placeholder: "Five days a year for continuing professional development, plus the cost of one professional membership.",
      },
      {
        id: "trainingClawback",
        label: "Recover training costs if the employee leaves soon after",
        type: "toggle",
        when: EMPLOYEE,
      },
      {
        id: "collectiveAgreement",
        label: "A collective agreement applies",
        type: "toggle",
        when: EMPLOYEE,
      },
      {
        id: "collectiveAgreementDetails",
        label: "Which agreement",
        type: "text",
        required: true,
        when: { field: "collectiveAgreement", op: "truthy" },
        placeholder: "The national agreement between the Company and Unite the Union dated 1 April 2025",
      },
      {
        id: "governingLaw",
        label: "Governing law",
        type: "select",
        options: [
          { value: "ew", label: "England and Wales" },
          { value: "scotland", label: "Scotland" },
          { value: "ni", label: "Northern Ireland" },
        ],
        default: "ew",
      },
      { id: "wholeAgreement", label: "Include an entire agreement clause", type: "toggle", default: true },
    ],
  };

  const signingStep = {
    id: "signing",
    title: "Signing",
    blurb: "Who signs for the employer, and when.",
    questions: [
      { id: "signatoryName", label: "Signing for the employer — name", type: "text", placeholder: "Alan Whitfield" },
      { id: "signatoryPosition", label: "Position", type: "text", placeholder: "Director" },
      { id: "signDate", label: "Date of the agreement", type: "date" },
      {
        id: "counterparts",
        label: "Allow signing in counterparts",
        type: "toggle",
        default: true,
        help: "Lets each side sign a separate copy, which is what happens with electronic signatures.",
      },
    ],
  };

  Object.assign(UK._steps, {
    conductStep,
    restrictionsStep,
    terminationStep,
    governanceStep,
    signingStep,
  });
})(window);

/* The clause library for the employment family. */
(function (global) {
  "use strict";

  const UK = global.UK;
  const { EMPLOYEE, CASUAL } = UK._conditions;

  const LAW_NAME = { ew: "England and Wales", scotland: "Scotland", ni: "Northern Ireland" };
  const COURTS = { ew: "the courts of England and Wales", scotland: "the Scottish courts", ni: "the courts of Northern Ireland" };

  /** "the Employee" for employees, "the Individual" for casual workers. */
  function worker(a) {
    return a.engagement === "zero-hours" || a.engagement === "casual" ? "the Individual" : "the Employee";
  }
  function workerCap(a) {
    return worker(a).replace("the ", "The ");
  }

  /** Holiday pro-rated for anyone not on a five-day week. */
  function proRataHoliday(a) {
    const days = Number(a.holidayDays) || 0;
    const perWeek = Number(a.daysPerWeek) || 5;
    if (perWeek >= 5) return days;
    return Math.round((days / 5) * perWeek * 10) / 10;
  }

  const PAY_PERIOD = {
    monthly: "monthly in arrears",
    "four-weekly": "every four weeks in arrears",
    fortnightly: "fortnightly in arrears",
    weekly: "weekly in arrears",
  };

  const BENEFIT_LABELS = {
    medical: "private medical insurance",
    life: "life assurance",
    income: "income protection insurance",
    car: "a company car or car allowance",
    travel: "a season ticket loan",
    cycle: "participation in the cycle to work scheme",
    eap: "access to an employee assistance programme",
    discount: "staff discount on the Company's products and services",
  };

  const LEAVE_LABELS = {
    jury: "jury service",
    bereavement: "compassionate and bereavement leave",
    reserve: "annual training with the reserve forces",
    volunteer: "approved volunteering",
  };

  const clauses = [
    {
      id: "interpretation",
      heading: "Definitions and interpretation",
      paras: [
        (a, h) =>
          `In this Agreement, "the Company" means ${h.orBlank(a.employerName, "EMPLOYER NAME")}${
            a.employerCompanyNumber ? ` (registered in ${LAW_NAME[a.governingLaw] || "England and Wales"} under company number ${a.employerCompanyNumber})` : ""
          } of ${h.orBlank((a.employerAddress || "").replace(/\n/g, ", "), "EMPLOYER ADDRESS")}, and "${worker(a).replace("the ", "")}" means ${h.orBlank(a.employeeName, "NAME")} of ${h.orBlank((a.employeeAddress || "").replace(/\n/g, ", "), "ADDRESS")}.`,
        () =>
          `Headings are for convenience only and do not affect the interpretation of this Agreement. Words importing the singular include the plural and vice versa.`,
        () =>
          `A reference to a statute or statutory provision is a reference to it as amended, extended or re-enacted from time to time, and includes all subordinate legislation made under it.`,
        {
          when: EMPLOYEE,
          text: () =>
            `This Agreement, together with any document expressly referred to in it, sets out the written statement of particulars of employment required by section 1 of the Employment Rights Act 1996.`,
        },
      ],
    },

    {
      id: "appointment",
      heading: "Appointment and commencement",
      paras: [
        {
          when: EMPLOYEE,
          text: (a, h) =>
            `The Company employs ${worker(a)} and ${worker(a)} agrees to be employed as ${h.orBlank(a.jobTitle, "JOB TITLE")}. The employment begins on ${h.fmtDate(a.startDate)}.`,
        },
        {
          when: CASUAL,
          text: (a, h) =>
            `This Agreement sets out the terms on which the Company may offer work to ${worker(a)} as ${h.orBlank(a.jobTitle, "ROLE")} from ${h.fmtDate(a.startDate)}. It does not itself create an obligation to offer or to accept any work.`,
        },
        {
          when: { all: [EMPLOYEE, { field: "continuityDiffers", op: "falsy" }] },
          text: (a, h) =>
            `${workerCap(a)}'s period of continuous employment begins on ${h.fmtDate(a.startDate)}. No employment with a previous employer counts towards that period.`,
        },
        {
          when: { all: [EMPLOYEE, { field: "continuityDiffers", op: "truthy" }] },
          text: (a, h) =>
            `${workerCap(a)}'s period of continuous employment begins on ${h.fmtDate(a.continuityDate)}, which is earlier than the date on which this employment begins because service with a previous employer counts towards it.`,
        },
        {
          when: CASUAL,
          text: (a) =>
            `Each period of work accepted by ${worker(a)} is a separate assignment. The parties intend that no period of continuous employment arises between assignments, and that ${worker(a)} is a worker rather than an employee of the Company.`,
        },
        {
          when: { field: "engagement", op: "eq", value: "fixed-term" },
          text: (a, h) => {
            if (a.fixedTermBasis === "date") {
              return `The employment is for a fixed term ending on ${h.fmtDate(a.fixedTermEndDate)}, unless terminated earlier in accordance with this Agreement.`;
            }
            return `The employment is for a fixed term ending on ${h.orBlank(a.fixedTermEvent, "DESCRIBE THE TASK OR EVENT")}, unless terminated earlier in accordance with this Agreement.`;
          },
        },
        {
          when: { field: "engagement", op: "eq", value: "fixed-term" },
          text: () =>
            `The Company will not treat ${"the Employee"} less favourably than a comparable permanent employee on the ground of their fixed-term status, unless that treatment is objectively justified, in accordance with the Fixed-term Employees (Prevention of Less Favourable Treatment) Regulations 2002. Where the employment continues for four years or more under successive fixed-term contracts, it will take effect as permanent employment unless the use of a fixed term is objectively justified.`,
        },
        {
          when: { field: "engagement", op: "eq", value: "part-time" },
          text: () =>
            `The Company will not treat the Employee less favourably than a comparable full-time employee on the ground of their part-time status, unless that treatment is objectively justified, in accordance with the Part-time Workers (Prevention of Less Favourable Treatment) Regulations 2000. Pay, holiday and benefits are calculated pro rata to the hours worked.`,
        },
        {
          when: { field: "engagement", op: "eq", value: "apprenticeship" },
          text: (a, h) =>
            `This Agreement is an approved English apprenticeship agreement. The Employee is employed to work as ${h.orBlank(a.jobTitle, "JOB TITLE")} and to follow the ${h.orBlank(a.apprenticeshipStandard, "STANDARD AND LEVEL")} apprenticeship standard with ${h.orBlank(a.trainingProvider, "TRAINING PROVIDER")}, with a planned completion date of ${h.fmtDate(a.apprenticeshipEnd)}.`,
        },
        {
          when: { field: "engagement", op: "eq", value: "apprenticeship" },
          text: () =>
            `The Company will provide the training, supervision and support the apprenticeship standard requires, and will release the Employee for off-the-job training amounting to at least the minimum required by the standard. The Employee will attend that training, complete the work it requires and take part in the end-point assessment.`,
        },
        {
          when: { field: "rightToWork", op: "truthy" },
          text: (a) =>
            `This Agreement is conditional on ${worker(a)} having and continuing to hold the right to work in the United Kingdom, and on producing satisfactory evidence of that right. The Company may end the engagement immediately if that right is lost or cannot be evidenced.`,
        },
        {
          when: { field: "dbs", op: "truthy" },
          text: (a) =>
            `This Agreement is further conditional on a satisfactory ${a.dbsLevel || "basic"} disclosure from the Disclosure and Barring Service, and on ${worker(a)} notifying the Company immediately of any subsequent caution, charge or conviction.`,
        },
      ],
    },

    {
      id: "probation",
      heading: "Probationary period",
      when: { all: [EMPLOYEE, { field: "probation", op: "truthy" }] },
      paras: [
        (a, h) =>
          `The first ${h.orBlank(a.probationMonths, "3")} ${h.plural(a.probationMonths, "month")} of the employment are probationary. During this period the Company will assess the Employee's performance, conduct and suitability for the role.`,
        (a, h) =>
          `During the probationary period either party may terminate the employment on ${h.orBlank(a.probationNoticeWeeks, "1")} ${h.plural(a.probationNoticeWeeks, "week")}' written notice, subject always to the statutory minimum notice to which the Employee is entitled.`,
        {
          when: { field: "probationExtend", op: "truthy" },
          text: () =>
            `The Company may extend the probationary period where it considers that more time is needed to complete its assessment. Any extension will be confirmed in writing before the original period expires.`,
        },
        () =>
          `The employment continues after the probationary period on the terms of this Agreement unless the Company confirms otherwise in writing. Enhanced contractual benefits that depend on successful completion of probation are identified where they arise.`,
      ],
    },

    {
      id: "duties",
      heading: "Duties",
      paras: [
        (a, h) =>
          a.duties
            ? `${workerCap(a)}'s main duties are: ${String(a.duties).replace(/\s+/g, " ").trim().replace(/\.$/, "")}.`
            : `${workerCap(a)} will carry out the duties ordinarily associated with the role of ${h.orBlank(a.jobTitle, "JOB TITLE")}.`,
        (a, h) =>
          `${workerCap(a)} will also carry out any other duties that the Company may reasonably require from time to time, which are consistent with the role and with ${worker(a).replace("the ", "their ")} skills and experience${
            a.reportsTo ? `, and will report to ${a.reportsTo}` : ""
          }.`,
        (a) =>
          `${workerCap(a)} will devote the whole of their working time and attention to the business of the Company, will use their best endeavours to promote its interests, and will comply with all reasonable and lawful instructions given to them.`,
        (a) =>
          `${workerCap(a)} will comply with the Company's policies and procedures in force from time to time, including those relating to health and safety, equality and diversity, information security and acceptable use of the Company's systems.`,
      ],
    },

    {
      id: "place",
      heading: "Place of work",
      paras: [
        {
          when: { field: "workPattern", op: "eq", value: "onsite" },
          text: (a, h) =>
            `${workerCap(a)}'s normal place of work is ${h.orBlank((a.workplaceAddress || "").replace(/\n/g, ", "), "WORKPLACE ADDRESS")}.`,
        },
        {
          when: { field: "workPattern", op: "eq", value: "hybrid" },
          text: (a, h) =>
            `${workerCap(a)}'s normal place of work is ${h.orBlank((a.workplaceAddress || "").replace(/\n/g, ", "), "WORKPLACE ADDRESS")}. The role is performed on a hybrid basis, with ordinarily ${h.orBlank(a.hybridSiteDays, "3")} ${h.plural(a.hybridSiteDays, "day")} each week worked at that location and the balance worked remotely.`,
        },
        {
          when: { field: "workPattern", op: "eq", value: "hybrid" },
          text: () =>
            `Hybrid working is a working arrangement rather than a permanent entitlement. The Company may vary the pattern on reasonable notice where the needs of the business require it, having first consulted about the change.`,
        },
        {
          when: { field: "workPattern", op: "eq", value: "remote" },
          text: (a, h) =>
            `${workerCap(a)} works remotely. ${
              a.homeAddressIsWorkplace
                ? `Their place of work is their home address at ${h.orBlank((a.employeeAddress || "").replace(/\n/g, ", "), "ADDRESS")}.`
                : "Their place of work is such location as they and the Company agree from time to time."
            } ${workerCap(a)} will maintain a safe and suitable working environment and will co-operate with any workstation assessment the Company requires.`,
        },
        {
          when: { field: "workPattern", op: "eq", value: "mobile" },
          text: (a, h) =>
            `${workerCap(a)} has no fixed place of work and will work at such locations within ${h.orBlank(a.mobileArea, "AREA")} as the Company requires. The Company's address given above is the place from which the work is administered.`,
        },
        {
          when: { field: "mobilityClause", op: "truthy" },
          text: (a) =>
            `The Company may require ${worker(a)} to work at any other of its premises within reasonable daily travelling distance of their home, on reasonable notice and provided the change does not involve a substantial detriment.`,
        },
        {
          when: { field: "workOutsideUK", op: "truthy" },
          text: (a, h) =>
            `${workerCap(a)} will be required to work outside the United Kingdom for periods of more than one month. ${h.orBlank(a.outsideUKDetails, "DETAILS OF OVERSEAS WORK")} Pay continues in pounds sterling unless otherwise agreed in writing, and ${worker(a)} is entitled to return to the United Kingdom at the Company's expense at the end of any such period.`,
        },
        {
          when: { field: "workOutsideUK", op: "falsy" },
          text: (a) => `${workerCap(a)} is not required to work outside the United Kingdom for any period of more than one month.`,
        },
      ],
    },

    {
      id: "hours",
      heading: "Hours of work",
      paras: [
        {
          when: EMPLOYEE,
          text: (a, h) =>
            `${workerCap(a)}'s normal hours of work are ${h.orBlank(a.weeklyHours, "37.5")} hours each week${
              a.daysPerWeek ? `, worked over ${a.daysPerWeek} ${h.plural(a.daysPerWeek, "day")}` : ""
            }.${a.workingPattern ? ` ${String(a.workingPattern).replace(/\s+/g, " ").trim()}` : ""}`,
        },
        {
          when: { all: [EMPLOYEE, { field: "shiftWork", op: "truthy" }] },
          text: (a) => `The role involves shift working. ${String(a.shiftDetails || "").replace(/\s+/g, " ").trim()}`,
        },
        {
          when: CASUAL,
          text: (a) =>
            `There are no normal or guaranteed hours of work. ${String(a.casualNoticeOfWork || "").replace(/\s+/g, " ").trim()}`,
        },
        {
          when: CASUAL,
          text: (a) =>
            `The Company is under no obligation to offer work and ${worker(a)} is under no obligation to accept any work offered. Declining an offer of work does not of itself affect any future offer.`,
        },
        {
          when: { field: "overtime", op: "eq", value: "included" },
          text: (a) =>
            `${workerCap(a)} may be required to work such additional hours as are reasonably necessary for the proper performance of their duties. No further payment is made for those hours, and the salary stated in this Agreement takes account of them.`,
        },
        {
          when: { field: "overtime", op: "eq", value: "paid" },
          text: (a, h) =>
            `Hours worked beyond the normal weekly hours, where authorised in advance, are paid at ${h.orBlank(a.overtimeRate, "OVERTIME RATE")}.`,
        },
        {
          when: { field: "overtime", op: "eq", value: "toil" },
          text: (a) =>
            `Hours worked beyond the normal weekly hours, where authorised in advance, are compensated by time off in lieu taken at a time agreed with ${a.reportsTo || "the line manager"}. Time off in lieu not taken within three months is lost unless the Company agrees otherwise.`,
        },
        {
          when: { field: "overtime", op: "eq", value: "none" },
          text: () => `Overtime is not ordinarily required and is not paid.`,
        },
        {
          when: { field: "optOut48", op: "truthy" },
          text: (a) =>
            `The Working Time Regulations 1998 limit average weekly working time to 48 hours. ${workerCap(a)} may agree in writing to disapply that limit. Any such agreement is voluntary, is recorded in a separate opt-out notice, and may be withdrawn by ${worker(a)} on three months' written notice. Neither declining to opt out nor withdrawing an opt-out will be treated as a reason for any detriment.`,
        },
        {
          when: { field: "optOut48", op: "falsy" },
          text: (a) =>
            `${workerCap(a)}'s average weekly working time will not exceed 48 hours, calculated over the reference period in the Working Time Regulations 1998.`,
        },
        {
          when: { field: "breaks", op: "truthy" },
          text: (a) =>
            `${workerCap(a)} is entitled to an uninterrupted rest break of at least 20 minutes when daily working time exceeds six hours, to a daily rest period of at least 11 consecutive hours, and to a weekly rest period of at least 24 uninterrupted hours. Rest breaks are unpaid unless the Company states otherwise.`,
        },
      ],
    },

    {
      id: "remuneration",
      heading: "Remuneration",
      paras: [
        {
          when: { all: [EMPLOYEE, { field: "payBasis", op: "eq", value: "annual" }] },
          text: (a, h) =>
            `The Company will pay ${worker(a)} a salary of ${h.fmtMoney(a.salary)} a year, payable ${
              PAY_PERIOD[a.payFrequency] || "monthly in arrears"
            } by credit transfer to ${worker(a).replace("the ", "their ")} nominated bank account on ${h.orBlank(a.payDay, "PAY DAY")}.`,
        },
        {
          when: { any: [CASUAL, { all: [EMPLOYEE, { field: "payBasis", op: "eq", value: "hourly" }] }] },
          text: (a, h) =>
            `The Company will pay ${worker(a)} ${h.fmtMoney(a.hourlyRate)} for each hour worked, payable ${
              PAY_PERIOD[a.payFrequency] || "monthly in arrears"
            } by credit transfer to ${worker(a).replace("the ", "their ")} nominated bank account on ${h.orBlank(a.payDay, "PAY DAY")}.`,
        },
        {
          when: { any: [CASUAL, { field: "payBasis", op: "eq", value: "hourly" }] },
          text: (a) =>
            `The Company will ensure that pay is at all times at least the National Minimum Wage or National Living Wage applicable to ${worker(a)}, and will increase the rate where necessary to achieve this.`,
        },
        {
          when: { field: "engagement", op: "eq", value: "apprenticeship" },
          text: () =>
            `Pay will at all times be at least the apprentice rate of the National Minimum Wage, or the rate applicable to the Employee's age band once they are past the first year of the apprenticeship or aged 19 or over, whichever is higher.`,
        },
        {
          when: { all: [EMPLOYEE, { field: "payReview", op: "truthy" }] },
          text: (a, h) =>
            `Pay is reviewed each year in ${h.orBlank(a.payReviewMonth, "April")}. A review does not create any entitlement to an increase, and the Company is under no obligation to award one.`,
        },
        {
          when: { field: "bonus", op: "truthy" },
          text: (a) => String(a.bonusDetails || "").replace(/\s+/g, " ").trim(),
        },
        {
          when: { all: [{ field: "bonus", op: "truthy" }, { field: "bonusDiscretionary", op: "truthy" }] },
          text: (a) =>
            `Any bonus or commission is entirely discretionary, does not form part of ${worker(a).replace("the ", "the ")}'s contractual remuneration, and creates no expectation of any future payment. The Company may withdraw or vary the scheme at any time. No payment is made if ${worker(a)} is under notice, whether given or received, on the date the payment would otherwise be made.`,
        },
        {
          when: { field: "deductions", op: "truthy" },
          text: (a) =>
            `${workerCap(a)} agrees, for the purposes of section 13 of the Employment Rights Act 1996, that the Company may deduct from their pay or any other sums due to them any amount owed to the Company, including overpayments of pay or expenses, the cost of unreturned Company property, and holiday taken in excess of entitlement at the date of termination.`,
        },
      ],
    },

    {
      id: "expenses",
      heading: "Expenses",
      when: { field: "expenses", op: "truthy" },
      paras: [
        (a) =>
          `The Company will reimburse ${worker(a)} for expenses reasonably and properly incurred in the performance of their duties, on production of receipts or other evidence the Company reasonably requires and in accordance with its expenses policy in force at the time.`,
        (a) =>
          `Any Company credit or charge card is to be used only for authorised business expenditure, and must be returned on request and in any event on termination.`,
      ],
    },

    {
      id: "pension",
      heading: "Pension",
      paras: [
        (a, h) =>
          `${workerCap(a)} will be automatically enrolled in ${h.orBlank(a.pensionScheme, "the Company's qualifying automatic enrolment pension scheme")} where they meet the statutory eligibility criteria, in accordance with the Company's duties under the Pensions Act 2008.`,
        (a, h) =>
          `The Company contributes ${h.orBlank(a.pensionEmployer, "3")}% and ${worker(a)} contributes ${h.orBlank(a.pensionEmployee, "5")}% of qualifying earnings, subject to the rules of the scheme from time to time.`,
        {
          when: { field: "salarySacrifice", op: "truthy" },
          text: (a) =>
            `Contributions are made by salary sacrifice, under which ${worker(a)} gives up part of their gross pay in return for an equivalent employer pension contribution. Salary for the purposes of pay reviews, overtime, pension and any salary-related benefit is calculated on the pre-sacrifice figure.`,
        },
        (a) =>
          `${workerCap(a)} may opt out of the scheme in accordance with its rules, and will be re-enrolled at the intervals the legislation requires. A contracting-out certificate is not in force in respect of this employment.`,
      ],
    },

    {
      id: "benefits",
      heading: "Benefits",
      when: { field: "benefits", op: "truthy" },
      paras: [
        (a, h) => {
          const labels = (a.benefits || []).map((k) => BENEFIT_LABELS[k]).filter(Boolean);
          if (labels.length === 0) return "";
          return `Subject to the rules of the relevant scheme and to the Company continuing to be able to obtain cover on reasonable terms, ${worker(a)} is eligible for ${h.list(labels)}.`;
        },
        {
          when: { field: "benefitsDetails", op: "truthy" },
          text: (a) => String(a.benefitsDetails || "").replace(/\s+/g, " ").trim(),
        },
        (a) =>
          `Benefits are provided at the Company's discretion and may be varied or withdrawn on reasonable notice. Where a benefit is provided by an insurer, the Company's only obligation is to pay the premium; it is not obliged to make any payment the insurer declines to make.`,
      ],
    },

    {
      id: "holiday",
      heading: "Holiday",
      when: EMPLOYEE,
      paras: [
        (a, h) => {
          const entitlement = proRataHoliday(a);
          const perWeek = Number(a.daysPerWeek) || 5;
          const proRataNote =
            perWeek < 5
              ? ` This is the pro rata equivalent of ${h.orBlank(a.holidayDays, "28")} days for a five-day week, reflecting the ${perWeek} ${h.plural(perWeek, "day")} a week worked.`
              : "";
          return `${workerCap(a)} is entitled to ${h.fmtNumber(entitlement)} days' paid holiday in each holiday year${
            a.holidayIncludesBank
              ? `, inclusive of the ${h.orBlank(a.bankHolidayCount, "8")} bank and public holidays`
              : ", in addition to bank and public holidays"
          }.${proRataNote}`;
        },
        (a, h) => {
          const map = {
            january: "1 January",
            april: "1 April",
            anniversary: "the anniversary of the Employee's start date",
            other: h.orBlank(a.holidayYearOther, "DATE"),
          };
          return `The holiday year runs from ${map[a.holidayYear] || "1 January"}. Entitlement in the first and last years of employment is calculated pro rata to the proportion of the holiday year worked, rounded up to the nearest half day.`;
        },
        () =>
          `Holiday must be requested in advance and approved by the line manager before it is booked. The Company may refuse a request, and may require holiday to be taken on particular dates, on notice of at least twice the length of the holiday concerned.`,
        {
          when: { field: "shutdown", op: "truthy" },
          text: (a) => String(a.shutdownDetails || "").replace(/\s+/g, " ").trim(),
        },
        {
          when: { field: "carryOver", op: "eq", value: "none" },
          text: () =>
            `Holiday not taken by the end of the holiday year is lost and no payment is made for it, except where the law requires carry-over to be permitted.`,
        },
        {
          when: { field: "carryOver", op: "eq", value: "limited" },
          text: (a, h) =>
            `Up to ${h.orBlank(a.carryOverDays, "5")} days may be carried into the following holiday year with the written agreement of the line manager, and must be taken within the first three months of that year or they are lost.`,
        },
        {
          when: { field: "carryOver", op: "eq", value: "statutory" },
          text: () =>
            `Holiday is carried over only where the law requires it, including where the Employee has been unable to take it because of sickness absence or a period of statutory family leave.`,
        },
        () =>
          `On termination ${"the Employee"} is entitled to pay in lieu of accrued but untaken holiday. Where holiday taken exceeds the entitlement accrued at the termination date, the excess is recoverable as a deduction from any final payment.`,
      ],
    },

    {
      id: "casual-holiday",
      heading: "Holiday",
      when: CASUAL,
      paras: [
        {
          when: { field: "casualHolidayBasis", op: "eq", value: "accrued" },
          text: (a) =>
            `${workerCap(a)} accrues paid holiday at the rate of 12.07% of the hours worked in each holiday year, which is the statutory entitlement of 5.6 weeks expressed as a proportion of working time. Holiday is taken as leave, at times agreed in advance with the Company.`,
        },
        {
          when: { field: "casualHolidayBasis", op: "eq", value: "rolled" },
          text: (a) =>
            `${workerCap(a)}'s holiday pay is paid as an uplift of 12.07% on the pay for each assignment, itemised separately on the payslip as holiday pay. This reflects the statutory entitlement of 5.6 weeks' paid holiday. ${workerCap(a)} remains entitled to take the leave itself, unpaid at the time of taking, and the Company encourages them to do so.`,
        },
        (a) => `The holiday year runs from 1 April to 31 March.`,
      ],
    },

    {
      id: "sickness",
      heading: "Sickness absence",
      paras: [
        (a, h) =>
          `If ${worker(a)} is unable to work because of sickness or injury they must notify the Company as soon as possible, and in any event ${h.orBlank(a.sickNotify, "before the start of their normal working hours on the first day of absence")}, stating the reason for the absence and its expected duration.`,
        (a) =>
          `For absences of up to seven calendar days ${worker(a)} must complete the Company's self-certification form on their return. For absences of more than seven calendar days they must provide a fit note from a registered healthcare professional, and continue to provide one for the whole period of absence.`,
        {
          when: { field: "sickPay", op: "eq", value: "ssp" },
          text: (a) =>
            `${workerCap(a)} is entitled to Statutory Sick Pay if they meet the qualifying conditions. There is no contractual sick pay over and above Statutory Sick Pay. ${workerCap(a)}'s qualifying days for Statutory Sick Pay purposes are their normal working days.`,
        },
        {
          when: { field: "sickPay", op: "eq", value: "company" },
          text: (a, h) =>
            `After ${h.orBlank(a.sickQualifying, "6")} ${h.plural(a.sickQualifying, "month")}' continuous service, the Company will pay ${h.orBlank(a.sickFullWeeks, "4")} ${h.plural(a.sickFullWeeks, "week")} at full pay followed by ${h.orBlank(a.sickHalfWeeks, "4")} ${h.plural(a.sickHalfWeeks, "week")} at half pay in any rolling period of twelve months. Company sick pay is inclusive of any Statutory Sick Pay due for the same period.`,
        },
        {
          when: { field: "sickPay", op: "eq", value: "discretionary" },
          text: (a) =>
            `The Company may in its absolute discretion pay more than Statutory Sick Pay during a period of absence. Any such payment is discretionary, is inclusive of Statutory Sick Pay, and creates no entitlement to any payment on a future occasion.`,
        },
        {
          when: { field: "medicalExam", op: "truthy" },
          text: (a) =>
            `The Company may require ${worker(a)}, at its expense, to be examined by a medical practitioner of its choosing, and ${worker(a)} agrees to that examination and to the disclosure of the resulting report to the Company. Any such report will be handled in accordance with the Access to Medical Reports Act 1988 where it applies.`,
        },
        (a) =>
          `The Company may withhold sick pay where ${worker(a)} fails to comply with the notification or certification requirements, or where the absence is found not to be genuine.`,
      ],
    },

    {
      id: "family-leave",
      heading: "Family and other leave",
      when: EMPLOYEE,
      paras: [
        () =>
          `The Employee is entitled to maternity, paternity, adoption, shared parental, parental, neonatal care and parental bereavement leave and pay in accordance with the law in force at the relevant time, and to take reasonable unpaid time off to deal with an emergency involving a dependant.`,
        {
          when: { field: "familyLeave", op: "eq", value: "enhanced" },
          text: (a) => String(a.familyLeaveDetails || "").replace(/\s+/g, " ").trim(),
        },
        {
          when: { field: "otherLeave", op: "truthy" },
          text: (a, h) => {
            const labels = (a.otherLeave || []).map((k) => LEAVE_LABELS[k]).filter(Boolean);
            if (labels.length === 0) return "";
            return `The Company also provides paid time off for ${h.list(labels)}, subject to the terms of the relevant policy and to prior approval.`;
          },
        },
        () =>
          `The Employee is entitled to unpaid time off for public duties and for other purposes where the law requires it. All other leave is at the Company's discretion.`,
      ],
    },
  ];

  UK._employmentClauses = clauses;
  UK._helpers = { worker, workerCap, proRataHoliday, LAW_NAME, COURTS };
})(window);

/* Clause library, second half: protection, termination and boilerplate. */
(function (global) {
  "use strict";

  const UK = global.UK;
  const { EMPLOYEE, CASUAL } = UK._conditions;
  const { worker, workerCap, LAW_NAME, COURTS } = UK._helpers;

  const NOTICE_LABEL = {
    "1": "one week",
    "2": "two weeks",
    "4": "four weeks",
    "4.34": "one month",
    "8.7": "two months",
    "13": "three months",
    "26": "six months",
  };

  const more = [
    {
      id: "confidentiality",
      heading: "Confidential information",
      when: { field: "confidentiality", op: "truthy" },
      paras: [
        (a) =>
          `${workerCap(a)} will not, during the engagement or at any time afterwards, use or disclose to any person any confidential information concerning the business of the Company, its clients or its suppliers, except in the proper performance of their duties or as required by law.`,
        () =>
          `Confidential information includes trade secrets, financial and pricing information, business plans, client and prospect lists, supplier terms, technical data, designs, source code, know-how, and any information marked or reasonably understood to be confidential. It does not include information that is or becomes public through no breach of this clause.`,
        (a) =>
          `${workerCap(a)} will not make, otherwise than for the benefit of the Company, any record of confidential information, and will deliver up or securely destroy every such record on termination or on request.`,
        () =>
          `Nothing in this Agreement prevents the making of a protected disclosure under the Employment Rights Act 1996, the reporting of a criminal offence to a law enforcement agency, the disclosure of information to a regulator, or co-operation with any investigation by a regulator or law enforcement agency. Nothing in this Agreement prevents any person from discussing an allegation of unlawful discrimination or harassment.`,
      ],
    },

    {
      id: "ip",
      heading: "Intellectual property",
      when: { field: "ipAssignment", op: "truthy" },
      paras: [
        (a) =>
          `${workerCap(a)} assigns to the Company, with full title guarantee and by way of present and future assignment, all intellectual property rights in any work, invention, design, software, material or other subject matter created by them in the course of the engagement, to the extent those rights do not already vest in the Company.`,
        () =>
          `The parties acknowledge sections 39 to 43 of the Patents Act 1977, under which an invention made by an employee belongs to the employer where it was made in the course of duties from which an invention might reasonably be expected to result. Nothing in this clause reduces any right to compensation those sections confer.`,
        (a) =>
          `${workerCap(a)} waives, to the fullest extent permitted by law, all moral rights arising under Chapter IV of the Copyright, Designs and Patents Act 1988 in any work created in the course of the engagement.`,
        (a) =>
          `${workerCap(a)} will promptly disclose to the Company anything falling within this clause, and will execute any document and do anything the Company reasonably requires, at the Company's expense, to give it the full benefit of those rights, including after the engagement has ended.`,
      ],
    },

    {
      id: "data-protection",
      heading: "Data protection",
      when: { field: "dataProtection", op: "truthy" },
      paras: [
        (a) =>
          `The Company processes personal data relating to ${worker(a)} in accordance with the UK General Data Protection Regulation and the Data Protection Act 2018. The Company's privacy notice for staff explains what data is held, why, on what lawful basis, how long it is kept and what rights ${worker(a)} has. The privacy notice does not form part of this Agreement and may be updated from time to time.`,
        (a) =>
          `${workerCap(a)} will comply with the Company's data protection and information security policies when handling personal data in the course of their duties, and will report any suspected personal data breach to the Company immediately.`,
        {
          when: { field: "monitoring", op: "truthy" },
          text: (a) =>
            `The Company may monitor and record use of its systems, communications and premises, including email, internet use and telephone calls, for the purposes of security, regulatory compliance and the proper operation of its business. Monitoring is carried out proportionately and in accordance with the Company's policy, of which ${worker(a)} has been made aware.`,
        },
      ],
    },

    {
      id: "outside-interests",
      heading: "Outside interests",
      paras: [
        {
          when: { field: "outsideInterests", op: "eq", value: "prohibited" },
          text: (a) =>
            `${workerCap(a)} will not, during the engagement, be directly or indirectly engaged or interested in any other business or occupation, whether paid or unpaid.`,
        },
        {
          when: { field: "outsideInterests", op: "eq", value: "consent" },
          text: (a) =>
            `${workerCap(a)} will not, during the engagement, be directly or indirectly engaged or interested in any other business or occupation without the prior written consent of the Company, which will not be unreasonably withheld where the other engagement neither competes with the Company nor interferes with the performance of their duties.`,
        },
        {
          when: { field: "outsideInterests", op: "eq", value: "permitted" },
          text: (a) =>
            `${workerCap(a)} may undertake other work provided it does not compete with the Company, does not interfere with the performance of their duties, and does not cause their total working time to exceed the limits in the Working Time Regulations 1998. They will tell the Company about any such work before starting it.`,
        },
        {
          when: { field: "exclusivityNote", op: "truthy" },
          text: (a) =>
            `Nothing in this Agreement restricts ${worker(a)} from working for another employer. Any provision purporting to do so would be unenforceable under section 27A of the Employment Rights Act 1996, and ${worker(a)} will suffer no detriment for taking other work.`,
        },
        (a) =>
          `${workerCap(a)} will disclose to the Company any interest that conflicts, or might reasonably be thought to conflict, with the interests of the Company, as soon as they become aware of it.`,
        (a) =>
          `${workerCap(a)} will not accept from any client, supplier or other person any gift or hospitality beyond what is modest and customary, and will not offer or accept any bribe. They will comply with the Bribery Act 2010 and with the Company's anti-bribery policy.`,
      ],
    },

    {
      id: "termination",
      heading: "Termination",
      when: EMPLOYEE,
      paras: [
        {
          when: { field: "noticeBasis", op: "eq", value: "statutory" },
          text: () =>
            `After any probationary period, either party may terminate the employment by giving the statutory minimum notice. The Employee is entitled to one week's notice after one month's continuous service, rising by one further week for each complete year of service to a maximum of twelve weeks. The Employee must give the Company one week's notice after one month's continuous service.`,
        },
        {
          when: { field: "noticeBasis", op: "eq", value: "fixed" },
          text: (a) =>
            `After any probationary period, either party may terminate the employment by giving ${
              NOTICE_LABEL[a.noticeWeeks] || "one month"
            }' written notice, or such longer period as the Employee is entitled to receive by statute.`,
        },
        {
          when: { field: "noticeBasis", op: "eq", value: "tiered" },
          text: () =>
            `After any probationary period, the notice each party must give increases with service: one month during the first two years, two months from two to five years, and three months thereafter. The Company will in every case give at least the statutory minimum, which is one week for each complete year of service up to twelve weeks.`,
        },
        {
          when: { all: [{ field: "engagement", op: "eq", value: "fixed-term" }, { field: "fixedTermEarlyNotice", op: "truthy" }] },
          text: () =>
            `The employment may be terminated before the end of the fixed term by either party giving the notice set out above. Where it is not terminated earlier, it ends automatically at the end of the fixed term without further notice.`,
        },
        {
          when: { all: [{ field: "engagement", op: "eq", value: "fixed-term" }, { field: "fixedTermEarlyNotice", op: "falsy" }] },
          text: () =>
            `The employment ends automatically at the end of the fixed term without notice. Neither party may terminate it earlier except for a repudiatory breach.`,
        },
        {
          when: { field: "pilon", op: "truthy" },
          text: () =>
            `The Company may terminate the employment with immediate effect by paying, in lieu of notice, basic salary for the notice period or the unexpired part of it. The payment excludes bonus, commission and benefits, is subject to deductions for tax and National Insurance, and is treated for tax purposes in accordance with the post-employment notice pay rules. The Company is not obliged to exercise this right, and may terminate on notice instead.`,
        },
        {
          when: { field: "gardenLeave", op: "truthy" },
          text: () =>
            `During any period of notice, whether given by the Company or the Employee, the Company may require the Employee to take garden leave for all or part of the notice period. During garden leave the Employee remains employed, continues to receive salary and benefits, remains bound by all duties owed to the Company, must not contact clients, suppliers or colleagues without consent, must remain available to answer questions, and may be required to stay away from the Company's premises and to return Company property.`,
        },
        {
          when: { field: "suspension", op: "truthy" },
          text: () =>
            `The Company may suspend the Employee from duty on full pay while it investigates any matter in which the Employee is implicated. Suspension is a neutral act, is not a disciplinary sanction, and will be for no longer than is reasonably necessary.`,
        },
      ],
    },

    {
      id: "casual-termination",
      heading: "Ending an assignment or this Agreement",
      when: CASUAL,
      paras: [
        {
          when: { field: "casualAssignmentEnd", op: "truthy" },
          text: (a) =>
            `Either party may end a particular assignment at any time without notice and without giving a reason. ${workerCap(a)} will be paid for the hours actually worked up to that point, together with any holiday pay due.`,
        },
        (a) =>
          `Either party may end this Agreement at any time on one week's written notice. Ending this Agreement does not affect any assignment already accepted and in progress unless that assignment is also ended.`,
        (a) =>
          `The Company may end this Agreement and any current assignment immediately if ${worker(a)} commits a serious breach of its terms, is guilty of gross misconduct, or loses any right or qualification necessary to do the work.`,
      ],
    },

    {
      id: "summary",
      heading: "Termination without notice",
      when: { field: "summaryDismissal", op: "truthy" },
      paras: [
        (a) =>
          `The Company may terminate the engagement immediately and without notice or payment in lieu if ${worker(a)} commits an act of gross misconduct or a serious or repeated breach of this Agreement.`,
        () =>
          `Conduct that may amount to gross misconduct includes theft or fraud, deliberate falsification of records, physical violence or serious threatening behaviour, serious bullying, harassment or discrimination, being unfit for work through drink or unlawful drugs, a serious breach of health and safety rules, serious or deliberate damage to property, a serious breach of confidence, accepting or offering a bribe, and a serious breach of the Company's information security or data protection policies. The list is illustrative and not exhaustive.`,
        () =>
          `Whether particular conduct amounts to gross misconduct is a matter for the Company to determine following a fair investigation and a fair procedure, having regard to the ACAS Code of Practice on Disciplinary and Grievance Procedures.`,
      ],
    },

    {
      id: "on-termination",
      heading: "Obligations on termination",
      when: { field: "returnProperty", op: "truthy" },
      paras: [
        (a) =>
          `On termination, or at any earlier time on request, ${worker(a)} will return to the Company all property in their possession or control, including documents, records, keys, passes, equipment, mobile devices, credit cards and any copies of them, in whatever medium held.`,
        (a) =>
          `${workerCap(a)} will irretrievably delete any Company information held on personal devices or accounts, and will confirm in writing that they have done so if the Company asks.`,
        (a) =>
          `${workerCap(a)} will not, after termination, represent themselves as being connected with the Company, and will not use any of its names, marks or logos.`,
      ],
    },

    {
      id: "restrictions",
      heading: "Post-termination restrictions",
      when: { field: "restrictions", op: "truthy" },
      paras: [
        (a) =>
          `${workerCap(a)} will have access to confidential information and to the Company's client and staff relationships. The restrictions in this clause are agreed to be no more than is reasonably necessary to protect those legitimate business interests. Each restriction is separate and severable, and if any is held to be unenforceable the others continue to apply.`,
        {
          when: { field: "restrictNonCompete", op: "truthy" },
          text: (a, h) =>
            `For ${h.orBlank(a.nonCompeteMonths, "6")} months after termination, ${worker(a)} will not be engaged or interested in any business that competes with any part of the Company's business in which they were materially involved in the twelve months before termination, within the territory in which that part of the business operated.`,
        },
        {
          when: { field: "restrictNonSolicit", op: "truthy" },
          text: (a, h) =>
            `For ${h.orBlank(a.restrictionMonths, "6")} months after termination, ${worker(a)} will not solicit or approach, with a view to providing competing goods or services, any client or prospective client of the Company with whom they had material dealings in the ${h.orBlank(a.restrictionLookback, "12")} months before termination.`,
        },
        {
          when: { field: "restrictNonDeal", op: "truthy" },
          text: (a, h) =>
            `For ${h.orBlank(a.restrictionMonths, "6")} months after termination, ${worker(a)} will not deal with, or provide competing goods or services to, any client or prospective client of the Company with whom they had material dealings in the ${h.orBlank(a.restrictionLookback, "12")} months before termination, whether or not that client approached them first.`,
        },
        {
          when: { field: "restrictNonPoach", op: "truthy" },
          text: (a, h) =>
            `For ${h.orBlank(a.restrictionMonths, "6")} months after termination, ${worker(a)} will not solicit or entice away from the Company any person who was employed or engaged by it in a senior, technical or client-facing role at the date of termination and with whom they worked in the twelve months before that date.`,
        },
        (a) =>
          `Any period in this clause is reduced by the length of any period of garden leave served immediately before termination. Nothing in this clause prevents ${worker(a)} from holding up to 3% of the shares of a company listed on a recognised investment exchange, or from taking up employment in a role that is genuinely unconnected with the parts of the business the restriction protects.`,
        (a) =>
          `${workerCap(a)} will tell any prospective employer about these restrictions before accepting an offer of employment, and will tell the Company the identity of that employer if asked.`,
      ],
    },

    {
      id: "disciplinary",
      heading: "Disciplinary and grievance",
      paras: [
        (a) =>
          `The Company's disciplinary and grievance procedures apply to the engagement. They are non-contractual, so the Company may vary them, and they are available from the Company on request.`,
        (a) =>
          `If ${worker(a)} is dissatisfied with any disciplinary decision, or has a grievance about their engagement, they should raise it in writing with ${a.reportsTo || "their line manager"}, or with a director if the grievance concerns that person, in accordance with those procedures.`,
        {
          when: { field: "policiesNonContractual", op: "truthy" },
          text: () =>
            `The Company's policies, procedures and staff handbook do not form part of this Agreement. The Company may introduce, vary or withdraw them at any time, and will tell affected staff when it does so.`,
        },
      ],
    },

    {
      id: "collective",
      heading: "Collective agreements",
      when: EMPLOYEE,
      paras: [
        {
          when: { field: "collectiveAgreement", op: "truthy" },
          text: (a, h) =>
            `The terms of ${h.orBlank(a.collectiveAgreementDetails, "COLLECTIVE AGREEMENT")} directly affect the terms and conditions of this employment. A copy is available from the Company on request.`,
        },
        {
          when: { field: "collectiveAgreement", op: "falsy" },
          text: () => `There is no collective agreement that directly affects the terms and conditions of this employment.`,
        },
      ],
    },

    {
      id: "training",
      heading: "Training",
      when: EMPLOYEE,
      paras: [
        {
          when: { field: "trainingEntitlement", op: "eq", value: "mandatory" },
          text: () =>
            `The Employee must complete the training the Company requires for the role, including induction, health and safety and any training the law or a regulator requires. The Company pays for that training and it is undertaken in working time. There is no other training entitlement.`,
        },
        {
          when: { field: "trainingEntitlement", op: "eq", value: "described" },
          text: (a) =>
            `${String(a.trainingDetails || "").replace(/\s+/g, " ").trim()} Training the Company requires for the role is paid for by the Company and undertaken in working time.`,
        },
        {
          when: { field: "trainingEntitlement", op: "eq", value: "none" },
          text: () =>
            `There is no training entitlement, and the Company does not require the Employee to undertake any training that they must pay for themselves.`,
        },
        {
          when: { field: "trainingClawback", op: "truthy" },
          text: () =>
            `Where the Company funds a course costing more than £1,000, the Employee agrees to repay a proportion of that cost if they leave within two years of completing it: all of it within six months, three quarters within twelve months, half within eighteen months and a quarter within twenty-four months. Nothing is repayable where the Company terminates the employment other than for gross misconduct, or where the Employee resigns in response to a repudiatory breach. The Employee authorises the deduction of any sum due under this clause from their final payment.`,
        },
      ],
    },

    {
      id: "general",
      heading: "General",
      paras: [
        {
          when: { field: "wholeAgreement", op: "truthy" },
          text: (a) =>
            `This Agreement sets out the whole agreement between the parties and replaces all previous agreements, arrangements and understandings between them relating to the engagement. ${workerCap(a)} confirms that they have not relied on any statement or representation that is not set out in it.`,
        },
        () =>
          `No variation of this Agreement is effective unless it is in writing and signed by both parties. The Company may make minor administrative changes on reasonable notice.`,
        () =>
          `A failure or delay in enforcing any provision of this Agreement is not a waiver of it, and does not prevent its later enforcement.`,
        () =>
          `Notices under this Agreement must be in writing and delivered by hand, sent by first class post to the addresses given above, or sent by email to an address the recipient has used for the purposes of the engagement.`,
        () =>
          `A person who is not a party to this Agreement has no right under the Contracts (Rights of Third Parties) Act 1999 to enforce any of its terms, except that any group company may enforce the confidentiality, intellectual property and post-termination provisions.`,
        {
          when: { field: "counterparts", op: "truthy" },
          text: () =>
            `This Agreement may be signed in any number of counterparts, each of which is an original and all of which together form one agreement. A signature transmitted electronically is as effective as an original.`,
        },
        (a) =>
          `This Agreement, and any dispute arising out of or in connection with it, is governed by the law of ${
            LAW_NAME[a.governingLaw] || "England and Wales"
          }, and the parties submit to the exclusive jurisdiction of ${COURTS[a.governingLaw] || "the courts of England and Wales"}.`,
      ],
    },
  ];

  UK._employmentClauses.push(...more);
})(window);

/* Director-specific clauses, then template registration. */
(function (global) {
  "use strict";

  const UK = global.UK;
  const S = UK._steps;

  const directorClauses = [
    {
      id: "director-office",
      heading: "Appointment to office",
      paras: [
        (a, h) =>
          `The Employee is appointed as a director of the Company with effect from ${h.fmtDate(a.startDate)}. The appointment is subject to the Company's articles of association, and to the Employee not being disqualified from acting as a director.`,
        () =>
          `The Employee will comply with the general duties of a director set out in sections 171 to 177 of the Companies Act 2006, including the duty to act within powers, to promote the success of the Company, to exercise independent judgement and reasonable care, to avoid conflicts of interest, and to declare any interest in a proposed transaction.`,
        () =>
          `The Employee will not, without the authority of the board, incur any expenditure, enter into any commitment, or give any guarantee on behalf of the Company beyond the limits the board sets from time to time.`,
        () =>
          `The office of director may be terminated by the members or under the articles without terminating the employment, and the termination of the office does not of itself give rise to any claim for damages.`,
      ],
    },
    {
      id: "director-resignation",
      heading: "Resignation from office",
      paras: [
        () =>
          `On termination of the employment for any reason, the Employee will immediately resign, without any claim for compensation, from the office of director of the Company and from every other office they hold in any group company, and from any trusteeship of a group pension scheme.`,
        () =>
          `The Employee irrevocably appoints the Company as their attorney for the sole purpose of executing any document and doing anything necessary to give effect to the preceding paragraph, if they have not done so within five business days of a written request.`,
      ],
    },
  ];

  /* --------------------------------------------------------- registration */

  const EMPLOYMENT_STEPS = [
    S.partiesStep,
    S.roleStep,
    S.placeStep,
    S.hoursStep,
    S.payStep,
    S.pensionStep,
    S.holidayStep,
    S.absenceStep,
    S.conductStep,
    S.restrictionsStep,
    S.terminationStep,
    S.governanceStep,
    S.signingStep,
  ];

  /** The particulars s.1 ERA 1996 requires — the short-form document's clause set. */
  const PARTICULARS_ONLY = [
    "interpretation", "appointment", "probation", "duties", "place", "hours",
    "remuneration", "pension", "benefits", "holiday", "casual-holiday", "sickness",
    "family-leave", "termination", "casual-termination", "disciplinary", "collective", "training",
  ];

  function executionBlock(a, h) {
    const isCasual = a.engagement === "zero-hours" || a.engagement === "casual";
    return {
      intro:
        "Signed by the parties on the date first written above. By signing, each party confirms that they have read and accept these terms.",
      blocks: [
        {
          role: `For and on behalf of ${h.orBlank(a.employerName, "EMPLOYER NAME")}`,
          lines: [
            `Signature:  ......................................................`,
            `Name:  ${h.orBlank(a.signatoryName, "NAME")}`,
            `Position:  ${h.orBlank(a.signatoryPosition, "POSITION")}`,
            `Date:  ${a.signDate ? h.fmtDate(a.signDate) : "......................................"}`,
          ],
        },
        {
          role: isCasual ? "The Individual" : "The Employee",
          lines: [
            `Signature:  ......................................................`,
            `Name:  ${h.orBlank(a.employeeName, "NAME")}`,
            `Date:  ${a.signDate ? h.fmtDate(a.signDate) : "......................................"}`,
          ],
        },
      ],
    };
  }

  function employmentTemplate(slug, docTitle, engagement, options) {
    const opts = options || {};
    let clauses = UK._employmentClauses;
    if (opts.clauseIds) clauses = clauses.filter((c) => opts.clauseIds.includes(c.id));
    if (opts.extraClauses) {
      // Director clauses sit immediately after the appointment clause, where a
      // reader expects to find the office they are being appointed to.
      const index = clauses.findIndex((c) => c.id === "appointment") + 1;
      clauses = clauses.slice(0, index).concat(opts.extraClauses, clauses.slice(index));
    }

    return {
      slug,
      docTitle,
      fixed: Object.assign({ engagement }, opts.fixed),
      steps: opts.steps || EMPLOYMENT_STEPS,
      clauses,
      preamble: [
        (a, h) =>
          `This Agreement is dated ${a.signDate ? h.fmtDate(a.signDate) : "[DATE]"} and is made between ${h.orBlank(
            a.employerName,
            "EMPLOYER NAME"
          )} ("the Company") and ${h.orBlank(a.employeeName, "NAME")} ("${
            engagement === "zero-hours" || engagement === "casual" ? "the Individual" : "the Employee"
          }").`,
      ],
      execution: executionBlock,
    };
  }

  const REGISTRY = {
    "employment-contract": employmentTemplate("employment-contract", "Contract of Employment", "permanent"),
    "fixed-term-contract": employmentTemplate("fixed-term-contract", "Fixed-Term Contract of Employment", "fixed-term"),
    "part-time-contract": employmentTemplate("part-time-contract", "Part-Time Contract of Employment", "part-time", {
      fixed: { weeklyHours: "22.5", daysPerWeek: "3" },
    }),
    "zero-hours-contract": employmentTemplate("zero-hours-contract", "Zero Hours Agreement", "zero-hours"),
    "casual-worker-agreement": employmentTemplate("casual-worker-agreement", "Casual Worker Agreement", "casual"),
    "apprenticeship-agreement": employmentTemplate("apprenticeship-agreement", "Apprenticeship Agreement", "apprenticeship"),
    "director-service-agreement": employmentTemplate(
      "director-service-agreement",
      "Director's Service Agreement",
      "permanent",
      {
        extraClauses: directorClauses,
        fixed: { noticeBasis: "fixed", noticeWeeks: "26", restrictions: true, restrictNonCompete: true, gardenLeave: true },
      }
    ),
    "statement-of-particulars": employmentTemplate(
      "statement-of-particulars",
      "Written Statement of Employment Particulars",
      "permanent",
      {
        clauseIds: PARTICULARS_ONLY,
        steps: [S.partiesStep, S.roleStep, S.placeStep, S.hoursStep, S.payStep, S.pensionStep, S.holidayStep, S.absenceStep, S.governanceStep, S.signingStep],
      }
    ),
  };

  UK.getBuilderTemplate = function (slug) {
    return REGISTRY[slug] || null;
  };
  UK._registry = REGISTRY;
})(window);

/* Consultancy agreement and job offer letter — separate question sets. */
(function (global) {
  "use strict";

  const UK = global.UK;
  const LAW_NAME = UK._helpers.LAW_NAME;
  const COURTS = UK._helpers.COURTS;

  const consultancySteps = [
    {
      id: "parties",
      title: "The parties",
      blurb: "Who is buying the services, and who is supplying them.",
      questions: [
        { id: "clientName", label: "Client's full legal name", type: "text", required: true, placeholder: "Northgate Joinery Limited" },
        { id: "clientAddress", label: "Client's address", type: "textarea", required: true },
        {
          id: "supplierType",
          label: "The consultant contracts as",
          type: "radio",
          required: true,
          options: [
            { value: "individual", label: "An individual sole trader" },
            { value: "company", label: "A limited company (personal service company)" },
          ],
          default: "individual",
        },
        { id: "consultantName", label: "Consultant's name", type: "text", required: true },
        {
          id: "consultantCompany",
          label: "Consultant's company name and number",
          type: "text",
          required: true,
          when: { field: "supplierType", op: "eq", value: "company" },
          placeholder: "Raman Consulting Ltd, company number 11223344",
        },
        { id: "consultantAddress", label: "Consultant's address", type: "textarea", required: true },
      ],
    },
    {
      id: "services",
      title: "The services",
      blurb: "What is being supplied, and on what timescale.",
      questions: [
        { id: "services", label: "Description of the services", type: "textarea", required: true, placeholder: "Design and delivery of a production planning system, including specification, build, testing and handover." },
        { id: "deliverables", label: "Deliverables", type: "textarea", placeholder: "A working system deployed to the Client's environment, source code, and written handover documentation." },
        { id: "startDate", label: "Start date", type: "date", required: true },
        {
          id: "termBasis",
          label: "The agreement runs",
          type: "radio",
          options: [
            { value: "date", label: "Until a fixed end date" },
            { value: "completion", label: "Until the services are complete" },
            { value: "rolling", label: "Until terminated on notice" },
          ],
          default: "completion",
        },
        { id: "endDate", label: "End date", type: "date", required: true, when: { field: "termBasis", op: "eq", value: "date" } },
        {
          id: "timeCommitment",
          label: "Expected time commitment",
          type: "text",
          placeholder: "approximately three days a week",
          help: "Keep this indicative. A fixed pattern of set hours points towards employment rather than a contract for services.",
        },
      ],
    },
    {
      id: "fees",
      title: "Fees",
      questions: [
        {
          id: "feeBasis",
          label: "Fees are charged",
          type: "radio",
          options: [
            { value: "daily", label: "At a daily rate" },
            { value: "hourly", label: "At an hourly rate" },
            { value: "fixed", label: "As a fixed project fee" },
            { value: "milestone", label: "Against milestones" },
          ],
          default: "daily",
        },
        { id: "feeAmount", label: "Rate or fee (£)", type: "money", required: true, placeholder: "550" },
        { id: "milestones", label: "Milestones and amounts", type: "textarea", required: true, when: { field: "feeBasis", op: "eq", value: "milestone" } },
        {
          id: "invoiceFrequency",
          label: "Invoicing",
          type: "select",
          options: [
            { value: "monthly", label: "Monthly in arrears" },
            { value: "fortnightly", label: "Fortnightly" },
            { value: "completion", label: "On completion" },
            { value: "milestone", label: "On reaching each milestone" },
          ],
          default: "monthly",
        },
        { id: "paymentDays", label: "Payment terms (days from invoice)", type: "number", default: "30", min: 0, max: 120 },
        { id: "vat", label: "Fees are exclusive of VAT", type: "toggle", default: true },
        { id: "expensesPolicy", label: "The Client reimburses pre-approved expenses", type: "toggle", default: true },
      ],
    },
    {
      id: "status",
      title: "Status and tax",
      blurb: "The clauses that keep the relationship a supply of services rather than employment.",
      questions: [
        {
          id: "substitution",
          label: "Include a right of substitution",
          type: "toggle",
          default: true,
          help: "A genuine, unfettered right to send a suitably qualified substitute is one of the strongest indicators of self-employment.",
        },
        { id: "ownEquipment", label: "The consultant uses their own equipment", type: "toggle", default: true },
        { id: "noMutuality", label: "State that there is no obligation to offer or accept work", type: "toggle", default: true },
        {
          id: "ir35",
          label: "Include an IR35 / off-payroll status warranty and indemnity",
          type: "toggle",
          default: true,
          help: "Where the client is a medium or large business, it — not the consultant — is responsible for determining status and may carry the PAYE liability.",
        },
        { id: "insurance", label: "Require the consultant to hold insurance", type: "toggle", default: true },
        { id: "insuranceAmount", label: "Professional indemnity cover (£)", type: "money", default: "1000000", when: { field: "insurance", op: "truthy" } },
      ],
    },
    {
      id: "protection",
      title: "Confidentiality, IP and restrictions",
      questions: [
        { id: "confidentiality", label: "Include a confidentiality clause", type: "toggle", default: true },
        { id: "ipAssignment", label: "Assign intellectual property to the client", type: "toggle", default: true },
        {
          id: "ipOnPayment",
          label: "IP transfers only once the fees are paid",
          type: "toggle",
          default: true,
          when: { field: "ipAssignment", op: "truthy" },
        },
        { id: "dataProtection", label: "Include a data protection clause", type: "toggle", default: true },
        { id: "restrictions", label: "Include post-termination restrictions", type: "toggle" },
        {
          id: "restrictionMonths",
          label: "Restriction period",
          type: "select",
          when: { field: "restrictions", op: "truthy" },
          options: [
            { value: "3", label: "3 months" },
            { value: "6", label: "6 months" },
            { value: "12", label: "12 months" },
          ],
          default: "6",
        },
      ],
    },
    {
      id: "ending",
      title: "Ending the agreement",
      questions: [
        {
          id: "noticeWeeks",
          label: "Notice either party must give",
          type: "select",
          options: [
            { value: "0", label: "No notice — either party may end it immediately" },
            { value: "2", label: "2 weeks" },
            { value: "4", label: "4 weeks" },
            { value: "13", label: "3 months" },
          ],
          default: "4",
        },
        { id: "governingLaw", label: "Governing law", type: "select", options: [
          { value: "ew", label: "England and Wales" },
          { value: "scotland", label: "Scotland" },
          { value: "ni", label: "Northern Ireland" },
        ], default: "ew" },
        { id: "signatoryName", label: "Signing for the client — name", type: "text" },
        { id: "signatoryPosition", label: "Position", type: "text" },
        { id: "signDate", label: "Date of the agreement", type: "date" },
      ],
    },
  ];

  const FEE_BASIS = {
    daily: (a, h) => `${h.fmtMoney(a.feeAmount)} for each day worked`,
    hourly: (a, h) => `${h.fmtMoney(a.feeAmount)} for each hour worked`,
    fixed: (a, h) => `a fixed fee of ${h.fmtMoney(a.feeAmount)} for the Services`,
    milestone: (a, h) => `fees payable against milestones, totalling ${h.fmtMoney(a.feeAmount)}`,
  };

  const consultancyClauses = [
    {
      id: "appointment",
      heading: "Appointment and term",
      paras: [
        (a, h) =>
          `The Client engages the Consultant to supply the Services described in this Agreement, and the Consultant agrees to supply them, from ${h.fmtDate(a.startDate)}.`,
        (a, h) => {
          if (a.termBasis === "date") return `This Agreement continues until ${h.fmtDate(a.endDate)} unless terminated earlier in accordance with its terms.`;
          if (a.termBasis === "completion") return `This Agreement continues until the Services are complete unless terminated earlier in accordance with its terms.`;
          return `This Agreement continues until terminated by either party in accordance with its terms.`;
        },
        (a, h) =>
          a.supplierType === "company"
            ? `The Services are supplied by ${h.orBlank(a.consultantCompany, "CONSULTANT COMPANY")} ("the Consultant"), which will make ${h.orBlank(a.consultantName, "NAME")} available to perform them.`
            : `The Services are supplied by ${h.orBlank(a.consultantName, "CONSULTANT NAME")} ("the Consultant") in business on their own account.`,
      ],
    },
    {
      id: "services",
      heading: "The Services",
      paras: [
        (a, h) => `The Consultant will supply the following services: ${h.orBlank(String(a.services || "").replace(/\s+/g, " ").trim(), "DESCRIPTION OF SERVICES")}`,
        { when: { field: "deliverables", op: "truthy" }, text: (a) => `The Consultant will provide the following deliverables: ${String(a.deliverables).replace(/\s+/g, " ").trim()}` },
        (a) =>
          `The Consultant will supply the Services with reasonable skill and care, to the standard reasonably expected of an experienced provider of services of that kind, and in compliance with all applicable law.`,
        {
          when: { field: "timeCommitment", op: "truthy" },
          text: (a) =>
            `The Services are expected to require ${a.timeCommitment}, but the Consultant decides how, when and where the Services are performed, subject only to any deadline or site requirement inherent in them.`,
        },
        {
          when: { field: "ownEquipment", op: "truthy" },
          text: () => `The Consultant provides their own equipment and materials, except where the nature of the Services requires access to the Client's systems or premises.`,
        },
      ],
    },
    {
      id: "status",
      heading: "Status",
      paras: [
        () =>
          `The Consultant is an independent contractor and not an employee, worker or agent of the Client. Nothing in this Agreement creates a relationship of employment, partnership or agency between the parties.`,
        {
          when: { field: "noMutuality", op: "truthy" },
          text: () =>
            `The Client is under no obligation to offer any work to the Consultant and the Consultant is under no obligation to accept any work offered. The Consultant is free to supply services to others, provided doing so does not give rise to a conflict of interest.`,
        },
        {
          when: { field: "substitution", op: "truthy" },
          text: () =>
            `The Consultant may at any time provide a suitably qualified and experienced substitute to perform the Services, at the Consultant's own cost. The Consultant remains responsible for the Services and for the acts and omissions of any substitute, and will ensure that the substitute is bound by equivalent obligations of confidentiality and intellectual property.`,
        },
        () =>
          `The Consultant is responsible for their own income tax, National Insurance contributions and, where applicable, VAT, and will indemnify the Client against any claim by HM Revenue & Customs for tax or National Insurance arising from the Services, other than any liability arising from the Client's own status determination where the off-payroll working rules apply.`,
        {
          when: { field: "ir35", op: "truthy" },
          text: () =>
            `The parties intend that this engagement falls outside the off-payroll working rules in Chapter 10 of Part 2 of the Income Tax (Earnings and Pensions) Act 2003. Where the Client is a medium or large organisation it will carry out a status determination, take reasonable care in doing so, and give the Consultant a Status Determination Statement together with its reasons. The Consultant will provide the information the Client reasonably needs for that purpose, and either party may use the Client's disagreement process to challenge a determination.`,
        },
        () =>
          `The Consultant is not entitled to holiday pay, sick pay, pension contributions or any other benefit the Client provides to its employees or workers.`,
      ],
    },
    {
      id: "fees",
      heading: "Fees and payment",
      paras: [
        (a, h) => `The Client will pay the Consultant ${(FEE_BASIS[a.feeBasis] || FEE_BASIS.daily)(a, h)}${a.vat ? ", exclusive of VAT which is payable in addition where properly chargeable" : ", inclusive of VAT"}.`,
        { when: { field: "feeBasis", op: "eq", value: "milestone" }, text: (a) => `Milestones and the amounts payable on reaching them are: ${String(a.milestones || "").replace(/\s+/g, " ").trim()}` },
        (a, h) => {
          const map = { monthly: "monthly in arrears", fortnightly: "fortnightly", completion: "on completion of the Services", milestone: "on reaching each milestone" };
          return `The Consultant will invoice ${map[a.invoiceFrequency] || "monthly in arrears"}. The Client will pay each correctly rendered invoice within ${h.orBlank(a.paymentDays, "30")} days of receipt.`;
        },
        () =>
          `The Client may withhold payment of any amount it disputes in good faith, provided it notifies the Consultant of the dispute and the reason for it within ten business days of receiving the invoice, and pays the undisputed balance when due.`,
        () =>
          `Late payment carries interest and compensation under the Late Payment of Commercial Debts (Interest) Act 1998.`,
        {
          when: { field: "expensesPolicy", op: "truthy" },
          text: () => `The Client will reimburse expenses reasonably incurred in supplying the Services, where approved in writing in advance and supported by receipts.`,
        },
      ],
    },
    {
      id: "insurance",
      heading: "Insurance",
      when: { field: "insurance", op: "truthy" },
      paras: [
        (a, h) =>
          `The Consultant will maintain professional indemnity insurance of not less than ${h.fmtMoney(a.insuranceAmount)} for each claim, together with public liability and, where it employs anyone, employers' liability insurance, for the term of this Agreement and for six years afterwards, and will produce evidence of that cover on request.`,
      ],
    },
    {
      id: "confidentiality",
      heading: "Confidentiality",
      when: { field: "confidentiality", op: "truthy" },
      paras: [
        () =>
          `The Consultant will keep confidential all information about the Client's business, clients and affairs that comes to them in connection with the Services, will use it only for the purpose of supplying the Services, and will not disclose it to any person except a substitute or subcontractor bound by equivalent obligations.`,
        () =>
          `This obligation continues after the end of this Agreement and does not apply to information that is public otherwise than through a breach of it, or whose disclosure is required by law or a regulator.`,
      ],
    },
    {
      id: "ip",
      heading: "Intellectual property",
      when: { field: "ipAssignment", op: "truthy" },
      paras: [
        (a) =>
          `The Consultant assigns to the Client, with full title guarantee, all intellectual property rights in the deliverables and in anything else created in the course of supplying the Services${
            a.ipOnPayment ? ", such assignment taking effect on payment in full of the fees due for the work in which those rights subsist" : ""
          }.`,
        () =>
          `The Consultant waives all moral rights in that material to the fullest extent permitted by law, and will execute any document the Client reasonably requires to give it the full benefit of this clause.`,
        () =>
          `Where the deliverables incorporate any pre-existing material owned by the Consultant, the Consultant grants the Client a perpetual, irrevocable, worldwide, royalty-free licence to use that material as part of the deliverables.`,
        () =>
          `The Consultant warrants that the deliverables will not infringe the intellectual property rights of any third party, and will indemnify the Client against any claim that they do.`,
      ],
    },
    {
      id: "data",
      heading: "Data protection",
      when: { field: "dataProtection", op: "truthy" },
      paras: [
        () =>
          `Each party will comply with the UK General Data Protection Regulation and the Data Protection Act 2018 in respect of any personal data processed in connection with this Agreement.`,
        () =>
          `Where the Consultant processes personal data on the Client's behalf, they do so only on the Client's documented instructions, will apply appropriate technical and organisational security measures, will impose equivalent obligations on any subprocessor, will assist the Client with data subject requests and breach notification, and will delete or return the data at the end of the engagement.`,
      ],
    },
    {
      id: "restrictions",
      heading: "Restrictions",
      when: { field: "restrictions", op: "truthy" },
      paras: [
        (a, h) =>
          `For ${h.orBlank(a.restrictionMonths, "6")} months after this Agreement ends, the Consultant will not solicit or entice away from the Client any person who was employed or engaged by the Client in connection with the Services, or any client of the Client with whom the Consultant dealt in supplying the Services.`,
        () =>
          `This restriction is agreed to be reasonable and no wider than is necessary to protect the Client's legitimate business interests. If any part of it is held to be unenforceable, the remainder continues to apply.`,
      ],
    },
    {
      id: "termination",
      heading: "Termination",
      paras: [
        (a, h) => {
          const weeks = String(a.noticeWeeks ?? "4");
          if (weeks === "0") return `Either party may terminate this Agreement at any time with immediate effect by written notice to the other.`;
          const label = { "2": "two weeks", "4": "four weeks", "13": "three months" }[weeks] || `${weeks} weeks`;
          return `Either party may terminate this Agreement by giving ${label}' written notice to the other.`;
        },
        () =>
          `Either party may terminate this Agreement immediately by written notice if the other commits a material breach that is incapable of remedy, or fails to remedy a remediable material breach within fourteen days of being required to do so, or becomes insolvent.`,
        () =>
          `On termination the Consultant will deliver up all of the Client's property and confidential information, and the Client will pay for Services properly supplied up to the termination date. The clauses dealing with confidentiality, intellectual property, insurance and restrictions survive termination.`,
      ],
    },
    {
      id: "general",
      heading: "General",
      paras: [
        () =>
          `This Agreement sets out the whole agreement between the parties in relation to its subject matter and replaces all previous arrangements between them relating to it.`,
        () => `No variation is effective unless it is in writing and signed by both parties.`,
        () =>
          `The Consultant may not assign or subcontract this Agreement without the Client's written consent, except by exercising any right of substitution given in it.`,
        () =>
          `A person who is not a party to this Agreement has no right under the Contracts (Rights of Third Parties) Act 1999 to enforce any of its terms.`,
        (a) =>
          `This Agreement, and any dispute arising out of or in connection with it, is governed by the law of ${
            LAW_NAME[a.governingLaw] || "England and Wales"
          }, and the parties submit to the exclusive jurisdiction of ${COURTS[a.governingLaw] || "the courts of England and Wales"}.`,
      ],
    },
  ];

  UK._registry["consultancy-agreement"] = {
    slug: "consultancy-agreement",
    docTitle: "Consultancy Agreement",
    fixed: { engagement: "consultancy" },
    steps: consultancySteps,
    clauses: consultancyClauses,
    preamble: [
      (a, h) =>
        `This Agreement is dated ${a.signDate ? h.fmtDate(a.signDate) : "[DATE]"} and is made between ${h.orBlank(
          a.clientName,
          "CLIENT NAME"
        )} of ${h.orBlank((a.clientAddress || "").replace(/\n/g, ", "), "CLIENT ADDRESS")} ("the Client") and ${
          a.supplierType === "company"
            ? h.orBlank(a.consultantCompany, "CONSULTANT COMPANY")
            : h.orBlank(a.consultantName, "CONSULTANT NAME")
        } of ${h.orBlank((a.consultantAddress || "").replace(/\n/g, ", "), "CONSULTANT ADDRESS")} ("the Consultant").`,
    ],
    execution: (a, h) => ({
      intro: "Signed by the parties on the date first written above.",
      blocks: [
        {
          role: `For and on behalf of ${h.orBlank(a.clientName, "CLIENT NAME")}`,
          lines: [
            `Signature:  ......................................................`,
            `Name:  ${h.orBlank(a.signatoryName, "NAME")}`,
            `Position:  ${h.orBlank(a.signatoryPosition, "POSITION")}`,
            `Date:  ${a.signDate ? h.fmtDate(a.signDate) : "......................................"}`,
          ],
        },
        {
          role: "The Consultant",
          lines: [
            `Signature:  ......................................................`,
            `Name:  ${h.orBlank(a.consultantName, "NAME")}`,
            `Date:  ${a.signDate ? h.fmtDate(a.signDate) : "......................................"}`,
          ],
        },
      ],
    }),
  };
})(window);

/* Job offer letter — a letter rather than an agreement, so it renders without
   clause numbering and with its own execution block. */
(function (global) {
  "use strict";

  const UK = global.UK;

  const offerSteps = [
    {
      id: "parties",
      title: "Employer and candidate",
      questions: [
        { id: "employerName", label: "Employer's name", type: "text", required: true },
        { id: "employerAddress", label: "Employer's address", type: "textarea", required: true },
        { id: "employeeName", label: "Candidate's name", type: "text", required: true },
        { id: "employeeAddress", label: "Candidate's address", type: "textarea", required: true },
        { id: "letterDate", label: "Date of the letter", type: "date" },
      ],
    },
    {
      id: "offer",
      title: "The offer",
      questions: [
        { id: "jobTitle", label: "Job title", type: "text", required: true },
        { id: "reportsTo", label: "Reports to", type: "text" },
        { id: "startDate", label: "Proposed start date", type: "date", required: true },
        { id: "workplaceAddress", label: "Place of work", type: "textarea", required: true },
        { id: "salary", label: "Annual salary (£)", type: "money", required: true },
        { id: "weeklyHours", label: "Weekly hours", type: "number", default: "37.5", step: "0.5" },
        { id: "holidayDays", label: "Holiday entitlement (days, including bank holidays)", type: "number", default: "28" },
        { id: "probationMonths", label: "Probationary period (months)", type: "select", options: [
          { value: "0", label: "None" },
          { value: "3", label: "3 months" },
          { value: "6", label: "6 months" },
        ], default: "3" },
        { id: "noticeText", label: "Notice period once employment begins", type: "text", default: "one month" },
      ],
    },
    {
      id: "conditions",
      title: "Conditions",
      blurb: "An offer that is conditional needs to say what the conditions are before the candidate resigns from anything.",
      questions: [
        {
          id: "conditions",
          label: "The offer is conditional on",
          type: "multi",
          options: [
            { value: "rtw", label: "Proof of the right to work in the UK" },
            { value: "references", label: "Satisfactory references" },
            { value: "dbs", label: "A satisfactory DBS check" },
            { value: "medical", label: "A satisfactory health questionnaire" },
            { value: "qualifications", label: "Evidence of qualifications" },
          ],
          default: ["rtw", "references"],
        },
        { id: "replyBy", label: "Reply by", type: "date" },
        { id: "signatoryName", label: "Letter signed by — name", type: "text" },
        { id: "signatoryPosition", label: "Position", type: "text" },
      ],
    },
  ];

  const CONDITION_LABELS = {
    rtw: "your producing documents proving your right to work in the United Kingdom, which we must see before you start",
    references: "our receipt of references we consider satisfactory",
    dbs: "a satisfactory disclosure from the Disclosure and Barring Service",
    medical: "your completing a health questionnaire to our reasonable satisfaction",
    qualifications: "your producing evidence of the qualifications you have told us about",
  };

  const offerClauses = [
    {
      id: "offer",
      heading: "Our offer",
      paras: [
        (a, h) =>
          `We are pleased to offer you the position of ${h.orBlank(a.jobTitle, "JOB TITLE")} with ${h.orBlank(a.employerName, "EMPLOYER NAME")}${
            a.reportsTo ? `, reporting to ${a.reportsTo}` : ""
          }. We would like you to start on ${h.fmtDate(a.startDate)}.`,
        (a, h) =>
          `Your salary will be ${h.fmtMoney(a.salary)} a year, paid monthly in arrears. You will normally work ${h.orBlank(
            a.weeklyHours,
            "37.5"
          )} hours a week at ${h.orBlank((a.workplaceAddress || "").replace(/\n/g, ", "), "PLACE OF WORK")}.`,
        (a, h) =>
          `Your holiday entitlement will be ${h.orBlank(a.holidayDays, "28")} days a year including bank holidays.${
            a.probationMonths && a.probationMonths !== "0"
              ? ` The first ${a.probationMonths} months will be probationary.`
              : ""
          } Once your employment begins, the notice either of us must give will be ${h.orBlank(a.noticeText, "one month")}.`,
        () =>
          `These are the headline terms only. Your full terms will be set out in a contract of employment, which we will send you separately and which you should read before you sign it. Where anything in this letter differs from that contract, the contract prevails.`,
      ],
    },
    {
      id: "conditions",
      heading: "Conditions of the offer",
      when: { field: "conditions", op: "truthy" },
      paras: [
        (a, h) => {
          const labels = (a.conditions || []).map((k) => CONDITION_LABELS[k]).filter(Boolean);
          if (labels.length === 0) return "";
          return `This offer is conditional on ${h.list(labels)}. If any condition is not met to our satisfaction, we may withdraw the offer or end your employment if it has already started.`;
        },
        () =>
          `We recommend that you do not resign from your current role, or make any other commitment, until we have confirmed in writing that every condition has been met.`,
      ],
    },
    {
      id: "acceptance",
      heading: "Accepting the offer",
      paras: [
        (a, h) =>
          `If you would like to accept, please sign and return a copy of this letter${
            a.replyBy ? ` by ${h.fmtDate(a.replyBy)}` : ""
          }. This letter is not a contract of employment and does not by itself create one.`,
        () => `We are looking forward to working with you.`,
      ],
    },
  ];

  UK._registry["offer-letter"] = {
    slug: "offer-letter",
    docTitle: "Job Offer Letter",
    letter: true,
    fixed: { engagement: "offer" },
    steps: offerSteps,
    clauses: offerClauses,
    preamble: [
      (a, h) => `${h.orBlank(a.employerName, "EMPLOYER NAME")}\n${h.orBlank(a.employerAddress, "EMPLOYER ADDRESS")}`,
      (a, h) => (a.letterDate ? h.fmtDate(a.letterDate) : "[DATE]"),
      (a, h) => `${h.orBlank(a.employeeName, "CANDIDATE NAME")}\n${h.orBlank(a.employeeAddress, "CANDIDATE ADDRESS")}`,
      (a, h) => `Dear ${(h.orBlank(a.employeeName, "CANDIDATE NAME").split(" ")[0]) || "Sir or Madam"},`,
    ],
    execution: (a, h) => ({
      intro: "Yours sincerely,",
      blocks: [
        {
          role: "",
          lines: [
            `......................................................`,
            `${h.orBlank(a.signatoryName, "NAME")}`,
            `${h.orBlank(a.signatoryPosition, "POSITION")}`,
            `For and on behalf of ${h.orBlank(a.employerName, "EMPLOYER NAME")}`,
          ],
        },
        {
          role: "I accept the offer set out in this letter on the terms stated in it.",
          lines: [
            `Signature:  ......................................................`,
            `Name:  ${h.orBlank(a.employeeName, "NAME")}`,
            `Date:  ......................................`,
          ],
        },
      ],
    }),
  };
})(window);

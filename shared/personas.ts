// Who is using Pippa, and why. Drives the labels in "Your case" and tells the model how to tailor its read.
import type { CaseChallenge, CaseProfile } from "./types";

export type PersonaKey = "organisation" | "researcher" | "student" | "founder" | "individual";

export interface Persona {
  key: PersonaKey;
  label: string;
  blurb: string;
  section: string; // heading above the profile fields
  fields: Record<keyof Omit<CaseProfile, "who" | "purpose">, [string, string]>; // label, hint
  internalHint: string[]; // what to upload for "Internal resources"
  amountHint: string;
  /** One sample answer per field, shown behind "See an example". Invented, at the level of detail Pippa needs. */
  samples: Record<"office" | "programmes" | "served" | "scale" | "problem" | "mission" | "stakeholders" | "value", string>;
  challengeTitle: string;
  challenge: Record<keyof CaseChallenge, [string, string]>; // label, hint
  examples: string; // case title placeholder
}

export const PERSONAS: Persona[] = [
  {
    key: "organisation",
    label: "An organisation",
    blurb: "Non-profit, NGO, charity or programme team",
    section: "Your organisation",
    fields: {
      office: ["Organisation", "Name, and which office or team you're in"],
      programmes: ["Programmes", "What you run: schools, clinics, family support, youth employment…"],
      served: ["Who you serve", "Who benefits, and roughly how many"],
      scale: ["Scale", "Annual budget, staff, number of sites"],
    },
    internalHint: ["Asset registers (buildings, vehicles, equipment, land)", "Budgets with line items", "Programme reports (activities, capacity, reach)", "Raw exports are fine. Remove names of children, families and staff."],
    amountHint: "e.g. 80,000 covers one site; 200,000 covers all four",
    samples: {
      office: "National office, Ghana. Programme team for our four schools across the country.",
      programmes: "Four primary and junior high schools (2,400 pupils), a family support programme for 600 households, and a youth employability course.",
      served: "Children aged 4 to 15 from low-income families, about 1,200 at the Kumasi school, plus 300 caregivers in the family programme.",
      scale: "Annual budget USD 2.1m, 140 staff, four sites. About 70% of income comes from three institutional donors.",
      problem: "Our Kumasi school runs at twice its capacity: 48 pupils per class against a national standard of 25. We turn away around 200 children a year.",
      mission: "Build a six-classroom block on land we already own, and rent the hall out for teacher training to cover part of the running costs.",
      stakeholders: "Parents and pupils; the district education office, which wants more places; two local builders; current donors, who only fund running costs; a nearby private school that may see us as competition.",
      value: "We own the land and already run a proven school, so every dollar goes into classrooms instead of set-up. The district has said it will post teachers if we build.",
    },
    challengeTitle: "The challenge",
    challenge: {
      problem: ["Problem statement", "What, specifically, are you trying to solve?"],
      mission: ["Mission statement", "How are you proposing to solve it?"],
      stakeholders: ["Stakeholders", "Everyone affected, everyone you could turn to for resources or partnership, and anyone who might resist."],
      value: ["Value proposition", "Why your approach is the one that will convince them."],
    },
    examples: "e.g. Kumasi classroom block",
  },
  {
    key: "researcher",
    label: "A researcher or academic",
    blurb: "Research grants, fellowships, book and writing projects",
    section: "You and your research",
    fields: {
      office: ["Institution and field", "University or institute, department, discipline"],
      programmes: ["Current project", "The book, article, edited volume or study you want funded, and how far along it is"],
      served: ["Audiences and outlets", "Who reads or uses the work: scholars, policymakers, publishers, journals"],
      scale: ["Track record", "Books, articles, previous grants and fellowships, career stage"],
    },
    internalHint: ["Your CV or publication list", "Your institution's research funding, sabbatical or matched-funding pages", "Grants, data, archives, equipment or lab time you already have", "Teaching, speaking or consulting you could offer in kind"],
    amountHint: "e.g. 15,000 covers six months of archive work; 40,000 a full year of writing",
    samples: {
      office: "Associate professor, Department of International Relations, a research university in the UK. Field: security studies and political theory.",
      programmes: "A monograph on how states use religious authority to shore up their sovereignty. Four of eight chapters drafted; archive work in two countries still to do.",
      served: "Scholars of international relations and religion, policy readers in foreign ministries, and a university press that has asked for a full proposal.",
      scale: "Two books (one with a university press), twelve peer-reviewed articles, a previous research council grant of GBP 90,000, and one visiting fellowship.",
      problem: "Why do secular states lean on religious institutions when their authority is challenged? Existing work treats this as cultural. No one has traced it as a deliberate tool of statecraft.",
      mission: "A comparative historical study of three states, using foreign ministry archives and interviews with former officials. The argument: religious authority is a reserve of legitimacy that states draw on in a crisis.",
      stakeholders: "My university (sabbatical approved for 2027), the press editor, archive staff in two countries, a co-author for one chapter, and a former ambassador who has agreed to be interviewed.",
      value: "The first systematic account of religion as an instrument of sovereignty, arriving as several governments revive state-church ties. A natural fit for funders interested in public understanding of religion and politics.",
    },
    challengeTitle: "The work",
    challenge: {
      problem: ["The question", "What does the work answer, and why is it still open?"],
      mission: ["Your approach", "Method, sources and argument, in a few lines."],
      stakeholders: ["Who's involved", "Co-authors, host institution, publishers, archives, and anyone whose support you need."],
      value: ["Why it matters now", "The contribution, and why a funder would want their name on it."],
    },
    examples: "e.g. Book on sovereignty and religion",
  },
  {
    key: "student",
    label: "A student",
    blurb: "Scholarships, study, travel or thesis grants",
    section: "You and your studies",
    fields: {
      office: ["Institution and programme", "Where you study, the degree and year"],
      programmes: ["What you're working on", "Your studies, thesis or project"],
      served: ["What the money is for", "Tuition, fieldwork, travel, a conference, equipment"],
      scale: ["Your record", "Grades, awards, experience, anything that sets you apart"],
    },
    internalHint: ["Your CV", "Your university's funding, travel and hardship pages", "Any scholarship or award letters", "Skills you could trade: teaching, research assistance, translation"],
    amountHint: "e.g. 3,000 covers fieldwork travel; 12,000 a full semester",
    samples: {
      office: "Second-year master's student in Public Policy at a university in the Netherlands.",
      programmes: "A thesis on how informal water vendors in Nairobi set their prices, using interviews and daily price data.",
      served: "Six weeks of fieldwork in Nairobi: flights, accommodation, a research assistant and translation. About EUR 4,500 in total.",
      scale: "Distinction-level grades, one co-authored working paper, and two years at a water NGO before my degree.",
      problem: "I want to spend six weeks in Nairobi in summer 2027 collecting the data my thesis depends on.",
      mission: "Interviews with 40 vendors in three settlements, plus daily price tracking with a local research assistant. My supervisor has approved the method and the ethics review.",
      stakeholders: "My supervisor, the department's research office, a Nairobi NGO that will introduce me to vendors, and two referees.",
      value: "I already know this sector and have a local partner ready, so the money buys data from day one.",
    },
    challengeTitle: "Your plan",
    challenge: {
      problem: ["What you want to do", "The study, project or opportunity, in a sentence or two."],
      mission: ["How you'll do it", "Where, when, and what it involves."],
      stakeholders: ["Who's backing you", "Supervisor, department, referees, partners."],
      value: ["Why you", "What makes you a strong candidate."],
    },
    examples: "e.g. Thesis fieldwork in Nairobi",
  },
  {
    key: "founder",
    label: "A social entrepreneur",
    blurb: "Starting or growing a venture with a mission",
    section: "Your venture",
    fields: {
      office: ["Venture", "Name, where you're based, legal form if any"],
      programmes: ["What it does", "The product or service, and how it makes money"],
      served: ["Who it serves", "Customers and beneficiaries, and how many"],
      scale: ["Stage", "Revenue, team, traction, money raised so far"],
    },
    internalHint: ["Your financials or budget", "An asset or equipment list", "A pitch deck or one-pager", "Customer, partner or pilot data"],
    amountHint: "e.g. 50,000 gets a pilot running; 250,000 takes it to three cities",
    samples: {
      office: "A registered social enterprise in Kisumu, Kenya, founded in 2024.",
      programmes: "Solar-powered cold rooms that smallholder farmers rent by the crate. Income from rental fees and a small share of produce sales.",
      served: "320 smallholder farmers across two markets, most of them women selling fruit and vegetables.",
      scale: "USD 85,000 revenue last year, a team of nine, two cold rooms running, and USD 120,000 raised in grants so far.",
      problem: "Smallholders lose up to 40% of their produce before it sells, because they have nowhere cool to store it.",
      mission: "Pay-per-crate solar cold rooms at the market itself. Farmers keep produce fresh for up to two weeks and sell when prices improve.",
      stakeholders: "Farmers and market associations; the county government, which owns the market land; a solar supplier; two impact investors asking for traction data; middlemen, who may resist.",
      value: "Each room already covers its own costs, with paying customers. A third room in a new county would show the model travels.",
    },
    challengeTitle: "The venture",
    challenge: {
      problem: ["The problem", "Who has it, and how badly."],
      mission: ["Your solution", "What you do and how it makes money."],
      stakeholders: ["Who's involved", "Customers, partners, investors, and anyone who might resist."],
      value: ["Why you'll win", "What you have that others don't."],
    },
    examples: "e.g. Solar cold storage for smallholders",
  },
  {
    key: "individual",
    label: "An individual with a cause",
    blurb: "Community work, the arts, a personal project",
    section: "You and your work",
    fields: {
      office: ["About you", "Who you are and where you're based"],
      programmes: ["What you do", "The work, project or cause"],
      served: ["Who benefits", "The people or community it reaches"],
      scale: ["Track record", "What you've done so far, and with what support"],
    },
    internalHint: ["A CV or short bio", "A budget for the work, even a rough one", "Anything that shows what you've done so far", "Letters or messages of support"],
    amountHint: "e.g. 2,000 runs a season; 10,000 runs a full year",
    samples: {
      office: "Retired teacher in Leeds, UK, running a volunteer project from the local library.",
      programmes: "A weekly reading club for children aged 6 to 11, with volunteer readers and donated books.",
      served: "About 30 children a week, most from families new to the area.",
      scale: "Running for two years on GBP 1,200 of small donations, with 12 regular volunteers. The library provides the room for free.",
      problem: "Children who arrive mid-year with little English fall behind fast, and school support has long waiting lists.",
      mission: "Grow from one session a week to three, buy graded readers, and train volunteers to work with children learning English.",
      stakeholders: "Parents, the library, two primary schools that refer children, the volunteers, and the council, which runs the library.",
      value: "It already works and costs very little. A small grant would triple its reach with almost no overhead.",
    },
    challengeTitle: "Your cause",
    challenge: {
      problem: ["The need", "What you want to change, and for whom."],
      mission: ["What you'll do", "The work itself, in a few lines."],
      stakeholders: ["Who's involved", "People and groups who help, benefit, or might object."],
      value: ["Why it matters", "Why this, why you, why now."],
    },
    examples: "e.g. Neighbourhood reading club",
  },
];

export const PURPOSES = [
  "Fund a project or programme",
  "Core or running costs",
  "Research funding",
  "Book or writing project",
  "Fieldwork, archives or travel",
  "Fellowship or scholarship",
  "Start or grow a venture",
  "Partnership or in-kind support",
  "Something else",
];

export function persona(key?: string): Persona {
  return PERSONAS.find((p) => p.key === key) ?? PERSONAS[0];
}

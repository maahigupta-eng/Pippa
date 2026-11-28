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

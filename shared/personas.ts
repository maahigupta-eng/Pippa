// Who is using Pippa, and why. Drives the labels in "Your case" and tells the model how to tailor its read.
import type { CaseProfile } from "./types";

export type PersonaKey = "organisation" | "researcher" | "student" | "founder" | "individual";

export interface Persona {
  key: PersonaKey;
  label: string;
  blurb: string;
  section: string; // heading above the profile fields
  fields: Record<keyof Omit<CaseProfile, "who" | "purpose">, [string, string]>; // label, hint
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
    examples: "e.g. Kumasi classroom block",
  },
  {
    key: "researcher",
    label: "A researcher or academic",
    blurb: "Research grants, fellowships, project funding",
    section: "You and your research",
    fields: {
      office: ["Institution and field", "University or institute, department, discipline"],
      programmes: ["Your research", "The question, the method, and how far along it is"],
      served: ["Who benefits", "Who uses or gains from the findings"],
      scale: ["Track record", "Career stage, publications, previous grants, collaborators"],
    },
    examples: "e.g. Fieldwork on informal water markets",
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
    examples: "e.g. Neighbourhood reading club",
  },
];

export const PURPOSES = [
  "Fund a project or programme",
  "Core or running costs",
  "Research funding",
  "Fellowship or scholarship",
  "Start or grow a venture",
  "Partnership or in-kind support",
  "Something else",
];

export function persona(key?: string): Persona {
  return PERSONAS.find((p) => p.key === key) ?? PERSONAS[0];
}

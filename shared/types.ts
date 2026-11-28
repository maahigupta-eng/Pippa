// Types shared by the front end and the Worker.

export type Tool = "funder" | "resources";

export type FileRole = "funder" | "org" | "internal";

export interface UploadedFile {
  name: string;
  role: FileRole;
  /** pdf and image go to the model as-is; text is extracted in the browser. */
  kind: "pdf" | "image" | "text";
  mediaType: string;
  /** base64 for pdf/image, plain text for text. */
  data: string;
}

export interface Need {
  purpose: string;
  amount: string;
  forms: string[];
  notes: string;
}

export interface CaseProfile {
  /** Who is using Pippa (see shared/personas.ts). Older cases have none and read as an organisation. */
  who?: string;
  /** Why they're here, e.g. "Research funding". */
  purpose?: string;
  office: string;
  programmes: string;
  served: string;
  scale: string;
}

export interface CaseChallenge {
  problem: string;
  mission: string;
  stakeholders: string;
  value: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  profile: CaseProfile;
  challenge: CaseChallenge;
  updated_at?: string;
}

export interface Answer {
  id: string;
  question: string;
  answer: string;
}

export interface AnalyzeRequest {
  tool: Tool;
  caseId?: string;
  need: Need;
  files: UploadedFile[];
  pasted: Partial<Record<FileRole, string>>;
  answers?: Answer[];
}

export interface ClarifyResult {
  doc_check: { name: string; looks_like: string }[];
  questions: { id: string; question: string; why: string }[];
  ready: boolean;
  safeguarding_flag?: string;
}

export type Verdict = "Pursue" | "Pursue narrowly" | "Hold" | "Don't pursue";
export type Level = "low" | "medium" | "high";

export interface FunderResult {
  funder_name: string;
  verdict: Verdict;
  confidence: Level;
  would_change_if: string;
  summary: string;
  scores: {
    material: { score: number; reason: string };
    symbolic: { score: number; reason: string };
    drift: { score: number; reason: string };
  };
  hard_checks: { check: string; status: "pass" | "fail" | "unclear"; note: string }[];
  what_funder_gets: string[];
  route_in: { route: string; why: string };
  positioning: string[];
  internal_leverage: string[];
  unverified: string[];
  next_step: { action: string; owner: string; within: string };
  questions_they_will_ask: string[];
  systems_change?: string;
}

export interface Opportunity {
  title: string;
  source: string;
  type: "human" | "material" | "project" | "saving";
  how: string;
  mission_risk: Level;
  effort: Level;
  confidence: Level;
  approval: string;
}

export interface ResourcesResult {
  document_type: string;
  document_summary: string;
  headline: string;
  opportunities: Opportunity[];
  top: {
    title: string;
    asset: string;
    model: string;
    who_pays: string;
    impact: string;
    first_step: string;
    approver: string;
  }[];
  leverage: string[];
  cautions: string[];
  unverified: string[];
  next_step: { action: string; owner: string; within: string };
}

export interface RunRecord {
  id: string;
  tool: Tool | "search";
  title: string;
  created_at: string;
  case_id?: string | null;
  need?: unknown;
  output?: FunderResult | ResourcesResult;
}

// ---------- Pippa Online (live search) ----------
export type Fit = "strong" | "good" | "stretch";
export interface SearchLead {
  title: string;
  funder: string;
  url: string;
  deadline: string;
  amount: string;
  eligibility: string;
  fit: Fit;
  why_fit: string;
  angle: string;
  check_first: string;
}
export interface SearchResult {
  summary: string;
  leads: SearchLead[];
  where_else: string[];
  next_step: { action: string; owner: string; within: string };
  searched_on: string;
  sources: { title: string; url: string }[];
}
export interface SearchRequest {
  caseId: string;
  focus: string;
  region: string;
}

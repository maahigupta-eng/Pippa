import { persona } from "../shared/personas";
import playbook from "./playbook.md";
import type { AnalyzeRequest, CaseRecord, Tool } from "../shared/types";

/** The user's case as plain lines, shared by every prompt. */
export function caseLines(kase: CaseRecord | null): string[] {
  if (!kase) return [];
  const p = persona(kase.profile.who);
  return [
    `THE CASE: "${kase.title}"`,
    `Who is asking: ${p.label} (${p.blurb})`,
    `Why they're here: ${kase.profile.purpose || "not given"}`,
    ...(["office", "programmes", "served", "scale"] as const).map((k) => `${p.fields[k][0]}: ${kase.profile[k] || "not given"}`),
    `Problem statement: ${kase.challenge.problem || "not given"}`,
    `Mission statement: ${kase.challenge.mission || "not given"}`,
    `Stakeholders: ${kase.challenge.stakeholders || "not given"}`,
    `Value proposition: ${kase.challenge.value || "not given"}`,
    "",
  ];
}

// ---------- Pippa Online: live search ----------

export const SEARCH_BRIEF = `MODE: PIPPA ONLINE (live search)

In this mode you may search the web. Use it to find funding opportunities that are open now or opening soon and that fit this user: grants, fellowships, scholarships, prizes, accelerators, research calls, in-kind programmes.

How to search:
- First, understand the case: who the user is, their field or topic, what the money is for, their geography and career or organisational stage. Build searches from that. For researchers and students, search by discipline, topic and career stage; include research councils, foundations, learned societies, university and regional schemes.
- Prefer the funder's own pages over aggregators. Open the call page when you can.
- Today's date is {TODAY}. Only include calls whose deadline is after today, or rolling, or opening soon. If you cannot confirm a deadline, say "Not stated".
- Check hard eligibility against the case (nationality, career stage, organisation type, geography). Drop clear mismatches.

What to return: 3 to 6 leads, best first. Be specific to this user: say what this funder wants from someone like them, and how they should position themselves. Apply the playbook: what the user can bring, the form of support, earmarking and reporting load, and mission drift.

Never invent a funder, URL, amount or deadline. If a field isn't on the page, write "Not stated". The decision to apply is the user's: give them what they need to decide.

Reply with only one JSON object, no prose before or after, in this shape:
{"summary": "under 40 words",
 "leads": [{"title": "name of the call", "funder": "who runs it", "url": "the call page", "deadline": "date or Rolling or Not stated", "amount": "range or Not stated", "eligibility": "who can apply, under 25 words", "fit": "strong | good | stretch", "why_fit": "under 30 words, tied to the case", "angle": "how this user should position, under 30 words", "check_first": "the one thing to confirm before applying, under 20 words"}],
 "where_else": ["up to 3 other places worth checking, each under 15 words"],
 "next_step": {"action": "one concrete next step, under 25 words", "owner": "You", "within": "a timeframe"}}`;

export function searchContent(kase: CaseRecord | null, focus: string, region: string): string {
  return [
    ...caseLines(kase),
    "WHAT TO SEARCH FOR",
    `Focus: ${focus || "Use the case: the topic and what the money is for."}`,
    `Geography: ${region || "Use the case."}`,
    "",
    "Search now, then reply with the JSON object only.",
  ].join("\n");
}

// ---------- System prompts ----------

const TOOL_BRIEF: Record<Tool, string> = {
  funder: `TASK: Funder Check.
Decide whether this funder is worth this office's time for the stated need, and how to approach it.
Work through: hard eligibility (geography, organisation type, open call vs invite-only, grant size vs need, deadline, instrument), material fit, symbolic fit, drift risk, earmarking and reporting load, acceptability, the best route in (direct, through an existing grantee or regranter, a collaborative, a corporate partnership), what the funder gains from working with the user, and how internal resources could be offered as co-financing or leverage.
Past grants are the best evidence of what a funder really funds. Weigh them above mission statements.`,
  resources: `TASK: Internal Resource Finder.
Read the organisation's internal document(s) and find idle, underused or repurposable resources that could meet the stated need, reduce the external ask, or serve as co-financing or collateral.
First identify what kind of document it is. Use the four internal resource types: human, material, project, saving.
For asset registers look at: land and buildings with low use, vehicles beyond programme needs, old equipment never disposed of, duplicates across sites, fully depreciated items still in use, and low disposal activity.
For budgets: recurring underspends, fixed costs serving few people, shared costs a partner could split, purchases that could be pooled.
For programme reports: capacity against reach, marketable staff skills, training that could be sold.
Every opportunity must cite where in the document it comes from. Flag mission and safeguarding risks.`,
};

export function systemPrompt(tool: Tool): string {
  return `${playbook}\n\n---\n\n${TOOL_BRIEF[tool]}`;
}

// ---------- User message ----------

type Block =
  | { type: "text"; text: string }
  | { type: "document"; source: { type: "base64"; media_type: string; data: string } | { type: "text"; media_type: "text/plain"; data: string }; title?: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

const ROLE_LABEL = { funder: "FUNDER MATERIAL", org: "ORGANISATION MATERIAL", internal: "INTERNAL DOCUMENT" } as const;

// Cap pasted or extracted text per item so one huge export can't blow up the bill.
const MAX_TEXT_CHARS = 120_000;
const clip = (s: string) => (s.length > MAX_TEXT_CHARS ? s.slice(0, MAX_TEXT_CHARS) + "\n[...truncated]" : s);

export function userContent(req: AnalyzeRequest, kase: CaseRecord | null, phase: "clarify" | "analyze"): Block[] {
  const blocks: Block[] = [];

  for (const f of req.files) {
    const title = `${ROLE_LABEL[f.role]}: ${f.name}`;
    if (f.kind === "pdf") {
      blocks.push({ type: "document", title, source: { type: "base64", media_type: "application/pdf", data: f.data } });
    } else if (f.kind === "image") {
      blocks.push({ type: "text", text: `[Image follows] ${title}` });
      blocks.push({ type: "image", source: { type: "base64", media_type: f.mediaType, data: f.data } });
    } else {
      blocks.push({ type: "document", title, source: { type: "text", media_type: "text/plain", data: clip(f.data) } });
    }
  }
  for (const role of ["funder", "org", "internal"] as const) {
    const t = req.pasted?.[role]?.trim();
    if (t) blocks.push({ type: "document", title: `${ROLE_LABEL[role]}: pasted text`, source: { type: "text", media_type: "text/plain", data: clip(t) } });
  }

  const lines: string[] = [...caseLines(kase)];
  const n = req.need;
  lines.push(
    "WHAT THEY NEED RIGHT NOW",
    `Purpose: ${n.purpose || "not given"}`,
    `Amount or range: ${n.amount || "not given"}`,
    `Forms of support they can accept: ${n.forms.length ? n.forms.join(", ") : "not given"}`,
    `Other notes: ${n.notes || "none"}`,
  );
  if (req.answers?.length) {
    lines.push("", "ANSWERS TO YOUR QUESTIONS");
    for (const a of req.answers) lines.push(`Q: ${a.question}\nA: ${a.answer || "(skipped)"}`);
  }
  lines.push(
    "",
    phase === "clarify"
      ? "Before analysing: say what each document looks like, then list only the questions whose answers would materially change your analysis (0 to 4). Do not ask what the documents already answer. If nothing important is missing, return no questions and ready = true. Respond only by calling the tool."
      : "Now produce the analysis. Ground every claim in the materials above. List fields are JSON arrays of plain strings: never wrap items in tags like <item> or <point>, and never put several items in one string. Respond only by calling the tool.",
  );
  blocks.push({ type: "text", text: lines.join("\n") });
  return blocks;
}

// ---------- Structured output schemas (Anthropic tool definitions) ----------

const str = (description: string) => ({ type: "string", description });
const level = (description: string) => ({ type: "string", enum: ["low", "medium", "high"], description });
const strList = (description: string) => ({ type: "array", items: { type: "string" }, description });

export const CLARIFY_TOOL = {
  name: "clarify",
  description: "Report what the documents look like and ask only the questions that would change the analysis.",
  input_schema: {
    type: "object",
    properties: {
      doc_check: {
        type: "array",
        items: { type: "object", properties: { name: str("File name or 'pasted text'"), looks_like: str("One line, e.g. 'Fixed asset register, 2008–2024, 81 items in 7 categories'") }, required: ["name", "looks_like"] },
      },
      questions: {
        type: "array",
        maxItems: 4,
        items: { type: "object", properties: { id: str("q1, q2..."), question: str("Short, specific question"), why: str("One line: what it changes") }, required: ["id", "question", "why"] },
      },
      ready: { type: "boolean", description: "True if analysis can proceed without answers" },
      safeguarding_flag: str("Only if documents contain personal data about children, families or staff; otherwise empty string"),
    },
    required: ["doc_check", "questions", "ready"],
  },
};

export const FUNDER_TOOL = {
  name: "funder_check",
  description: "Return the structured Funder Check.",
  input_schema: {
    type: "object",
    properties: {
      funder_name: str("Funder name only, as in the materials"),
      verdict: { type: "string", enum: ["Pursue", "Pursue narrowly", "Hold", "Don't pursue"] },
      confidence: level("Confidence in the verdict"),
      would_change_if: str("One short phrase, under 15 words"),
      summary: str("At most 2 short sentences (under 40 words), outcome first"),
      material_score: { type: "integer", minimum: 0, maximum: 100, description: "Material fit 0-100: does the substance line up?" },
      material_reason: str("One sentence, under 20 words"),
      symbolic_score: { type: "integer", minimum: 0, maximum: 100, description: "Symbolic fit 0-100: does the story line up?" },
      symbolic_reason: str("One sentence, under 20 words"),
      drift_score: { type: "integer", minimum: 0, maximum: 100, description: "Drift risk 0-100: how far the user would have to bend their work; higher is worse" },
      drift_reason: str("One sentence, under 20 words"),
      hard_checks: {
        type: "array",
        items: {
          type: "object",
          properties: { check: str("1 to 3 words, e.g. Geography, Org type, Open call, Grant size, Deadline, Reporting, Acceptability"), status: { type: "string", enum: ["pass", "fail", "unclear"] }, note: str("Under 15 words") },
          required: ["check", "status", "note"],
        },
      },
      what_funder_gets: { ...strList("What this funder gains from working with the user, in its own terms. Each item under 15 words."), maxItems: 4 },
      route: str("Best route in, under 8 words, e.g. 'Concept note in the March open call'"),
      route_why: str("Why that route, one sentence under 20 words"),
      positioning: { ...strList("Three talking points for framing the ask, each under 15 words. Not proposal text."), maxItems: 4 },
      internal_leverage: { ...strList("Internal resources to offer as co-financing, each under 15 words; empty if unknown"), maxItems: 4 },
      unverified: { ...strList("What the materials do not establish, each under 12 words"), maxItems: 5 },
      next_action: str("One concrete next action, under 15 words"),
      next_owner: str("Who does it, a role under 5 words"),
      next_within: str("Timeframe, e.g. 'two weeks'"),
      questions_they_will_ask: { ...strList("Questions the funder will likely ask, each under 15 words"), maxItems: 4 },
      systems_change: str("One sentence under 25 words if there is a real systems-change angle; otherwise empty string"),
    },
    required: ["funder_name", "verdict", "confidence", "would_change_if", "summary", "material_score", "material_reason", "symbolic_score", "symbolic_reason", "drift_score", "drift_reason", "hard_checks", "what_funder_gets", "route", "route_why", "positioning", "internal_leverage", "unverified", "next_action", "next_owner", "next_within", "questions_they_will_ask"],
  },
};

export const RESOURCES_TOOL = {
  name: "resource_finder",
  description: "Return the structured Resource Finder analysis.",
  input_schema: {
    type: "object",
    properties: {
      document_type: str("Short title, at most 8 words, e.g. 'Fixed asset register, Kumasi and Site B'"),
      document_summary: str("One line under 25 words: period, number of items, total value"),
      headline: str("At most 2 short sentences (under 40 words), outcome first. Say plainly if there is no strong opportunity."),
      opportunities: {
        type: "array",
        maxItems: 6,
        description: "Strongest first (lowest risk, lowest effort, highest confidence).",
        items: {
          type: "object",
          properties: {
            title: str("Under 8 words"),
            source: str("Asset IDs or rows only, under 10 words, e.g. 'B-002, training hall'"),
            type: { type: "string", enum: ["human", "material", "project", "saving"], description: "Per the Rating definitions in the playbook. Selling or leasing an asset is material." },
            how: str("One or two sentences, under 30 words: what to do and what it gains"),
            mission_risk: level("Per the Rating definitions: risk to children, families, core programmes or donor restrictions"),
            effort: level("Per the Rating definitions: time, cost and level of approval needed"),
            confidence: level("Per the Rating definitions: how directly the documents and answers support it"),
            approval: str("Role only, under 6 words, e.g. 'National director'"),
          },
          required: ["title", "source", "type", "how", "mission_risk", "effort", "confidence", "approval"],
        },
      },
      top: {
        type: "array",
        maxItems: 2,
        items: {
          type: "object",
          properties: { title: str("Under 8 words"), asset: str("Under 8 words"), model: str("How it earns or saves, under 12 words"), who_pays: str("Under 10 words"), impact: str("Under 15 words"), first_step: str("Under 12 words"), approver: str("Role, under 6 words") },
          required: ["title", "asset", "model", "who_pays", "impact", "first_step", "approver"],
        },
      },
      leverage: { ...strList("What can be offered to funders as co-financing or collateral, each under 15 words"), maxItems: 4 },
      cautions: { ...strList("Most important cautions first: safeguarding, donor restrictions, approvals. Each under 20 words."), maxItems: 4 },
      unverified: { ...strList("What the document does not establish, each under 12 words"), maxItems: 5 },
      next_action: str("One concrete next action, under 15 words"),
      next_owner: str("Who does it, a role under 5 words"),
      next_within: str("Timeframe, e.g. 'two weeks'"),
    },
    required: ["document_type", "document_summary", "headline", "opportunities", "top", "leverage", "cautions", "unverified", "next_action", "next_owner", "next_within"],
  },
};

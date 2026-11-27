import playbook from "./playbook.md";
import type { AnalyzeRequest, CaseRecord, Tool } from "../shared/types";

// ---------- System prompts ----------

const TOOL_BRIEF: Record<Tool, string> = {
  funder: `TASK: Funder Check.
Decide whether this funder is worth this office's time for the stated need, and how to approach it.
Work through: hard eligibility (geography, organisation type, open call vs invite-only, grant size vs need, deadline, instrument), material fit, symbolic fit, drift risk, earmarking and reporting load, acceptability, the best route in (direct, through an existing grantee or regranter, a collaborative, a corporate partnership), what the funder gains from SOS, and how internal resources could be offered as co-financing or leverage.
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

  const lines: string[] = [];
  if (kase) {
    lines.push(
      `THE CASE (set up by the user during the course): "${kase.title}"`,
      `Office: ${kase.profile.office || "not given"}`,
      `Programmes: ${kase.profile.programmes || "not given"}`,
      `Who they serve: ${kase.profile.served || "not given"}`,
      `Scale (budget, reach): ${kase.profile.scale || "not given"}`,
      `Problem statement: ${kase.challenge.problem || "not given"}`,
      `Mission statement: ${kase.challenge.mission || "not given"}`,
      `Stakeholders: ${kase.challenge.stakeholders || "not given"}`,
      `Value proposition: ${kase.challenge.value || "not given"}`,
      "",
    );
  }
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
      : "Now produce the analysis. Ground every claim in the materials above. Respond only by calling the tool.",
  );
  blocks.push({ type: "text", text: lines.join("\n") });
  return blocks;
}

// ---------- Structured output schemas (Anthropic tool definitions) ----------

const str = (description: string) => ({ type: "string", description });
const level = (description: string) => ({ type: "string", enum: ["low", "medium", "high"], description });
const strList = (description: string) => ({ type: "array", items: { type: "string" }, description });
const nextStep = {
  type: "object",
  properties: { action: str("One concrete action"), owner: str("Who at the office does it"), within: str("Timeframe, e.g. 'two weeks'") },
  required: ["action", "owner", "within"],
};
const score = (d: string) => ({
  type: "object",
  properties: { score: { type: "integer", minimum: 0, maximum: 100 }, reason: str(`Two short lines. ${d}`) },
  required: ["score", "reason"],
});

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
      would_change_if: str("The one fact that would change the verdict"),
      summary: str("Two or three short sentences, outcome first"),
      scores: {
        type: "object",
        properties: {
          material: score("Does the substance line up?"),
          symbolic: score("Does the story line up?"),
          drift: score("How far SOS would have to bend; higher is worse."),
        },
        required: ["material", "symbolic", "drift"],
      },
      hard_checks: {
        type: "array",
        items: {
          type: "object",
          properties: { check: str("e.g. Geography, Org type, Open call, Grant size vs need, Deadline, Earmarking/reporting, Acceptability"), status: { type: "string", enum: ["pass", "fail", "unclear"] }, note: str("One line, citing the material") },
          required: ["check", "status", "note"],
        },
      },
      what_funder_gets: strList("What this funder gains from partnering with SOS, in the funder's own terms"),
      route_in: { type: "object", properties: { route: str("Direct application, via a grantee/regranter, collaborative, corporate partnership..."), why: str("One line") }, required: ["route", "why"] },
      positioning: strList("Three to five talking points for framing the ask. Not proposal text."),
      internal_leverage: strList("Internal resources that could be offered as co-financing or leverage, if known; else empty"),
      unverified: strList("Important things the materials do not establish"),
      next_step: nextStep,
      questions_they_will_ask: strList("Questions the funder is likely to ask SOS"),
      systems_change: str("One line if there is a real systems-change angle; otherwise empty string"),
    },
    required: ["funder_name", "verdict", "confidence", "would_change_if", "summary", "scores", "hard_checks", "what_funder_gets", "route_in", "positioning", "internal_leverage", "unverified", "next_step", "questions_they_will_ask"],
  },
};

export const RESOURCES_TOOL = {
  name: "resource_finder",
  description: "Return the structured Resource Finder analysis.",
  input_schema: {
    type: "object",
    properties: {
      document_type: str("Short title, at most 8 words, e.g. 'Fixed asset register, Kumasi and Site B'"),
      document_summary: str("One or two lines: period, size, totals if computable"),
      headline: str("One or two sentences, outcome first. Say plainly if there is no strong opportunity."),
      opportunities: {
        type: "array",
        maxItems: 8,
        items: {
          type: "object",
          properties: {
            title: str("Short name"),
            source: str("Where in the document: sheet, row, line item, page"),
            type: { type: "string", enum: ["human", "material", "project", "saving"], description: "Per the Rating definitions in the playbook. Selling or leasing an asset is material." },
            how: str("How it would generate money, save money, or meet the need"),
            mission_risk: level("Per the Rating definitions: risk to children, families, core programmes or donor restrictions"),
            effort: level("Per the Rating definitions: time, cost and level of approval needed"),
            confidence: level("Per the Rating definitions: how directly the documents and answers support it"),
            approval: str("Who at SOS would need to approve"),
          },
          required: ["title", "source", "type", "how", "mission_risk", "effort", "confidence", "approval"],
        },
      },
      top: {
        type: "array",
        maxItems: 3,
        items: {
          type: "object",
          properties: { title: str("Short name"), asset: str("The asset or capacity used"), model: str("Revenue or saving model"), who_pays: str("Who pays or benefits"), impact: str("Impact rationale"), first_step: str("First concrete step"), approver: str("Who at SOS approves") },
          required: ["title", "asset", "model", "who_pays", "impact", "first_step", "approver"],
        },
      },
      leverage: strList("Resources that could be offered to an external funder as co-financing or collateral"),
      cautions: strList("Mission, safeguarding, donor-restriction or data-quality cautions"),
      unverified: strList("What the document does not establish"),
      next_step: nextStep,
    },
    required: ["document_type", "document_summary", "headline", "opportunities", "top", "leverage", "cautions", "unverified", "next_step"],
  },
};

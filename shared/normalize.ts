// Make AI output safe to display, whatever shape it came back in.
// Used by the Worker (before saving) and by the page (for older saved runs).
import type { ClarifyResult, FunderResult, Level, Opportunity, ResourcesResult, Verdict } from "./types";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback);
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : isObj(x) ? Object.values(x).map((y) => str(y)).filter(Boolean).join(": ") : str(x))).filter(Boolean) : typeof v === "string" && v ? [v] : [];
const level = (v: unknown, fallback: Level = "medium"): Level => {
  const s = str(v).toLowerCase();
  return s === "low" || s === "medium" || s === "high" ? s : fallback;
};
const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(str(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
};

/** If the model wrapped its answer, e.g. { "funder_check": { ... } }, unwrap it. */
function unwrap(raw: unknown, marker: string): Obj {
  if (!isObj(raw)) return {};
  if (marker in raw) return raw;
  for (const v of Object.values(raw)) if (isObj(v) && marker in v) return v;
  return raw;
}

const VERDICTS: Verdict[] = ["Pursue", "Pursue narrowly", "Hold", "Don't pursue"];
function verdict(v: unknown): Verdict {
  const s = str(v).toLowerCase().replace(/[’`]/g, "'");
  if (s.includes("narrow")) return "Pursue narrowly";
  if (s.includes("don't") || s.includes("do not") || s.includes("not pursue")) return "Don't pursue";
  if (s.includes("hold")) return "Hold";
  if (s.includes("pursue")) return "Pursue";
  return VERDICTS.includes(v as Verdict) ? (v as Verdict) : "Hold";
}

function score(v: unknown) {
  if (isObj(v)) return { score: num(v.score ?? v.value), reason: str(v.reason ?? v.why ?? v.note) };
  return { score: num(v), reason: "" };
}

function step(v: unknown) {
  if (isObj(v)) return { action: str(v.action ?? v.step), owner: str(v.owner ?? v.who, "The office"), within: str(v.within ?? v.when ?? v.timeframe, "the next few weeks") };
  return { action: str(v), owner: "The office", within: "the next few weeks" };
}

export function normalizeFunder(raw: unknown): FunderResult {
  const r = unwrap(raw, "verdict");
  const s = isObj(r.scores) ? r.scores : {};
  const route = isObj(r.route_in) ? r.route_in : { route: str(r.route_in), why: "" };
  return {
    funder_name: str(r.funder_name, "Funder"),
    verdict: verdict(r.verdict),
    confidence: level(r.confidence),
    would_change_if: str(r.would_change_if),
    summary: str(r.summary),
    scores: { material: score(s.material ?? r.material_fit), symbolic: score(s.symbolic ?? r.symbolic_fit), drift: score(s.drift ?? r.drift_risk) },
    hard_checks: (Array.isArray(r.hard_checks) ? r.hard_checks : []).filter(isObj).map((c) => {
      const st = str(c.status).toLowerCase();
      return { check: str(c.check ?? c.name), status: st === "pass" || st === "fail" ? st : "unclear", note: str(c.note ?? c.detail) } as FunderResult["hard_checks"][number];
    }),
    what_funder_gets: list(r.what_funder_gets),
    route_in: { route: str(route.route), why: str(route.why) },
    positioning: list(r.positioning),
    internal_leverage: list(r.internal_leverage),
    unverified: list(r.unverified),
    next_step: step(r.next_step),
    questions_they_will_ask: list(r.questions_they_will_ask),
    systems_change: str(r.systems_change),
  };
}

export function normalizeResources(raw: unknown): ResourcesResult {
  const r = unwrap(raw, "opportunities");
  const TYPES = ["human", "material", "project", "saving"];
  return {
    document_type: str(r.document_type, "Your documents"),
    document_summary: str(r.document_summary),
    headline: str(r.headline),
    opportunities: (Array.isArray(r.opportunities) ? r.opportunities : []).filter(isObj).map((o) => {
      const t = str(o.type).toLowerCase();
      return {
        title: str(o.title),
        source: str(o.source),
        type: (TYPES.includes(t) ? t : "material") as Opportunity["type"],
        how: str(o.how),
        mission_risk: level(o.mission_risk),
        effort: level(o.effort),
        confidence: level(o.confidence),
        approval: str(o.approval),
      };
    }),
    top: (Array.isArray(r.top) ? r.top : []).filter(isObj).map((t) => ({
      title: str(t.title),
      asset: str(t.asset),
      model: str(t.model),
      who_pays: str(t.who_pays),
      impact: str(t.impact),
      first_step: str(t.first_step),
      approver: str(t.approver),
    })),
    leverage: list(r.leverage),
    cautions: list(r.cautions),
    unverified: list(r.unverified),
    next_step: step(r.next_step),
  };
}

export function normalizeClarify(raw: unknown): ClarifyResult {
  const r = unwrap(raw, "questions");
  return {
    doc_check: (Array.isArray(r.doc_check) ? r.doc_check : []).filter(isObj).map((d) => ({ name: str(d.name, "Document"), looks_like: str(d.looks_like) })),
    questions: (Array.isArray(r.questions) ? r.questions : [])
      .map((q, i) => (isObj(q) ? { id: str(q.id, `q${i + 1}`), question: str(q.question), why: str(q.why) } : { id: `q${i + 1}`, question: str(q), why: "" }))
      .filter((q) => q.question)
      .slice(0, 4),
    ready: r.ready === true,
    safeguarding_flag: str(r.safeguarding_flag),
  };
}

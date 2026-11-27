import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AnalyzeRequest, CaseRecord, Tool } from "../shared/types";
import { CLARIFY_TOOL, FUNDER_TOOL, RESOURCES_TOOL, systemPrompt, userContent } from "./prompts";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ANTHROPIC_API_KEY: string;
  MODEL: string;
  DAILY_RUN_LIMIT: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ADMIN_EMAILS: string;
  /** Local development only (set in .dev.vars). Skips Access when present. */
  DEV_EMAIL?: string;
  /** Local testing only: point at a mock server instead of api.anthropic.com. */
  ANTHROPIC_URL?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
const fail = (status: number, message: string) => json({ error: message }, status);

// ---------- Auth: verify the Cloudflare Access token on every API call ----------

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

async function getEmail(req: Request, env: Env): Promise<string | null> {
  if (env.DEV_EMAIL) return env.DEV_EMAIL.toLowerCase();
  const token = req.headers.get("cf-access-jwt-assertion");
  if (!token || !env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) return null;
  jwks ??= createRemoteJWKSet(new URL(`${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`));
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: env.ACCESS_TEAM_DOMAIN, audience: env.ACCESS_AUD });
    return typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

// ---------- Daily cap ----------

async function takeQuota(env: Env, email: string): Promise<boolean> {
  const limit = Number(env.DAILY_RUN_LIMIT || "15");
  const day = new Date().toISOString().slice(0, 10);
  const row = await env.DB.prepare(
    `INSERT INTO usage (email, day, calls) VALUES (?1, ?2, 1)
     ON CONFLICT(email, day) DO UPDATE SET calls = calls + 1
     RETURNING calls`,
  ).bind(email, day).first<{ calls: number }>();
  return (row?.calls ?? 1) <= limit;
}

// ---------- Anthropic ----------

type ContentBlock = { type: string; name?: string; input?: unknown; text?: string };
type Message = { role: "user" | "assistant"; content: unknown };

/** Pull a JSON object out of a text reply, in case the model answers in text instead of a tool call. */
function jsonFromText(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try {
    const parsed = JSON.parse(candidate);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function callClaude(env: Env, tool: Tool, phase: "clarify" | "analyze", req: AnalyzeRequest, kase: CaseRecord | null) {
  const schema = phase === "clarify" ? CLARIFY_TOOL : tool === "funder" ? FUNDER_TOOL : RESOURCES_TOOL;
  // Some models reject a forced tool_choice, so we offer the tool, require it in the instructions,
  // and accept either a tool call or a JSON reply. If neither comes back, we ask once more.
  const system = `${systemPrompt(tool)}\n\n---\n\nOUTPUT RULE: Respond only by calling the "${schema.name}" tool with your full answer. Do not write anything outside the tool call.`;
  const messages: Message[] = [{ role: "user", content: userContent(req, kase, phase) }];

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(env.ANTHROPIC_URL || "https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.MODEL,
        max_tokens: phase === "clarify" ? 4000 : 16000,
        system,
        tools: [schema],
        tool_choice: { type: "auto" },
        messages,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("Anthropic error", res.status, detail.slice(0, 1000));
      throw new Error(explainAnthropicError(res.status, detail, env.MODEL));
    }
    const body = (await res.json()) as { content: ContentBlock[]; stop_reason?: string };
    const call = body.content.find((c) => c.type === "tool_use" && c.name === schema.name);
    if (call?.input && typeof call.input === "object") return call.input as Record<string, unknown>;

    const text = body.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n");
    const parsed = jsonFromText(text);
    if (parsed) return parsed;

    console.warn("No tool call on attempt", attempt + 1, "stop_reason:", body.stop_reason, text.slice(0, 300));
    if (body.stop_reason === "max_tokens") throw new Error("Pippa's answer was cut off because the documents are long. Try fewer pages.");
    // Retry with the same request plus an explicit reminder at the end.
    messages[0] = {
      role: "user",
      content: [...userContent(req, kase, phase), { type: "text", text: `Reminder: answer only by calling the "${schema.name}" tool.` }],
    };
  }
  throw new Error("Pippa couldn't produce a structured answer. Try again, or shorten the documents.");
}

/** Turn an Anthropic API error into a message that says what to fix. */
function explainAnthropicError(status: number, body: string, model: string): string {
  let msg = "";
  try {
    msg = (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? "";
  } catch {
    msg = body.slice(0, 200);
  }
  const lower = msg.toLowerCase();
  if (status === 401) return "The AI key was rejected. Check the ANTHROPIC_API_KEY secret in Cloudflare (no spaces, the full key).";
  if (status === 403) return `The AI key doesn't have permission for this request. (${msg})`;
  if (lower.includes("credit balance")) return "The Anthropic account is out of credit. Add credit in the Anthropic console under Billing.";
  if (status === 404 || lower.includes("model")) return `The AI model "${model}" wasn't accepted. (${msg})`;
  if (status === 413) return "Those files are too large. Try fewer pages or paste the key sections.";
  if (status === 429) return "Too many requests to the AI service right now. Wait a minute and try again.";
  if (status === 529 || status >= 500) return "The AI service is busy. Try again in a minute.";
  return `The AI service returned an error (${status}): ${msg || "no details"}`;
}

// ---------- Helpers ----------

function validRequest(body: unknown): body is AnalyzeRequest {
  const b = body as AnalyzeRequest;
  return !!b && (b.tool === "funder" || b.tool === "resources") && !!b.need && Array.isArray(b.files);
}

function hasMaterial(req: AnalyzeRequest): boolean {
  const pasted = Object.values(req.pasted || {}).some((t) => (t || "").trim().length > 0);
  return req.files.length > 0 || pasted;
}

async function loadCase(env: Env, email: string, id?: string): Promise<CaseRecord | null> {
  if (!id) return null;
  const row = await env.DB.prepare("SELECT id, title, profile, challenge, updated_at FROM cases WHERE id = ?1 AND email = ?2")
    .bind(id, email).first<{ id: string; title: string; profile: string; challenge: string; updated_at: string }>();
  return row ? { id: row.id, title: row.title, profile: JSON.parse(row.profile), challenge: JSON.parse(row.challenge), updated_at: row.updated_at } : null;
}

// ---------- Schema (created on first use, so no manual console step) ----------

/** Bump when the Terms or Privacy Notice change materially; users are asked to accept again. */
const TERMS_VERSION = "2026-11-26";

let schemaReady = false;
async function ensureSchema(env: Env) {
  if (schemaReady) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')))"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, email TEXT NOT NULL, title TEXT NOT NULL, profile TEXT NOT NULL, challenge TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, email TEXT NOT NULL, case_id TEXT, tool TEXT NOT NULL, title TEXT NOT NULL, need TEXT NOT NULL, output TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS usage (email TEXT NOT NULL, day TEXT NOT NULL, calls INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (email, day))"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS consents (email TEXT NOT NULL, version TEXT NOT NULL, accepted_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (email, version))"),
  ]);
  schemaReady = true;
}

async function hasAccepted(env: Env, email: string): Promise<boolean> {
  const row = await env.DB.prepare("SELECT 1 AS ok FROM consents WHERE email = ?1 AND version = ?2").bind(email, TERMS_VERSION).first();
  return !!row;
}

// ---------- Routes ----------

async function handleApi(req: Request, env: Env, url: URL): Promise<Response> {
  const email = await getEmail(req, env);
  if (!email) return fail(401, "Please sign in with the email you were invited on.");
  await ensureSchema(env);
  await env.DB.prepare("INSERT OR IGNORE INTO users (email) VALUES (?1)").bind(email).run();
  const path = url.pathname.replace(/\/+$/, "");
  const method = req.method;

  if (path === "/api/me" && method === "GET") {
    const admins = (env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    return json({ email, admin: admins.includes(email), accepted: await hasAccepted(env, email), termsVersion: TERMS_VERSION });
  }

  if (path === "/api/consent" && method === "POST") {
    await env.DB.prepare("INSERT OR IGNORE INTO consents (email, version) VALUES (?1, ?2)").bind(email, TERMS_VERSION).run();
    return json({ ok: true });
  }

  // Delete everything Pippa holds about this user (Privacy Notice: right to erasure).
  if (path === "/api/me/data" && method === "DELETE") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM runs WHERE email = ?1").bind(email),
      env.DB.prepare("DELETE FROM cases WHERE email = ?1").bind(email),
      env.DB.prepare("DELETE FROM usage WHERE email = ?1").bind(email),
      env.DB.prepare("DELETE FROM consents WHERE email = ?1").bind(email),
      env.DB.prepare("DELETE FROM users WHERE email = ?1").bind(email),
    ]);
    return json({ ok: true });
  }

  // Cases
  if (path === "/api/cases" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT id, title, profile, challenge, updated_at FROM cases WHERE email = ?1 ORDER BY updated_at DESC")
      .bind(email).all<{ id: string; title: string; profile: string; challenge: string; updated_at: string }>();
    return json(results.map((r) => ({ ...r, profile: JSON.parse(r.profile), challenge: JSON.parse(r.challenge) })));
  }
  if (path === "/api/cases" && method === "POST") {
    const c = (await req.json()) as CaseRecord;
    if (!c?.title?.trim()) return fail(400, "Give the case a title.");
    const id = c.id || crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO cases (id, email, title, profile, challenge) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET title = ?3, profile = ?4, challenge = ?5, updated_at = datetime('now')
       WHERE cases.email = ?2`,
    ).bind(id, email, c.title.trim(), JSON.stringify(c.profile), JSON.stringify(c.challenge)).run();
    return json({ id });
  }
  const caseMatch = path.match(/^\/api\/cases\/([\w-]+)$/);
  if (caseMatch && method === "DELETE") {
    await env.DB.prepare("DELETE FROM cases WHERE id = ?1 AND email = ?2").bind(caseMatch[1], email).run();
    return json({ ok: true });
  }

  // Runs (saved analyses)
  if (path === "/api/runs" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT id, tool, title, case_id, created_at FROM runs WHERE email = ?1 ORDER BY created_at DESC LIMIT 100")
      .bind(email).all();
    return json(results);
  }
  const runMatch = path.match(/^\/api\/runs\/([\w-]+)$/);
  if (runMatch && method === "GET") {
    const r = await env.DB.prepare("SELECT id, tool, title, case_id, need, output, created_at FROM runs WHERE id = ?1 AND email = ?2")
      .bind(runMatch[1], email).first<{ need: string; output: string }>();
    if (!r) return fail(404, "Not found.");
    return json({ ...r, need: JSON.parse(r.need), output: JSON.parse(r.output) });
  }
  if (runMatch && method === "DELETE") {
    await env.DB.prepare("DELETE FROM runs WHERE id = ?1 AND email = ?2").bind(runMatch[1], email).run();
    return json({ ok: true });
  }

  // AI: clarify, then analyze
  if ((path === "/api/clarify" || path === "/api/analyze") && method === "POST") {
    const phase = path === "/api/clarify" ? "clarify" : "analyze";
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return fail(400, "Couldn't read the request.");
    }
    if (!validRequest(body)) return fail(400, "Something is missing from the form.");
    if (!hasMaterial(body)) return fail(400, "Add at least one document or paste some text.");
    if (!body.need.purpose?.trim()) return fail(400, "Say what you need right now. Pippa scores everything against it.");
    if (!(await hasAccepted(env, email))) return fail(403, "Please accept the Terms of Use and Privacy Notice first (reload the page).");
    if (!(await takeQuota(env, email))) return fail(429, `You've reached today's limit of ${env.DAILY_RUN_LIMIT} Pippa calls. It resets at midnight UTC.`);

    const kase = await loadCase(env, email, body.caseId);
    try {
      const out = await callClaude(env, body.tool, phase, body, kase);
      if (phase === "clarify") return json(out);

      const id = crypto.randomUUID();
      const title =
        body.tool === "funder"
          ? `Funder Check: ${(out.funder_name as string) || "funder"}`
          : `Internal Resource Finder: ${(out.document_type as string) || "document"}`;
      await env.DB.prepare("INSERT INTO runs (id, email, case_id, tool, title, need, output) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
        .bind(id, email, kase?.id ?? null, body.tool, title, JSON.stringify({ need: body.need, answers: body.answers ?? [] }), JSON.stringify(out))
        .run();
      return json({ id, title, output: out });
    } catch (e) {
      return fail(502, e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return fail(404, "Unknown endpoint.");
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(req, env, url);
      } catch (e) {
        console.error(e);
        return fail(500, "Something went wrong on Pippa's side.");
      }
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;

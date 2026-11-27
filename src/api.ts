import type { AnalyzeRequest, CaseRecord, ClarifyResult, FunderResult, ResourcesResult, RunRecord } from "../shared/types";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
    credentials: "same-origin",
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON, e.g. an Access login page */
  }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error;
    throw new Error(msg || (res.status === 401 ? "Your session expired. Reload the page to sign in again." : `Request failed (${res.status}).`));
  }
  return data as T;
}

export const api = {
  me: () => call<{ email: string; admin: boolean; accepted: boolean; termsVersion: string }>("/api/me"),
  consent: () => call<{ ok: true }>("/api/consent", { method: "POST" }),
  deleteMyData: () => call<{ ok: true }>("/api/me/data", { method: "DELETE" }),
  cases: () => call<CaseRecord[]>("/api/cases"),
  saveCase: (c: Partial<CaseRecord>) => call<{ id: string }>("/api/cases", { method: "POST", body: JSON.stringify(c) }),
  deleteCase: (id: string) => call<{ ok: true }>(`/api/cases/${id}`, { method: "DELETE" }),
  runs: () => call<RunRecord[]>("/api/runs"),
  run: (id: string) => call<RunRecord>(`/api/runs/${id}`),
  deleteRun: (id: string) => call<{ ok: true }>(`/api/runs/${id}`, { method: "DELETE" }),
  clarify: (req: AnalyzeRequest) => call<ClarifyResult>("/api/clarify", { method: "POST", body: JSON.stringify(req) }),
  analyze: (req: AnalyzeRequest) =>
    call<{ id: string; title: string; output: FunderResult | ResourcesResult }>("/api/analyze", { method: "POST", body: JSON.stringify(req) }),
};

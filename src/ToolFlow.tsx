import { useState } from "react";
import type { AnalyzeRequest, Answer, CaseRecord, ClarifyResult, FileRole, FunderResult, Need, ResourcesResult, Tool, UploadedFile } from "../shared/types";
import { api } from "./api";
import AutoText from "./AutoText";
import { normalizeClarify } from "../shared/normalize";
import Thinking from "./Thinking";
import { ACCEPT, MAX_TOTAL_MB, readFile, totalSizeMB } from "./files";
import { FunderCard, ResourcesCard } from "./Results";

const FORMS = ["Grant", "In-kind", "Corporate partnership", "Loan", "Recoverable grant", "Investment", "Matching funds"];

const COPY: Record<Tool, { title: string; lead: string; needHint: string; slots: { role: FileRole; label: string; hint: string[] }[] }> = {
  resources: {
    title: "Internal Resource Finder",
    lead: "Look inward first. Pippa reads your own organisation's records for idle or underused capacity that could fund the work, cut the external ask, or count as co-financing.",
    needHint: "What you're trying to fund or launch, and what would solve it: cash, space, equipment, staff time, a revenue stream.",
    slots: [
      {
        role: "internal",
        label: "Your internal documents",
        hint: ["Asset registers (buildings, vehicles, equipment, land)", "Budgets with line items", "Programme reports (activities, capacity, reach)", "Raw exports are fine. Remove names of children, families and staff first."],
      },
    ],
  },
  funder: {
    title: "Funder Check",
    lead: "Is this funder worth your time? Pippa scores the fit against what you need, checks eligibility, names the best route in, and says what SOS can offer them.",
    needHint: "What you're raising for (a programme, a gap, a specific cost) and roughly how much.",
    slots: [
      {
        role: "funder",
        label: "The funder's materials",
        hint: ["Mission and focus areas", "Past grantees: the best signal of what they really fund", "Geographies, grant sizes, eligibility, deadlines", "Annual reports, calls for proposals, US 990 filings"],
      },
      {
        role: "org",
        label: "Extra material on your side (optional)",
        hint: ["Anything your case doesn't cover: a concept note, a programme summary, results data"],
      },
    ],
  },
};

type Step = "input" | "asking" | "questions" | "running" | "result";

export default function ToolFlow({ tool, cases }: { tool: Tool; cases: CaseRecord[] }) {
  const copy = COPY[tool];
  const [caseId, setCaseId] = useState<string>(cases[0]?.id ?? "none");
  const [need, setNeed] = useState<Need>({ purpose: "", amount: "", forms: [], notes: "" });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pasted, setPasted] = useState<Partial<Record<FileRole, string>>>({});
  const [clarify, setClarify] = useState<ClarifyResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ id: string; output: FunderResult | ResourcesResult } | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  const effectiveCase = caseId === "none" ? undefined : caseId || cases[0]?.id || undefined;

  const request = (withAnswers?: Answer[]): AnalyzeRequest => ({ tool, caseId: effectiveCase, need, files, pasted, answers: withAnswers });

  async function addFiles(list: FileList | null, role: FileRole) {
    if (!list?.length) return;
    setError(null);
    setReading(true);
    try {
      const next = [...files];
      for (const f of Array.from(list)) next.push(await readFile(f, role));
      if (totalSizeMB(next) > MAX_TOTAL_MB) throw new Error(`Total upload is over ${MAX_TOTAL_MB} MB. Remove a file or paste key sections.`);
      setFiles(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setReading(false);
    }
  }

  async function start() {
    setError(null);
    setStep("asking");
    try {
      const c = normalizeClarify(await api.clarify(request()));
      setClarify(c);
      if (c.questions.length === 0) return run([]);
      setStep("questions");
    } catch (e) {
      setError((e as Error).message);
      setStep("input");
    }
  }

  async function run(ans: Answer[]) {
    setError(null);
    setStep("running");
    try {
      const r = await api.analyze(request(ans));
      setResult(r);
      setStep("result");
      window.scrollTo(0, 0);
    } catch (e) {
      setError((e as Error).message);
      setStep(clarify?.questions.length ? "questions" : "input");
    }
  }

  const hasMaterial = files.length > 0 || Object.values(pasted).some((t) => (t || "").trim());
  const canStart = need.purpose.trim() && hasMaterial && !reading;

  if (step === "result" && result) {
    return (
      <section>
        <div className="cta-row no-print">
          <button onClick={() => window.print()}>Print or save as PDF</button>
          <button
            onClick={() => {
              setResult(null);
              setClarify(null);
              setAnswers({});
              setStep("input");
            }}
          >
            Run another
          </button>
          <a href="#/saved">Saved analyses</a>
        </div>
        {tool === "funder" ? <FunderCard r={result.output as FunderResult} /> : <ResourcesCard r={result.output as ResourcesResult} />}
      </section>
    );
  }

  return (
    <section>
      <p className="eyebrow">{tool === "resources" ? "Step 2" : "Step 3"}</p>
      <h1>{copy.title}</h1>
      <p className="lead">{copy.lead}</p>
      {error && <div className="notice error">{error}</div>}

      {step === "input" || step === "asking" ? (
        <fieldset disabled={step === "asking"}>
          {cases.length > 0 ? (
            <label className="field inline">
              <span>Your case</span>
              <select value={effectiveCase ?? "none"} onChange={(e) => setCaseId(e.target.value)}>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
                <option value="none">No case, just this analysis</option>
              </select>
            </label>
          ) : (
            <div className="notice">
              No case yet. Pippa works without one, but the read is much sharper with it. <a href="#/case">Start with step 1: your case</a>.
            </div>
          )}

          <h2>What do you need right now?</h2>
          <label className="field">
            <span>Purpose</span>
            <AutoText minRows={3} value={need.purpose} placeholder={copy.needHint} onChange={(v) => setNeed({ ...need, purpose: v })} />
          </label>
          <label className="field">
            <span>Amount or range</span>
            <AutoText value={need.amount} placeholder="e.g. €80,000 covers one site; €200,000 covers all four" onChange={(v) => setNeed({ ...need, amount: v })} />
          </label>
          <div className="field">
            <span>Support you can accept</span>
            <div className="chips">
              {FORMS.map((f) => (
                <label key={f} className={`chip ${need.forms.includes(f) ? "on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={need.forms.includes(f)}
                    onChange={(e) => setNeed({ ...need, forms: e.target.checked ? [...need.forms, f] : need.forms.filter((x) => x !== f) })}
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>
          <label className="field">
            <span>Anything else Pippa should know (optional)</span>
            <AutoText value={need.notes} placeholder="Constraints, timeline, what's off the table" onChange={(v) => setNeed({ ...need, notes: v })} />
          </label>

          {copy.slots.map((slot) => (
            <div key={slot.role}>
              <h2>{slot.label}</h2>
              <ul className="hint">
                {slot.hint.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <label className="drop">
                <input type="file" multiple accept={ACCEPT} onChange={(e) => addFiles(e.target.files, slot.role)} />
                <span>{reading ? "Reading…" : "Choose files: PDF, Word, Excel, CSV, text or photos of pages"}</span>
              </label>
              <ul className="filelist">
                {files
                  .map((f, i) => ({ f, i }))
                  .filter(({ f }) => f.role === slot.role)
                  .map(({ f, i }) => (
                    <li key={i}>
                      {f.name}
                      <button className="link" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
              <label className="field">
                <span>Or paste text</span>
                <AutoText minRows={4} value={pasted[slot.role] ?? ""} onChange={(v) => setPasted({ ...pasted, [slot.role]: v })} />
              </label>
            </div>
          ))}

          {step === "asking" ? (
            <Thinking kind="clarify" />
          ) : (
            <div className="cta-row">
              <button className="primary" onClick={start} disabled={!canStart}>
                Continue
              </button>
              {!need.purpose.trim() && <span className="muted">Say what you need first.</span>}
            </div>
          )}
        </fieldset>
      ) : null}

      {(step === "questions" || step === "running") && clarify && (
        <div>
          <h2>What Pippa sees</h2>
          <ul className="hint">
            {clarify.doc_check.map((d) => (
              <li key={d.name}>
                <strong>{d.name}:</strong> {d.looks_like}
              </li>
            ))}
          </ul>
          {clarify.safeguarding_flag && <div className="notice error">{clarify.safeguarding_flag}</div>}

          <h2>A few questions first</h2>
          <fieldset disabled={step === "running"}>
            {clarify.questions.map((q) => (
              <label className="field" key={q.id}>
                <span>{q.question}</span>
                <small className="muted">{q.why}</small>
                <AutoText minRows={2} value={answers[q.id] ?? ""} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
              </label>
            ))}
            {step === "running" ? (
              <Thinking kind={tool} />
            ) : (
              <div className="cta-row">
                <button className="primary" onClick={() => run(clarify.questions.map((q) => ({ id: q.id, question: q.question, answer: answers[q.id] ?? "" })))}>
                  Run the analysis
                </button>
                <button className="link" onClick={() => run([])}>
                  Skip questions
                </button>
                <button className="link" onClick={() => setStep("input")}>
                  Back
                </button>
              </div>
            )}
          </fieldset>
        </div>
      )}

      {step === "running" && !clarify && <Thinking kind={tool} />}
    </section>
  );
}

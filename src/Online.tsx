import { useEffect, useState } from "react";
import type { CaseRecord, SearchResult } from "../shared/types";
import { api } from "./api";
import AutoText from "./AutoText";
import Thinking from "./Thinking";
import { session } from "./session";

const FIT_LABEL: Record<string, string> = { strong: "Strong fit", good: "Good fit", stretch: "Stretch" };

export function SearchCard({ r }: { r: SearchResult }) {
  return (
    <div className="result search-result">
      <header className="online-hero" data-jump="Summary">
        <p className="eyebrow">Pippa Online{r.searched_on ? ` · searched ${r.searched_on}` : ""}</p>
        <h2>{r.leads.length ? `${r.leads.length} open calls worth a look` : "No strong matches found"}</h2>
        {r.summary && <p className="lead">{r.summary}</p>}
      </header>

      <ol className="leads" data-jump="Leads">
        {r.leads.map((l, i) => (
          <li key={i} className={`lead-card fit-${l.fit}`}>
            <div className="lead-top">
              <span className={`fit-pill ${l.fit}`}>{FIT_LABEL[l.fit]}</span>
              <span className="lead-deadline">Deadline: {l.deadline}</span>
            </div>
            <h3>{l.title}</h3>
            <p className="lead-funder">{l.funder}</p>
            <dl className="lead-facts">
              <div>
                <dt>Amount</dt>
                <dd>{l.amount}</dd>
              </div>
              {l.eligibility && (
                <div>
                  <dt>Who can apply</dt>
                  <dd>{l.eligibility}</dd>
                </div>
              )}
            </dl>
            {l.why_fit && (
              <p className="lead-line">
                <b>Why it fits you.</b> {l.why_fit}
              </p>
            )}
            {l.angle && (
              <p className="lead-line">
                <b>Your angle.</b> {l.angle}
              </p>
            )}
            {l.check_first && <p className="lead-check">Check first: {l.check_first}</p>}
            {l.url && (
              <a className="lead-link" href={l.url} target="_blank" rel="noreferrer">
                Open the call ↗
              </a>
            )}
          </li>
        ))}
      </ol>

      {r.where_else.length > 0 && (
        <section className="box blue" data-jump="Also check">
          <h3>Also worth checking</h3>
          <ul>
            {r.where_else.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {r.next_step.action && (
        <section className="nextstep" data-jump="Pippa suggests">
          <div className="nextstep-main">
            <p className="nextstep-label">Pippa suggests</p>
            <p className="nextstep-action">{r.next_step.action}</p>
            <dl className="nextstep-meta">
              <div>
                <dt>Who</dt>
                <dd>{r.next_step.owner}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>Within {r.next_step.within}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      {r.sources.length > 0 && (
        <details className="more">
          <summary>Sources Pippa read ({r.sources.length})</summary>
          <ul className="sources">
            {r.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="ai-note">Found on the web by AI. Deadlines and rules change: confirm everything on the funder's own page before you apply.</p>
    </div>
  );
}

export default function Online({ cases }: { cases: CaseRecord[] }) {
  const [caseId, setCaseId] = useState("");
  const [focus, setFocus] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; output: SearchResult } | null>(null);

  useEffect(() => {
    if (!caseId && cases.length) setCaseId(cases[0].id);
  }, [cases, caseId]);

  if (!session.online) {
    return (
      <section className="online-locked">
        <p className="eyebrow">Pippa Online</p>
        <h1>Live search, matched to your case.</h1>
        <p className="lead">
          Pippa Online searches the web for open calls, fellowships and grants that fit your case, checks deadlines and eligibility, and tells
          you how to position yourself for each one.
        </p>
        <button className="upgrade-lg" disabled>
          Upgrade, coming soon
        </button>
        <p className="muted small">Want it now? Write to maahigupta@gmail.com.</p>
      </section>
    );
  }

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await api.search({ caseId, focus, region });
      setResult({ id: r.id, output: r.output });
      setTimeout(() => document.querySelector(".search-result")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <p className="eyebrow">Pippa Online</p>
      <h1>Find open calls</h1>
      <p className="lead">
        Pippa reads your case, searches the web for calls that are open now, and weighs each one for someone in your position. You decide
        what to apply for.
      </p>

      {cases.length === 0 ? (
        <div className="notice">
          Set up your case first. Pippa searches against it. <a href="#/case">Go to Your case</a>
        </div>
      ) : (
        <>
          <label className="field">
            <span>Case</span>
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Focus (optional)</span>
            <AutoText
              value={focus}
              onChange={setFocus}
              placeholder="The topic, field or what the money is for. e.g. postdoctoral fellowship on sovereignty and religion in international relations"
            />
          </label>
          <label className="field">
            <span>Where (optional)</span>
            <AutoText value={region} onChange={setRegion} placeholder="e.g. UK and Europe, or open to applicants from India" />
          </label>
          <div className="cta-row">
            <button className="primary" onClick={run} disabled={busy || !caseId}>
              {busy ? "Searching…" : "Search for open calls"}
            </button>
          </div>
          {busy && <Thinking kind="search" />}
          {error && <div className="notice error">{error}</div>}
          {result && (
            <>
              <SearchCard r={result.output} />
              <p className="muted small">
                Saved to <a href={`#/run/${result.id}`}>your saved analyses</a>.
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}

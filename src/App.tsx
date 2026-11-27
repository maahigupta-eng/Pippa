import { useCallback, useEffect, useState } from "react";
import type { CaseRecord, RunRecord, Tool } from "../shared/types";
import { api } from "./api";
import CaseView from "./CaseView";
import ToolFlow from "./ToolFlow";
import About from "./About";
import { ConsentGate, Privacy, Terms } from "./Legal";
import { ResultView } from "./Results";
import { SITE } from "./config";
import ErrorBoundary from "./ErrorBoundary";

type View =
  | { name: "home" }
  | { name: "classroom" }
  | { name: "tool"; tool: Tool }
  | { name: "saved" }
  | { name: "run"; id: string }
  | { name: "about" }
  | { name: "privacy" }
  | { name: "terms" };

function readHash(): View {
  const h = location.hash.replace(/^#\/?/, "");
  if (h === "case" || h === "classroom") return { name: "classroom" };
  if (h === "funder") return { name: "tool", tool: "funder" };
  if (h === "resources") return { name: "tool", tool: "resources" };
  if (h === "saved") return { name: "saved" };
  if (h.startsWith("run/")) return { name: "run", id: h.slice(4) };
  if (h === "about") return { name: "about" };
  if (h === "privacy") return { name: "privacy" };
  if (h === "terms") return { name: "terms" };
  return { name: "home" };
}

export const go = (path: string) => {
  location.hash = `#/${path}`;
  window.scrollTo(0, 0);
};

export default function App() {
  const [view, setView] = useState<View>(readHash());
  const [email, setEmail] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => {
      setView(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const refreshCases = useCallback(() => api.cases().then(setCases).catch(() => {}), []);

  useEffect(() => {
    api
      .me()
      .then((m) => {
        setEmail(m.email);
        setAccepted(m.accepted);
      })
      .catch((e) => setAuthError(e.message));
    refreshCases();
  }, [refreshCases]);

  // The three steps of the method, in order; then the reference pages.
  const steps: [string, string, string, boolean][] = [
    ["case", "1", "Your case", view.name === "classroom"],
    ["resources", "2", "Internal resources", view.name === "tool" && view.tool === "resources"],
    ["funder", "3", "Funder check", view.name === "tool" && view.tool === "funder"],
  ];
  const more: [string, string, boolean][] = [
    ["saved", "Saved", view.name === "saved" || view.name === "run"],
    ["about", "About", view.name === "about"],
  ];

  // The legal pages stay readable while the acceptance prompt is showing.
  const showGate = accepted === false && view.name !== "privacy" && view.name !== "terms";

  return (
    <div className="shell">
      <header className="top no-print">
        <a className="brand" href="#/">
          <span className="mark">P</span> Pippa
        </a>
        <nav>
          <ol className="stepnav">
            {steps.map(([path, num, label, active]) => (
              <li key={path}>
                <a href={`#/${path}`} className={active ? "active" : ""}>
                  <span className="stepnum">{num}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
          <span className="navsep" aria-hidden="true" />
          {more.map(([path, label, active]) => (
            <a key={path} href={`#/${path}`} className={active ? "active" : ""}>
              {label}
            </a>
          ))}
        </nav>
        <span className="who">{email}</span>
      </header>

      <main>
        <ErrorBoundary resetKey={location.hash}>
        {authError && <div className="notice error">{authError}</div>}
        {view.name === "home" && <Home hasCase={cases.length > 0} />}
        {view.name === "classroom" && <CaseView cases={cases} onSaved={refreshCases} />}
        {view.name === "tool" && <ToolFlow key={view.tool} tool={view.tool} cases={cases} />}
        {view.name === "saved" && <Saved />}
        {view.name === "run" && <RunView id={view.id} />}
        {view.name === "about" && <About />}
        {view.name === "privacy" && <Privacy />}
        {view.name === "terms" && <Terms />}
        </ErrorBoundary>
      </main>

      <footer className="no-print">
        <nav className="footer-links">
          <a href="#/privacy">Privacy Notice</a>
          <a href="#/terms">Terms of Use</a>
          <a href="#/about">About</a>
          <a href={`mailto:${SITE.contactEmail}`}>Contact</a>
        </nav>
        <p>Pippa uses AI. Check results before you act on them. Don't upload files that name children, families or staff.</p>
        <p>© 2026 Pippa</p>
      </footer>

      {showGate && <ConsentGate onAccepted={() => setAccepted(true)} />}
    </div>
  );
}

function Home({ hasCase }: { hasCase: boolean }) {
  return (
    <section className="home">
      <h1>Find the resources you have, then the partners worth your time.</h1>
      <p className="lead">
        Pippa runs the method from the course on your own documents. It looks inside your organisation first, then at funders, and tells
        you plainly what is worth pursuing and how to frame it.
      </p>

      <ol className="steps">
        <li>
          <strong>Your case.</strong> The four steps from Module 1: problem, mission, stakeholders, value proposition. Set it up once and come
          back whenever you want to rethink the problem. Everything after builds on it.
        </li>
        <li>
          <strong>Internal resources.</strong> Give Pippa an asset register, budget or programme report. It finds idle or underused capacity,
          each item traced to a line in your document.
        </li>
        <li>
          <strong>Funder check.</strong> Give Pippa a funder's own materials. It scores the fit, checks eligibility, names the best route in,
          and says what SOS can offer them.
        </li>
      </ol>

      <div className="cta-row">
        <button className="primary" onClick={() => go(hasCase ? "resources" : "case")}>
          {hasCase ? "Continue to step 2: internal resources" : "Start with step 1: your case"}
        </button>
        {hasCase && <button onClick={() => go("case")}>Revisit your case</button>}
      </div>

      <div className="notice">
        Pippa asks before it answers. Expect two to four questions after you upload. Answering them makes the read sharper; you can skip
        them.
      </div>
    </section>
  );
}

function Saved() {
  const [runs, setRuns] = useState<RunRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = () => api.runs().then(setRuns).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  return (
    <section>
      <h1>Saved analyses</h1>
      {error && <div className="notice error">{error}</div>}
      {runs && runs.length === 0 && <p className="muted">Nothing saved yet. Every analysis you run is kept here for your access period.</p>}
      <ul className="runlist">
        {runs?.map((r) => (
          <li key={r.id}>
            <a href={`#/run/${r.id}`}>{r.title.replace(/^Resource Finder:/, "Internal Resource Finder:")}</a>
            <span className="muted">{new Date(r.created_at + "Z").toLocaleDateString()}</span>
            <button
              className="link"
              onClick={async () => {
                if (confirm("Delete this analysis?")) {
                  await api.deleteRun(r.id);
                  load();
                }
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RunView({ id }: { id: string }) {
  const [run, setRun] = useState<RunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.run(id).then(setRun).catch((e) => setError(e.message));
  }, [id]);
  if (error) return <div className="notice error">{error}</div>;
  if (!run?.output) return <p className="muted">Loading…</p>;
  return (
    <section>
      <div className="cta-row no-print">
        <a href="#/saved">← Saved analyses</a>
        <button onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <ResultView tool={run.tool} output={run.output} runId={run.id} />
    </section>
  );
}

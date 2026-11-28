import { useCallback, useEffect, useState } from "react";
import type { CaseRecord, RunRecord, Tool } from "../shared/types";
import { api } from "./api";
import CaseView from "./CaseView";
import ToolFlow from "./ToolFlow";
import About from "./About";
import Contact from "./Contact";
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
  | { name: "terms" }
  | { name: "contact" };

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
  if (h === "contact") return { name: "contact" };
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
  const showGate = accepted === false && view.name !== "privacy" && view.name !== "terms" && view.name !== "contact";

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
        {view.name === "home" && <Home cases={cases} />}
        {view.name === "classroom" && <CaseView cases={cases} onSaved={refreshCases} />}
        {view.name === "tool" && <ToolFlow key={view.tool} tool={view.tool} cases={cases} />}
        {view.name === "saved" && <Saved />}
        {view.name === "run" && <RunView id={view.id} />}
        {view.name === "about" && <About />}
        {view.name === "privacy" && <Privacy />}
        {view.name === "terms" && <Terms />}
        {view.name === "contact" && <Contact />}
        </ErrorBoundary>
      </main>

      <footer className="no-print">
        <nav className="footer-links">
          <a href="#/privacy">Privacy Notice</a>
          <a href="#/terms">Terms of Use</a>
          <a href="#/about">About</a>
          <a href="#/contact">Contact</a>
          <a href="https://pippa-site.maahigupta.workers.dev/">Pippa website</a>
        </nav>
        <p>Pippa uses AI. Check results before you act on them. Don't upload files that name children, families or staff.</p>
        <p>© 2026 Pippa</p>
      </footer>

      {showGate && <ConsentGate onAccepted={() => setAccepted(true)} />}
    </div>
  );
}

function Home({ cases }: { cases: CaseRecord[] }) {
  const [runs, setRuns] = useState<RunRecord[] | null>(null);
  useEffect(() => {
    api.runs().then(setRuns).catch(() => setRuns([]));
  }, []);

  const lastOf = (tool: Tool) => runs?.find((r) => r.tool === tool);
  const fmt = (d: string) => new Date(d + "Z").toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const caseDone = cases.length > 0;
  const resDone = !!lastOf("resources");
  const funDone = !!lastOf("funder");
  const next = !caseDone ? 1 : !resDone ? 2 : 3;

  const steps = [
    {
      n: 1,
      path: "case",
      title: "Your case",
      blurb: "Who you are, what you need, and the problem you're solving.",
      status: caseDone ? `Done · ${cases[0].title}` : "Start here",
      done: caseDone,
      action: caseDone ? "Revisit" : "Set up your case",
    },
    {
      n: 2,
      path: "resources",
      title: "Internal resources",
      blurb: "Find idle or underused buildings, equipment, staff time and money inside SOS.",
      status: resDone ? `Last run ${fmt(lastOf("resources")!.created_at)}` : "Not run yet",
      done: resDone,
      action: resDone ? "Run again" : "Look inward",
    },
    {
      n: 3,
      path: "funder",
      title: "Funder check",
      blurb: "Is a funder worth your time? Fit, eligibility, the best route in, and what you can offer them.",
      status: funDone ? `Last run ${fmt(lastOf("funder")!.created_at)}` : "Not run yet",
      done: funDone,
      action: funDone ? "Check another" : "Check a funder",
    },
  ];

  return (
    <section className="landing">
      <div className="landing-head">
        <h1>Look inward first. Then find the partners worth your time.</h1>
        <p className="lead">Three steps. Pippa reads your documents and tells you plainly what's worth pursuing.</p>
      </div>

      <ol className="step-cards">
        {steps.map((st) => (
          <li key={st.n} className={`step-card ${st.n === next ? "is-next" : ""} ${st.done ? "is-done" : ""}`}>
            <a href={`#/${st.path}`}>
              <div className="step-card-top">
                <span className="step-badge">{st.done ? "✓" : st.n}</span>
                {st.n === next && <span className="next-tag">Next</span>}
              </div>
              <h2>{st.title}</h2>
              <p>{st.blurb}</p>
              <p className="step-status">{st.status}</p>
              <span className="step-action">{st.action} →</span>
            </a>
          </li>
        ))}
      </ol>

      {runs && runs.length > 0 && (
        <div className="recent">
          <div className="recent-head">
            <h3>Recent analyses</h3>
            <a href="#/saved">See all</a>
          </div>
          <ul>
            {runs.slice(0, 4).map((r) => (
              <li key={r.id}>
                <a href={`#/run/${r.id}`}>
                  <span className={`recent-dot ${r.tool}`} />
                  <span className="recent-title">{r.title.replace(/^Resource Finder:/, "Internal Resource Finder:")}</span>
                  <span className="muted small">{fmt(r.created_at)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="promises">
        <li>Works only from what you give it</li>
        <li>Asks before it answers</li>
        <li>Your material is never used to train AI</li>
      </ul>
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

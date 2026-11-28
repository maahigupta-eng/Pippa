import { TEAM } from "./config";

const PRINCIPLES = [
  { k: "Reads first", t: "Pippa works from your case and your documents. Nothing is assumed, and missing facts are listed as missing." },
  { k: "Shows its working", t: "Every finding points to the line, row or page behind it, so you can check it in seconds." },
  { k: "Leaves the call to you", t: "Pippa weighs the evidence and sets out the trade-offs. The decision is always yours." },
];

const STEPS = [
  { n: 1, title: "Your case", text: "Who you are, what you need, and four questions on the problem, the mission, the people involved and the value of your approach." },
  { n: 2, title: "Internal resources", text: "Your registers, budgets and reports, read for capacity that is idle, underused or shareable, and ranked by risk, effort and confidence." },
  { n: 3, title: "Funder check", text: "A funder's own materials read against your case: eligibility, fit, the route in, and what the partnership offers them." },
];

export default function About() {
  return (
    <article className="about">
      <header className="about-hero">
        <p className="eyebrow">About Pippa</p>
        <h1>An advisor for resource mobilisation that reads before it speaks.</h1>
        <p className="lead">
          Outside money is harder to win and comes with more conditions. The strongest asks now start from what you already hold. Pippa does
          the reading that takes most people weeks, and hands the judgement back to you.
        </p>
      </header>

      <section className="about-principles">
        {PRINCIPLES.map((p) => (
          <div key={p.k} className="principle">
            <h3>{p.k}</h3>
            <p>{p.t}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>How it works</h2>
        <ol className="about-steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className={`about-n n${s.n}`}>{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="muted small">Ask Pippa sits beside every result: press on a finding, test a framing, or ask what would change the verdict.</p>
      </section>

      <section>
        <h2>Meet the team</h2>
        <div className="about-team">
          {TEAM.map((m) => (
            <div key={m.name} className={`about-person tone-${m.tone}`}>
              <img src={m.photo} alt={m.name} width={88} height={88} />
              <div>
                <h3>{m.name}</h3>
                <p className="about-role">{m.role}</p>
                <p>{m.line}</p>
                <p className="about-links">
                  {m.email && <a href={`mailto:${m.email}`}>Email</a>}
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

// How to read Pippa's ratings. Keep this in step with "Rating definitions" in worker/playbook.md:
// the AI rates by those definitions, and this panel shows users the same ones.

const LEVELS = {
  risk: {
    low: "Doesn't touch children, families or core programmes. No donor restriction. Easy to undo.",
    medium: "Touches a site where children live or learn, uses a donor-funded asset with unknown conditions, or takes staff time from programmes. Manageable with safeguards and approval.",
    high: "Could expose children or families, break a donor restriction, divert core programme resources, or be hard to undo (for example, selling land).",
  },
  effort: {
    low: "Can start within a month with existing staff and national director approval. Little or no upfront cost.",
    medium: "One to three months. Some upfront cost, a partner, or regional office approval.",
    high: "More than three months. Significant investment, legal work, or International Office approval.",
  },
  confidence: {
    high: "Your documents state the key facts directly, and your answers confirm them.",
    medium: "Some key facts are stated; others are estimated or assumed.",
    low: "Mostly inferred. The main facts (value, demand, restrictions) aren't in what you gave Pippa.",
  },
};

const TYPES: [string, string][] = [
  ["Human", "Staff skills or time offered to others for a fee, or shared with partners."],
  ["Material", "Buildings, land, equipment or vehicles used for the project, rented out, or sold."],
  ["Project", "Spare capacity in a running programme (a school, clinic, workshop) offered to others."],
  ["Saving", "A cost cut or avoided, freeing money for the project."],
];

function LevelTable() {
  const rows: [string, keyof typeof LEVELS][] = [
    ["Mission risk", "risk"],
    ["Effort", "effort"],
    ["Confidence", "confidence"],
  ];
  const cell = (cls: string, word: string, text: string) => (
    <td>
      <span className={`pill ${cls}`}>{word}</span>
      <div>{text}</div>
    </td>
  );
  return (
    <div className="table-wrap">
      <table className="legend-table">
        <thead>
          <tr>
            <th>Rating</th>
            <th>Best</th>
            <th>Middle</th>
            <th>Watch out</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, key]) => {
            const l = LEVELS[key];
            const conf = key === "confidence";
            return (
              <tr key={key}>
                <td className="nowrap">
                  <strong>{label}</strong>
                </td>
                {conf ? cell("good", "High", l.high) : cell("good", "Low", l.low)}
                {cell("ok", "Medium", l.medium)}
                {conf ? cell("bad", "Low", l.low) : cell("bad", "High", l.high)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ResourcesLegend() {
  return (
    <details className="legend no-print">
      <summary>How to read these ratings</summary>
      <p className="small muted">Green is better in every row: low risk, low effort, high confidence.</p>
      <LevelTable />
      <h4>Resource types</h4>
      <dl className="legend-types">
        {TYPES.map(([t, d]) => (
          <div key={t}>
            <dt>{t}</dt>
            <dd>{d}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function FunderLegend() {
  return (
    <details className="legend no-print">
      <summary>How to read this check</summary>
      <div className="table-wrap">
        <table className="legend-table">
          <thead>
            <tr>
              <th>Measure</th>
              <th>What it asks</th>
              <th>How to read the number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="nowrap">
                <strong>Material fit</strong>
              </td>
              <td>Does the substance line up? Focus, geography, organisation type, grant size, instrument, timing, and what they've actually funded before.</td>
              <td>70+ strong · 45–69 partial · under 45 weak</td>
            </tr>
            <tr>
              <td className="nowrap">
                <strong>Symbolic fit</strong>
              </td>
              <td>Does the story line up? Their language, values, theory of change, and what they want to be seen supporting.</td>
              <td>70+ strong · 45–69 partial · under 45 weak</td>
            </tr>
            <tr>
              <td className="nowrap">
                <strong>Drift risk</strong>
              </td>
              <td>How far you would have to bend your work to fit this funder.</td>
              <td>Higher is worse · under 30 little bending · 30–59 some · 60+ major</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h4>Verdicts</h4>
      <dl className="legend-types">
        <div>
          <dt>Pursue</dt>
          <dd>Strong fit and eligible. Worth a full approach now.</dd>
        </div>
        <div>
          <dt>Pursue narrowly</dt>
          <dd>Worth it only for a specific angle or route, as described.</dd>
        </div>
        <div>
          <dt>Hold</dt>
          <dd>Possible, but a key fact is missing or the timing is wrong. Revisit when it changes.</dd>
        </div>
        <div>
          <dt>Don't pursue</dt>
          <dd>Ineligible, a poor fit, or the bending required isn't worth it.</dd>
        </div>
      </dl>
      <p className="small muted">
        Hard checks: <strong>pass</strong> means the materials confirm it, <strong>fail</strong> means they rule it out, <strong>unclear</strong>{" "}
        means they don't say.
      </p>
    </details>
  );
}

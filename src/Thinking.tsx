import { useEffect, useState } from "react";

const STEPS: Record<string, string[]> = {
  clarify: ["Reading your documents", "Checking them against your case", "Working out what's missing"],
  resources: ["Reading your documents", "Checking against your case and need", "Looking for idle or underused capacity", "Checking mission and safeguarding risks", "Writing it up"],
  funder: ["Reading the funder's materials", "Checking eligibility", "Scoring material and symbolic fit", "Working out what you can offer them", "Writing it up"],
};

/** Shown while Pippa is working: a spinner, the current stage, and elapsed time. */
export default function Thinking({ kind }: { kind: "clarify" | "resources" | "funder" }) {
  const steps = STEPS[kind];
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Move through the stages at a steady pace, then hold on the last one.
  const index = Math.min(steps.length - 1, Math.floor(seconds / (kind === "clarify" ? 6 : 10)));

  return (
    <div className="thinking" role="status" aria-live="polite">
      <div className="thinking-head">
        <span className="spinner" aria-hidden="true" />
        <strong>{steps[index]}…</strong>
        <span className="muted small">{seconds}s</span>
      </div>
      <ol className="thinking-steps">
        {steps.map((s, i) => (
          <li key={s} className={i < index ? "done" : i === index ? "now" : ""}>
            {s}
          </li>
        ))}
      </ol>
      <p className="muted small">
        {kind === "clarify" ? "Usually 15 to 40 seconds." : "Usually 30 to 90 seconds. Long documents take longer."} You can keep this tab open
        and come back.
      </p>
    </div>
  );
}

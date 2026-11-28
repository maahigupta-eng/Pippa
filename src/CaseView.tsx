import { useEffect, useState } from "react";
import type { CaseChallenge, CaseProfile, CaseRecord } from "../shared/types";
import { api } from "./api";
import AutoText from "./AutoText";
import { PERSONAS, PURPOSES, persona } from "../shared/personas";

const EMPTY_PROFILE: CaseProfile = { office: "", programmes: "", served: "", scale: "" };
const EMPTY_CHALLENGE: CaseChallenge = { problem: "", mission: "", stakeholders: "", value: "" };

const PROFILE_KEYS = ["office", "programmes", "served", "scale"] as const;

const CHALLENGE_FIELDS: [keyof CaseChallenge, string, string][] = [
  ["problem", "1. Problem statement", "What, specifically, are you trying to solve?"],
  ["mission", "2. Mission statement", "How are you proposing to solve it?"],
  ["stakeholders", "3. Stakeholders", "Everyone affected, everyone you'd turn to for resources or partnership, anyone who might resist."],
  ["value", "4. Value proposition", "Why is your approach the right one, the one that will convince stakeholders?"],
];

export default function CaseView({ cases, onSaved }: { cases: CaseRecord[]; onSaved: () => void }) {
  const [current, setCurrent] = useState<string>("new");
  const [title, setTitle] = useState("");
  const [profile, setProfile] = useState<CaseProfile>(EMPTY_PROFILE);
  const [challenge, setChallenge] = useState<CaseChallenge>(EMPTY_CHALLENGE);
  const [status, setStatus] = useState<string | null>(null);
  const who = persona(profile.who);

  useEffect(() => {
    if (current === "new" && cases.length && !title) setCurrent(cases[0].id);
  }, [cases]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = cases.find((x) => x.id === current);
    setTitle(c?.title ?? "");
    setProfile(c?.profile ?? EMPTY_PROFILE);
    setChallenge(c?.challenge ?? EMPTY_CHALLENGE);
    setStatus(null);
  }, [current, cases]);

  async function save() {
    setStatus("Saving…");
    try {
      const { id } = await api.saveCase({ id: current === "new" ? undefined : current, title, profile, challenge });
      onSaved();
      setCurrent(id);
      setStatus("Saved. Next: step 2, internal resources.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  return (
    <section>
      <p className="eyebrow">Step 1</p>
      <h1>Your case</h1>
      <p className="lead">
        Tell Pippa who you are and what you need. Everything after builds on it, and Pippa tailors its advice to you. Come back whenever you
        want to rethink the problem.
      </p>

      {cases.length > 0 && (
        <label className="field inline">
          <span>Case</span>
          <select value={current} onChange={(e) => setCurrent(e.target.value)}>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
            <option value="new">+ New case</option>
          </select>
        </label>
      )}

      <h2>Who are you?</h2>
      <div className="persona-grid" role="radiogroup" aria-label="Who are you?">
        {PERSONAS.map((p) => (
          <button
            type="button"
            key={p.key}
            role="radio"
            aria-checked={who.key === p.key}
            className={"persona" + (who.key === p.key ? " on" : "")}
            onClick={() => setProfile({ ...profile, who: p.key })}
          >
            <b>{p.label}</b>
            <span>{p.blurb}</span>
          </button>
        ))}
      </div>

      <h2>What are you looking for?</h2>
      <div className="chips" role="radiogroup" aria-label="What are you looking for?">
        {PURPOSES.map((x) => (
          <button
            type="button"
            key={x}
            role="radio"
            aria-checked={profile.purpose === x}
            className={"chip" + (profile.purpose === x ? " on" : "")}
            onClick={() => setProfile({ ...profile, purpose: x })}
          >
            {x}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Case title</span>
        <AutoText value={title} onChange={setTitle} placeholder={who.examples} />
      </label>

      <h2>{who.section}</h2>
      {PROFILE_KEYS.map((k) => (
        <label className="field" key={k}>
          <span>{who.fields[k][0]}</span>
          <AutoText value={profile[k]} placeholder={who.fields[k][1]} onChange={(v) => setProfile({ ...profile, [k]: v })} />
        </label>
      ))}

      <h2>The challenge</h2>
      {CHALLENGE_FIELDS.map(([k, label, hint]) => (
        <label className="field" key={k}>
          <span>{label}</span>
          <AutoText minRows={3} value={challenge[k]} placeholder={hint} onChange={(v) => setChallenge({ ...challenge, [k]: v })} />
        </label>
      ))}

      <div className="cta-row">
        <button className="primary" onClick={save} disabled={!title.trim()}>
          Save case
        </button>
        {current !== "new" && (
          <button
            className="link"
            onClick={async () => {
              if (confirm("Delete this case? Saved analyses stay.")) {
                await api.deleteCase(current);
                setCurrent("new");
                onSaved();
              }
            }}
          >
            Delete case
          </button>
        )}
      </div>
      {status && <p className="muted">{status}</p>}
    </section>
  );
}

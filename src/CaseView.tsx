import { useEffect, useState } from "react";
import type { CaseChallenge, CaseProfile, CaseRecord } from "../shared/types";
import { api } from "./api";

const EMPTY_PROFILE: CaseProfile = { office: "", programmes: "", served: "", scale: "" };
const EMPTY_CHALLENGE: CaseChallenge = { problem: "", mission: "", stakeholders: "", value: "" };

const PROFILE_FIELDS: [keyof CaseProfile, string, string][] = [
  ["office", "Office", "e.g. SOS Children's Villages Ghana, national office"],
  ["programmes", "Programmes", "What you run: family strengthening, schools, clinics, youth employability…"],
  ["served", "Who you serve", "Children, families, communities; roughly how many"],
  ["scale", "Scale", "Annual budget, staff, number of sites"],
];

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
      setStatus("Saved. Resource Finder and Funder Check will use this case.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  return (
    <section>
      <h1>My case</h1>
      <p className="lead">
        The challenge your group is working on in the course. Fill it in once; Pippa reads it before every analysis. Short answers are
        fine.
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

      <label className="field">
        <span>Case title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kumasi classroom block" />
      </label>

      <h2>Your office</h2>
      {PROFILE_FIELDS.map(([k, label, hint]) => (
        <label className="field" key={k}>
          <span>{label}</span>
          <input value={profile[k]} placeholder={hint} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
        </label>
      ))}

      <h2>The challenge</h2>
      {CHALLENGE_FIELDS.map(([k, label, hint]) => (
        <label className="field" key={k}>
          <span>{label}</span>
          <textarea rows={3} value={challenge[k]} placeholder={hint} onChange={(e) => setChallenge({ ...challenge, [k]: e.target.value })} />
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

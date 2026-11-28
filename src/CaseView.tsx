import { useEffect, useState, type ReactNode } from "react";
import type { CaseChallenge, CaseProfile, CaseRecord } from "../shared/types";
import { api } from "./api";
import AutoText from "./AutoText";
import { PERSONAS, PURPOSES, persona } from "../shared/personas";

const EMPTY_PROFILE: CaseProfile = { office: "", programmes: "", served: "", scale: "" };
const EMPTY_CHALLENGE: CaseChallenge = { problem: "", mission: "", stakeholders: "", value: "" };

const PROFILE_KEYS = ["office", "programmes", "served", "scale"] as const;

const CHALLENGE_KEYS = ["problem", "mission", "stakeholders", "value"] as const;

/** A small "See an example" link that opens one sample answer under a field. */
function Example({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="example">
      <button type="button" className="example-link" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "Hide example" : "See an example"}
      </button>
      {open && <p className="example-box">{text}</p>}
    </div>
  );
}

const countDone = (vals: (string | undefined)[]) => vals.filter((v) => v && v.trim()).length;

/** One collapsible section of the case form. Collapsed, it shows a one-line summary. */
function CaseStep(props: { n: number; title: string; open: boolean; onToggle: () => void; summary: string; onNext?: () => void; children: ReactNode }) {
  return (
    <section className={"case-step" + (props.open ? " open" : "")} id={`case-step-${props.n}`}>
      <button type="button" className="case-step-head" onClick={props.onToggle} aria-expanded={props.open}>
        <span className="case-step-n">{props.n}</span>
        <span className="case-step-title">
          <b>{props.title}</b>
          {!props.open && <small>{props.summary}</small>}
        </span>
        <span className="case-step-chev" aria-hidden="true">
          {props.open ? "−" : "+"}
        </span>
      </button>
      {props.open && (
        <div className="case-step-body">
          {props.children}
          {props.onNext && (
            <button type="button" className="secondary case-next" onClick={props.onNext}>
              Next
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function CaseView({ cases, onSaved }: { cases: CaseRecord[]; onSaved: () => void }) {
  const [current, setCurrent] = useState<string>("new");
  const [title, setTitle] = useState("");
  const [profile, setProfile] = useState<CaseProfile>(EMPTY_PROFILE);
  const [challenge, setChallenge] = useState<CaseChallenge>(EMPTY_CHALLENGE);
  const [status, setStatus] = useState<string | null>(null);
  const who = persona(profile.who);
  const [openStep, setOpenStep] = useState(0);
  function goTo(i: number) {
    setOpenStep(i);
    setTimeout(() => document.getElementById(`case-step-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  useEffect(() => {
    if (current === "new" && cases.length && !title) setCurrent(cases[0].id);
  }, [cases]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = cases.find((x) => x.id === current);
    setTitle(c?.title ?? "");
    setProfile(c?.profile ?? EMPTY_PROFILE);
    setChallenge(c?.challenge ?? EMPTY_CHALLENGE);
    setStatus(null);
    setOpenStep(c ? 1 : 0);
  }, [current, cases]);

  async function save(asNew = false) {
    setStatus("Saving…");
    try {
      const { id } = await api.saveCase({ id: current === "new" || asNew ? undefined : current, title, profile, challenge });
      onSaved();
      setCurrent(id);
      setStatus(asNew ? "Saved as a new case. Next: step 2, internal resources." : "Saved. Next: step 2, internal resources.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  function startNew() {
    setCurrent("new");
    setTitle("");
    setProfile(EMPTY_PROFILE);
    setChallenge(EMPTY_CHALLENGE);
    setStatus(null);
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
        <div className="case-picker">
          <label className="field inline">
            <span>Case</span>
            <select value={current} onChange={(e) => (e.target.value === "new" ? startNew() : setCurrent(e.target.value))}>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
              <option value="new">+ New case</option>
            </select>
          </label>
          {current !== "new" && (
            <button type="button" className="secondary" onClick={startNew}>
              + Start a new case
            </button>
          )}
        </div>
      )}
      {current !== "new" ? (
        <p className="case-mode">
          You're editing <b>{cases.find((c) => c.id === current)?.title}</b>. Changes replace this case when you save. To keep it, use “Save as a
          new case”.
        </p>
      ) : (
        cases.length > 0 && <p className="case-mode new">New case. Your other cases stay as they are.</p>
      )}

      <CaseStep
        n={1}
        title="Who you are"
        open={openStep === 0}
        onToggle={() => setOpenStep(openStep === 0 ? -1 : 0)}
        summary={`${who.label}${profile.purpose ? `, ${profile.purpose.toLowerCase()}` : ""}`}
        onNext={() => goTo(1)}
      >
        <h3 className="step-q">Who are you?</h3>
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
        <h3 className="step-q">What are you looking for?</h3>
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
      </CaseStep>

      <CaseStep
        n={2}
        title={who.section}
        open={openStep === 1}
        onToggle={() => setOpenStep(openStep === 1 ? -1 : 1)}
        summary={title ? `${title}. ${countDone(PROFILE_KEYS.map((k) => profile[k]))} of 4 answered` : "Not started"}
        onNext={() => goTo(2)}
      >
        <label className="field">
          <span>Case title</span>
          <AutoText value={title} onChange={setTitle} placeholder={who.examples} />
        </label>
        {PROFILE_KEYS.map((k) => (
          <div className="field-group" key={k}>
          <label className="field">
            <span>{who.fields[k][0]}</span>
            <AutoText value={profile[k]} placeholder={who.fields[k][1]} onChange={(v) => setProfile({ ...profile, [k]: v })} />
          </label>
          <Example key={`${who.key}-${k}`} text={who.samples[k]} />
          </div>
        ))}
      </CaseStep>

      <CaseStep
        n={3}
        title={who.challengeTitle}
        open={openStep === 2}
        onToggle={() => setOpenStep(openStep === 2 ? -1 : 2)}
        summary={`${countDone(CHALLENGE_KEYS.map((k) => challenge[k]))} of 4 answered`}
      >
        {CHALLENGE_KEYS.map((k) => (
          <div className="field-group" key={k}>
          <label className="field">
            <span>{who.challenge[k][0]}</span>
            <AutoText minRows={3} value={challenge[k]} placeholder={who.challenge[k][1]} onChange={(v) => setChallenge({ ...challenge, [k]: v })} />
          </label>
          <Example key={`${who.key}-${k}`} text={who.samples[k]} />
          </div>
        ))}
      </CaseStep>

      <div className="cta-row case-actions">
        <button className="primary" onClick={() => save(false)} disabled={!title.trim()}>
          {current === "new" ? "Save case" : "Save changes"}
        </button>
        {status && <span className="case-status">{status}</span>}
      </div>
      {current !== "new" && (
        <div className="cta-row case-more">
          <button className="secondary" onClick={() => save(true)} disabled={!title.trim()}>
            Save as a new case
          </button>
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
        </div>
      )}
    </section>
  );
}

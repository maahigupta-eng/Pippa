import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Tool } from "../shared/types";
import { api } from "./api";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS: Record<Tool, string[]> = {
  resources: [
    "Explain this in simpler words",
    "What should I do first?",
    "How do I present the co-financing to a funder?",
    "Why is that one rated medium risk?",
  ],
  funder: [
    "Explain this verdict in simpler words",
    "What would make this a better fit?",
    "Give me three lines for my first email to them",
    "What should I prepare before applying?",
  ],
};

/** Very small formatter: paragraphs, bullet lists and **bold**. */
function Formatted({ text }: { text: string }) {
  const bold = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part));
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      blocks.push(
        <ul key={`l${blocks.length}`}>
          {list.map((l, i) => (
            <li key={i}>{bold(l)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const m = line.match(/^([-*•]|\d+[.)])\s+(.*)$/);
    if (m) list.push(m[2]);
    else {
      flush();
      if (line) blocks.push(<p key={`p${blocks.length}`}>{bold(line)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

export default function AskPippa({ runId, tool }: { runId: string; tool: Tool }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setDraft("");
    setBusy(true);
    setError(null);
    try {
      const { answer } = await api.ask(runId, next);
      setMsgs([...next, { role: "assistant", content: answer }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="ask-fab no-print" onClick={() => setOpen(true)}>
        <span className="mark small">P</span> Ask Pippa
      </button>
    );
  }

  return (
    <aside className="ask-panel no-print" aria-label="Ask Pippa about this analysis">
      <header className="ask-head">
        <div>
          <strong>Ask Pippa</strong>
          <p>About this analysis. Pippa can see the result and what you told it, not your original files.</p>
        </div>
        <button className="link ask-close" onClick={() => setOpen(false)} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="ask-body">
        {msgs.length === 0 && (
          <div className="ask-suggest">
            <p className="muted small">Try one of these, or type your own question:</p>
            {SUGGESTIONS[tool].map((s) => (
              <button key={s} className="suggest" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === "assistant" ? <Formatted text={m.content} /> : m.content}
          </div>
        ))}
        {busy && (
          <div className="bubble assistant typing" aria-label="Pippa is typing">
            <span />
            <span />
            <span />
          </div>
        )}
        {error && <div className="notice error small">{error}</div>}
        <div ref={endRef} />
      </div>

      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <textarea
          ref={inputRef}
          rows={2}
          value={draft}
          placeholder="Ask a question…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
        />
        <button className="primary" type="submit" disabled={!draft.trim() || busy}>
          Send
        </button>
      </form>
    </aside>
  );
}

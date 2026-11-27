import { useState } from "react";
import { TEAM } from "./config";

function Avatar({ name, photo }: { name: string; photo: string }) {
  const [failed, setFailed] = useState(!photo);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return failed ? (
    <div className="avatar avatar-initials" aria-hidden="true">
      {initials}
    </div>
  ) : (
    <img className="avatar" src={photo} alt={name} onError={() => setFailed(true)} />
  );
}

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.2V17h16V7.2l-8 5.3-8-5.3ZM5.4 7l6.6 4.4L18.6 7H5.4Z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z" />
  </svg>
);

export default function Contact() {
  return (
    <section className="contact">
      <h1>Get in touch</h1>
      <p className="lead">Questions, ideas, or something not working? Write to either of us.</p>
      <div className="contact-cards">
        {TEAM.map((p) => (
          <article key={p.name} className={`contact-card tone-${p.tone}`}>
            <div className="contact-band" />
            <Avatar name={p.name} photo={p.photo} />
            <h2>{p.name}</h2>
            <p className="contact-role">{p.role}</p>
            {p.line && <p className="contact-line">{p.line}</p>}
            <div className="contact-links">
              {p.email && (
                <a className="contact-btn" href={`mailto:${p.email}`}>
                  <MailIcon /> {p.email}
                </a>
              )}
              {p.linkedin && (
                <a className="contact-btn" href={p.linkedin} target="_blank" rel="noreferrer">
                  <LinkedInIcon /> LinkedIn
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

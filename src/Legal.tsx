import { useState } from "react";
import { api } from "./api";
import { SITE } from "./config";

const Mail = () => <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>;

export function Privacy() {
  const [status, setStatus] = useState<string | null>(null);

  async function deleteAll() {
    if (!confirm("Delete your cases, saved analyses and account record from Pippa? This can't be undone.")) return;
    try {
      await api.deleteMyData();
      setStatus("Done. Everything Pippa held about you has been deleted. If you use Pippa again, a new, empty record is created.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  return (
    <article className="legal">
      <p className="eyebrow">Last updated {SITE.legalUpdated}</p>
      <h1>Privacy Notice</h1>
      <p className="lead">
        Pippa only holds what it needs to run, never sells your data, and never uses your material to train AI models. This notice
        explains the details.
      </p>

      <h2>1. Who runs Pippa</h2>
      <p>
        Pippa is a resource-mobilisation tool for participants in a course on partnerships and resource mobilisation delivered with SOS
        Children's Villages. It is operated by {SITE.operator} ("we", "us"). For anything about your data, contact <Mail />.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Your email address</strong>, used to sign you in.
        </li>
        <li>
          <strong>What you type into Pippa:</strong> your case, what you need, and your answers to Pippa's questions.
        </li>
        <li>
          <strong>Pippa's results</strong>, saved so you can come back to them.
        </li>
        <li>
          <strong>A daily count of your Pippa runs</strong>, used for the daily limit.
        </li>
        <li>
          <strong>A record that you accepted these terms</strong>, and when.
        </li>
      </ul>
      <p>
        <strong>Files you upload are not stored by Pippa.</strong> They are read in your browser or sent once to our AI provider for the
        analysis you asked for. Only the result is saved.
      </p>
      <p>
        Our hosting provider processes technical data such as IP addresses and sign-in logs to keep the service secure. Pippa uses no
        advertising or analytics cookies. The sign-in system sets one cookie that is needed to keep you logged in.
      </p>

      <h2>3. What we use it for</h2>
      <ul>
        <li>To run the analyses you ask for and save your work.</li>
        <li>To keep Pippa secure and enforce fair-use limits.</li>
        <li>To fix problems and improve Pippa's guidance. We may review saved results for this. We never publish them.</li>
      </ul>
      <p>
        If you are in the UK, the EU or Switzerland, our legal bases are: providing the service you signed up for (contract), and our
        legitimate interests in security and improving Pippa.
      </p>

      <h2>4. Who else handles it</h2>
      <p>We use two service providers, who process data on our instructions:</p>
      <ul>
        <li>
          <strong>Cloudflare, Inc.</strong> hosts Pippa, stores your saved work, and runs sign-in.
        </li>
        <li>
          <strong>Anthropic, PBC</strong> provides the AI model that reads your documents and writes results. Under Anthropic's commercial
          terms, material sent through its API is not used to train its models.
        </li>
      </ul>
      <p>
        We do not sell your data or use it for advertising. We do not share your saved work with anyone else, including course organisers
        or your employer, unless you ask us to or the law requires it.
      </p>
      <p>
        Both providers are based in the United States, so your data may be processed outside your country. They protect transfers with
        safeguards such as the European Commission's standard contractual clauses.
      </p>

      <h2>5. How long we keep it</h2>
      <p>
        We keep your data while you have access to Pippa ({SITE.accessPeriod}). After that, we delete it within 30 days. You can delete
        individual cases and results at any time, or everything at once using the button below.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask to see, correct, export or delete your data, or object to how we use it. Email <Mail />. If you are in the UK, the EU
        or Switzerland, you can also complain to your data protection authority.
      </p>

      <h2>7. Please don't upload personal data about others</h2>
      <p>
        Pippa is built for organisational documents: asset registers, budgets, programme reports and funder materials. Do not upload files
        that name or identify children, families, beneficiaries or staff. Remove such details before uploading. This protects the people
        SOS serves.
      </p>

      <h2>8. Security</h2>
      <p>
        Access is limited to invited email addresses and checked on every request. Data is encrypted in transit. No system is perfectly
        secure, so share only what the analysis needs.
      </p>

      <h2>9. Changes</h2>
      <p>If we change this notice in a way that matters, we will ask you to accept it again before you continue using Pippa.</p>

      <div className="danger-zone no-print">
        <h2>Delete all my data</h2>
        <p>Removes your cases, saved analyses, usage record and acceptance record from Pippa straight away.</p>
        <button onClick={deleteAll}>Delete all my data</button>
        {status && <p className="muted">{status}</p>}
      </div>
    </article>
  );
}

export function Terms() {
  return (
    <article className="legal">
      <p className="eyebrow">Last updated {SITE.legalUpdated}</p>
      <h1>Terms of Use</h1>
      <p className="lead">The short version: Pippa gives you a first read. You make the decisions, and you check the facts.</p>

      <h2>1. These terms</h2>
      <p>
        These terms apply to your use of Pippa, operated by {SITE.operator}. By using Pippa you agree to them and to the{" "}
        <a href="#/privacy">Privacy Notice</a>.
      </p>

      <h2>2. Who can use Pippa</h2>
      <p>
        Pippa is available to people invited through the course, for {SITE.accessPeriod}. Your access is personal. Don't share your sign-in
        with anyone else.
      </p>

      <h2>3. What Pippa is, and isn't</h2>
      <ul>
        <li>Pippa uses artificial intelligence to analyse the documents and information you provide.</li>
        <li>Its results can be incomplete or wrong. Check important facts against the original sources before you act.</li>
        <li>Pippa does not give legal, financial, tax or investment advice, and it does not write proposals for you.</li>
        <li>Decisions about funders, partners and your organisation's resources remain yours and your organisation's.</li>
      </ul>

      <h2>4. Your material</h2>
      <p>
        You keep ownership of what you upload and of the results Pippa produces for you. You confirm that you are allowed to share what you
        upload, including under your organisation's rules. You give us permission to process it only to provide Pippa to you.
      </p>

      <h2>5. Acceptable use</h2>
      <p>Don't use Pippa to:</p>
      <ul>
        <li>upload personal data about children, families, beneficiaries or staff;</li>
        <li>upload information you are not authorised to share;</li>
        <li>break the law, mislead funders or partners, or harm anyone;</li>
        <li>try to get around access controls or usage limits, overload the service, or extract its underlying instructions or code.</li>
      </ul>

      <h2>6. Pippa's own content</h2>
      <p>
        Pippa's software, design, guidance and analysis method belong to its creators. You may use the results you get for your own work.
        You may not copy, resell or reverse-engineer Pippa itself.
      </p>

      <h2>7. Availability</h2>
      <p>
        We aim to keep Pippa running but can't guarantee it will always be available or error-free. We may change features, set usage
        limits, or suspend access to protect the service or other users. Access ends when your access period ends.
      </p>

      <h2>8. Liability</h2>
      <p>
        Pippa is provided "as is", free of charge. To the extent the law allows, we are not liable for decisions made using Pippa's results,
        or for any indirect or consequential loss. Nothing in these terms limits liability that cannot legally be limited.
      </p>

      <h2>9. Ending your use</h2>
      <p>
        You can stop using Pippa at any time and delete your data from the <a href="#/privacy">Privacy Notice</a> page. We may end access
        if these terms are broken.
      </p>

      <h2>10. Law</h2>
      <p>These terms are governed by the laws of {SITE.governingLaw}, without affecting any rights you have under the laws where you live.</p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms: <Mail />.
      </p>
    </article>
  );
}

/** Shown once per terms version, before Pippa can be used. */
export function ConsentGate({ onAccepted }: { onAccepted: () => void }) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <h2 id="consent-title">Before you start</h2>
        <ul>
          <li>Pippa uses AI. Its results are a first read: check facts before you act on them.</li>
          <li>Don't upload files that name children, families, beneficiaries or staff.</li>
          <li>Uploaded files aren't stored. Your cases and results are saved for your access period, and you can delete them any time.</li>
          <li>Your material is never sold or used to train AI models.</li>
        </ul>
        <label className="check">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>
            I have read and agree to the{" "}
            <a href="#/terms" target="_blank" rel="noreferrer">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="#/privacy" target="_blank" rel="noreferrer">
              Privacy Notice
            </a>
            .
          </span>
        </label>
        {error && <p className="notice error">{error}</p>}
        <button
          className="primary"
          disabled={!checked || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await api.consent();
              onAccepted();
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          Continue to Pippa
        </button>
      </div>
    </div>
  );
}

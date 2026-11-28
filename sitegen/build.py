"""Builds the public site's pages into ../site. Run: python3 sitegen/build.py
Each page shares one header and footer so they stay identical."""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site"
APP = "https://pippa.maahigupta.workers.dev/"
ACCESS = "mailto:maahigupta@gmail.com?subject=Pippa%20access"
TAGLINE = "Your strongest grant proposal is already on your books."
DESCRIPTOR = "An advisor for resource mobilisation"

LOGO = """<svg class="logo-mark" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="25" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M27 7 L32 27 L27 24 L22 27Z" fill="#3f7a69"/><path d="M27 47 L22 27 L27 30 L32 27Z" fill="#f2d35b" stroke="currentColor" stroke-width="1"/><circle cx="27" cy="27" r="2.2" fill="currentColor"/></svg>"""

PAGES = [  # slug, nav label, title
    ("why", "Why now", "Why now"),
    ("method", "The method", "The method"),
    ("tools", "The tools", "The tools"),
    ("team", "Team", "Meet the team"),
    ("contact", "Contact", "Contact"),
]
ARROW = '<svg class="arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def href(slug):
    return "/" if slug == "home" else f"/{slug}"


def header(current):
    links = "".join(
        f'<a href="{href(s)}"{" aria-current=\"page\"" if s == current else ""}>{label}</a>' for s, label, _ in PAGES
    )
    return f"""<header class="masthead" id="masthead">
  <div class="mast-top">
    <a class="brand" href="/" aria-label="Pippa home">{LOGO}<span class="brand-name">Pippa</span></a>
    <p class="descriptor">{DESCRIPTOR}</p>
    <button class="menu-btn" aria-expanded="false" aria-controls="mast-nav">Menu</button>
  </div>
  <div class="mast-row" id="mast-nav">
    <a class="brand brand-mini" href="/" aria-label="Pippa home">{LOGO}<span class="brand-name">Pippa</span></a>
    <nav class="mast-links" aria-label="Main">{links}</nav>
    <div class="mast-actions"><a href="{APP}">Sign in</a><a class="req" href="{ACCESS}">Request access</a></div>
  </div>
</header>"""


def footer():
    links = "".join(f'<a href="{href(s)}">{label}</a>' for s, label, _ in PAGES)
    return f"""<footer class="foot">
  <div class="foot-inner">
    <a class="brand foot-brand" href="/">{LOGO}<span class="brand-name">Pippa</span></a>
    <p class="foot-tag">Find what you already have. Then find who to ask, and how.</p>
    <nav class="foot-links" aria-label="Footer">{links}<a href="{APP}">Sign in</a></nav>
    <p class="foot-copy">© 2026 Pippa. All rights reserved. Pippa uses AI; check results before you act on them.</p>
  </div>
</footer>"""


def next_link(slug):
    order = ["home"] + [p[0] for p in PAGES]
    i = order.index(slug)
    if i + 1 >= len(order):
        return ""
    nxt = order[i + 1]
    label = dict((s, t) for s, _, t in PAGES)[nxt]
    return f"""<a class="next" href="{href(nxt)}" data-reveal><span class="next-k">Next</span><span class="next-t">{label}</span>{ARROW}</a>"""


def page(slug, title, body, desc):
    full_title = "Pippa" if slug == "home" else f"{title} · Pippa"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{full_title}</title>
<meta name="description" content="{desc}" />
<meta property="og:title" content="{full_title}" />
<meta property="og:description" content="{desc}" />
<meta name="theme-color" content="#14231F" />
<script>document.documentElement.classList.add("js")</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="preload" href="/fonts/eb-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/styles.css" />
</head>
<body data-page="{slug}">
<a class="skip" href="#main">Skip to content</a>
{header(slug)}
<main id="main">
{body}
<div class="wrap next-wrap">{next_link(slug)}</div>
</main>
{footer()}
<script src="/main.js" defer></script>
</body>
</html>
"""


# ---------------------------------------------------------------- shared blocks
CHART = """<section class="aid" data-reveal>
  <div class="wrap aid-grid">
    <figure class="chart" id="aid-chart" aria-label="Official development assistance from DAC members: 211.0 billion US dollars in 2022, 223.7 in 2023, 214.6 in 2024 and 174.3 in 2025, preliminary.">
      <figcaption class="chart-title">Official development assistance, DAC members, USD billion</figcaption>
      <svg viewBox="0 0 600 340" role="presentation">
        <g class="grid">
          <line x1="40" x2="600" y1="237.5" y2="237.5"/><line x1="40" x2="600" y1="175" y2="175"/>
          <line x1="40" x2="600" y1="112.5" y2="112.5"/><line x1="40" x2="600" y1="50" y2="50"/>
        </g>
        <g class="axis-t"><text x="0" y="304">0</text><text x="0" y="241">50</text><text x="0" y="179">100</text><text x="0" y="116">150</text><text x="0" y="54">200</text></g>
        <line class="base" x1="40" x2="600" y1="300" y2="300"/>
        <g class="bars">
          <rect x="70" y="36.25" width="92" height="263.75" style="--d:0ms"/>
          <rect x="200" y="20.4" width="92" height="279.6" class="hi" style="--d:120ms"/>
          <rect x="330" y="31.75" width="92" height="268.25" style="--d:240ms"/>
          <rect x="460" y="82.1" width="92" height="217.9" class="drop" style="--d:420ms"/>
        </g>
        <rect class="lost" x="460" y="31.75" width="92" height="50.35"/>
        <g class="vals">
          <text x="116" y="28" data-count="211.0">211.0</text><text x="246" y="13" data-count="223.7">223.7</text>
          <text x="376" y="24" data-count="214.6">214.6</text><text x="506" y="108" class="dark" data-count="174.3">174.3</text>
          <text x="506" y="62" class="lostlabel">−23.1%</text>
        </g>
        <g class="years"><text x="116" y="324">2022</text><text x="246" y="324">2023</text><text x="376" y="324">2024</text><text x="506" y="324">2025*</text></g>
      </svg>
      <p class="chart-src">Source: <a href="https://www.oecd.org/en/about/news/press-releases/2026/04/international-aid-fell-sharply-in-2025-says-oecd.html" target="_blank" rel="noreferrer">OECD</a>. *Preliminary.</p>
    </figure>
    <div class="aid-copy">
      <h2>Aid had its largest fall on record.</h2>
      <p class="lede">The funders who remain want partners who bring something to the table.</p>
      <dl class="stats">
        <div data-reveal><dt><span data-count="40" data-prefix="$" data-suffix="bn">$40bn</span></dt><dd>less aid in 2025 than in 2024. Back to 2015 levels, in real terms.</dd></div>
        <div data-reveal><dt>¾</dt><dd>of the drop came from the United States, which cut its aid by 56.9%.</dd></div>
        <div data-reveal><dt>2026</dt><dd>The OECD expects a third straight year of decline.</dd></div>
      </dl>
    </div>
  </div>
</section>"""

MOCKS = """<div class="mocks">
  <article class="mock mock-verdict" data-reveal>
    <p class="mock-k">Funder check</p>
    <p class="mock-verdict-word">Pursue narrowly</p>
    <p class="mock-text">Good fit for youth skills in the unused workshop. They don't fund buildings.</p>
    <div class="mock-scores">
      <div><span>Material fit</span><b>71</b><i style="--w:71%"></i></div>
      <div><span>Symbolic fit</span><b>78</b><i style="--w:78%"></i></div>
      <div><span>Drift risk</span><b>24</b><i style="--w:24%"></i></div>
    </div>
    <div class="mock-checks"><span class="ok">Geography</span><span class="ok">Audited accounts</span><span class="no">Construction</span><span class="q">Co-funding</span></div>
  </article>
  <article class="mock mock-opp" data-reveal>
    <p class="mock-k">Internal resources</p>
    <h3>Train teachers in the hall you already own</h3>
    <p class="mock-text">The hall is used two days a month. Hosting training there saves about USD 12,000 per school.</p>
    <p class="mock-src">From your register: B-002, multipurpose hall</p>
    <div class="mock-pills"><span>Risk: low</span><span>Effort: low</span><span>Confidence: high</span></div>
  </article>
</div>"""

# ---------------------------------------------------------------- pages
HOME = f"""<section class="hero wrap">
  <div class="hero-copy">
    <h1 class="split">{TAGLINE}</h1>
    <p class="hero-sub" data-reveal>Pippa reads your registers, budgets and funder documents. It shows what you can bring to the table, which funders fit, and how to ask.</p>
    <div class="ctas" data-reveal><a class="btn btn-ink" href="{ACCESS}">Request access</a><a class="btn btn-line" href="/method">See the method</a></div>
  </div>
  <figure class="register" aria-label="Pippa reading an asset register">
    <div class="register-head"><span class="register-title">Asset register</span><span class="register-status" aria-live="polite"><span class="pulse" aria-hidden="true"></span><span id="reg-status">Reading line 1 of 9</span></span></div>
    <div class="register-cols" aria-hidden="true"><span>Item</span><span>Recorded use</span><span class="num">Book value</span></div>
    <ol class="register-rows" id="reg-rows"></ol>
    <div class="register-tray"><div class="tray-head"><span>Found</span><span class="tray-total" id="reg-total">USD 0 a year</span></div><ul class="tray-items" id="reg-tray"></ul></div>
    <figcaption class="register-note">Illustrative register. Pippa cites the line behind every finding.</figcaption>
  </figure>
</section>

<section class="route">
  <div class="wrap">
    <div class="block-head route-head" data-reveal>
      <h2>From case to ask.</h2>
      <p>The order good fundraisers already work in. You bring the documents. Pippa does the reading.</p>
    </div>
    <ol class="route-steps">
      <li class="rstep" data-reveal>
        <div class="vig vig-case" aria-hidden="true">
          <p class="vig-k">Who are you?</p>
          <div class="vig-chips"><span class="on">Organisation</span><span>Researcher</span><span>Student</span></div>
          <p class="vig-k">The problem</p>
          <p class="vig-type"><span>Classrooms at twice capacity in Kumasi</span></p>
          <p class="vig-k">The ask</p>
          <p class="vig-type d2"><span>USD 120,000 to 180,000</span></p>
        </div>
        <div class="rstep-body"><span class="rstep-n">1</span><div><h3>Frame the case</h3><p>Who you are, the problem, and why your approach works. Pippa tailors everything after to it.</p></div></div>
      </li>
      <li class="rstep" data-reveal>
        <div class="vig vig-in" aria-hidden="true">
          <div class="vig-row hl"><span>Hall, 120 seats</span><em>2 days a month</em></div>
          <div class="vig-row flag"><span>Dental chair</span><em>Restricted</em></div>
          <div class="vig-row hl d2"><span>Carpentry workshop</span><em>Closed since 2023</em></div>
          <div class="vig-total"><span>Found</span><b>USD 30,500 a year</b></div>
        </div>
        <div class="rstep-body"><span class="rstep-n">2</span><div><h3>Look inward</h3><p>Space, equipment, skills and money you're not using. And what must stay untouched.</p></div></div>
      </li>
      <li class="rstep" data-reveal>
        <div class="vig vig-out" aria-hidden="true">
          <div class="vig-funder">
            <svg class="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" class="ring-bg"/><circle cx="22" cy="22" r="18" class="ring-fg"/></svg>
            <div><p class="vig-name">Harbourline Foundation</p><p class="vig-fit">Fit 78 of 100</p></div>
          </div>
          <p class="vig-verdict">Pursue narrowly</p>
          <p class="vig-k">Route in</p>
          <p class="vig-line">Youth skills window, with the workshop as co-financing</p>
        </div>
        <div class="rstep-body"><span class="rstep-n">3</span><div><h3>Look outward</h3><p>Which funders fit, the best route in, and what you can offer them in return.</p></div></div>
      </li>
    </ol>
  </div>
</section>

<section class="results">
  <div class="wrap">
    <div class="block-head" data-reveal>
      <h2>A verdict you can act on.</h2>
      <p>A short brief with a clear call, the reasons, and one next step with an owner.</p>
    </div>
    <div class="results-grid">
      {MOCKS}
      <ul class="callouts">
        <li data-reveal><b>Every claim has a source.</b> Each finding points to the line it came from.</li>
        <li data-reveal><b>One of four verdicts.</b> Pursue, pursue narrowly, hold, or don't pursue.</li>
        <li data-reveal><b>It knows what to leave alone.</b> Restricted assets and anything near children are flagged.</li>
      </ul>
    </div>
  </div>
</section>"""

WHY = f"""<section class="page-head wrap">
  <h1 class="split">Why now</h1>
  <p class="page-lede" data-reveal>Government aid is shrinking. Philanthropy can't fill the gap. Organisations that know what they hold will be first in line.</p>
</section>
{CHART}
<section class="wrap block">
  <ol class="points">
    <li data-reveal><span class="pt-n" aria-hidden="true"></span><div><h3>Philanthropy can't replace aid.</h3><p>Even the largest foundations say so. Private money is strongest where others won't go: early, risky, local work.</p></div></li>
    <li data-reveal><span class="pt-n" aria-hidden="true"></span><div><h3>Leverage beats replacement.</h3><p>Development banks now ask private funders to back the risky first stage. Bigger money follows what works. Every ask should say what it unlocks next.</p></div></li>
    <li data-reveal><span class="pt-n" aria-hidden="true"></span><div><h3>Funders want partners.</h3><p>Most give because a cause matches their values. They want to see what you bring, and what they get from working with you.</p></div></li>
    <li data-reveal><span class="pt-n" aria-hidden="true"></span><div><h3>Strings cost money.</h3><p>Tightly earmarked grants raise reporting costs and pull an organisation off its mission. How money comes matters as much as how much.</p></div></li>
  </ol>
</section>"""

METHOD = f"""<section class="page-head wrap">
  <h1 class="split">The method</h1>
  <p class="page-lede" data-reveal>Pippa follows Quo Vadis, a method for resource mobilisation developed by Andras Vamos-Goldman. Five moves, always in this order.</p>
</section>
<section class="wrap block">
  <ol class="steps" id="steps">
    <li data-reveal><span class="step-n">1</span><div><h3>Frame the case</h3><p>What exactly are you solving, and how? Who is affected, who could help, who might resist? Why would anyone back this approach?</p></div></li>
    <li data-reveal><span class="step-n">2</span><div><h3>Before the beginning</h3><p>Where does the need sit in your goals and your structure? Could it scale? Plan for that early, because it shapes the ask.</p></div></li>
    <li data-reveal><span class="step-n">3</span><div><h3>Look inward first</h3><p>Office, then region, then the whole organisation. Internal resources rarely cover everything. They cut the ask and give you something to offer.</p>
      <div class="kinds">
        <div><b>Human</b><span>Skills staff already have that others would pay for.</span></div>
        <div><b>Material</b><span>Buildings, vehicles, land and equipment with spare capacity.</span></div>
        <div><b>Project</b><span>Room in running projects, like a clinic or a school.</span></div>
        <div><b>Saving</b><span>Costs you can cut or share with a partner.</span></div>
      </div></div></li>
    <li data-reveal><span class="step-n">4</span><div><h3>Then look outward</h3><p>Ask for a range, never one number. Pick the form that fits: grant, loan, in-kind or partnership. Decide whose money you'll accept. Say plainly what the funder gains.</p></div></li>
    <li data-reveal><span class="step-n">5</span><div><h3>Think about the system</h3><p>Could this project change what causes the need in the first place? Say so only when it's real. One line is enough.</p></div></li>
  </ol>
</section>"""

TOOLS = f"""<section class="page-head wrap">
  <h1 class="split">The tools</h1>
  <p class="page-lede" data-reveal>Three steps and an advisor on call. Upload what you have, answer a few sharp questions, get a brief.</p>
</section>
<section class="wrap block">
  <div class="tool-list">
    <article data-reveal><span class="tool-n">1</span><h3>Your case</h3><p>Say who you are, what you need, and the problem you're solving. Pippa tailors every analysis to it.</p></article>
    <article data-reveal><span class="tool-n">2</span><h3>Internal resources</h3><p>Upload an asset register, budget or programme report. Pippa finds what's sitting unused and ranks it by risk, effort and confidence.</p></article>
    <article data-reveal><span class="tool-n">3</span><h3>Funder check</h3><p>Add a funder's own materials. Pippa checks eligibility, scores the fit, names the route in, and says what you can offer.</p></article>
    <article data-reveal><span class="tool-n">+</span><h3>Ask Pippa</h3><p>Questions about a result? Ask. Answers stay grounded in your documents.</p></article>
  </div>
</section>
<section class="results">
  <div class="wrap">
    <div class="block-head" data-reveal><h2>What a result looks like.</h2><p>Short, boxed and scored. Built for people who have ten minutes, not an afternoon.</p></div>
    <div class="results-grid">{MOCKS}
      <ul class="callouts">
        <li data-reveal><b>Works only from what you give it.</b> No browsing, no guessing. Missing facts are listed as missing.</li>
        <li data-reveal><b>Asks before it answers.</b> Up to four questions about gaps that would change the verdict.</li>
        <li data-reveal><b>Leaves the right things alone.</b> Donor-restricted assets and anything near children are never offered up.</li>
      </ul>
    </div>
  </div>
</section>"""

TEAM = f"""<section class="page-head wrap">
  <h1 class="split">Meet the team</h1>
</section>
<section class="wrap block">
  <div class="people">
    <article class="person" data-reveal>
      <div class="photo"><img src="/img/maahi.jpg" alt="Maahi Gupta" width="480" height="480" /></div>
      <h2>Maahi Gupta</h2>
      <p class="role">Design and build</p>
      <p>Designed and built Pippa. M.S. in Transnational Security, NYU Center for Global Affairs.</p>
      <p class="links"><a href="mailto:maahigupta@gmail.com">maahigupta@gmail.com</a><a href="https://www.linkedin.com/in/maahi-gupta-708b2221b/" target="_blank" rel="noreferrer">LinkedIn</a></p>
    </article>
    <article class="person" data-reveal>
      <div class="photo alt"><img src="/img/andras.jpg" alt="Andras Vamos-Goldman" width="480" height="480" /></div>
      <h2>Andras Vamos-Goldman</h2>
      <p class="role">Concept and method</p>
      <p>Conceived Pippa and the Quo Vadis method. Canadian diplomat, international lawyer and social entrepreneur.</p>
      <p class="links"><a href="mailto:andrasvg@gmail.com">andrasvg@gmail.com</a><a href="https://www.linkedin.com/in/andras-vamos-goldman-72563a31/" target="_blank" rel="noreferrer">LinkedIn</a></p>
    </article>
  </div>
</section>"""

ICON_KEY = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12.5 12H21M18 12v3M21 12v2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
ICON_DOC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M14 3v4h4M9 12h6M9 16h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
ICON_HAND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v11H4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m4 8 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'

FAQS = [
    ("Who is Pippa for?", "Organisations and individuals looking for resources for a cause. That includes non-profits and programme teams, social entrepreneurs, and researchers or students applying for grants, fellowships and scholarships."),
    ("What does Pippa help with?", "Three things. It finds resources you already have and can use or offer. It assesses whether a funder is worth your time and how to approach them. And it helps you frame the ask: how much, in what form, and what the funder gains."),
    ("What do I need to get started?", "A short description of your case, and whatever documents you have. For organisations, that might be an asset register, a budget or a programme report. For individuals, a CV, a project outline or a call for applications. Add a funder's own guidelines to check your fit."),
    ("Does Pippa find funders for me?", "Pippa assesses the funders you bring to it in depth, and tells you which kinds of funder suit your case and where to look next."),
    ("How is my information handled?", "Uploaded files are read for your analysis and are not kept. Results are saved to your account so you can return to them, and you can delete them at any time. Nothing you share is used to train AI models."),
    ("How do I get access?", "Pippa is in a closed pilot. Write to us with a line about who you are and what you're raising money for, and we'll set you up."),
]

CONTACT = f"""<section class="faq wrap">
  <h1 class="faq-title split">How can we help?</h1>
  <div class="support" data-reveal>
    <div class="support-block"><span class="support-icon">{ICON_KEY}</span><div><h2>Getting access</h2><p>Pippa is in a closed pilot. Tell us about your organisation and we'll set you up.</p><a class="tlink" href="{ACCESS}">Request access {ARROW}</a></div></div>
    <div class="support-block"><span class="support-icon">{ICON_DOC}</span><div><h2>Your documents</h2><p>Files are read once and not kept. Nothing you upload trains AI models.</p><a class="tlink" href="#questions">How we handle data {ARROW}</a></div></div>
    <div class="support-block"><span class="support-icon">{ICON_HAND}</span><div><h2>Working with us</h2><p>Partnerships, pilots or press. Write to either of us and we'll reply within a few days.</p><a class="tlink" href="mailto:maahigupta@gmail.com,andrasvg@gmail.com?subject=Pippa">Email the team {ARROW}</a></div></div>
  </div>
  <div class="qa" id="questions">
    <h2 class="qa-title" data-reveal>Questions</h2>
    {"".join(f'<details data-reveal><summary>{q}<span class="pm" aria-hidden="true"></span></summary><p>{a}</p></details>' for q, a in FAQS)}
  </div>
</section>"""

BODIES = {
    "home": ("Pippa", HOME, "Pippa reads your registers, budgets and funder documents. It shows what you can bring to the table, which funders fit, and how to ask."),
    "why": ("Why now", WHY, "Government aid had its largest fall on record in 2025. Funders who remain want partners who bring something to the table."),
    "method": ("The method", METHOD, "Pippa follows Quo Vadis: frame the case, look inward first, then look outward."),
    "tools": ("The tools", TOOLS, "Your case, internal resources, funder check, and an advisor on call."),
    "team": ("Meet the team", TEAM, "Maahi Gupta and Andras Vamos-Goldman."),
    "contact": ("Contact", CONTACT, "Getting access, your documents, and working with us."),
}

for slug, (title, body, desc) in BODIES.items():
    name = "index.html" if slug == "home" else f"{slug}.html"
    (OUT / name).write_text(page(slug, title, body, desc))
    print("wrote", name)

(OUT / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><circle cx="27" cy="27" r="25" fill="#eef1ea" stroke="#14231f" stroke-width="3"/><path d="M27 7 L32 27 L27 24 L22 27Z" fill="#2f5d50"/><path d="M27 47 L22 27 L27 30 L32 27Z" fill="#f2d35b" stroke="#14231f"/></svg>'
)

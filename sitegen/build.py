"""Builds the public site's pages into ../site. Run: python3 sitegen/build.py
Each page shares one header and footer so they stay identical."""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "site"
APP = "https://pippa.maahigupta.workers.dev/"
ACCESS = "/access"
WEB3FORMS_KEY = "WEB3FORMS_KEY"  # paste the access key from web3forms.com here
TAGLINE = "Your strongest grant proposal is already on your books."
DESCRIPTOR = "An advisor for resource mobilisation"

LOGO = """<svg class="logo-mark" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="25" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M27 7 L32 27 L27 24 L22 27Z" fill="#3f7a69"/><path d="M27 47 L22 27 L27 30 L32 27Z" fill="#f2d35b" stroke="currentColor" stroke-width="1"/><circle cx="27" cy="27" r="2.2" fill="currentColor"/></svg>"""

PAGES = [  # slug, nav label, title (these appear in the nav, in this order)
    ("why", "Why now", "Why now"),
    ("how", "How it works", "How it works"),
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
    <nav class="foot-links" aria-label="Footer">{links}<a href="/privacy">Privacy</a><a href="{APP}">Sign in</a></nav>
    <p class="foot-copy">© 2026 Pippa. All rights reserved. Pippa uses AI; check results before you act on them.</p>
  </div>
</footer>"""


def next_link(slug):
    order = ["home"] + [p[0] for p in PAGES]
    if slug not in order:
        return ""
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
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Pippa" />
<meta property="og:url" content="https://pippa-site.maahigupta.workers.dev{href(slug)}" />
<meta property="og:image" content="https://pippa-site.maahigupta.workers.dev/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://pippa-site.maahigupta.workers.dev/og.png" />
<meta name="theme-color" content="#14231F" />
<script>document.documentElement.classList.add("js")</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
        <div data-reveal><dt><span data-count="40" data-prefix="$" data-suffix="bn">$40bn</span></dt><dd>less aid in 2025 than in 2024.</dd></div>
        <div data-reveal><dt>¾</dt><dd>of the drop came from the United States.</dd></div>
        <div data-reveal><dt>2026</dt><dd>A third year of decline expected.</dd></div>
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
    <div class="ctas" data-reveal><a class="btn btn-ink" href="{ACCESS}">Request access</a><a class="btn btn-line" href="/how">How it works</a></div>
  </div>
  <figure class="reframe" id="reframe" aria-label="Examples of what Pippa finds in your documents">
    <div class="rf-head"><span class="rf-title">Pippa is reading</span><span class="rf-status"><span class="pulse" aria-hidden="true"></span><span id="rf-src">Your asset register</span></span></div>
    <div class="rf-card rf-in"><p class="rf-k" id="rf-k-in">From your register</p><p class="rf-text" id="rf-in">A hall, used two days a month</p></div>
    <div class="rf-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4v15M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div class="rf-card rf-out"><p class="rf-k">Pippa finds</p><p class="rf-text" id="rf-out"><mark>A training venue a partner could fund.</mark> About USD 12,000 a year.</p></div>
    <div class="rf-dots" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></div>
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
"""

WHY = f"""<section class="page-head wrap">
  <h1 class="split">Why now</h1>
  <p class="page-lede" data-reveal>Outside money is shrinking, and what remains comes with conditions. The strongest asks now start from what you already hold. Pippa helps you see it, and put it to work.</p>
</section>
{CHART}
<section class="wrap block">
  <div class="block-head" data-reveal><h2>The gap Pippa fills.</h2><p>Funders have changed what they look for. Most asks haven't caught up.</p></div>
  <div class="gap">
    <div class="gap-side" data-reveal>
      <p class="gap-k">What funders look for now</p>
      <ul><li>Something to match their money</li><li>A clear return on their side</li><li>Partners who can stand on their own</li></ul>
    </div>
    <div class="gap-mid" aria-hidden="true"><span class="gap-line"></span><span class="gap-label">The gap</span><span class="gap-line"></span></div>
    <div class="gap-side" data-reveal>
      <p class="gap-k">What most asks still lead with</p>
      <ul><li>A budget</li><li>A need</li><li>A request for the full amount</li></ul>
    </div>
  </div>
  <p class="gap-bridge" data-reveal><b>Pippa closes it.</b> It finds what you already hold, shows how a funder would value it, and helps you build an ask around it.</p>
</section>
<section class="decide">
  <div class="wrap decide-grid">
    <div data-reveal>
      <h2>Pippa advises.<br />You decide.</h2>
    </div>
    <div data-reveal>
      <p class="decide-lede">Many AI tools hand you a finished answer. Pippa hands you a judgement you can test: every finding sourced, every verdict explained, every risk named. What happens next is your call.</p>
      <dl class="decide-list">
        <div><dt>Sourced</dt><dd>Each point leads back to the line or page it came from.</dd></div>
        <div><dt>Explained</dt><dd>Verdicts come with the reasons, and what would change them.</dd></div>
        <div><dt>Yours</dt><dd>Pippa never writes your proposal or decides for you.</dd></div>
      </dl>
    </div>
  </div>
</section>"""

HOW = f"""<section class="page-head wrap">
  <h1 class="split">How it works</h1>
  <p class="page-lede" data-reveal>Pippa reads what you bring, weighs it against what funders look for, and returns a short, sourced brief. You stay in charge of every decision.</p>
</section>
<section class="wrap block">
  <div class="tool-list">
    <article data-reveal><span class="tool-n">1</span><div><p class="tool-k">Frame the case</p><h3>Your case</h3><p>A structured brief on who you are, what you want to change and what you need. Every analysis reads from it, so the advice fits an organisation, a research group or a single applicant.</p><dl class="gg"><div><dt>You give</dt><dd>A few short answers</dd></div><div><dt>You get</dt><dd>Advice fitted to you</dd></div></dl></div></article>
    <article data-reveal><span class="tool-n">2</span><div><p class="tool-k">Look inward first</p><h3>Internal resources</h3><p>Registers, budgets and reports, read for capacity that is idle, underused or shareable. Each opportunity is weighed for mission risk, effort and confidence.</p><dl class="gg"><div><dt>You give</dt><dd>A register, budget or CV</dd></div><div><dt>You get</dt><dd>Ranked opportunities, with sources</dd></div></dl></div></article>
    <article data-reveal><span class="tool-n">3</span><div><p class="tool-k">Then look outward</p><h3>Funder check</h3><p>A funder's own guidelines and past grants, read against your case. Pippa tests eligibility, scores the fit, names the way in and sets out what the partnership offers them.</p><dl class="gg"><div><dt>You give</dt><dd>The funder's own materials</dd></div><div><dt>You get</dt><dd>A verdict, a route in, an ask</dd></div></dl></div></article>
    <article data-reveal><span class="tool-n">4</span><div><p class="tool-k">On call</p><h3>Ask Pippa</h3><p>Press on any finding, test a framing, or ask what would change the verdict. Answers stay grounded in your documents.</p><dl class="gg"><div><dt>You give</dt><dd>A question</dd></div><div><dt>You get</dt><dd>A straight answer</dd></div></dl></div></article>
  </div>
</section>
<section class="kinds-band">
  <div class="wrap">
    <div class="block-head" data-reveal><h2>What Pippa recognises.</h2><p>Four kinds of resource, each framed the way a funder would value it.</p></div>
    <div class="kinds">
      <div data-reveal><b>Human</b><p class="see"><span>In your documents</span>A trainer on staff</p><p class="sees"><span>Pippa frames it as</span>A service partners would pay for, or count as co-financing</p></div>
      <div data-reveal><b>Material</b><p class="see"><span>In your documents</span>A hall used twice a month</p><p class="sees"><span>Pippa frames it as</span>A venue to share, rent or offer in kind</p></div>
      <div data-reveal><b>Project</b><p class="see"><span>In your documents</span>A lab idle at weekends</p><p class="sees"><span>Pippa frames it as</span>Capacity a partner could fund and use</p></div>
      <div data-reveal><b>Saving</b><p class="see"><span>In your documents</span>Transport costs you share</p><p class="sees"><span>Pippa frames it as</span>Money freed for the project, and a partner with a stake</p></div>
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
      <p>Conceived Pippa and the thinking behind it. Canadian diplomat, international lawyer and social entrepreneur.</p>
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
    ("What do I need to get started?", "A short description of your case and the documents you have to hand. For organisations, that may be an asset register, a budget or a programme report. For individuals, a CV, a project outline or a call for applications. Add a funder's guidelines to test your fit."),
    ("Does Pippa find funders for me?", "Pippa assesses the funders you bring to it in depth, and tells you which kinds of funder suit your case and where to look next."),
    ("How is my information handled?", "Uploaded files are read for your analysis and are not kept. Results are saved to your account so you can return to them, and you can delete them at any time. Nothing you share is used to train AI models."),
    ("How do I get access?", "Write to us with a short note on who you are and what you're raising funds for. We'll review your case and get back to you."),
]

CONTACT = f"""<section class="faq wrap">
  <h1 class="faq-title split">How can we help?</h1>
  <div class="support" data-reveal>
    <div class="support-block"><span class="support-icon">{ICON_KEY}</span><div><h2>Getting access</h2><p>Pippa is in early access. Tell us about your case and we'll review it and be in touch.</p><a class="tlink" href="{ACCESS}">Request access {ARROW}</a></div></div>
    <div class="support-block"><span class="support-icon">{ICON_DOC}</span><div><h2>Your documents</h2><p>Files are read for your analysis and never kept. Nothing you share trains AI models.</p><a class="tlink" href="/privacy">How we handle data {ARROW}</a></div></div>
    <div class="support-block"><span class="support-icon">{ICON_HAND}</span><div><h2>Working with us</h2><p>For partnerships, research collaborations and press enquiries, write to the team. We aim to reply within a week.</p><a class="tlink" href="mailto:maahigupta@gmail.com,andrasvg@gmail.com?subject=Pippa">Email the team {ARROW}</a></div></div>
  </div>
  <div class="qa" id="questions">
    <h2 class="qa-title" data-reveal>Questions</h2>
    {"".join(f'<details data-reveal><summary>{q}<span class="pm" aria-hidden="true"></span></summary><p>{a}</p></details>' for q, a in FAQS)}
  </div>
</section>"""


from personas_list import PERSONA_LABELS  # noqa: E402

ACCESS_PAGE = f"""<section class="wrap access">
  <div class="access-intro">
    <h1 class="split">Request access</h1>
    <p class="page-lede" data-reveal>Pippa is in early access. Tell us about your case and we'll review it and be in touch.</p>
    <ol class="next-steps">
      <li data-reveal><span>1</span><div><b>We read your note</b><p>Who you are, and what you're raising funds for.</p></div></li>
      <li data-reveal><span>2</span><div><b>We set you up</b><p>If Pippa fits, we add your email and send you a link to sign in.</p></div></li>
      <li data-reveal><span>3</span><div><b>You start with your case</b><p>Set out your case and run your first analysis in minutes.</p></div></li>
    </ol>
  </div>
  <form class="access-form" id="access-form" action="https://api.web3forms.com/submit" method="POST" data-key="{WEB3FORMS_KEY}" data-reveal>
    <input type="hidden" name="access_key" value="{WEB3FORMS_KEY}" />
    <input type="hidden" name="subject" value="Pippa access request" />
    <input type="hidden" name="from_name" value="Pippa website" />
    <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
    <div class="row2">
      <label><span>Name</span><input name="name" required autocomplete="name" /></label>
      <label><span>Email</span><input name="email" type="email" required autocomplete="email" /></label>
    </div>
    <label><span>Organisation or institution</span><input name="organisation" autocomplete="organization" /></label>
    <fieldset><legend>You are</legend><div class="radio-row">{"".join(f'<label class="pick"><input type="radio" name="who" value="{x}" required /><span>{x}</span></label>' for x in PERSONA_LABELS)}</div></fieldset>
    <label><span>What are you raising funds for?</span><textarea name="message" rows="4" required placeholder="A line or two is plenty."></textarea></label>
    <button class="btn btn-ink" type="submit">Send request</button>
    <p class="form-note" id="form-note" role="status" aria-live="polite">We only use these details to reply to you. <a href="/privacy">Privacy</a></p>
  </form>
</section>"""

PRIVACY_PAGE = """<section class="page-head wrap narrow">
  <h1 class="split">Privacy</h1>
  <p class="page-lede" data-reveal>Pippa holds only what it needs, never sells your data, and never uses your material to train AI models.</p>
</section>
<section class="wrap block narrow legal">
  <h2>This website</h2>
  <p>This site sets no cookies and runs no analytics or advertising. If you request access, we receive your name, email, organisation and message by email, through our form provider, Web3Forms. We use them only to reply to you, and delete them if you don't go on to use Pippa.</p>
  <h2>Using Pippa</h2>
  <p>When you sign in, Pippa stores your email address, the case you set up, your answers to its questions, and the results it gives you, so you can come back to them. It keeps a daily count of your runs for fair-use limits, and a record that you accepted its terms.</p>
  <p>Files you upload are not stored. They are read in your browser or sent once to our AI provider for the analysis you asked for. Only the result is saved. Questions you ask Pippa about a result are not stored either.</p>
  <h2>Who else handles it</h2>
  <p>Cloudflare hosts Pippa, stores your saved work and runs sign-in. Anthropic provides the AI model; under its commercial terms, material sent through its API is not used to train its models. Both are based in the United States. We don't sell your data or share your work with anyone else unless you ask us to or the law requires it.</p>
  <h2>How long we keep it</h2>
  <p>We keep your data while you have access to Pippa, and delete it within 30 days after. You can delete individual results, or everything at once, from inside Pippa at any time.</p>
  <h2>Your rights</h2>
  <p>You can ask to see, correct, export or delete your data. Write to <a href="mailto:maahigupta@gmail.com">maahigupta@gmail.com</a>. If you are in the UK, the EU or Switzerland, you can also complain to your data protection authority.</p>
  <h2>Please don't upload personal data about others</h2>
  <p>Remove names and details that identify beneficiaries, children, families or staff before you upload a document.</p>
</section>"""

BODIES = {
    "home": ("Pippa", HOME, "Pippa reads your registers, budgets and funder documents. It shows what you can bring to the table, which funders fit, and how to ask."),
    "why": ("Why now", WHY, "Government aid had its largest fall on record in 2025. Funders who remain want partners who bring something to the table."),
    "how": ("How it works", HOW, "Frame the case, look inward first, then look outward. Pippa does the reading."),
    "team": ("Meet the team", TEAM, "Maahi Gupta and Andras Vamos-Goldman."),
    "contact": ("Contact", CONTACT, "Getting access, your documents, and working with us."),
    "access": ("Request access", ACCESS_PAGE, "Request access to the Pippa pilot."),
    "privacy": ("Privacy", PRIVACY_PAGE, "How Pippa handles your information."),
}

for slug, (title, body, desc) in BODIES.items():
    name = "index.html" if slug == "home" else f"{slug}.html"
    (OUT / name).write_text(page(slug, title, body, desc))
    print("wrote", name)

(OUT / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54"><circle cx="27" cy="27" r="25" fill="#eef1ea" stroke="#14231f" stroke-width="3"/><path d="M27 7 L32 27 L27 24 L22 27Z" fill="#2f5d50"/><path d="M27 47 L22 27 L27 30 L32 27Z" fill="#f2d35b" stroke="#14231f"/></svg>'
)

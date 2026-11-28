// Pippa public site: masthead, scroll reveals, chart, method progress, and the hero register.
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Masthead: collapse the top tier on scroll; mobile menu */
  const mast = document.getElementById("masthead");
  const onScroll = () => mast && mast.classList.toggle("compact", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const btn = document.querySelector(".menu-btn");
  const row = document.getElementById("mast-nav");
  btn?.addEventListener("click", () => {
    const open = row.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Menu";
  });

  /* Headlines: split into words that rise in one by one */
  document.querySelectorAll(".split").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${w}</span>`).join(" ");
  });

  /* Count-up numbers */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    if (reduced) return;
    const start = performance.now(), dur = 1100;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      el.textContent = pre + (target * (1 - Math.pow(1 - k, 3))).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* Scroll reveal, staggered among siblings that arrive together */
  const io = new IntersectionObserver((entries) => {
    let n = 0;
    entries.filter((e) => e.isIntersecting).forEach((e) => {
      e.target.style.setProperty("--stagger", `${Math.min(n++, 4) * 90}ms`);
      e.target.classList.add("in");
      e.target.querySelectorAll?.("dt [data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  /* Chart: bars grow and values count up when it comes into view */
  const chart = document.getElementById("aid-chart");
  if (chart) {
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      chart.classList.add("in");
      chart.querySelectorAll(".vals [data-count]").forEach((t, i) => setTimeout(() => countUp(t), 500 + i * 120));
      obs.disconnect();
    }, { threshold: 0.35 }).observe(chart);
  }

  /* Method page: a yellow line fills as you read down the steps */
  const steps = document.getElementById("steps");
  if (steps) {
    const items = [...steps.children];
    const update = () => {
      const r = steps.getBoundingClientRect();
      const mid = window.innerHeight * 0.55;
      const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      steps.style.setProperty("--p", p.toFixed(3));
      items.forEach((li) => li.classList.toggle("passed", li.getBoundingClientRect().top < mid));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* Hero register */
  const rowsEl = document.getElementById("reg-rows");
  if (!rowsEl) return;
  const ROWS = [
    { id: "A-014", item: "Minibus, 18 seats", use: "School runs, weekdays 7 to 9", value: "38,000" },
    { id: "B-002", item: "Multipurpose hall", use: "Used 2 days a month", value: "210,000", find: "Host teacher training in the hall", amount: 12000 },
    { id: "C-031", item: "Dental chair", use: "Donor-restricted", value: "9,400", restricted: true },
    { id: "B-007", item: "Guesthouse", use: "Empty outside visits", value: "164,000", restricted: true, flag: "Near children, leave alone" },
    { id: "D-110", item: "Carpentry workshop", use: "Closed since 2023", value: "52,000", find: "Youth skills course with a local trade school", amount: 18500 },
    { id: "A-020", item: "Solar array, 40 kW", use: "Surplus sold back at a loss", value: "61,000", find: "Sell surplus power to the clinic next door", amount: 6200 },
    { id: "E-003", item: "Farmland, 4 ha", use: "Bequest, terms unread", value: "88,000", restricted: true, flag: "Check bequest terms" },
    { id: "F-019", item: "Kitchen, commercial", use: "Lunch only, 5 days", value: "27,000", find: "Rent evening slots to a catering co-op", amount: 7800 },
    { id: "A-031", item: "Office laptops, 22", use: "In daily use", value: "17,600" },
  ];
  const trayEl = document.getElementById("reg-tray");
  const totalEl = document.getElementById("reg-total");
  const statusEl = document.getElementById("reg-status");
  const register = document.querySelector(".register");
  const fmt = (n) => "USD " + Math.round(n).toLocaleString("en-US") + " a year";

  function build() {
    rowsEl.innerHTML = ""; trayEl.innerHTML = ""; totalEl.textContent = fmt(0);
    for (const r of ROWS) {
      const li = document.createElement("li");
      li.className = "reg-row";
      li.innerHTML = `<span class="item"><span class="id">${r.id}</span>${r.item}</span>` +
        `<span class="use"><span class="use-text">${r.use}</span>` +
        (r.restricted ? `<span class="reg-flag">${r.flag || "Restricted, leave alone"}</span>` : "") +
        `</span><span class="num">${r.value}</span>`;
      rowsEl.appendChild(li);
    }
    return [...rowsEl.children];
  }
  function addFinding(r) {
    const li = document.createElement("li");
    li.innerHTML = `<b>${r.find}</b><span>+${r.amount.toLocaleString("en-US")}</span>`;
    trayEl.appendChild(li);
  }
  function tally(from, to) {
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / 700);
      totalEl.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (reduced) {
    const els = build(); let total = 0;
    ROWS.forEach((r, i) => {
      if (r.find) { els[i].classList.add("found"); addFinding(r); total += r.amount; }
      else els[i].classList.add(r.restricted ? "restricted" : "dim");
    });
    totalEl.textContent = fmt(total);
    statusEl.textContent = `Read ${ROWS.length} lines, ${trayEl.children.length} findings`;
    return;
  }
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(register);
  const whenVisible = async () => { while (!visible || document.hidden) await wait(400); };
  (async function run() {
    for (;;) {
      register.classList.remove("resetting");
      const els = build(); let total = 0;
      await wait(900);
      for (let i = 0; i < ROWS.length; i++) {
        await whenVisible();
        const r = ROWS[i], el = els[i];
        statusEl.textContent = `Reading line ${i + 1} of ${ROWS.length}`;
        el.classList.add("reading");
        await wait(r.find || r.restricted ? 900 : 520);
        el.classList.remove("reading");
        if (r.find) { el.classList.add("found"); await wait(450); addFinding(r); tally(total, total + r.amount); total += r.amount; }
        else el.classList.add(r.restricted ? "restricted" : "dim");
        await wait(260);
      }
      statusEl.textContent = `Read ${ROWS.length} lines, ${trayEl.children.length} findings`;
      await wait(5200);
      register.classList.add("resetting");
      await wait(600);
    }
  })();
})();

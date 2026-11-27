// Pippa public site: the live register in the hero, plus the nav border on scroll.
(() => {
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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

  const rowsEl = document.getElementById("reg-rows");
  const trayEl = document.getElementById("reg-tray");
  const totalEl = document.getElementById("reg-total");
  const statusEl = document.getElementById("reg-status");
  const register = document.querySelector(".register");
  if (!rowsEl) return;

  const fmt = (n) => "USD " + Math.round(n).toLocaleString("en-US") + " a year";

  function build() {
    rowsEl.innerHTML = "";
    trayEl.innerHTML = "";
    totalEl.textContent = fmt(0);
    for (const r of ROWS) {
      const li = document.createElement("li");
      li.className = "reg-row";
      li.innerHTML =
        `<span class="item"><span class="id">${r.id}</span>${r.item}</span>` +
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

  function countTo(from, to) {
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / 700);
      totalEl.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function finalState() {
    const els = build();
    let total = 0;
    ROWS.forEach((r, i) => {
      if (r.find) { els[i].classList.add("found"); addFinding(r); total += r.amount; }
      else if (r.restricted) els[i].classList.add("restricted");
      else els[i].classList.add("dim");
    });
    totalEl.textContent = fmt(total);
    statusEl.textContent = `Read ${ROWS.length} lines, ${trayEl.children.length} findings`;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) { finalState(); return; }

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(register);
  const whenVisible = async () => { while (!visible || document.hidden) await wait(400); };

  async function run() {
    for (;;) {
      register.classList.remove("resetting");
      const els = build();
      let total = 0;
      await wait(700);
      for (let i = 0; i < ROWS.length; i++) {
        await whenVisible();
        const r = ROWS[i], el = els[i];
        statusEl.textContent = `Reading line ${i + 1} of ${ROWS.length}`;
        el.classList.add("reading");
        await wait(r.find || r.restricted ? 900 : 520);
        el.classList.remove("reading");
        if (r.find) {
          el.classList.add("found");
          await wait(450);
          addFinding(r);
          countTo(total, total + r.amount);
          total += r.amount;
        } else if (r.restricted) {
          el.classList.add("restricted");
        } else {
          el.classList.add("dim");
        }
        await wait(260);
      }
      statusEl.textContent = `Read ${ROWS.length} lines, ${trayEl.children.length} findings`;
      await wait(5200);
      register.classList.add("resetting");
      await wait(600);
    }
  }
  run();
})();

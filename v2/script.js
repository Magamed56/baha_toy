/* =====================================================================
   Версия 2 — «Карта». Всё рисуется линиями (SVG stroke-dash + Web Animations)
   ===================================================================== */
(function () {
  "use strict";
  const CFG = window.WEDDING || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Ар дайым башынан / Всегда открывать с начала ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  toTop(); addEventListener("load", toTop); addEventListener("pageshow", toTop);
  const NS = "http://www.w3.org/2000/svg";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Дата ---------- */
  const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const MONTHS_CAP = MONTHS.map((m) => m[0].toUpperCase() + m.slice(1));
  const WEEKDAYS = ["Жекшемби", "Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби"];
  const DOW_SHORT = ["Дүй", "Шей", "Шар", "Бей", "Жум", "Ише", "Жек"];
  const [Y, M, D] = (CFG.date || "2026-10-10").split("-").map(Number);
  const [hh, mm] = (CFG.timeStart || "17:00").split(":").map(Number);
  const eventDate = new Date(Y, M - 1, D, hh, mm, 0);
  const pad2 = (n) => String(n).padStart(2, "0");
  const fill = (s) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => (CFG[k] !== undefined ? CFG[k] : `{${k}}`));

  const values = {
    groom: CFG.groom, bride: CFG.bride, hostFather: CFG.hostFather, hostMother: CFG.hostMother,
    dateDay: pad2(D), dateMonth: pad2(M), dateYear: String(Y),
    dateLong: `${D}-${MONTHS[M - 1]} ${Y}-жыл`, weekday: WEEKDAYS[eventDate.getDay()],
    timeStart: CFG.timeStart, timeEnd: CFG.timeEnd,
    region: CFG.region, venueName: CFG.venueName, venueAddress: CFG.venueAddress,
    addressLine: [CFG.region, CFG.venueAddress].filter(Boolean).join(", "),
    inviteTitle: CFG.inviteTitle, inviteText: fill(CFG.inviteText), closingText: CFG.closingText,
  };
  $$("[data-cfg]").forEach((el) => { const v = values[el.dataset.cfg]; if (el.dataset.cfg === "addressLine") { el.textContent = v || ""; el.hidden = !v; } else if (v) el.textContent = v; });
  document.title = `${CFG.groom} & ${CFG.bride} — Үйлөнүү той`;
  $("#tr-groom").textContent = CFG.groom || "";

  /* ---------- Параллакс жана толкун ---------- */
  let syTick = false;
  addEventListener("scroll", () => {
    if (syTick) return; syTick = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--sy", Math.min(scrollY, 900));
      document.documentElement.style.setProperty("--sp", (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
      syTick = false;
    });
  }, { passive: true });
  $$(".btn").forEach((b) => b.addEventListener("pointerdown", (e) => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const sp = document.createElement("span"); sp.className = "ripple";
    sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 800);
  }));
  $("#tr-bride").textContent = CFG.bride || "";
  $("#hero-groom").textContent = CFG.groom || "";

  /* ---------- Сөз-сөз / Появление текста по словам ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/); el.textContent = "";
    words.forEach((w, i) => { const s = document.createElement("span"); s.className = "word"; s.style.setProperty("--w", i); s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(" ")); });
  }
  $$('.lead[data-cfg="inviteText"], #hosts .sub, .footer__text').forEach(splitWords);
  $("#hero-bride").textContent = CFG.bride || "";
  $("#pm-text").textContent = `${(CFG.groom || "").toUpperCase()} ✦ ${(CFG.bride || "").toUpperCase()} ✦ ${pad2(D)}.${pad2(M)}.${Y} ✦`;
  $("#pm-year").textContent = String(Y);
  (function calendarLink() {
    const a = $("#cal-btn"); if (!a) return;
    const [eh, em] = (CFG.timeEnd || "23:00").split(":").map(Number);
    const f = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
    const end = new Date(Y, M - 1, D, eh, em, 0);
    const p = new URLSearchParams({ action: "TEMPLATE", text: `${CFG.groom} & ${CFG.bride} — үйлөнүү той`, dates: `${f(eventDate)}/${f(end)}`, details: location.href, location: values.addressLine ? `${CFG.venueName}, ${values.addressLine}` : CFG.venueName || "" });
    a.href = `https://calendar.google.com/calendar/render?${p}`;
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) { a.href = "../assets/toy.ics"; a.removeAttribute("target"); }
  })();
  // Жеке кайрылуу / Персональное обращение через ссылку ?g=Имя
  (function guest() {
    const g = (new URLSearchParams(location.search).get("g") || "").trim().slice(0, 60); const el = $("#guest");
    if (!g || !el) return; el.textContent = `Урматтуу ${g}!`; el.hidden = false;
    const inp = $("#rsvp-form input[name=name]"); if (inp && !inp.value) inp.value = g;
  })();

  /* ---------- SVG жардамчылар ---------- */
  function el(name, attrs = {}, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const LINE = { fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" };
  // «Перо» бежит вдоль линии, пока она рисуется
  function penAlong(node, { duration = 1200, delay = 0 } = {}) {
    if (REDUCED || !node.getTotalLength) return;
    const len = node.getTotalLength(); const svg = node.ownerSVGElement; if (!len || !svg) return;
    const pen = el("circle", { r: 4, fill: "currentColor", opacity: 0 }, svg);
    const parent = node.parentNode; if (parent !== svg && parent.getAttribute("transform")) parent.appendChild(pen);
    setTimeout(() => {
      const t0 = performance.now(); pen.setAttribute("opacity", 1);
      (function step(now) {
        const t = Math.min(1, (now - t0) / duration); const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const pt = node.getPointAtLength(len * e); pen.setAttribute("cx", pt.x); pen.setAttribute("cy", pt.y);
        if (t < 1) requestAnimationFrame(step); else pen.remove();
      })(t0);
    }, delay);
  }
  function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function dashedArray(len, dash = 7, gap = 7) {
    // Схема: [dash gap dash gap … (сумма = len)] 0 len — при dashoffset = len линия невидима, при 0 — полностью пунктирная
    const parts = []; let s = 0;
    while (s < len) { parts.push(dash, gap); s += dash + gap; }
    return parts.concat([0, len]).join(" ");
  }
  function drawIn(node, { duration = 1200, delay = 0, dashed = false, easing = "cubic-bezier(.4,0,.2,1)" } = {}) {
    if (!node.getTotalLength) return;
    const len = node.getTotalLength();
    if (!len) return;
    node.style.strokeDasharray = dashed ? dashedArray(len) : `${len}`;
    node.style.strokeDashoffset = len;
    if (REDUCED) { node.style.strokeDashoffset = 0; return; }
    return node.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration, delay, easing, fill: "forwards" });
  }
  function popIn(node, { delay = 0, duration = 600 } = {}) {
    node.style.transformBox = "fill-box"; node.style.transformOrigin = "center";
    if (REDUCED) return;
    node.animate([{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1.15)", opacity: 1, offset: .7 }, { transform: "scale(1)", opacity: 1 }], { duration, delay, easing: "cubic-bezier(.2,.9,.3,1.3)", fill: "both" });
  }
  function fadeIn(node, { delay = 0, duration = 800 } = {}) {
    if (REDUCED) return;
    node.animate([{ opacity: 0 }, { opacity: 1 }], { duration, delay, fill: "both" });
  }

  /* ---------- Сүрөт элементтери / Элементы рисунка ---------- */
  function mountainPath(x0, x1, base, amp, n, rnd) {
    const pts = []; const step = (x1 - x0) / n;
    for (let i = 0; i <= n; i++) {
      const x = x0 + i * step;
      const peak = i % 2 === 1 ? amp * (0.55 + rnd() * 0.45) : amp * rnd() * 0.25;
      pts.push([x, base - peak]);
    }
    return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L ");
  }
  function drawMountains(svg, seed = 7) {
    const W = svg.clientWidth || 800, H = svg.clientHeight || 160;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";
    const rnd = seeded(seed);
    const back = el("path", { ...LINE, d: mountainPath(-30, W + 30, H * 0.78, H * 0.62, 10, rnd), opacity: .45 }, svg);
    const front = el("path", { ...LINE, d: mountainPath(-30, W + 30, H * 0.95, H * 0.55, 7, rnd) }, svg);
    // снежные шапки — короткие штрихи на пиках
    const snow = el("g", { ...LINE, class: "snow", opacity: .7 }, svg);
    for (let i = 0; i < 4; i++) { const x = W * (0.12 + i * 0.24), y = H * 0.55 + rnd() * 10; el("path", { d: `M${x - 10} ${y + 8} l6 -6 l5 5 l6 -8 l5 4` }, snow); }
    const ground = el("path", { ...LINE, d: `M0 ${H - 1} H ${W}`, opacity: .5 }, svg);
    return [back, front, ...snow.children, ground];
  }
  function drawCompass(svg) {
    svg.innerHTML = "";
    const g = el("g", { ...LINE, transform: "translate(60 60)" }, svg);
    const parts = [
      el("circle", { r: 52 }, g), el("circle", { r: 40, opacity: .6 }, g), el("circle", { r: 4 }, g),
      el("path", { d: "M0 -46 L 8 0 L 0 46 L -8 0 Z" }, g), el("path", { d: "M-46 0 L 0 8 L 46 0 L 0 -8 Z", opacity: .6 }, g),
      el("path", { d: "M-30 -30 L 30 30 M-30 30 L 30 -30", opacity: .35 }, g),
    ];
    const n = el("text", { x: 0, y: -56, "text-anchor": "middle", "font-size": 12, fill: "currentColor", stroke: "none", "font-family": "Playfair Display, serif" }, g); n.textContent = "N";
    return [...parts, n];
  }
  function drawYurt(svg) {
    svg.innerHTML = "";
    const g = el("g", { ...LINE, transform: "translate(20 10)" }, svg);
    return [
      el("path", { d: "M0 90 H 120" }, g),
      el("path", { d: "M10 90 V 56 H 110 V 90" }, g),
      el("path", { d: "M6 56 C 20 18, 100 18, 114 56" }, g),
      el("path", { d: "M48 30 A 12 6 0 1 0 72 30 A 12 6 0 1 0 48 30 M52 30 h16 M60 27 v6" }, g),
      el("path", { d: "M50 90 V 66 H 70 V 90", opacity: .8 }, g),
      el("path", { d: "M20 66 h20 M80 66 h20 M20 76 h20 M80 76 h20", opacity: .45 }, g),
      el("path", { d: "M30 56 C 40 40, 80 40, 90 56 M24 56 C 40 44, 80 44, 96 56", opacity: .35 }, g),
    ];
  }
  function pinPath(x, y, s = 1) { return `M${x} ${y} C ${x - 9 * s} ${y - 12 * s}, ${x - 10 * s} ${y - 26 * s}, ${x} ${y - 28 * s} C ${x + 10 * s} ${y - 26 * s}, ${x + 9 * s} ${y - 12 * s}, ${x} ${y} Z`; }
  function heartPath(x, y, s = 1) { return `M${x} ${y + 10 * s} C ${x - 14 * s} ${y}, ${x - 16 * s} ${y - 12 * s}, ${x - 8 * s} ${y - 16 * s} C ${x - 3 * s} ${y - 18 * s}, ${x} ${y - 14 * s}, ${x} ${y - 12 * s} C ${x} ${y - 14 * s}, ${x + 3 * s} ${y - 18 * s}, ${x + 8 * s} ${y - 16 * s} C ${x + 16 * s} ${y - 12 * s}, ${x + 14 * s} ${y}, ${x} ${y + 10 * s} Z`; }
  function treePath(x, y, s = 1) { return `M${x} ${y} l${6 * s} -${12 * s} l-${3 * s} 0 l${7 * s} -${12 * s} l-${4 * s} 0 l${6 * s} -${11 * s} l-${24 * s} 0 l${6 * s} ${11 * s} l-${4 * s} 0 l${7 * s} ${12 * s} l-${3 * s} 0 Z M${x - 1 * s} ${y} v${6 * s} h${2 * s} v-${6 * s}`; }

  /* ---------- Мукаба-карта ---------- */
  function buildIntroMap() {
    const svg = $("#intro-map");
    const W = innerWidth, H = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.innerHTML = "";
    const rnd = seeded(42);
    const mobile = W < 700;
    const timeline = [];

    // Горы внизу
    const mh = Math.min(H * 0.3, 260);
    const back = el("path", { ...LINE, d: mountainPath(-30, W + 30, H - mh * 0.25, mh * 0.75, mobile ? 6 : 12, rnd), opacity: .4 }, svg);
    const front = el("path", { ...LINE, d: mountainPath(-30, W + 30, H - 8, mh * 0.6, mobile ? 5 : 9, rnd) }, svg);
    timeline.push([back, { duration: 1500, delay: 100 }], [front, { duration: 1500, delay: 300 }]);
    penAlong(front, { duration: 1500, delay: 300 });

    // Деревья и юрта у подножия
    const tg = el("g", { ...LINE }, svg);
    [[W * 0.08, H - 30, 0.9], [W * 0.15, H - 22, 1.1], [W * 0.23, H - 34, 0.8]].forEach(([x, y, s], i) => {
      const t = el("path", { d: treePath(x, y, s) }, tg); timeline.push([t, { duration: 900, delay: 1400 + i * 150 }]);
    });
    const yg = el("g", { ...LINE, transform: `translate(${W * 0.72} ${H - 20}) scale(${mobile ? .6 : .8})` }, svg);
    ["M0 0 H 120", "M10 0 V -34 H 110 V 0", "M6 -34 C 20 -72, 100 -72, 114 -34", "M50 0 V -24 H 70 V 0", "M48 -60 A 12 6 0 1 0 72 -60 A 12 6 0 1 0 48 -60"].forEach((d, i) => {
      timeline.push([el("path", { d }, yg), { duration: 800, delay: 1500 + i * 120 }]);
    });

    // Компас слева сверху
    const cs = Math.min(W, H) * (mobile ? 0.11 : 0.08);
    const cg = el("g", { ...LINE, transform: `translate(${cs + 24} ${cs + 24}) scale(${cs / 52})` }, svg);
    [el("circle", { r: 52 }, cg), el("circle", { r: 40, opacity: .6 }, cg), el("path", { d: "M0 -46 L 8 0 L 0 46 L -8 0 Z" }, cg), el("path", { d: "M-46 0 L 0 8 L 46 0 L 0 -8 Z", opacity: .6 }, cg), el("circle", { r: 4 }, cg)]
      .forEach((p, i) => timeline.push([p, { duration: 1100, delay: 300 + i * 200 }]));
    const n = el("text", { x: 0, y: -58, "text-anchor": "middle", "font-size": 13, fill: "currentColor", stroke: "none", "font-family": "Playfair Display, serif", opacity: 0 }, cg); n.textContent = "N";
    setTimeout(() => fadeIn(n, { delay: 0 }), 1400); n.style.opacity = "";

    // Маршрут вокруг картуша: от пина внизу слева — к сердцу вверху справа
    const A = [W * 0.1, H * 0.86], B = [W * 0.86, H * 0.16];
    const d = `M${A[0]} ${A[1]} C ${W * 0.35} ${H * 1.02}, ${W * 1.02} ${H * 0.9}, ${W * 0.95} ${H * 0.55} S ${W * 0.55} ${H * 0.28}, ${B[0]} ${B[1]}`;
    const route = el("path", { ...LINE, d, "stroke-width": 1.6 }, svg);
    timeline.push([route, { duration: 2200, delay: 900, dashed: true }]);
    penAlong(route, { duration: 2200, delay: 900 });

    // Пины и подписи
    const pinA = el("g", { ...LINE, fill: "var(--parch)" }, svg);
    el("path", { d: pinPath(A[0], A[1], 1.1) }, pinA); el("circle", { cx: A[0], cy: A[1] - 18, r: 4, fill: "currentColor" }, pinA);
    const la = el("text", { x: A[0] + 20, y: A[1] - 12, "font-size": 15, fill: "currentColor", stroke: "none", "font-family": "Cormorant Garamond, serif", "font-style": "italic" }, svg); la.textContent = CFG.groom || "";
    const heart = el("path", { ...LINE, d: heartPath(B[0], B[1], 1.2), fill: "var(--parch)" }, svg);
    const lb = el("text", { x: B[0], y: B[1] + 30, "font-size": 15, "text-anchor": "middle", fill: "currentColor", stroke: "none", "font-family": "Cormorant Garamond, serif", "font-style": "italic" }, svg); lb.textContent = CFG.bride || "";
    setTimeout(() => { popIn(pinA, { delay: 0 }); fadeIn(la, { delay: 300 }); }, 800);
    setTimeout(() => { drawIn(heart, { duration: 900 }); fadeIn(lb, { delay: 500 }); heart.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 1600, iterations: Infinity, delay: 1000 }); heart.style.transformBox = "fill-box"; heart.style.transformOrigin = "center"; }, 3000);
    pinA.style.opacity = 0; la.style.opacity = 0; lb.style.opacity = 0;
    setTimeout(() => { pinA.style.opacity = ""; la.style.opacity = ""; }, 800);
    setTimeout(() => { lb.style.opacity = ""; }, 3000);

    // Тонкая градусная сетка (пунктир) — 3 линии
    for (let i = 1; i <= 3; i++) {
      const g1 = el("path", { ...LINE, d: `M0 ${H * i / 4} H ${W}`, opacity: .12, "stroke-width": 1 }, svg);
      timeline.push([g1, { duration: 1400, delay: 200 + i * 100, dashed: true }]);
    }
    timeline.forEach(([node, opts]) => drawIn(node, opts));
  }

  function buildCartouche() {
    const box = $("#cartouche"), svg = $(".cartouche__frame");
    const w = box.clientWidth, h = box.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const r1 = $("#cartouche-rect"), r2 = $("#cartouche-rect2");
    r1.setAttribute("width", w - 2); r1.setAttribute("height", h - 2);
    r2.setAttribute("width", w - 14); r2.setAttribute("height", h - 14);
    drawIn(r1, { duration: 1600, delay: 900 }); drawIn(r2, { duration: 1600, delay: 1100, dashed: true }); penAlong(r1, { duration: 1600, delay: 900 });
  }

  /* ---------- Маршрут по странице ---------- */
  const routeSvg = $("#route");
  let routeLen = 0, routePath = null, markers = [], pen = null, routeY0 = 0;
  function buildRoute() {
    const main = $("#page"), W = main.clientWidth, H = main.scrollHeight;
    routeSvg.setAttribute("viewBox", `0 0 ${W} ${H}`); routeSvg.innerHTML = "";
    const secs = $$(".sec").slice(1); // без hero
    routeY0 = $("#hero").offsetHeight - 24; // маршрут начинается под главным экраном
    const pts = [[W * 0.5, routeY0]];
    secs.forEach((s, i) => pts.push([W * (i % 2 === 0 ? 0.13 : 0.87), s.offsetTop + 14]));
    const last = pts[pts.length - 1]; pts.push([W * 0.5, H - 60]);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const my = (y0 + y1) / 2; d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`; }
    el("path", { class: "route__ghost", d, "stroke-dasharray": "3 7" }, routeSvg);
    routePath = el("path", { class: "route__path", d }, routeSvg);
    routeLen = routePath.getTotalLength();
    routePath.style.strokeDasharray = dashedArray(routeLen, 6, 8);
    routePath.style.strokeDashoffset = routeLen;
    markers = pts.slice(1, -1).map(([x, y]) => {
      const g = el("g", { class: "marker" }, routeSvg);
      el("circle", { cx: x, cy: y, r: 9 }, g); el("circle", { class: "dot", cx: x, cy: y, r: 3.5 }, g);
      g.dataset.y = y; return g;
    });
    // Сердце-финиш
    const fin = el("path", { ...LINE, class: "marker marker--end", d: heartPath(last[0] === W * 0.5 ? W * 0.5 : W * 0.5, H - 60, 1.1), fill: "var(--parch)" }, routeSvg);
    fin.dataset.y = H - 60; markers.push(fin);
    pen = el("g", { class: "pen" }, routeSvg);
    el("circle", { class: "pen__ring", r: 8 }, pen); el("circle", { class: "pen__dot", r: 4.5 }, pen);
    updateRoute();
  }
  function updateRoute() {
    if (!routePath) return;
    const main = $("#page"); const top = main.getBoundingClientRect().top + scrollY;
    const line = scrollY + innerHeight * 0.62 - top;
    const progress = Math.max(0, Math.min(1, (line - routeY0) / (main.scrollHeight - routeY0)));
    routePath.style.strokeDashoffset = routeLen * (1 - progress);
    if (pen) {
      const pt = routePath.getPointAtLength(routeLen * progress);
      pen.setAttribute("transform", `translate(${pt.x} ${pt.y})`); pen.style.opacity = progress > 0.01 && progress < 0.995 ? 1 : 0;
    }
    markers.forEach((m) => {
      const reached = Number(m.dataset.y) <= line;
      if (reached && !m.classList.contains("is-reached") && !REDUCED) {
        const c = m.querySelector("circle") || m; const cx = c.getAttribute("cx"), cy = c.getAttribute("cy");
        if (cx) { const ring = el("circle", { cx, cy, r: 9, fill: "none", stroke: "currentColor", "stroke-width": 1.2 }, routeSvg);
          ring.animate([{ r: 9, opacity: .8 }, { r: 34, opacity: 0 }], { duration: 900, easing: "ease-out" }).onfinish = () => ring.remove(); }
      }
      m.classList.toggle("is-reached", reached);
    });
  }
  addEventListener("scroll", updateRoute, { passive: true });

  /* ---------- Эскертүү ---------- */
  const notes = $("#notes");
  (CFG.notes || []).forEach((n) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="sym">${n.icon || "✦"}</span><p>${fill(n.text)}</p>`;
    notes.appendChild(li);
  });

  /* ---------- Карта ---------- */
  const coords = (CFG.coords || "").replace(/\s+/g, "");
  const q = encodeURIComponent(coords || CFG.mapQuery || `${CFG.region || ""} ${CFG.venueAddress || ""}`.trim());
  $("#map").src = CFG.mapEmbedUrl || `https://www.google.com/maps?q=${q}&z=${coords ? 17 : 16}&output=embed&hl=ru`;
  $("#route-btn").href = CFG.routeUrl || (coords ? `https://www.google.com/maps/dir/?api=1&destination=${coords}` : `https://www.google.com/maps/search/?api=1&query=${q}`);

  /* ---------- Календарь ---------- */
  (function buildCalendar() {
    const first = new Date(Y, M - 1, 1), daysIn = new Date(Y, M, 0).getDate();
    let offset = first.getDay() - 1; if (offset < 0) offset = 6;
    let html = `<div class="cal__month">${MONTHS_CAP[M - 1]} ${Y}</div><div class="cal__grid">`;
    DOW_SHORT.forEach((d) => (html += `<div class="dow">${d}</div>`));
    for (let i = 0; i < offset; i++) html += "<div></div>";
    for (let d = 1; d <= daysIn; d++) {
      const dow = (offset + d - 1) % 7;
      const cls = [d === D ? "day--event" : "", dow >= 5 ? "wknd" : ""].join(" ").trim();
      const ring = d === D ? '<svg viewBox="0 0 40 40"><circle class="ring2" cx="20" cy="20" r="17" transform="rotate(-90 20 20)"/></svg>' : "";
      html += `<div class="${cls}">${ring}${d}</div>`;
    }
    $("#calendar").innerHTML = html + "</div>";
  })();

  /* ---------- Тойго чейин ---------- */
  (function countdown() {
    const box = $("#countdown");
    const u = { days: $('[data-unit="days"]'), hours: $('[data-unit="hours"]'), minutes: $('[data-unit="minutes"]'), seconds: $('[data-unit="seconds"]') };
    function set(e, v) { const s = pad2(v); if (e.textContent !== s) { e.textContent = s; e.classList.remove("tick"); void e.offsetWidth; e.classList.add("tick"); } }
    let rolling = false;
    function parts() { const s = Math.max(0, Math.floor((eventDate - new Date()) / 1000)); return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]; }
    const FRAC = { days: (v) => Math.min(1, v / 30), hours: (v) => v / 24, minutes: (v) => v / 60, seconds: (v) => v / 60 };
    function liveRing(unit, v) {
      const ring = u[unit].parentNode.querySelector(".ring"); if (!ring || !ring.dataset.live) return;
      const len = Number(ring.dataset.len); ring.style.strokeDashoffset = len * (1 - FRAC[unit](v));
    }
    function show(v) { set(u.days, v[0]); set(u.hours, v[1]); set(u.minutes, v[2]); set(u.seconds, v[3]); liveRing("days", v[0]); liveRing("hours", v[1]); liveRing("minutes", v[2]); liveRing("seconds", v[3]); }
    function tick() {
      if (eventDate - new Date() <= 0) { box.innerHTML = '<div class="cd--done">Бул күн келди! ♥</div>'; return; }
      if (!rolling) show(parts());
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
    window.__rollCountdown = () => {
      if (rolling || REDUCED) return; rolling = true; const t0 = performance.now(), target = parts();
      (function step(now) {
        const t = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - t, 3);
        show(target.map((v) => Math.round(v * e)));
        if (t < 1) requestAnimationFrame(step); else { rolling = false; show(parts()); }
      })(t0);
    };
  })();

  /* ---------- Скролл: секциялар ---------- */
  // Рамка секции и линия под заголовком рисуются пером
  $$(".frame").forEach((f) => {
    const svg = el("svg", { class: "frame__svg" }); f.insertBefore(svg, f.firstChild);
    const t = f.querySelector(".title"); if (t) { const u = el("svg", { class: "title__line", viewBox: "0 0 200 12", preserveAspectRatio: "none" }); el("path", { class: "stroke", d: "M2 8 C 50 3, 100 11, 130 6 S 180 4, 198 8" }, u); t.appendChild(u); }
  });
  function frameDraw(sec) {
    const f = sec.querySelector(".frame"), svg = sec.querySelector(".frame__svg"); if (!f || !svg) return;
    const w = f.clientWidth, h = f.clientHeight; svg.setAttribute("viewBox", `0 0 ${w} ${h}`); svg.innerHTML = "";
    const r = el("rect", { x: 1, y: 1, width: w - 2, height: h - 2 }, svg);
    const c = 26;
    [`M1 ${c} V1 H${c}`, `M${w - c} 1 H${w - 1} V${c}`, `M${w - 1} ${h - c} V${h - 1} H${w - c}`, `M${c} ${h - 1} H1 V${h - c}`].forEach((d, i) => drawIn(el("path", { class: "corner", d }, svg), { duration: 500, delay: 1400 + i * 120 }));
    drawIn(r, { duration: 1500, delay: 150 }); penAlong(r, { duration: 1500, delay: 150 });
  }
  function onVisible(sec) {
    if (sec.classList.contains("is-visible")) return;
    sec.classList.add("is-visible");
    frameDraw(sec);
    $$(".stroke", sec).forEach((p, i) => { drawIn(p, { duration: 1200, delay: 500 + i * 200 }); penAlong(p, { duration: 1200, delay: 500 + i * 200 }); });
    $$(".ring", sec).forEach((c, i) => {
      if (!c.parentNode.querySelector(".ring--track")) { const t = c.cloneNode(false); t.setAttribute("class", "ring--track"); c.parentNode.insertBefore(t, c); }
      delete c.dataset.live; const a = drawIn(c, { duration: 1200, delay: 500 + i * 200 });
      if (a) a.onfinish = () => { a.cancel(); c.dataset.len = c.getTotalLength(); c.dataset.live = "1"; }; else { c.dataset.len = c.getTotalLength(); c.dataset.live = "1"; }
    });
    $$(".ring2", sec).forEach((c) => drawIn(c, { duration: 1200, delay: 900 }));
    if (sec.id === "hero") { drawCompass($("#compass")).forEach((p, i) => drawIn(p, { duration: 1200, delay: 800 + i * 150 })); const ms = drawMountains($("#hero-mountains"), 3); ms.forEach((p, i) => drawIn(p, { duration: 1600, delay: 400 + i * 200 })); penAlong(ms[1], { duration: 1600, delay: 600 }); }
    if (sec.id === "countdown-sec" && window.__rollCountdown) setTimeout(window.__rollCountdown, 600);
    if (sec.id === "hosts") drawYurt($("#yurt")).forEach((p, i) => { drawIn(p, { duration: 900, delay: 700 + i * 160 }); if (i < 3) penAlong(p, { duration: 900, delay: 700 + i * 160 }); });
    if (sec.id === "end") drawMountains($("#footer-mountains"), 11).forEach((p, i) => drawIn(p, { duration: 1600, delay: 200 + i * 200 }));
  }
  // Ар бир жолу кайра тартылат / Рисуется заново при каждом возврате
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) e.target.classList.remove("is-visible");
      else if (e.intersectionRatio >= 0.12) onVisible(e.target);
    });
  }, { threshold: [0, 0.12], rootMargin: "0px 0px -6% 0px" });
  $$(".sec").forEach((s) => io.observe(s));

  /* ---------- Музыка ---------- */
  const audio = $("#bg-music"), musicBtn = $("#music-btn");
  let music = CFG.music || "";
  if (music && !/^(https?:|data:|\/)/.test(music)) music = "../" + music;
  if (music) audio.src = music;
  audio.volume = 0;
  let fadeTimer = null;
  function fadeTo(target, ms = 1500) {
    clearInterval(fadeTimer); const start = audio.volume, steps = 30; let i = 0;
    fadeTimer = setInterval(() => { i++; audio.volume = Math.max(0, Math.min(1, start + (target - start) * (i / steps))); if (i >= steps) { clearInterval(fadeTimer); if (target === 0) audio.pause(); } }, ms / steps);
  }
  function setPlaying(on) { musicBtn.classList.toggle("is-playing", on); musicBtn.setAttribute("aria-pressed", on ? "true" : "false"); }
  function play() { const p = audio.play(); if (p && p.then) p.then(() => { fadeTo(0.7); setPlaying(true); }).catch(() => setPlaying(false)); else { fadeTo(0.7); setPlaying(true); } }
  function pause() { fadeTo(0, 700); setPlaying(false); }
  musicBtn.addEventListener("click", () => (audio.paused || audio.volume === 0 ? play() : pause()));
  // Автозапуск: музыка башталат кирээри менен (браузер уруксат берсе), болбосо — биринчи басууда
  (function autoplay() {
    const EVENTS = ["pointerdown", "touchstart", "keydown"];
    const onFirst = () => { EVENTS.forEach((e) => removeEventListener(e, onFirst)); play(); };
    const p = audio.play();
    if (p && p.then) p.then(() => { fadeTo(0.7); setPlaying(true); }).catch(() => EVENTS.forEach((e) => addEventListener(e, onFirst, { passive: true })));
    else { fadeTo(0.7); setPlaying(true); }
  })();
  document.addEventListener("visibilitychange", () => { if (document.hidden && !audio.paused) audio.pause(); else if (!document.hidden && musicBtn.classList.contains("is-playing")) audio.play().catch(() => {}); });

  /* ---------- Мукабаны ачуу ---------- */
  document.body.classList.add("locked");
  const intro = $("#intro");
  function startIntro() {
    if (intro.classList.contains("is-ready")) return;
    intro.classList.add("is-ready");
    buildIntroMap();
    requestAnimationFrame(buildCartouche);
  }
  // Шрифт жүктөлгөндөн кийин баштайбыз (бирок 1.5 секунддан ашпайт)
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(startIntro);
  // Ачуу: сыдыруу, чыйратуу, баскыч же басуу / Открытие: свайп, колесо, клавиша или клик
  function openInvite() {
    if (intro.classList.contains("is-hidden")) return;
    intro.classList.add("is-hidden");
    document.body.classList.remove("locked");
    play();
    setTimeout(() => { buildRoute(); musicBtn.classList.add("is-visible"); }, 300);
    removeEventListener("wheel", onWheel); removeEventListener("keydown", onKey);
  }
  const onWheel = (e) => { if (e.deltaY > 0) openInvite(); };
  const onKey = (e) => { if (["ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) openInvite(); };
  let touchY = null;
  intro.addEventListener("click", openInvite);
  intro.addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  intro.addEventListener("touchmove", (e) => { if (touchY !== null && touchY - e.touches[0].clientY > 12) openInvite(); }, { passive: true });
  addEventListener("wheel", onWheel, { passive: true });
  addEventListener("keydown", onKey);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!document.body.classList.contains("locked")) buildRoute(); $$(".sec.is-visible").forEach(frameDraw); }, 200); });
  // Высота страницы меняется, когда прогружаются шрифты/карта — пересчитать маршрут
  if (document.fonts) document.fonts.ready.then(() => { if (!document.body.classList.contains("locked")) buildRoute(); });

  /* ---------- Суроо (RSVP) ---------- */
  // CallMeBot аркылуу: жооп ээлердин WhatsApp'ына өзү келет / Ответ приходит хозяевам в WhatsApp автоматически
  function sendCallMeBot(text) {
    const c = CFG.callmebot || {}; if (!c.phone || !c.apikey) return false;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(String(c.phone).replace(/\D/g, ""))}&apikey=${encodeURIComponent(c.apikey)}&text=${encodeURIComponent(text)}`;
    try { fetch(url, { mode: "no-cors", cache: "no-store" }).catch(() => {}); new Image().src = url; return true; } catch (e) { return false; }
  }

  // Telegram аркылуу: жооп ээлерине өзү келет / Ответ приходит хозяевам в Telegram автоматически
  async function sendTelegram(text) {
    const tg = CFG.telegram || {}; if (!tg.token || !tg.chatId) return false;
    // chatId: бир же бир нече id үтүр менен / один или несколько id через запятую, либо id группы
    const ids = String(tg.chatId).split(/[,\s]+/).filter(Boolean);
    const results = await Promise.all(ids.map((id) =>
      fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, { method: "POST", body: new URLSearchParams({ chat_id: id, text }) }).then((r) => r.ok).catch(() => false)));
    return results.some(Boolean);
  }

  const LABELS = { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" };
  const form = $("#rsvp-form"), note = $("#form-note"), submitBtn = $("#rsvp-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameField = form.name.closest(".field"), name = form.name.value.trim();
    if (!name) { nameField.classList.add("is-error"); form.name.focus(); return; }
    nameField.classList.remove("is-error");
    const attend = form.attend.value;
    const stamp = new Date().toLocaleString("ru-RU", { hour12: false });
    const tgText = `💌 Жаңы жооп / Новый ответ\n👤 ${name}\n✅ ${LABELS[attend]}\n🕒 ${stamp}`;
    if (CFG.callmebot && CFG.callmebot.phone && CFG.callmebot.apikey) {
      submitBtn.disabled = true; note.textContent = "Жөнөтүлүүдө…";
      if (sendCallMeBot(tgText)) { setTimeout(showSuccess, 900); return; }
      submitBtn.disabled = false; note.textContent = "";
    }
    if (CFG.telegram && CFG.telegram.token && CFG.telegram.chatId) {
      submitBtn.disabled = true; note.textContent = "Жөнөтүлүүдө…";
      if (await sendTelegram(tgText)) { showSuccess(); return; }
      submitBtn.disabled = false; note.textContent = "";
    }
    if (CFG.googleScriptUrl) {
      submitBtn.disabled = true; note.textContent = "Жөнөтүлүүдө…";
      try {
        await fetch(CFG.googleScriptUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ name, rsvp: attend, rsvpLabel: LABELS[attend], timestamp: new Date().toISOString(), userAgent: navigator.userAgent }) });
        showSuccess();
      } catch (err) { note.textContent = "Ката кетти. Кайра аракет кылыңыз же WhatsApp аркылуу жазыңыз."; submitBtn.disabled = false; }
      return;
    }
    const text = [`Саламатсызбы! ${CFG.groom} менен ${CFG.bride} үйлөнүү тоюна жооп 💍`, `Аты-жөнү: ${name}`, `Жооп: ${LABELS[attend]}`].join("\n");
    showSuccess();
    setTimeout(() => { location.href = `https://wa.me/${(CFG.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`; }, 400);
  });
  function showSuccess() {
    form.hidden = true; const s = $("#rsvp-success"); s.hidden = false; s.classList.add("is-shown");
    $$(".stroke", s).forEach((p) => drawIn(p, { duration: 1200 }));
    setTimeout(buildRoute, 900);
  }
})();

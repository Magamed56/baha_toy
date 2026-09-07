/* =====================================================================
   Үйлөнүү тойго чакыруу — логика (китепканасыз / без библиотек)
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

  /* ---------- Күн / Дата ---------- */
  const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  const MONTHS_CAP = MONTHS.map((m) => m[0].toUpperCase() + m.slice(1));
  const WEEKDAYS = ["Жекшемби", "Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби"];
  const DOW_SHORT = ["Дүй", "Шей", "Шар", "Бей", "Жум", "Ише", "Жек"];
  const [Y, M, D] = (CFG.date || "2026-10-10").split("-").map(Number);
  const [hh, mm] = (CFG.timeStart || "17:00").split(":").map(Number);
  const eventDate = new Date(Y, M - 1, D, hh, mm, 0);
  const pad2 = (n) => String(n).padStart(2, "0");

  // Шаблондогу {groom}, {bride} ж.б. алмаштыруу
  const fill = (s) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => (CFG[k] !== undefined ? CFG[k] : `{${k}}`));

  const values = {
    groom: CFG.groom, bride: CFG.bride,
    hostFather: CFG.hostFather, hostMother: CFG.hostMother,
    dateDay: pad2(D), dateMonth: pad2(M), dateYear: String(Y),
    dateLong: `${D}-${MONTHS[M - 1]} ${Y}-жыл`,
    weekday: WEEKDAYS[eventDate.getDay()],
    timeStart: CFG.timeStart, timeEnd: CFG.timeEnd,
    region: CFG.region, venueName: CFG.venueName, venueAddress: CFG.venueAddress,
    addressLine: [CFG.region, CFG.venueAddress].filter(Boolean).join(", "),
    inviteTitle: CFG.inviteTitle, inviteText: fill(CFG.inviteText), closingText: CFG.closingText,
  };
  $$("[data-cfg]").forEach((el) => {
    const v = values[el.dataset.cfg];
    if (v !== undefined && v !== null && v !== "") el.textContent = v;
  });
  document.title = `${CFG.groom} & ${CFG.bride} — Үйлөнүү той`;

  /* ---------- Тамга-тамга / Побуквенное появление имён ---------- */
  function splitLetters(el, base) {
    const text = el.textContent;
    el.textContent = "";
    el.classList.remove("fade-up");
    el.style.setProperty("--base", base);
    Array.from(text).forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch" + (ch === " " ? " ch--space" : "");
      s.style.setProperty("--i", i);
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    });
  }
  $$(".intro__names [data-cfg]").forEach((el, i) => splitLetters(el, `${0.9 + i * 0.5}s`));
  $$(".hero__names [data-cfg]").forEach((el, i) => splitLetters(el, `${0.4 + i * 0.6}s`));
  $$(".reveal").forEach((r) => Array.from(r.children).forEach((c, i) => c.style.setProperty("--n", i)));

  /* ---------- Эскертүүлөр ---------- */
  const notes = $("#notes");
  (CFG.notes || []).forEach((n, i) => {
    const d = document.createElement("div");
    d.className = "note"; d.style.transitionDelay = `${i * 0.12}s`;
    d.innerHTML = `<div class="note__icon">${n.icon || "✨"}</div><p>${fill(n.text)}</p>`;
    notes.appendChild(d);
  });

  /* ---------- Карта ---------- */
  const q = encodeURIComponent(CFG.mapQuery || `${CFG.region || ""} ${CFG.venueAddress || ""}`.trim());
  $("#map").src = `https://www.google.com/maps?q=${q}&z=16&output=embed&hl=ru`;
  $("#route-btn").href = CFG.routeUrl || `https://www.google.com/maps/search/?api=1&query=${q}`;

  /* ---------- Календарь ---------- */
  (function buildCalendar() {
    const first = new Date(Y, M - 1, 1);
    const daysIn = new Date(Y, M, 0).getDate();
    let offset = first.getDay() - 1; if (offset < 0) offset = 6; // дүйшөмбүдөн башталат
    let html = `<div class="calendar__month">${MONTHS_CAP[M - 1]} ${Y}</div><div class="calendar__grid">`;
    let idx = 0;
    DOW_SHORT.forEach((d) => (html += `<div class="dow" style="--i:${idx++}">${d}</div>`));
    for (let i = 0; i < offset; i++) html += `<div style="--i:${idx++}"></div>`;
    for (let d = 1; d <= daysIn; d++) {
      const dow = (offset + d - 1) % 7;
      const cls = [d === D ? "day--event" : "", dow >= 5 ? "wknd" : ""].join(" ").trim();
      html += `<div class="${cls}" style="--i:${idx++}">${d}</div>`;
    }
    $("#calendar").innerHTML = html + "</div>";
  })();

  /* ---------- Тойго чейин ---------- */
  (function countdown() {
    const box = $("#countdown");
    const u = { days: $('[data-unit="days"]'), hours: $('[data-unit="hours"]'), minutes: $('[data-unit="minutes"]'), seconds: $('[data-unit="seconds"]') };
    function set(el, v) {
      const s = pad2(v);
      if (el.textContent !== s) { el.textContent = s; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    }
    function tick() {
      const diff = eventDate - new Date();
      if (diff <= 0) { box.innerHTML = '<div class="countdown--done">Бул күн келди! ♥</div>'; return; }
      const s = Math.floor(diff / 1000);
      set(u.days, Math.floor(s / 86400));
      set(u.hours, Math.floor((s % 86400) / 3600));
      set(u.minutes, Math.floor((s % 3600) / 60));
      set(u.seconds, s % 60);
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
  })();

  /* ---------- Скролл-анимация ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Музыка ---------- */
  const audio = $("#bg-music");
  const musicBtn = $("#music-btn");
  if (CFG.music) audio.src = CFG.music;
  audio.volume = 0;
  let fadeTimer = null;
  function fadeTo(target, ms = 1500) {
    clearInterval(fadeTimer);
    const start = audio.volume, steps = 30;
    let i = 0;
    fadeTimer = setInterval(() => {
      i++; audio.volume = Math.max(0, Math.min(1, start + (target - start) * (i / steps)));
      if (i >= steps) { clearInterval(fadeTimer); if (target === 0) audio.pause(); }
    }, ms / steps);
  }
  function setPlaying(on) { musicBtn.classList.toggle("is-playing", on); musicBtn.setAttribute("aria-pressed", on ? "true" : "false"); }
  function play() {
    const p = audio.play();
    if (p && p.then) p.then(() => { fadeTo(0.7); setPlaying(true); }).catch(() => setPlaying(false));
    else { fadeTo(0.7); setPlaying(true); }
  }
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
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !audio.paused) audio.pause();
    else if (!document.hidden && musicBtn.classList.contains("is-playing")) audio.play().catch(() => {});
  });

  $(".scroll-hint").addEventListener("click", (e) => { e.preventDefault(); $("#invite").scrollIntoView({ behavior: "smooth" }); });

  /* ---------- Мукаба ---------- */
  document.body.classList.add("locked");
  const stopDust = startDust();
  $("#open-btn").addEventListener("click", () => {
    const intro = $("#intro");
    if (intro.classList.contains("is-opening")) return;
    intro.classList.add("is-opening");
    play();
    setTimeout(() => { document.body.classList.remove("locked"); document.body.classList.add("opened"); startPetals(); }, 450);
    setTimeout(() => { musicBtn.classList.add("is-visible"); }, 1400);
    setTimeout(() => { intro.classList.add("is-hidden"); stopDust(); }, 1900);
  });

  /* ---------- Алтын чаң / Золотая пыль на обложке ---------- */
  function startDust() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
    const canvas = $("#dust"), ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, raf, alive = true;
    function resize() { W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr; }
    addEventListener("resize", resize); resize();
    const N = Math.min(70, Math.floor(innerWidth / 9));
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: (0.6 + Math.random() * 1.6) * dpr,
      vy: -(0.08 + Math.random() * 0.25) * dpr, vx: (Math.random() - 0.5) * 0.15 * dpr,
      t: Math.random() * Math.PI * 2, ts: 0.01 + Math.random() * 0.03,
    }));
    function draw() {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.t += p.ts; p.y += p.vy; p.x += p.vx + Math.sin(p.t) * 0.15 * dpr;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(p.t * 2));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,175,120,${a})`; ctx.fill();
        if (p.r > 1.6 * dpr) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fillStyle = `rgba(201,175,120,${a * 0.12})`; ctx.fill(); }
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { alive = false; cancelAnimationFrame(raf); };
  }

  /* ---------- Гүл желекчелери / Лепестки ---------- */
  function startPetals() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = $("#petals"), ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H;
    const COLORS = ["#efd3d6", "#e6c2c8", "#f2e1d6", "#d9c9ad", "#eedde0"];
    function resize() { W = canvas.width = innerWidth * dpr; H = canvas.height = innerHeight * dpr; }
    addEventListener("resize", resize); resize();
    const N = Math.min(26, Math.max(12, Math.floor(innerWidth / 34)));
    const petals = [];
    function make(init) {
      return {
        x: Math.random() * W, y: init ? Math.random() * H : -20 * dpr,
        r: (6 + Math.random() * 8) * dpr, vy: (0.35 + Math.random() * 0.7) * dpr,
        vx: (Math.random() - 0.5) * 0.5 * dpr, a: Math.random() * Math.PI * 2,
        va: (Math.random() - 0.5) * 0.03, sway: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0], o: 0.45 + Math.random() * 0.4,
      };
    }
    for (let i = 0; i < N; i++) petals.push(make(true));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      petals.forEach((p) => {
        p.sway += 0.02; p.y += p.vy; p.x += p.vx + Math.sin(p.sway) * 0.4 * dpr; p.a += p.va;
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) Object.assign(p, make(false));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r, -p.r, p.r, p.r * 0.6, 0, p.r);
        ctx.bezierCurveTo(-p.r, p.r * 0.6, -p.r, -p.r, 0, -p.r);
        ctx.fill(); ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- Суроо (RSVP) ---------- */
  const LABELS = { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" };
  const form = $("#rsvp-form"), note = $("#form-note"), submitBtn = $("#rsvp-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameField = form.name.closest(".field");
    const name = form.name.value.trim();
    if (!name) { nameField.classList.add("is-error"); form.name.focus(); return; }
    nameField.classList.remove("is-error");
    const attend = form.attend.value;

    if (CFG.googleScriptUrl) {
      submitBtn.disabled = true; note.textContent = "Жөнөтүлүүдө…";
      try {
        await fetch(CFG.googleScriptUrl, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ name, rsvp: attend, rsvpLabel: LABELS[attend], timestamp: new Date().toISOString(), userAgent: navigator.userAgent }),
        });
        showSuccess();
      } catch (err) {
        note.textContent = "Ката кетти. Кайра аракет кылыңыз же WhatsApp аркылуу жазыңыз.";
        submitBtn.disabled = false;
      }
      return;
    }
    // WhatsApp аркылуу
    const text = [
      `Саламатсызбы! ${CFG.groom} менен ${CFG.bride} үйлөнүү тоюна жооп 💍`,
      `Аты-жөнү: ${name}`,
      `Жооп: ${LABELS[attend]}`,
    ].join("\n");
    window.open(`https://wa.me/${(CFG.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    showSuccess();
  });
  function showSuccess() {
    form.hidden = true;
    const s = $("#rsvp-success"); s.hidden = false; s.classList.add("is-shown");
  }
})();

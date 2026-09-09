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

  /* ---------- Тил / Язык ---------- */
  const T = {
    ky: {
      tap: "Чакырууну ачуу үчүн басыңыз", heroKicker: "Үйлөнүү той", titleSuffix: "Үйлөнүү той", dear: "Урматтуу {name}!",
      kInvite: "Чакыруу", kDate: "Той салтанаты", at: "саат", toy: "Той", late: "Той убактысынан кечикпеңиздер!", calBtn: "📅 Календарга кошуу",
      kCountdown: "Тойго чейин", countdownTitle: "Калды", days: "күн", hours: "саат", minutes: "мүнөт", seconds: "секунд", done: "Бул күн келди! ♥",
      kVenue: "Дарегибиз", routeBtn: "📍 Картадан кароо", kHosts: "Той ээлери", hostsText: "Сиздерди ак дасторконубуздун кадырлуу коногу болууга чакырабыз",
      kNotes: "Эскертүү", notesTitle: "Маанилүү маалымат", kRsvp: "Суроо", rsvpTitle: "Тойго келесизби?", rsvpSub: "Жообуңузду алдын ала билдирип коюңуз",
      nameLabel: "Аты-жөнүңүз", namePh: "Мисалы: Айбек Асанов", nameHint: "Жубайыңыз менен келе турчу болсоңуз, анын да атын кошо жазып кетиңиз",
      yes: "Келемин 🥰", both: "Жубайым менен келемин 👫", no: "Келе албаймын 😔", submit: "Жөнөтүү", sending: "Жөнөтүлүүдө…",
      err: "Ката кетти. Кайра аракет кылыңыз же WhatsApp аркылуу жазыңыз.", thanks: "Рахмат!", received: "Жообуңуз кабыл алынды.<br>Сизди тойдо күтөбүз.",
      labels: { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" },
      wa: (g, b) => `Саламатсызбы! ${g} менен ${b} үйлөнүү тоюна жооп 💍`, waName: "Аты-жөнү", waAnswer: "Жооп", calTitle: (g, b) => `${g} & ${b} — үйлөнүү той`,
      months: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
      weekdays: ["Жекшемби", "Дүйшөмбү", "Шейшемби", "Шаршемби", "Бейшемби", "Жума", "Ишемби"],
      dow: ["Дүй", "Шей", "Шар", "Бей", "Жум", "Ише", "Жек"],
      dateLong: (d, m, y) => `${d}-${m} ${y}-жыл`, calMonth: (m, y) => `${m[0].toUpperCase() + m.slice(1)} ${y}`,
    },
    ru: {
      tap: "Нажмите, чтобы открыть приглашение", heroKicker: "Свадьба", titleSuffix: "Свадьба", dear: "Дорогие {name}!",
      kInvite: "Приглашение", kDate: "Торжество", at: "в", toy: "Торжество", late: "Пожалуйста, не опаздывайте!", calBtn: "📅 Добавить в календарь",
      kCountdown: "До торжества", countdownTitle: "Осталось", days: "дней", hours: "часов", minutes: "минут", seconds: "секунд", done: "Этот день настал! ♥",
      kVenue: "Адрес", routeBtn: "📍 Открыть карту", kHosts: "Хозяева торжества", hostsText: "Приглашаем вас стать почётными гостями нашего торжества",
      kNotes: "Важно", notesTitle: "Полезная информация", kRsvp: "Ответ", rsvpTitle: "Вы придёте?", rsvpSub: "Пожалуйста, ответьте заранее",
      nameLabel: "Ваше имя и фамилия", namePh: "Например: Айбек Асанов", nameHint: "Если придёте с супругом(ой), укажите и его/её имя",
      yes: "Приду 🥰", both: "Приду с супругом(ой) 👫", no: "К сожалению, не смогу 😔", submit: "Отправить", sending: "Отправляем…",
      err: "Ошибка. Попробуйте ещё раз или напишите в WhatsApp.", thanks: "Спасибо!", received: "Ваш ответ принят.<br>Ждём вас на торжестве.",
      labels: { yes: "Приду", both: "Приду с супругом(ой)", no: "Не смогу" },
      wa: (g, b) => `Здравствуйте! Ответ на приглашение на свадьбу ${g} и ${b} 💍`, waName: "Имя", waAnswer: "Ответ", calTitle: (g, b) => `${g} & ${b} — свадьба`,
      months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
      monthsNom: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      weekdays: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
      dow: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      dateLong: (d, m, y) => `${d} ${m} ${y} года`, calMonth: (m, y, i) => `${T.ru.monthsNom[i]} ${y}`,
    },
  };
  let LANG = "ky";
  try { const saved = localStorage.getItem("lang"); if (saved === "ru" || saved === "ky") LANG = saved; } catch (e) {}
  const t = (k) => (T[LANG][k] !== undefined ? T[LANG][k] : T.ky[k]);
  // Орусча тексттер config.ru ичинде / Русские тексты лежат в config.ru
  const cfgL = (k) => (LANG === "ru" && CFG.ru && CFG.ru[k] !== undefined && CFG.ru[k] !== "" ? CFG.ru[k] : CFG[k]);

  /* ---------- Күн / Дата ---------- */
  const [Y, M, D] = (CFG.date || "2026-10-10").split("-").map(Number);
  const [hh, mm] = (CFG.timeStart || "17:00").split(":").map(Number);
  const eventDate = new Date(Y, M - 1, D, hh, mm, 0);
  const pad2 = (n) => String(n).padStart(2, "0");

  // Шаблондогу {groom}, {bride} ж.б. алмаштыруу
  const fill = (s) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => (CFG[k] !== undefined ? CFG[k] : `{${k}}`));

  let values = {};
  function computeValues() {
    values = {
      groom: CFG.groom, bride: CFG.bride,
      hostFather: CFG.hostFather, hostMother: CFG.hostMother,
      dateDay: pad2(D), dateMonth: pad2(M), dateYear: String(Y),
      dateLong: t("dateLong")(D, t("months")[M - 1], Y),
      weekday: t("weekdays")[eventDate.getDay()],
      timeStart: CFG.timeStart, timeEnd: CFG.timeEnd,
      region: cfgL("region"), venueName: cfgL("venueName"), venueAddress: cfgL("venueAddress"),
      addressLine: [cfgL("region"), cfgL("venueAddress")].filter(Boolean).join(", "),
      inviteTitle: cfgL("inviteTitle"), inviteText: fill(cfgL("inviteText")), closingText: cfgL("closingText"),
    };
  }
  function fillValues() {
    $$("[data-cfg]").forEach((el) => {
      if (el.querySelector(".ch")) return; // аттар тамга-тамга бөлүнгөн / имена уже разбиты по буквам
      const v = values[el.dataset.cfg];
      if (el.dataset.cfg === "addressLine") { el.textContent = v || ""; el.hidden = !v; return; }
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    document.title = `${CFG.groom} & ${CFG.bride} — ${t("titleSuffix")}`;
    document.documentElement.lang = LANG;
  }
  computeValues(); fillValues();

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
  // Календарга кошуу / Добавить в календарь (Google Calendar)
  function calendarLink() {
    const a = $("#cal-btn"); if (!a) return;
    const [eh, em] = (CFG.timeEnd || "23:00").split(":").map(Number);
    const f = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
    const end = new Date(Y, M - 1, D, eh, em, 0);
    const p = new URLSearchParams({ action: "TEMPLATE", text: t("calTitle")(CFG.groom, CFG.bride), dates: `${f(eventDate)}/${f(end)}`, details: location.href, location: values.addressLine ? `${values.venueName}, ${values.addressLine}` : values.venueName || "" });
    a.href = `https://calendar.google.com/calendar/render?${p}`;
    // iPhone: .ics файл ачылат жана календарга кошулат / на iPhone .ics открывает системный календарь
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) { a.href = "assets/toy.ics"; a.removeAttribute("target"); }
  }
  calendarLink();
  // Жеке кайрылуу: ?g=Аты / Персональное обращение через ссылку ?g=Имя
  const GUEST = (new URLSearchParams(location.search).get("g") || "").trim().slice(0, 60);
  function applyGuest() {
    const el = $("#guest"); if (!el) return;
    if (!GUEST) { el.hidden = true; return; }
    el.textContent = t("dear").replace("{name}", GUEST); el.hidden = false;
    const inp = $("#rsvp-form input[name=name]"); if (inp && !inp.value) inp.value = GUEST;
  }
  applyGuest();
  $$(".hero__names [data-cfg]").forEach((el, i) => splitLetters(el, `${0.4 + i * 0.6}s`));
  $$(".hosts__names [data-cfg]").forEach((el, i) => splitLetters(el, `${0.3 + i * 0.5}s`));

  /* ---------- Сөз-сөз / Появление текста по словам ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/); el.textContent = "";
    words.forEach((w, i) => { const s = document.createElement("span"); s.className = "word"; s.style.setProperty("--w", i); s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(" ")); });
  }
  const WORD_ELS = '.lead[data-cfg="inviteText"], .hosts__text, .footer__text';
  $$(WORD_ELS).forEach(splitWords);
  // Веточка-разделитель над каждой секцией
  const DIVIDER = '<path d="M4 16 C 50 4, 90 26, 130 15 S 210 4, 256 16"/><path d="M60 13 c -6 -8 -4 -14 4 -16 c 2 8 0 13 -4 16 Z"/><path d="M118 17 c 6 6 4 13 -3 15 c -2 -7 0 -12 3 -15 Z"/><path d="M186 12 c -6 -8 -4 -14 4 -16 c 2 8 0 13 -4 16 Z"/><path d="M130 15 m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0"/>';
  $$(".section .container.reveal").forEach((c) => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("class", "divider"); s.setAttribute("viewBox", "0 0 260 28"); s.innerHTML = DIVIDER; c.insertBefore(s, c.firstChild); });
  $$(".reveal").forEach((r) => Array.from(r.children).forEach((c, i) => c.style.setProperty("--n", i)));

  /* ---------- Толкундар / Волнистые границы между разделами ---------- */
  (function waves() {
    const TOP = { "section--invite": "var(--bg)", "section--date": "var(--bg)", "section--countdown": "#4c463f", "section--venue": "var(--bg)", "section--hosts": "var(--bg-2)", "section--notes": "var(--bg)", "section--rsvp": "var(--bg)", "footer": "#4c463f" };
    const blocks = $$(".section, .footer");
    const PATH = "M0 34 C 200 8, 400 60, 600 34 S 1000 8, 1200 34 S 1600 60, 1800 34 S 2200 8, 2400 34 L2400 60 L0 60 Z";
    blocks.forEach((b, i) => {
      const next = blocks[i + 1]; if (!next) return;
      const key = Object.keys(TOP).find((k) => next.classList.contains(k)); const color = TOP[key] || "var(--bg)";
      const w = document.createElement("div"); w.className = "wave";
      w.innerHTML = `<svg class="wave--back" viewBox="0 0 2400 60" preserveAspectRatio="none" aria-hidden="true"><path d="${PATH}" style="fill:${color}" transform="translate(300 -8)"/></svg><svg class="wave--front" viewBox="0 0 2400 60" preserveAspectRatio="none" aria-hidden="true"><path d="${PATH}" style="fill:${color}"/></svg>`;
      b.appendChild(w);
    });
  })();

  /* ---------- Параллакс, боке, наклон, волна ---------- */
  const hero = $(".hero");
  if (CFG.heroImage) { hero.style.setProperty("--hero-img", `url("${CFG.heroImage}")`); hero.classList.add("has-photo"); }
  [1, 2, 3].forEach((i) => { const b = document.createElement("div"); b.className = `hero__bokeh hero__bokeh--${i}`; hero.insertBefore(b, hero.firstChild); });
  let syTick = false;
  addEventListener("scroll", () => {
    if (syTick) return; syTick = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--sy", Math.min(scrollY, 900));
      document.documentElement.style.setProperty("--sp", (scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)).toFixed(4));
      syTick = false;
    });
  }, { passive: true });
  if (window.matchMedia("(hover: hover)").matches) {
    $$(".note, .countdown__item").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.classList.add("tilt-on"); card.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.classList.remove("tilt-on"); card.style.transform = ""; });
    });
  }
  $$(".btn").forEach((b) => b.addEventListener("pointerdown", (e) => {
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const sp = document.createElement("span"); sp.className = "ripple";
    sp.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 800);
  }));

  /* ---------- Эскертүүлөр ---------- */
  const notes = $("#notes");
  function renderNotes() {
    notes.innerHTML = "";
    (cfgL("notes") || []).forEach((n, i) => {
      const d = document.createElement("div");
      d.className = "note"; d.style.transitionDelay = `${i * 0.12}s`;
      d.innerHTML = `<div class="note__icon">${n.icon || "✨"}</div><p>${fill(n.text)}</p>`;
      notes.appendChild(d);
    });
  }
  renderNotes();

  /* ---------- Карта ---------- */
  const coords = (CFG.coords || "").replace(/\s+/g, "");
  const q = encodeURIComponent(coords || CFG.mapQuery || `${CFG.region || ""} ${CFG.venueAddress || ""}`.trim());
  $("#map").src = CFG.mapEmbedUrl || `https://www.google.com/maps?q=${q}&z=${coords ? 17 : 16}&output=embed&hl=ru`;
  $("#route-btn").href = CFG.routeUrl || (coords ? `https://www.google.com/maps/dir/?api=1&destination=${coords}` : `https://www.google.com/maps/search/?api=1&query=${q}`);

  /* ---------- Календарь ---------- */
  function buildCalendar() {
    const first = new Date(Y, M - 1, 1);
    const daysIn = new Date(Y, M, 0).getDate();
    let offset = first.getDay() - 1; if (offset < 0) offset = 6; // дүйшөмбүдөн башталат
    let html = `<div class="calendar__month">${t("calMonth")(t("months")[M - 1], Y, M - 1)}</div><div class="calendar__grid">`;
    let idx = 0;
    t("dow").forEach((d) => (html += `<div class="dow" style="--i:${idx++}">${d}</div>`));
    for (let i = 0; i < offset; i++) html += `<div style="--i:${idx++}"></div>`;
    for (let d = 1; d <= daysIn; d++) {
      const dow = (offset + d - 1) % 7;
      const cls = [d === D ? "day--event" : "", dow >= 5 ? "wknd" : ""].join(" ").trim();
      html += `<div class="${cls}" style="--i:${idx++}">${d}</div>`;
    }
    $("#calendar").innerHTML = html + "</div>";
  }
  buildCalendar();

  /* ---------- Тойго чейин ---------- */
  (function countdown() {
    const box = $("#countdown");
    const u = { days: $('[data-unit="days"]'), hours: $('[data-unit="hours"]'), minutes: $('[data-unit="minutes"]'), seconds: $('[data-unit="seconds"]') };
    function set(el, v) {
      const s = pad2(v);
      if (el.textContent !== s) { el.textContent = s; el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
    }
    let rolling = false;
    function parts() { const s = Math.max(0, Math.floor((eventDate - new Date()) / 1000)); return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]; }
    function show(v) { set(u.days, v[0]); set(u.hours, v[1]); set(u.minutes, v[2]); set(u.seconds, v[3]); }
    function tick() {
      if (eventDate - new Date() <= 0) { box.innerHTML = `<div class="countdown--done">${t("done")}</div>`; return; }
      if (!rolling) show(parts());
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
    // Санак «айланып» чыгат / Цифры раскручиваются при первом показе
    window.__rollCountdown = () => {
      if (rolling) return; rolling = true; const t0 = performance.now(), target = parts();
      (function step(now) {
        const t = Math.min(1, (now - t0) / 1500), e = 1 - Math.pow(1 - t, 3);
        show(target.map((v) => Math.round(v * e)));
        if (t < 1) requestAnimationFrame(step); else { rolling = false; show(parts()); }
      })(t0);
    };
  })();

  /* ---------- Скролл-анимация ---------- */
  // Секциялар ар бир жолу кайра жанданат / Анимации повторяются при каждом возврате
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) { e.target.classList.remove("is-visible"); return; }
      if (e.intersectionRatio < 0.12 || e.target.classList.contains("is-visible")) return;
      e.target.classList.add("is-visible");
      if (e.target.closest(".section--countdown") && window.__rollCountdown) setTimeout(window.__rollCountdown, 250);
    });
  }, { threshold: [0, 0.12], rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
  const heroIo = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) hero.classList.add("is-out");
    else if (e.intersectionRatio >= 0.3) requestAnimationFrame(() => hero.classList.remove("is-out"));
  }), { threshold: [0, 0.3] });
  heroIo.observe(hero);

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
  // Ачуу: сыдыруу, чыйратуу, баскыч же басуу / Открытие: свайп, колесо, клавиша или клик
  const intro = $("#intro");
  const env = $("#env");
  function openInvite() {
    if (env.classList.contains("is-open")) return;
    env.classList.add("is-open"); // печать тайып, клапан ачылат / печать исчезает, клапан открывается, створки разъезжаются
    play();
    setTimeout(() => { document.body.classList.remove("locked"); document.body.classList.add("opened"); startPetals(); }, 700);
    setTimeout(() => { musicBtn.classList.add("is-visible"); }, 1500);
    setTimeout(() => { intro.classList.add("is-hidden"); stopDust(); }, 1700);
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
        ctx.fillStyle = `rgba(255,248,225,${a})`; ctx.fill();
        if (p.r > 1.6 * dpr) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,248,225,${a * 0.12})`; ctx.fill(); }
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
    let wind = 0; addEventListener("scroll", () => { wind = Math.min(3, wind + 0.3); }, { passive: true });
    // Алтын учкундар / Вспышка золотых искр
    const sparks = [];
    window.__burst = (cx = W / 2, cy = H / 2, n = 70) => {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 6) * dpr; sparks.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5 * dpr, life: 1, r: (1 + Math.random() * 2) * dpr, gold: Math.random() < .7 }); }
    };
    setTimeout(() => window.__burst(), 200);
    function draw() {
      ctx.clearRect(0, 0, W, H); wind *= 0.95;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.06 * dpr; s.vx *= 0.97; s.vy *= 0.97; s.life -= 0.014;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? `rgba(201,175,120,${s.life})` : `rgba(209,149,158,${s.life})`; ctx.fill();
      }
      petals.forEach((p) => {
        p.sway += 0.02 + wind * 0.01; p.y += p.vy * (1 + wind); p.x += p.vx + Math.sin(p.sway) * (0.4 + wind * 0.3) * dpr; p.a += p.va * (1 + wind);
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
  // CallMeBot аркылуу: жооп ээлердин WhatsApp'ына өзү келет / Ответ приходит хозяевам в WhatsApp автоматически
  function sendCallMeBot(text) {
    const c = CFG.callmebot || {}; if (!c.phone || !c.apikey) return false;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(String(c.phone).replace(/\D/g, ""))}&apikey=${encodeURIComponent(c.apikey)}&text=${encodeURIComponent(text)}`;
    try { fetch(url, { mode: "no-cors", cache: "no-store" }).catch(() => {}); new Image().src = url; return true; } catch (e) { return false; }
  }

  // Telegram аркылуу: жооп ээлерине өзү келет / Ответ приходит хозяевам в Telegram автоматически
  async function sendTelegram(text) {
    const tg = CFG.telegram || {}; if (!tg.token || !tg.chatId) return false;
    try {
      const r = await fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, { method: "POST", body: new URLSearchParams({ chat_id: tg.chatId, text }) });
      return r.ok;
    } catch (e) { return false; }
  }

  const form = $("#rsvp-form"), note = $("#form-note"), submitBtn = $("#rsvp-submit");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameField = form.name.closest(".field");
    const name = form.name.value.trim();
    if (!name) { nameField.classList.add("is-error"); form.name.focus(); return; }
    nameField.classList.remove("is-error");
    const attend = form.attend.value;
    const stamp = new Date().toLocaleString("ru-RU", { hour12: false });
    const tgText = `💌 Жаңы жооп / Новый ответ\n👤 ${name}\n✅ ${T.ky.labels[attend]} / ${T.ru.labels[attend]}\n🕒 ${stamp}`;

    if (CFG.callmebot && CFG.callmebot.phone && CFG.callmebot.apikey) {
      submitBtn.disabled = true; note.textContent = t("sending");
      if (sendCallMeBot(tgText)) { setTimeout(showSuccess, 900); return; }
      submitBtn.disabled = false; note.textContent = "";
    }
    if (CFG.telegram && CFG.telegram.token && CFG.telegram.chatId) {
      submitBtn.disabled = true; note.textContent = t("sending");
      if (await sendTelegram(tgText)) { showSuccess(); return; }
      submitBtn.disabled = false; note.textContent = "";
    }

    if (CFG.googleScriptUrl) {
      submitBtn.disabled = true; note.textContent = t("sending");
      try {
        await fetch(CFG.googleScriptUrl, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ name, rsvp: attend, rsvpLabel: T.ky.labels[attend], lang: LANG, timestamp: new Date().toISOString(), userAgent: navigator.userAgent }),
        });
        showSuccess();
      } catch (err) {
        note.textContent = t("err");
        submitBtn.disabled = false;
      }
      return;
    }
    // WhatsApp аркылуу
    const text = [t("wa")(CFG.groom, CFG.bride), `${t("waName")}: ${name}`, `${t("waAnswer")}: ${t("labels")[attend]}`].join("\n");
    showSuccess();
    setTimeout(() => { location.href = `https://wa.me/${(CFG.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`; }, 400);
  });
  function showSuccess() {
    if (window.__burst) { const r = $("#rsvp").getBoundingClientRect(); window.__burst(innerWidth / 2 * (devicePixelRatio > 2 ? 2 : devicePixelRatio || 1), Math.min(innerHeight, Math.max(0, r.top + 200)) * (devicePixelRatio > 2 ? 2 : devicePixelRatio || 1), 90); }
    form.hidden = true;
    const s = $("#rsvp-success"); s.hidden = false; s.classList.add("is-shown");
  }

  /* ---------- Тилди алмаштыруу / Переключение языка ---------- */
  function applyLang(lang, first) {
    LANG = lang;
    try { localStorage.setItem("lang", lang); } catch (e) {}
    $$("[data-i18n]").forEach((el) => { const v = t(el.dataset.i18n); if (typeof v === "string") el.textContent = v; });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("#lang button").forEach((b) => b.classList.toggle("is-active", b.dataset.lang === lang));
    if (first) return;
    computeValues(); fillValues(); renderNotes(); buildCalendar(); calendarLink(); applyGuest();
    $$(WORD_ELS).forEach(splitWords);
    if (!document.body.classList.contains("locked")) $$(".reveal.is-visible").forEach((r) => { r.classList.remove("is-visible"); void r.offsetWidth; r.classList.add("is-visible"); });
  }
  $$("#lang button").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); if (b.dataset.lang !== LANG) applyLang(b.dataset.lang); }));
  if (LANG !== "ky") applyLang(LANG); else applyLang("ky", true);
})();

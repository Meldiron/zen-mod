// ==UserScript==
// @name           Tab Done
// @description    Checkbox closing, confetti, streaks, daily goal, tab aging and inbox zero
// @include        main
// ==/UserScript==

(() => {
  const PREF_STATE = "tabdone.state";
  const PREF_GOAL = "tabdone.daily-goal";
  const PREF_COMBO = "tabdone.combo-seconds";
  const PREF_AGING = "tabdone.aging-speed";
  const PREF_INBOX_ZERO = "tabdone.inbox-zero";
  const PREF_COUNT_SHORTCUT = "tabdone.count-shortcut";
  const CREATED_KEY = "tabdone-created";

  const CHECK_DELAY = 240;
  const MILESTONES = [5, 10, 25, 50, 100];
  const AGING_HOURS = {
    fast: [2, 8, 24],
    normal: [24, 72, 168],
    slow: [72, 168, 336],
  };
  const COLORS = ["#22c55e", "#4ade80", "#facc15", "#38bdf8", "#f472b6", "#a78bfa", "#fb923c"];
  const XHTML = "http://www.w3.org/1999/xhtml";
  const SVG = "http://www.w3.org/2000/svg";

  function pref(name, fallback) {
    const prefs = Services.prefs;
    switch (prefs.getPrefType(name)) {
      case prefs.PREF_INT:
        return prefs.getIntPref(name);
      case prefs.PREF_BOOL:
        return prefs.getBoolPref(name);
      case prefs.PREF_STRING: {
        const value = prefs.getStringPref(name);
        if (typeof fallback === "number") {
          const n = parseInt(value, 10);
          return Number.isFinite(n) && n > 0 ? n : fallback;
        }
        if (typeof fallback === "boolean") return value === "true";
        return value || fallback;
      }
      default:
        return fallback;
    }
  }

  function dayKey(date = new Date()) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${m}-${d}`;
  }

  function loadState() {
    try {
      const state = JSON.parse(Services.prefs.getStringPref(PREF_STATE, "{}"));
      state.days ??= {};
      state.total ??= 0;
      return state;
    } catch {
      return { days: {}, total: 0 };
    }
  }

  function saveState(state) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 400);
    const oldest = dayKey(cutoff);
    for (const key of Object.keys(state.days)) {
      if (key < oldest) delete state.days[key];
    }
    Services.prefs.setStringPref(PREF_STATE, JSON.stringify(state));
  }

  function streakOf(state) {
    const met = key => {
      const day = state.days[key];
      return day && day.count >= day.goal;
    };
    const cursor = new Date();
    if (!met(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (met(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function today(state) {
    const goal = pref(PREF_GOAL, 10);
    const day = state.days[dayKey()] ?? { count: 0, goal };
    day.goal = goal;
    return day;
  }

  function recordDone() {
    const state = loadState();
    const day = today(state);
    day.count++;
    state.days[dayKey()] = day;
    state.total++;
    const streak = streakOf(state);
    state.best = Math.max(state.best ?? 0, streak);
    saveState(state);
    return { count: day.count, goal: day.goal, streak, total: state.total };
  }

  // Confetti

  let canvas, ctx, particles = [], texts = [], running = false, lastBurst = 0;

  function ensureCanvas() {
    if (!canvas) {
      canvas = document.createElementNS(XHTML, "canvas");
      canvas.id = "tabdone-confetti";
      document.documentElement.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(p) {
    particles.push({
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      round: Math.random() < 0.3,
      life: 0,
      ttl: 40 + Math.random() * 25,
      ...p,
    });
  }

  function burst(x, y, { count = 80, power = 1 } = {}) {
    ensureCanvas();
    const base = x < window.innerWidth / 2 ? -Math.PI / 4 : (-3 * Math.PI) / 4;
    for (let i = 0; i < count; i++) {
      const angle = base + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = (5 + Math.random() * 6) * power;
      spawn({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
    }
    start();
  }

  function rain(count) {
    ensureCanvas();
    for (let i = 0; i < count; i++) {
      spawn({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.25,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        ttl: 80 + Math.random() * 40,
      });
    }
    start();
  }

  function floatText(text, x, y, { size = 16, ttl = 45, color = "#22c55e" } = {}) {
    ensureCanvas();
    texts.push({ text, x, y, size, ttl, color, life: 0 });
    start();
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  }

  function tick() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    particles = particles.filter(p => p.life < p.ttl && p.y < h + 40);
    for (const p of particles) {
      p.life++;
      p.vx *= 0.97;
      p.vy = p.vy * 0.97 + 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (p.ttl - p.life) / 15);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life / 6)) + 1);
      }
      ctx.restore();
    }
    texts = texts.filter(t => t.life < t.ttl);
    for (const t of texts) {
      t.life++;
      const progress = t.life / t.ttl;
      const pop = Math.min(1, t.life / 8);
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1 - progress) * 3);
      ctx.font = `800 ${t.size * (0.6 + 0.4 * pop)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      const y = t.y - progress * 30;
      ctx.strokeText(t.text, t.x, y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, y);
      ctx.restore();
    }
    if (particles.length || texts.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, w, h);
    }
  }

  // Celebration logic

  let combo = 0, lastDone = 0;

  function originFor(tab) {
    for (const el of [tab.querySelector(".tab-close-button"), tab]) {
      const r = el?.getBoundingClientRect();
      if (r && r.width > 0 && r.height > 0) {
        return el === tab
          ? [r.right - 16, r.top + r.height / 2]
          : [r.left + r.width / 2, r.top + r.height / 2];
      }
    }
    return [window.innerWidth / 2, window.innerHeight / 3];
  }

  function celebrate(tab, result) {
    const now = Date.now();
    combo = now - lastDone < pref(PREF_COMBO, 6) * 1000 ? combo + 1 : 1;
    lastDone = now;

    if (now - lastBurst < 120) return;
    lastBurst = now;

    const [x, y] = originFor(tab);
    const level = combo - 1;
    burst(x, y, { count: Math.min(25 + level * 10, 80), power: Math.min(1 + level * 0.06, 1.3) });
    floatText(combo > 1 ? `×${combo} combo!` : "+1", x + 30, y - 10, {
      size: Math.min(16 + level * 2, 26),
      color: combo > 1 ? "#facc15" : "#22c55e",
    });

    const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
    if (result.count === result.goal) {
      rain(120);
      setTimeout(() => burst(cx - 200, cy + 120, { count: 40, power: 1.2 }), 150);
      setTimeout(() => burst(cx + 200, cy + 120, { count: 40, power: 1.2 }), 300);
      floatText("Daily goal hit!", cx, cy, { size: 44, ttl: 100, color: "#22c55e" });
      floatText(`🔥 ${result.streak} day streak`, cx, cy + 56, { size: 24, ttl: 100, color: "#fb923c" });
    } else if (MILESTONES.includes(result.count)) {
      rain(60);
      floatText(`${result.count} done today!`, cx, cy, { size: 36, ttl: 80, color: "#facc15" });
    }
  }

  // Inbox zero

  function isBlankTab(tab) {
    return tab.isEmpty && !tab.hasAttribute("pending");
  }

  function remainingTodos() {
    return gBrowser.visibleTabs.filter(
      tab =>
        !tab.closing &&
        !tab.pinned &&
        !tab.hasAttribute("zen-essential") &&
        !tab.hasAttribute("zen-empty-tab") &&
        !tab.hasAttribute("zen-glance-tab") &&
        !isBlankTab(tab)
    ).length;
  }

  let allClear, wash;

  function showAllClear() {
    const sidebar = document.getElementById("navigator-toolbox")?.getBoundingClientRect();
    if (!sidebar?.width || sidebar.right <= 0) return;
    allClear?.remove();
    allClear = document.createElementNS(XHTML, "div");
    allClear.id = "tabdone-all-clear";
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 44 44");
    const circle = document.createElementNS(SVG, "circle");
    circle.setAttribute("cx", "22");
    circle.setAttribute("cy", "22");
    circle.setAttribute("r", "20");
    const check = document.createElementNS(SVG, "path");
    check.setAttribute("d", "M14 22.5l5.5 5.5L30.5 17");
    svg.append(circle, check);
    allClear.appendChild(svg);
    const state = loadState();
    const streak = streakOf(state);
    for (const [cls, text] of [
      ["title", "All clear"],
      ["stats", `${today(state).count} done today${streak ? ` · 🔥 ${streak}` : ""}`],
    ]) {
      const line = document.createElementNS(XHTML, "div");
      line.className = `tabdone-all-clear-${cls}`;
      line.textContent = text;
      allClear.appendChild(line);
    }
    const footer = widget ?? document.getElementById("zen-sidebar-foot-buttons");
    const bottom = footer?.getBoundingClientRect().top || sidebar.bottom;
    Object.assign(allClear.style, {
      left: `${sidebar.left}px`,
      width: `${sidebar.width}px`,
      top: `${(sidebar.top + bottom) / 2}px`,
    });
    document.documentElement.appendChild(allClear);
    const el = allClear;
    setTimeout(() => el.setAttribute("leaving", "true"), 3000);
    setTimeout(() => el.remove(), 3500);
  }

  function playWash() {
    const sidebar = document.getElementById("navigator-toolbox")?.getBoundingClientRect();
    if (!sidebar?.width) return;
    wash?.remove();
    wash = document.createElementNS(XHTML, "div");
    wash.id = "tabdone-wash";
    Object.assign(wash.style, {
      left: `${sidebar.left}px`,
      top: `${sidebar.top}px`,
      width: `${sidebar.width}px`,
      height: `${sidebar.height}px`,
    });
    document.documentElement.appendChild(wash);
    const el = wash;
    setTimeout(() => el.remove(), 1700);
  }

  // Daily goal widget

  let widget;

  function buildWidget() {
    const footer = document.getElementById("zen-sidebar-foot-buttons");
    if (!footer) return;
    widget = document.createElementNS(XHTML, "div");
    widget.id = "tabdone-widget";

    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.classList.add("tabdone-ring");
    for (const cls of ["track", "progress"]) {
      const circle = document.createElementNS(SVG, "circle");
      circle.setAttribute("cx", "10");
      circle.setAttribute("cy", "10");
      circle.setAttribute("r", "8");
      circle.classList.add(`tabdone-ring-${cls}`);
      svg.appendChild(circle);
    }
    widget.appendChild(svg);

    for (const cls of ["count", "streak"]) {
      const span = document.createElementNS(XHTML, "span");
      span.className = `tabdone-${cls}`;
      widget.appendChild(span);
    }
    footer.before(widget);
    updateWidget();
  }

  function updateWidget() {
    if (!widget) return;
    const state = loadState();
    const day = today(state);
    const streak = streakOf(state);
    const ratio = Math.min(day.count / day.goal, 1);
    const circumference = 2 * Math.PI * 8;
    const progress = widget.querySelector(".tabdone-ring-progress");
    progress.style.strokeDasharray = `${circumference}`;
    progress.style.strokeDashoffset = `${circumference * (1 - ratio)}`;
    widget.toggleAttribute("goal-met", day.count >= day.goal);
    widget.querySelector(".tabdone-count").textContent = `${day.count} / ${day.goal} today`;
    widget.querySelector(".tabdone-streak").textContent = streak ? `🔥 ${streak}` : "";
    widget.title =
      `${day.count} of ${day.goal} tabs done today\n` +
      `Streak: ${streak} day${streak === 1 ? "" : "s"} (best ${state.best ?? 0})\n` +
      `All time: ${state.total}`;
  }

  // Tab aging

  function createdAt(tab) {
    const stored = parseInt(SessionStore.getCustomTabValue(tab, CREATED_KEY), 10);
    if (Number.isFinite(stored)) return stored;
    return tab.lastAccessed > 0 && tab.lastAccessed < Date.now() ? tab.lastAccessed : Date.now();
  }

  function ageTabs() {
    const hours = AGING_HOURS[pref(PREF_AGING, "normal")];
    const now = Date.now();
    for (const tab of gBrowser.tabs) {
      if (!hours || tab.pinned || tab.hasAttribute("zen-essential")) {
        tab.removeAttribute("tabdone-age");
        continue;
      }
      const ageHours = (now - createdAt(tab)) / 3600000;
      const level = hours.filter(h => ageHours >= h).length;
      if (level) tab.setAttribute("tabdone-age", level);
      else tab.removeAttribute("tabdone-age");
    }
  }

  function stampMissingCreated() {
    for (const tab of gBrowser.tabs) {
      if (!SessionStore.getCustomTabValue(tab, CREATED_KEY)) {
        SessionStore.setCustomTabValue(tab, CREATED_KEY, String(createdAt(tab)));
      }
    }
    ageTabs();
  }

  // Events

  function onTabOpen(event) {
    const tab = event.target;
    if (!SessionStore.getCustomTabValue(tab, CREATED_KEY)) {
      SessionStore.setCustomTabValue(tab, CREATED_KEY, String(Date.now()));
    }
  }

  let checkboxClose = null;

  function onTabClose(event) {
    const tab = event.target;
    const viaCheckbox = tab === checkboxClose;
    if (viaCheckbox) checkboxClose = null;
    if (
      event.detail?.adoptedBy ||
      window.closed ||
      tab.pinned ||
      tab.hasAttribute("zen-empty-tab") ||
      tab.hasAttribute("zen-glance-tab") ||
      isBlankTab(tab) ||
      (!viaCheckbox && !pref(PREF_COUNT_SHORTCUT, true))
    ) {
      return;
    }
    celebrate(tab, recordDone());
    if (pref(PREF_INBOX_ZERO, true)) {
      setTimeout(() => {
        if (!window.closed && remainingTodos() === 0) {
          playWash();
          showAllClear();
        }
      }, 450);
    }
  }

  function onCloseClick(event) {
    const button = event.target.closest?.(".tab-close-button");
    if (!button || event.button !== 0 || event.getModifierState("Accel")) return;
    const tab = button.closest(".tabbrowser-tab");
    if (!tab || tab.hasAttribute("tab-done")) return;
    event.preventDefault();
    event.stopPropagation();
    tab.setAttribute("tab-done", "true");
    setTimeout(() => {
      if (!tab.isConnected) return;
      checkboxClose = tab;
      if (tab.multiselected) {
        gBrowser.removeMultiSelectedTabs();
      } else {
        gBrowser.removeTab(tab, { animate: true });
      }
      gBrowser.tabContainer._blockDblClick = true;
      // A beforeunload prompt or the "close N tabs?" warning can cancel the
      // close. removeTab returns synchronously in that case with the tab
      // still open and not closing, so uncheck it so it can be done later.
      if (!tab.closing) {
        checkboxClose = null;
        tab.removeAttribute("tab-done");
      }
    }, CHECK_DELAY);
  }

  const prefObserver = {
    observe() {
      updateWidget();
      ageTabs();
    },
  };

  let timer, startupObserver;

  function init() {
    const tabs = gBrowser.tabContainer;
    tabs.addEventListener("TabOpen", onTabOpen);
    tabs.addEventListener("TabClose", onTabClose);
    tabs.addEventListener("click", onCloseClick, true);
    tabs.addEventListener("SSTabRestored", ageTabs);

    buildWidget();
    Services.prefs.addObserver("tabdone.", prefObserver);
    SessionStore.promiseAllWindowsRestored.then(() => {
      if (window.__tabDone === instance) stampMissingCreated();
    });

    let lastDay = dayKey();
    timer = setInterval(() => {
      ageTabs();
      if (dayKey() !== lastDay) {
        lastDay = dayKey();
        updateWidget();
      }
    }, 60000);
  }

  function destroy() {
    if (startupObserver) {
      Services.obs.removeObserver(startupObserver, "browser-delayed-startup-finished");
      startupObserver = null;
    }
    const tabs = gBrowser?.tabContainer;
    tabs?.removeEventListener("TabOpen", onTabOpen);
    tabs?.removeEventListener("TabClose", onTabClose);
    tabs?.removeEventListener("click", onCloseClick, true);
    tabs?.removeEventListener("SSTabRestored", ageTabs);
    Services.prefs.removeObserver("tabdone.", prefObserver);
    clearInterval(timer);
    widget?.remove();
    canvas?.remove();
    allClear?.remove();
    wash?.remove();
    widget = canvas = allClear = wash = null;
    particles = [];
    texts = [];
    for (const tab of gBrowser?.tabs ?? []) {
      tab.removeAttribute("tabdone-age");
      tab.removeAttribute("tab-done");
    }
    document.getElementById("tabdone-widget")?.remove();
    document.getElementById("tabdone-all-clear")?.remove();
    if (window.__tabDone === instance) delete window.__tabDone;
  }

  window.__tabDone?.destroy();
  const instance = { destroy };
  window.__tabDone = instance;
  window.addUnloadListener?.(destroy);
  window.addEventListener("unload", destroy, { once: true });

  if (gBrowserInit.delayedStartupFinished) {
    init();
  } else {
    startupObserver = subject => {
      if (subject !== window) return;
      Services.obs.removeObserver(startupObserver, "browser-delayed-startup-finished");
      startupObserver = null;
      init();
    };
    Services.obs.addObserver(startupObserver, "browser-delayed-startup-finished");
  }
})();

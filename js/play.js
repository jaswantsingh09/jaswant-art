/* ═══════════════════════════════════════════════════════════
   JASWANT — play layer
   preloader · magnetic letters · word rotator · scramble text
   section HUD · velocity marquee · cursor trail · terminal
   accent themes · matrix / confetti · konami · paint studio
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ΣΔλ";

  /* ────────────────────────────────────────────────
     toast
  ──────────────────────────────────────────────── */
  const toastEl = $("#toast");
  let toastT;
  function toast(msg, ms = 2600) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), ms);
  }

  /* ────────────────────────────────────────────────
     scramble — decodes text through random glyphs.
     Works on the text nodes only, so <em>/<br> survive.
  ──────────────────────────────────────────────── */
  function scramble(el, { duration = 900, finalText } = {}) {
    if (reduceMotion) { if (finalText != null) el.textContent = finalText; return Promise.resolve(); }
    if (finalText != null) el.textContent = finalText;
    if (!el._scrOrig) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
      el._scrOrig = nodes.map((n) => ({ n, text: n.nodeValue }));
    }
    const parts = el._scrOrig;
    cancelAnimationFrame(el._scrRaf);
    return new Promise((resolve) => {
      const t0 = performance.now();
      const total = parts.reduce((a, p) => a + p.text.length, 0) || 1;
      const tick = (now) => {
        const k = clamp((now - t0) / duration, 0, 1);
        let idx = 0;
        parts.forEach((p) => {
          let out = "";
          for (let i = 0; i < p.text.length; i++, idx++) {
            const c = p.text[i];
            const settleAt = (idx / total) * 0.7 + 0.3; // left → right
            out += c === " " || k >= settleAt ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          p.n.nodeValue = out;
        });
        if (k < 1) el._scrRaf = requestAnimationFrame(tick);
        else { parts.forEach((p) => (p.n.nodeValue = p.text)); resolve(); }
      };
      el._scrRaf = requestAnimationFrame(tick);
    });
  }

  /* ════════════════════════════════════════════════
     PRELOADER
  ════════════════════════════════════════════════ */
  const loader = $("#loader");
  function finishLoading() {
    document.body.classList.remove("is-loading");
    loader.classList.add("is-done");
    setTimeout(() => loader.classList.add("is-gone"), 1100);
    window.dispatchEvent(new Event("siteready"));
  }
  if (reduceMotion || !loader) {
    finishLoading();
  } else {
    const bar = $("#loaderBar"), count = $("#loaderCount"), log = $("#loaderLog"), name = $("#loaderName");
    const logs = ["allocating imagination…", "loading weights…", "mixing ochre…", "warming the gpu…", "stretching canvas…", "ready."];
    scramble(name, { duration: 1100 });
    const DUR = 1500, t0 = performance.now();
    let ready = document.readyState === "complete";
    window.addEventListener("load", () => (ready = true));
    (function step(now) {
      let k = clamp((now - t0) / DUR, 0, 1);
      if (!ready) k = Math.min(k, 0.9); // hold at 90% until assets land
      const e = 1 - Math.pow(1 - k, 3);
      bar.style.width = e * 100 + "%";
      count.textContent = String(Math.round(e * 100)).padStart(3, "0");
      log.textContent = logs[Math.min(logs.length - 1, Math.floor(e * logs.length))];
      if (k < 1 || (!ready && now - t0 < 4000)) requestAnimationFrame(step);
      else setTimeout(finishLoading, 180);
    })(t0);
  }

  /* ════════════════════════════════════════════════
     HERO — split letters that react to the cursor
  ════════════════════════════════════════════════ */
  const heroTitle = $(".hero__title");
  let heroChars = [];
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.textContent = c;
      el.appendChild(s);
    });
  }
  function collectChars() {
    heroChars = $$(".hero__title .ch").map((el) => ({ el, x: 0, y: 0, cx: 0, cy: 0 }));
    measureChars();
  }
  function measureChars() {
    heroChars.forEach((c) => {
      const prev = c.el.style.transform;
      c.el.style.transform = "";
      const r = c.el.getBoundingClientRect();
      c.cx = r.left + r.width / 2 + window.scrollX;
      c.cy = r.top + r.height / 2 + window.scrollY;
      c.el.style.transform = prev;
    });
  }

  const rotator = $("#heroRotate");
  $$(".hero__word").forEach((w) => { if (w !== rotator) splitChars(w); });
  collectChars();

  const ptr = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, active: false };
  window.addEventListener("pointermove", (e) => {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.active = true;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { ptr.active = false; });

  let heroInView = true;
  new IntersectionObserver((es) => es.forEach((e) => (heroInView = e.isIntersecting))).observe($("#hero"));

  function tickHeroChars() {
    if (!heroInView || reduceMotion || !finePointer) return;
    const R = 150;
    const mx = ptr.x + window.scrollX, my = ptr.y + window.scrollY;
    heroChars.forEach((c) => {
      const dx = c.cx - mx, dy = c.cy - my;
      const d = Math.hypot(dx, dy);
      let tx = 0, ty = 0, rot = 0;
      if (ptr.active && d < R) {
        const f = Math.pow(1 - d / R, 2);
        tx = (dx / (d || 1)) * f * 22;
        ty = (dy / (d || 1)) * f * 22 - f * 10;
        rot = (dx / R) * f * -14;
      }
      c.x = lerp(c.x, tx, 0.18);
      c.y = lerp(c.y, ty, 0.18);
      c.r = lerp(c.r || 0, rot, 0.18);
      const near = Math.abs(c.x) + Math.abs(c.y) > 3;
      if (near !== c.near) { c.near = near; c.el.classList.toggle("is-near", near); }
      c.el.style.transform = Math.abs(c.x) + Math.abs(c.y) < 0.05 ? "" : `translate(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px) rotate(${c.r.toFixed(2)}deg)`;
    });
  }

  // the last word of the headline keeps changing its mind
  const ROTATE_WORDS = ["machines", "systems", "interfaces", "pipelines", "poems", "paintings", "stories"];
  let rotIdx = 0;
  if (rotator && !reduceMotion) {
    window.addEventListener("siteready", () => {
      setInterval(() => {
        if (!heroInView || document.hidden) return;
        rotIdx = (rotIdx + 1) % ROTATE_WORDS.length;
        rotator._scrOrig = null;
        scramble(rotator, { finalText: ROTATE_WORDS[rotIdx], duration: 700 });
      }, 2800);
    }, { once: true });
  }

  /* ════════════════════════════════════════════════
     SCRAMBLE section titles as they enter
  ════════════════════════════════════════════════ */
  const scrIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    scrIO.unobserve(e.target);
    scramble(e.target, { duration: 1100 });
  }), { threshold: 0.6 });
  $$(".section-head__title, .contact__title, .studio__label").forEach((el) => scrIO.observe(el));

  // nav links decode on hover
  $$(".nav__links a, .contact__links a").forEach((a) => {
    a.addEventListener("pointerenter", () => scramble(a, { duration: 420 }));
  });

  /* ════════════════════════════════════════════════
     MAGNETIC buttons
  ════════════════════════════════════════════════ */
  if (finePointer && !reduceMotion) {
    $$(".nav__cta, .contact__links a, .term-fab, .paint__btn").forEach((el) => {
      el.setAttribute("data-magnetic", "");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ════════════════════════════════════════════════
     PAINTING frames — 3d tilt + glare
  ════════════════════════════════════════════════ */
  if (finePointer && !reduceMotion) {
    $$(".frame").forEach((f) => {
      f.addEventListener("pointermove", (e) => {
        const r = f.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        f.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 12}deg) scale(1.02)`;
        f.style.setProperty("--gx", px * 100 + "%");
        f.style.setProperty("--gy", py * 100 + "%");
      });
      f.addEventListener("pointerleave", () => { f.style.transform = ""; });
    });
  }

  /* ════════════════════════════════════════════════
     POEMS — each line bleeds in on its own beat
  ════════════════════════════════════════════════ */
  $$(".poem p").forEach((p) => {
    const lines = p.innerHTML.split(/<br\s*\/?>/i);
    p.innerHTML = lines.map((l, i) =>
      `<span class="ln" style="transition-delay:${0.25 + i * 0.32}s">${l.trim()}</span>`).join("<br/>");
  });

  /* ════════════════════════════════════════════════
     SECTION HUD + studio detection
  ════════════════════════════════════════════════ */
  const SECTIONS = [
    ["hero", "intro"], ["pipeline", "inference"], ["stack", "stack"], ["blueprint", "systems"],
    ["work", "work"], ["research", "research"], ["writing", "blog"], ["studio", "studio"],
    ["paint", "canvas"], ["contact", "contact"],
  ].filter(([id]) => document.getElementById(id));
  const hud = $("#hud");
  SECTIONS.forEach(([id, label]) => {
    const a = document.createElement("a");
    a.href = "#" + id;
    a.setAttribute("aria-label", label);
    a.setAttribute("data-hover", "");
    a.innerHTML = `<span>${label}</span>`;
    hud.appendChild(a);
  });
  const hudLinks = $$("a", hud);
  const studioEl = $("#studio");
  let lastActive = -1;
  function updateHud() {
    const mid = window.innerHeight * 0.45;
    let active = 0;
    SECTIONS.forEach(([id], i) => {
      const r = document.getElementById(id).getBoundingClientRect();
      if (r.top <= mid) active = i;
    });
    if (active !== lastActive) {
      hudLinks.forEach((a, i) => a.classList.toggle("is-active", i === active));
      lastActive = active;
    }
    hud.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.6);
    const sr = studioEl.getBoundingClientRect();
    document.body.classList.toggle("in-studio", sr.top < mid && sr.bottom > mid);
  }

  /* ════════════════════════════════════════════════
     MARQUEE — speed + direction follow your scroll
  ════════════════════════════════════════════════ */
  const mTrack = $(".marquee__track");
  let mX = 0, lastScrollY = window.scrollY, scrollVel = 0;
  if (mTrack && !reduceMotion) mTrack.classList.add("is-js");
  function tickMarquee(dt) {
    if (!mTrack || reduceMotion) return;
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollVel = lerp(scrollVel, dy, 0.12);
    const half = mTrack.scrollWidth / 2 || 1;
    mX -= (0.045 * dt) * (1 + Math.abs(scrollVel) * 0.35) * (scrollVel < -0.5 ? -1 : 1);
    if (mX <= -half) mX += half;
    if (mX > 0) mX -= half;
    const skew = clamp(scrollVel * -0.25, -8, 8);
    mTrack.style.transform = `translate3d(${mX}px,0,0) skewX(${skew.toFixed(2)}deg)`;
  }

  /* ════════════════════════════════════════════════
     CURSOR TRAIL — phosphor sparks / ink in the studio
  ════════════════════════════════════════════════ */
  const trail = $("#trailCanvas");
  const tctx = trail.getContext("2d");
  let tW = 0, tH = 0;
  const sparks = [];
  function fitTrail() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    tW = window.innerWidth; tH = window.innerHeight;
    trail.width = tW * dpr; trail.height = tH * dpr;
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fitTrail();
  let accent = { phosphor: "#a3ff6b", signal: "#5bd7ff" };
  function tickTrail() {
    if (!finePointer || reduceMotion) return;
    const inStudio = document.body.classList.contains("in-studio");
    if (ptr.active && ptr.px > -9000) {
      const d = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py);
      const n = Math.min(4, Math.floor(d / 6));
      for (let i = 0; i < n; i++) {
        const t = i / n;
        sparks.push({
          x: lerp(ptr.px, ptr.x, t), y: lerp(ptr.py, ptr.y, t),
          vx: (Math.random() - 0.5) * 0.6, vy: inStudio ? Math.random() * 0.5 : (Math.random() - 0.5) * 0.6,
          life: 1, r: inStudio ? 1.5 + Math.random() * 3 : 1 + Math.random() * 1.6,
          c: inStudio ? (Math.random() < 0.7 ? "191,79,44" : "109,122,92") : (Math.random() < 0.75 ? accent.phosphor : accent.signal),
          ink: inStudio,
        });
      }
    }
    ptr.px = ptr.x; ptr.py = ptr.y;
    if (sparks.length > 260) sparks.splice(0, sparks.length - 260);
    tctx.clearRect(0, 0, tW, tH);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.life -= s.ink ? 0.018 : 0.03;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      if (s.ink) {
        tctx.fillStyle = `rgba(${s.c},${s.life * 0.55})`;
        tctx.beginPath(); tctx.arc(s.x, s.y, s.r * (1.4 - s.life * 0.4), 0, Math.PI * 2); tctx.fill();
      } else {
        tctx.fillStyle = s.c;
        tctx.globalAlpha = s.life * 0.8;
        tctx.shadowColor = s.c; tctx.shadowBlur = 8;
        tctx.fillRect(s.x - s.r / 2, s.y - s.r / 2, s.r, s.r);
        tctx.globalAlpha = 1; tctx.shadowBlur = 0;
      }
    }
  }

  /* ════════════════════════════════════════════════
     ACCENT THEMES
  ════════════════════════════════════════════════ */
  const THEMES = {
    phosphor: { phosphor: "#a3ff6b", signal: "#5bd7ff" },
    cyber:    { phosphor: "#ff4fd8", signal: "#5bd7ff" },
    ember:    { phosphor: "#ffb347", signal: "#ff6b4a" },
    ice:      { phosphor: "#7df9ff", signal: "#a78bfa" },
    mono:     { phosphor: "#f2f2f2", signal: "#9aa4a8" },
  };
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  function setTheme(name, quiet) {
    const t = THEMES[name];
    if (!t) return false;
    const root = document.documentElement.style;
    root.setProperty("--phosphor", t.phosphor);
    root.setProperty("--phosphor-dim", hexA(t.phosphor, 0.35));
    root.setProperty("--signal", t.signal);
    accent = t;
    window.dispatchEvent(new CustomEvent("accentchange", { detail: t }));
    try { localStorage.setItem("jw-theme", name); } catch (_) { /* storage unavailable */ }
    if (!quiet) toast(`theme → ${name}`);
    return true;
  }
  try {
    const saved = localStorage.getItem("jw-theme");
    if (saved && saved !== "phosphor") setTheme(saved, true);
  } catch (_) { /* storage unavailable */ }

  /* ════════════════════════════════════════════════
     FX — matrix rain & confetti
  ════════════════════════════════════════════════ */
  function fxCanvas() {
    const c = document.createElement("canvas");
    c.className = "fx";
    document.body.appendChild(c);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, ctx, w: innerWidth, h: innerHeight };
  }
  function fadeOut(c) { c.style.opacity = 0; setTimeout(() => c.remove(), 900); }

  function matrix(ms = 6000) {
    if (reduceMotion) return toast("matrix skipped — reduced motion is on");
    const { c, ctx, w, h } = fxCanvas();
    const fs = 16, cols = Math.ceil(w / fs);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01ΣλΔ∑∂JASWANT";
    const t0 = performance.now();
    (function frame(now) {
      ctx.fillStyle = "rgba(6, 8, 11, 0.12)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fs}px "JetBrains Mono", monospace`;
      drops.forEach((y, i) => {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillStyle = Math.random() < 0.05 ? "#fff" : accent.phosphor;
        ctx.fillText(ch, i * fs, y * fs);
        drops[i] = y * fs > h && Math.random() > 0.975 ? 0 : y + 1;
      });
      if (now - t0 < ms) requestAnimationFrame(frame); else fadeOut(c);
    })(t0);
  }

  function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 160) {
    if (reduceMotion) return;
    const { c, ctx, w, h } = fxCanvas();
    const cols = [accent.phosphor, accent.signal, "#ffc857", "#bf4f2c", "#f3ecdf"];
    const bits = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 10;
      return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        w: 5 + Math.random() * 7, h: 3 + Math.random() * 5, c: cols[(Math.random() * cols.length) | 0] };
    });
    const t0 = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, w, h);
      bits.forEach((b) => {
        b.vy += 0.25; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.fillStyle = b.c; ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r * 2)));
        ctx.restore();
      });
      if (now - t0 < 3200) requestAnimationFrame(frame); else fadeOut(c);
    })(t0);
  }

  function glitch() {
    document.body.classList.remove("is-glitch");
    void document.body.offsetWidth;
    document.body.classList.add("is-glitch");
    setTimeout(() => document.body.classList.remove("is-glitch"), 2000);
  }

  // konami code → achievement
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kPos = 0;
  window.addEventListener("keydown", (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kPos = k === KONAMI[kPos] ? kPos + 1 : k === KONAMI[0] ? 1 : 0;
    if (kPos === KONAMI.length) {
      kPos = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
      glitch(); confetti(); toast("🏆 achievement unlocked — you know the old ways", 3600);
    }
  });

  /* ════════════════════════════════════════════════
     TERMINAL
  ════════════════════════════════════════════════ */
  const term = $("#term"), termOut = $("#termOut"), termIn = $("#termIn"), termForm = $("#termForm");
  const termFab = $("#termFab");
  const history = [];
  let hIdx = 0, termBooted = false;
  const C = window.SITE_CONTENT || { research: [], blog: [], journal: [] };

  function print(html, cls = "") {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = html;
    termOut.appendChild(p);
    termOut.scrollTop = termOut.scrollHeight;
    return p;
  }
  function typeOut(text, cls = "", speed = 8) {
    if (reduceMotion) return Promise.resolve(print(esc(text), cls));
    const p = print("", cls);
    return new Promise((res) => {
      let i = 0;
      (function t() {
        i += 2;
        p.textContent = text.slice(0, i);
        termOut.scrollTop = termOut.scrollHeight;
        if (i < text.length) setTimeout(t, speed); else res(p);
      })();
    });
  }
  function link(label, cmd) { return `<button class="t-link" data-cmd="${esc(cmd)}">${esc(label)}</button>`; }

  function openTerm() {
    term.classList.add("is-open");
    term.setAttribute("aria-hidden", "false");
    if (!termBooted) {
      termBooted = true;
      print(`<span class="t-art">     ╦╔═╗╔═╗╦ ╦╔═╗╔╗╔╔╦╗
     ║╠═╣╚═╗║║║╠═╣║║║ ║
    ╚╝╩ ╩╚═╝╚╩╝╩ ╩╝╚╝ ╩ </span>`);
      print(`welcome to jaswant.art — v2.0 · type ${link("help", "help")} or try ${link("neofetch", "neofetch")}`, "t-dim");
    }
    setTimeout(() => termIn.focus({ preventScroll: true }), 60);
  }
  function closeTerm() {
    term.classList.remove("is-open");
    term.setAttribute("aria-hidden", "true");
    termIn.blur();
  }
  termFab.addEventListener("click", () => (term.classList.contains("is-open") ? closeTerm() : openTerm()));
  $("#termClose").addEventListener("click", closeTerm);
  termOut.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cmd]");
    if (b) run(b.dataset.cmd);
    else termIn.focus({ preventScroll: true });
  });
  window.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === "`" || e.key === "~") && (!typing || document.activeElement === termIn)) {
      e.preventDefault();
      term.classList.contains("is-open") ? closeTerm() : openTerm();
    } else if (e.key === "Escape" && term.classList.contains("is-open")) {
      closeTerm();
    }
  });

  // drag the window by its title bar
  (() => {
    const bar = $("#termBar");
    let sx, sy, ox = 0, oy = 0, dragging = false;
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button") || window.innerWidth < 600) return;
      dragging = true; sx = e.clientX - ox; sy = e.clientY - oy;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      ox = e.clientX - sx; oy = e.clientY - sy;
      term.style.translate = `${ox}px ${oy}px`;
    });
    bar.addEventListener("pointerup", () => (dragging = false));
  })();

  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: id === "paint" ? "center" : "start" });
  const SECTION_ALIASES = {
    home: "hero", intro: "hero", top: "hero", llm: "pipeline", inference: "pipeline", pipeline: "pipeline",
    stack: "stack", mern: "stack", systems: "blueprint", blueprint: "blueprint", work: "work", projects: "work",
    research: "research", blog: "writing", writing: "writing", studio: "studio", art: "studio", poems: "studio",
    paint: "paint", canvas: "paint", contact: "contact",
  };

  const COMMANDS = {
    help: {
      d: "list every command",
      fn: () => {
        const rows = Object.entries(COMMANDS).filter(([, v]) => !v.hidden)
          .map(([k, v]) => `  ${link(k.padEnd(12), k)}<span class="t-dim">${esc(v.d)}</span>`).join("\n");
        print(rows);
        print("tip: ↑/↓ for history · tab to autocomplete · ~ toggles this window", "t-dim");
      },
    },
    whoami: {
      d: "who is this?",
      fn: () => typeOut("jaswant — senior software engineer. builds llm systems, mern products and architectures that survive traffic. paints, writes poems, and notices things. runs at temperature 0.7: creative but grounded.", "t-info"),
    },
    neofetch: {
      d: "system info, artist edition",
      fn: () => {
        const up = Math.floor(performance.now() / 1000);
        print(`<span class="t-art">   ▄▄▄▄▄▄▄   </span><b class="t-ok">jaswant</b>@<b class="t-ok">jaswant.art</b>
<span class="t-art">  █ ▄▄▄▄▄ █  </span>-------------------
<span class="t-art">  █ █   █ █  </span><span class="t-info">os</span>       brain/linux · human-in-the-loop
<span class="t-art">  █ █▄▄▄█ █  </span><span class="t-info">role</span>     senior software engineer
<span class="t-art">  █▄▄▄▄▄▄▄█  </span><span class="t-info">stack</span>    mongo · express · react · node · ts
<span class="t-art">    ▀▀ ▀▀    </span><span class="t-info">ai</span>       rag · agents · evals · inference
<span class="t-art">             </span><span class="t-info">side</span>     poems · paintings · observations
<span class="t-art">             </span><span class="t-info">fuel</span>     chai, mostly
<span class="t-art">             </span><span class="t-info">uptime</span>   ${up}s on this page
<span class="t-art">             </span>${Object.values(THEMES).map((t) => `<span style="color:${t.phosphor}">███</span>`).join("")}`);
      },
    },
    ls: {
      d: "list sections",
      fn: () => print(Object.keys(SECTION_ALIASES).filter((k, i, a) => a.findIndex((x) => SECTION_ALIASES[x] === SECTION_ALIASES[k]) === i)
        .map((k) => link(k + "/", "cd " + k)).join("  ")),
    },
    cd: {
      d: "jump to a section — cd studio",
      fn: (args) => {
        const id = SECTION_ALIASES[(args[0] || "home").replace(/\/$/, "").toLowerCase()];
        if (!id) return print(`cd: no such section: ${esc(args[0])} — try ${link("ls", "ls")}`, "t-err");
        print(`→ /${esc(args[0] || "home")}`, "t-ok");
        goTo(id);
      },
    },
    blog: {
      d: "list blog posts",
      fn: () => C.blog.forEach((b, i) => print(`  ${link(`[${i + 1}]`, "read " + (i + 1))} ${esc(b.title)} <span class="t-dim">· ${esc(b.date)}</span>`)),
    },
    research: {
      d: "list research notes",
      fn: () => C.research.forEach((r, i) => print(`  ${link(`[r${i + 1}]`, "read r" + (i + 1))} ${esc(r.title)} <span class="t-dim">· ${esc(r.status)}</span>`)),
    },
    read: {
      d: "open a post — read 1 · read r1",
      fn: (args) => {
        const a = (args[0] || "").toLowerCase();
        const isR = a.startsWith("r");
        const n = parseInt(isR ? a.slice(1) : a, 10) - 1;
        const btn = $$(isR ? ".paper" : ".post")[n];
        if (!btn) return print(`read: nothing at '${esc(a)}' — try ${link("blog", "blog")} or ${link("research", "research")}`, "t-err");
        closeTerm(); btn.click();
      },
    },
    theme: {
      d: "recolour the site — theme cyber",
      fn: (args) => {
        if (!args[0]) return print("themes: " + Object.keys(THEMES).map((t) => link(t, "theme " + t)).join("  "));
        if (!setTheme(args[0].toLowerCase())) print(`theme: unknown '${esc(args[0])}'`, "t-err");
        else print(`accent → ${esc(args[0])}`, "t-ok");
      },
    },
    paint: { d: "go to the canvas and let it paint", fn: () => { closeTerm(); goTo("paint"); setTimeout(() => window.__autoPaint && window.__autoPaint(), 900); } },
    matrix: { d: "follow the white rabbit", fn: () => { closeTerm(); matrix(); } },
    party: { d: "🎉", fn: () => { confetti(); print("🎉 party mode (3.2s of it)", "t-ok"); } },
    glitch: { d: "break the headline (temporarily)", fn: () => { goTo("hero"); setTimeout(glitch, 500); print("rendering… badly. on purpose.", "t-warn"); } },
    contact: { d: "open a channel", fn: () => { const m = $(".contact__links a[href^='mailto']"); print(`email → ${m ? esc(m.href.replace("mailto:", "")) : "see footer"}`, "t-info"); goTo("contact"); } },
    date: { d: "current date & time", fn: () => print(new Date().toString(), "t-info") },
    echo: { d: "echo text", fn: (args) => print(esc(args.join(" "))) },
    history: { d: "command history", fn: () => print(history.map((h, i) => `  ${i + 1}  ${esc(h)}`).join("\n") || "(empty)", "t-dim") },
    clear: { d: "clear the screen", fn: () => (termOut.innerHTML = "") },
    exit: { d: "close the terminal", fn: closeTerm },
    sudo: {
      d: "try: sudo hire jaswant",
      fn: async (args) => {
        const a = args.join(" ").toLowerCase();
        if (/hire/.test(a)) {
          await typeOut("[sudo] password for guest: ********", "t-dim", 18);
          await typeOut("verifying vision…  ok\nverifying budget…  ok\nverifying chai supply…  ok", "t-info", 14);
          print("ACCESS GRANTED ✓ — opening a channel.", "t-ok");
          confetti();
          setTimeout(() => { closeTerm(); goTo("contact"); }, 1200);
        } else if (/rm\s+-rf/.test(a)) {
          print("nice try. the backups have backups.", "t-warn");
        } else {
          print("guest is not in the sudoers file. this incident will be reported (to nobody).", "t-err");
        }
      },
    },
    rm: { d: "", hidden: true, fn: () => print("permission denied — this portfolio is immutable infrastructure.", "t-warn") },
    chai: { d: "", hidden: true, fn: () => typeOut("☕ brewing… adding ginger… adding cardamom… done. productivity +40%.", "t-warn", 20) },
    coffee: { d: "", hidden: true, fn: () => print("418 — i'm a teapot. try 'chai'.", "t-warn") },
    vim: { d: "", hidden: true, fn: () => print("you are now trapped forever. (just kidding — type exit)", "t-warn") },
    hello: { d: "", hidden: true, fn: () => print("hello, human. 👋", "t-ok") },
    konami: { d: "", hidden: true, fn: () => print("↑ ↑ ↓ ↓ ← → ← → b a — outside the terminal.", "t-dim") },
  };

  async function run(raw) {
    const line = raw.trim();
    print(`<b>$</b> ${esc(line)}`, "t-cmd");
    if (!line) return;
    history.push(line); hIdx = history.length;
    const [cmd, ...args] = line.split(/\s+/);
    const c = COMMANDS[cmd.toLowerCase()];
    if (!c) {
      const guess = Object.keys(COMMANDS).find((k) => k.startsWith(cmd.toLowerCase().slice(0, 2)));
      print(`command not found: ${esc(cmd)}${guess ? ` — did you mean ${link(guess, guess)}?` : ""}`, "t-err");
      return;
    }
    await c.fn(args);
  }

  termForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = termIn.value;
    termIn.value = "";
    run(v);
  });
  termIn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); termIn.value = history[hIdx] || ""; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); termIn.value = history[hIdx] || ""; }
    else if (e.key === "Tab") {
      e.preventDefault();
      const v = termIn.value.trim().toLowerCase();
      const hits = Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hidden && k.startsWith(v));
      if (hits.length === 1) termIn.value = hits[0] + " ";
      else if (hits.length > 1) print(hits.join("  "), "t-dim");
    }
  });

  /* ════════════════════════════════════════════════
     PAINT STUDIO
  ════════════════════════════════════════════════ */
  (() => {
    const canvas = $("#paintCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const emptyHint = $("#paintEmpty");
    const PALETTE = [
      ["terracotta", "#bf4f2c"], ["ochre", "#d9a441"], ["sage", "#6d7a5c"],
      ["indigo", "#2f3e6b"], ["ink", "#221c15"], ["rose", "#d98c8c"],
    ];
    let color = PALETTE[0][1], brush = "bristle", W = 0, H = 0, dpr = 1, painted = false;

    const swWrap = $("#paintSwatches");
    PALETTE.forEach(([name, hex], i) => {
      const b = document.createElement("button");
      b.className = "paint__swatch" + (i === 0 ? " is-on" : "");
      b.style.background = hex;
      b.setAttribute("aria-label", name);
      b.setAttribute("role", "radio");
      b.setAttribute("data-hover", "");
      b.addEventListener("click", () => {
        color = hex;
        $$(".paint__swatch", swWrap).forEach((s) => s.classList.toggle("is-on", s === b));
      });
      swWrap.appendChild(b);
    });
    $$(".paint__brush").forEach((b) => b.addEventListener("click", () => {
      brush = b.dataset.brush;
      $$(".paint__brush").forEach((x) => x.classList.toggle("is-on", x === b));
    }));

    function paper() {
      ctx.fillStyle = "#fbf6ec";
      ctx.fillRect(0, 0, W, H);
      // subtle tooth
      for (let i = 0; i < (W * H) / 90; i++) {
        ctx.fillStyle = `rgba(34,28,21,${Math.random() * 0.035})`;
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
    }
    function fit() {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      // keep existing paint across resizes
      const snap = W ? (() => { const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height; c.getContext("2d").drawImage(canvas, 0, 0); return c; })() : null;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paper();
      if (snap) ctx.drawImage(snap, 0, 0, W, H);
    }
    fit();
    let rT;
    window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(fit, 200); });

    function markPainted() {
      if (!painted) { painted = true; emptyHint.classList.add("is-hidden"); }
    }

    // one segment of a stroke, from (x0,y0) to (x1,y1)
    function stroke(x0, y0, x1, y1, col, kind, pressure = 1) {
      const dx = x1 - x0, dy = y1 - y0;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = clamp(dist / 30, 0, 1);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (kind === "ink") {
        ctx.strokeStyle = col; ctx.globalAlpha = 0.9;
        ctx.lineWidth = lerp(7, 1.6, speed) * pressure;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      } else if (kind === "spray") {
        ctx.fillStyle = col;
        const R = 22 * pressure;
        for (let i = 0; i < 26; i++) {
          const a = Math.random() * Math.PI * 2, r = Math.random() * R * Math.random();
          ctx.globalAlpha = 0.08 + Math.random() * 0.12;
          ctx.fillRect(x1 + Math.cos(a) * r, y1 + Math.sin(a) * r, 1.6, 1.6);
        }
      } else {
        // bristle: parallel hairs along the stroke normal, each a little different
        const nx = -dy / dist, ny = dx / dist;
        const width = lerp(18, 7, speed) * pressure;
        ctx.strokeStyle = col;
        for (let i = 0; i < 14; i++) {
          const o = (i / 13 - 0.5) * width;
          const j = (Math.random() - 0.5) * 1.4;
          ctx.globalAlpha = 0.14 + Math.random() * 0.22;
          ctx.lineWidth = 0.8 + Math.random() * 1.6;
          ctx.beginPath();
          ctx.moveTo(x0 + nx * (o + j), y0 + ny * (o + j));
          ctx.lineTo(x1 + nx * (o + j), y1 + ny * (o + j));
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    let down = false, lx = 0, ly = 0;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener("pointerdown", (e) => {
      stopAuto();
      down = true; [lx, ly] = pos(e);
      canvas.setPointerCapture(e.pointerId);
      stroke(lx, ly, lx + 0.1, ly + 0.1, color, brush, e.pressure || 1);
      markPainted();
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!down) return;
      const [x, y] = pos(e);
      const p = e.pointerType === "pen" ? 0.4 + e.pressure : 1;
      stroke(lx, ly, x, y, color, brush, p);
      lx = x; ly = y;
    });
    const end = () => (down = false);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    // ── let it paint: a flow field drags pigment across the paper
    let autoRaf = 0;
    const autoBtn = $("#paintAuto");
    function stopAuto() {
      if (!autoRaf) return;
      cancelAnimationFrame(autoRaf); autoRaf = 0;
      autoBtn.classList.remove("is-on"); autoBtn.textContent = "✦ let it paint";
    }
    function autoPaint() {
      if (autoRaf) return stopAuto();
      markPainted();
      autoBtn.classList.add("is-on"); autoBtn.textContent = "■ stop";
      const seed = Math.random() * 1000;
      const scale = 0.0022 + Math.random() * 0.002;
      const field = (x, y) =>
        (Math.sin(x * scale + seed) + Math.cos(y * scale * 1.3 - seed * 0.7) + Math.sin((x + y) * scale * 0.6 + seed * 1.9)) * Math.PI * 0.8;
      // a composition picks 3 colours from the palette
      const picks = [...PALETTE].sort(() => Math.random() - 0.5).slice(0, 3).map((p) => p[1]);
      const walkers = Array.from({ length: 70 }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H,
        c: picks[i % 3], life: 60 + Math.random() * 160,
        kind: Math.random() < 0.75 ? "bristle" : "ink",
        p: 0.35 + Math.random() * 0.5,
      }));
      const t0 = performance.now();
      (function frame(now) {
        for (let s = 0; s < 3; s++) {
          walkers.forEach((w) => {
            if (w.life-- <= 0 || w.x < -20 || w.x > W + 20 || w.y < -20 || w.y > H + 20) {
              w.x = Math.random() * W; w.y = Math.random() * H; w.life = 60 + Math.random() * 160;
            }
            const a = field(w.x, w.y);
            const nx = w.x + Math.cos(a) * 3.2, ny = w.y + Math.sin(a) * 3.2;
            stroke(w.x, w.y, nx, ny, w.c, w.kind, w.p);
            w.x = nx; w.y = ny;
          });
        }
        if (now - t0 < 7000) autoRaf = requestAnimationFrame(frame); else stopAuto();
      })(t0);
    }
    window.__autoPaint = () => { if (!autoRaf) autoPaint(); };
    autoBtn.addEventListener("click", autoPaint);

    $("#paintClear").addEventListener("click", () => {
      stopAuto();
      // wash: fade the paper back over a few frames
      let k = 0;
      (function wash() {
        ctx.fillStyle = "rgba(251,246,236,0.18)";
        ctx.fillRect(0, 0, W, H);
        if (++k < 22) requestAnimationFrame(wash);
        else { paper(); painted = false; emptyHint.classList.remove("is-hidden"); }
      })();
    });
    $("#paintSave").addEventListener("click", () => {
      const a = document.createElement("a");
      a.download = `jaswant-art-canvas-${Date.now()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast("saved — sign it, it's yours ✎");
    });
  })();

  /* ════════════════════════════════════════════════
     CLOCK — what is Jaswant probably doing right now?
  ════════════════════════════════════════════════ */
  const clock = $("#clock");
  const TZ = "Asia/Kolkata";
  function status(h) {
    if (h < 6) return "asleep (or debugging)";
    if (h < 9) return "out on a ride";
    if (h < 13) return "shipping code";
    if (h < 14) return "lunch + chai";
    if (h < 19) return "in deep work";
    if (h < 22) return "painting";
    return "writing a poem";
  }
  function tickClock() {
    if (!clock) return;
    const now = new Date();
    let time, hour;
    try {
      time = now.toLocaleTimeString("en-GB", { timeZone: TZ, hour12: false });
      hour = +now.toLocaleString("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false });
    } catch (_) {
      time = now.toLocaleTimeString(); hour = now.getHours();
    }
    clock.innerHTML = `<span class="dot"></span>local time for jaswant <b>${time} IST</b> · probably ${status(hour)}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ════════════════════════════════════════════════
     loop + resize
  ════════════════════════════════════════════════ */
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { fitTrail(); measureChars(); }, 150);
  });
  window.addEventListener("load", measureChars);
  // hero words rise in after the curtain; measure once they've landed
  window.addEventListener("siteready", () => setTimeout(measureChars, 1500), { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureChars);

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(64, now - last);
    last = now;
    tickHeroChars();
    tickMarquee(dt);
    tickTrail();
    updateHud();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // a little something for the curious
  console.log("%c jaswant.art %c press ~ for a terminal · ↑↑↓↓←→←→ba for a surprise ",
    "background:#a3ff6b;color:#06080b;font-weight:bold;padding:4px 6px;border-radius:4px 0 0 4px",
    "background:#121821;color:#a3ff6b;padding:4px 6px;border-radius:0 4px 4px 0");
})();

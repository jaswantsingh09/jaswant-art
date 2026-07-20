/* ═══════════════════════════════════════════════════════════
   JASWANT — site engine
   hero neural field · scroll-driven LLM pipeline · MERN packets
   self-drawing blueprint · cursor · reveals
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // progress of p within [a,b] clamped 0..1
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  const PHOSPHOR = "#a3ff6b";
  const SIGNAL = "#5bd7ff";
  const AMBER = "#ffc857";
  const DIM = "#8fa3a0";

  function fitCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  /* ────────────────────────────────────────────────
     year + nav + scroll progress
  ──────────────────────────────────────────────── */
  document.getElementById("year").textContent = new Date().getFullYear();

  const nav = document.getElementById("nav");
  const scrollBar = document.getElementById("scrollBar");
  function onScrollChrome() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScrollChrome, { passive: true });
  onScrollChrome();

  /* ────────────────────────────────────────────────
     custom cursor
  ──────────────────────────────────────────────── */
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let cx = -100, cy = -100, rx = -100, ry = -100;
  window.addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
  document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
    el.addEventListener("pointerenter", () => ring.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => ring.classList.remove("is-hover"));
  });
  (function cursorLoop() {
    rx = lerp(rx, cx, 0.16);
    ry = lerp(ry, cy, 0.16);
    cursor.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
    ring.style.transform = `translate(${rx - ring.offsetWidth / 2}px, ${ry - ring.offsetHeight / 2}px)`;
    requestAnimationFrame(cursorLoop);
  })();

  /* ────────────────────────────────────────────────
     boot line typewriter
  ──────────────────────────────────────────────── */
  const bootEl = document.getElementById("bootline");
  const bootLines = [
    "$ whoami — senior software engineer · llm systems",
    "$ loading weights…  ▓▓▓▓▓▓▓▓▓▓ 100%",
    "$ side process detected: art_enthusiast.service — keeping alive",
    "$ ready. temperature 0.7 — creative but grounded",
  ];
  if (!reduceMotion) {
    let li = 0, ch = 0;
    (function typeBoot() {
      if (li >= bootLines.length) { li = 0; }
      const line = bootLines[li];
      ch++;
      bootEl.innerHTML = line.slice(0, ch).replace(/</g, "&lt;") + '<span class="blink">▮</span>';
      if (ch < line.length) {
        setTimeout(typeBoot, 26 + Math.random() * 40);
      } else {
        li++; ch = 0;
        setTimeout(typeBoot, 2100);
      }
    })();
  } else {
    bootEl.textContent = bootLines[0];
  }

  /* ────────────────────────────────────────────────
     reveal on scroll
  ──────────────────────────────────────────────── */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll("[data-reveal]").forEach((el) => revealIO.observe(el));

  /* ────────────────────────────────────────────────
     card mouse glow
  ──────────────────────────────────────────────── */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
      if (!reduceMotion) {
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`;
      }
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  /* ════════════════════════════════════════════════
     HERO — neural particle field
  ════════════════════════════════════════════════ */
  const heroCanvas = document.getElementById("neuralCanvas");
  let heroCtx = null, heroW = 0, heroH = 0;
  let particles = [];
  const mouse = { x: -9999, y: -9999 };

  function initHero() {
    const f = fitCanvas(heroCanvas);
    if (!f) return;
    heroCtx = f.ctx; heroW = f.w; heroH = f.h;
    const count = Math.min(110, Math.floor((heroW * heroH) / 16000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * heroW,
      y: Math.random() * heroH,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1 + Math.random() * 1.8,
      hue: Math.random() < 0.75 ? PHOSPHOR : SIGNAL,
      pulse: Math.random() * Math.PI * 2,
    }));
  }
  window.addEventListener("pointermove", (e) => {
    const r = heroCanvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });

  function drawHero(t) {
    if (!heroCtx) return;
    const ctx = heroCtx;
    ctx.clearRect(0, 0, heroW, heroH);
    const LINK = 130;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      // gentle mouse gravity
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 220 * 220 && d2 > 1) {
        const d = Math.sqrt(d2);
        p.vx += (dx / d) * 0.012;
        p.vy += (dy / d) * 0.012;
      }
      p.vx = clamp(p.vx, -0.6, 0.6); p.vy = clamp(p.vy, -0.6, 0.6);
      if (p.x < -20) p.x = heroW + 20; if (p.x > heroW + 20) p.x = -20;
      if (p.y < -20) p.y = heroH + 20; if (p.y > heroH + 20) p.y = -20;
    }
    // links
    ctx.lineWidth = 0.7;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          const o = (1 - d / LINK) * 0.35;
          ctx.strokeStyle = `rgba(140, 200, 170, ${o})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    // occasional "signal" firing along a random link
    for (const p of particles) {
      const glow = 0.55 + 0.45 * Math.sin(t / 600 + p.pulse);
      ctx.fillStyle = p.hue;
      ctx.globalAlpha = 0.35 + glow * 0.55;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ════════════════════════════════════════════════
     01 · PIPELINE — scroll-driven inference scene
  ════════════════════════════════════════════════ */
  const pipeWrap = document.getElementById("pipelineWrap");
  const pipeCanvas = document.getElementById("pipelineCanvas");
  const stageEls = document.querySelectorAll(".pipeline__stage");
  let pipeCtx = null, pipeW = 0, pipeH = 0;

  const PROMPT = "show me how a model thinks";
  const TOKENS = ["show", "me", "how", "a", "model", "thinks"];
  const OUTPUT = ["it", "attends,", "then", "predicts", "the", "next", "word."];
  // deterministic pseudo-random attention weights between token pairs
  const ATT = [];
  for (let i = 0; i < TOKENS.length; i++) for (let j = 0; j < i; j++) {
    const w = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
    ATT.push({ i, j, w });
  }
  const VEC_SEED = TOKENS.map((_, i) =>
    Array.from({ length: 8 }, (_, k) => Math.abs(Math.sin(i * 7.13 + k * 3.71) * 100) % 1)
  );

  function initPipe() {
    const f = fitCanvas(pipeCanvas);
    if (!f) { pipeCtx = null; return; }
    pipeCtx = f.ctx; pipeW = f.w; pipeH = f.h;
  }

  function pipeProgress() {
    const r = pipeWrap.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    return clamp(-r.top / total, 0, 1);
  }

  function drawPipe() {
    if (!pipeCtx) return;
    const r = pipeWrap.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return; // offscreen
    const p = pipeProgress();
    const ctx = pipeCtx;
    ctx.clearRect(0, 0, pipeW, pipeH);

    const small = pipeW < 700;
    const midY = pipeH * 0.46;
    const tokenY = midY;
    const rowW = small ? pipeW * 0.97 : Math.min(pipeW * 0.86, 900);
    const startX = (pipeW - rowW) / 2;
    const gap = rowW / TOKENS.length;

    // stage indicator
    const stage = p < 0.24 ? 0 : p < 0.5 ? 1 : p < 0.76 ? 2 : 3;
    stageEls.forEach((el, i) => el.classList.toggle("is-active", i === stage));

    const fontMono = (s, w = 400) => `${w} ${s}px "JetBrains Mono", monospace`;

    /* — phase A: prompt → tokens (0 → 0.24) — */
    const pa = seg(p, 0.0, 0.22);
    if (pa < 1) {
      // whole prompt string fading/spacing out
      ctx.font = fontMono(small ? 18 : 26, 500);
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(232, 240, 238, ${1 - pa})`;
      ctx.fillText(`"${PROMPT}"`, pipeW / 2, midY - (small ? 70 : 110) * easeOut(pa) - 40);
    }
    // token chips slide into place
    TOKENS.forEach((tok, i) => {
      const tp = seg(pa, i * 0.09, i * 0.09 + 0.55);
      if (tp <= 0) return;
      const targetX = startX + gap * i + gap / 2;
      const x = lerp(pipeW / 2, targetX, easeOut(tp));
      const y = tokenY;
      const alpha = easeOut(tp);
      const fs = small ? 10.5 : 15;
      ctx.font = fontMono(fs, 500);
      const tw = ctx.measureText(tok).width;
      const padX = small ? 5 : 12, chipH = small ? 24 : 34;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = PHOSPHOR;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = "rgba(163,255,107,0.07)";
      roundRect(ctx, x - tw / 2 - padX, y - chipH / 2, tw + padX * 2, chipH, 7);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e8f0ee";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(tok, x, y + 1);
      // token id
      ctx.font = fontMono(9);
      ctx.fillStyle = DIM;
      ctx.fillText(`#${1000 + i * 137}`, x, y + chipH / 2 + 12);
      ctx.globalAlpha = 1;
      ctx.textBaseline = "alphabetic";
    });

    /* — phase B: embeddings (0.24 → 0.5, fade out during generation) — */
    const pb = seg(p, 0.24, 0.48);
    const vecFade = 1 - seg(p, 0.78, 0.92);
    if (pb > 0 && vecFade > 0) {
      TOKENS.forEach((tok, i) => {
        const tp = seg(pb, i * 0.06, i * 0.06 + 0.6);
        if (tp <= 0) return;
        const x = startX + gap * i + gap / 2;
        const baseY = tokenY + (small ? 40 : 56);
        const barW = small ? 3 : 4.5;
        const totalW = VEC_SEED[i].length * (barW + 2.4);
        VEC_SEED[i].forEach((v, k) => {
          const bh = (small ? 24 : 40) * v * easeOut(seg(tp, k * 0.06, k * 0.06 + 0.5));
          ctx.fillStyle = k % 2 ? SIGNAL : PHOSPHOR;
          ctx.globalAlpha = 0.75 * vecFade;
          ctx.fillRect(x - totalW / 2 + k * (barW + 2.4), baseY + (small ? 26 : 42) - bh, barW, bh);
        });
        ctx.globalAlpha = easeOut(tp) * 0.8 * vecFade;
        ctx.font = fontMono(9);
        ctx.fillStyle = DIM;
        ctx.textAlign = "center";
        ctx.fillText("ℝ⁴⁰⁹⁶", x, baseY + (small ? 42 : 60));
        ctx.globalAlpha = 1;
      });
    }

    /* — phase C: attention arcs (0.5 → 0.76) — */
    const pc = seg(p, 0.5, 0.74);
    if (pc > 0) {
      ATT.forEach((a, idx) => {
        const ap = seg(pc, (idx % 7) * 0.05, (idx % 7) * 0.05 + 0.55);
        if (ap <= 0 || a.w < 0.25) return;
        const x1 = startX + gap * a.j + gap / 2;
        const x2 = startX + gap * a.i + gap / 2;
        const arcH = (small ? 40 : 80) + Math.abs(x2 - x1) * 0.22;
        ctx.strokeStyle = a.w > 0.72 ? PHOSPHOR : a.w > 0.5 ? SIGNAL : "rgba(143,163,160,0.5)";
        ctx.lineWidth = a.w * 2.6 * ap;
        ctx.globalAlpha = clamp(a.w, 0.2, 0.9) * ap;
        ctx.beginPath();
        ctx.moveTo(x1, tokenY - 24);
        ctx.quadraticCurveTo((x1 + x2) / 2, tokenY - 24 - arcH, x2, tokenY - 24);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      // caption
      ctx.font = fontMono(small ? 10 : 12);
      ctx.fillStyle = `rgba(255, 200, 87, ${easeOut(pc)})`;
      ctx.textAlign = "center";
      ctx.fillText("softmax(QKᵀ/√d)·V — every word looks at every other word", pipeW / 2, tokenY - (small ? 96 : 170));
    }

    /* — phase D: generation (0.76 → 1) — */
    const pd = seg(p, 0.76, 0.99);
    if (pd > 0) {
      const outY = tokenY + (small ? 120 : 170);
      ctx.font = fontMono(small ? 12 : 21, 500);
      ctx.textAlign = "left";
      // measure cumulative widths
      let acc = 0;
      const widths = OUTPUT.map((w) => { const m = ctx.measureText(w + " ").width; acc += m; return m; });
      let ox = pipeW / 2 - acc / 2;
      const shown = Math.floor(pd * (OUTPUT.length + 1));
      ctx.fillStyle = DIM;
      ctx.font = fontMono(small ? 10 : 12);
      ctx.fillText("▸ output stream", ox, outY - (small ? 22 : 30));
      ctx.font = fontMono(small ? 12 : 21, 500);
      OUTPUT.forEach((w, i) => {
        if (i < shown) {
          const isLast = i === shown - 1;
          ctx.fillStyle = isLast ? PHOSPHOR : "#e8f0ee";
          if (isLast) { ctx.shadowColor = PHOSPHOR; ctx.shadowBlur = 14; }
          ctx.fillText(w, ox, outY);
          ctx.shadowBlur = 0;
        }
        ox += widths[i];
      });
      // caret
      if (shown <= OUTPUT.length) {
        const caretOn = Math.floor(performance.now() / 400) % 2 === 0;
        if (caretOn) {
          let cxp = pipeW / 2 - acc / 2;
          for (let i = 0; i < shown; i++) cxp += widths[i];
          ctx.fillStyle = PHOSPHOR;
          ctx.fillRect(cxp, outY - (small ? 11 : 18), small ? 7 : 11, small ? 14 : 22);
        }
      }
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ════════════════════════════════════════════════
     02 · MERN — packets along wires
  ════════════════════════════════════════════════ */
  const mernSvg = document.getElementById("mernSvg");
  const packetsG = document.getElementById("packets");
  const wires = ["wire1", "wire2", "wire3"].map((id) => document.getElementById(id));
  const mernNodes = mernSvg.querySelectorAll(".node");
  let mernVisible = false;

  const packetDefs = [];
  // forward (request) packets — phosphor squares; return (response) — cyan circles
  wires.forEach((wire, wi) => {
    for (let k = 0; k < 2; k++) {
      const el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      el.setAttribute("width", 10); el.setAttribute("height", 10);
      el.setAttribute("rx", 2);
      el.setAttribute("fill", PHOSPHOR);
      el.setAttribute("class", "packet");
      el.style.color = PHOSPHOR;
      packetsG.appendChild(el);
      packetDefs.push({ el, wire, dir: 1, phase: wi * 0.18 + k * 0.5, wi });
      const el2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el2.setAttribute("r", 5.5);
      el2.setAttribute("fill", SIGNAL);
      el2.setAttribute("class", "packet");
      el2.style.color = SIGNAL;
      packetsG.appendChild(el2);
      packetDefs.push({ el: el2, wire, dir: -1, phase: wi * 0.18 + k * 0.5 + 0.28, wi });
    }
  });
  const wireLens = wires.map((w) => w.getTotalLength());

  new IntersectionObserver((es) => es.forEach((e) => (mernVisible = e.isIntersecting)), { threshold: 0.15 })
    .observe(mernSvg);

  function drawMern(t) {
    if (!mernVisible) return;
    const speed = 4200;
    const lit = new Set();
    packetDefs.forEach((pk) => {
      let u = ((t / speed) + pk.phase) % 1;
      if (pk.dir === -1) u = 1 - u;
      const len = wireLens[pk.wi];
      const pt = pk.wire.getPointAtLength(u * len);
      const yOff = pk.dir === 1 ? -14 : 14;
      if (pk.el.tagName === "rect") {
        pk.el.setAttribute("x", pt.x - 5); pk.el.setAttribute("y", pt.y + yOff - 5);
      } else {
        pk.el.setAttribute("cx", pt.x); pk.el.setAttribute("cy", pt.y + yOff);
      }
      // light nodes near wire endpoints
      if (u > 0.92) lit.add(pk.wi + 1);
      if (u < 0.08) lit.add(pk.wi);
    });
    mernNodes.forEach((n, i) => n.classList.toggle("is-lit", lit.has(i)));
  }

  /* ════════════════════════════════════════════════
     03 · BLUEPRINT — self-drawing on scroll
  ════════════════════════════════════════════════ */
  const bpWrap = document.getElementById("blueprintWrap");
  const bpEdges = [...document.querySelectorAll(".bp-edge")];
  const bpNodes = [...document.querySelectorAll(".bp-node")];
  const bpNotes = [...document.querySelectorAll(".bp-note")];

  const bpEdgeLens = bpEdges.map((e) => e.getTotalLength());
  bpEdges.forEach((e, i) => {
    if (!e.classList.contains("bp-edge--dash")) {
      e.style.strokeDasharray = bpEdgeLens[i];
      e.style.strokeDashoffset = bpEdgeLens[i];
    } else {
      e.style.opacity = 0;
    }
  });
  bpNodes.forEach((n) => {
    const shape = n.querySelector("rect, circle");
    const len = shape.getTotalLength ? shape.getTotalLength() : 400;
    shape.style.strokeDasharray = len;
    shape.style.strokeDashoffset = len;
    n.querySelectorAll("text").forEach((tx) => (tx.style.opacity = 0));
  });

  function drawBlueprint() {
    const r = bpWrap.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const total = r.height - window.innerHeight;
    const p = clamp(-r.top / total, 0, 1);

    // nodes draw first, staggered (0 → 0.55)
    bpNodes.forEach((n, i) => {
      const np = seg(p, i * 0.055, i * 0.055 + 0.22);
      const shape = n.querySelector("rect, circle");
      const len = parseFloat(shape.style.strokeDasharray);
      shape.style.strokeDashoffset = len * (1 - easeInOut(np));
      const tp = seg(np, 0.6, 1);
      n.querySelectorAll("text").forEach((tx) => (tx.style.opacity = tp));
    });
    // edges ink in (0.3 → 0.8)
    bpEdges.forEach((e, i) => {
      if (e.classList.contains("bp-edge--dash")) {
        e.style.opacity = seg(p, 0.62 + i * 0.02, 0.78) * 0.6;
        return;
      }
      const ep = seg(p, 0.3 + i * 0.05, 0.3 + i * 0.05 + 0.2);
      e.style.strokeDashoffset = bpEdgeLens[i] * (1 - easeInOut(ep));
    });
    // margin notes (0.72 → 1)
    bpNotes.forEach((n, i) => {
      n.classList.toggle("is-on", p > 0.72 + i * 0.06);
    });
  }

  /* ════════════════════════════════════════════════
     FOOTER — quiet waveform
  ════════════════════════════════════════════════ */
  const footCanvas = document.getElementById("footerCanvas");
  let footCtx = null, footW = 0, footH = 0, footVisible = false;
  function initFoot() {
    const f = fitCanvas(footCanvas);
    if (!f) { footCtx = null; return; }
    footCtx = f.ctx; footW = f.w; footH = f.h;
  }
  new IntersectionObserver((es) => es.forEach((e) => (footVisible = e.isIntersecting)), { threshold: 0.05 })
    .observe(footCanvas);

  function drawFoot(t) {
    if (!footCtx || !footVisible) return;
    const ctx = footCtx;
    ctx.clearRect(0, 0, footW, footH);
    for (let line = 0; line < 3; line++) {
      ctx.beginPath();
      ctx.strokeStyle = line === 0 ? "rgba(163,255,107,0.18)" : line === 1 ? "rgba(91,215,255,0.12)" : "rgba(255,200,87,0.08)";
      ctx.lineWidth = 1.2;
      const yBase = footH * (0.55 + line * 0.12);
      for (let x = 0; x <= footW; x += 6) {
        const y = yBase +
          Math.sin(x * 0.008 + t / (900 + line * 300)) * 22 +
          Math.sin(x * 0.021 + t / (500 + line * 200)) * 8;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  /* ════════════════════════════════════════════════
     CONTENT — research / blog / logbook from content.js
  ════════════════════════════════════════════════ */
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function inlineMd(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  function mdToHtml(md) {
    const segs = md.split(/```(?:\w*)\n?/);
    let html = "";
    segs.forEach((segRaw, i) => {
      if (i % 2 === 1) { html += `<pre><code>${esc(segRaw.replace(/\n$/, ""))}</code></pre>`; return; }
      const blocks = segRaw.split(/\n\s*\n/);
      blocks.forEach((b) => {
        const t = b.trim();
        if (!t) return;
        if (/^## /.test(t)) { html += `<h2>${inlineMd(esc(t.slice(3)))}</h2>`; }
        else if (/^# /.test(t)) { html += `<h1>${inlineMd(esc(t.slice(2)))}</h1>`; }
        else if (/^- /m.test(t)) {
          const items = t.split("\n").filter((l) => /^- /.test(l.trim()));
          html += "<ul>" + items.map((l) => `<li>${inlineMd(esc(l.trim().slice(2)))}</li>`).join("") + "</ul>";
        }
        else { html += `<p>${inlineMd(esc(t)).replace(/\n/g, "<br/>")}</p>`; }
      });
    });
    return html;
  }

  const C = window.SITE_CONTENT || { research: [], blog: [], journal: [] };
  const reader = document.getElementById("reader");
  const readerMeta = document.getElementById("readerMeta");
  const readerBody = document.getElementById("readerBody");

  function openReader(meta, body) {
    readerMeta.textContent = meta;
    readerBody.innerHTML = mdToHtml(body);
    reader.classList.add("is-open");
    reader.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    reader.querySelector(".reader__panel").scrollTop = 0;
  }
  function closeReader() {
    reader.classList.remove("is-open");
    reader.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.getElementById("readerClose").addEventListener("click", closeReader);
  document.getElementById("readerScrim").addEventListener("click", closeReader);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeReader(); });

  // research cards
  const researchGrid = document.getElementById("researchGrid");
  C.research.forEach((r) => {
    const el = document.createElement("button");
    el.className = "paper";
    el.setAttribute("data-reveal", "");
    el.setAttribute("data-hover", "");
    el.innerHTML = `
      <div class="paper__top">
        <span class="paper__id">[${esc(r.id)}]</span>
        <span class="paper__status paper__status--${esc(r.status)}">${esc(r.status)}</span>
      </div>
      <h3>${esc(r.title)}</h3>
      <p class="paper__abstract">${esc(r.abstract)}</p>
      <div class="paper__foot">
        <div class="paper__tags">${r.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <span class="paper__read">read →</span>
      </div>`;
    el.addEventListener("click", () => openReader(`research · ${r.id} · ${r.date} · ${r.status}`, r.body));
    researchGrid.appendChild(el);
  });

  // blog list
  const blogList = document.getElementById("blogList");
  C.blog.forEach((b, i) => {
    const el = document.createElement("button");
    el.className = "post";
    el.setAttribute("data-reveal", "");
    el.setAttribute("data-hover", "");
    el.innerHTML = `
      <span class="post__idx">${String(i + 1).padStart(2, "0")}</span>
      <span class="post__title">${esc(b.title)}</span>
      <span class="post__date">${esc(b.date)} · ${b.minutes} min</span>
      <span class="post__arrow">⟶</span>
      <span class="post__tags">${b.tags.map((t) => "#" + esc(t)).join("  ")}</span>`;
    el.addEventListener("click", () => openReader(`blog · ${b.date} · ${b.minutes} min read`, b.body));
    blogList.appendChild(el);
  });

  // logbook
  const logbook = document.getElementById("logbook");
  C.journal.forEach((j) => {
    const el = document.createElement("div");
    el.className = "log-entry";
    el.setAttribute("data-reveal", "");
    el.innerHTML = `
      <div class="log-entry__date"><span class="log-entry__icon">${esc(j.icon || "✎")}</span>${esc(j.date)}</div>
      <p class="log-entry__text">${esc(j.text)}</p>`;
    logbook.appendChild(el);
  });

  // observe the dynamically created reveal elements
  document.querySelectorAll(".paper[data-reveal], .post[data-reveal], .log-entry[data-reveal]")
    .forEach((el) => revealIO.observe(el));

  /* ════════════════════════════════════════════════
     mobile menu
  ════════════════════════════════════════════════ */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  function toggleMenu(force) {
    const open = force !== undefined ? force : !mobileMenu.classList.contains("is-open");
    mobileMenu.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    mobileMenu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => toggleMenu());
  mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ════════════════════════════════════════════════
     master loop + resize
  ════════════════════════════════════════════════ */
  function initAll() { initHero(); initPipe(); initFoot(); }
  initAll();
  let resizeT;
  window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(initAll, 150); });

  let heroVisible = true;
  new IntersectionObserver((es) => es.forEach((e) => (heroVisible = e.isIntersecting)), { threshold: 0 })
    .observe(heroCanvas);

  function loop(t) {
    if (!reduceMotion) {
      if (heroVisible) drawHero(t);
      drawPipe();
      drawMern(t);
      drawBlueprint();
      drawFoot(t);
    } else {
      // reduced motion: render final states statically once
      drawPipe();
      drawBlueprint();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

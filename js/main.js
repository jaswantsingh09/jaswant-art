/* ═══════════════════════════════════════════════════════════
   jaswant.art — behaviour
   word reveals · plotter line field · work previews
   studio night shift · writing reader
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  function fitCanvas(canvas, w, h) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* ───────────── year + clock ───────────── */
  $("#year").textContent = new Date().getFullYear();
  const clock = $("#clock");
  function tick() {
    try {
      clock.textContent = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
      }) + " IST";
    } catch (_) { clock.textContent = ""; }
  }
  tick();
  setInterval(tick, 30000);

  /* ───────────── split headings into masked words ───────────── */
  function split(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.nodeValue.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.textContent = part;
            inner.style.transitionDelay = (i++ * 0.035).toFixed(3) + "s";
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add("is-split");
  }
  $$("[data-split]").forEach(split);

  /* ───────────── reveal on scroll (staggered per batch) ───────────── */
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, n) => {
      e.target.style.transitionDelay = e.target.classList.contains("is-split") ? "" : n * 0.08 + "s";
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  const observe = () => $$("[data-reveal]:not(.is-in), .is-split:not(.is-in)").forEach((el) => io.observe(el));

  /* ───────────── content: writing + journal ───────────── */
  const C = window.SITE_CONTENT || { research: [], blog: [], journal: [] };
  const entriesEl = $("#entries");
  const items = [
    ...C.blog.filter((b) => !b.draft).map((b) => ({ kind: "Essay", title: b.title, meta: `${b.date} · ${b.minutes} min`, body: b.body, readerMeta: `Essay — ${b.date}` })),
    ...C.research.map((r) => ({
      kind: C.blog.some((b) => !b.draft) ? "Research" : r.id, title: r.title, body: r.body,
      meta: [r.date, r.status].filter(Boolean).join(" · "),
      readerMeta: ["Research " + r.id, r.date, r.status].filter(Boolean).join(" — "),
    })),
  ];
  items.forEach((it) => {
    const li = document.createElement("li");
    li.setAttribute("data-reveal", "");
    li.innerHTML = `
      <button class="entry" type="button">
        <span class="entry__type mono">${esc(it.kind)}</span>
        <span class="entry__title">${esc(it.title)}</span>
        <span class="entry__meta mono">${esc(it.meta)}</span>
        <span class="entry__arrow" aria-hidden="true">→</span>
      </button>`;
    li.querySelector("button").addEventListener("click", (e) => openReader(it.readerMeta, it.body, e.currentTarget));
    entriesEl.appendChild(li);
  });

  const journalEl = $("#journal");
  const journal = C.journal.filter((j) => !j.draft);
  journalEl.closest(".journal").hidden = journal.length === 0;
  journal.forEach((j) => {
    const li = document.createElement("li");
    li.setAttribute("data-reveal", "");
    li.innerHTML = `<time datetime="${esc(j.date)}">${esc(j.date)}</time><span>${esc(j.text)}</span>`;
    journalEl.appendChild(li);
  });
  observe();

  /* ───────────── reader ───────────── */
  const reader = $("#reader"), readerPanel = $(".reader__panel");
  let lastFocus = null;

  function inlineMd(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function mdToHtml(md) {
    return md.split(/```(?:\w*)\n?/).map((seg, i) => {
      if (i % 2) return `<pre><code>${esc(seg.replace(/\n$/, ""))}</code></pre>`;
      return seg.split(/\n\s*\n/).map((b) => {
        const t = b.trim();
        if (!t) return "";
        if (t.startsWith("## ")) return `<h2>${inlineMd(esc(t.slice(3)))}</h2>`;
        if (t.startsWith("# ")) return `<h1>${inlineMd(esc(t.slice(2)))}</h1>`;
        if (/^- /m.test(t)) {
          return "<ul>" + t.split("\n").filter((l) => /^- /.test(l.trim()))
            .map((l) => `<li>${inlineMd(esc(l.trim().slice(2)))}</li>`).join("") + "</ul>";
        }
        return `<p>${inlineMd(esc(t)).replace(/\n/g, "<br/>")}</p>`;
      }).join("");
    }).join("");
  }
  function openReader(meta, body, from) {
    lastFocus = from || document.activeElement;
    $("#readerMeta").textContent = meta;
    $("#readerBody").innerHTML = mdToHtml(body);
    reader.classList.add("is-open");
    reader.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    readerPanel.scrollTop = 0;
    setTimeout(() => readerPanel.focus({ preventScroll: true }), 50);
  }
  function closeReader() {
    if (!reader.classList.contains("is-open")) return;
    reader.classList.remove("is-open");
    reader.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $("#readerClose").addEventListener("click", closeReader);
  $("#readerScrim").addEventListener("click", closeReader);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeReader(); });

  /* ───────────── copy email ───────────── */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; }
      catch (_) {
        // older browsers / non-secure contexts
        const ta = Object.assign(document.createElement("textarea"), { value: text });
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
        ta.remove();
      }
      btn.textContent = ok ? "Copied" : "Press ⌘/Ctrl+C";
      btn.classList.toggle("is-done", ok);
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("is-done"); }, 2000);
    });
  });

  /* ───────────── studio: lights down ───────────── */
  const studio = $("#studio");
  function nightShift() {
    const r = studio.getBoundingClientRect();
    const mid = innerHeight * 0.55;
    const night = r.top < mid && r.bottom > innerHeight * 0.45;
    document.documentElement.classList.toggle("is-night", night);
  }
  addEventListener("scroll", nightShift, { passive: true });
  nightShift();

  /* ═══════════════════════════════════════════════
     INTRO — a plotter's line field
     Ridgelines drawn back to front; each one occludes
     the ones behind it. The cursor lifts the terrain.
  ═══════════════════════════════════════════════ */
  const field = $("#field");
  let fctx = null, fW = 0, fH = 0, fVisible = true;
  const ptr = { x: -1e4, y: -1e4, sx: -1e4, sy: -1e4 };
  const LINES = [];

  function initField() {
    const r = field.getBoundingClientRect();
    if (!r.width) return;
    fW = r.width; fH = r.height;
    fctx = fitCanvas(field, fW, fH);
    const n = Math.round(clampN(fH / 13, 18, 44));
    LINES.length = 0;
    for (let i = 0; i < n; i++) {
      LINES.push({
        p1: Math.random() * 6.28, p2: Math.random() * 6.28, p3: Math.random() * 6.28,
        center: 0.55 + (Math.random() - 0.5) * 0.18,
      });
    }
  }
  function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }

  addEventListener("pointermove", (e) => {
    const r = field.getBoundingClientRect();
    ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { ptr.x = ptr.y = -1e4; });

  function drawField(t) {
    if (!fctx) return;
    const ctx = fctx;
    const paper = css("--paper") || "#f3f1ec";
    const ink = css("--ink") || "#141311";
    const accent = css("--accent") || "#d8452b";
    ptr.sx = ptr.sx < -9e3 ? ptr.x : lerp(ptr.sx, ptr.x, 0.08);
    ptr.sy = ptr.sy < -9e3 ? ptr.y : lerp(ptr.sy, ptr.y, 0.08);

    ctx.clearRect(0, 0, fW, fH);
    const n = LINES.length;
    // leave headroom above the back ridge so its peaks never clip
    const gap = (fH - 6) / (n + 6), top = gap * 6.5;
    const time = t * 0.00018;
    const step = fW > 900 ? 5 : 7;

    // which ridge is nearest the cursor (it gets the accent)
    let hot = -1;
    if (ptr.sy > 0 && ptr.sy < fH) hot = Math.round((ptr.sy - top) / gap);

    for (let i = 0; i < n; i++) {
      const L = LINES[i];
      const base = top + i * gap;
      const cx = fW * L.center;
      const spread = fW * 0.2;
      const pts = [];
      for (let x = 0; x <= fW + step; x += step) {
        const env = Math.exp(-Math.pow((x - cx) / spread, 2));
        const nse =
          0.55 * Math.sin(x * 0.011 + L.p1 + time * 3.1) +
          0.30 * Math.sin(x * 0.027 - L.p2 + time * 4.7) +
          0.15 * Math.sin(x * 0.061 + L.p3 - time * 6.3);
        let lift = env * (0.5 + 0.5 * nse) * gap * 5.2 + (0.5 + 0.5 * nse) * gap * 0.35;
        // the cursor raises a soft hill
        const dx = x - ptr.sx, dy = base - ptr.sy;
        lift += Math.exp(-(dx * dx) / 9000 - (dy * dy) / 5200) * gap * 4.4;
        pts.push(x, base - lift);
      }
      // occlude what's behind, then ink only the ridge itself
      ctx.beginPath();
      for (let k = 0; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
      ctx.lineTo(fW + step, fH); ctx.lineTo(0, fH); ctx.closePath();
      ctx.fillStyle = paper;
      ctx.fill();
      ctx.beginPath();
      for (let k = 0; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
      ctx.lineWidth = i === hot ? 1.4 : 1;
      ctx.strokeStyle = i === hot ? accent : ink;
      ctx.globalAlpha = i === hot ? 1 : 0.28 + 0.5 * (i / n);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  new IntersectionObserver((es) => es.forEach((e) => (fVisible = e.isIntersecting))).observe(field);

  /* ═══════════════════════════════════════════════
     WORK — a small drawing follows the cursor
  ═══════════════════════════════════════════════ */
  const peek = $("#peek"), peekCanvas = $("#peekCanvas");
  const PW = 300, PH = 210;
  let pctx = null, peekOn = false;
  const pk = { x: 0, y: 0, tx: 0, ty: 0, rot: 0 };

  function rng(seed) {
    let s = seed * 9301 + 49297;
    return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  }

  // four plotter studies — one per project, chosen by seed
  function drawStudy(seed) {
    const ctx = pctx, r = rng(seed);
    const accent = "#d8452b", paper = "#f3f1ec";
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, PW, PH);
    ctx.strokeStyle = paper; ctx.fillStyle = paper;
    ctx.lineWidth = 1;
    const kind = seed % 4;
    if (kind === 0) {
      // nested circles drifting off-centre
      const cx = PW * (0.35 + r() * 0.3), cy = PH * 0.55;
      for (let i = 1; i < 26; i++) {
        ctx.beginPath();
        ctx.arc(cx + i * 2.2, cy - i * 0.8, i * 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (kind === 1) {
      // dot grid, size follows a wave
      for (let y = 18; y < PH; y += 14) {
        for (let x = 18; x < PW; x += 14) {
          const v = 0.5 + 0.5 * Math.sin(x * 0.03 + y * 0.05 + seed);
          ctx.beginPath(); ctx.arc(x, y, 0.6 + v * 3.6, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else if (kind === 2) {
      // hatching with a void
      const vx = PW * (0.3 + r() * 0.4), vy = PH * (0.35 + r() * 0.3), vr = 46;
      for (let k = -PH; k < PW + PH; k += 6) {
        ctx.beginPath();
        let pen = false;
        for (let x = 0; x <= PW; x += 3) {
          const y = x - k;
          if (y < 0 || y > PH) { pen = false; continue; }
          const inside = (x - vx) ** 2 + (y - vy) ** 2 < vr * vr;
          if (inside) { pen = false; continue; }
          pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          pen = true;
        }
        ctx.stroke();
      }
    } else {
      // stacked waves
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        const base = 20 + i * 10.5;
        for (let x = 0; x <= PW; x += 4) {
          const y = base + Math.sin(x * 0.035 + i * 0.5 + seed) * 8 * Math.sin(x / PW * Math.PI);
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
    }
  }

  if (finePointer && !reduceMotion) {
    pctx = fitCanvas(peekCanvas, PW, PH);
    const rows = $$(".row");
    rows.forEach((row) => {
      row.addEventListener("pointerenter", () => {
        drawStudy(parseInt(row.dataset.seed, 10) || 1);
        peekOn = true;
        peek.classList.add("is-on");
      });
    });
    $("#workRows").addEventListener("pointerleave", () => { peekOn = false; peek.classList.remove("is-on"); });
    addEventListener("pointermove", (e) => { pk.tx = e.clientX; pk.ty = e.clientY; }, { passive: true });
    addEventListener("scroll", () => { if (peekOn) { peekOn = false; peek.classList.remove("is-on"); } }, { passive: true });
  }

  function movePeek() {
    if (!pctx) return;
    const px = pk.x, py = pk.y;
    pk.x = lerp(pk.x, pk.tx + 28, 0.14);
    pk.y = lerp(pk.y, pk.ty - PH / 2, 0.14);
    pk.rot = lerp(pk.rot, Math.max(-8, Math.min(8, (pk.x - px) * 0.4)), 0.12);
    const x = Math.min(pk.x, innerWidth - PW - 16);
    peek.style.translate = `${x}px ${pk.y}px`;
    peek.style.rotate = `${pk.rot.toFixed(2)}deg`;
  }

  /* ───────────── memoji: a small head-turn toward the cursor ───────────── */
  const me = $("#me");
  const head = { r: 0, x: 0, y: 0 };
  function turnHead() {
    if (!me || !finePointer || !fVisible) return;
    const b = me.getBoundingClientRect();
    const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    const tr = ptr.sx < -9e3 ? 0 : Math.max(-1, Math.min(1, (lastPX - cx) / 600));
    const ty = ptr.sy < -9e3 ? 0 : Math.max(-1, Math.min(1, (lastPY - cy) / 600));
    head.r = lerp(head.r, tr * 9, 0.08);
    head.x = lerp(head.x, tr * 6, 0.08);
    head.y = lerp(head.y, ty * 4, 0.08);
    me.style.transform = `translate(${head.x.toFixed(2)}px, ${head.y.toFixed(2)}px) rotate(${head.r.toFixed(2)}deg)`;
  }
  let lastPX = 0, lastPY = 0;
  addEventListener("pointermove", (e) => { lastPX = e.clientX; lastPY = e.clientY; }, { passive: true });

  /* ───────────── loop + resize ───────────── */
  initField();
  let rT;
  addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(initField, 150); });

  if (reduceMotion) {
    drawField(0);
  } else {
    (function loop(t) {
      if (fVisible) drawField(t);
      movePeek();
      turnHead();
      requestAnimationFrame(loop);
    })(0);
  }
})();

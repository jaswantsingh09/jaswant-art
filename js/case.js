/* ═══════════════════════════════════════════════════════════
   jaswant.art — case study pages
   clock · word reveals · scroll reveals · count-up · copy email
   (a trimmed sibling of main.js; the home page's canvases aren't here)
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ───────────── year + clock ───────────── */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const clock = document.getElementById("clock");
  function tick() {
    try {
      clock.textContent = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
      }) + " IST";
    } catch (_) { clock.textContent = ""; }
  }
  if (clock) { tick(); setInterval(tick, 30000); }

  /* ───────────── split headings into masked words ───────────── */
  $$("[data-split]").forEach((el) => {
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
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    el.classList.add("is-split");
  });

  /* ───────────── count-up for the result numbers ───────────── */
  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    if (reduceMotion || !isFinite(to)) return;
    const t0 = performance.now(), dur = 1400;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ───────────── reveal on scroll (staggered per batch) ───────────── */
  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e, n) => {
      if (!e.target.classList.contains("is-split")) e.target.style.transitionDelay = n * 0.08 + "s";
      e.target.classList.add("is-in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal], .is-split").forEach((el) => io.observe(el));

  /* ───────────── copy email ───────────── */
  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; }
      catch (_) {
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
})();

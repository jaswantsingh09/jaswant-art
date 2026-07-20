/* ═══════════════════════════════════════════════════════════════
   ✏️ ALL YOUR WRITTEN CONTENT LIVES HERE.
   Add a blog post / research note / journal entry by adding an
   object to the right array below. Newest first is recommended —
   the site renders them in the order they appear here.

   `body` supports lightweight markdown:
     # Heading   ## Subheading   **bold**   *italic*   `code`
     - list item          [link text](https://url)
     ``` fenced code block ```
   Blank line = new paragraph.
   ═══════════════════════════════════════════════════════════════ */

window.SITE_CONTENT = {

  /* ────────────────────────────────────────────────
     RESEARCH — deep dives, experiments, papers
     status: "ongoing" | "published" | "draft"
  ──────────────────────────────────────────────── */
  research: [
    {
      id: "R-01",
      title: "Chunking Strategies vs. Retrieval Quality in Production RAG",
      status: "ongoing",
      date: "2026",
      tags: ["rag", "embeddings", "evals"],
      abstract:
        "Placeholder — replace with your own research. Comparing fixed-window, semantic and layout-aware chunking across three real document corpora, measured on answer faithfulness rather than retrieval hit-rate alone.",
      body: `# Chunking Strategies vs. Retrieval Quality

*This is a placeholder research note — replace it in js/content.js.*

## The question

Retrieval hit-rate is the metric everyone reports, but faithfulness of the final answer is what users experience. These two numbers diverge more than expected.

## Setup

- Three corpora: contracts, support tickets, engineering wikis
- Chunkers: fixed 512-token, recursive semantic, layout-aware
- Judge: LLM-as-judge with a human-verified calibration set

## Early observations

Layout-aware chunking wins on documents with real structure, but the gap closes to nearly zero on conversational data. The interesting result is *why* — see the full write-up when it lands.`,
    },
    {
      id: "R-02",
      title: "Backpressure Patterns for Token-Streaming APIs",
      status: "published",
      date: "2025",
      tags: ["system-design", "streaming", "node"],
      abstract:
        "Placeholder — what happens when an LLM streams tokens faster than a mobile client on 3G can consume them? A tour of buffering, dropping, and adaptive throttling strategies in Node.",
      body: `# Backpressure Patterns for Token-Streaming APIs

*Placeholder research note — replace with your own.*

When a model produces tokens at 80/s and the client drains at 15/s, something has to give. This note walks through three strategies and where each breaks.

## The candidates

- **Unbounded buffering** — simple, and a memory leak with extra steps
- **Sentence-level coalescing** — trade latency for stability
- **Adaptive throttling** — pause generation itself when the socket backs up

The third option sounds exotic but pairs beautifully with interruptible inference.`,
    },
  ],

  /* ────────────────────────────────────────────────
     BLOG — essays & write-ups
  ──────────────────────────────────────────────── */
  blog: [
    {
      id: "B-01",
      title: "What Painting Taught Me About System Design",
      date: "2026-05-14",
      tags: ["essay", "art", "systems"],
      minutes: 6,
      body: `# What Painting Taught Me About System Design

*Placeholder post — replace it in js/content.js.*

A painting fails the same way a distributed system does: not at the stroke level, but at the composition level. Every individual piece can be correct while the whole is unreadable.

## Squint at it

Painters squint to blur detail and check the composition. Architects should do the same — zoom out until the boxes blur and ask: does the *shape* of this system make sense?

## Underpainting is infrastructure

Nobody sees the underpainting, and nobody praises your migration tooling. Both decide whether the visible layer survives.`,
    },
    {
      id: "B-02",
      title: "The Event Loop, Explained to a Poet",
      date: "2026-03-02",
      tags: ["node", "writing"],
      minutes: 4,
      body: `# The Event Loop, Explained to a Poet

*Placeholder post — replace with your own.*

Node's event loop is a single attentive listener at a crowded dinner party — it never finishes a conversation, it promises to come back, and remarkably, it always does.

\`\`\`js
setTimeout(() => console.log("later, as promised"), 0);
console.log("first, because presence beats promises");
\`\`\`

That's the whole trick. Everything else is queue etiquette.`,
    },
    {
      id: "B-03",
      title: "Notes on Making LLMs Boring (Reliable)",
      date: "2025-11-20",
      tags: ["llm", "engineering"],
      minutes: 8,
      body: `# Notes on Making LLMs Boring

*Placeholder post — replace with your own.*

The demo is easy. The boring version — retries, fallbacks, evals in CI, cost ceilings, graceful degradation when the provider hiccups — is the actual product.

- Treat prompts like code: versioned, reviewed, tested
- Treat evals like unit tests: they run on every change
- Treat the model like a dependency: pin it, and have a plan B`,
    },
  ],

  /* ────────────────────────────────────────────────
     JOURNAL — daily life, small and unpolished
     (rendered inside The Studio; keep entries short)
  ──────────────────────────────────────────────── */
  journal: [
    {
      date: "2026-07-12",
      icon: "⛰",
      text: "Placeholder — 60km bike ride before the city woke up. Legs gone, head clear. Best architecture reviews happen on the saddle.",
    },
    {
      date: "2026-06-28",
      icon: "☔",
      text: "Placeholder — first monsoon rain. Sat in the balcony with chai and let a deploy window pass. No regrets.",
    },
    {
      date: "2026-06-09",
      icon: "🎨",
      text: "Placeholder — started an oil study of the street corner. Ochre is impossible. Third attempt this month.",
    },
    {
      date: "2026-05-30",
      icon: "⌨",
      text: "Placeholder — rewrote a service in an evening that took a month to write the first time. Deleting code remains the best feeling in software.",
    },
  ],
};

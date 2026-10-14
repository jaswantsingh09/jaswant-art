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
      title: "Context-Window Optimization for Long Conversations",
      status: "internal",
      date: "",
      tags: ["llm", "latency", "context"],
      abstract:
        "Prompt slicing, dynamic summarization and embedding fallbacks that cut latency 40% and removed context overflow in long-running conversations.",
      body: `# Context-Window Optimization

Long conversations eventually outgrow the model's context window. The naive fix, truncating the oldest turns, quietly drops the facts users care about most.

## Approach

- **Prompt slicing**: send only the parts of the history that the current turn depends on
- **Dynamic summarization**: compress older turns into running summaries instead of discarding them
- **Embedding fallback**: when a detail has been summarized away, retrieve the original turn by similarity

## Result

Latency fell by **40%**, and context-overflow errors in long conversations went to zero. The strategies were packaged as reusable components for the team.`,
    },
    {
      id: "R-02",
      title: "AIOps: Observability for LLM Pipelines",
      status: "internal",
      date: "",
      tags: ["mlops", "observability", "reliability"],
      abstract:
        "An observability layer for LLM pipelines (automated retries, structured error handling and drift detection) that reduced model failures by 70%.",
      body: `# AIOps: Observability for LLM Pipelines

LLM pipelines fail in ways ordinary services don't: provider timeouts, malformed structured output, and slow drift in answer quality.

## What it does

- Automated retries with backoff and fallbacks
- Structured error handling, so failures are classified rather than swallowed
- Drift detection on outputs, with metrics and alerts

## Result

Model failures fell by **70%**.`,
    },
    {
      id: "R-03",
      title: "An Agentic Assistant Framework on AWS Lambda",
      status: "internal",
      date: "",
      tags: ["agents", "langchain", "aws"],
      abstract:
        "A multi-agent LangChain system with persistent memory and tool integration, running serverless with sub-500 ms async streaming and CloudWatch observability.",
      body: `# An Agentic Assistant Framework

A multi-agent system built on LangChain, designed to run serverless.

- **Memory persistence** across sessions
- **Tool integration**, so agents act rather than only answer
- **Async streaming** on AWS Lambda, with first tokens in under 500 ms
- **CloudWatch** metrics and logs for every agent step`,
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

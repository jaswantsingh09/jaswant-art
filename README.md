# jaswant.art — personal site

Animated portfolio: 80% tech (LLM · MERN · system design), 20% art (poems · paintings · observations).

No build step. Open `index.html` in a browser, or serve it:

```
npx serve .
```

## Structure

```
index.html      — everything lives here (all sections)
css/style.css   — design tokens + all styling
js/content.js   — ✏️ YOUR WRITING: blog posts, research notes, journal entries
js/main.js      — canvas scenes + scroll engine + content rendering
art/            — put your painting images here
```

## Adding a blog post / research note / journal entry

Open `js/content.js` and add an object to the matching array — that's it, no build step.
Post bodies support lightweight markdown (`#` headings, `**bold**`, `*italic*`,
`` `code` ``, fenced code blocks, `-` lists, links). Posts open in a slide-in reader.

## Where to edit the rest (search for "✏️ EDIT HERE" in index.html)

| What | Where |
|---|---|
| Name / tagline / hero text | `.hero__title`, `.hero__desc` |
| Projects | `.work__grid` — one `<article class="card">` per project |
| Blog / research / journal | `js/content.js` |
| Poems | `.poems` — one `<article class="poem">` per poem |
| Paintings | `.gallery` — replace `<div class="frame__ph …">` with `<img src="art/your-file.jpg" alt="…" />` |
| Observations | `.obs-list` — one `<blockquote class="obs">` per note |
| Email / socials | `.contact__links` |

## The big animations

- **Hero** — interactive neural particle field (follows your cursor)
- **01 · Inference** — sticky section; scrolling drives tokenize → embed → attend → generate
- **02 · MERN** — live request/response packets flowing through React → Express → Node → Mongo
- **03 · Blueprint** — a distributed-system diagram that draws itself as you scroll

Colors, fonts and spacing are all CSS variables at the top of `style.css`.

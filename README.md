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
js/play.js      — interaction layer: preloader, terminal, paint studio, themes, trail, HUD
css/play.css    — styles for the interaction layer
404.html        — custom "token not in vocabulary" page
CNAME           — custom domain for GitHub Pages (jaswant.art)
og.png          — 1200×630 social preview image
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

## The interactive layer (js/play.js)

- **Preloader**: the name decodes letter by letter, then a curtain splits open
- **Hero**: letters move away from your cursor, the last word keeps rotating (machines → systems → poems → …), and a click sends a pulse through the network
- **Terminal**: press `~` or click `>_`. Try `help`, `neofetch`, `theme cyber`, `blog`, `read 1`, `paint`, `matrix`, `sudo hire jaswant`
- **Accent themes**: `phosphor · cyber · ember · ice · mono`. The whole site recolours live and the choice is remembered
- **Paint studio** (“Leave a mark”): bristle, ink and mist brushes, six pigments, “let it paint” (a generative flow-field painter), wash, and save as PNG
- **Cursor trail**: phosphor sparks in the tech world, ink drops in the studio
- **Section HUD**: dots on the right edge; the marquee speeds up and skews with your scroll speed
- **Scramble text** on section titles and nav links; poems bleed in line by line; paintings tilt toward the cursor and catch a glare
- **Footer clock**: Jaswant's local time (IST) and what Jaswant is “probably” doing
- **Konami code** ↑↑↓↓←→←→BA

Everything respects `prefers-reduced-motion`.

To add terminal commands, extend the `COMMANDS` object in `js/play.js`.
To change the rotating hero words, edit `ROTATE_WORDS`.

## Deploying to jaswant.art

This is a static site with no build step, so any static host works.

**GitHub Pages (the `CNAME` file is already set up)**
1. Repo → Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
2. At your DNS provider for `jaswant.art`, add:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `jaswantsingh09.github.io`
3. Once the certificate is issued, tick **Enforce HTTPS**.

**Netlify / Vercel / Cloudflare Pages**: import the repo, leave the build command empty and set the output directory to `/`. Then add `jaswant.art` as a custom domain and follow their DNS instructions. You can delete `CNAME` there.

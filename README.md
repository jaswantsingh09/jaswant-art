# jaswant.art

Personal site of Jaswant Singh: GenAI engineer who loves music, poetry and paint.

Paper, ink and one red, set on a 12-column grid. Static HTML/CSS/JS with no build step.
Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Structure

```
index.html      all sections (intro, work, practice, writing, studio, contact)
css/style.css   design tokens at the top, then one block per section
js/content.js   ✏️ your writing: essays, research notes, journal entries
js/main.js      word reveals, the intro line field, work previews, studio night shift, reader
404.html        not-found page
CNAME           custom domain for GitHub Pages
og.png          1200×630 social preview image
resume.pdf      public résumé (phone number removed)
img/            memoji and favicons
```

## Editing

| What | Where |
|---|---|
| Intro sentence and the "Currently / Focus / Also" row | `.intro` in `index.html` |
| Projects | `#workRows`: one `<li class="row">` per project. `data-seed` picks the hover drawing |
| Essays, research, journal | `js/content.js` (rendered automatically; essays and research open in a side reader) |
| Paintings | `.plates`: replace each `<div class="plate__ph …">` with `<img src="art/file.jpg" alt="…" />` |
| Poems and notes | `.poems` and `.notes__list` in `index.html` |
| Email and links | `.contact`. The **Copy** button copies whatever is in its `data-copy` attribute |
| Résumé | replace `resume.pdf` in the repo root. It's linked from the header and the footer, so keep the phone number out of it |
| Google profile data | the `application/ld+json` block in `<head>` of `index.html`. Update it when your role or links change |
| Colours and fonts | CSS variables at the top of `css/style.css` |

## Motion

The motion is kept small on purpose:

- **Intro**: a field of plotter-style ridgelines that drifts slowly. The cursor raises a soft hill, and the ridge nearest the cursor turns red.
- **Work**: hovering a project dims the others, and a small generative drawing follows the cursor.
- **Headings** rise word by word, and content fades in as you scroll.
- **Studio**: the page darkens while you are in it.

All of it is switched off when the visitor's device asks for reduced motion.

## Deploying to jaswant.art

This is a static site with no build step, so any static host works.

**GitHub Pages (the `CNAME` file is already set up)**
1. Repo → Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
2. At your DNS provider for `jaswant.art`, add:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www` → `jaswantsingh09.github.io`
3. Once the certificate is issued, tick **Enforce HTTPS**.

**DNS on GoDaddy**
1. GoDaddy → *My Products* → *Domains* → `jaswant.art` → **DNS** → *DNS Records*.
2. Delete the default `A @ → Parked` record. Under the *Forwarding* tab, remove any forwarding.
3. Add four `A` records, all with **Name** `@` and the default TTL:
   `185.199.108.153` · `185.199.109.153` · `185.199.110.153` · `185.199.111.153`
4. Edit the existing `CNAME www` record (it points to `@` by default) so it points to `jaswantsingh09.github.io`.
5. Optional, for IPv6: add four `AAAA` records for `@`:
   `2606:50c0:8000::153` · `2606:50c0:8001::153` · `2606:50c0:8002::153` · `2606:50c0:8003::153`
6. Recommended: verify the domain in GitHub → *Settings* (your account) → *Pages* → *Add a domain*. GitHub gives you a `TXT` record to add at GoDaddy, and it stops anyone else from claiming the domain.
7. Check propagation with `dig jaswant.art +short`. It should list the four `185.199.x.153` addresses. That usually takes minutes, but can take up to 48 hours.

**Netlify / Vercel / Cloudflare Pages**: import the repo, leave the build command empty and set the output directory to `/`. Then add `jaswant.art` as a custom domain and follow their DNS instructions. You can delete `CNAME` there.

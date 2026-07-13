# GM Motors NY

Marketing + inventory website for **GM Motors NY** — a pre-owned **van**
dealership (Mercedes-Benz Sprinter, Ford Transit, Freightliner). **Not** exotic
or sports cars.

Static **HTML + hand-written CSS + vanilla JS**. No build step, no framework,
**no Bootstrap** (only Bootstrap Icons via CDN). Served over a local static server.

> **Read [HANDOFF.md](HANDOFF.md) first.** That is the real spec: design tokens,
> components, the client-driven rules you must not quietly undo, mobile
> breakpoints, and the open questions.

---

## Pages

Three pages. They live at the `3` names on purpose — the client's review link
points at `index3.html`, so renaming them would break it.

| File | Job |
|---|---|
| `index3.html` | Homepage — hero, nationwide delivery, trade-in, featured inventory, about, reviews |
| `inventory3.html` | Inventory / SRP — search, filters, card grid |
| `vehicle3.html` | Vehicle detail / VDP — gallery + video, price, specs, sticky lead form. Reads `?id=` |

```
css/
  home-blue.css   tokens (:root), nav, buttons, footer, film grain — loaded by every page
  srp.css         listing, plus shared nav--solid / modal / v-card
  topsearch.css   SRP search bar, filter bar, hero band, Passenger/Cargo picker
  card-cta.css    vehicle-card CTAs
  vdp.css         vehicle detail page
js/
  inventory-data.js   window.GM_INVENTORY — single source of truth for all 12 vans
  home-3.js           nav, drawer, hero, scroll reveals
  inventory-3.js      SRP filtering, sorting, chips, URL sync
  vehicle-3.js        VDP gallery, video, lightbox, sub-nav spy, forms
assets/img/         photos + the three logo variants
assets/video/       walkaround video
```

Header/footer are inlined per page (no fetched partials → no cache pitfalls).

---

## Design direction

Premium, light, **photography-led**. Clean card grids, generous whitespace,
soft shadows, tasteful motion. Brand blue is `--accent: #0A6CE0`.

**Avoid:** cluttered "classic dealership" template look; loud gradients; busy
borders; heavy payment-calculator widgets on cards (use a **Finance** button);
anything that reads cheap, spammy, or generic-CMS.

> Tie-breaker: when unsure, choose the **cleaner, more premium, more
> photography-led** option.

---

## Conventions

- **Brand via tokens.** Colours, fonts, radii all come from `:root` in
  `home-blue.css`. Never hard-code them in markup.
- **Mobile-first.** Verified at 375px and 360px. Never `height: 100vh` — use
  `100dvh`. Any flex/grid parent holding a horizontal scroller needs
  `min-width: 0`, or a `1fr` column takes its content's min-content width and
  blows the page out sideways (this exact bug once broke the VDP).
- **Preview:** `python3 -m http.server 8000` → http://localhost:8000/index3.html
  > ⚠️ The dev server sends no cache headers. After editing CSS/JS the browser
  > will serve a stale copy and you'll swear your change did nothing. Restart on
  > a **new port** each time, or hard-reload.

---

## History

Earlier page sets — the original teal design, and the `_2` blue demo the client
first reviewed — were removed from the working tree once `#3` became the only
thing we ship. They are preserved at the **`legacy-sets`** git tag:

```sh
git checkout legacy-sets -- index.html    # restore any old file
git show --stat legacy-sets               # see what was there
```

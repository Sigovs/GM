# GM Motors NY — Designer Handoff

**Live set:** `index3.html` · `inventory3.html` · `vehicle3.html` (the "#3" set).
Everything below describes **#3 only**. Older sets (`index2_2`/`inventory_2`/`vehicle_2`, and the original teal `index`/`inventory`/`vehicle`) are kept **on purpose** so the client can compare with what he saw before — do not delete or restyle them.

**Stack:** static HTML + hand-written CSS + vanilla JS. No build step, no framework, no Bootstrap on these pages (only Bootstrap Icons via CDN). Preview with `python3 -m http.server 8000` from the repo root.

> ⚠️ **The dev server sends no cache headers.** After editing CSS/JS the browser will happily serve a stale copy and you'll think your change did nothing. Restart the server on a **new port** each time (8000 → 8001 → …), or hard-reload.

---

## 1. What the product actually is

Pre-owned **van** dealership — Mercedes-Benz Sprinter, Ford Transit, Freightliner. **Not** exotic/sports cars. (The repo's `CLAUDE.md` still says "premium high-line" — it's stale. Trust this doc.)

Buyer's first decision is always **Passenger vs Cargo**. That's why the SRP leads with it.

Three pages:
| Page | Job |
|---|---|
| `index3.html` | Sell the dealership. Hero, nationwide delivery, trade-in, featured inventory, about, reviews. |
| `inventory3.html` (SRP) | Let people find a van fast. Search + filters + card grid. |
| `vehicle3.html` (VDP) | Sell one van. Gallery, video, price, specs, lead form. Reads `?id=` from the URL. |

---

## 2. Design tokens

All in `:root` in **`css/home-blue.css`**. Change colour here, never in markup.

```css
--ink:        #090D11   /* primary text, dark buttons */
--ink-soft:   #6A7680   /* secondary text */
--ink-faint:  #9aa3aa   /* hints, placeholders */

--bg:         #F6F7F8   /* page */
--surface:    #ffffff   /* cards */
--surface-2:  #ECEEF1   /* grey bands, chips */
--surface-3:  #E2E5E9
--dark:       #141A1F   /* footer, hero scrims */
--line:       rgba(9,13,17,.10)

--accent:      #0A6CE0  /* primary blue — CTAs, active states */
--accent-dark: #033F84  /* hover, navy */
--accent-light:#4F9BFF  /* eyebrows on dark */
--accent-soft: rgba(10,108,224,.14)

--r-sm:.3rem  --r:.45rem  --r-lg:.65rem  --r-xl:.9rem  --r-pill:100px
--ease: cubic-bezier(.16,1,.3,1)
--container: 1320px
--gutter: clamp(1.15rem, 4vw, 2.5rem)
```

**Type:** `Sora` (700/800) for display/headings, `Plus Jakarta Sans` (400–700) for body. Loaded from Google Fonts.

### ⚠️ Open question for you
The client's **real logo is `#1158a6` / `#47a8de`** (see `assets/img/logo-gm.svg`). The site accent is **`#0A6CE0`** — close, but not the same blue. Nobody has decided whether to retune the accent to match the logo. If you retune, change `--accent` / `--accent-dark` and check: primary buttons, active sub-nav chips, selected Passenger/Cargo tile, focus rings, hero eyebrows.

---

## 3. Logo

Three web assets, all derived from the client's `SVGLogo.svg`:

| File | Use |
|---|---|
| `assets/img/logo-gm.svg` | **Colour** lockup (dark-blue wordmark) — for light surfaces |
| `assets/img/logo-gm-light.svg` | **White wordmark** — for dark surfaces |
| `assets/img/logo-gm-mark.svg` | **Emblem only**, square 169×169 — favicon |

The **emblem is self-contained** (white "GM" sits on the blue rosette), so it works on any background. Only the *wordmark* needed a light variant.

Where each goes:
- `inventory3` / `vehicle3` nav (always white bg) → **colour**
- `index3` nav → carries **both**; swaps via `.is-scrolled` / `.is-open` (transparent over the dark hero → light; white nav → colour)
- **Every footer** (dark) → **light**

Aspect ratio is **3.09:1**. `.brand__img` is height-constrained (`height: clamp(55px,6.2vw,70px); width:auto`) — never set a fixed width.

The raw logo pack (EPS/PDF/social exports) is **gitignored** — it lives on Alex's machine only. Ask him if you need the source files.

---

## 4. SRP (`inventory3.html`)

### Layout
```
[ nav (solid white, fixed, 80px) ]
[ HERO BAND — full-bleed photo, dark scrim, ~300–420px ]
     INVENTORY
     Vans that earn their keep.
     12 vans available · …
   ┌──────────────────────────────┐  ← floats UP onto the hero (negative margin)
   │ 🔍 Search…                   │
   │ [🚐 Passenger 6][🚚 Cargo 6] │
   │ Year Make Model Price Miles  │  [All filters]  Clear all
   │ ┌── grey advanced panel ──┐  │
   └──────────────────────────────┘
[ 12 vehicles              Sort ▾ ]
[ active filter chips ]
[ card grid — 3 cols, full-bleed ]
```

### Rules — do not break these
1. **Filters lead.** The client explicitly had the old header block above the filters removed. The hero exists so the page isn't photo-less, but the filter card must stay physically on top of it.
2. **No background image behind the card grid.** He asked for one; it was deliberately refused — a photo behind photos kills card contrast and scanability. The hero band is the answer to "looks generic".
3. **Year / Price / Mileage are single dropdowns.** Not sliders. Not From/To pairs. He rejected both.
4. **The vehicle cards are approved — don't restyle them.**

### Passenger / Cargo picker (`.bodypick`)
Two tiles with **hand-drawn van silhouettes** (inline SVG in the markup):
- Passenger = van with a row of **side windows**
- Cargo = same van, **solid panel**, no side windows

The glass and wheel hubs are painted `fill="var(--van-bg)"`. `--van-bg` is set per-tile: `var(--surface)` normally, `var(--accent)` when selected. That's why the cutouts read correctly on both the white and the blue tile. **If you recolour the tiles, update `--van-bg` too or the windows will vanish.**

Behaviour: **independent toggles** — both can be on at once. Counts are faceted (other filters apply, the category itself doesn't). A tile that would return 0 is disabled. State lives in `?type=passenger,cargo`.

Category rule (in `js/inventory-3.js`): anything **without "Cargo"** in the body string carries people → Passenger Van, Crew Van, Luxury Conversion. Currently a clean 6 / 6 split.

---

## 5. VDP (`vehicle3.html`)

### Section order — numbers must match the sub-nav chips 1:1
| # | Section | id |
|---|---|---|
| 01 | About this van (Overview) | `#overview` |
| 02 | Specifications *(grey band)* | `#specs` |
| 03 | Video | `#video` |
| 04 | History & condition | `#history` |
| 05 | Financing & trade *(navy band)* | `#financing` |
| — | Keep shopping (related) | `#related` |

If you add or reorder a section, **renumber and update the sub-nav chips** — they were explicitly checked against each other.

### Sticky sub-nav (`.vdp-subnav`)
Sticks at `top: 80px`, directly under the fixed nav (also 80px — they must stay in sync). Contains:
`[vehicle title] [Overview][Specs][Video][History][Financing] ……… [$price][Get Today's Price]`
- Section chips are **black** (`btn--ink`) pills **with icons**; the **active** one turns accent blue.
- `Get Today's Price` is the **only** blue button — the single primary CTA, pinned right.
- The bar's content starts at the **gutter**, aligned with the "01/02/…" section numbers. Don't re-cap it to `--container` or the alignment breaks.

### Gallery
- Main stage 4:3. Thumbnail strip below (Aston-style): **5 visible on desktop**, arrows; **~3 + a peek on phones**, arrows hidden (native swipe).
- The **video** sits as the **2nd thumbnail** with a play badge — it's part of the media sequence, not a separate widget. Counter reads `2 / 33`.
- Video **starts muted** with a "Tap for sound" pill. Non-negotiable — autoplay with audio is blocked by browsers anyway.
- Clicking the main stage / "View all" opens a lightbox that also handles video.

### Texture / ambience
`body.has-texture` (on all three #3 pages):
- Film grain: `body::after`, `feTurbulence`, opacity **.06**, `mix-blend-mode: multiply`, fixed + `pointer-events:none`.
- VDP background gets three radial washes (blue key light top-right, navy fill left, floor shadow bottom).
- White surfaces get a hairline top highlight + navy-tinted shadow.

The client asked for "texture". Grain had been there since day one at `.035` — invisible. **The real fix was giving the page a light source, not adding texture.** Keep it subtle; if you strengthen the wash on `.vdp-band--grey`, the white Specs card loses its separation from the band (this was tried and reverted).

---

## 6. Data

`js/inventory-data.js` → `window.GM_INVENTORY` — **one shared array, used by every page and every version.** Adding fields is safe (old code ignores them); renaming or removing will break the old sets too.

```js
{ id, year, make, model, trim, price, mileage, drivetrain, transmission,
  body, color, engine, fuel, interior, stock,
  image,              // card / hero thumbnail
  images: [...],      // full gallery (optional)
  video: { src, poster },   // optional — drives the gallery video + Video section
  featured: true,
  status: "sold" | "pending"   // optional
}
```

**Media reality check:** only `sprinter753452` has real media (32 photos + `assets/video/CLAUDE.mp4`). **The other 11 vans use stock placeholder photos.** This is the single biggest thing holding the site back from looking like a real dealer — the client owes us photos.

---

## 7. Mobile

Verified at **375px and 360px** on all three pages: no horizontal overflow, 0 console errors.

Breakpoints that matter:
- `1240px` — VDP sub-nav drops the vehicle title (makes room for the chip row)
- `920px` — sub-nav chip row becomes **horizontally scrollable** (it is *not* hidden — hiding it left phones with no section nav); VDP grid → 1 column; sticky panel goes static
- `700px` — thumbnail arrows hidden, thumbs enlarge
- `620px` — Passenger/Cargo tiles stack vertically
- `560px` — sub-nav price hides (CTA stays)

**Rules:** never `height: 100vh` (use `100dvh`); anything holding a horizontal scroller needs `min-width: 0` on its flex/grid parent — a `1fr` column takes its content's min-content width and will blow out the page (this exact bug cost us the thumbnail strip once; fixed with `minmax(0, 1.55fr)` + `.vdp__left { min-width: 0 }`).

---

## 8. CSS files — and the scoping trap

| File | Loaded by |
|---|---|
| `home-blue.css` | **everything** (all #3 pages **and** the old `_2` set) — tokens, nav, buttons, footer, grain |
| `srp.css` | inventory3, vehicle3 (+ old sets) |
| `topsearch.css` | inventory3 (+ inventory_2) — search bar, filter bar, hero band, bodypick |
| `card-cta.css` | index3, inventory3 (+ old) |
| `vdp.css` | vehicle3 (+ vehicle.html, vehicle_2.html) |

🚨 **These files are shared with the older versions.** Editing an *existing* rule changes the old pages too — which defeats the point of keeping them for comparison.

**So: add new rules under #3-only hooks, don't modify shared ones.** The existing hooks:
`body.has-texture` · `.srp-main--hero` · `.srp-hero` · `.srp-searchcard` · `.bodypick` · `.vdp-subnav` · `.vdp-shead` · `.vdp-band` · `.vdp-videobox` · `.brand__img--light` / `--color`

After any CSS change, **open `inventory_2.html` and `vehicle.html` and confirm they still look the same.**

---

## 9. Known gaps / next up

1. **Photos for the other 11 vans** — blocking. Everything else is polish.
2. **Accent vs logo blue** — undecided (see §2).
3. **Consolidation** — once the client signs off on #3, rename it to `index/inventory/vehicle` and archive the old sets. Not done yet, deliberately.
4. `CLAUDE.md` still describes an exotic-car dealership. Stale — ignore it or rewrite it.
5. Make/Model selects in the filter bar have no `aria-label` (Year/Price/Mileage do). Minor a11y gap.

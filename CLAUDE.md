# GM Motors NY

Marketing + inventory website for **GM Motors NY**, a premium / high-line used
car dealership. Static **HTML + Bootstrap 5.3 — no build step, no framework.**
Loaded over a local server for development.

---

## ⭐ DESIGN DIRECTION — read before touching markup or CSS

The site must feel like a **premium luxury dealership** — clean, modern, and
confident, in the spirit of **MileOne's exotic / high-line inventory pages** and
the **Aston Martin Washington DC** used-inventory experience. Light theme.

**Emotional goal:** the visitor trusts this is a serious, high-end dealer and
finds it effortless to browse inventory, value a trade, or get financing.

### DO use
- **Light theme** — white / soft-grey surfaces, generous whitespace, air.
- **Large vehicle photography as the hero of every layout** — imagery leads.
- Refined, modern type; clear hierarchy; restrained accent colour.
- Clean card grids for inventory (big photo, tidy specs, quick actions).
- Clear, persistent CTAs: **Browse Inventory · Trade/Sell · Financing**.
- Subtle premium polish: soft shadows, smooth hovers, tasteful motion.

### Do NOT use
- Cluttered "classic dealership" template look; loud gradients; busy borders.
- Dark/archival/vintage styling (that's a *different* project).
- Heavy payment-calculator widgets on cards — use a **Finance** button instead.
- Anything that reads cheap, spammy, or generic-CMS.

> Tie-breaker: when unsure, choose the **cleaner, more premium, more
> photography-led** option.

---

## Pages (from brief)

1. **Homepage** (`index.html`)
   - Hero vehicle section (a current inventory vehicle)
   - "We Deliver Nationwide" messaging, prominent
   - Trade / Sell Your Vehicle — *simplified* lead form (not the full site form)
   - Featured Inventory carousel
   - About GM Motors NY
   - Instagram feed integration
   - Google Reviews (social proof)
   - CTAs throughout: Browse Inventory · Trade/Sell · Financing

2. **Inventory Listing** (`inventory.html`) — ref: Aston Martin DC used inventory
   - Search + filters at the top
   - Clean grid, large photos
   - **Finance** button (no payment calc on card)
   - Per-card quick actions: View Photos · Schedule Test Drive · Apply for
     Financing · Send to Phone

3. **Vehicle Detail / VDP** (`vehicle.html`) — ref: MileOne luxury VDPs
   - Large hero gallery (photography is the focal point)
   - Title · price · mileage · key specs above the fold
   - **Sticky** lead form + CTA while scrolling
   - Actions: Get Today's Price · Schedule Test Drive · Value Your Trade · Send to Phone
   - Highlights · grouped specs · history/condition · finance & trade messaging
   - Related vehicles at the bottom (keep shopping)

---

## Stack & structure

```
index.html         # Homepage
inventory.html     # Inventory listing
vehicle.html       # Vehicle detail (VDP)
css/
  theme.css        # brand tokens (override Bootstrap --bs-* vars) + custom bits
js/
  main.js          # small vanilla JS (nav, carousels init, forms, year)
assets/img/        # vehicle photos, logo, og image
```

- **Bootstrap 5.3.8** + **Bootstrap Icons 1.13.1** via jsDelivr CDN (pinned).
- Header/footer are inlined per page (no fetched partials → no cache pitfalls).

## Conventions
- **Bootstrap-first.** Reach for Bootstrap utilities/components before writing
  custom CSS. Keep `theme.css` lean.
- **Brand via tokens.** Re-skin through Bootstrap CSS variables (`--bs-primary`,
  `--bs-body-*`, etc.) and a few project tokens in `theme.css :root`. Don't
  hard-code colours/fonts in markup.
- Brand colours + logo are **placeholders** until the client provides them.
- Mobile-first and responsive; test the grid + VDP gallery on small screens.
- Preview over a local server: `python3 -m http.server 8124` → http://localhost:8124/

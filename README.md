# GM Motors NY

Website for a pre-owned **van** dealership (Sprinter · Transit · Freightliner).
Static HTML + hand-written CSS + vanilla JS. No build step, no framework.

## Pages
- `index3.html` — Homepage
- `inventory3.html` — Inventory listing (search, filters, grid)
- `vehicle3.html` — Vehicle detail page (VDP), reads `?id=`

## Run
```sh
python3 -m http.server 8000
# → http://localhost:8000/index3.html
```
The dev server sends no cache headers — after editing CSS/JS, restart on a new
port or hard-reload, otherwise you'll be looking at a stale copy.

## Docs
- **[HANDOFF.md](HANDOFF.md)** — the spec: design tokens, components, the
  client-driven rules that must not be undone, mobile breakpoints, open questions.
- [CLAUDE.md](CLAUDE.md) — short orientation for AI assistants.

Older page sets are preserved at the `legacy-sets` git tag.

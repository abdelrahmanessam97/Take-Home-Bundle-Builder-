# Bundle Builder

Responsive React/Vite prototype of a multi-step home security bundle builder based on the provided design. The experience centers on a 4-step builder, a live review panel, variant-aware product quantities, and save-for-later persistence.

## Deliverables checklist

| Requirement | Status |
| --- | --- |
| JSON product/catalog data | `src/data/catalog.json` |
| Clean clone + run instructions | See [Run locally](#run-locally) below |
| README covering decisions / unfinished work | This file |
| Bonus: backend API for catalog | `GET /api/catalog` (Vite locally; Vercel rewrite → static `catalog.json`; optional `npm run server`) |

## Run locally

From a clean clone:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal (typically `http://localhost:5173`).

That single command starts the UI **and** the catalog API at `GET /api/catalog` via a Vite middleware plugin. The app loads catalog data from that endpoint on startup, and falls back to the bundled JSON if the request fails.

### Other scripts

| Script | Purpose |
| --- | --- |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview the production build (also serves `/api/catalog`) |
| `npm run server` | Optional standalone Node API on port `3001` (`PORT` env overrides) |
| `npm run lint` | Lint with oxlint |

Standalone API (bonus / separate process):

```bash
npm run server
# → http://localhost:3001/api/catalog
```

## What this project does

- Recreates the bundle-builder flow from the screenshot/Figma as a two-column experience.
- Lets shoppers configure cameras, a plan, sensors, and extra protection in a 4-step accordion.
- Keeps the builder and review panel in sync as quantities change.
- Supports per-variant quantities for products with color options.
- Recalculates totals and savings live.
- Saves the current configuration to `localStorage` through "Save my system for later".
- Loads catalog content from `/api/catalog` (same JSON source of truth).

## UI overview

The running app follows the reference design as a side-by-side shopping flow:

- Left side: a 4-step builder accordion for cameras, plan, sensors, and extra protection.
- Right side: a live "Your security system" summary panel that updates instantly as the bundle changes.
- Product cards show the same main information expected in the design: badge, image, title, short description, variant options, quantity stepper, and pricing.
- The review panel groups selected items by category and shows quantities, pricing, savings, shipping, guarantee messaging, checkout, and save-for-later actions.

On smaller screens, the layout stacks vertically so the builder stays usable on tablets and phones.

## Handled cases / states

This prototype explicitly handles a number of UI and state edge cases:

- Empty state when no hardware products are selected.
- Review panel with no products selected:
  - shows an empty-state message,
  - keeps total at `$0.00`,
  - hides plan/shipping-only summary content until at least one hardware item exists,
  - disables checkout and save-for-later actions.
- Variant-aware product selection:
  - each color keeps its own quantity,
  - switching color updates the main product image,
  - the review panel uses the selected variant image.
- Synchronized quantity updates from both places:
  - product cards,
  - review panel line items.
- Mutually exclusive plan selection using the subscription `exclusiveGroup`.
- Save-for-later persistence to `localStorage`, including:
  - quantities,
  - active color per product,
  - currently open accordion step.
- Catalog load from API with silent fallback to bundled JSON.
- Responsive builder grid across breakpoints:
  - under `500px`: 1 column,
  - `500px+`: 2 columns,
  - `768px+`: 3 columns,
  - `900px–1195px`: 4 columns,
  - `1196px–1279px`: 5 columns,
  - `1280px+`: 2-column horizontal card layout.
- Responsive review panel layout:
  - stacked on small screens,
  - two equal sections on md/lg,
  - XL summary arranged to match the provided reference.
- Long product descriptions:
  - truncated safely in cards,
  - inline `Read more` / `Show less` handling.
- Accordion open/close behavior with reduced scroll jumping when expanding a section.

## Project structure

- `src/App.tsx` — App shell, catalog bootstrap, top-level layout.
- `src/hooks/useBundleState.ts` — Quantities, variants, accordion step, save/restore, notices.
- `src/lib/catalog.ts` — Catalog load helpers, pricing, review rows, totals.
- `src/types/catalog.ts` — Domain types.
- `src/data/catalog.json` — Source of truth for copy, products, pricing, variants, seeded state.
- `src/components/` — Builder accordion, product/plan cards, review panel, quantity stepper.
- `src/styles/` — Design tokens and review/plan styles.
- `server/index.mjs` — Optional standalone Node HTTP server for `GET /api/catalog`.
- `vite.config.ts` — React plugin + `/api/catalog` middleware for `dev` / `preview`.

## Business logic

### Shared state

The builder and review panel both read from the same state object created in `useBundleState()`. Quantity changes reflect immediately on both sides without duplicated state.

### Variant quantity model

Products with variants use line keys shaped like `productId::variantId` (e.g. `cam-v4::white`). Each color keeps its own quantity; the selected chip only controls which variant the card stepper edits.

### Review panel derivation

The review panel is derived from the quantity map: build lines → group by category → compute compare-at, total, and savings.

### Plan selection

Plans use an `exclusiveGroup` in the catalog so only one subscription can be active at once.

### Persistence

"Save my system for later" stores quantities, active variants, and the open accordion step in `localStorage`.

### Catalog API (bonus)

- Source of truth remains `src/data/catalog.json`.
- During `npm run dev` / `npm run preview`, Vite serves that file at `GET /api/catalog`.
- `npm run server` exposes the same endpoint on a standalone Node process (useful for demoing a separate backend).
- On **Vercel**, `vercel.json` rewrites `GET /api/catalog` → `/catalog.json` (copied into `public/` at build time), so the same client URL works in production with no Node server.
- The client calls `/api/catalog` on boot and falls back to the bundled JSON if the request fails.

## Why the code is structured this way

- JSON-driven catalog so content, pricing, badges, and seeded UI state change without rewriting markup.
- One shared hook because builder and review are two views of the same bundle.
- Pure helpers for pricing/review so logic stays predictable and easy to extend.
- Components stay mostly presentational: they receive data and actions rather than owning bundle rules.

## Decisions and tradeoffs

- Catalog lives in one JSON file; the bonus API serves that same file rather than introducing a database.
- Checkout is a placeholder confirmation — payment is outside take-home scope.
- Product imagery is served locally so a clean clone runs without external asset hosts.
- Clarity and correctness over premature optimization — the catalog is small and this is a prototype.
- Accordion animation uses CSS grid (`0fr` → `1fr`) instead of JS height measurement for simpler open/close motion.

## Unfinished / out of scope

- Real checkout / cart / payment integration.
- Authenticated accounts or server-side persistence of saved systems.
- Production CDN / image pipeline (local assets only).
- Full pixel-perfect parity audit against every Figma breakpoint (layout targets the reference; residual visual diffs may remain).
- Automated unit/e2e test suite.

## Notes / limitations

- Seeded starting configuration is defined in `src/data/catalog.json` and can be adjusted if the reference changes.
- Some product assets are local placeholders/exports rather than a production asset pipeline.

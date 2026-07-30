# Bundle Builder

Responsive React + Vite + TypeScript prototype of a multi-step home security **bundle builder** with a live **review panel**. Built as a production-style frontend take-home: data-driven JSON catalog, synced quantities, variant-aware selection, persistence, and an optional backend API.

---

## Deliverables

| Requirement | Status |
| --- | --- |
| React source | This repo |
| JSON catalog data | `src/data/catalog.json` |
| Run instructions (clean clone) | Below |
| README: decisions / unfinished | This file |
| Bonus backend API | `GET/PUT/POST /api/*` (Vite middleware + `npm run server` + Vercel adapters) |

---

## Run locally

From a clean clone:

```bash
npm install
npm run dev
```

Open the Vite URL in the terminal (usually `http://localhost:5173`).

`npm run dev` starts the UI **and** the API under `/api/*` (Vite middleware). The app boots from `GET /api/bootstrap`. If the API fails, you see an error screen with **Retry**.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server + API middleware |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build (API middleware included) |
| `npm run server` | Standalone API on port `3001` |
| `npm run lint` | oxlint |

---

## What the app looks like / does

### Layout

- **Desktop:** two columns — builder (left) + sticky review (right).
- **Tablet / phone:** stacks vertically; product grids adapt (1 → 2 → 3 → 4 → 5 columns by breakpoint; horizontal product cards at large widths).

### Builder (left) — 4-step accordion

1. **Choose your cameras** (open by default on first load)
2. **Choose your plan**
3. **Choose your sensors**
4. **Add extra protection**

Each step shows:

- `STEP X OF 4` eyebrow  
- Icon + title  
- **N selected** when that step has distinct products with qty &gt; 0  
- Chevron up/down  
- Expanded body with product or plan cards  
- **Next: …** button to advance (when provided)

Accordion behavior:

- Only one step open at a time (click header to open/close)
- Opening/closing uses a CSS height animation
- On mobile, the clicked header is **pinned in the viewport** during the animation so the page doesn’t jump while neighboring panels collapse/expand
- Scroll anchoring is disabled on the builder to avoid browser scroll fights

### Product cards

May include (from JSON — not every product has every field):

- Discount **badge**
- Product image (switches with selected color when variant images exist)
- Title + short description
- **Show more / Show less** when the description is long enough to truncate; short blurbs have no toggle
- Color **variant chips** (swatch + label) when variants exist
- **Quantity stepper** (add-only cart control at 0 on builder cards; − / qty / + when qty &gt; 0)
- Compare-at + active **pricing** (or FREE)
- **Selected** border when any variant of that product has qty &gt; 0

### Plan cards

- Icon, title, description, features, compare-at + monthly price  
- Select / Selected CTA  
- Mutual exclusion via `exclusiveGroup` (only one subscription plan at a time)

### Review panel (right) — “Your security system”

- Live list of selected lines, grouped: **Cameras / Sensors / Accessories / Plan**
- Each line: thumbnail (variant image when applicable), name, stepper (when adjustable), pricing  
- Shipping row when present in the bundle  
- Guarantee badge + copy  
- Financing pill  
- Compare-at total + active **total**  
- Savings callout when savings &gt; 0  
- **Checkout** + **Save my system for later**  
- Empty state when no hardware (cameras/sensors/accessories) is selected — totals `$0`, actions disabled  

Builder and review steppers stay **in sync**; totals recalculate on every quantity change.

---

## Interactions that work

| Interaction | Behavior |
| --- | --- |
| Variant chips | Each color has its **own** quantity (`productId::variantId`). Card stepper edits the **active** color only. Other colors stay in the review if qty &gt; 0. |
| Quantity steppers | On cards and review lines; shared state. |
| Accordion | Expand/collapse; Step 1 open on first visit (unless restored from save). |
| “N selected” | Counts distinct products in that step with any qty &gt; 0. |
| Live review | Lines, groups, totals, savings update immediately. |
| Show more / Show less | Only when description is truncated; labels from catalog meta. |
| Plan select | Toggles plan; clears other plans in the same `exclusiveGroup`. |
| Checkout | Validates, then `POST /api/checkout` (placeholder confirmation toast). Loading spinner on the button. |
| Save for later | Writes **localStorage**, then best-effort `PUT /api/bundle`. Spinner while saving. |

---

## Data model

Everything UI-facing is driven by `src/data/catalog.json`:

- `meta` — copy, labels, validation messages  
- `steps` — accordion steps  
- `products` — cards/plans (price, variants, badges, flags, etc.)  
- `initialQuantities` / `initialActiveVariants` — seed so first load matches the design (pre-filled review items)

Line keys:

```txt
productId            → no variants
productId::variantId → per-color quantity
```

### Seeded first load (example)

Includes items such as Cam v4, Cam Pan, sensors, hub, MicroSD, Cam Unlimited, and Fast Shipping — so the review panel is populated like the Figma without hardcoding markup.

---

## Persistence

1. **Required (assignment):** `localStorage` key `bundle-builder:saved-system`  
   Stores: quantities, active variants, open accordion step.  
2. The live bundle is **auto-written to localStorage** whenever quantities / variants / open step change, so a normal **page refresh** restores what you were building.  
3. On reload / return: **localStorage wins** over API/seed defaults.  
4. **Save my system for later** still shows a confirmation toast and best-effort syncs to `PUT /api/bundle` (bonus).

---

## Validation & loading UX

- **Boot:** full-page spinner while `GET /api/bootstrap` loads; error + Retry if it fails.  
- **Checkout blocked when:**
  - No hardware products selected, or  
  - Sensors are selected without **Wyze Sense Hub** (`requiredWhenStepSelected: "sensors"`)  
- Validation messages show in the review summary; failed checkout/save show error toasts; success shows success toasts.  
- Checkout/Save buttons show inline spinners and disable while a request is in flight.

---

## Responsive breakpoints (product grid)

| Viewport | Product columns / layout |
| --- | --- |
| &lt; 500px | 1 column |
| 500px+ | 2 columns |
| 768px+ | 3 columns |
| 900–1195px | 4 columns |
| 1196–1279px | 5 columns |
| ≥ 1280px | Side-by-side page; product cards go horizontal (2-col grid in builder) |

Review: stacks on small screens; two equal columns mid breakpoints; XL summary arranged for the Figma-style seal + totals layout.

---

## API (bonus)

Shared router: `server/api.mjs` (used by Vite, `npm run server`, and Vercel `api/*`).

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/bootstrap` | Catalog + seed/server bundle (**single boot request**) |
| `GET` | `/api/catalog` | Full catalog |
| `GET` | `/api/products` | All products |
| `GET` | `/api/products/:id` | One product |
| `GET` | `/api/steps` | Steps |
| `GET` | `/api/meta` | UI copy |
| `GET` | `/api/initial-state` | Seed quantities/variants |
| `GET` | `/api/bundle` | Server-saved or seed bundle |
| `PUT` | `/api/bundle` | Persist bundle on server |
| `POST` | `/api/checkout` | Placeholder order summary |

Boot uses one deduped `/api/bootstrap` call (avoids double-fetch under React Strict Mode).

---

## Project structure

```txt
src/
  App.tsx                 # Boot spinner/error, then shell
  components/
    BuilderAccordion.tsx  # 4-step accordion + scroll pin
    ProductCard.tsx       # Variants, show more/less, stepper
    PlanCard.tsx
    ReviewPanel.tsx       # Live summary, validation, actions
    QuantityStepper.tsx
    Spinner.tsx
    StepIcon.tsx
  hooks/useBundleState.ts # Shared bundle state + save/checkout
  lib/
    api.ts                # Fetch helpers
    catalog.ts            # Pricing/review helpers + boot load
    persistence.ts        # localStorage
    validation.ts         # Checkout rules
    lineKey.ts
  data/catalog.json       # Source of truth
  types/                  # All shared TS types
  styles/                 # Tokens, review, plan CSS
server/                   # Standalone Node API + shared router
api/                      # Vercel serverless adapters
```

---

## Decisions & tradeoffs

- **JSON-driven UI** — change products/copy/seed in `catalog.json` without rewriting components.  
- **localStorage first** for Save (assignment); API sync is bonus/best-effort.  
- **Catalog from API** on boot (`/api/bootstrap`) so the bonus backend is real; no silent bundled fallback for catalog.  
- **Derived review/totals** — not a second store; always matches quantities.  
- **Checkout** is a prototype confirmation, not payments.  
- Accordion scroll: continuous header pin during the CSS animation (especially important on phones).  
- Show more only when text is actually truncated (avoids a no-op toggle).

---

## Unfinished / out of scope

- Real payment / cart provider  
- Authenticated multi-user DB persistence  
- Full pixel-perfect audit against every Figma breakpoint  
- Automated unit/e2e test suite  

---

## Notes

- Adjust seed look in `src/data/catalog.json` → `initialQuantities` / `initialActiveVariants`.  
- After pulling API/middleware changes, restart `npm run dev`.  
- On Vercel, serverless file saves under `/tmp` are ephemeral; **localStorage** is what users rely on across visits in the browser.

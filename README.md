# Bundle Builder

Responsive React/Vite prototype of a multi-step home security bundle builder based on the provided design. The experience centers on a 4-step builder, a live review panel, variant-aware product quantities, and save-for-later persistence.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal after `npm run dev`.

## Other scripts

- Build: `npm run build`
- Preview production build: `npm run preview`

## What this project does

- Recreates the bundle-builder flow from the screenshot/Figma as a two-column experience.
- Lets shoppers configure cameras, a plan, sensors, and extra protection in a 4-step accordion.
- Keeps the builder and review panel in sync as quantities change.
- Supports per-variant quantities for products with color options.
- Recalculates totals and savings live.
- Saves the current configuration to `localStorage` through "Save my system for later".

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

- `src/App.tsx`
  - App shell and top-level layout. Creates one shared bundle state and passes it into the builder and review panel.
- `src/hooks/useBundleState.ts`
  - Main state and actions for quantities, active variants, open accordion step, save/restore, and checkout/save notices.
- `src/lib/catalog.ts`
  - Pure helpers for reading catalog data, formatting prices, counting selected products, building review rows, grouping rows, and computing totals.
- `src/types/catalog.ts`
  - Domain types for products, variants, steps, categories, and quantity keys.
- `src/data/catalog.json`
  - Source of truth for copy, product data, pricing, variants, seeded initial state, and UI metadata.
- `src/components/BuilderAccordion.tsx`
  - Renders the 4-step builder and decides whether a step shows product cards or plan cards.
- `src/components/ProductCard.tsx`
  - Camera/accessory product card with variant selection, description handling, pricing, and quantity controls.
- `src/components/PlanCard.tsx`
  - Plan selection card for mutually exclusive subscription choices.
- `src/components/ReviewPanel.tsx`
  - Live summary of selected items, grouped by category, with totals, shipping, guarantee copy, checkout, and save-for-later.
- `src/styles/tokens.css`
  - Shared design tokens for color, typography, spacing, radius, shadows, and breakpoints.

## Business logic

### Shared state

The builder and review panel both read from the same state object created in `useBundleState()`. That makes all quantity changes immediately reflect across both sides of the UI without duplicating state in multiple components.

### Variant quantity model

Products with variants are stored using line keys shaped like:

```txt
productId::variantId
```

Examples:

```txt
cam-v4::white
cam-v4::black
```

This structure was chosen so each color can keep its own quantity. The selected color chip only controls which variant the card stepper is editing; switching colors does not erase quantities already added for other variants.

### Review panel derivation

The review panel is not stored separately. It is derived from the current quantity map:

1. build review lines,
2. group them by category,
3. compute compare-at total, active total, and savings.

This keeps pricing and summary data consistent with the selected items at all times.

### Plan selection

Plans use an `exclusiveGroup` flag in the catalog so only one subscription can be active at once. Selecting one plan clears the others in that same group.

### Persistence

Clicking "Save my system for later" stores:

- selected quantities,
- active variant per product,
- currently open accordion step.

On the next visit, the app restores that saved state from `localStorage`.

## Why the code is structured this way

- The catalog is JSON-driven so product content, pricing, badges, variants, and seeded UI state can be changed without rewriting component markup.
- State is centralized in one hook because the builder and review panel are two views over the same bundle, not separate flows.
- Pricing and review rows are derived with pure helper functions so business logic stays predictable and easy to test or extend.
- Components stay mostly presentational: they receive data and actions rather than owning bundle rules themselves.

## Accessibility, performance, and best-practice polish

This project includes a lightweight polish pass aimed at frontend take-home quality:

- clearer keyboard focus styles,
- safer semantics for variant selection controls,
- larger touch targets for quantity steppers,
- lazy/async image decoding where appropriate,
- improved document metadata for a more complete browser/SEO surface.

## Decisions and tradeoffs

- The app uses a local JSON file instead of a backend because the assignment prioritizes UI behavior and interaction quality over API work.
- Checkout is a placeholder confirmation because payment flow is outside the take-home scope.
- Product imagery is served locally to keep the prototype self-contained and easy to run from a clean clone.
- The implementation favors clarity and correctness over premature optimization because the catalog is small and the submission is a prototype.

## Notes / limitations

- The prototype is optimized for the provided design and responsive behavior, but final visual fidelity should still be checked side-by-side against the original Figma.
- Some product assets are local placeholders/exports rather than a production asset pipeline.
- The seeded starting configuration is defined in `src/data/catalog.json` and can be adjusted if the reference screenshot changes.

import type { CatalogData, CatalogProduct, QuantityMap, ReviewCategory, StepId } from "../types/catalog";
import type { BundleTotals, ReviewGroup, ReviewLine } from "../types/review";
import type { BootstrapResponse, PersistedState } from "../types/bundle";
import { lineKey, parseLineKey } from "./lineKey";
import { fetchBootstrap, resetBootstrapCache } from "./api";

/** Populated only after a successful bootstrap / catalog load. */
export let catalogData: CatalogData | null = null;

export function setCatalogData(next: CatalogData) {
  catalogData = next;
}

export function requireCatalog(): CatalogData {
  if (!catalogData) {
    throw new Error("Catalog has not been loaded from the server yet");
  }
  return catalogData;
}

/** Shared across Strict Mode remounts so we only hit the network once per page load. */
let bootstrapLoadPromise: Promise<{ catalog: CatalogData; bundle: PersistedState }> | null = null;

/**
 * One request: GET /api/bootstrap → catalog + bundle.
 * Deduped for React Strict Mode double-mount.
 */
export function loadAppData(): Promise<{ catalog: CatalogData; bundle: PersistedState }> {
  if (!bootstrapLoadPromise) {
    bootstrapLoadPromise = fetchBootstrap()
      .then((data: BootstrapResponse) => {
        if (!data?.catalog?.products?.length || !data?.catalog?.steps?.length) {
          throw new Error("Bootstrap API returned incomplete catalog data");
        }
        if (!data.bundle?.quantities || !data.bundle?.activeVariants) {
          throw new Error("Bootstrap API returned incomplete bundle data");
        }
        setCatalogData(data.catalog);
        const bundle: PersistedState = {
          quantities: { ...data.bundle.quantities },
          activeVariants: { ...data.bundle.activeVariants },
          openStepId: data.bundle.openStepId ?? "cameras",
        };
        return { catalog: data.catalog, bundle };
      })
      .catch((error: unknown) => {
        bootstrapLoadPromise = null;
        resetBootstrapCache();
        throw error;
      });
  }
  return bootstrapLoadPromise;
}

/** Allow Retry to fetch again after a failed boot. */
export function resetAppDataLoad() {
  bootstrapLoadPromise = null;
  resetBootstrapCache();
  catalogData = null;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getProduct(productId: string): CatalogProduct | undefined {
  return requireCatalog().products.find((p) => p.id === productId);
}

export function productsForStep(stepId: StepId): CatalogProduct[] {
  return requireCatalog().products.filter((p) => p.stepId === stepId && !p.hideInBuilder);
}

export function getLineQuantity(quantities: QuantityMap, productId: string, variantId?: string | null): number {
  return quantities[lineKey(productId, variantId)] ?? 0;
}

/** Distinct products in a step with any variant qty > 0 */
export function selectedProductCount(quantities: QuantityMap, stepId: StepId): number {
  const ids = new Set<string>();
  for (const [key, qty] of Object.entries(quantities)) {
    if (qty <= 0) continue;
    const { productId } = parseLineKey(key);
    const product = getProduct(productId);
    if (product?.stepId === stepId) ids.add(productId);
  }
  return ids.size;
}

export function getProductSelectedQuantity(quantities: QuantityMap, productId: string): number {
  let total = 0;
  for (const [key, qty] of Object.entries(quantities)) {
    if (qty <= 0) continue;
    const parsed = parseLineKey(key);
    if (parsed.productId === productId) total += qty;
  }
  return total;
}

export type { ReviewLine } from "../types/review";

const CATEGORY_ORDER: ReviewCategory[] = ["cameras", "sensors", "accessories", "plan"];

export function buildReviewLines(quantities: QuantityMap): ReviewLine[] {
  const lines: ReviewLine[] = [];

  for (const [key, quantity] of Object.entries(quantities)) {
    if (quantity <= 0) continue;
    const { productId, variantId } = parseLineKey(key);
    const product = getProduct(productId);
    if (!product) continue;

    const variant = product.variants?.find((v) => v.id === variantId) ?? null;
    const unitPrice = product.isFree ? 0 : product.price;
    const unitCompareAt = product.compareAt ?? null;
    const lineTotal = unitPrice * quantity;
    const lineCompareAt = unitCompareAt != null ? unitCompareAt * quantity : null;

    const displayName = variant && product.variants && product.variants.length > 0 ? `${product.name} · ${variant.label}` : product.name;

    lines.push({
      key,
      product,
      variantId,
      variantLabel: variant?.label ?? null,
      image: variant?.image ?? product.image,
      quantity,
      unitPrice,
      unitCompareAt,
      lineTotal,
      lineCompareAt,
      displayName,
    });
  }

  return lines.sort((a, b) => {
    const catalog = requireCatalog();
    const cat = CATEGORY_ORDER.indexOf(a.product.category) - CATEGORY_ORDER.indexOf(b.product.category);
    if (cat !== 0) return cat;
    const orderA = catalog.products.findIndex((p) => p.id === a.product.id);
    const orderB = catalog.products.findIndex((p) => p.id === b.product.id);
    return orderA - orderB;
  });
}

export function groupReviewLines(
  lines: ReviewLine[],
  labels: Record<ReviewCategory, string> = {
    cameras: "Cameras",
    sensors: "Sensors",
    accessories: "Accessories",
    plan: "Plan",
  },
): ReviewGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: labels[category],
    lines: lines.filter((l) => l.product.category === category),
  })).filter((g) => g.lines.length > 0);
}

export function computeTotals(lines: ReviewLine[]): BundleTotals {
  const total = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const compareAt = lines.reduce((sum, l) => {
    if (l.product.includeCompareInTotal === false) {
      return sum + l.lineTotal;
    }
    const base = l.lineCompareAt ?? l.lineTotal;
    return sum + base;
  }, 0);
  const savings = Math.max(0, compareAt - total);
  return { total, compareAt, savings };
}

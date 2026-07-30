import fallbackCatalog from "../data/catalog.json";
import type { CatalogData, CatalogProduct, QuantityMap, ReviewCategory, StepId } from "../types/catalog";
import { lineKey, parseLineKey } from "../types/catalog";

/** Bundled fallback so the app still runs if the API is unavailable. */
export let catalogData = fallbackCatalog as unknown as CatalogData;

export function setCatalogData(next: CatalogData) {
  catalogData = next;
}

/** Shared across Strict Mode remounts so we only hit the network once per page load. */
let catalogPromise: Promise<CatalogData> | null = null;

/** Prefer `/api/catalog` (Vite middleware or standalone server); fall back to bundled JSON. */
export function loadCatalog(): Promise<CatalogData> {
  if (!catalogPromise) {
    catalogPromise = fetchCatalog();
  }
  return catalogPromise;
}

async function fetchCatalog(): Promise<CatalogData> {
  try {
    const response = await fetch("/api/catalog");
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
    const data = (await response.json()) as CatalogData;
    if (!data?.products?.length || !data?.steps?.length) {
      throw new Error("Catalog API returned incomplete data");
    }
    setCatalogData(data);
    return data;
  } catch {
    // Allow a later retry after a failed load (e.g. API came up after first attempt).
    catalogPromise = null;
    return catalogData;
  }
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getProduct(productId: string): CatalogProduct | undefined {
  return catalogData.products.find((p) => p.id === productId);
}

export function productsForStep(stepId: StepId): CatalogProduct[] {
  return catalogData.products.filter((p) => p.stepId === stepId && !p.hideInBuilder);
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

export interface ReviewLine {
  key: string;
  product: CatalogProduct;
  variantId: string | null;
  variantLabel: string | null;
  image: string;
  quantity: number;
  unitPrice: number;
  unitCompareAt: number | null;
  lineTotal: number;
  lineCompareAt: number | null;
  displayName: string;
}

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
    const cat = CATEGORY_ORDER.indexOf(a.product.category) - CATEGORY_ORDER.indexOf(b.product.category);
    if (cat !== 0) return cat;
    const orderA = catalogData.products.findIndex((p) => p.id === a.product.id);
    const orderB = catalogData.products.findIndex((p) => p.id === b.product.id);
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
): { category: ReviewCategory; label: string; lines: ReviewLine[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: labels[category],
    lines: lines.filter((l) => l.product.category === category),
  })).filter((g) => g.lines.length > 0);
}

export function computeTotals(lines: ReviewLine[]) {
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

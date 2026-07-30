import { readCatalog } from "./catalog.mjs";
import { readSavedBundle, writeSavedBundle } from "./bundle-store.mjs";

/**
 * Shared API router used by the Node server, Vite middleware, and Vercel adapters.
 * @returns {{ status: number, body: unknown } | null} null = not an API route
 */
export function handleApi(method, pathname, body) {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (method === "GET" && path === "/api/catalog") {
    return { status: 200, body: readCatalog() };
  }

  if (method === "GET" && path === "/api/bootstrap") {
    const catalog = readCatalog();
    const saved = readSavedBundle();
    const bundle = saved
      ? { ...saved, source: "saved" }
      : {
          quantities: catalog.initialQuantities,
          activeVariants: catalog.initialActiveVariants,
          openStepId: "cameras",
          source: "initial",
        };
    return { status: 200, body: { catalog, bundle } };
  }

  if (method === "GET" && path === "/api/products") {
    const catalog = readCatalog();
    return { status: 200, body: catalog.products };
  }

  if (method === "GET" && path.startsWith("/api/products/")) {
    const id = decodeURIComponent(path.slice("/api/products/".length));
    const product = readCatalog().products.find((p) => p.id === id);
    if (!product) return { status: 404, body: { error: "Product not found" } };
    return { status: 200, body: product };
  }

  if (method === "GET" && path === "/api/steps") {
    return { status: 200, body: readCatalog().steps };
  }

  if (method === "GET" && path === "/api/meta") {
    return { status: 200, body: readCatalog().meta };
  }

  if (method === "GET" && path === "/api/initial-state") {
    const catalog = readCatalog();
    return {
      status: 200,
      body: {
        quantities: catalog.initialQuantities,
        activeVariants: catalog.initialActiveVariants,
        openStepId: "cameras",
      },
    };
  }

  if (method === "GET" && path === "/api/bundle") {
    const saved = readSavedBundle();
    if (!saved) {
      const catalog = readCatalog();
      return {
        status: 200,
        body: {
          quantities: catalog.initialQuantities,
          activeVariants: catalog.initialActiveVariants,
          openStepId: "cameras",
          source: "initial",
        },
      };
    }
    return { status: 200, body: { ...saved, source: "saved" } };
  }

  if (method === "PUT" && path === "/api/bundle") {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid bundle payload" } };
    }
    const quantities = body.quantities && typeof body.quantities === "object" ? body.quantities : {};
    const activeVariants =
      body.activeVariants && typeof body.activeVariants === "object" ? body.activeVariants : {};
    const openStepId = body.openStepId ?? "cameras";
    const saved = writeSavedBundle({ quantities, activeVariants, openStepId, savedAt: new Date().toISOString() });
    return { status: 200, body: { ok: true, ...saved } };
  }

  if (method === "POST" && path === "/api/checkout") {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid checkout payload" } };
    }
    const catalog = readCatalog();
    const quantities = body.quantities && typeof body.quantities === "object" ? body.quantities : {};
    const lines = Object.entries(quantities)
      .filter(([, qty]) => Number(qty) > 0)
      .map(([key, quantity]) => {
        const [productId, variantId] = key.split("::");
        const product = catalog.products.find((p) => p.id === productId);
        const unitPrice = product?.isFree ? 0 : (product?.price ?? 0);
        return {
          key,
          productId,
          variantId: variantId ?? null,
          name: product?.name ?? productId,
          quantity: Number(quantity),
          unitPrice,
          lineTotal: unitPrice * Number(quantity),
        };
      });
    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    return {
      status: 200,
      body: {
        ok: true,
        orderId: `order_${Date.now()}`,
        lines,
        total,
        message: catalog.meta.checkoutNotice,
      },
    };
  }

  if (path.startsWith("/api/")) {
    return { status: 404, body: { error: "Not found" } };
  }

  return null;
}

export function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

/** Connect/Node-compatible request handler. Returns true if the request was handled. */
export async function handleNodeRequest(req, res) {
  const method = req.method || "GET";
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) return false;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  let body = null;
  if (method === "PUT" || method === "POST") {
    body = await readJsonBody(req);
  }

  const result = handleApi(method, pathname, body);
  if (!result) return false;
  sendJson(res, result.status, result.body);
  return true;
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (!chunks.length) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

import { handleApi } from "../server/api.mjs";

/**
 * Dynamic product route: /api/products/:id
 * Vercel file: api/products/[id].js → pathname like /api/products/cam-v4
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const id = req.query?.id;
  const pathname = id ? `/api/products/${id}` : "/api/products";
  const result = handleApi(req.method || "GET", pathname, null);

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(result.status).json(result.body);
}

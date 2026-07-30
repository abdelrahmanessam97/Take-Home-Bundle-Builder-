import { handleApi } from "../server/api.mjs";

function getPath(req) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  // Vercel may mount as /api/catalog.js → url pathname is /api/catalog
  return url.pathname.replace(/\/+$/, "") || "/";
}

async function readBody(req) {
  if (req.body != null) {
    return typeof req.body === "string" ? JSON.parse(req.body || "null") : req.body;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const pathname = getPath(req);
  const body = req.method === "PUT" || req.method === "POST" ? await readBody(req) : null;
  const result = handleApi(req.method || "GET", pathname, body);

  if (!result) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(result.status).json(result.body);
}

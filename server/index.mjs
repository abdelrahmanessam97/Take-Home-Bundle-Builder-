import http from "node:http";
import { handleNodeRequest } from "./api.mjs";

const port = Number(process.env.PORT) || 3001;

const server = http.createServer(async (req, res) => {
  const handled = await handleNodeRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(port, () => {
  console.log(`Bundle Builder API on http://localhost:${port}`);
  console.log("  GET  /api/bootstrap");
  console.log("  GET  /api/catalog");
  console.log("  GET  /api/products");
  console.log("  GET  /api/products/:id");
  console.log("  GET  /api/steps");
  console.log("  GET  /api/meta");
  console.log("  GET  /api/initial-state");
  console.log("  GET  /api/bundle");
  console.log("  PUT  /api/bundle");
  console.log("  POST /api/checkout");
});

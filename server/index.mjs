import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, "../src/data/catalog.json");
const port = Number(process.env.PORT) || 3001;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/api/catalog" || req.url === "/api/catalog/")) {
    fs.readFile(catalogPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read catalog" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Catalog API listening on http://localhost:${port}/api/catalog`);
});

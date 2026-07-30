import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(rootDir, "src/data/catalog.json");
const publicCatalogPath = path.resolve(rootDir, "public/catalog.json");

/** Keep public/catalog.json in sync so Vercel can rewrite /api/catalog → /catalog.json. */
function syncPublicCatalog() {
  fs.mkdirSync(path.dirname(publicCatalogPath), { recursive: true });
  fs.copyFileSync(catalogPath, publicCatalogPath);
}

/** Serves GET /api/catalog from the same JSON file used by the app. */
function catalogApiPlugin(): Plugin {
  return {
    name: "catalog-api",
    buildStart() {
      syncPublicCatalog();
    },
    configureServer(server) {
      syncPublicCatalog();
      server.middlewares.use("/api/catalog", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        fs.createReadStream(catalogPath).pipe(res);
      });
    },
    configurePreviewServer(server) {
      syncPublicCatalog();
      server.middlewares.use("/api/catalog", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        fs.createReadStream(catalogPath).pipe(res);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), catalogApiPlugin()],
});

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(rootDir, "src/data/catalog.json");

/** Serves GET /api/catalog from the same JSON file used by the app. */
function catalogApiPlugin(): Plugin {
  return {
    name: "catalog-api",
    configureServer(server) {
      server.middlewares.use("/api/catalog", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        fs.createReadStream(catalogPath).pipe(res);
      });
    },
    configurePreviewServer(server) {
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

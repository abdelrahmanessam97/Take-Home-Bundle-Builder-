import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const catalogPath = path.resolve(rootDir, "src/data/catalog.json");

export function readCatalog() {
  const raw = fs.readFileSync(catalogPath, "utf8");
  return JSON.parse(raw);
}

export function getCatalogPath() {
  return catalogPath;
}

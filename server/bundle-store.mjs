import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/** Vercel serverless FS is read-only except /tmp. */
function bundlePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "bundle-builder-saved.json");
  }
  const dir = path.resolve(rootDir, "server/data");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "saved-bundle.json");
}

export function readSavedBundle() {
  try {
    const raw = fs.readFileSync(bundlePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeSavedBundle(payload) {
  fs.writeFileSync(bundlePath(), JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

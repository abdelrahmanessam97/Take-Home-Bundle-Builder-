import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

type ApiHandler = (req: unknown, res: unknown) => Promise<boolean>;

async function loadApiHandler(): Promise<ApiHandler> {
  // @ts-expect-error plain ESM server module without generated types
  const mod = await import("./server/api.mjs");
  return mod.handleNodeRequest as ApiHandler;
}

/** Serves all /api/* routes from the shared Node API during vite/preview. */
function catalogApiPlugin(): Plugin {
  let handleNodeRequest: ApiHandler | null = null;

  return {
    name: "bundle-builder-api",
    async configureServer(server) {
      handleNodeRequest = await loadApiHandler();
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleNodeRequest!(req, res);
          if (!handled) next();
        } catch (error) {
          next(error);
        }
      });
    },
    async configurePreviewServer(server) {
      handleNodeRequest = await loadApiHandler();
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleNodeRequest!(req, res);
          if (!handled) next();
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), catalogApiPlugin()],
});

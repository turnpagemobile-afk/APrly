import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import type { PluginOption, UserConfig } from "vite";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { aprlyDevMultiAppProxy } from "./vite-plugin-aprly-dev-proxy";

export type AprlyAppKind = "landing" | "cabinet" | "admin" | "mono";

export interface AprlyViteOptions {
  kind: AprlyAppKind;
  /** Vite `base` (e.g. `/`, `/dashboard/`, `/admin/`). */
  base: string;
  /** HTML entry relative to artifacts/aprly. */
  htmlEntry: string;
  /** JS entry relative to artifacts/aprly. */
  jsEntry: string;
  /** Output folder under artifacts/aprly/dist/ */
  outDirName: string;
  enablePwa: boolean;
}

function requirePort(): number {
  const rawPort = process.env.PORT;
  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
  return port;
}

async function replitPlugins(): Promise<PluginOption[]> {
  if (process.env.NODE_ENV === "production" || process.env.REPL_ID === undefined) {
    return [];
  }
  return [
    await import("@replit/vite-plugin-cartographer").then((m) =>
      m.cartographer({
        root: path.resolve(import.meta.dirname, ".."),
      }),
    ),
    await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
  ];
}

export async function createAprlyViteConfig(
  options: AprlyViteOptions,
): Promise<UserConfig> {
  const rootDir = path.resolve(import.meta.dirname);
  const port = requirePort();
  const base = options.base.endsWith("/") ? options.base : `${options.base}/`;

  const devPublicOrigin = process.env.VITE_DEV_PUBLIC_ORIGIN;

  const plugins: PluginOption[] = [
    ...(options.kind === "landing" && process.env.DEV_APPS_PROXY === "1"
      ? [aprlyDevMultiAppProxy()]
      : []),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(await replitPlugins()),
  ];

  if (options.enablePwa) {
    plugins.push(
      VitePWA({
        manifest: false,
        injectRegister: false,
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.svg",
          "icons/icon-192.png",
          "icons/icon-512.png",
          "icons/apple-touch-icon-180.png",
          "manifest-cabinet.webmanifest",
          "offline-dashboard.html",
        ],
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,webmanifest}"],
          navigateFallback: "index.html",
          navigateFallbackAllowlist: [/^\/dashboard/],
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.method === "GET" && url.pathname.startsWith("/api/"),
              handler: "NetworkOnly",
            },
          ],
        },
      }),
    );
  }

  // Each dev server must have its own pre-bundle cache (shared .vite/deps → 504 Outdated Optimize Dep).
  const cacheDir = path.resolve(rootDir, `.vite-${options.kind}`);

  return {
    base,
    cacheDir,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
        "@assets": path.resolve(rootDir, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: rootDir,
    build: {
      outDir: path.resolve(rootDir, "dist", options.outDirName),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(rootDir, options.htmlEntry),
        },
      },
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: { strict: true },
      ...(options.kind !== "landing" &&
      process.env.DEV_APPS_PROXY === "1" &&
      devPublicOrigin
        ? { origin: devPublicOrigin }
        : {}),
      proxy: {
        "/api": {
          target:
            process.env["VITE_API_PROXY_TARGET"] ?? "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
    define: {
      __APRLY_APP__: JSON.stringify(options.kind),
    },
  };
}

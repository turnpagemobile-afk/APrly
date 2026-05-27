import { defineConfig } from "vite";
import { createAprlyViteConfig } from "./vite.shared";

/** Single dev server — all routes on :5173 (Docker / local). Production uses split builds. */
export default defineConfig(async () =>
  createAprlyViteConfig({
    kind: "mono",
    base: "/",
    htmlEntry: "index.html",
    jsEntry: "src/apps/mono/main.tsx",
    outDirName: "mono",
    enablePwa: true,
  }),
);

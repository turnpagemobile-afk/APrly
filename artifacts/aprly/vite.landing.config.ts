import { defineConfig } from "vite";
import { createAprlyViteConfig } from "./vite.shared";

export default defineConfig(async () =>
  createAprlyViteConfig({
    kind: "landing",
    base: "/",
    htmlEntry: "index.landing.html",
    jsEntry: "src/apps/landing/main.tsx",
    outDirName: "landing",
    enablePwa: false,
  }),
);

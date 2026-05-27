import { defineConfig } from "vite";
import { createAprlyViteConfig } from "./vite.shared";

export default defineConfig(async () =>
  createAprlyViteConfig({
    kind: "cabinet",
    base: "/dashboard/",
    htmlEntry: "cabinet.html",
    jsEntry: "src/apps/cabinet/main.tsx",
    outDirName: "cabinet",
    enablePwa: true,
  }),
);

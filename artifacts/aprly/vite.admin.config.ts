import { defineConfig } from "vite";
import { createAprlyViteConfig } from "./vite.shared";

export default defineConfig(async () =>
  createAprlyViteConfig({
    kind: "admin",
    base: "/admin/",
    htmlEntry: "admin.html",
    jsEntry: "src/apps/admin/main.tsx",
    outDirName: "admin",
    enablePwa: false,
  }),
);

#!/usr/bin/env node
/**
 * Fail if CSS uses @apply with custom dash-* component classes.
 * Tailwind v4 treats those as unknown utilities at build time.
 *
 *   pnpm --filter @workspace/aprly run check:tailwind-apply
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const APRY_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = join(APRY_ROOT, "src");

/** Matches dash-* tokens inside @apply ... ; blocks */
const APPLY_DASH_RE = /@apply[^;]*\bdash-[a-z0-9-]+/gi;

function walkCss(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walkCss(path, out);
    } else if (name.endsWith(".css")) {
      out.push(path);
    }
  }
  return out;
}

const violations = [];

for (const file of walkCss(SRC)) {
  const content = readFileSync(file, "utf8");
  const rel = relative(APRY_ROOT, file);
  for (const match of content.matchAll(APPLY_DASH_RE)) {
    violations.push({ file: rel, snippet: match[0].trim() });
  }
}

if (violations.length > 0) {
  console.error("[check:tailwind-apply] Custom dash-* classes in @apply are not allowed (Tailwind v4):\n");
  for (const { file, snippet } of violations) {
    console.error(`  ${file}\n    ${snippet}\n`);
  }
  console.error("Expand to built-in utilities or use the class in TSX instead.");
  process.exit(1);
}

console.log("[check:tailwind-apply] OK — no @apply dash-* violations");

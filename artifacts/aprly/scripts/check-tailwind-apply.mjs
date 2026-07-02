#!/usr/bin/env node
/**
 * Fail if CSS uses @apply with custom project classes.
 * Tailwind v4 treats those as unknown utilities at build time.
 *
 *   pnpm --filter @workspace/aprly run check:tailwind-apply
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const APRY_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = join(APRY_ROOT, "src");

const APPLY_BLOCK_RE = /@apply[^;]+;/gi;

const FORBIDDEN_IN_APPLY = [
  { re: /\bdash-[a-z0-9-]+/i, label: "dash-*" },
  { re: /\bapp-[a-z0-9-]+/i, label: "app-*" },
  {
    re: /\btext-(hint|title|average|action|neutral-000|secondary-300)\b/i,
    label: "semantic text-*",
  },
];

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
  for (const block of content.matchAll(APPLY_BLOCK_RE)) {
    const snippet = block[0].trim();
    for (const { re, label } of FORBIDDEN_IN_APPLY) {
      if (re.test(snippet)) {
        violations.push({ file: rel, snippet, label });
        break;
      }
    }
  }
}

if (violations.length > 0) {
  console.error(
    "[check:tailwind-apply] Custom project classes in @apply are not allowed (Tailwind v4):\n",
  );
  for (const { file, snippet, label } of violations) {
    console.error(`  ${file} (${label})\n    ${snippet}\n`);
  }
  console.error(
    "Expand to built-in utilities, use the class in TSX, or use raw CSS properties instead.",
  );
  process.exit(1);
}

console.log("[check:tailwind-apply] OK — no @apply custom-class violations");

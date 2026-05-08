#!/usr/bin/env node
/**
 * Builds artifacts/aprly/src/styles/theme-tokens.css from the two
 * Figma W3C Design Tokens files in local_docs/. Re-run when the
 * designer ships an updated palette.
 *
 *   pnpm --filter @workspace/aprly run tokens
 *
 * Inputs:
 *   - <repo>/local_docs/Light theme.tokens.json
 *   - <repo>/local_docs/Dark theme.tokens.json
 *
 * Output:
 *   - artifacts/aprly/src/styles/theme-tokens.css
 *     :root  block holds the light values
 *     .dark  block holds the dark values
 *
 * Why this layer exists: shadcn/ui semantic names (--background, --primary…)
 * are mapped to these design tokens in src/index.css. Components keep using
 * regular Tailwind classes (`bg-background`, `text-foreground`); we just
 * reroute the values.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APRLY_ROOT = resolve(HERE, "..");
const REPO_ROOT = resolve(APRLY_ROOT, "..", "..");

const LIGHT_PATH = join(REPO_ROOT, "local_docs", "Light theme.tokens.json");
const DARK_PATH = join(REPO_ROOT, "local_docs", "Dark theme.tokens.json");
const OUT_PATH = join(APRLY_ROOT, "src", "styles", "theme-tokens.css");

function clamp01(v) {
  if (typeof v !== "number" || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function componentsToHex(components) {
  const [r, g, b] = components.map((c) => Math.round(clamp01(c) * 255));
  const hex = [r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()}`;
}

function isLeafToken(node) {
  return (
    node !== null &&
    typeof node === "object" &&
    !Array.isArray(node) &&
    typeof node.$type === "string" &&
    node.$value !== undefined
  );
}

function flattenTokens(tree, out = new Map(), warnings = []) {
  if (tree === null || typeof tree !== "object" || Array.isArray(tree)) return out;
  for (const [key, node] of Object.entries(tree)) {
    if (isLeafToken(node)) {
      if (out.has(key)) {
        warnings.push(`duplicate token name "${key}" — last one wins`);
      }
      out.set(key, node);
    } else if (node !== null && typeof node === "object") {
      flattenTokens(node, out, warnings);
    }
  }
  return out;
}

function tokenToCssValue(name, token) {
  if (token.$type !== "color") {
    throw new Error(`Token "${name}": unsupported $type "${token.$type}"`);
  }
  const value = token.$value;
  if (!value || typeof value !== "object") {
    throw new Error(`Token "${name}": missing $value`);
  }

  const alpha = typeof value.alpha === "number" ? value.alpha : 1;
  const components = Array.isArray(value.components) ? value.components : null;

  if (alpha >= 0.999) {
    if (typeof value.hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(value.hex)) {
      return value.hex.toUpperCase();
    }
    if (components && components.length >= 3) {
      return componentsToHex(components);
    }
    throw new Error(`Token "${name}": cannot derive hex value`);
  }

  if (!components || components.length < 3) {
    throw new Error(`Token "${name}": cannot derive rgba (no components)`);
  }
  const [r, g, b] = components.map((c) => Math.round(clamp01(c) * 255));
  const a = Math.round(alpha * 1000) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function readTokens(path) {
  const raw = readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    throw new Error(`Tokens file is not an object: ${path}`);
  }
  return json;
}

function assertSameKeySet(lightMap, darkMap) {
  const onlyLight = [...lightMap.keys()].filter((k) => !darkMap.has(k));
  const onlyDark = [...darkMap.keys()].filter((k) => !lightMap.has(k));
  if (onlyLight.length || onlyDark.length) {
    const msg = [
      "Token key mismatch between Light and Dark files.",
      onlyLight.length ? `Only in Light: ${onlyLight.join(", ")}` : "",
      onlyDark.length ? `Only in Dark: ${onlyDark.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    throw new Error(msg);
  }
}

function buildBlock(selector, tokenMap) {
  const lines = [`${selector} {`];
  let lastGroup = null;
  for (const [name, token] of tokenMap) {
    const value = tokenToCssValue(name, token);
    const group = name.split("-")[0] || "_";
    if (group !== lastGroup) {
      if (lastGroup !== null) lines.push("");
      lines.push(`  /* === ${group} === */`);
      lastGroup = group;
    }
    lines.push(`  --${name}: ${value};`);
  }
  lines.push("}");
  return lines.join("\n");
}

function main() {
  const lightWarnings = [];
  const darkWarnings = [];
  const light = flattenTokens(readTokens(LIGHT_PATH), new Map(), lightWarnings);
  const dark = flattenTokens(readTokens(DARK_PATH), new Map(), darkWarnings);
  for (const w of lightWarnings) console.warn(`[tokens][light] ${w}`);
  for (const w of darkWarnings) console.warn(`[tokens][dark] ${w}`);
  assertSameKeySet(light, dark);

  const banner = [
    "/**",
    " * AUTO-GENERATED. Do not edit by hand.",
    " * Source: local_docs/{Light,Dark} theme.tokens.json",
    " * Regenerate: pnpm --filter @workspace/aprly run tokens",
    " */",
    "",
  ].join("\n");

  const css = `${banner}\n${buildBlock(":root", light)}\n\n${buildBlock(".dark", dark)}\n`;

  if (!existsSync(dirname(OUT_PATH))) mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, css, "utf8");

  const count = light.size;
  console.log(`[tokens] wrote ${OUT_PATH}`);
  console.log(`[tokens] ${count} tokens × 2 themes (:root + .dark)`);
}

main();

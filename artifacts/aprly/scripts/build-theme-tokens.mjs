#!/usr/bin/env node
/**
 * Builds theme-tokens.css from committed Figma tokens in artifacts/aprly/design-tokens/.
 *
 *   pnpm --filter @workspace/aprly run tokens
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APRLY_ROOT = resolve(HERE, "..");
const TOKEN_ROOT = join(APRLY_ROOT, "design-tokens");
const OUT_PATH = join(APRLY_ROOT, "src", "styles", "theme-tokens.css");

const LIGHT_PATH = join(TOKEN_ROOT, "Themes", "Light theme.tokens.json");
const DARK_PATH = join(TOKEN_ROOT, "Themes", "Dark theme.tokens.json");
const PALETTE_PATH = join(TOKEN_ROOT, "Palette.json");
const COLOR_TOKENS_PATH = join(TOKEN_ROOT, "Color Tokens.json");
const VARIABLES_PATH = join(TOKEN_ROOT, "Variable collection.json");

function clamp01(v) {
  if (typeof v !== "number" || Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function componentsToHex(components) {
  const [r, g, b] = components.map((c) => Math.round(clamp01(c) * 255));
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
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

/** Semantic theme files: leaf keys are globally unique (page-bg, info-theme-500, …). */
function flattenSemanticTokens(tree, out, warnings) {
  if (tree === null || typeof tree !== "object" || Array.isArray(tree)) return out;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    if (isLeafToken(node)) {
      if (out.has(key)) warnings.push(`duplicate "${key}"`);
      out.set(key, node);
    } else if (node !== null && typeof node === "object") {
      flattenSemanticTokens(node, out, warnings);
    }
  }
  return out;
}

/** Palette / color scales: prefix path to avoid collisions. */
function flattenPaletteTokens(tree, out, warnings, prefix = "") {
  if (tree === null || typeof tree !== "object" || Array.isArray(tree)) return out;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith("$")) continue;
    const pathKey = prefix ? `${prefix}-${key}` : key;
    if (isLeafToken(node)) {
      if (out.has(pathKey)) warnings.push(`duplicate "${pathKey}"`);
      out.set(pathKey, node);
    } else if (node !== null && typeof node === "object") {
      flattenPaletteTokens(node, out, warnings, pathKey);
    }
  }
  return out;
}

function colorToCss(name, token, tokenMap) {
  let value = token.$value;
  if (typeof value === "string") {
    const alias = value.match(/^\{([^}]+)\}$/);
    if (alias) {
      const refName = alias[1].split(".").pop() ?? "";
      const ref = tokenMap.get(refName);
      if (ref) return colorToCss(refName, ref, tokenMap);
      throw new Error(`Token "${name}": unresolved alias ${value}`);
    }
    throw new Error(`Token "${name}": unexpected string $value`);
  }
  if (!value || typeof value !== "object") {
    throw new Error(`Token "${name}": missing $value`);
  }
  const alpha = typeof value.alpha === "number" ? value.alpha : 1;
  const components = Array.isArray(value.components) ? value.components : null;
  if (alpha >= 0.999) {
    if (typeof value.hex === "string" && /^#[0-9a-fA-F]{6,8}$/.test(value.hex)) {
      return value.hex.toUpperCase();
    }
    if (components?.length >= 3) return componentsToHex(components);
    throw new Error(`Token "${name}": cannot derive hex`);
  }
  if (!components || components.length < 3) {
    throw new Error(`Token "${name}": cannot derive rgba`);
  }
  const [r, g, b] = components.map((c) => Math.round(clamp01(c) * 255));
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

function tokenToCssValue(name, token, tokenMap = new Map()) {
  if (token.$type === "color") return colorToCss(name, token, tokenMap);
  if (token.$type === "number") {
    const n = token.$value;
    if (typeof n !== "number") throw new Error(`Token "${name}": bad number`);
    if (name.includes("line-width") || name.endsWith("-width")) return String(n);
    return `${n}px`;
  }
  throw new Error(`Token "${name}": unsupported $type "${token.$type}"`);
}

function readJson(path) {
  if (!existsSync(path)) throw new Error(`Missing tokens file: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertSameKeySet(lightMap, darkMap) {
  const onlyLight = [...lightMap.keys()].filter((k) => !darkMap.has(k));
  const onlyDark = [...darkMap.keys()].filter((k) => !lightMap.has(k));
  if (onlyLight.length || onlyDark.length) {
    throw new Error(
      [
        "Theme token key mismatch between Light and Dark.",
        onlyLight.length ? `Only Light: ${onlyLight.slice(0, 10).join(", ")}` : "",
        onlyDark.length ? `Only Dark: ${onlyDark.slice(0, 10).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}

function buildThemedBlock(selector, tokenMap) {
  const lines = [`${selector} {`];
  let lastGroup = null;
  for (const [name, token] of tokenMap) {
    const group = name.split("-")[0] || "_";
    if (group !== lastGroup) {
      if (lastGroup !== null) lines.push("");
      lines.push(`  /* === ${group} === */`);
      lastGroup = group;
    }
    lines.push(`  --${name}: ${tokenToCssValue(name, token, tokenMap)};`);
  }
  lines.push("}");
  return lines.join("\n");
}

function buildStaticBlock(selector, tokenMap, cssPrefix) {
  const lines = [`${selector} {`];
  for (const [name, token] of tokenMap) {
    lines.push(`  --${cssPrefix}${name}: ${tokenToCssValue(name, token)};`);
  }
  lines.push("}");
  return lines.join("\n");
}

function mergeMaps(priorityList, warnings) {
  const out = new Map();
  for (const map of priorityList) {
    for (const [k, v] of map) {
      if (out.has(k)) warnings.push(`override "${k}" from lower-priority source`);
      out.set(k, v);
    }
  }
  return out;
}

function loadPaletteMaps(warnings) {
  const palette = new Map();
  const colorTokens = new Map();
  if (existsSync(PALETTE_PATH)) {
    flattenPaletteTokens(readJson(PALETTE_PATH), palette, warnings);
  }
  if (existsSync(COLOR_TOKENS_PATH)) {
    flattenPaletteTokens(readJson(COLOR_TOKENS_PATH), colorTokens, warnings);
  }
  return mergeMaps([palette, colorTokens], warnings);
}

function loadDesignVars(warnings) {
  const vars = new Map();
  if (!existsSync(VARIABLES_PATH)) return vars;
  flattenSemanticTokens(readJson(VARIABLES_PATH), vars, warnings);
  return vars;
}

function main() {
  const warnings = [];

  const lightWarnings = [];
  const darkWarnings = [];
  const light = flattenSemanticTokens(readJson(LIGHT_PATH), new Map(), lightWarnings);
  const dark = flattenSemanticTokens(readJson(DARK_PATH), new Map(), darkWarnings);
  for (const w of lightWarnings) console.warn(`[tokens][light] ${w}`);
  for (const w of darkWarnings) console.warn(`[tokens][dark] ${w}`);
  assertSameKeySet(light, dark);

  const palette = loadPaletteMaps(warnings);
  const designVars = loadDesignVars(warnings);
  for (const w of warnings) console.warn(`[tokens] ${w}`);

  const banner = [
    "/**",
    " * AUTO-GENERATED. Do not edit by hand.",
    " * Source: artifacts/aprly/design-tokens/ (STILE_JSON from Figma)",
    " * Regenerate: pnpm --filter @workspace/aprly run sync-design && pnpm tokens",
    " */",
    "",
  ].join("\n");

  const parts = [
    banner,
    buildThemedBlock(":root", light),
    "",
    buildThemedBlock(".dark", dark),
  ];

  if (palette.size > 0) {
    parts.push("", "/* === palette primitives (light/dark agnostic) === */");
    parts.push(buildStaticBlock(":root", palette, "palette-"));
  }

  if (designVars.size > 0) {
    parts.push("", "/* === design variables === */");
    parts.push(buildStaticBlock(":root", designVars, "design-"));
  }

  const css = `${parts.join("\n")}\n`;
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, css, "utf8");

  console.log(`[tokens] wrote ${OUT_PATH}`);
  console.log(
    `[tokens] semantic: ${light.size}×2, palette: ${palette.size}, design: ${designVars.size}`,
  );
}

main();

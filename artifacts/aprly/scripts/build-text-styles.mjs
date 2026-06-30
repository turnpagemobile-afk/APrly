#!/usr/bin/env node
/**
 * Builds app-text-styles.css from committed Figma text styles.
 *
 *   pnpm --filter @workspace/aprly run tokens:text
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APRLY_ROOT = resolve(HERE, "..");
const STYLES_PATH = join(APRLY_ROOT, "design-tokens", "textStyles.json");
const OUT_PATH = join(APRLY_ROOT, "src", "styles", "app-text-styles.css");

/** Figma export omits line-height; supplement from inspector / landing block 2. */
const LINE_HEIGHT_SUPPLEMENT = {
  "app/text/p2-bold": "20px",
  "app/text/p2-regular": "20px",
  "app/text/p1-regular": "24px",
  "app/header/h4": "1.1",
};

const FONT_FAMILY_MAP = {
  Fraunces: "var(--app-font-hero-display)",
  Figtree: "var(--app-font-hero-body)",
  "Inter Display": "var(--app-font-display)",
  Inter: "var(--app-font-sans)",
};

const FONT_WEIGHT_MAP = {
  Black: 900,
  "ExtraBold": 800,
  Bold: 700,
  "Bold Italic": 700,
  SemiBold: 600,
  Medium: 500,
};

function styleNameToClass(name) {
  return `.${name.replace(/\//g, "-").replace(/\./g, "-")}`;
}

function letterSpacingCss(letterSpacing) {
  if (!letterSpacing || typeof letterSpacing.value !== "number") return "0";
  if (letterSpacing.unit === "PERCENT") return `${letterSpacing.value / 100}em`;
  return `${letterSpacing.value}px`;
}

function textCaseCss(textCase) {
  if (textCase === "UPPER") return "uppercase";
  return "none";
}

function buildStyleRule(style) {
  const className = styleNameToClass(style.name);
  const fontFamily = FONT_FAMILY_MAP[style.fontFamily];
  if (!fontFamily) {
    throw new Error(`Unknown fontFamily "${style.fontFamily}" in style "${style.name}"`);
  }

  const weightKey = style.fontWeight;
  const fontWeight = FONT_WEIGHT_MAP[weightKey];
  if (fontWeight === undefined) {
    throw new Error(`Unknown fontWeight "${weightKey}" in style "${style.name}"`);
  }

  const lines = [
    `  /* Figma: ${style.name} */`,
    `  ${className} {`,
    `    font-family: ${fontFamily};`,
    `    font-size: ${style.fontSize}px;`,
    `    font-weight: ${fontWeight};`,
  ];

  if (weightKey === "Bold Italic") {
    lines.push("    font-style: italic;");
  }

  const lineHeight = LINE_HEIGHT_SUPPLEMENT[style.name];
  lines.push(`    line-height: ${lineHeight ?? "normal"};`);
  lines.push(`    letter-spacing: ${letterSpacingCss(style.letterSpacing)};`);
  lines.push(`    text-transform: ${textCaseCss(style.textCase)};`);
  lines.push("  }");

  return lines.join("\n");
}

function main() {
  if (!existsSync(STYLES_PATH)) {
    throw new Error(`Missing text styles file: ${STYLES_PATH}`);
  }

  const data = JSON.parse(readFileSync(STYLES_PATH, "utf8"));
  const styles = data.textStyles;
  if (!Array.isArray(styles) || styles.length === 0) {
    throw new Error("textStyles.json: expected non-empty textStyles array");
  }

  const banner = [
    "/**",
    " * AUTO-GENERATED. Do not edit by hand.",
    " * Source: artifacts/aprly/design-tokens/textStyles.json (Figma text styles)",
    " * Regenerate: pnpm --filter @workspace/aprly run sync-design && pnpm tokens",
    " *",
    " * Colors are NOT part of text styles — use app-text-colors.css utilities.",
    " */",
    "",
    "@layer components {",
  ].join("\n");

  const rules = styles.map(buildStyleRule).join("\n\n");
  const css = `${banner}\n${rules}\n}\n`;

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, css, "utf8");

  console.log(`[tokens:text] wrote ${OUT_PATH} (${styles.length} styles)`);
}

main();

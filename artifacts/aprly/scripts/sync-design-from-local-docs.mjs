#!/usr/bin/env node
/**
 * Dev-only: copy Figma exports from local_docs into tracked repo paths.
 * CI does not run this — commit the outputs.
 *
 *   pnpm --filter @workspace/aprly run sync-design
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APRLY_ROOT = resolve(HERE, "..");
const REPO_ROOT = resolve(APRLY_ROOT, "..", "..");
const DESIGN_ROOT = join(REPO_ROOT, "local_docs", "APRLY DESIGN");

const TOKEN_SRC = join(DESIGN_ROOT, "STILE_JSON");
const TOKEN_DEST = join(APRLY_ROOT, "design-tokens");

const MEDIA = [
  {
    src: join(DESIGN_ROOT, "LANDING", "hero-section", "herolending-bg-photo", "full.png"),
    dest: join(APRLY_ROOT, "public", "landing", "hero", "full.png"),
  },
  {
    src: join(DESIGN_ROOT, "LANDING", "hero-section", "herolending-bg-photo", "litle.png"),
    dest: join(APRLY_ROOT, "public", "landing", "hero", "little.png"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "LANDING",
      "hero-section",
      "landing-video-section",
      "landing-video-section.mp4",
    ),
    dest: join(APRLY_ROOT, "public", "landing", "hero", "landing-video-section.mp4"),
  },
  {
    src: join(DESIGN_ROOT, "LANDING", "landing-audit-section", "image", "credit-card.svg"),
    dest: join(APRLY_ROOT, "public", "landing", "audit", "credit-card.svg"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "LANDING",
      "landing-audit-section",
      "image",
      "landing-audit-section.png",
    ),
    dest: join(APRLY_ROOT, "public", "landing", "audit", "landing-audit-section.png"),
  },
  {
    src: join(DESIGN_ROOT, "LANDING", "landing-audit-section", "image", "man.png"),
    dest: join(APRLY_ROOT, "public", "landing", "audit", "man.png"),
  },
  {
    src: join(DESIGN_ROOT, "LANDING", "landing-audit-section", "image", "peyzaj.png"),
    dest: join(APRLY_ROOT, "public", "landing", "audit", "peyzaj.png"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "LANDING",
      "landing-faq-items",
      "images",
      "faq_chevron_in_circle_down.svg",
    ),
    dest: join(APRLY_ROOT, "public", "landing", "faq", "faq_chevron_in_circle_down.svg"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "LANDING",
      "landing-faq-items",
      "images",
      "faq_chevron_in_circle_up.svg",
    ),
    dest: join(APRLY_ROOT, "public", "landing", "faq", "faq_chevron_in_circle_up.svg"),
  },
  {
    src: join(DESIGN_ROOT, "LANDING", "landing-subscribe-section", "checkmark.svg"),
    dest: join(APRLY_ROOT, "public", "landing", "subscribe", "checkmark.svg"),
  },
  {
    src: join(DESIGN_ROOT, "LANDING", "landing-futer-cta-section", "bg-image.png"),
    dest: join(APRLY_ROOT, "public", "landing", "footer-cta", "bg-image.png"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "LANDING",
      "landing-dashboard-section",
      "images",
      "MacBook Air (2022).png",
    ),
    dest: join(APRLY_ROOT, "public", "landing", "dashboard", "macbook-air-2022.png"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "LANDING",
      "landing-functions",
      "landing-functions-photo.png",
    ),
    dest: join(APRLY_ROOT, "public", "landing", "functions", "landing-functions-photo.png"),
  },
  {
    src: join(DESIGN_ROOT, "404", "image", "search.png"),
    dest: join(APRLY_ROOT, "public", "landing", "404", "search.png"),
  },
  {
    src: join(DESIGN_ROOT, "USER CABINET", "DASHBOARD", "PLANS", "image", "fire.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "fire.svg"),
  },
  {
    src: join(DESIGN_ROOT, "USER CABINET", "DASHBOARD", "PLANS", "image", "pig.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "pig.svg"),
  },
  {
    src: join(DESIGN_ROOT, "images", "arrow.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "arrow.svg"),
  },
  {
    src: join(DESIGN_ROOT, "images", "litl-arrow.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "litl-arrow.svg"),
  },
  {
    src: join(DESIGN_ROOT, "images", "plus.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "plus.svg"),
  },
  {
    src: join(DESIGN_ROOT, "images", "card-label-icon.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "card-label-icon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "images", "active-label-icon.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "active-label-icon.svg"),
  },
];

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[sync-design] skip missing: ${src}`);
    return;
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true, force: true });
  console.log(`[sync-design] ${src} → ${dest}`);
}

function copyFile(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[sync-design] skip missing: ${src}`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { force: true });
  console.log(`[sync-design] ${src} → ${dest}`);
}

function copyNumberedImages(srcDir, destDir, count) {
  if (!existsSync(srcDir)) return;
  mkdirSync(destDir, { recursive: true });
  for (let i = 1; i <= count; i++) {
    const src = join(srcDir, `${i}.png`);
    if (existsSync(src)) copyFile(src, join(destDir, `${i}.png`));
  }
}

function copyWhyPhotos() {
  const srcDir = join(DESIGN_ROOT, "LANDING", "landing-why-section", "images");
  const destDir = join(APRLY_ROOT, "public", "landing", "why");
  for (const name of ["photo1.png", "photo2.png", "photo3.png"]) {
    copyFile(join(srcDir, name), join(destDir, name));
  }
}

function copyFirstSteps() {
  const srcDir = join(DESIGN_ROOT, "LANDING", "landing-first-step-to-section", "images");
  const destDir = join(APRLY_ROOT, "public", "landing", "first-steps");
  copyNumberedImages(srcDir, destDir, 6);
  copyFile(join(srcDir, "desctop-block.png"), join(destDir, "desktop-block.png"));
  copyFile(join(srcDir, "mobile-block.png"), join(destDir, "mobile-block.png"));
}

function main() {
  if (!existsSync(DESIGN_ROOT)) {
    console.error(`[sync-design] Design folder not found: ${DESIGN_ROOT}`);
    process.exit(1);
  }

  copyDir(TOKEN_SRC, TOKEN_DEST);

  for (const { src, dest } of MEDIA) copyFile(src, dest);

  copyWhyPhotos();
  copyFirstSteps();

  const progressSrc = join(DESIGN_ROOT, "LANDING", "landing-progres");
  if (existsSync(progressSrc)) {
    const pngs = readdirSync(progressSrc).filter((f) => f.endsWith(".png"));
    const destDir = join(APRLY_ROOT, "public", "landing", "progress");
    mkdirSync(destDir, { recursive: true });
    for (const f of pngs) {
      copyFile(join(progressSrc, f), join(destDir, f.replace(/\s+/g, "-").toLowerCase()));
    }
  }

  console.log("[sync-design] done");
}

main();

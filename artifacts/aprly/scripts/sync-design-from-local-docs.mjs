#!/usr/bin/env node
/**
 * Dev-only: copy Figma exports from local_docs into tracked repo paths.
 * CI does not run this — commit the outputs.
 *
 *   pnpm --filter @workspace/aprly run sync-design
 *
 * Source: local_docs/WHITE_GREEN_DESIGN (stile + images).
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APRLY_ROOT = resolve(HERE, "..");
const REPO_ROOT = resolve(APRLY_ROOT, "..", "..");
const DESIGN_ROOT = join(REPO_ROOT, "local_docs", "WHITE_GREEN_DESIGN");
const LEGACY_DESIGN_ROOT = join(REPO_ROOT, "local_docs", "APRLY DESIGN");
const PREV_GREEN_ROOT = join(REPO_ROOT, "local_docs", "NEW_GREEN_DESIGN");

const STILE_SRC = join(DESIGN_ROOT, "stile");
const IMAGES_SRC = join(DESIGN_ROOT, "images");
const TOKEN_DEST = join(APRLY_ROOT, "design-tokens");
const SHARED_DEST = join(APRLY_ROOT, "public", "shared");

/** Map WHITE_GREEN stile filenames → committed design-tokens layout. */
const STILE_COPIES = [
  ["Light theme.tokens.json", join("Themes", "Light theme.tokens.json")],
  // No Dark export — Light is cloned for key parity (landing/cabinet force light).
  ["Light theme.tokens.json", join("Themes", "Dark theme.tokens.json")],
  ["Mode 1.tokens.json", "Palette.json"],
  ["ColorTokens.tokens 2.json", "Color Tokens.json"],
  ["Light theme.tokens 2.json", "Variable collection.json"],
  ["textStyles.json", "textStyles.json"],
];

const MEDIA = [
  // Brand / shared
  { src: join(IMAGES_SRC, "logo.png"), dest: join(SHARED_DEST, "logo.png") },
  { src: join(IMAGES_SRC, "logo.svg"), dest: join(SHARED_DEST, "logo.svg") },
  { src: join(IMAGES_SRC, "eye_open.svg"), dest: join(SHARED_DEST, "eye.svg") },
  { src: join(IMAGES_SRC, "eye_close.svg"), dest: join(SHARED_DEST, "eye-off.svg") },
  { src: join(IMAGES_SRC, "close-red.svg"), dest: join(SHARED_DEST, "close.svg") },
  { src: join(IMAGES_SRC, "burger.svg"), dest: join(SHARED_DEST, "menu-button.svg") },
  { src: join(IMAGES_SRC, "user-menu.svg"), dest: join(SHARED_DEST, "user.svg") },
  { src: join(IMAGES_SRC, "facebook_white.svg"), dest: join(SHARED_DEST, "facebook.svg") },
  { src: join(IMAGES_SRC, "instagramm_white.svg"), dest: join(SHARED_DEST, "instagram.svg") },
  { src: join(IMAGES_SRC, "linked-in_white.svg"), dest: join(SHARED_DEST, "linkedin.svg") },
  { src: join(IMAGES_SRC, "plaid_verified_white.png"), dest: join(SHARED_DEST, "plaid-logo-footer.png") },
  { src: join(IMAGES_SRC, "plaid_green.png"), dest: join(SHARED_DEST, "plaid-logo.png") },
  { src: join(IMAGES_SRC, "checked_circle.svg"), dest: join(SHARED_DEST, "checked-circle.svg") },
  { src: join(IMAGES_SRC, "locked.png"), dest: join(SHARED_DEST, "lock-stars.png") },
  { src: join(IMAGES_SRC, "email_back.png"), dest: join(SHARED_DEST, "email.png") },
  { src: join(IMAGES_SRC, "locked.png"), dest: join(SHARED_DEST, "locked.png") },
  { src: join(IMAGES_SRC, "email_back.png"), dest: join(SHARED_DEST, "email_back.png") },

  // Landing hero / backgrounds
  { src: join(IMAGES_SRC, "hero-lines.png"), dest: join(APRLY_ROOT, "public", "landing", "hero", "hero-lines.png") },
  { src: join(IMAGES_SRC, "start-audit-lines.png"), dest: join(APRLY_ROOT, "public", "landing", "optimizer", "start-audit-lines.png") },
  { src: join(IMAGES_SRC, "logo.png"), dest: join(APRLY_ROOT, "public", "landing", "footer", "logo.png") },
  { src: join(IMAGES_SRC, "plaid_verified_white.png"), dest: join(APRLY_ROOT, "public", "landing", "footer", "plaid-verified.png") },
  { src: join(IMAGES_SRC, "empty_search.png"), dest: join(APRLY_ROOT, "public", "landing", "404", "search.png") },

  // Easy steps numbers
  { src: join(IMAGES_SRC, "#1.png"), dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "1.png") },
  { src: join(IMAGES_SRC, "#2.png"), dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "2.png") },
  { src: join(IMAGES_SRC, "#3.png"), dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "3.png") },
  { src: join(IMAGES_SRC, "arrow_down_circle.svg"), dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "arrow-down.svg") },

  // Why / trust (4 images)
  { src: join(IMAGES_SRC, "1.png"), dest: join(APRLY_ROOT, "public", "landing", "why", "photo1.png") },
  { src: join(IMAGES_SRC, "2.png"), dest: join(APRLY_ROOT, "public", "landing", "why", "photo2.png") },
  { src: join(IMAGES_SRC, "3.png"), dest: join(APRLY_ROOT, "public", "landing", "why", "photo3.png") },
  { src: join(IMAGES_SRC, "4.png"), dest: join(APRLY_ROOT, "public", "landing", "why", "photo4.png") },

  // FAQ
  { src: join(IMAGES_SRC, "arrow_down_circle.svg"), dest: join(APRLY_ROOT, "public", "landing", "faq", "faq_chevron_in_circle_down.svg") },
  { src: join(IMAGES_SRC, "arrow_up_circle.svg"), dest: join(APRLY_ROOT, "public", "landing", "faq", "faq_chevron_in_circle_up.svg") },

  // Optimizer / cards
  { src: join(IMAGES_SRC, "card-icon.svg"), dest: join(APRLY_ROOT, "public", "landing", "audit", "credit-card.svg") },
  { src: join(IMAGES_SRC, "card-icon.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "card-label-icon.svg") },
  { src: join(IMAGES_SRC, "trash.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "trash.svg") },
  { src: join(IMAGES_SRC, "plus24.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "plus.svg") },
  { src: join(IMAGES_SRC, "arrow-right.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "arrow.svg") },
  { src: join(IMAGES_SRC, "litl-arrow.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "litl-arrow.svg") },
  { src: join(IMAGES_SRC, "arrow-left.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "arrow-left.svg") },
  { src: join(IMAGES_SRC, "flag.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "flag.svg") },
  { src: join(IMAGES_SRC, "green-check.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "checked.svg") },
  { src: join(IMAGES_SRC, "portfel.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "portfel.svg") },
  { src: join(IMAGES_SRC, "three-dots.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "three-dots.svg") },
  { src: join(IMAGES_SRC, "success_back.png"), dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "success_back.png") },
  { src: join(IMAGES_SRC, "box-icon.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "account", "box-icon.svg") },
  { src: join(IMAGES_SRC, "LogOut.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "account", "logout.svg") },
  { src: join(IMAGES_SRC, "close-red.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "account", "close-red.svg") },
  { src: join(IMAGES_SRC, "success-background.png"), dest: join(APRLY_ROOT, "public", "cabinet", "account", "success-background.png") },
  { src: join(IMAGES_SRC, "litll-check.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "paywall", "check.svg") },
  { src: join(IMAGES_SRC, "ambrella.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "paywall", "umbrella.svg") },
  { src: join(IMAGES_SRC, "shield.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "paywall", "shield.svg") },
  { src: join(IMAGES_SRC, "graffik.svg"), dest: join(APRLY_ROOT, "public", "cabinet", "paywall", "chart.svg") },
];

function copyFile(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[sync-design] skip missing: ${src}`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { force: true });
  console.log(`[sync-design] ${src} → ${dest}`);
}

function copyStileTokens() {
  if (!existsSync(STILE_SRC)) {
    console.error(`[sync-design] stile folder not found: ${STILE_SRC}`);
    process.exit(1);
  }
  mkdirSync(join(TOKEN_DEST, "Themes"), { recursive: true });

  for (const [srcName, destRel] of STILE_COPIES) {
    copyFile(join(STILE_SRC, srcName), join(TOKEN_DEST, destRel));
  }
}

function copyImagesBulk() {
  if (!existsSync(IMAGES_SRC)) return;
  const destDir = join(APRLY_ROOT, "public", "landing", "white-green");
  mkdirSync(destDir, { recursive: true });
  for (const name of readdirSync(IMAGES_SRC)) {
    if (name === ".DS_Store") continue;
    const safe = name.replace(/\s+/g, "-");
    copyFile(join(IMAGES_SRC, name), join(destDir, safe));
  }
}

function copyLegacyFallbacks() {
  const roots = [PREV_GREEN_ROOT, LEGACY_DESIGN_ROOT].filter((p) => existsSync(p));
  const fallbacks = [
    {
      candidates: [
        join(PREV_GREEN_ROOT, "IMAGE_NEW", "MacBook Air (2022).png"),
        join(LEGACY_DESIGN_ROOT, "LANDING", "dashboard-preview", "macbook.png"),
      ],
      dest: join(APRLY_ROOT, "public", "landing", "dashboard", "macbook-air-2022.png"),
    },
    {
      candidates: [
        join(LEGACY_DESIGN_ROOT, "LANDING", "hero-section", "landing-video-section", "landing-video-section.mp4"),
      ],
      dest: join(APRLY_ROOT, "public", "landing", "hero", "landing-video-section.mp4"),
    },
    {
      candidates: [
        join(PREV_GREEN_ROOT, "IMAGE_NEW", "30.png"),
      ],
      dest: join(APRLY_ROOT, "public", "landing", "stats", "30.png"),
    },
    {
      candidates: [
        join(PREV_GREEN_ROOT, "IMAGE_NEW", "$0.png"),
      ],
      dest: join(APRLY_ROOT, "public", "landing", "stats", "0.png"),
    },
    {
      candidates: [
        join(PREV_GREEN_ROOT, "IMAGE_NEW", "8%.png"),
      ],
      dest: join(APRLY_ROOT, "public", "landing", "stats", "8pct.png"),
    },
    {
      candidates: [
        join(PREV_GREEN_ROOT, "IMAGE_NEW", "won.png"),
        join(PREV_GREEN_ROOT, "img", "CabinetDashboard", "PlanDetail", "Cards", "icon-96", "won.png"),
      ],
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "won.png"),
    },
    {
      candidates: [
        join(LEGACY_DESIGN_ROOT, "USER CABINET", "DASHBOARD", "PLANS", "image", "fire.svg"),
      ],
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "fire.svg"),
    },
    {
      candidates: [
        join(LEGACY_DESIGN_ROOT, "USER CABINET", "DASHBOARD", "PLANS", "image", "pig.svg"),
      ],
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "pig.svg"),
    },
  ];

  for (const { candidates, dest } of fallbacks) {
    if (existsSync(dest)) continue;
    const src = candidates.find((c) => existsSync(c));
    if (src) copyFile(src, dest);
  }

  void roots;
}

function patchLandingShadowToken() {
  // Brief specifies landing-shadow; ensure CSS var exists after token build via a small overlay file note.
  const notePath = join(TOKEN_DEST, "WHITE_GREEN_NOTES.md");
  writeFileSync(
    notePath,
    [
      "# WHITE_GREEN sync notes",
      "",
      "- Source: `local_docs/WHITE_GREEN_DESIGN`",
      "- Dark theme = copy of Light (no dark export; apps force light).",
      "- Palette from `Mode 1.tokens.json`; design vars from `Light theme.tokens 2.json`.",
      "- Manual CSS extras (if missing from export): `--landing-shadow: 0px 25px 100px 0px #45589D14;`",
      "",
    ].join("\n"),
    "utf8",
  );
}

function main() {
  if (!existsSync(DESIGN_ROOT)) {
    console.error(`[sync-design] Design folder not found: ${DESIGN_ROOT}`);
    process.exit(1);
  }

  copyStileTokens();
  for (const { src, dest } of MEDIA) copyFile(src, dest);
  copyImagesBulk();
  copyLegacyFallbacks();
  patchLandingShadowToken();

  console.log("[sync-design] done (WHITE_GREEN_DESIGN)");
}

main();

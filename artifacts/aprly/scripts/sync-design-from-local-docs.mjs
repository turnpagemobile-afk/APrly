#!/usr/bin/env node
/**
 * Dev-only: copy Figma exports from local_docs into tracked repo paths.
 * CI does not run this — commit the outputs.
 *
 *   pnpm --filter @workspace/aprly run sync-design
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APRLY_ROOT = resolve(HERE, "..");
const REPO_ROOT = resolve(APRLY_ROOT, "..", "..");
const DESIGN_ROOT = join(REPO_ROOT, "local_docs", "NEW_GREEN_DESIGN");
const LEGACY_DESIGN_ROOT = join(REPO_ROOT, "local_docs", "APRLY DESIGN");

const STILE_SRC = join(DESIGN_ROOT, "STILE");
const TOKEN_DEST = join(APRLY_ROOT, "design-tokens");
const IMAGE_NEW = join(DESIGN_ROOT, "IMAGE_NEW");
const SHARED_DEST = join(APRLY_ROOT, "public", "shared");

const STILE_RENAMES = [
  ["ColorTokens.json", "Color Tokens.json"],
  ["VariableCollection.json", "Variable collection.json"],
];

const MEDIA = [
  {
    src: join(DESIGN_ROOT, "fix", "landing-vawe.png"),
    dest: join(APRLY_ROOT, "public", "landing", "hero", "landing-wave.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "futter", "logo.png"),
    dest: join(APRLY_ROOT, "public", "landing", "footer", "logo.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "1.png"),
    dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "1.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "2.png"),
    dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "2.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "3.png"),
    dest: join(APRLY_ROOT, "public", "landing", "easy-steps", "3.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "1m.png"),
    dest: join(APRLY_ROOT, "public", "landing", "why", "1m.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "2m.png"),
    dest: join(APRLY_ROOT, "public", "landing", "why", "2m.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "3m.png"),
    dest: join(APRLY_ROOT, "public", "landing", "why", "3m.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "4m.png"),
    dest: join(APRLY_ROOT, "public", "landing", "why", "4m.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "5m.png"),
    dest: join(APRLY_ROOT, "public", "landing", "why", "5m.png"),
  },
  {
    src: join(IMAGE_NEW, "logo.png"),
    dest: join(SHARED_DEST, "logo.png"),
  },
  {
    src: join(IMAGE_NEW, "search-skay.png"),
    dest: join(APRLY_ROOT, "public", "landing", "404", "search.png"),
  },
  {
    src: join(IMAGE_NEW, "MacBook Air (2022).png"),
    dest: join(APRLY_ROOT, "public", "landing", "dashboard", "macbook-air-2022.png"),
  },
  {
    src: join(IMAGE_NEW, "PLAID-Logo.png"),
    dest: join(SHARED_DEST, "plaid-logo.png"),
  },
  {
    src: join(IMAGE_NEW, "PLAID-Logo-futter.png"),
    dest: join(SHARED_DEST, "plaid-logo-footer.png"),
  },
  {
    src: join(IMAGE_NEW, "30.png"),
    dest: join(APRLY_ROOT, "public", "landing", "stats", "30.png"),
  },
  {
    src: join(IMAGE_NEW, "$0.png"),
    dest: join(APRLY_ROOT, "public", "landing", "stats", "0.png"),
  },
  {
    src: join(IMAGE_NEW, "8%.png"),
    dest: join(APRLY_ROOT, "public", "landing", "stats", "8pct.png"),
  },
  {
    src: join(IMAGE_NEW, "check-skay.png"),
    dest: join(SHARED_DEST, "check-sky.png"),
  },
  {
    src: join(IMAGE_NEW, "Lock&stars.png"),
    dest: join(SHARED_DEST, "lock-stars.png"),
  },
  {
    src: join(IMAGE_NEW, "green_down.svg"),
    dest: join(APRLY_ROOT, "public", "landing", "faq", "faq_chevron_in_circle_down.svg"),
  },
  {
    src: join(IMAGE_NEW, "green_up.svg"),
    dest: join(APRLY_ROOT, "public", "landing", "faq", "faq_chevron_in_circle_up.svg"),
  },
  {
    src: join(IMAGE_NEW, "label-card-icon.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "card-label-icon.svg"),
  },
  {
    src: join(IMAGE_NEW, "plus.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "plus.svg"),
  },
  {
    src: join(IMAGE_NEW, "trash.svg"),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "trash.svg"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "fix",
      "CabinetDashboard",
      "PlanDetail",
      "Cards",
      "icon-96",
      "won.png",
    ),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "won.png"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "fix",
      "CabinetDashboard",
      "PlanDetail",
      "LiveCikle",
      "flag.png",
    ),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "flag.png"),
  },
  {
    src: join(
      DESIGN_ROOT,
      "fix",
      "CabinetDashboard",
      "PlanDetail",
      "LiveCikle",
      "checked.png",
    ),
    dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "checked.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "logo.png"),
    dest: join(APRLY_ROOT, "public", "admin", "login", "logo.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "unsplash_AOjmfr3ofSY.png"),
    dest: join(APRLY_ROOT, "public", "admin", "login", "bg.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Dashboard", "logo (1).png"),
    dest: join(APRLY_ROOT, "public", "admin", "dashboard", "logo.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Dashboard", "dashboardIcon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "dashboard", "dashboard-icon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Dashboard", "usersIcon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "dashboard", "users-icon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Dashboard", "partnersIcon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "dashboard", "partners-icon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "search.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "search.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "first.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "pagination-first.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "left.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "pagination-prev.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "right.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "pagination-next.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "Number.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "pagination-last.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "Skip.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "search-clear.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "NoSearch.png"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "no-search.png"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "plus.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "plus.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "3dots.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "menu-dots.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "iIcon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "menu-view.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "close.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "menu-close.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "trash.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "menu-trash.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "Details", "close.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "detail-close.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "Details", "trash.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "partners", "detail-trash.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Partners", "Details", "userIcon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "user-icon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "Details", "heroicon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "detail-heroicon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "Details", "checked.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "detail-checked.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "Details", "print.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "detail-print.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "Users", "Details", "arrow.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "users", "detail-arrow.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "PlanDetails", "arrowRight.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "plans", "arrow-right.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "PlanDetails", "label-icon.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "plans", "label-icon.svg"),
  },
  {
    src: join(DESIGN_ROOT, "fix", "AdminPanel", "PlanDetails", "arrow2.svg"),
    dest: join(APRLY_ROOT, "public", "admin", "plans", "arrow-link.svg"),
  },
  {
    src: join(IMAGE_NEW, "eye.svg"),
    dest: join(SHARED_DEST, "eye.svg"),
  },
  {
    src: join(IMAGE_NEW, "eye-off.svg"),
    dest: join(SHARED_DEST, "eye-off.svg"),
  },
  {
    src: join(IMAGE_NEW, "close-circle-icon.svg"),
    dest: join(SHARED_DEST, "close-circle-icon.svg"),
  },
  {
    src: join(IMAGE_NEW, "Menu-button.svg"),
    dest: join(SHARED_DEST, "menu-button.svg"),
  },
  {
    src: join(IMAGE_NEW, "USER.svg"),
    dest: join(SHARED_DEST, "user.svg"),
  },
  {
    src: join(IMAGE_NEW, "faceboock.svg"),
    dest: join(SHARED_DEST, "facebook.svg"),
  },
  {
    src: join(IMAGE_NEW, "Instagramm.svg"),
    dest: join(SHARED_DEST, "instagram.svg"),
  },
  {
    src: join(IMAGE_NEW, "Linked-In.svg"),
    dest: join(SHARED_DEST, "linkedin.svg"),
  },
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
    console.error(`[sync-design] STILE folder not found: ${STILE_SRC}`);
    process.exit(1);
  }
  mkdirSync(join(TOKEN_DEST, "Themes"), { recursive: true });

  for (const file of ["Palette.json", "Light theme.tokens.json", "Dark theme.tokens.json"]) {
    copyFile(join(STILE_SRC, file), join(TOKEN_DEST, file === "Palette.json" ? file : join("Themes", file)));
  }

  for (const [srcName, destName] of STILE_RENAMES) {
    copyFile(join(STILE_SRC, srcName), join(TOKEN_DEST, destName));
  }

  copyFile(join(STILE_SRC, "textStyles.json"), join(TOKEN_DEST, "textStyles.json"));
}

function copyImageNewBulk() {
  if (!existsSync(IMAGE_NEW)) return;
  mkdirSync(SHARED_DEST, { recursive: true });
  for (const name of readdirSync(IMAGE_NEW)) {
    if (name === ".DS_Store" || name.endsWith(".zip")) continue;
    const src = join(IMAGE_NEW, name);
    const dest = join(SHARED_DEST, name.replace(/\s+/g, "-").toLowerCase());
    copyFile(src, dest);
  }
}

function copyWhyPhotosFromLanding() {
  const srcDir = join(DESIGN_ROOT, "LANDING", "ExtraLarge1600");
  const destDir = join(APRLY_ROOT, "public", "landing", "why");
  for (const i of [1, 2, 3, 4, 5]) {
    const src = join(srcDir, `${i}.png`);
    if (existsSync(src)) copyFile(src, join(destDir, `photo${i}.png`));
  }
}

function copyLegacyFallbacks() {
  if (!existsSync(LEGACY_DESIGN_ROOT)) return;
  const fallbacks = [
    {
      src: join(
        LEGACY_DESIGN_ROOT,
        "LANDING",
        "hero-section",
        "landing-video-section",
        "landing-video-section.mp4",
      ),
      dest: join(APRLY_ROOT, "public", "landing", "hero", "landing-video-section.mp4"),
    },
    {
      src: join(
        LEGACY_DESIGN_ROOT,
        "LANDING",
        "hero-section",
        "herolending-bg-photo",
        "litle.png",
      ),
      dest: join(APRLY_ROOT, "public", "landing", "hero", "little.png"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "LANDING", "landing-futer-cta-section", "bg-image.png"),
      dest: join(APRLY_ROOT, "public", "landing", "footer-cta", "bg-image.png"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "LANDING", "landing-audit-section", "image", "credit-card.svg"),
      dest: join(APRLY_ROOT, "public", "landing", "audit", "credit-card.svg"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "USER CABINET", "DASHBOARD", "PLANS", "image", "fire.svg"),
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "fire.svg"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "USER CABINET", "DASHBOARD", "PLANS", "image", "pig.svg"),
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "pig.svg"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "images", "arrow.svg"),
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "arrow.svg"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "images", "litl-arrow.svg"),
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "litl-arrow.svg"),
    },
    {
      src: join(LEGACY_DESIGN_ROOT, "images", "active-label-icon.svg"),
      dest: join(APRLY_ROOT, "public", "cabinet", "dashboard", "active-label-icon.svg"),
    },
  ];
  for (const { src, dest } of fallbacks) copyFile(src, dest);
}

function main() {
  if (!existsSync(DESIGN_ROOT)) {
    console.error(`[sync-design] Design folder not found: ${DESIGN_ROOT}`);
    process.exit(1);
  }

  copyStileTokens();
  copyImageNewBulk();

  for (const { src, dest } of MEDIA) copyFile(src, dest);

  copyWhyPhotosFromLanding();
  copyLegacyFallbacks();

  console.log("[sync-design] done");
}

main();

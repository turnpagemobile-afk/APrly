#!/usr/bin/env node
/**
 * Dev-only: copy email assets from local_docs into tracked repo paths.
 * CI does not run this — commit the outputs.
 *
 *   pnpm --filter @workspace/api-server run sync-email-assets
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const API_SERVER_ROOT = resolve(HERE, "..");
const REPO_ROOT = resolve(API_SERVER_ROOT, "..", "..");
const EMAIL_DOCS = join(REPO_ROOT, "local_docs", "EMAIL");
const DEST_DIR = join(API_SERVER_ROOT, "assets", "email");

const COPIES = [
  {
    src: join(EMAIL_DOCS, "logo.png"),
    dest: join(DEST_DIR, "logo.png"),
  },
];

let copied = 0;
for (const { src, dest } of COPIES) {
  if (!existsSync(src)) {
    console.warn(`[sync-email-assets] skip (missing source): ${src}`);
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
  console.log(`[sync-email-assets] ${src} → ${dest}`);
  copied += 1;
}

if (copied === 0) {
  console.error("[sync-email-assets] no files copied — check local_docs/EMAIL/");
  process.exit(1);
}

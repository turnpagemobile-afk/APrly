/**
 * Regenerate PWA icons from the canonical APRly logo PNG.
 * Requires: pnpm approve-builds (sharp) or use macOS `sips` manually.
 */
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const src = path.join(
  repoRoot,
  "artifacts/api-server/assets/aprly-logo.png",
);
const outDir = path.join(__dirname, "../public/icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-180.png", size: 180 },
];

await mkdir(outDir, { recursive: true });

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "sharp is not available. Run: pnpm approve-builds sharp\n" +
      "Or on macOS:\n" +
      `  sips -z 192 192 "${src}" --out "${path.join(outDir, "icon-192.png")}"`,
  );
  process.exit(1);
}

for (const { name, size } of sizes) {
  await sharp(src)
    .resize(size, size, { fit: "contain", background: "#0c0c0e" })
    .png()
    .toFile(path.join(outDir, name));
  console.log("wrote", name);
}

await access(path.join(outDir, "icon-192.png"));
console.log("PWA icons OK:", outDir);

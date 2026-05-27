import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aprlyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(aprlyRoot, "dist");

function copyDirContents(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirContents(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

const out = path.join(distRoot, "public");
rmDir(out);
fs.mkdirSync(out, { recursive: true });

const landing = path.join(distRoot, "landing");
const cabinet = path.join(distRoot, "cabinet");
const admin = path.join(distRoot, "admin");

for (const [name, dir] of [
  ["landing", landing],
  ["cabinet", cabinet],
  ["admin", admin],
]) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Missing build output: dist/${name} — run vite build first`);
  }
}

copyDirContents(landing, out);
copyDirContents(cabinet, path.join(out, "dashboard"));
copyDirContents(admin, path.join(out, "admin"));

console.log(`Staged static apps → ${out}`);

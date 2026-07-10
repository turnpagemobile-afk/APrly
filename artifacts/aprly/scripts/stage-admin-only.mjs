import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aprlyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adminDir = path.join(aprlyRoot, "dist", "admin");

if (!fs.existsSync(adminDir)) {
  throw new Error("Missing build output: dist/admin — run build:admin first");
}

const entryPath = path.join(adminDir, "admin.html");
const indexPath = path.join(adminDir, "index.html");

if (!fs.existsSync(entryPath)) {
  throw new Error(`Missing admin.html in ${adminDir}`);
}

fs.copyFileSync(entryPath, indexPath);
fs.unlinkSync(entryPath);

console.log(`Staged admin SPA → ${adminDir}`);

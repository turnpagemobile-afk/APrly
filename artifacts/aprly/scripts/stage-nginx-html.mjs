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

/** Vite keeps the HTML entry filename; nginx expects index.html per SPA root. */
function ensureIndexHtml(dir, entryHtmlName) {
  const entryPath = path.join(dir, entryHtmlName);
  const indexPath = path.join(dir, "index.html");
  if (!fs.existsSync(entryPath)) {
    throw new Error(`Missing ${entryHtmlName} in ${dir}`);
  }
  fs.copyFileSync(entryPath, indexPath);
  if (entryHtmlName !== "index.html") {
    fs.unlinkSync(entryPath);
  }
}

/** Mono PWA used `/sw.js` at site root; browsers still poll it for updates. */
const LEGACY_ROOT_SW = `self.addEventListener("install",()=>{self.skipWaiting()});self.addEventListener("activate",e=>{e.waitUntil((async()=>{await self.registration.unregister();const c=await self.clients.matchAll({type:"window"});for(const x of c)await x.navigate(x.url)})())});`;

copyDirContents(landing, out);
ensureIndexHtml(out, "index.landing.html");
fs.writeFileSync(path.join(out, "sw.js"), LEGACY_ROOT_SW, "utf8");

const dashboardDir = path.join(out, "dashboard");
copyDirContents(cabinet, dashboardDir);
ensureIndexHtml(dashboardDir, "cabinet.html");

const adminDir = path.join(out, "admin");
copyDirContents(admin, adminDir);
ensureIndexHtml(adminDir, "admin.html");

console.log(`Staged static apps → ${out}`);

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aprlyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const builds = [
  { config: "vite.landing.config.ts", label: "landing" },
  { config: "vite.cabinet.config.ts", label: "cabinet" },
  { config: "vite.admin.config.ts", label: "admin" },
];

for (const { config, label } of builds) {
  console.log(`\n▶ Building APRly ${label}…`);
  const result = spawnSync(
    "pnpm",
    ["exec", "vite", "build", "--config", config],
    {
      cwd: aprlyRoot,
      env: {
        ...process.env,
        PORT: process.env.PORT ?? "5173",
        NODE_ENV: "production",
      },
      stdio: "inherit",
    },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\n▶ Staging nginx html root…");
const stage = spawnSync("node", ["scripts/stage-nginx-html.mjs"], {
  cwd: aprlyRoot,
  stdio: "inherit",
});
process.exit(stage.status ?? 0);

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aprlyRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const apps = [
  {
    name: "landing",
    config: "vite.landing.config.ts",
    port: "5173",
    extraEnv: {
      DEV_APPS_PROXY: "1",
      VITE_DEV_PUBLIC_ORIGIN: "http://localhost:5173",
      APRY_CABINET_DEV_PORT: "5174",
      APRY_ADMIN_DEV_PORT: "5175",
    },
  },
  {
    name: "cabinet",
    config: "vite.cabinet.config.ts",
    port: "5174",
    extraEnv: {
      DEV_APPS_PROXY: "1",
      VITE_DEV_PUBLIC_ORIGIN: "http://localhost:5173",
    },
  },
  {
    name: "admin",
    config: "vite.admin.config.ts",
    port: "5175",
    extraEnv: {
      DEV_APPS_PROXY: "1",
      VITE_DEV_PUBLIC_ORIGIN: "http://localhost:5173",
    },
  },
];

const children = [];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function startApp(app, delayMs) {
  const launch = () => {
    const child = spawn(
      "pnpm",
      ["exec", "vite", "--config", app.config, "--host", "0.0.0.0"],
      {
        cwd: aprlyRoot,
        env: {
          ...process.env,
          PORT: app.port,
          ...app.extraEnv,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    children.push(child);

    const prefix = `[${app.name}:${app.port}]`;
    child.stdout?.on("data", (chunk) => {
      process.stdout.write(`${prefix} ${chunk}`);
    });
    child.stderr?.on("data", (chunk) => {
      process.stderr.write(`${prefix} ${chunk}`);
    });
    child.on("exit", (code, signal) => {
      if (signal) {
        console.error(`${prefix} exited (${signal})`);
      } else if (code !== 0) {
        console.error(`${prefix} exited with code ${code}`);
        shutdown(code ?? 1);
      }
    });
  };

  if (delayMs > 0) {
    setTimeout(launch, delayMs);
  } else {
    launch();
  }
}

// Stagger cold starts so three dependency optimizers do not fight on first boot.
apps.forEach((app, index) => startApp(app, index * 800));

console.log(
  "APRly dev: http://localhost:5173 (landing + proxy to cabinet/admin on 5174/5175)",
);

import type { IncomingMessage, ServerResponse } from "node:http";
import http from "node:http";
import net from "node:net";
import type { Socket } from "node:net";
import type { Plugin } from "vite";

function normalizeProxyUrl(url: string): string {
  const q = url.indexOf("?");
  const path = q === -1 ? url : url.slice(0, q);
  const search = q === -1 ? "" : url.slice(q);
  if (path === "/dashboard" || path === "/admin") {
    return `${path}/${search}`;
  }
  return url;
}

function resolveTarget(
  url: string,
): { host: string; port: number } | null {
  if (url.startsWith("/dashboard")) {
    return {
      host: "127.0.0.1",
      port: Number(process.env.APRY_CABINET_DEV_PORT ?? 5174),
    };
  }
  if (url.startsWith("/admin")) {
    return {
      host: "127.0.0.1",
      port: Number(process.env.APRY_ADMIN_DEV_PORT ?? 5175),
    };
  }
  return null;
}

function proxyHttp(
  req: IncomingMessage,
  res: ServerResponse,
  target: { host: string; port: number },
  url: string,
): void {
  const path = normalizeProxyUrl(url);
  const proxyReq = http.request(
    {
      host: target.host,
      port: target.port,
      method: req.method,
      path,
      headers: {
        ...req.headers,
        host: `${target.host}:${target.port}`,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", (err) => {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader("content-type", "text/plain; charset=utf-8");
    }
    res.end(`APRly dev proxy: ${err.message}`);
  });
  req.pipe(proxyReq);
}

function proxyWebSocket(
  req: IncomingMessage,
  socket: Socket,
  head: Buffer,
  target: { host: string; port: number },
  url: string,
): void {
  const path = normalizeProxyUrl(url);
  const upstream = net.connect(target.port, target.host, () => {
    const lines = Object.entries(req.headers).flatMap(([key, value]) => {
      if (value == null) return [];
      return Array.isArray(value)
        ? value.map((v) => `${key}: ${v}`)
        : [`${key}: ${value}`];
    });
    upstream.write(
      `${req.method} ${path} HTTP/${req.httpVersion}\r\n${lines.join("\r\n")}\r\n\r\n`,
    );
    if (head.length > 0) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
}

/**
 * Landing dev server (5173) proxies /dashboard and /admin to sibling Vite instances.
 * Runs before SPA fallback so cabinet HTML is served instead of landing index.html.
 */
export function aprlyDevMultiAppProxy(): Plugin {
  return {
    name: "aprly-dev-multi-app-proxy",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      if (process.env.DEV_APPS_PROXY !== "1") return;

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? "";
        const target = resolveTarget(url);
        if (!target) return next();
        proxyHttp(req, res, target, url);
      });

      server.httpServer?.on("upgrade", (req, socket, head) => {
        const url = req.url ?? "";
        const target = resolveTarget(url);
        if (!target) return;
        proxyWebSocket(req, socket as Socket, head, target, url);
      });
    },
  };
}

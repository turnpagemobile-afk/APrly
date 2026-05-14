import type { RequestHandler } from "express";

export function requireRole(role: string): RequestHandler {
  return (req, res, next) => {
    if (req.userRole !== role) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

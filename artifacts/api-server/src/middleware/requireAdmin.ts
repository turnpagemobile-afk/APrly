import type { RequestHandler } from "express";
import { requireAuth } from "./requireAuth";
import { requireRole } from "./requireRole";
import { ADMIN_ROLE } from "../lib/user-roles";

export const requireAdmin: RequestHandler[] = [requireAuth, requireRole(ADMIN_ROLE)];

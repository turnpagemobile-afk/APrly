import { Router, type IRouter } from "express";
import {
  GetAdminDashboardSummaryQueryParams,
  GetAdminDashboardSummaryResponse,
} from "@workspace/api-zod";
import { buildAdminDashboardSummary } from "../lib/build-admin-dashboard-summary";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/admin/dashboard/summary", ...requireAdmin, async (req, res, next) => {
  try {
    const parsed = GetAdminDashboardSummaryQueryParams.safeParse(req.query);
    const period = parsed.success ? (parsed.data.period ?? "30d") : "30d";
    const summary = await buildAdminDashboardSummary(period);
    res.json(GetAdminDashboardSummaryResponse.parse(summary));
  } catch (err) {
    next(err);
  }
});

export default router;

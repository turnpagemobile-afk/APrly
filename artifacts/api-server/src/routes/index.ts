import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import leadsRouter from "./leads";
import optimizerRouter from "./optimizer";
import plaidRouter from "./plaid";
import stripeRouter from "./stripe";
import dashboardRouter from "./dashboard";
import meRouter from "./me";
import planLeadsRouter from "./plan-leads";
import subscriptionRouter from "./subscription";
import voiceRouter from "./voice";
import adminAuthRouter from "./admin-auth";
import adminDashboardRouter from "./admin-dashboard";
import adminPlanLeadsRouter from "./admin-plan-leads";
import adminPartnersRouter from "./admin-partners";
import adminUsersRouter from "./admin-users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(meRouter);
router.use(planLeadsRouter);
router.use(subscriptionRouter);
router.use(leadsRouter);
router.use(optimizerRouter);
router.use(plaidRouter);
router.use(stripeRouter);
router.use(dashboardRouter);
router.use(voiceRouter);
router.use(adminAuthRouter);
router.use(adminDashboardRouter);
router.use(adminPlanLeadsRouter);
router.use(adminUsersRouter);
router.use(adminPartnersRouter);

export default router;

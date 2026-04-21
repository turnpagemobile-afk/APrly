import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import optimizerRouter from "./optimizer";
import plaidRouter from "./plaid";
import stripeRouter from "./stripe";
import dashboardRouter from "./dashboard";
import voiceRouter from "./voice";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(optimizerRouter);
router.use(plaidRouter);
router.use(stripeRouter);
router.use(dashboardRouter);
router.use(voiceRouter);

export default router;

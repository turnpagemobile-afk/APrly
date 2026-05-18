import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import leadsRouter from "./leads";
import optimizerRouter from "./optimizer";
import plaidRouter from "./plaid";
import stripeRouter from "./stripe";
import dashboardRouter from "./dashboard";
import meRouter from "./me";
import voiceRouter from "./voice";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(meRouter);
router.use(leadsRouter);
router.use(optimizerRouter);
router.use(plaidRouter);
router.use(stripeRouter);
router.use(dashboardRouter);
router.use(voiceRouter);

export default router;

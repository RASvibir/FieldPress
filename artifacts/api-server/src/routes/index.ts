import classifiedsRouter from "./classifieds";
import bountiesRouter from "./bounties";
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storiesRouter from "./stories";
import itemsRouter from "./items";
import draftsRouter from "./drafts";
import dashboardRouter from "./dashboard";
import produceRouter from "./produce";
import desksRouter from "./desks";
import pressyRouter from "./pressy";
import { optionalAuth } from "../lib/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bountiesRouter);
router.use(authRouter);
router.use(optionalAuth);
router.use(pressyRouter);
router.use(storiesRouter);
router.use(itemsRouter);
router.use(draftsRouter);
router.use(dashboardRouter);
router.use(produceRouter);
router.use(desksRouter);

router.use(classifiedsRouter);
export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storiesRouter from "./stories";
import itemsRouter from "./items";
import draftsRouter from "./drafts";
import dashboardRouter from "./dashboard";
import produceRouter from "./produce";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(storiesRouter);
router.use(itemsRouter);
router.use(draftsRouter);
router.use(dashboardRouter);
router.use(produceRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storiesRouter from "./stories";
import itemsRouter from "./items";
import draftsRouter from "./drafts";
import dashboardRouter from "./dashboard";
import produceRouter from "./produce";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storiesRouter);
router.use(itemsRouter);
router.use(draftsRouter);
router.use(dashboardRouter);
router.use(produceRouter);

export default router;

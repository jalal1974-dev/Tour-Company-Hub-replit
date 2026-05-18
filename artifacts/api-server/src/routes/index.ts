import { Router, type IRouter } from "express";
import healthRouter from "./health";
import destinationsRouter from "./destinations";
import adminRouter from "./admin";
import quotesRouter from "./quotes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(destinationsRouter);
router.use(adminRouter);
router.use(quotesRouter);

export default router;

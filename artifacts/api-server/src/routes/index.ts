import { Router, type IRouter } from "express";
import healthRouter from "./health";
import budgetCategoriesRouter from "./budget-categories";
import budgetLineItemsRouter from "./budget-line-items";
import yearlyComparisonsRouter from "./yearly-comparisons";
import ownRevenuesRouter from "./own-revenues";
import balanceSheetRouter from "./balance-sheet";
import summaryRouter from "./summary";
import customDatasetsRouter from "./custom-datasets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(budgetCategoriesRouter);
router.use(budgetLineItemsRouter);
router.use(yearlyComparisonsRouter);
router.use(ownRevenuesRouter);
router.use(balanceSheetRouter);
router.use(summaryRouter);
router.use(customDatasetsRouter);

export default router;

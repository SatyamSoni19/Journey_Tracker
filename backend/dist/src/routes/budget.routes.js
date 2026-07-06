import { Router } from "express";
import { createMember, getMembers, removeMember, createExp, getExps, updateExp, removeExp, getSummary, createCat, getCats, } from "../controllers/budget.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createBudgetMemberSchema, createExpenseSchema, updateExpenseSchema, budgetMemberIdParamSchema, expenseIdParamSchema, } from "../validators/budget.validator.js";
// Mounted at /api/v1/journeys/:journeyId/budget
const router = Router({ mergeParams: true });
router.use(authenticate);
// Members
router.post("/members", validate(createBudgetMemberSchema), createMember);
router.get("/members", getMembers);
router.delete("/members/:memberId", validate(budgetMemberIdParamSchema), removeMember);
// Expenses
router.post("/expenses", validate(createExpenseSchema), createExp);
router.get("/expenses", getExps);
router.patch("/expenses/:expenseId", validate(updateExpenseSchema), updateExp);
router.delete("/expenses/:expenseId", validate(expenseIdParamSchema), removeExp);
// Summary
router.get("/summary", getSummary);
// Categories
router.post("/categories", createCat);
router.get("/categories", getCats);
export default router;

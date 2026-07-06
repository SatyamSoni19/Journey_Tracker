import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { addBudgetMember, getBudgetMembers, deleteBudgetMember, addExpense, getExpenses, updateExpense, deleteExpense, getBudgetSummary, addCategory, getCategories, } from "../services/budget.service.js";
// --- Members ---
export const createMember = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const member = await addBudgetMember(req.params.journeyId, req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, "Member added", { member }));
});
export const getMembers = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const members = await getBudgetMembers(req.params.journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Members fetched", { members }));
});
export const removeMember = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    await deleteBudgetMember(req.params.memberId, req.params.journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Member removed"));
});
// --- Expenses ---
export const createExp = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const expense = await addExpense(req.params.journeyId, req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, "Expense added", { expense }));
});
export const getExps = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const expenses = await getExpenses(req.params.journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Expenses fetched", { expenses }));
});
export const updateExp = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const expense = await updateExpense(req.params.expenseId, req.params.journeyId, req.user.id, req.body);
    res.status(200).json(new ApiResponse(200, "Expense updated", { expense }));
});
export const removeExp = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    await deleteExpense(req.params.expenseId, req.params.journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Expense removed"));
});
// --- Summary ---
export const getSummary = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const summary = await getBudgetSummary(req.params.journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Budget summary fetched", { summary }));
});
// --- Categories ---
export const createCat = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const category = await addCategory(req.params.journeyId, req.user.id, req.body.name, req.body.color);
    res.status(201).json(new ApiResponse(201, "Category created", { category }));
});
export const getCats = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const categories = await getCategories(req.params.journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Categories fetched", { categories }));
});

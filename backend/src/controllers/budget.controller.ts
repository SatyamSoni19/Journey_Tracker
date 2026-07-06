import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  addBudgetMember,
  getBudgetMembers,
  deleteBudgetMember,
  updateBudgetMember,
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
  addCategory,
  getCategories,
} from "../services/budget.service.js";
import type { CreateBudgetMemberInput, CreateExpenseInput, UpdateExpenseInput } from "../types/budget.types.js";

// --- Members ---
export const createMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const member = await addBudgetMember(req.params.journeyId as string, req.user.id, req.body as CreateBudgetMemberInput);
  res.status(201).json(new ApiResponse(201, "Member added", { member }));
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const member = await updateBudgetMember(req.params.memberId as string, req.params.journeyId as string, req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, "Member updated", { member }));
});

export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const members = await getBudgetMembers(req.params.journeyId as string, req.user.id);
  res.status(200).json(new ApiResponse(200, "Members fetched", { members }));
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await deleteBudgetMember(req.params.memberId as string, req.params.journeyId as string, req.user.id);
  res.status(200).json(new ApiResponse(200, "Member removed"));
});

// --- Expenses ---
export const createExp = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const expense = await addExpense(req.params.journeyId as string, req.user.id, req.body as CreateExpenseInput);
  res.status(201).json(new ApiResponse(201, "Expense added", { expense }));
});

export const getExps = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const expenses = await getExpenses(req.params.journeyId as string, req.user.id);
  res.status(200).json(new ApiResponse(200, "Expenses fetched", { expenses }));
});

export const updateExp = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const expense = await updateExpense(req.params.expenseId as string, req.params.journeyId as string, req.user.id, req.body as UpdateExpenseInput);
  res.status(200).json(new ApiResponse(200, "Expense updated", { expense }));
});

export const removeExp = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await deleteExpense(req.params.expenseId as string, req.params.journeyId as string, req.user.id);
  res.status(200).json(new ApiResponse(200, "Expense removed"));
});

// --- Summary ---
export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const summary = await getBudgetSummary(req.params.journeyId as string, req.user.id);
  res.status(200).json(new ApiResponse(200, "Budget summary fetched", { summary }));
});

// --- Categories ---
export const createCat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const category = await addCategory(req.params.journeyId as string, req.user.id, req.body.name, req.body.color);
  res.status(201).json(new ApiResponse(201, "Category created", { category }));
});

export const getCats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const categories = await getCategories(req.params.journeyId as string, req.user.id);
  res.status(200).json(new ApiResponse(200, "Categories fetched", { categories }));
});

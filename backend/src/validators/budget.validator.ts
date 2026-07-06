import { z } from "zod";

export const createBudgetMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    avatarUrl: z.string().url().optional().or(z.literal("")),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    paidById: z.string().min(1, "Paid by is required"),
    date: z.string().datetime({ offset: true }).or(z.string().date()),
    notes: z.string().optional(),
    splits: z.array(z.object({
      memberId: z.string().min(1),
      amount: z.number().nonnegative(),
    })).min(1, "At least one split is required"),
  }),
});

export const updateExpenseSchema = z.object({
  params: z.object({
    journeyId: z.string().min(1),
    expenseId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    currency: z.string().optional(),
    categoryId: z.string().min(1).optional(),
    paidById: z.string().min(1).optional(),
    date: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    notes: z.string().nullish(),
    splits: z.array(z.object({
      memberId: z.string().min(1),
      amount: z.number().nonnegative(),
    })).min(1).optional(),
  }),
});

export const budgetMemberIdParamSchema = z.object({
  params: z.object({
    journeyId: z.string().min(1),
    memberId: z.string().min(1),
  }),
});

export const expenseIdParamSchema = z.object({
  params: z.object({
    journeyId: z.string().min(1),
    expenseId: z.string().min(1),
  }),
});

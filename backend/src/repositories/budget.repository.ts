import { prisma } from "../config/db.js";
import type { BudgetMember, Expense, ExpenseCategory } from "../generated/prisma/client.js";
import type { CreateBudgetMemberInput, CreateExpenseInput, UpdateExpenseInput } from "../types/budget.types.js";

// --- Categories ---

export async function createExpenseCategory(journeyId: string, name: string, color: string) {
  return prisma.expenseCategory.create({
    data: { journeyId, name, color },
  });
}

export async function findExpenseCategories(journeyId: string) {
  return prisma.expenseCategory.findMany({
    where: { journeyId },
    orderBy: { createdAt: "asc" },
  });
}

export async function ensureDefaultCategories(journeyId: string) {
  const existing = await findExpenseCategories(journeyId);
  if (existing.length > 0) return existing;

  const defaults = [
    { name: "Transport", color: "#FBA15A" },
    { name: "Food", color: "#34D399" },
    { name: "Stay", color: "#60A5FA" },
    { name: "Shopping", color: "#A78BFA" },
    { name: "Entertainment", color: "#F472B6" },
    { name: "Miscellaneous", color: "#9CA3AF" },
  ];

  await prisma.expenseCategory.createMany({
    data: defaults.map(d => ({ journeyId, name: d.name, color: d.color, isDefault: true })),
  });
  
  return findExpenseCategories(journeyId);
}

// --- Members ---

export async function createBudgetMember(journeyId: string, data: CreateBudgetMemberInput): Promise<BudgetMember> {
  return prisma.budgetMember.create({
    data: {
      journeyId,
      name: data.name,
      email: data.email || null,
      avatarUrl: data.avatarUrl || null,
    },
  });
}

export async function findBudgetMembersByJourney(journeyId: string): Promise<BudgetMember[]> {
  return prisma.budgetMember.findMany({
    where: { journeyId },
    orderBy: { createdAt: "asc" },
  });
}

export async function findBudgetMemberById(id: string): Promise<BudgetMember | null> {
  return prisma.budgetMember.findUnique({
    where: { id },
  });
}

export async function updateBudgetMember(id: string, data: { name?: string; avatarUrl?: string }): Promise<BudgetMember> {
  return prisma.budgetMember.update({
    where: { id },
    data,
  });
}

export async function deleteBudgetMember(id: string): Promise<BudgetMember> {
  return prisma.budgetMember.delete({
    where: { id },
  });
}

// --- Expenses ---

export async function createExpense(journeyId: string, data: CreateExpenseInput) {
  return prisma.expense.create({
    data: {
      journeyId,
      title: data.title,
      amount: data.amount,
      currency: data.currency ?? "INR",
      categoryId: data.categoryId,
      paidById: data.paidById,
      date: new Date(data.date),
      notes: data.notes,
      splits: {
        create: data.splits.map(split => ({
          memberId: split.memberId,
          amount: split.amount,
        })),
      },
    },
    include: {
      splits: { include: { member: true } },
      paidBy: true,
      category: true,
    },
  });
}

export async function findExpensesByJourney(journeyId: string) {
  return prisma.expense.findMany({
    where: { journeyId },
    include: {
      splits: { include: { member: true } },
      paidBy: true,
      category: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function findExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: { splits: { include: { member: true } }, category: true },
  });
}

export async function updateExpense(id: string, data: UpdateExpenseInput) {
  if (data.splits) {
    await prisma.expenseSplit.deleteMany({
      where: { expenseId: id },
    });
  }

  return prisma.expense.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.paidById !== undefined && { paidById: data.paidById }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.splits !== undefined && {
        splits: {
          create: data.splits.map(split => ({
            memberId: split.memberId,
            amount: split.amount,
          })),
        },
      }),
    },
    include: {
      splits: { include: { member: true } },
      paidBy: true,
      category: true,
    },
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({
    where: { id },
  });
}

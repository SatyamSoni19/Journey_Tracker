import type { BudgetMember, Expense, ExpenseSplit } from "../generated/prisma/client.js";

export type { BudgetMember, Expense, ExpenseSplit };

export interface CreateBudgetMemberInput {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface ExpenseSplitInput {
  memberId: string;
  amount: number;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  currency?: string;
  categoryId: string;
  paidById: string;
  date: string;
  notes?: string;
  splits: ExpenseSplitInput[];
}

export interface UpdateExpenseInput {
  title?: string;
  amount?: number;
  currency?: string;
  categoryId?: string;
  paidById?: string;
  date?: string;
  notes?: string | null;
  splits?: ExpenseSplitInput[];
}

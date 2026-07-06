import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function getGlobalDashboardSummary(userId: string) {
  // 1. Get all journeys for the user
  const journeys = await prisma.journey.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      title: true,
      budget: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  if (journeys.length === 0) {
    return {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      recentExpenses: [],
      categories: [],
      activeJourneysCount: 0,
    };
  }

  const journeyIds = journeys.map((j) => j.id);
  const totalBudget = journeys.reduce((sum, j) => sum + j.budget, 0);

  // 2. Get all expenses across these journeys
  const expenses = await prisma.expense.findMany({
    where: { journeyId: { in: journeyIds } },
    include: {
      category: true,
      journey: { select: { title: true } },
    },
    orderBy: { date: "desc" },
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 3. Category breakdown
  const categoryMap = new Map<string, { amount: number; color: string }>();
  expenses.forEach((e) => {
    const catName = e.category.name;
    const current = categoryMap.get(catName);
    if (current) {
      categoryMap.set(catName, { amount: current.amount + e.amount, color: current.color });
    } else {
      categoryMap.set(catName, { amount: e.amount, color: e.category.color });
    }
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 4. Last 30 days spending logic could be added, but for now we'll just return recent
  const recentExpenses = expenses.slice(0, 10).map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    currency: e.currency,
    categoryName: e.category.name,
    categoryColor: e.category.color,
    journeyTitle: e.journey.title,
    date: e.date,
  }));

  const activeJourneysCount = journeys.filter(j => j.status === "ONGOING").length;

  return {
    totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    recentExpenses,
    categories,
    activeJourneysCount,
  };
}

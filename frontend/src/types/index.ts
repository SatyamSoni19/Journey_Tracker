export type JourneyStatus = "PLANNED" | "ONGOING" | "COMPLETED";

export interface Trip {
  id: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: JourneyStatus | "upcoming" | "draft";
  currency: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  tripId: string;
}

export interface Activity {
  id: string;
  type: "expense" | "trip" | "budget" | "ai" | "split";
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  currency: string;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface Recommendation {
  id: string;
  destination: string;
  image: string;
  rating: number;
  priceLevel: 1 | 2 | 3 | 4;
  description: string;
  tags: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: "info" | "success" | "warning";
}

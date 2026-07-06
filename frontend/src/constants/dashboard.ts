import type {
  Trip,
  Activity,
  BudgetOverview,
  Recommendation,
  QuickAction,
  Notification,
} from "@/types";

// ─── AI Suggestions ─────────────────────────────────────
export const AI_SUGGESTIONS = [
  "Plan a 7-day Japan trip",
  "Goa weekend getaway",
  "Bali on a budget",
  "Europe backpacking route",
] as const;

// ─── Quick Actions ──────────────────────────────────────
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-journey",
    title: "Start New Journey",
    description: "Create a new trip from scratch",
    icon: "Compass",
    color: "#FBA15A",
    href: "/",
  },
  {
    id: "plan-ai",
    title: "Plan with AI",
    description: "Let AI craft your perfect itinerary",
    icon: "Sparkles",
    color: "#60A5FA",
    href: "/",
  },
  {
    id: "add-expense",
    title: "Add Expense",
    description: "Track a new spending entry",
    icon: "Receipt",
    color: "#34D399",
    href: "/",
  },
  {
    id: "split-bill",
    title: "Split Bill",
    description: "Divide costs with travel buddies",
    icon: "Users",
    color: "#A78BFA",
    href: "/",
  },
  {
    id: "budget-planner",
    title: "Budget Planner",
    description: "Set and manage trip budgets",
    icon: "PiggyBank",
    color: "#F472B6",
    href: "/",
  },
];

// ─── Upcoming Trips ─────────────────────────────────────
export const UPCOMING_TRIPS: Trip[] = [
  {
    id: "1",
    destination: "Tokyo, Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop&q=80",
    startDate: "2026-08-15",
    endDate: "2026-08-22",
    budget: 150000,
    spent: 42000,
    status: "upcoming",
    currency: "₹",
  },
  {
    id: "2",
    destination: "Bali, Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop&q=80",
    startDate: "2026-09-01",
    endDate: "2026-09-08",
    budget: 80000,
    spent: 15000,
    status: "upcoming",
    currency: "₹",
  },
  {
    id: "3",
    destination: "Paris, France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop&q=80",
    startDate: "2026-10-10",
    endDate: "2026-10-18",
    budget: 200000,
    spent: 0,
    status: "draft",
    currency: "₹",
  },
  {
    id: "4",
    destination: "Goa, India",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=400&fit=crop&q=80",
    startDate: "2026-07-20",
    endDate: "2026-07-24",
    budget: 25000,
    spent: 18500,
    status: "ONGOING",
    currency: "₹",
  },
];

// ─── Budget Overview ────────────────────────────────────
export const BUDGET_OVERVIEW: BudgetOverview = {
  totalBudget: 455000,
  totalSpent: 75500,
  remaining: 379500,
  currency: "₹",
  categories: [
    { name: "Flights", amount: 32000, color: "#FBA15A", percentage: 42 },
    { name: "Hotels", amount: 22000, color: "#60A5FA", percentage: 29 },
    { name: "Food", amount: 11500, color: "#34D399", percentage: 15 },
    { name: "Activities", amount: 6000, color: "#A78BFA", percentage: 8 },
    { name: "Transport", amount: 4000, color: "#F472B6", percentage: 6 },
  ],
};

// ─── Recent Activity ────────────────────────────────────
export const RECENT_ACTIVITIES: Activity[] = [
  {
    id: "a1",
    type: "expense",
    title: "Flight Booking",
    description: "Booked round-trip flight to Tokyo",
    timestamp: "2 hours ago",
  },
  {
    id: "a2",
    type: "ai",
    title: "AI Itinerary Generated",
    description: "7-day Japan itinerary created",
    timestamp: "5 hours ago",
  },
  {
    id: "a3",
    type: "budget",
    title: "Budget Updated",
    description: "Increased Bali trip budget to ₹80,000",
    timestamp: "1 day ago",
  },
  {
    id: "a4",
    type: "split",
    title: "Bill Split",
    description: "Goa hotel bill split with 3 friends",
    timestamp: "2 days ago",
  },
  {
    id: "a5",
    type: "trip",
    title: "New Trip Created",
    description: "Paris, France added to your journeys",
    timestamp: "3 days ago",
  },
];

// ─── Recommendations ────────────────────────────────────
export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    destination: "Santorini, Greece",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=400&fit=crop&q=80",
    rating: 4.9,
    priceLevel: 3,
    description: "Iconic sunsets and white-washed architecture",
    tags: ["Beach", "Romantic", "Photography"],
  },
  {
    id: "r2",
    destination: "Kyoto, Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop&q=80",
    rating: 4.8,
    priceLevel: 2,
    description: "Ancient temples and serene bamboo groves",
    tags: ["Culture", "Nature", "Historic"],
  },
  {
    id: "r3",
    destination: "Swiss Alps",
    image:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=400&fit=crop&q=80",
    rating: 4.9,
    priceLevel: 4,
    description: "Breathtaking mountain landscapes and luxury",
    tags: ["Adventure", "Luxury", "Scenic"],
  },
  {
    id: "r4",
    destination: "Marrakech, Morocco",
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop&q=80",
    rating: 4.6,
    priceLevel: 1,
    description: "Vibrant souks and exotic architecture",
    tags: ["Culture", "Budget", "Food"],
  },
];

// ─── Notifications ──────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Trip Reminder",
    message: "Your Goa trip starts in 16 days!",
    read: false,
    timestamp: "1h ago",
    type: "info",
  },
  {
    id: "n2",
    title: "Budget Alert",
    message: "Goa trip spending is at 74% of budget",
    read: false,
    timestamp: "3h ago",
    type: "warning",
  },
  {
    id: "n3",
    title: "AI Suggestion",
    message: "New itinerary recommendation for Tokyo",
    read: true,
    timestamp: "1d ago",
    type: "success",
  },
];

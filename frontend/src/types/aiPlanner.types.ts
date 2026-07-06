import type { PlaceResult } from "./maps.types";

// ─── AI Planner Request ─────────────────────────────────
export interface AIPlannerRequest {
  prompt: string;
  destination?: string;
  budget?: number;
  days?: number;
  travelStyle?: "budget" | "mid-range" | "luxury" | "backpacker";
  interests?: string[];
  groupType?: "solo" | "couple" | "family" | "friends";
  journeyId?: string;
  currency?: string;
}

// ─── AI Planner Response ────────────────────────────────
export interface AIPlannerResponse {
  tripSummary: TripSummary;
  dailyItinerary: DayItinerary[];
  hotelRecommendations: HotelRecommendation[];
  restaurantRecommendations: RestaurantRecommendation[];
  packingList: string[];
  budgetBreakdown: BudgetBreakdown;
  emergencyTips: string[];
  thingsToAvoid: string[];
}

export interface TripSummary {
  destination: string;
  totalDays: number;
  estimatedBudget: number;
  currency: string;
  travelStyle: string;
  bestTimeToVisit: string;
  overview: string;
}

export interface DayItinerary {
  day: number;
  date?: string;
  theme: string;
  activities: ItineraryActivity[];
  meals: MealSuggestion[];
  estimatedDailyCost: number;
  tips: string;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  estimatedCost: number;
  place?: Partial<PlaceResult>;
  travelFromPrevious?: {
    distance: string;
    duration: string;
    mode: string;
  };
}

export interface MealSuggestion {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  suggestion: string;
  cuisineType: string;
  estimatedCost: number;
  place?: Partial<PlaceResult>;
}

export interface HotelRecommendation {
  name: string;
  category: "budget" | "mid-range" | "luxury";
  pricePerNight: number;
  whyRecommended: string;
  suitableFor: string[];
  place?: Partial<PlaceResult>;
}

export interface RestaurantRecommendation {
  name: string;
  cuisineType: string;
  priceRange: string;
  dietaryOptions: string[];
  whyRecommended: string;
  place?: Partial<PlaceResult>;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface SavedAIPlan {
  id: string;
  journeyId: string | null;
  prompt: string;
  destination: string;
  result: AIPlannerResponse;
  createdAt: string;
}

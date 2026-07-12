const API_BASE_URL = "http://localhost:5000/api/v1";

interface FieldError {
  field: string;
  message: string;
}

interface ApiSuccessBody<T> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
}

interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  data?: { errors?: FieldError[]; stack?: string };
}

export class ApiRequestError extends Error {
  public readonly statusCode: number;
  public readonly fieldErrors?: FieldError[];

  constructor(message: string, statusCode: number, fieldErrors?: FieldError[]) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody;

  if (!response.ok || !body.success) {
    if (response.status === 401 && !_isRetry && path !== "/auth/login" && path !== "/auth/register" && path !== "/auth/refresh") {
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      if (refreshed) {
        return apiRequest<T>(path, options, true);
      } else {
        // If refresh failed, they are really logged out. AuthContext restoreSession will fail or we can force redirect.
      }
    }

    const errorBody = body as ApiErrorBody;
    throw new ApiRequestError(
      errorBody.message ?? "Something went wrong. Please try again.",
      response.status,
      errorBody.data?.errors
    );
  }

  return (body as ApiSuccessBody<T>).data as T;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponseData {
  user: SafeUser;
  accessToken: string;
}

export const authApi = {
  register(input: { name: string; email: string; password: string }) {
    return apiRequest<{ user: SafeUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(input: { email: string; password: string }) {
    return apiRequest<AuthResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  logout() {
    return apiRequest<null>("/auth/logout", { method: "POST" });
  },

  getCurrentUser() {
    return apiRequest<{ user: SafeUser }>("/auth/me", { method: "GET" });
  },
};

// ─── Journey Types ──────────────────────────────────────

export type JourneyStatus = "PLANNED" | "ONGOING" | "COMPLETED";

export interface Journey {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  coverImage: string | null;
  coverImagePublicId: string | null;
  budget: number;
  startDate: string;
  endDate: string;
  status: JourneyStatus;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  // Google Maps location data
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  googlePlaceName?: string | null;
}

export interface CreateJourneyInput {
  title: string;
  destination: string;
  description?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: JourneyStatus;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  googlePlaceName?: string;
}

export interface UpdateJourneyInput {
  title?: string;
  destination?: string;
  description?: string | null;
  coverImage?: string | null;
  coverImagePublicId?: string | null;
  budget?: number;
  startDate?: string;
  endDate?: string;
  status?: JourneyStatus;
}

// ─── Journey API ────────────────────────────────────────

export const journeyApi = {
  list: () => apiRequest<{ journeys: Journey[] }>("/journeys"),
  getById: (id: string) => apiRequest<{ journey: Journey }>(`/journeys/${id}`),
  create: (data: Partial<Journey>) => apiRequest<{ journey: Journey }>("/journeys", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  createFromAIPlan: (planId: string) => apiRequest<{ journey: Journey }>(`/journeys/from-ai-plan/${planId}`, {
    method: "POST",
  }),
  update: (id: string, data: Partial<Journey>) => apiRequest<{ journey: Journey }>(`/journeys/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/journeys/${id}`, { method: "DELETE" }),
};

export interface TimelineEntry {
  id: string;
  journeyId: string;
  date: string;
  time: string;
  location: string;
  title: string;
  description?: string;
  sortOrder: number;
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  googlePlaceName?: string | null;
  media?: { id: string; mediaId: string; sortOrder: number; media: AlbumMedia }[];
}

export const timelineApi = {
  list: (journeyId: string) => apiRequest<{ entries: TimelineEntry[] }>(`/journeys/${journeyId}/timeline`),
  create: (journeyId: string, data: Partial<TimelineEntry>) => apiRequest<{ entry: TimelineEntry }>(`/journeys/${journeyId}/timeline`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (journeyId: string, entryId: string, data: Partial<TimelineEntry>) => apiRequest<{ entry: TimelineEntry }>(`/journeys/${journeyId}/timeline/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  delete: (journeyId: string, entryId: string) => apiRequest(`/journeys/${journeyId}/timeline/${entryId}`, { method: "DELETE" }),
};

export interface AlbumMedia {
  id: string;
  type: "PHOTO" | "VIDEO";
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  caption?: string;
  createdAt: string;
}

export const albumApi = {
  list: (journeyId: string) => apiRequest<{ media: AlbumMedia[] }>(`/journeys/${journeyId}/album`),
  create: (journeyId: string, data: Partial<AlbumMedia>) => apiRequest<{ media: AlbumMedia }>(`/journeys/${journeyId}/album`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  delete: (journeyId: string, mediaId: string) => apiRequest(`/journeys/${journeyId}/album/${mediaId}`, { method: "DELETE" }),
};

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  currency: string;
  categories: { name: string; amount: number; percentage: number; color: string }[];
  memberCount: number;
  expenseCount: number;
}

export interface BudgetMember {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  categoryId: string;
  category: ExpenseCategory;
  paidById: string;
  paidBy: BudgetMember;
  date: string;
  notes?: string;
  splits: { id: string; memberId: string; amount: number; settled: boolean; member: BudgetMember }[];
}

export const budgetApi = {
  getSummary: (journeyId: string) => apiRequest<{ summary: BudgetSummary }>(`/journeys/${journeyId}/budget/summary`),
  
  // Categories
  getCategories: (journeyId: string) => apiRequest<{ categories: ExpenseCategory[] }>(`/journeys/${journeyId}/budget/categories`),
  createCategory: (journeyId: string, data: { name: string; color: string }) => apiRequest<{ category: ExpenseCategory }>(`/journeys/${journeyId}/budget/categories`, { method: "POST", body: JSON.stringify(data) }),
  
  // Members
  getMembers: (journeyId: string) => apiRequest<{ members: BudgetMember[] }>(`/journeys/${journeyId}/budget/members`),
  createMember: (journeyId: string, data: Partial<BudgetMember>) => apiRequest<{ member: BudgetMember }>(`/journeys/${journeyId}/budget/members`, { method: "POST", body: JSON.stringify(data) }),
  updateMember: (journeyId: string, memberId: string, data: Partial<BudgetMember>) => apiRequest<{ member: BudgetMember }>(`/journeys/${journeyId}/budget/members/${memberId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteMember: (journeyId: string, memberId: string) => apiRequest(`/journeys/${journeyId}/budget/members/${memberId}`, { method: "DELETE" }),
  
  // Expenses
  getExpenses: (journeyId: string) => apiRequest<{ expenses: Expense[] }>(`/journeys/${journeyId}/budget/expenses`),
  createExpense: (journeyId: string, data: any) => apiRequest<{ expense: Expense }>(`/journeys/${journeyId}/budget/expenses`, { method: "POST", body: JSON.stringify(data) }),
  updateExpense: (journeyId: string, expenseId: string, data: any) => apiRequest<{ expense: Expense }>(`/journeys/${journeyId}/budget/expenses/${expenseId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteExpense: (journeyId: string, expenseId: string) => apiRequest(`/journeys/${journeyId}/budget/expenses/${expenseId}`, { method: "DELETE" }),
};

// ─── Dashboard API ──────────────────────────────────────

export interface DashboardSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  recentExpenses: any[];
  categories: { name: string; amount: number; percentage: number; color: string }[];
  activeJourneysCount: number;
}

export const dashboardApi = {
  getSummary: () => apiRequest<{ summary: DashboardSummary }>("/dashboard/summary"),
};

// ─── Upload Types ───────────────────────────────────────

export interface UploadResponse {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  duration?: number;
}

// ─── Upload API ─────────────────────────────────────────

export const uploadApi = {
  /**
   * Upload an image file via XHR (supports progress tracking).
   * Uses the same cookie-based auth as apiRequest.
   */
  uploadImage(
    file: File,
    folder?: string,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("image", file);

      const queryParams = folder ? `?folder=${encodeURIComponent(folder)}` : "";
      xhr.open("POST", `${API_BASE_URL}/uploads/image${queryParams}`);
      xhr.withCredentials = true;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const body = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && body.success) {
            resolve(body.data as UploadResponse);
          } else {
            reject(
              new ApiRequestError(
                body.message || "Upload failed",
                xhr.status
              )
            );
          }
        } catch {
          reject(new ApiRequestError("Upload failed — invalid response", xhr.status));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new ApiRequestError("Network error during upload", 0));
      });

      xhr.addEventListener("abort", () => {
        reject(new ApiRequestError("Upload cancelled", 0));
      });

      xhr.send(formData);
    });
  },
};

// ─── Places API ─────────────────────────────────────────

import type { AutocompletePrediction, LocationData, PlaceResult, DirectionsResult } from "@/types/maps.types";
import type { AIPlannerRequest, AIPlannerResponse, SavedAIPlan } from "@/types/aiPlanner.types";

export type { AutocompletePrediction, LocationData, PlaceResult, DirectionsResult };

export const placesApi = {
  autocomplete: (input: string, types?: string) =>
    apiRequest<{ predictions: AutocompletePrediction[] }>(
      `/places/autocomplete?input=${encodeURIComponent(input)}${types ? `&types=${types}` : ""}`
    ),
  getDetails: (placeId: string) =>
    apiRequest<{ place: PlaceResult }>(`/places/${placeId}`),
  reverseGeocode: (lat: number, lng: number) =>
    apiRequest<{ location: LocationData }>(
      `/places/reverse-geocode?lat=${lat}&lng=${lng}`
    ),
  nearby: (lat: number, lng: number, type: string, radius?: number, keyword?: string) => {
    const params = new URLSearchParams({ lat: lat.toString(), lng: lng.toString(), type });
    if (radius) params.set("radius", radius.toString());
    if (keyword) params.set("keyword", keyword);
    return apiRequest<{ places: PlaceResult[] }>(`/places/nearby?${params}`);
  },
  directions: (origin: string, destination: string, mode?: string) => {
    const params = new URLSearchParams({ origin, destination });
    if (mode) params.set("mode", mode);
    return apiRequest<{ directions: DirectionsResult }>(`/places/directions?${params}`);
  },
};

// ─── AI Planner API ───────────────────────────────────────

export const aiPlannerApi = {
  generatePlan: (data: AIPlannerRequest) => 
    apiRequest<{ plan: AIPlannerResponse; planId: string }>("/ai/plan", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  chat: (data: { journeyId: string; prompt: string; history: any[] }) =>
    apiRequest<{ response: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  chatWithPlan: (planId: string, data: { prompt: string; history: { role: string; parts: { text: string }[] }[] }) =>
    apiRequest<{ response: string }>(`/ai/plans/${planId}/chat`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listPlans: () => apiRequest<{ plans: SavedAIPlan[] }>("/ai/plans"),
  getPlan: (id: string) => apiRequest<{ plan: SavedAIPlan }>(`/ai/plans/${id}`),
  updatePlan: (id: string, destination: string) => apiRequest<{ plan: SavedAIPlan }>(`/ai/plans/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ destination }),
  }),
  deletePlan: (id: string) => apiRequest<{ message: string }>(`/ai/plans/${id}`, {
    method: "DELETE",
  }),
};
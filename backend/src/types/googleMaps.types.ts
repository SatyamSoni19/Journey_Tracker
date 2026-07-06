// ─── Core Location Data ─────────────────────────────────
export interface LocationData {
  placeId: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
  googlePlaceName: string;
}

// ─── Place Result ───────────────────────────────────────
export interface PlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types: string[];
  photos: PlacePhoto[];
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  website?: string;
  phoneNumber?: string;
}

export interface PlacePhoto {
  photoReference: string;
  height: number;
  width: number;
  url?: string;
}

// ─── Hotel Result ───────────────────────────────────────
export interface HotelResult extends PlaceResult {
  category: "budget" | "mid-range" | "luxury";
  distanceFromCenter?: number;
  suitableFor: string[];
}

// ─── Restaurant Result ──────────────────────────────────
export interface RestaurantResult extends PlaceResult {
  cuisineTypes: string[];
  dietaryOptions: string[];
}

// ─── Directions Result ──────────────────────────────────
export interface DirectionsResult {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  startAddress: string;
  endAddress: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  polyline: string;
  steps: DirectionsStep[];
  travelMode: string;
}

export interface DirectionsStep {
  instruction: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  travelMode: string;
}

// ─── Autocomplete ───────────────────────────────────────
export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

// ─── Search Filters ─────────────────────────────────────
export interface HotelSearchFilters {
  budget?: "budget" | "mid-range" | "luxury";
  minRating?: number;
  maxDistance?: number;
  suitableFor?: "family" | "couple" | "solo" | "backpacker";
}

export interface RestaurantSearchFilters {
  cuisine?: string;
  dietaryPreference?: "vegetarian" | "vegan" | "halal" | "any";
  type?: "cafe" | "fine_dining" | "street_food" | "restaurant";
  minRating?: number;
  maxDistance?: number;
}

export type TravelMode = "driving" | "walking" | "transit";

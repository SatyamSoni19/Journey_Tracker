// ─── Location Data ──────────────────────────────────────
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

// ─── Autocomplete Prediction ────────────────────────────
export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
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

// ─── Directions ─────────────────────────────────────────
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

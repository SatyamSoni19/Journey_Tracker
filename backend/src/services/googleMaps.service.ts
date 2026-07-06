import { env } from "../config/env.js";
import type {
  LocationData,
  PlaceResult,
  PlacePhoto,
  AutocompletePrediction,
  DirectionsResult,
  DirectionsStep,
  TravelMode,
} from "../types/googleMaps.types.js";

const MAPS_BASE = "https://maps.googleapis.com/maps/api";
const PLACES_NEW_BASE = "https://places.googleapis.com/v1";

// ─── Autocomplete (New API) ─────────────────────────────

export async function autocomplete(
  input: string,
  types?: string
): Promise<AutocompletePrediction[]> {
  const body: any = {
    input,
  };

  if (types) {
    body.includedPrimaryTypes = [types];
  }

  const res = await fetch(`${PLACES_NEW_BASE}/places:autocomplete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "Referer": "http://localhost:5173/",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!data.suggestions) {
    console.error("Autocomplete error:", JSON.stringify(data).substring(0, 300));
    return [];
  }

  return data.suggestions
    .filter((s: any) => s.placePrediction)
    .map((s: any) => {
      const p = s.placePrediction;
      return {
        placeId: p.placeId || p.place?.split("/").pop() || "",
        description: p.text?.text || "",
        mainText: p.structuredFormat?.mainText?.text || p.text?.text || "",
        secondaryText: p.structuredFormat?.secondaryText?.text || "",
        types: p.types || [],
      };
    });
}

// ─── Place Details (New API) ────────────────────────────

export async function getPlaceDetails(
  placeId: string
): Promise<PlaceResult | null> {
  const fieldMask = [
    "id",
    "displayName",
    "formattedAddress",
    "location",
    "rating",
    "userRatingCount",
    "priceLevel",
    "types",
    "photos",
    "currentOpeningHours",
    "websiteUri",
    "nationalPhoneNumber",
    "addressComponents",
  ].join(",");

  console.log("=== GOOGLE API REQUEST (getPlaceDetails) ===");
  console.log("URL:", `${PLACES_NEW_BASE}/places/${placeId}`);

  const res = await fetch(`${PLACES_NEW_BASE}/places/${placeId}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "Referer": "http://localhost:5173/",
      "X-Goog-FieldMask": fieldMask,
    },
  });
  const data = await res.json();
  
  console.log("=== GOOGLE API RESPONSE ===");
  if (data.error) {
    console.log("Error:", data.error);
  } else {
    console.log(`Success: Found ${data.displayName?.text}`);
  }

  if (!data.location) {
    console.error("Place details error:", JSON.stringify(data).substring(0, 300));
    return null;
  }

  return mapNewPlaceResult(data);
}

// ─── Reverse Geocode (Legacy Geocoding API) ─────────────

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<LocationData | null> {
  const body = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 50.0,
      },
    },
    maxResultCount: 1,
  };

  const fieldMask = [
    "places.id",
    "places.name",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.addressComponents",
  ].join(",");

  const res = await fetch(`${PLACES_NEW_BASE}/places:searchNearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "Referer": "http://localhost:5173/",
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!data.places || data.places.length === 0) {
    if (data.error) console.error("Reverse geocode error:", data.error.message);
    return null;
  }

  const p = data.places[0];
  const components = parseAddressComponents(p.addressComponents || []);

  return {
    placeId: p.id || p.name?.split("/").pop() || "",
    latitude: p.location?.latitude || lat,
    longitude: p.location?.longitude || lng,
    formattedAddress: p.formattedAddress || "",
    city: components.city,
    state: components.state,
    country: components.country,
    googlePlaceName: p.displayName?.text || p.formattedAddress || "",
  };
}

// ─── Nearby Search (New API) ────────────────────────────

export async function searchNearby(
  lat: number,
  lng: number,
  type: string,
  radius: number = 5000,
  keyword?: string
): Promise<PlaceResult[]> {
  const body: any = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius,
      },
    },
    includedTypes: [type],
    maxResultCount: 20,
  };

  if (keyword) {
    body.textQuery = keyword;
  }

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.types",
    "places.photos",
  ].join(",");

  const res = await fetch(`${PLACES_NEW_BASE}/places:searchNearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "Referer": "http://localhost:5173/",
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!data.places) {
    // Could be empty or error
    if (data.error) {
      console.error("Nearby search error:", data.error.message);
    }
    return [];
  }

  return data.places.map(mapNewPlaceResult);
}

// ─── Text Search (New API) ──────────────────────────────

export async function textSearch(
  query: string,
  type?: string
): Promise<PlaceResult[]> {
  const body: any = {
    textQuery: query,
    maxResultCount: 10,
  };

  if (type) {
    body.includedType = type;
  }

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.types",
    "places.photos",
  ].join(",");

  const res = await fetch(`${PLACES_NEW_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "Referer": "http://localhost:5173/",
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!data.places) {
    if (data.error) {
      console.error("Text search error:", data.error.message);
    }
    return [];
  }

  return data.places.map(mapNewPlaceResult);
}

// ─── Directions (Routes API) ────────────────────────────

export async function getDirections(
  origin: string,
  destination: string,
  mode: TravelMode = "driving"
): Promise<DirectionsResult | null> {
  // Routes API uses a different endpoint
  const body = {
    origin: { address: origin },
    destination: { address: destination },
    travelMode: mode.toUpperCase(),
    computeAlternativeRoutes: false,
    languageCode: "en",
  };

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "Referer": "http://localhost:5173/",
      "X-Goog-FieldMask": "routes.legs,routes.polyline,routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!data.routes?.[0]?.legs?.[0]) {
    // Fallback to legacy Directions API
    return getDirectionsLegacy(origin, destination, mode);
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    distance: {
      text: formatDistance(route.distanceMeters || 0),
      value: route.distanceMeters || 0,
    },
    duration: {
      text: formatDuration(route.duration || "0s"),
      value: parseInt(route.duration || "0") || 0,
    },
    startAddress: origin,
    endAddress: destination,
    startLocation: leg.startLocation?.latLng || { lat: 0, lng: 0 },
    endLocation: leg.endLocation?.latLng || { lat: 0, lng: 0 },
    polyline: route.polyline?.encodedPolyline || "",
    travelMode: mode,
    steps: (leg.steps || []).map((s: any): DirectionsStep => ({
      instruction: s.navigationInstruction?.instructions || "",
      distance: { text: formatDistance(s.distanceMeters || 0), value: s.distanceMeters || 0 },
      duration: { text: formatDuration(s.staticDuration || "0s"), value: parseInt(s.staticDuration || "0") || 0 },
      travelMode: mode,
    })),
  };
}

// Legacy Directions fallback
async function getDirectionsLegacy(
  origin: string,
  destination: string,
  mode: TravelMode = "driving"
): Promise<DirectionsResult | null> {
  const params = new URLSearchParams({
    origin,
    destination,
    mode,
    key: env.GOOGLE_MAPS_API_KEY,
  });

  const res = await fetch(
    `${MAPS_BASE}/directions/json?${params}`,
    {
      headers: {
        "Referer": "http://localhost:5173/",
      },
    }
  );
  const data = await res.json();

  if (data.status !== "OK" || !data.routes?.[0]?.legs?.[0]) return null;

  const leg = data.routes[0].legs[0];

  return {
    distance: { text: leg.distance.text, value: leg.distance.value },
    duration: { text: leg.duration.text, value: leg.duration.value },
    startAddress: leg.start_address,
    endAddress: leg.end_address,
    startLocation: leg.start_location,
    endLocation: leg.end_location,
    polyline: data.routes[0].overview_polyline?.points || "",
    travelMode: mode,
    steps: (leg.steps || []).map(
      (s: any): DirectionsStep => ({
        instruction: s.html_instructions?.replace(/<[^>]*>/g, "") || "",
        distance: { text: s.distance?.text || "", value: s.distance?.value || 0 },
        duration: { text: s.duration?.text || "", value: s.duration?.value || 0 },
        travelMode: s.travel_mode || mode,
      })
    ),
  };
}

// ─── Photo URL (New API) ────────────────────────────────

export function getPhotoUrl(
  photoName: string,
  maxWidth: number = 400
): string {
  // New Places API photo name format: "places/{placeId}/photos/{photoRef}"
  return `${PLACES_NEW_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&key=${env.GOOGLE_MAPS_API_KEY}`;
}

// ─── Internal Helpers ───────────────────────────────────

function mapNewPlaceResult(r: any): PlaceResult {
  const placeId = r.id || r.name?.split("/").pop() || "";

  // Map new priceLevel enums to numeric
  const priceLevelMap: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  const components = parseAddressComponents(r.addressComponents || []);

  return {
    placeId,
    name: r.displayName?.text || "",
    formattedAddress: r.formattedAddress || "",
    latitude: r.location?.latitude || 0,
    longitude: r.location?.longitude || 0,
    city: components.city,
    state: components.state,
    country: components.country,
    rating: r.rating,
    userRatingsTotal: r.userRatingCount,
    priceLevel: priceLevelMap[r.priceLevel] ?? undefined,
    types: r.types || [],
    photos: (r.photos || []).slice(0, 3).map(
      (p: any): PlacePhoto => ({
        photoReference: p.name || "",
        height: p.heightPx || 0,
        width: p.widthPx || 0,
        url: p.name ? getPhotoUrl(p.name) : undefined,
      })
    ),
    openingHours: r.currentOpeningHours
      ? {
          openNow: r.currentOpeningHours.openNow,
          weekdayText: r.currentOpeningHours.weekdayDescriptions,
        }
      : undefined,
    website: r.websiteUri,
    phoneNumber: r.nationalPhoneNumber,
  };
}

function parseAddressComponents(components: any[]): {
  city: string;
  state: string;
  country: string;
} {
  let city = "";
  let state = "";
  let country = "";

  for (const c of components) {
    const types = c.types || [];
    const name = c.longText || c.long_name || "";
    
    if (types.includes("locality")) city = name;
    else if (types.includes("administrative_area_level_2") && !city)
      city = name;
    if (types.includes("administrative_area_level_1"))
      state = name;
    if (types.includes("country")) country = name;
  }

  return { city, state, country };
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

function formatDuration(duration: string): string {
  // duration is like "1234s"
  const seconds = parseInt(duration) || 0;
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainMins = minutes % 60;
  return remainMins > 0 ? `${hours} hr ${remainMins} min` : `${hours} hr`;
}

// ─── Helper: Get Location Data from Place ID ────────────

export async function getLocationDataFromPlaceId(
  placeId: string
): Promise<LocationData | null> {
  const place = await getPlaceDetails(placeId);
  if (!place) return null;

  // Fetch address components via geocode for city/state/country
  const geocode = await reverseGeocode(place.latitude, place.longitude);

  return {
    placeId: place.placeId,
    latitude: place.latitude,
    longitude: place.longitude,
    formattedAddress: place.formattedAddress,
    city: geocode?.city || "",
    state: geocode?.state || "",
    country: geocode?.country || "",
    googlePlaceName: place.name,
  };
}

/**
 * ─── AI Planner Service ─────────────────────────────────
 * The orchestration engine:
 *   User Prompt → Gemini (extract intent)
 *                   → Google Maps (real places)
 *                     → Gemini (plan with real data)
 *                       → Merged response
 */

import { generateStructuredResponse, generateChatResponse } from "./gemini.service.js";
import { prisma } from "../config/db.js";
import {
  searchNearby,
  textSearch,
  getPhotoUrl,
} from "./googleMaps.service.js";
import {
  getSystemPrompt,
  getIntentExtractionPrompt,
  buildTripPlanPrompt,
} from "./aiPrompt.service.js";
import type {
  AIPlannerRequest,
  AIPlannerResponse,
  ExtractedTripIntent,
} from "../types/aiPlanner.types.js";
import type { PlaceResult } from "../types/googleMaps.types.js";

/**
 * Main entry point — generates a complete AI trip plan.
 */
export async function generateTripPlan(
  request: AIPlannerRequest
): Promise<AIPlannerResponse> {
  // Step 1: Extract trip intent from natural language
  const intent = await extractTripIntent(request);

  // Step 2: Fetch real places from Google Maps
  const realPlaces = await fetchRealPlaces(intent);

  // Step 3: Build context string from real places
  const placesContext = buildPlacesContext(realPlaces);

  // Step 4: Generate final plan with Gemini using real places
  const plan = await generateStructuredResponse<AIPlannerResponse>(
    getSystemPrompt(),
    buildTripPlanPrompt(intent, placesContext)
  );

  // Step 5: Enrich plan with Google Maps data
  const enrichedPlan = await enrichPlanWithPlaces(plan, realPlaces);

  return enrichedPlan;
}

// ─── Step 1: Extract Intent ─────────────────────────────

async function extractTripIntent(
  request: AIPlannerRequest
): Promise<ExtractedTripIntent> {
  // If the user provided explicit parameters, use them
  if (request.destination && request.days) {
    return {
      destination: request.destination,
      budget: request.budget || 0,
      days: request.days,
      currency: request.currency || "INR",
      travelStyle: request.travelStyle || "mid-range",
      interests: request.interests || [],
      groupType: request.groupType || "solo",
    };
  }

  // Otherwise, extract from natural language prompt
  const extracted = await generateStructuredResponse<ExtractedTripIntent>(
    getIntentExtractionPrompt(),
    request.prompt
  );

  // Override with explicit params if provided
  return {
    destination: request.destination || extracted.destination,
    budget: request.budget || extracted.budget,
    days: request.days || extracted.days || 3,
    currency: request.currency || extracted.currency || "INR",
    travelStyle: request.travelStyle || extracted.travelStyle || "mid-range",
    interests: request.interests?.length
      ? request.interests
      : extracted.interests || [],
    groupType: request.groupType || extracted.groupType || "solo",
  };
}

// ─── Step 2: Fetch Real Places ──────────────────────────

interface RealPlacesData {
  attractions: PlaceResult[];
  hotels: PlaceResult[];
  restaurants: PlaceResult[];
  destination: PlaceResult | null;
}

async function fetchRealPlaces(
  intent: ExtractedTripIntent
): Promise<RealPlacesData> {
  // Get destination coordinates first
  const destResults = await textSearch(intent.destination);
  const destination = destResults[0] || null;

  if (!destination) {
    return { attractions: [], hotels: [], restaurants: [], destination: null };
  }

  const lat = destination.latitude;
  const lng = destination.longitude;

  // Fetch in parallel for speed
  const [attractions, hotels, restaurants] = await Promise.all([
    searchNearby(lat, lng, "tourist_attraction", 15000).then((r) =>
      r.slice(0, 15)
    ),
    searchNearby(lat, lng, "lodging", 10000).then((r) => r.slice(0, 10)),
    searchNearby(lat, lng, "restaurant", 10000).then((r) => r.slice(0, 10)),
  ]);

  return { attractions, hotels, restaurants, destination };
}

// ─── Step 3: Build Places Context ───────────────────────

function buildPlacesContext(places: RealPlacesData): string {
  const sections: string[] = [];

  if (places.destination) {
    sections.push(
      `DESTINATION: ${places.destination.name} (${places.destination.formattedAddress})`
    );
  }

  if (places.attractions.length > 0) {
    const list = places.attractions
      .map(
        (a) =>
          `- ${a.name} (Rating: ${a.rating || "N/A"}, ${a.formattedAddress})`
      )
      .join("\n");
    sections.push(`\nTOURIST ATTRACTIONS:\n${list}`);
  }

  if (places.hotels.length > 0) {
    const list = places.hotels
      .map(
        (h) =>
          `- ${h.name} (Rating: ${h.rating || "N/A"}, Price Level: ${h.priceLevel || "N/A"}, ${h.formattedAddress})`
      )
      .join("\n");
    sections.push(`\nHOTELS:\n${list}`);
  }

  if (places.restaurants.length > 0) {
    const list = places.restaurants
      .map(
        (r) =>
          `- ${r.name} (Rating: ${r.rating || "N/A"}, Price Level: ${r.priceLevel || "N/A"}, ${r.formattedAddress})`
      )
      .join("\n");
    sections.push(`\nRESTAURANTS:\n${list}`);
  }

  return sections.join("\n") || "No specific place data available.";
}

// ─── Step 5: Enrich Plan with Google Maps Data ──────────

async function enrichPlanWithPlaces(
  plan: AIPlannerResponse,
  realPlaces: RealPlacesData
): Promise<AIPlannerResponse> {
  // Enrich hotel recommendations with real Google Maps data
  if (plan.hotelRecommendations && realPlaces.hotels.length > 0) {
    plan.hotelRecommendations = plan.hotelRecommendations.map((hotel, i) => {
      const match = findBestMatch(hotel.name, realPlaces.hotels);
      if (match) {
        hotel.place = {
          placeId: match.placeId,
          name: match.name,
          formattedAddress: match.formattedAddress,
          latitude: match.latitude,
          longitude: match.longitude,
          rating: match.rating,
          userRatingsTotal: match.userRatingsTotal,
          photos: match.photos,
          priceLevel: match.priceLevel,
        };
      } else if (realPlaces.hotels[i]) {
        // Fall back to index-based matching
        const h = realPlaces.hotels[i];
        hotel.place = {
          placeId: h.placeId,
          name: h.name,
          formattedAddress: h.formattedAddress,
          latitude: h.latitude,
          longitude: h.longitude,
          rating: h.rating,
          userRatingsTotal: h.userRatingsTotal,
          photos: h.photos,
          priceLevel: h.priceLevel,
        };
      }
      return hotel;
    });
  }

  // Enrich restaurant recommendations
  if (plan.restaurantRecommendations && realPlaces.restaurants.length > 0) {
    plan.restaurantRecommendations = plan.restaurantRecommendations.map(
      (rest, i) => {
        const match = findBestMatch(rest.name, realPlaces.restaurants);
        if (match) {
          rest.place = {
            placeId: match.placeId,
            name: match.name,
            formattedAddress: match.formattedAddress,
            latitude: match.latitude,
            longitude: match.longitude,
            rating: match.rating,
            photos: match.photos,
            priceLevel: match.priceLevel,
          };
        } else if (realPlaces.restaurants[i]) {
          const r = realPlaces.restaurants[i];
          rest.place = {
            placeId: r.placeId,
            name: r.name,
            formattedAddress: r.formattedAddress,
            latitude: r.latitude,
            longitude: r.longitude,
            rating: r.rating,
            photos: r.photos,
            priceLevel: r.priceLevel,
          };
        }
        return rest;
      }
    );
  }

  // Enrich daily itinerary activities with real attraction data
  if (plan.dailyItinerary && realPlaces.attractions.length > 0) {
    let attractionIndex = 0;
    for (const day of plan.dailyItinerary) {
      for (const activity of day.activities) {
        const match = findBestMatch(activity.title, realPlaces.attractions);
        if (match) {
          activity.place = {
            placeId: match.placeId,
            name: match.name,
            formattedAddress: match.formattedAddress,
            latitude: match.latitude,
            longitude: match.longitude,
            rating: match.rating,
            photos: match.photos,
          };
        } else if (realPlaces.attractions[attractionIndex]) {
          const a = realPlaces.attractions[attractionIndex];
          activity.place = {
            placeId: a.placeId,
            name: a.name,
            formattedAddress: a.formattedAddress,
            latitude: a.latitude,
            longitude: a.longitude,
            rating: a.rating,
            photos: a.photos,
          };
          attractionIndex =
            (attractionIndex + 1) % realPlaces.attractions.length;
        }
      }
    }
  }

  return plan;
}

// ─── Fuzzy Match Helper ─────────────────────────────────

function findBestMatch(
  name: string,
  places: PlaceResult[]
): PlaceResult | null {
  const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  let bestMatch: PlaceResult | null = null;
  let bestScore = 0;

  for (const place of places) {
    const placeName = place.name.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    let score = 0;

    for (const word of words) {
      if (placeName.includes(word)) score++;
    }

    // Normalize score by word count
    const normalizedScore = words.length > 0 ? score / words.length : 0;

    if (normalizedScore > bestScore && normalizedScore >= 0.3) {
      bestScore = normalizedScore;
      bestMatch = place;
    }
  }

  return bestMatch;
}

export async function generateContextualChat(
  userId: string,
  journeyId: string,
  prompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<string> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId, ownerId: userId },
    include: {
      timelineEntries: true,
      expenses: true,
      media: true,
    }
  });

  if (!journey) {
    throw new Error("Journey not found");
  }

  const systemPrompt = `You are an expert personal AI Travel Assistant for the current trip.
Your goal is to answer the user's questions using the current journey context.
When recommending places (hotels, restaurants, attractions, cafes), you MUST use this JSON format inline within your markdown text, so the frontend can parse it and inject a Google Maps Place Card:

[PLACE_RECOMMENDATION: {"name": "Hotel Name", "type": "hotel", "query": "Hotel Name, City"}]

Here is the current journey context:
Destination: ${journey.destination}
Start Date: ${journey.startDate}
End Date: ${journey.endDate}
Budget: ${journey.budget}
Timeline Entries: ${journey.timelineEntries.length}
Expenses Tracked: ${journey.expenses.length}

Provide short, highly relevant, and helpful advice. Always suggest realistic places that exist. Format nicely using markdown.`;

  return await generateChatResponse(systemPrompt, history, prompt);
}

/**
 * ─── AI Prompt Service ──────────────────────────────────
 * Centralized prompt engineering for JourneyTracker.
 * No hardcoded prompts in controllers — everything lives here.
 */

import type { ExtractedTripIntent } from "../types/aiPlanner.types.js";

// ─── System Prompt ──────────────────────────────────────

const TRAVEL_PLANNER_SYSTEM_PROMPT = `You are JourneyTracker AI — a world-class professional travel planner.

RULES:
1. You MUST return valid JSON only. Never return markdown, plain text, or code fences.
2. You MUST NOT invent or hallucinate hotel names, restaurant names, or attraction names.
3. You suggest TYPES of places (e.g., "a boutique hotel near the old town", "a rooftop restaurant with city views").
4. You optimize budgets — never over-allocate.
5. You cluster nearby attractions to minimize travel time.
6. You prefer highly-rated places.
7. You recommend hidden gems and local experiences alongside popular attractions.
8. You consider weather patterns and seasonal recommendations.
9. You consider typical opening hours (museums close Mondays in many countries, etc.).
10. You balance sightseeing with rest — no 18-hour packed days.
11. You avoid unrealistic itineraries (no visiting 3 cities in 1 day).
12. You include practical emergency tips for the destination.
13. You suggest what to avoid (tourist traps, unsafe areas, common scams).
14. All costs should be estimated in the requested currency.
15. You MUST structure activities by time of day (morning, afternoon, evening).
16. Each activity must have a realistic time slot and duration.`;

// ─── Intent Extraction Prompt ───────────────────────────

const INTENT_EXTRACTION_SYSTEM_PROMPT = `You are a travel query parser. Extract structured trip parameters from natural language.

RULES:
1. Return valid JSON only.
2. If the user doesn't specify a value, use reasonable defaults.
3. Default currency: INR
4. Default days: 3
5. Default travel style: mid-range
6. Default group type: solo

Return this exact JSON structure:
{
  "destination": "string — the primary destination city/region",
  "budget": number — total trip budget in the specified currency (0 if not mentioned),
  "days": number — number of days,
  "currency": "string — currency code",
  "travelStyle": "budget | mid-range | luxury | backpacker",
  "interests": ["string array of interests/preferences extracted from prompt"],
  "groupType": "solo | couple | family | friends"
}`;

// ─── Trip Planning Prompt ───────────────────────────────

export function buildTripPlanPrompt(intent: ExtractedTripIntent, realPlacesContext: string): string {
  return `Plan a ${intent.days}-day trip to ${intent.destination}.

TRIP PARAMETERS:
- Budget: ${intent.budget > 0 ? `${intent.budget} ${intent.currency}` : "Flexible"}
- Travel Style: ${intent.travelStyle}
- Group Type: ${intent.groupType}
- Interests: ${intent.interests.length > 0 ? intent.interests.join(", ") : "General sightseeing"}

REAL PLACES DATA (from Google Maps — use these for accuracy):
${realPlacesContext}

Based on the real places above, create a structured itinerary.

Return this JSON structure:
{
  "tripSummary": {
    "destination": "string",
    "totalDays": number,
    "estimatedBudget": number,
    "currency": "string",
    "travelStyle": "string",
    "bestTimeToVisit": "string",
    "overview": "string — 2-3 sentence trip overview"
  },
  "dailyItinerary": [
    {
      "day": number,
      "theme": "string — e.g., 'Historical Exploration', 'Food & Culture'",
      "activities": [
        {
          "time": "string — e.g., '09:00 AM'",
          "title": "string — activity name",
          "description": "string — 1-2 sentence description",
          "duration": "string — e.g., '2 hours'",
          "category": "sightseeing | adventure | culture | shopping | relaxation | nature | food",
          "estimatedCost": number
        }
      ],
      "meals": [
        {
          "type": "breakfast | lunch | dinner | snack",
          "suggestion": "string — describe the type of meal/restaurant",
          "cuisineType": "string",
          "estimatedCost": number
        }
      ],
      "estimatedDailyCost": number,
      "tips": "string — one practical tip for this day"
    }
  ],
  "hotelRecommendations": [
    {
      "name": "string — describe the type (e.g., 'Boutique hotel near old town')",
      "category": "budget | mid-range | luxury",
      "pricePerNight": number,
      "whyRecommended": "string",
      "suitableFor": ["string array"]
    }
  ],
  "restaurantRecommendations": [
    {
      "name": "string — describe the type of restaurant",
      "cuisineType": "string",
      "priceRange": "string — e.g., '₹500-800 per person'",
      "dietaryOptions": ["vegetarian", "non-vegetarian", etc.],
      "whyRecommended": "string"
    }
  ],
  "packingList": ["string array of essential items"],
  "budgetBreakdown": {
    "accommodation": number,
    "food": number,
    "transportation": number,
    "activities": number,
    "shopping": number,
    "miscellaneous": number,
    "total": number,
    "currency": "string"
  },
  "emergencyTips": ["string array"],
  "thingsToAvoid": ["string array"]
}`;
}

// ─── Exports ────────────────────────────────────────────

export function getSystemPrompt(): string {
  return TRAVEL_PLANNER_SYSTEM_PROMPT;
}

export function getIntentExtractionPrompt(): string {
  return INTENT_EXTRACTION_SYSTEM_PROMPT;
}

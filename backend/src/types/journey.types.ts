import type { Journey, JourneyStatus } from "../generated/prisma/client.js";

export type { Journey, JourneyStatus };

export interface CreateJourneyInput {
  title: string;
  destination: string;
  description?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  budget: number;
  startDate: string; // ISO string from client
  endDate: string;
  status?: JourneyStatus;
  // Google Maps location data
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

import type { TimelineEntry, TimelineMedia, Media as AlbumMedia } from "../generated/prisma/client.js";

export type { TimelineEntry, TimelineMedia };

export interface CreateTimelineEntryInput {
  date: string; // ISO
  time: string;
  location: string;
  title: string;
  description?: string;
  sortOrder?: number;
  albumMediaIds?: string[];
  // Google Maps location data
  placeId?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  googlePlaceName?: string;
}

export interface UpdateTimelineEntryInput {
  date?: string;
  time?: string;
  location?: string;
  title?: string;
  description?: string | null;
  sortOrder?: number;
  albumMediaIds?: string[];
  // Google Maps location data
  placeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  googlePlaceName?: string | null;
}

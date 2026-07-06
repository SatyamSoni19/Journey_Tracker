import { z } from "zod";

export const autocompleteSchema = z.object({
  query: z.object({
    input: z.string().min(1, "Search input is required"),
    types: z.string().optional(),
  }),
});

export const placeDetailsSchema = z.object({
  params: z.object({
    placeId: z.string().min(1, "Place ID is required"),
  }),
});

export const reverseGeocodeSchema = z.object({
  query: z.object({
    lat: z.string().regex(/^-?\d+\.?\d*$/, "Latitude must be a valid number"),
    lng: z.string().regex(/^-?\d+\.?\d*$/, "Longitude must be a valid number"),
  }),
});

export const nearbySearchSchema = z.object({
  query: z.object({
    lat: z.string().regex(/^-?\d+\.?\d*$/, "Latitude must be a valid number"),
    lng: z.string().regex(/^-?\d+\.?\d*$/, "Longitude must be a valid number"),
    type: z.string().min(1, "Place type is required"),
    radius: z.string().optional(),
    keyword: z.string().optional(),
  }),
});

export const directionsSchema = z.object({
  query: z.object({
    origin: z.string().min(1, "Origin is required"),
    destination: z.string().min(1, "Destination is required"),
    mode: z.enum(["driving", "walking", "transit"]).optional(),
  }),
});

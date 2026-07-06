import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  autocomplete,
  getPlaceDetails,
  reverseGeocode,
  searchNearby,
  getDirections,
} from "../services/googleMaps.service.js";
import type { TravelMode } from "../types/googleMaps.types.js";

export const getAutocomplete = asyncHandler(async (req: Request, res: Response) => {
  const { input, types } = req.query as { input: string; types?: string };

  const predictions = await autocomplete(input, types);

  res.status(200).json(
    new ApiResponse(200, "Autocomplete results fetched", { predictions })
  );
});

export const getPlaceDetailsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { placeId } = req.params as { placeId: string };
  
  console.log("=== BACKEND PLACE DETAILS REQUEST ===");
  console.log("Backend received placeId:", placeId);

  const place = await getPlaceDetails(placeId);

  if (!place) {
    console.error("Backend Place details: Place not found or missing location");
    res.status(404).json(new ApiResponse(404, "Place not found"));
    return;
  }

  console.log("Final response returned to frontend (Place):", { id: place.placeId, address: place.formattedAddress });

  res.status(200).json(
    new ApiResponse(200, "Place details fetched", { place })
  );
});

export const getReverseGeocode = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query as { lat: string; lng: string };

  const location = await reverseGeocode(parseFloat(lat), parseFloat(lng));

  if (!location) {
    res.status(404).json(new ApiResponse(404, "Location not found"));
    return;
  }

  res.status(200).json(
    new ApiResponse(200, "Reverse geocode result", { location })
  );
});

export const getNearbyPlaces = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, type, radius, keyword } = req.query as {
    lat: string;
    lng: string;
    type: string;
    radius?: string;
    keyword?: string;
  };

  const places = await searchNearby(
    parseFloat(lat),
    parseFloat(lng),
    type,
    radius ? parseInt(radius) : undefined,
    keyword
  );

  res.status(200).json(
    new ApiResponse(200, "Nearby places fetched", { places })
  );
});

export const getDirectionsHandler = asyncHandler(async (req: Request, res: Response) => {
  const { origin, destination, mode } = req.query as {
    origin: string;
    destination: string;
    mode?: TravelMode;
  };

  const directions = await getDirections(origin, destination, mode);

  if (!directions) {
    res.status(404).json(new ApiResponse(404, "No route found"));
    return;
  }

  res.status(200).json(
    new ApiResponse(200, "Directions fetched", { directions })
  );
});

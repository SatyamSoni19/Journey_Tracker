import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  autocompleteSchema,
  placeDetailsSchema,
  reverseGeocodeSchema,
  nearbySearchSchema,
  directionsSchema,
} from "../validators/places.validator.js";
import {
  getAutocomplete,
  getPlaceDetailsHandler,
  getReverseGeocode,
  getNearbyPlaces,
  getDirectionsHandler,
} from "../controllers/places.controller.js";

const router = Router();

// All places routes require authentication
router.use(authenticate);

router.get("/autocomplete", validate(autocompleteSchema), getAutocomplete);
router.get("/reverse-geocode", validate(reverseGeocodeSchema), getReverseGeocode);
router.get("/nearby", validate(nearbySearchSchema), getNearbyPlaces);
router.get("/directions", validate(directionsSchema), getDirectionsHandler);
router.get("/:placeId", validate(placeDetailsSchema), getPlaceDetailsHandler);

export default router;

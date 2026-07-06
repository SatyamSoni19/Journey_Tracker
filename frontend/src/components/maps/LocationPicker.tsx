import { useState, useEffect } from "react";
import { PlaceAutocomplete } from "./PlaceAutocomplete";
import { GoogleMap } from "./GoogleMap";
import { placesApi } from "@/lib/api";
import type { LocationData, AutocompletePrediction } from "@/types/maps.types";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  value?: LocationData | null;
  onChange: (location: LocationData) => void;
  className?: string;
  error?: boolean;
}

export function LocationPicker({ value, onChange, className, error }: LocationPickerProps) {
  const [inputValue, setInputValue] = useState(value?.formattedAddress || "");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    value ? { lat: value.latitude, lng: value.longitude } : { lat: 20.5937, lng: 78.9629 }
  );
  const [zoom, setZoom] = useState(value ? 14 : 5);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Sync input value with external value changes
  useEffect(() => {
    if (value) {
      setInputValue(value.formattedAddress || value.googlePlaceName || "");
      setMapCenter({ lat: value.latitude, lng: value.longitude });
      setZoom(15);
    }
  }, [value]);

  const handlePlaceSelect = async (prediction: AutocompletePrediction) => {
    try {
      setIsGeocoding(true);
      console.log("Fetching place details for:", prediction.placeId);
      const res = await placesApi.getDetails(prediction.placeId);
      const place = res.place;
      console.log("Place details received:", place);

      const finalLocation: LocationData = {
        placeId: place.placeId,
        latitude: place.latitude,
        longitude: place.longitude,
        formattedAddress: place.formattedAddress,
        city: place.city || "",
        state: place.state || "",
        country: place.country || "",
        googlePlaceName: place.name,
      };

      console.log("Final Location selected:", finalLocation);
      setMapCenter({ lat: finalLocation.latitude, lng: finalLocation.longitude });
      setZoom(15);
      onChange(finalLocation);
    } catch (err) {
      console.error("Failed to fetch place details:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Reverse geocode a lat/lng and update state
  const reverseGeocodeAndUpdate = async (lat: number, lng: number) => {
    try {
      setIsGeocoding(true);
      const res = await placesApi.reverseGeocode(lat, lng);
      if (res.location) {
        setInputValue(res.location.formattedAddress);
        setMapCenter({ lat, lng });
        setZoom(15);
        onChange(res.location);
      }
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleManualSubmit = async (text: string) => {
    if (!text.trim()) return;
    try {
      setIsGeocoding(true);
      console.log("Manual submit triggered for:", text);
      const data = await placesApi.autocomplete(text);
      if (data.predictions && data.predictions.length > 0) {
        // Auto-select the first prediction
        console.log("Auto-selecting first prediction:", data.predictions[0]);
        await handlePlaceSelect(data.predictions[0]);
      } else {
        toast.error("Could not find a place matching that description.");
      }
    } catch (err) {
      console.error("Manual submit error:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    reverseGeocodeAndUpdate(lat, lng);
  };

  const handleMapClick = (lat: number, lng: number) => {
    reverseGeocodeAndUpdate(lat, lng);
  };

  const handleBlur = () => {
    if (inputValue.trim() && (!value || (inputValue !== value.formattedAddress && inputValue !== value.googlePlaceName))) {
      console.log("Input blurred, triggering manual submit for:", inputValue);
      handleManualSubmit(inputValue);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <PlaceAutocomplete
        value={inputValue}
        onChange={setInputValue}
        onPlaceSelect={handlePlaceSelect}
        onManualSubmit={handleManualSubmit}
        onBlur={handleBlur}
        placeholder="Search for a place..."
        error={error}
        disabled={isGeocoding}
      />
      
      <div className="relative rounded-xl overflow-hidden border border-border shadow-sm">
        <GoogleMap
          center={mapCenter}
          zoom={zoom}
          markers={
            value
              ? [
                  {
                    lat: value.latitude,
                    lng: value.longitude,
                    title: value.googlePlaceName || value.formattedAddress,
                    draggable: true,
                  },
                ]
              : []
          }
          onClick={handleMapClick}
          onMarkerDragEnd={handleMarkerDragEnd}
          className="h-[160px] w-full"
        />
        {isGeocoding && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border shadow-sm text-sm">
              <MapPin className="animate-bounce text-brand" size={16} />
              <span className="font-medium text-foreground">Locating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected location summary */}
      {value && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground">
          <MapPin size={13} className="text-brand shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-medium text-foreground text-[13px] truncate">{value.googlePlaceName}</p>
            <p className="truncate">{value.formattedAddress}</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { GoogleMap } from "./GoogleMap";
import { cn } from "@/lib/utils";
import type { LocationData } from "@/types/maps.types";

interface MapPreviewProps {
  location: { lat: number; lng: number } | LocationData;
  zoom?: number;
  className?: string;
  interactive?: boolean;
}

export function MapPreview({
  location,
  zoom = 14,
  className,
  interactive = false,
}: MapPreviewProps) {
  const lat = "latitude" in location ? location.latitude : location.lat;
  const lng = "longitude" in location ? location.longitude : location.lng;
  const title = "googlePlaceName" in location ? location.googlePlaceName : undefined;

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-border/50", className)}>
      <GoogleMap
        center={{ lat, lng }}
        zoom={zoom}
        markers={[{ lat, lng, title }]}
        interactive={interactive}
        showControls={interactive}
        className="h-full w-full absolute inset-0"
      />
      {!interactive && (
        <div className="absolute inset-0 bg-transparent" aria-hidden="true" />
      )}
    </div>
  );
}

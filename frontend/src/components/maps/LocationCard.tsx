import { MapPin, Navigation, Star, Clock, Copy, Check } from "lucide-react";
import { MiniMap } from "./MiniMap";
import type { LocationData, PlaceResult } from "@/types/maps.types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LocationCardProps {
  place: Partial<PlaceResult> | LocationData;
  className?: string;
  showMiniMap?: boolean;
}

export function LocationCard({ place, className, showMiniMap = true }: LocationCardProps) {
  const [copied, setCopied] = useState(false);
  
  const p = place as any;
  const name = p.name || p.googlePlaceName;
  const address = p.formattedAddress;
  const lat = p.latitude || p.lat;
  const lng = p.longitude || p.lng;
  const rating = p.rating;
  const reviews = p.userRatingsTotal;
  const placeId = p.placeId;
  const photos = p.photos;

  const handleCopy = () => {
    if (lat && lng) {
      navigator.clipboard.writeText(`${lat}, ${lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow", className)}>
      {/* Media / Map Preview */}
      <div className="shrink-0">
        {photos && photos.length > 0 && photos[0].url ? (
          <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden border border-border">
            <img src={photos[0].url} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : showMiniMap && lat && lng ? (
          <MiniMap lat={lat} lng={lng} className="w-full sm:w-24 h-32 sm:h-24 rounded-lg" />
        ) : (
          <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg bg-muted flex items-center justify-center border border-border">
            <MapPin className="text-muted-foreground/50" size={24} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h4 className="font-semibold text-foreground text-base truncate pr-4" title={name}>
          {name || "Unknown Location"}
        </h4>
        
        {rating !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-amber-500">
              <Star size={12} className="fill-current" />
              <span className="text-xs font-semibold ml-1">{rating.toFixed(1)}</span>
            </div>
            {reviews && (
              <span className="text-[10px] text-muted-foreground">({reviews.toLocaleString()})</span>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5 line-clamp-2" title={address || ""}>
          <MapPin size={12} className="shrink-0 mt-0.5" />
          {address}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}${placeId ? `&query_place_id=${placeId}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand/80 transition-colors bg-brand/10 px-2 py-1 rounded-md"
          >
            <Navigation size={12} />
            Open in Maps
          </a>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted px-2 py-1 rounded-md"
          >
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy Coords"}
          </button>
        </div>
      </div>
    </div>
  );
}

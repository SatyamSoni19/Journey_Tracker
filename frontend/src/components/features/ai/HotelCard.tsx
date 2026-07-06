import { Building, MapPin, IndianRupee, Star, Navigation } from "lucide-react";
import type { HotelRecommendation } from "@/types/aiPlanner.types";

interface HotelCardProps {
  hotel: HotelRecommendation;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const hasPlace = !!hotel.place;
  const rating = hotel.place?.rating;
  const lat = hotel.place?.latitude;
  const lng = hotel.place?.longitude;
  const photo = hotel.place?.photos?.[0]?.url;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="w-full sm:w-32 h-40 sm:h-auto rounded-lg overflow-hidden border border-border bg-muted shrink-0">
        {photo ? (
          <img src={photo} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Building size={24} className="opacity-50" />
            <span className="text-[10px] font-medium tracking-wider uppercase opacity-50">No Image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-foreground text-base pr-4 line-clamp-1" title={hotel.name}>
              {hotel.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand">
                {hotel.category}
              </span>
              {rating && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} className="fill-current" />
                  <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end text-sm font-bold text-foreground">
              <IndianRupee size={12} className="mr-0.5" />
              {hotel.pricePerNight}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Per Night</div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 line-clamp-2" title={hotel.whyRecommended}>
          <span className="font-medium text-foreground/80">Why: </span>
          {hotel.whyRecommended}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {hotel.suitableFor.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-muted rounded-md text-[10px] font-medium text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {hasPlace && lat && lng && (
          <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate max-w-[70%]">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{hotel.place?.formattedAddress}</span>
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}${hotel.place?.placeId ? `&query_place_id=${hotel.place.placeId}` : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand/80 transition-colors"
            >
              <Navigation size={12} /> Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

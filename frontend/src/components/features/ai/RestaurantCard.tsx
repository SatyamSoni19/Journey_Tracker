import { UtensilsCrossed, MapPin, Star, Navigation } from "lucide-react";
import type { RestaurantRecommendation } from "@/types/aiPlanner.types";

interface RestaurantCardProps {
  restaurant: RestaurantRecommendation;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const hasPlace = !!restaurant.place;
  const rating = restaurant.place?.rating;
  const lat = restaurant.place?.latitude;
  const lng = restaurant.place?.longitude;
  const photo = restaurant.place?.photos?.[0]?.url;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
          {photo ? (
            <img src={photo} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <UtensilsCrossed size={20} className="opacity-50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-foreground text-sm line-clamp-1" title={restaurant.name}>
              {restaurant.name}
            </h4>
            <span className="text-xs font-bold text-brand shrink-0">{restaurant.priceRange}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{restaurant.cuisineType}</span>
            {rating && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={10} className="fill-current" />
                  <span className="text-[11px] font-semibold">{rating.toFixed(1)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2" title={restaurant.whyRecommended}>
        <span className="font-medium text-foreground/80">Why: </span>
        {restaurant.whyRecommended}
      </p>

      {hasPlace && lat && lng && (
        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate max-w-[75%]">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{restaurant.place?.formattedAddress}</span>
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}${restaurant.place?.placeId ? `&query_place_id=${restaurant.place.placeId}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:text-brand/80 transition-colors"
          >
            <Navigation size={10} /> Maps
          </a>
        </div>
      )}
    </div>
  );
}

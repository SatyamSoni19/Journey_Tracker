import { useState, useEffect } from "react";
import { MapPin, Navigation, Star, IndianRupee, ExternalLink, Loader2, Map } from "lucide-react";
import { placesApi } from "@/lib/api";
import type { PlaceResult } from "@/types/maps.types";

interface PlaceRecommendationCardProps {
  name: string;
  query: string;
  type: string;
}

export function PlaceRecommendationCard({ name, query, type }: PlaceRecommendationCardProps) {
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // 1. Get Place ID via autocomplete
        const autocompleteRes = await placesApi.autocomplete(query);
        if (autocompleteRes.predictions && autocompleteRes.predictions.length > 0) {
          const placeId = autocompleteRes.predictions[0].placeId;
          // 2. Get Place Details
          const detailsRes = await placesApi.getDetails(placeId);
          if (mounted && detailsRes.place) {
            setPlace(detailsRes.place);
          }
        }
      } catch (err) {
        console.error("Failed to fetch place recommendation details:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      mounted = false;
    };
  }, [query]);

  if (loading) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border/50 bg-card p-4 my-3 flex items-center justify-center h-24">
        <Loader2 className="w-5 h-5 text-brand animate-spin" />
      </div>
    );
  }

  if (!place) {
    // Fallback if place not found
    return (
      <div className="w-full max-w-sm rounded-xl border border-border/50 bg-card p-4 my-3 flex items-center justify-between">
        <span className="font-medium text-foreground">{name}</span>
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-brand hover:underline text-sm flex items-center gap-1"
        >
          Search <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}&query_place_id=${place.placeId}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${place.placeId}`;

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card overflow-hidden my-3 shadow-sm hover:shadow-md transition-shadow group">
      {/* If we had photos, we could render them here. For now, a map placeholder or solid color */}
      <div className="h-24 bg-muted/40 relative overflow-hidden flex items-center justify-center">
        <Map className="w-8 h-8 text-muted-foreground/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
          <span className="text-white font-medium truncate drop-shadow-md">{place.name || name}</span>
          {place.rating && (
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-semibold text-foreground">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              {place.rating}
              {place.userRatingsTotal ? ` (${place.userRatingsTotal})` : ''}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-col gap-1 overflow-hidden">
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{place.formattedAddress}</span>
            </div>
            {place.priceLevel !== undefined && (
              <div className="flex items-center gap-0.5 text-brand text-xs">
                {Array.from({ length: place.priceLevel || 1 }).map((_, i) => (
                  <IndianRupee key={i} size={10} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <a 
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
          >
            <Map size={14} />
            View Map
          </a>
          <a 
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand text-white hover:bg-brand-dark text-xs font-medium transition-colors"
          >
            <Navigation size={14} />
            Navigate
          </a>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import type { DirectionsResult } from "@/types/maps.types";
import { cn } from "@/lib/utils";

interface RouteMapProps {
  directions: DirectionsResult;
  className?: string;
}

// Reuse the dark map style
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1d23" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1d23" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8f98" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2b2e36" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2b3040" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e2028" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3f4b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1117" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a5568" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e2028" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2218" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
];

export function RouteMap({ directions, className }: RouteMapProps) {
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      disableDefaultUI: true,
      zoomControl: true,
      styles: isDark ? DARK_MAP_STYLE : undefined,
    });

    mapInstanceRef.current = map;
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || !directions) return;

    const map = mapInstanceRef.current;

    // Clear existing
    if (polylineRef.current) polylineRef.current.setMap(null);
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Decode polyline
    const path = google.maps.geometry.encoding.decodePath(directions.polyline);

    // Draw route line
    polylineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#FBA15A",
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map,
    });

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    path.forEach((p: google.maps.LatLng) => bounds.extend(p));
    map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 });

    // Start marker (green dot)
    markersRef.current.push(
      new google.maps.Marker({
        map,
        position: directions.startLocation,
        title: "Start",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 7,
        },
      })
    );

    // End marker (red dot)
    markersRef.current.push(
      new google.maps.Marker({
        map,
        position: directions.endLocation,
        title: "End",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 7,
        },
      })
    );

  }, [directions, isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setOptions({
      styles: isDark ? DARK_MAP_STYLE : undefined,
    });
  }, [isDark]);

  if (!isLoaded) {
    return (
      <div className={cn("bg-muted/50 rounded-xl flex items-center justify-center animate-pulse", className)}>
        <span className="text-muted-foreground text-xs font-medium">Loading Route...</span>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl overflow-hidden border border-border/50", className)}>
      <div ref={mapRef} className="h-full w-full absolute inset-0" />
      
      {/* Overlay info badge */}
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Distance</span>
          <span className="text-xs font-semibold text-foreground">{directions.distance.text}</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Time</span>
          <span className="text-xs font-semibold text-foreground">{directions.duration.text}</span>
        </div>
      </div>
    </div>
  );
}

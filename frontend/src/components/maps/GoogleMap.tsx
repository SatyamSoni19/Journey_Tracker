import { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { cn } from "@/lib/utils";

// Premium dark map style matching the JourneyTracker dark theme
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
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e2028" }] },
];

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: { lat: number; lng: number; title?: string; draggable?: boolean }[];
  onClick?: (lat: number, lng: number) => void;
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
}

export function GoogleMap({
  center = { lat: 20.5937, lng: 78.9629 },
  zoom = 5,
  markers = [],
  onClick,
  onMarkerDragEnd,
  className,
  interactive = true,
  showControls = true,
}: GoogleMapProps) {
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const onClickRef = useRef(onClick);
  const onDragEndRef = useRef(onMarkerDragEnd);

  // Keep refs in sync
  onClickRef.current = onClick;
  onDragEndRef.current = onMarkerDragEnd;

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      disableDefaultUI: !showControls,
      zoomControl: showControls,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: isDark ? DARK_MAP_STYLE : undefined,
      gestureHandling: interactive ? "auto" : "none",
    });

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onClickRef.current) {
        onClickRef.current(e.latLng.lat(), e.latLng.lng());
      }
    });

    mapInstanceRef.current = map;
  }, [isLoaded]);

  // Update center and zoom
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo(center);
    mapInstanceRef.current.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

  // Update markers — using standard Marker API (no mapId required)
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    markers.forEach((m) => {
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current!,
        position: { lat: m.lat, lng: m.lng },
        title: m.title,
        draggable: m.draggable ?? false,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#FBA15A",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 1.5,
          scale: 1.6,
          anchor: new google.maps.Point(12, 22),
        },
      });

      if (m.draggable) {
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos && onDragEndRef.current) {
            onDragEndRef.current(pos.lat(), pos.lng());
          }
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, isLoaded]);

  // Update styles on theme change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setOptions({
      styles: isDark ? DARK_MAP_STYLE : undefined,
    });
  }, [isDark]);

  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted/50 border border-border",
          className
        )}
        style={{ minHeight: 200 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          Loading map…
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={cn("rounded-xl overflow-hidden", className)}
      style={{ minHeight: 200 }}
    />
  );
}

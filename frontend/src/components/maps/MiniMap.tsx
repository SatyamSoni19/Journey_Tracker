import { GoogleMap } from "./GoogleMap";
import { cn } from "@/lib/utils";

interface MiniMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export function MiniMap({ lat, lng, className }: MiniMapProps) {
  return (
    <div className={cn("relative h-16 w-16 overflow-hidden rounded-lg border border-border shrink-0", className)}>
      <GoogleMap
        center={{ lat, lng }}
        zoom={12}
        markers={[{ lat, lng }]}
        interactive={false}
        showControls={false}
        className="h-[200%] w-[200%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
      />
      {/* Overlay to block interactions and add subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-tr from-background/10 to-transparent pointer-events-none ring-1 ring-inset ring-black/10 dark:ring-white/10" />
    </div>
  );
}

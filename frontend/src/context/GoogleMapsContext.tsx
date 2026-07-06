import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: null,
});

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  v: "weekly",
  libraries: ["places", "marker", "geometry"],
});

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    importLibrary("maps")
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.error("Google Maps failed to load:", err);
        setLoadError(err);
      });
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}

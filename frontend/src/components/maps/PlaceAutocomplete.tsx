import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, X } from "lucide-react";
import { placesApi } from "@/lib/api";
import type { AutocompletePrediction } from "@/types/maps.types";
import { cn } from "@/lib/utils";

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (prediction: AutocompletePrediction) => void;
  onManualSubmit?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export function PlaceAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  onManualSubmit,
  onBlur,
  placeholder = "Search for a place…",
  className,
  disabled,
  error,
}: PlaceAutocompleteProps) {
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const searchPlaces = useCallback(
    (input: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (input.length < 2) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          console.log("Places Autocomplete Request:", input);
          const data = await placesApi.autocomplete(input);
          console.log("Places Autocomplete Response:", data);
          setPredictions(data.predictions || []);
          setIsOpen(true);
          setActiveIndex(-1);
        } catch (err) {
          console.error("Places Autocomplete Error:", err);
          setPredictions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    searchPlaces(val);
  };

  const handleSelect = (prediction: AutocompletePrediction) => {
    console.log("Places Autocomplete Selected:", prediction);
    onChange(prediction.description);
    onPlaceSelect(prediction);
    setIsOpen(false);
    setPredictions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // always prevent form submit on enter
      if (isOpen && activeIndex >= 0 && predictions.length > 0) {
        handleSelect(predictions[activeIndex]);
      } else if (onManualSubmit && value) {
        onManualSubmit(value);
        setIsOpen(false);
      }
      return;
    }

    if (!isOpen || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, predictions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-xl border transition-all duration-200",
          focused
            ? "border-brand/60 bg-background shadow-sm ring-2 ring-brand/15"
            : error
            ? "border-destructive/60 bg-muted/40"
            : "border-border bg-muted/40 hover:border-border/80 hover:bg-muted/60"
        )}
      >
        <span
          className={cn(
            "absolute left-3.5 transition-colors duration-200",
            focused ? "text-brand" : "text-muted-foreground/60"
          )}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <MapPin size={15} />
          )}
        </span>

        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setFocused(true);
            if (predictions.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            if (onBlur) {
              // slight delay to allow handleSelect to run if they clicked a dropdown item
              setTimeout(() => onBlur(), 200);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 w-full bg-transparent pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setPredictions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-card shadow-elevated overflow-hidden"
          >
            {predictions.map((p, i) => (
              <button
                key={p.placeId}
                type="button"
                onClick={() => handleSelect(p)}
                onMouseEnter={() => setActiveIndex(i)}
                className={cn(
                  "flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition-colors",
                  i === activeIndex
                    ? "bg-accent/60"
                    : "hover:bg-muted/50"
                )}
              >
                <MapPin
                  size={14}
                  className="mt-0.5 shrink-0 text-brand/70"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.mainText}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.secondaryText}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from "framer-motion";
import { Plane, Calendar, IndianRupee, MapPin, Navigation, Info, AlertTriangle, Lightbulb } from "lucide-react";
import type { AIPlannerResponse } from "@/types/aiPlanner.types";
import { HotelCard } from "./HotelCard";
import { RestaurantCard } from "./RestaurantCard";
import { DayCard } from "./DayCard";
import { MapPreview } from "@/components/maps/MapPreview";
import { cn } from "@/lib/utils";

interface ItineraryRendererProps {
  plan: AIPlannerResponse;
  className?: string;
}

export function ItineraryRenderer({ plan, className }: ItineraryRendererProps) {
  const {
    tripSummary,
    dailyItinerary,
    hotelRecommendations,
    restaurantRecommendations,
    packingList,
    budgetBreakdown,
    emergencyTips,
    thingsToAvoid,
  } = plan;

  return (
    <div className={cn("space-y-8 animate-in fade-in duration-500", className)}>
      
      {/* ─── Hero Summary ─── */}
      <div className="relative rounded-3xl border border-border bg-card shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Plane size={120} className="-rotate-45" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-brand font-semibold text-sm mb-2">
              <MapPin size={16} />
              <span>Destination Guide</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {tripSummary.destination}
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              {tripSummary.overview}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge icon={<Calendar size={14} />} text={`${tripSummary.totalDays} Days`} />
            <Badge icon={<IndianRupee size={14} />} text={`${tripSummary.currency} ${tripSummary.estimatedBudget}`} />
            <Badge icon={<Navigation size={14} />} text={tripSummary.travelStyle} />
            <Badge icon={<Lightbulb size={14} />} text={`Best time: ${tripSummary.bestTimeToVisit}`} />
          </div>
        </div>
      </div>

      {/* ─── Recommendations Grid ─── */}
      {(hotelRecommendations.length > 0 || restaurantRecommendations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Hotels */}
          {hotelRecommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Where to Stay
              </h3>
              <div className="space-y-4">
                {hotelRecommendations.map((hotel, i) => (
                  <HotelCard key={i} hotel={hotel} />
                ))}
              </div>
            </div>
          )}

          {/* Restaurants */}
          {restaurantRecommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Where to Eat
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {restaurantRecommendations.map((rest, i) => (
                  <RestaurantCard key={i} restaurant={rest} />
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* ─── Daily Itinerary ─── */}
      {dailyItinerary.length > 0 && (
        <div className="space-y-6 pt-4">
          <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Your Daily Plan
          </h3>
          <div className="space-y-8">
            {dailyItinerary.map((day, i) => (
              <DayCard key={i} day={day} currency={tripSummary.currency} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Practical Information ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        
        {/* Packing List */}
        {packingList.length > 0 && (
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500"><Info size={14} /></div>
              Packing List
            </h4>
            <ul className="space-y-2">
              {packingList.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-brand mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Things to Avoid */}
        {thingsToAvoid.length > 0 && (
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-red-500/10 text-red-500"><AlertTriangle size={14} /></div>
              Things to Avoid
            </h4>
            <ul className="space-y-2">
              {thingsToAvoid.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Emergency Tips */}
        {emergencyTips.length > 0 && (
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm sm:col-span-2 lg:col-span-1">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500"><Navigation size={14} /></div>
              Emergency Tips
            </h4>
            <ul className="space-y-2">
              {emergencyTips.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-muted/50 border border-border/50 px-3 py-1.5 rounded-full text-xs font-semibold text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {text}
    </div>
  );
}

import { Clock, MapPin, IndianRupee, Navigation, Coffee, Utensils } from "lucide-react";
import type { DayItinerary, ItineraryActivity, MealSuggestion } from "@/types/aiPlanner.types";

interface DayCardProps {
  day: DayItinerary;
  currency: string;
}

export function DayCard({ day, currency }: DayCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Day Header */}
      <div className="bg-muted/40 p-5 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Day {day.day}
            </h3>
            {day.date && (
              <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-background border border-border/50">
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-brand mt-1">{day.theme}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-foreground">
            {currency} {day.estimatedDailyCost}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Est. Cost</div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Activities timeline */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="w-4 border-t border-border" />
            Activities
            <span className="flex-1 border-t border-border" />
          </h4>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {day.activities.map((activity, i) => (
              <ActivityItem key={i} activity={activity} currency={currency} index={i} />
            ))}
          </div>
        </div>

        {/* Meals */}
        {day.meals.length > 0 && (
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-4 border-t border-border" />
              Dining Suggestions
              <span className="flex-1 border-t border-border" />
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {day.meals.map((meal, i) => (
                <MealItem key={i} meal={meal} currency={currency} />
              ))}
            </div>
          </div>
        )}
        
        {/* Daily Tip */}
        {day.tips && (
          <div className="mt-4 p-3 rounded-xl bg-brand/5 border border-brand/20 text-sm">
            <span className="font-bold text-brand mr-2">💡 Tip:</span>
            <span className="text-foreground/80">{day.tips}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ activity, currency, index }: { activity: ItineraryActivity; currency: string; index: number }) {
  const hasPlace = !!activity.place;
  
  return (
    <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute md:relative left-0 md:left-1/2 -ml-5 md:ml-0 top-0">
        <span className="text-[10px] font-bold">{index + 1}</span>
      </div>
      
      {/* Content */}
      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-auto md:ml-0 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all group-hover:border-brand/40">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-brand text-xs font-bold bg-brand/10 px-2 py-0.5 rounded">
            <Clock size={12} />
            {activity.time}
          </div>
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-0.5 bg-muted rounded">
            {activity.duration}
          </div>
        </div>
        
        <h5 className="font-bold text-foreground text-sm mb-1">{activity.title}</h5>
        <p className="text-xs text-muted-foreground mb-3">{activity.description}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 border-t border-border/50">
          {hasPlace && activity.place?.formattedAddress ? (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground max-w-[65%]">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{activity.place.formattedAddress}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-muted rounded">{activity.category}</span>
            </div>
          )}
          
          {activity.estimatedCost > 0 && (
            <div className="flex items-center gap-0.5 text-xs font-bold text-foreground bg-muted px-2 py-1 rounded-md">
              <span className="text-[10px] mr-0.5 text-muted-foreground">{currency}</span>
              {activity.estimatedCost}
            </div>
          )}
        </div>

        {/* Travel Info */}
        {activity.travelFromPrevious && (
          <div className="mt-3 -mx-4 -mb-4 p-3 bg-muted/40 border-t border-border text-[10px] text-muted-foreground flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Navigation size={10} /> {activity.travelFromPrevious.mode}
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div>{activity.travelFromPrevious.distance}</div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div>{activity.travelFromPrevious.duration}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MealItem({ meal, currency }: { meal: MealSuggestion; currency: string }) {
  const isCoffee = meal.type === "breakfast" || meal.type === "snack";
  return (
    <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-3">
      <div className="mt-0.5 p-2 rounded-md bg-muted text-muted-foreground">
        {isCoffee ? <Coffee size={14} /> : <Utensils size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{meal.type}</span>
          <span className="text-[10px] font-semibold text-muted-foreground">{currency} {meal.estimatedCost}</span>
        </div>
        <h5 className="font-medium text-sm text-foreground truncate mt-0.5" title={meal.suggestion}>
          {meal.suggestion}
        </h5>
        <div className="text-xs text-muted-foreground truncate mt-1">
          {meal.cuisineType}
        </div>
      </div>
    </div>
  );
}

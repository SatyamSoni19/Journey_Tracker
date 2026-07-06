import { motion } from "framer-motion";

export function PlanSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <div className="h-32 rounded-3xl bg-muted/60 border border-border/50" />
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-muted/40 border border-border/40" />
        ))}
      </div>

      {/* Timeline Skeleton */}
      <div className="space-y-6 pt-4">
        <div className="h-8 w-40 bg-muted/60 rounded-lg ml-6" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 shrink-0" />
            <div className="flex-1 h-32 rounded-2xl bg-muted/30 border border-border/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

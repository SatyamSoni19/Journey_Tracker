import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Plane } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { journeyApi, type Journey } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusColors: Record<string, { bg: string; text: string }> = {
  PLANNED: { bg: "bg-blue-500/10", text: "text-blue-500" },
  ONGOING: { bg: "bg-green-500/10", text: "text-green-500" },
  COMPLETED: { bg: "bg-muted", text: "text-muted-foreground" },
};

export function UpcomingTrips() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJourneys = async () => {
    try {
      setIsLoading(true);
      const data = await journeyApi.list();
      setJourneys(data.journeys);
    } catch (error: any) {
      toast.error(error.message || "Failed to load journeys");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();

    const handleRefresh = () => {
      fetchJourneys();
    };

    window.addEventListener("refresh-journeys", handleRefresh);
    return () => window.removeEventListener("refresh-journeys", handleRefresh);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Your Trips
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upcoming and ongoing journeys
          </p>
        </div>
        <Link
          to="/my-trips"
          className="flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-dark"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="min-w-[280px] max-w-[320px] h-64 flex-shrink-0 animate-pulse rounded-2xl bg-muted sm:min-w-[300px]"
            />
          ))}
        </div>
      ) : journeys.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-4 text-center">
          <Plane className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">No journeys yet</p>
          <p className="text-xs text-muted-foreground">
            Start a new journey to track your next adventure.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {journeys.map((trip, i) => {
            const status = statusColors[trip.status] ?? statusColors.PLANNED;
            const progress = 0; // Replace later when expenses are implemented

            return (
              <motion.div
                key={trip.id}
                onClick={() => navigate(`/journeys/${trip.id}`)}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94] as const,
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="min-w-[280px] max-w-[320px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover sm:min-w-[300px]"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-muted">
                  {trip.coverImage ? (
                    <img
                      src={trip.coverImage}
                      alt={trip.destination}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand/10">
                      <Plane className="h-10 w-10 text-brand/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span
                    className={cn(
                      "absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      status.bg,
                      status.text
                    )}
                  >
                    {trip.status.toLowerCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {trip.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {trip.destination}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      –{" "}
                      {new Date(trip.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Budget bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        $0 spent
                      </span>
                      <span className="font-medium text-foreground">
                        ${trip.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className="h-full rounded-full bg-brand"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

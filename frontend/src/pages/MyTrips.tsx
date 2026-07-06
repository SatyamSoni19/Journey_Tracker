import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { journeyApi, type Journey } from "@/lib/api";
import { JourneyCard } from "@/components/features/trips/JourneyCard";
import { CreateJourneyDialog } from "@/components/features/trips/CreateJourneyDialog";
import { Search, Filter, Compass, Plus } from "lucide-react";
import { toast } from "sonner";

type SortOption = "newest" | "oldest" | "budget" | "start-date";
type FilterOption = "ALL" | "PLANNED" | "ONGOING" | "COMPLETED";

export default function MyTrips() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterOption>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

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
    const handleRefresh = () => fetchJourneys();
    window.addEventListener("refresh-journeys", handleRefresh);
    return () => window.removeEventListener("refresh-journeys", handleRefresh);
  }, []);

  const filteredAndSortedJourneys = useMemo(() => {
    let result = [...journeys];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) => j.title.toLowerCase().includes(q) || j.destination.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      result = result.filter((j) => j.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "budget":
          return b.budget - a.budget;
        case "start-date":
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [journeys, searchQuery, statusFilter, sortOption]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Journey Library
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Every trip you've ever created lives here.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-transparent bg-muted/50 pl-10 pr-4 text-sm text-foreground transition-all focus:border-brand focus:bg-background focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 border-r border-border pr-3">
              <Filter size={15} className="text-brand" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterOption)}
                style={{
                  backgroundColor: 'var(--card)',
                  color: 'var(--card-foreground)',
                  borderColor: 'var(--border)',
                }}
                className="h-9 cursor-pointer rounded-lg border px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand transition-colors hover:opacity-80"
              >
                <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="ALL">All Status</option>
                <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="PLANNED">Planned</option>
                <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="ONGOING">Ongoing</option>
                <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--card-foreground)',
                borderColor: 'var(--border)',
              }}
              className="h-9 cursor-pointer rounded-lg border px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand transition-colors hover:opacity-80"
            >
              <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="newest">Newest First</option>
              <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="oldest">Oldest First</option>
              <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="budget">Highest Budget</option>
              <option style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} value="start-date">Start Date</option>
            </select>

            <CreateJourneyDialog>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white whitespace-nowrap cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #FBA15A 0%, #f08c38 55%, #e87820 100%)",
                  boxShadow: "0 3px 14px rgba(251,161,90,0.38)",
                }}
              >
                <Plus size={14} />
                Start New Journey
              </motion.button>
            </CreateJourneyDialog>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 w-full animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : filteredAndSortedJourneys.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 px-6 py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
              <Compass className="h-10 w-10 text-brand" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {journeys.length === 0 ? "You haven't started your first journey yet." : "No journeys found"}
            </h2>
            <p className="mt-2 mb-8 max-w-sm text-muted-foreground">
              {journeys.length === 0 
                ? "Create a new workspace for your upcoming trip to start planning the details." 
                : "Try adjusting your filters or search query to find what you're looking for."}
            </p>
            {journeys.length === 0 && (
              <CreateJourneyDialog>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 h-12 px-8 rounded-xl text-base font-semibold text-white cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #FBA15A 0%, #f08c38 55%, #e87820 100%)",
                    boxShadow: "0 4px 20px rgba(251,161,90,0.40)",
                  }}
                >
                  <Plus size={16} />
                  Start New Journey
                </motion.button>
              </CreateJourneyDialog>
            )}
          </div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {filteredAndSortedJourneys.map((journey, i) => (
                <motion.div
                  key={journey.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <JourneyCard journey={journey} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
      </div>
    </DashboardLayout>
  );
}

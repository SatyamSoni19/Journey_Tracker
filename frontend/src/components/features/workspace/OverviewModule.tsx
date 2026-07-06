import { motion } from "framer-motion";
import { Plane, Calendar, MapPin, IndianRupee, Image as ImageIcon, Plus, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { journeyApi, uploadApi, timelineApi, albumApi, budgetApi, type Journey } from "@/lib/api";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPreview } from "@/components/maps/MapPreview";

interface OverviewModuleProps {
  journey: Journey;
  onNavigate: (module: "timeline" | "album" | "budget") => void;
}

export function OverviewModule({ journey, onNavigate }: OverviewModuleProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch budget summary
  const { data: budgetData } = useQuery({
    queryKey: ["budgetSummary", journey.id],
    queryFn: () => budgetApi.getSummary(journey.id),
  });
  const spent = budgetData?.summary?.totalSpent || 0;
  const budgetProgress = journey.budget > 0 ? (spent / journey.budget) * 100 : 0;

  // Fetch timeline entries
  const { data: timelineData } = useQuery({
    queryKey: ["timeline", journey.id],
    queryFn: () => timelineApi.list(journey.id),
  });
  const timelineCount = timelineData?.entries?.length || 0;

  // Fetch album media
  const { data: albumData } = useQuery({
    queryKey: ["album", journey.id],
    queryFn: () => albumApi.list(journey.id),
  });
  const albumMedia = albumData?.media || [];
  const albumCount = albumMedia.length;
  const albumPreviews = albumMedia.slice(0, 3);

  const updateJourneyMutation = useMutation({
    mutationFn: (data: Partial<Journey>) => journeyApi.update(journey.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey", journey.id] });
      queryClient.invalidateQueries({ queryKey: ["journeys"] });
      toast.success("Cover image updated");
      setIsUploading(false);
    },
    onError: () => {
      toast.error("Failed to update cover image");
      setIsUploading(false);
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadImage(file, "journey_tracker/covers");
      updateJourneyMutation.mutate({
        coverImage: res.secureUrl,
        coverImagePublicId: res.publicId,
      });
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-10 pb-24">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm group"
        >
          <div className="relative h-64 w-full bg-muted sm:h-72 lg:h-[340px]">
            {journey.coverImage ? (
              <img
                src={journey.coverImage}
                alt={journey.destination}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand/5">
                <Plane className="h-20 w-20 text-brand/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Edit Cover Button */}
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/jpeg, image/jpg, image/png, image/webp" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium border border-white/10 hover:bg-black/60 transition-colors"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Camera size={16} />
                    Edit Cover
                  </>
                )}
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8">
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight mb-4">
                {journey.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <MapPin size={16} className="text-brand" />
                  {journey.destination}
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <Calendar size={16} className="text-blue-400" />
                  {new Date(journey.startDate).toLocaleDateString()} – {new Date(journey.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Destination Map */}
        {journey.latitude && journey.longitude && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="w-full h-[250px] sm:h-[300px] rounded-3xl overflow-hidden border border-border bg-card shadow-sm"
          >
            <MapPreview
              location={{
                lat: journey.latitude,
                lng: journey.longitude,
                googlePlaceName: journey.googlePlaceName || journey.destination,
              }}
              zoom={13}
              interactive={true}
              className="h-full w-full border-0"
            />
          </motion.div>
        )}

        {/* Grid Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Budget Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
            onClick={() => onNavigate("budget")}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Budget Overview</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/10 text-pink-500 group-hover:scale-110 transition-transform">
                  <IndianRupee size={16} />
                </div>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{spent.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground pb-1">/ {journey.budget.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{budgetProgress.toFixed(0)}% spent</span>
                <span>{(journey.budget - spent).toLocaleString()} left</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-pink-500 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Timeline Quick Add */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
            onClick={() => onNavigate("timeline")}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Plus size={16} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {timelineCount === 0 
                  ? "0 entries so far. Start documenting your journey day by day." 
                  : `${timelineCount} entrie${timelineCount > 1 ? 's' : ''} added. Keep the memories flowing!`}
              </p>
            </div>
            <button className="mt-4 w-full rounded-xl bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
              {timelineCount === 0 ? "Add First Entry" : "View Timeline"}
            </button>
          </motion.div>

          {/* Album Quick Add */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer group sm:col-span-2 lg:col-span-1"
            onClick={() => onNavigate("album")}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Memory Album</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-500 group-hover:scale-110 transition-transform">
                  <ImageIcon size={16} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {albumCount === 0 
                  ? "Your visual diary is empty." 
                  : `${albumCount} photo${albumCount > 1 ? 's' : ''} & video${albumCount > 1 ? 's' : ''} saved.`}
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              {albumCount === 0 ? (
                <>
                  <div className="h-16 flex-1 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-center group-hover:bg-teal-500/5 transition-colors">
                    <Plus size={20} className="text-muted-foreground group-hover:text-teal-500 transition-colors" />
                  </div>
                  <div className="h-16 flex-1 rounded-xl border border-dashed border-border bg-muted/30 hidden sm:block"></div>
                  <div className="h-16 flex-1 rounded-xl border border-dashed border-border bg-muted/30 hidden sm:block"></div>
                </>
              ) : (
                <>
                  {albumPreviews.map((media) => (
                    <div key={media.id} className="h-16 flex-1 rounded-xl overflow-hidden bg-muted relative">
                      {media.type === "PHOTO" ? (
                        <img src={media.secureUrl} className="w-full h-full object-cover" alt="preview" />
                      ) : (
                        <div className="w-full h-full bg-black/10 flex items-center justify-center">
                          <video src={media.secureUrl} className="w-full h-full object-cover" />
                          <span className="absolute text-[8px] font-bold text-white bg-black/30 px-1 rounded tracking-wider">VIDEO</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {Array.from({ length: 3 - albumPreviews.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16 flex-1 rounded-xl border border-dashed border-border bg-muted/30 hidden sm:block"></div>
                  ))}
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

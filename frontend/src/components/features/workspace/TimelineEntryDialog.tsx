import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { timelineApi, type TimelineEntry } from "@/lib/api";
import { toast } from "sonner";
import { DateInput } from "@/components/ui/date-input";
import { TimeInput } from "@/components/ui/time-input";
import { TimelineMediaSelector } from "./TimelineMediaSelector";
import { LocationPicker } from "@/components/maps/LocationPicker";
import type { LocationData } from "@/types/maps.types";

interface TimelineEntryDialogProps {
  journeyId: string;
  entry: TimelineEntry | null;
  onClose: () => void;
  onSave: (entry: TimelineEntry) => void;
}

export function TimelineEntryDialog({ journeyId, entry, onClose, onSave }: TimelineEntryDialogProps) {
  const isEditing = !!entry;
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    date: entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: entry?.time || "12:00",
    location: entry?.location || "",
    title: entry?.title || "",
    description: entry?.description || "",
    albumMediaIds: entry?.media?.map(m => m.mediaId) || [],
  });

  const [location, setLocation] = useState<LocationData | null>(
    entry?.placeId && entry?.latitude && entry?.longitude
      ? {
          placeId: entry.placeId,
          latitude: entry.latitude,
          longitude: entry.longitude,
          formattedAddress: entry.formattedAddress || entry.location,
          city: "",
          state: "",
          country: "",
          googlePlaceName: entry.googlePlaceName || entry.location,
        }
      : null
  );

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Ensure date is properly formatted ISO
      const isoDate = new Date(formData.date).toISOString();
      const submitData = {
        ...formData,
        date: isoDate,
        ...(location && {
          location: location.googlePlaceName || location.formattedAddress,
          placeId: location.placeId,
          latitude: location.latitude,
          longitude: location.longitude,
          formattedAddress: location.formattedAddress,
          googlePlaceName: location.googlePlaceName,
        }),
      };
      
      let res;
      if (isEditing) {
        res = await timelineApi.update(journeyId, entry.id, submitData);
      } else {
        res = await timelineApi.create(journeyId, submitData);
      }
      
      onSave(res.entry);
      onClose();
      toast.success(`Entry ${isEditing ? 'updated' : 'created'}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-elevated pointer-events-auto flex flex-col max-h-full"
        >
          <div className="flex items-center justify-between border-b border-border p-6 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Timeline Entry" : "Add Timeline Entry"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            <form id="timeline-form" onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date <span className="text-destructive">*</span></label>
                  <DateInput
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time <span className="text-destructive">*</span></label>
                  <TimeInput
                    required
                    value={formData.time}
                    onChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title <span className="text-destructive">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Arrived at Tokyo Station"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location <span className="text-destructive">*</span></label>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notes</label>
                <textarea
                  rows={4}
                  placeholder="Write your thoughts..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <TimelineMediaSelector
                  journeyId={journeyId}
                  selectedIds={formData.albumMediaIds}
                  onChange={(ids) => setFormData(prev => ({ ...prev, albumMediaIds: ids }))}
                />
              </div>

            </form>
          </div>

          <div className="border-t border-border p-6 pt-4 flex justify-end gap-3 bg-muted/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium rounded-xl text-foreground bg-background border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              form="timeline-form"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-brand hover:bg-brand/90 transition-colors shadow-sm disabled:opacity-70 min-w-[100px] flex justify-center"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Save Entry"}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

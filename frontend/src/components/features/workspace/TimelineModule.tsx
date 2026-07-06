import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { timelineApi, type TimelineEntry } from "@/lib/api";
import { TimelineEntryCard } from "./TimelineEntryCard";
import { TimelineEntryDialog } from "./TimelineEntryDialog";
import { toast } from "sonner";

interface TimelineModuleProps {
  journeyId: string;
}

export function TimelineModule({ journeyId }: TimelineModuleProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const res = await timelineApi.list(journeyId);
      setEntries(res.entries);
    } catch (error: any) {
      toast.error("Failed to load timeline");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [journeyId]);

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimelineEntry[]>);

  const handleEdit = (entry: TimelineEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await timelineApi.delete(journeyId, id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success("Entry deleted");
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-10 pb-24 relative">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Timeline</h2>
            <p className="text-sm text-muted-foreground mt-1">Your journey's daily diary.</p>
          </div>
          <button
            onClick={() => { setEditingEntry(null); setIsDialogOpen(true); }}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand/90 hover:scale-105"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-4">
              <Plus size={24} />
            </div>
            <h3 className="text-lg font-semibold">No timeline entries yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Start documenting your journey day by day. Add locations, times, notes, and attach photos.
            </p>
            <button
              onClick={() => { setEditingEntry(null); setIsDialogOpen(true); }}
              className="mt-6 rounded-full bg-blue-500/10 px-6 py-2.5 text-sm font-medium text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
            >
              Create First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {Object.entries(groupedEntries).map(([date, dayEntries], dayIndex) => (
              <div key={date} className="relative z-10">
                <div className="sticky top-0 z-20 flex justify-center mb-8">
                  <span className="bg-card border border-border px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground shadow-sm">
                    {date}
                  </span>
                </div>
                <div className="space-y-8">
                  {dayEntries.map((entry, index) => (
                    <TimelineEntryCard 
                      key={entry.id} 
                      entry={entry} 
                      onEdit={() => handleEdit(entry)}
                      onDelete={() => handleDelete(entry.id)}
                      isLeft={index % 2 === 0} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDialogOpen && (
          <TimelineEntryDialog
            journeyId={journeyId}
            entry={editingEntry}
            onClose={() => setIsDialogOpen(false)}
            onSave={(newEntry) => {
              if (editingEntry) {
                setEntries(prev => prev.map(e => e.id === newEntry.id ? newEntry : e));
              } else {
                setEntries(prev => [...prev, newEntry].sort((a, b) => {
                  const dateA = new Date(a.date).getTime();
                  const dateB = new Date(b.date).getTime();
                  if (dateA === dateB) return a.time.localeCompare(b.time);
                  return dateA - dateB;
                }));
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

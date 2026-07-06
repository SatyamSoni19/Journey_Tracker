import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, MapPin, Trash2, Clock, Image as ImageIcon } from "lucide-react";
import type { TimelineEntry } from "@/lib/api";
import { MediaLightbox } from "./MediaLightbox";

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  onEdit: () => void;
  onDelete: () => void;
  isLeft: boolean;
}

export function TimelineEntryCard({ entry, onEdit, onDelete, isLeft }: TimelineEntryCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const mediaItems = entry.media?.map(m => m.media) || [];
  const displayMedia = mediaItems.slice(0, 3);
  const remainingCount = mediaItems.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center justify-between md:justify-normal w-full group ${
        isLeft ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {/* Center dot (visible on md+) */}
      <div className="absolute left-0 md:left-1/2 w-8 h-8 -translate-x-[15px] md:-translate-x-1/2 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-brand border-4 border-background z-10 group-hover:scale-125 transition-transform" />
      </div>

      {/* Empty space for alternating layout */}
      <div className="hidden md:block w-1/2" />

      {/* Content Card */}
      <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] pl-8 md:pl-0 ${isLeft ? "md:pr-8" : "md:pl-8"}`}>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex items-center gap-1 text-sm font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                  <Clock size={14} />
                  {entry.time}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground leading-tight">{entry.title}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin size={14} />
                {entry.location}
              </p>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this entry?")) {
                    onDelete();
                  }
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          
          {entry.description && (
            <p className="text-sm text-foreground/80 mt-3 whitespace-pre-line leading-relaxed">
              {entry.description}
            </p>
          )}

          {mediaItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {displayMedia.map((media, idx) => (
                <div
                  key={media.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="relative h-14 w-14 rounded-lg overflow-hidden border border-border cursor-pointer group"
                >
                  {media.type === "PHOTO" ? (
                    <img src={media.secureUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="thumbnail" />
                  ) : (
                    <div className="w-full h-full bg-black/10 flex items-center justify-center">
                      <video src={media.secureUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white tracking-wider">VIDEO</span>
                      </div>
                    </div>
                  )}
                  
                  {idx === 2 && remainingCount > 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">+{remainingCount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          media={mediaItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </motion.div>
  );
}

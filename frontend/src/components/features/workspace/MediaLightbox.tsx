import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { AlbumMedia } from "@/lib/api";

interface MediaLightboxProps {
  media: AlbumMedia[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  if (media.length === 0) return null;

  const currentMedia = media[currentIndex];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={24} />
      </button>

      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full p-3 text-white/70 transition-all hover:bg-white/10 hover:scale-110 hover:text-white hidden sm:block"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full p-3 text-white/70 transition-all hover:bg-white/10 hover:scale-110 hover:text-white hidden sm:block"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMedia.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-full max-w-full flex-col items-center"
          >
            {currentMedia.type === "PHOTO" ? (
              <img
                src={currentMedia.secureUrl}
                alt={currentMedia.caption || "Journey photo"}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={currentMedia.secureUrl}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl bg-black"
              />
            )}
            
            {currentMedia.caption && (
              <div className="absolute bottom-0 w-full translate-y-full pt-4 text-center">
                <p className="text-sm md:text-base text-white/90 font-medium bg-black/50 px-4 py-2 rounded-full inline-block backdrop-blur-sm">
                  {currentMedia.caption}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium text-white/50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>,
    document.body
  );
}

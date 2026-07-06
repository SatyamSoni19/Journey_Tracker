import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Image as ImageIcon, Trash2, UploadCloud, X } from "lucide-react";
import { albumApi, uploadApi, type AlbumMedia } from "@/lib/api";
import { MediaLightbox } from "./MediaLightbox";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AlbumModuleProps {
  journeyId: string;
}

export function AlbumModule({ journeyId }: AlbumModuleProps) {
  const queryClient = useQueryClient();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["album", journeyId],
    queryFn: () => albumApi.list(journeyId),
  });
  
  const media = data?.media || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newMedia: Partial<AlbumMedia>) => albumApi.create(journeyId, newMedia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album", journeyId] });
      toast.success("Media added to album");
      setIsAddOpen(false);
      setCaption("");
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add media");
      setUploadProgress(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => albumApi.delete(journeyId, mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album", journeyId] });
      toast.success("Media deleted");
    },
    onError: () => {
      toast.error("Failed to delete media");
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50MB.");
      return;
    }

    try {
      setUploadProgress(1); // Start progress
      const uploadRes = await uploadApi.uploadImage(file, "journey_tracker/album", (p) => {
        setUploadProgress(p);
      });

      const isVideo = uploadRes.resourceType === "video";
      
      createMutation.mutate({
        type: isVideo ? "VIDEO" : "PHOTO",
        publicId: uploadRes.publicId,
        secureUrl: uploadRes.secureUrl,
        resourceType: uploadRes.resourceType,
        format: uploadRes.format,
        width: uploadRes.width,
        height: uploadRes.height,
        bytes: uploadRes.bytes,
        duration: uploadRes.duration,
        caption: caption,
      });

    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      setUploadProgress(0);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this media?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-10 pb-24 relative">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Memory Album</h2>
            <p className="text-sm text-muted-foreground mt-1">All your journey photos and videos in one place.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand/90 hover:scale-105 shadow-sm"
          >
            <Plus size={16} />
            Add Media
          </button>
        </div>

        {/* Add Media Upload Area */}
        <AnimatePresence>
          {isAddOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm relative">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
                <h3 className="text-sm font-semibold mb-4">Upload New Media</h3>
                
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Add a caption (optional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  />
                  
                  <div
                    onClick={() => {
                      if (uploadProgress === 0) fileInputRef.current?.click();
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed ${uploadProgress > 0 ? "border-brand bg-brand/5" : "border-border hover:border-brand/50 hover:bg-brand/5 cursor-pointer"} p-8 text-center transition-colors`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/jpeg, image/jpg, image/png, image/webp, video/mp4, video/quicktime"
                    />
                    
                    {uploadProgress > 0 ? (
                      <div className="w-full max-w-xs flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-brand" />
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-brand transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium text-brand">{uploadProgress}% Uploading...</p>
                        {createMutation.isPending && (
                          <p className="text-xs text-muted-foreground">Saving to album...</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mb-4 rounded-full bg-brand/10 p-3 text-brand">
                          <UploadCloud size={24} />
                        </div>
                        <p className="text-sm font-medium text-foreground">Click to upload photo or video</p>
                        <p className="mt-1 text-xs text-muted-foreground">Up to 50MB (JPEG, PNG, WEBP, MP4, MOV)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-500 mb-4">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-lg font-semibold">No media yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Add photos and videos to visually remember your journey.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-6 rounded-full bg-teal-500/10 px-6 py-2.5 text-sm font-medium text-teal-500 hover:bg-teal-500 hover:text-white transition-colors"
            >
              Add First Photo
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {media.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                className="relative group overflow-hidden rounded-2xl break-inside-avoid shadow-sm cursor-pointer border border-border/50 bg-card"
                onClick={() => setLightboxIndex(index)}
              >
                {item.type === "PHOTO" ? (
                  <img
                    src={item.secureUrl}
                    alt={item.caption || "Journey media"}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full aspect-video bg-black/10 flex items-center justify-center">
                    <video src={item.secureUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white pl-1 shadow-lg">▶</div>
                    </div>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-full bg-black/40 text-white/70 hover:bg-destructive hover:text-white transition-colors backdrop-blur-sm disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {item.caption && (
                    <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-md">
                      {item.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

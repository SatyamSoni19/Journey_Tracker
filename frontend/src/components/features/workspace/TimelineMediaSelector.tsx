import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, UploadCloud, Loader2, Check } from "lucide-react";
import { albumApi, uploadApi, type AlbumMedia } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimelineMediaSelectorProps {
  journeyId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function TimelineMediaSelector({ journeyId, selectedIds, onChange }: TimelineMediaSelectorProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["album", journeyId],
    queryFn: () => albumApi.list(journeyId),
  });
  
  const media = data?.media || [];

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const createMutation = useMutation({
    mutationFn: (newMedia: Partial<AlbumMedia>) => albumApi.create(journeyId, newMedia),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["album", journeyId] });
      onChange([...selectedIds, data.media.id]); // auto-select the newly uploaded media
      toast.success("Media uploaded and attached");
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add media");
      setUploadProgress(0);
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50MB.");
      return;
    }

    try {
      setUploadProgress(1);
      const uploadRes = await uploadApi.uploadImage(file, "journey_tracker/timeline", (p) => {
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
      });

    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      setUploadProgress(0);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-border/80 focus:outline-none w-full justify-center shadow-sm"
      >
        <ImageIcon size={18} className="text-brand" />
        Attach Photos & Videos {selectedIds.length > 0 && `(${selectedIds.length})`}
      </button>

      {/* Selected Previews below button */}
      {selectedIds.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {selectedIds.map(id => {
            const item = media.find(m => m.id === id);
            if (!item) return null;
            return (
              <div key={id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                {item.type === "PHOTO" ? (
                  <img src={item.secureUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full bg-black/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold bg-black/50 text-white px-1 rounded">VIDEO</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleSelection(id)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-elevated overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="text-lg font-bold">Attach Media</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {/* Upload New Section */}
                <div 
                  onClick={() => { if (uploadProgress === 0) fileInputRef.current?.click(); }}
                  className={cn(
                    "mb-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors",
                    uploadProgress > 0 ? "border-brand bg-brand/5" : "border-border hover:border-brand/50 hover:bg-brand/5 cursor-pointer"
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg, image/jpg, image/png, image/webp, video/mp4, video/quicktime"
                  />
                  {uploadProgress > 0 ? (
                    <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                      <Loader2 className="h-6 w-6 animate-spin text-brand" />
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-brand transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs font-medium text-brand">{uploadProgress}% Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-brand/10 p-3 rounded-full text-brand mb-3">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-sm font-medium">Click to upload new</p>
                    </>
                  )}
                </div>

                {/* Existing Album */}
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Or choose from Album</h4>
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-muted-foreground h-6 w-6" />
                  </div>
                ) : media.length === 0 ? (
                  <p className="text-sm text-center text-muted-foreground py-10 border border-dashed border-border rounded-xl">
                    No media in your album yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {media.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => toggleSelection(item.id)}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                            isSelected ? "border-brand" : "border-transparent hover:border-border"
                          )}
                        >
                          {item.type === "PHOTO" ? (
                            <img src={item.secureUrl} className="w-full h-full object-cover" alt="Album item" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-black/10 flex items-center justify-center">
                              <video src={item.secureUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <span className="text-[10px] font-bold bg-black/50 text-white px-2 py-1 rounded">VIDEO</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Selected Overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-brand/20 flex items-start justify-end p-2">
                              <div className="bg-brand text-white rounded-full p-0.5 shadow-sm">
                                <Check size={14} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-border bg-muted/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 bg-brand text-white font-medium text-sm rounded-xl hover:bg-brand/90 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

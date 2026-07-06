import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  ImagePlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { uploadApi, type UploadResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = "JPG, JPEG, PNG, WEBP";

interface ImageUploadProps {
  /** Current image URL (Cloudinary secure_url or empty) */
  value?: string | null;
  /** Current Cloudinary public_id (for deletion tracking) */
  publicId?: string | null;
  /** Called with (url, publicId) on successful upload or (null, null) on remove */
  onChange: (url: string | null, publicId: string | null) => void;
  /** Cloudinary folder to upload into */
  folder?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type UploadState = "idle" | "dragging" | "uploading" | "complete" | "error";

export function ImageUpload({
  value,
  publicId,
  onChange,
  folder = "Journey_Tracker/journey-covers",
  disabled = false,
  className,
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>(value ? "complete" : "idle");
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS}`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large. Maximum size: ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB`;
    }
    return null;
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        setErrorMessage(validationError);
        setState("error");
        return;
      }

      // Show preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setState("uploading");
      setProgress(0);
      setErrorMessage(null);

      try {
        const result: UploadResponse = await uploadApi.uploadImage(
          file,
          folder,
          (pct) => setProgress(pct)
        );

        // Replace local preview with Cloudinary URL
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(result.secureUrl);
        setProgress(100);
        setState("complete");
        onChange(result.secureUrl, result.publicId);
        toast.success("Image uploaded successfully!");
      } catch (error: any) {
        URL.revokeObjectURL(localPreview);
        const msg = error.message || "Upload failed. Please try again.";
        toast.error(msg);
        setErrorMessage(msg);
        setState("error");
        setPreviewUrl(null);
      }
    },
    [folder, onChange, validateFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setState(value || previewUrl ? "complete" : "idle");

      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    },
    [disabled, handleUpload, value, previewUrl]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setState("dragging");
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only reset if leaving the drop zone itself
      if (
        dropZoneRef.current &&
        !dropZoneRef.current.contains(e.relatedTarget as Node)
      ) {
        setState(previewUrl ? "complete" : "idle");
      }
    },
    [previewUrl]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setProgress(0);
    setErrorMessage(null);
    setState("idle");
    onChange(null, null);
  }, [onChange]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openFilePicker = useCallback(() => {
    if (!disabled && state !== "uploading") {
      fileInputRef.current?.click();
    }
  }, [disabled, state]);

  const hasPreview = !!previewUrl && (state === "complete" || state === "uploading");

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {hasPreview ? (
          /* ── Preview State ──────────────────────────── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative group rounded-xl overflow-hidden border border-border bg-muted/30"
          >
            {/* Image */}
            <div className="relative w-full h-44 overflow-hidden">
              <img
                src={previewUrl!}
                alt="Cover preview"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* Upload progress overlay */}
              <AnimatePresence>
                {state === "uploading" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                  >
                    {/* Circular progress */}
                    <div className="relative h-16 w-16">
                      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#FBA15A"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={
                            2 * Math.PI * 28 * (1 - progress / 100)
                          }
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {progress}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-white/80">
                      Uploading…
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success indicator */}
              <AnimatePresence>
                {state === "complete" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    className="absolute top-3 left-3"
                  >
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                      <CheckCircle2 size={12} />
                      Uploaded
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons — visible on hover */}
              {state === "complete" && !disabled && (
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplace();
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/70"
                  >
                    <RefreshCw size={12} />
                    Replace
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="flex items-center justify-center h-7 w-7 rounded-lg bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-red-500/80"
                  >
                    <X size={13} />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Drop Zone / Idle / Error State ──────────── */
          <motion.div
            key="dropzone"
            ref={dropZoneRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300",
              "py-8 px-6",
              disabled
                ? "cursor-not-allowed opacity-50 border-border bg-muted/20"
                : state === "dragging"
                ? "cursor-copy border-brand bg-brand/5 shadow-[0_0_24px_rgba(251,161,90,0.12)]"
                : state === "error"
                ? "cursor-pointer border-destructive/50 bg-destructive/5 hover:border-destructive/70"
                : "cursor-pointer border-border hover:border-brand/50 hover:bg-brand/[0.03] bg-muted/20"
            )}
          >
            {/* Drag overlay glow */}
            <AnimatePresence>
              {state === "dragging" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(251,161,90,0.06) 0%, transparent 70%)",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            <motion.div
              animate={
                state === "dragging"
                  ? { scale: 1.1, y: -4 }
                  : { scale: 1, y: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-300",
                state === "dragging"
                  ? "border-brand/30 bg-brand/10 text-brand"
                  : state === "error"
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-border bg-muted/50 text-muted-foreground"
              )}
            >
              {state === "error" ? (
                <AlertCircle size={22} />
              ) : state === "dragging" ? (
                <Upload size={22} />
              ) : (
                <ImagePlus size={22} />
              )}
            </motion.div>

            {/* Text */}
            <div className="mt-3 text-center">
              {state === "error" ? (
                <>
                  <p className="text-sm font-medium text-destructive">
                    {errorMessage}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click to try again
                  </p>
                </>
              ) : state === "dragging" ? (
                <p className="text-sm font-medium text-brand">
                  Drop your image here
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-brand">Click to upload</span>
                    {" or drag & drop"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ALLOWED_EXTENSIONS} • Max {MAX_SIZE / 1024 / 1024}MB
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

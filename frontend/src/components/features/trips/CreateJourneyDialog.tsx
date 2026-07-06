import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { journeyApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Compass,
  MapPin,
  IndianRupee,
  Calendar,
  AlignLeft,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/common/ImageUpload";
import { DateInput } from "@/components/ui/date-input";
import { LocationPicker } from "@/components/maps/LocationPicker";
import type { LocationData } from "@/types/maps.types";

const journeySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    budget: z.number().positive("Budget must be positive"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    description: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

type JourneyFormValues = z.infer<typeof journeySchema>;

interface CreateJourneyDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

/* ── Reusable field wrapper ──────────────────────── */
function Field({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
        {label}
        {required && <span className="ml-0.5 text-brand">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-medium text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Styled input ────────────────────────────────── */
function StyledInput({
  icon,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  error?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={cn(
        "relative flex items-center rounded-xl border transition-all duration-200",
        focused
          ? "border-brand/60 bg-background shadow-sm ring-2 ring-brand/15"
          : error
          ? "border-destructive/60 bg-muted/40"
          : "border-border bg-muted/40 hover:border-border/80 hover:bg-muted/60"
      )}
    >
      {icon && (
        <span
          className={cn(
            "absolute left-3.5 transition-colors duration-200",
            focused ? "text-brand" : "text-muted-foreground/60"
          )}
        >
          {icon}
        </span>
      )}
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
          icon ? "pl-10 pr-4" : "px-4",
          className
        )}
        {...props}
      />
    </div>
  );
}



/* ── Main component ──────────────────────────────── */
export function CreateJourneyDialog({
  children,
  open,
  onOpenChange,
  onSuccess,
}: CreateJourneyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cover image state (managed outside react-hook-form since it comes from upload)
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImagePublicId, setCoverImagePublicId] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JourneyFormValues>({
    resolver: zodResolver(journeySchema),
    defaultValues: {
      title: "",
      budget: 0,
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  const handleCoverImageChange = (url: string | null, publicId: string | null) => {
    setCoverImage(url);
    setCoverImagePublicId(publicId);
  };

  const resetAll = () => {
    reset();
    setCoverImage(null);
    setCoverImagePublicId(null);
    setLocation(null);
  };

  const onSubmit = async (data: JourneyFormValues) => {
    try {
      if (!location) {
        toast.error("Destination is required");
        return;
      }
      setIsSubmitting(true);
      const payload = {
        ...data,
        destination: location.googlePlaceName || location.formattedAddress,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        coverImage: coverImage || undefined,
        coverImagePublicId: coverImagePublicId || undefined,
        description: data.description || undefined,
        // Location data
        placeId: location.placeId,
        latitude: location.latitude,
        longitude: location.longitude,
        formattedAddress: location.formattedAddress,
        city: location.city,
        state: location.state,
        country: location.country,
        googlePlaceName: location.googlePlaceName,
      };
      
      const res = await journeyApi.create(payload);
      toast.success("Journey created! 🚀");
      setIsOpen(false);
      resetAll();
      window.dispatchEvent(new Event("refresh-journeys"));
      onSuccess?.();
      
      // Auto navigate
      if (res?.journey?.id) {
        navigate(`/workspace/${res.journey.id}`);
      }
    } catch (error: any) {
      console.error("Create Journey API Error:", error);
      toast.error(error.message || "Failed to create journey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
        if (!val) resetAll();
      }}
    >
      {children && (
        <div onClick={() => setIsOpen(true)} className="contents">
          {children}
        </div>
      )}

      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[580px] border-0 shadow-none p-0 gap-0 overflow-visible"
        style={{ background: "transparent" }}
      >
        {/* Outer solid card — explicit bg so nothing bleeds through */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "#171A21",
            boxShadow:
              "0 0 0 1px rgba(251,161,90,0.10), 0 8px 40px rgba(0,0,0,0.55), 0 32px 80px rgba(0,0,0,0.35)",
          }}
        >
          {/* Subtle brand gradient top strip */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-70" />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-5">
            {/* Background orb */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand/8 blur-3xl" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/20">
                  <Sparkles size={18} className="text-brand" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                    Start New Journey
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fill in the details and launch your next adventure
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-border/50" />

          {/* Form body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto overflow-x-hidden">

            {/* Row 1: Title + Budget */}
            <div className="grid grid-cols-[1fr_160px] gap-4">
              <Field label="Trip Title" required error={errors.title?.message}>
                <StyledInput
                  icon={<Compass size={15} />}
                  placeholder="e.g. Summer in Paris"
                  error={!!errors.title}
                  {...register("title")}
                />
              </Field>

              <Field label="Budget (₹)" required error={errors.budget?.message}>
                <StyledInput
                  icon={<IndianRupee size={15} />}
                  type="number"
                  placeholder="0"
                  error={!!errors.budget}
                  {...register("budget", { valueAsNumber: true })}
                />
              </Field>
            </div>

            {/* Row 2: Destination LocationPicker */}
            <Field label="Destination" required>
              <LocationPicker
                value={location}
                onChange={setLocation}
              />
            </Field>

            {/* Row 3: Start + End Date */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" required error={errors.startDate?.message}>
                <DateInput
                  error={!!errors.startDate}
                  {...register("startDate")}
                />
              </Field>

              <Field label="End Date" required error={errors.endDate?.message}>
                <DateInput
                  error={!!errors.endDate}
                  {...register("endDate")}
                />
              </Field>
            </div>

            {/* Row 4: Description */}
            <Field label="Description" error={errors.description?.message}>
              <StyledInput
                icon={<AlignLeft size={15} />}
                placeholder="Brief description of your trip..."
                error={!!errors.description}
                {...register("description")}
              />
            </Field>

            {/* Row 5: Cover Image Upload */}
            <Field label="Cover Image">
              <ImageUpload
                value={coverImage}
                publicId={coverImagePublicId}
                onChange={handleCoverImageChange}
                folder="Journey_Tracker/journey-covers"
                disabled={isSubmitting}
              />
            </Field>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40 bg-muted/20">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 px-5 rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                className={cn(
                  "relative flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
                style={{
                  background: isSubmitting
                    ? "var(--color-brand)"
                    : "linear-gradient(135deg, #FBA15A 0%, #f08c38 55%, #e87820 100%)",
                  boxShadow: isSubmitting
                    ? "none"
                    : "0 4px 18px rgba(251,161,90,0.40)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating…</span>
                  </>
                ) : (
                  <>
                    <span>Create Journey</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

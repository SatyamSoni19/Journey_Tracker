import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MoreVertical, Edit2, Trash2, Plane, CheckCircle2, Copy, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type Journey, type JourneyStatus, journeyApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

/* ── Auto-status logic ──────────────────────────── */
function getEffectiveStatus(journey: Journey): JourneyStatus {
  const now = new Date();
  const end = new Date(journey.endDate);
  if (journey.status === "COMPLETED") return "COMPLETED";
  if (end < now) return "COMPLETED";
  return journey.status;
}

const STATUS_CONFIG: Record<JourneyStatus, { bg: string; text: string; dot: string; label: string }> = {
  PLANNED:   { bg: "bg-blue-500/15",    text: "text-blue-400",    dot: "bg-blue-400",    label: "Planned"   },
  ONGOING:   { bg: "bg-brand/15",       text: "text-brand",       dot: "bg-brand",       label: "Ongoing"   },
  COMPLETED: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400", label: "Completed" },
};

const STATUS_OPTIONS: JourneyStatus[] = ["PLANNED", "ONGOING", "COMPLETED"];

interface JourneyCardProps {
  journey: Journey;
  index: number;
  onUpdate?: () => void;
}

const MENU_STYLE = {
  background: "#171A21",
  boxShadow: "0 8px 32px rgba(0,0,0,0.65)",
} as const;

export function JourneyCard({ journey, index, onUpdate }: JourneyCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu]               = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [loadingStatus, setLoadingStatus]     = useState<JourneyStatus | null>(null);
  const [isDuplicating, setIsDuplicating]     = useState(false);
  const [menuPos, setMenuPos]                 = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const effectiveStatus = getEffectiveStatus(journey);
  const statusCfg       = STATUS_CONFIG[effectiveStatus];

  /* Close on outside click */
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      // If clicking inside the trigger button
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      // If clicking inside the portal menu
      if (menuContainerRef.current && menuContainerRef.current.contains(e.target as Node)) return;
      
      setShowMenu(false);
      setShowStatusPanel(false);
    };
    if (showMenu) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showMenu]);

  // Update position when window resizes or scrolls
  useLayoutEffect(() => {
    const updatePosition = () => {
      if (showMenu && menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect();
        setMenuPos({ 
          top: rect.bottom + window.scrollY + 8, // 8px spacing
          left: rect.right + window.scrollX - 176 // 176px is w-44
        });
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true); // true to catch scrolling on any element
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showMenu]);

  const refresh = () => {
    window.dispatchEvent(new Event("refresh-journeys"));
    onUpdate?.();
  };

  /* Status change */
  const handleStatusChange = async (newStatus: JourneyStatus) => {
    if (newStatus === journey.status) { setShowMenu(false); return; }
    setLoadingStatus(newStatus);
    try {
      await journeyApi.update(journey.id, { status: newStatus });
      toast.success(`Status set to ${STATUS_CONFIG[newStatus].label}`);
      setShowMenu(false);
      setShowStatusPanel(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoadingStatus(null);
    }
  };

  /* Duplicate */
  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDuplicating(true);
    try {
      await journeyApi.create({
        title:       `${journey.title} (Copy)`,
        destination: journey.destination,
        budget:      journey.budget,
        startDate:   journey.startDate,
        endDate:     journey.endDate,
        description: journey.description ?? undefined,
        coverImage:  journey.coverImage  ?? undefined,
        status:      "PLANNED",
      });
      toast.success("Journey duplicated!");
      setShowMenu(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate");
    } finally {
      setIsDuplicating(false);
    }
  };

  /* Delete */
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${journey.title}"? This cannot be undone.`)) return;
    try {
      await journeyApi.delete(journey.id);
      toast.success("Journey deleted");
      setShowMenu(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/journeys/${journey.id}`)}
      className="group relative cursor-pointer overflow-visible rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-muted">
        {journey.coverImage ? (
          <img
            src={journey.coverImage}
            alt={journey.destination}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/5">
            <Plane className="h-12 w-12 text-brand/20 transition-transform duration-700 group-hover:scale-110 group-hover:text-brand/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          {/* Status badge */}
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-md",
              statusCfg.bg,
              statusCfg.text
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
            {statusCfg.label}
          </span>

          {/* ⋮ Menu trigger */}
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((p) => !p);
                setShowStatusPanel(false);
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/65"
            >
              <MoreVertical size={15} />
            </button>

            {createPortal(
              <AnimatePresence>
                {showMenu && (
                  <div 
                    ref={menuContainerRef} 
                    className="absolute z-[9999]" 
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    {!showStatusPanel ? (
                      <motion.div
                      key="main-menu"
                      initial={{ opacity: 0, scale: 0.94, y: -6 }}
                      animate={{ opacity: 1, scale: 1,    y:  0 }}
                      exit={{    opacity: 0, scale: 0.94, y: -6 }}
                      transition={{ duration: 0.14 }}
                      className="w-44 overflow-hidden rounded-xl border border-border"
                      style={MENU_STYLE}
                    >
                      {/* Set Status — opens status panel */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowStatusPanel(true); }}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-white/6"
                      >
                        <CheckCircle2 size={14} className="text-brand" />
                        Set Status
                        <span className="ml-auto text-xs text-muted-foreground">›</span>
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-white/6 disabled:opacity-50"
                      >
                        {isDuplicating
                          ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                          : <Copy size={14} className="text-muted-foreground" />
                        }
                        Duplicate
                      </button>

                      {/* Edit */}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/journeys/${journey.id}`); setShowMenu(false); }}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-white/6"
                      >
                        <Edit2 size={14} className="text-muted-foreground" />
                        Edit Journey
                      </button>

                      <div className="h-px bg-border/60" />

                      {/* Delete */}
                      <button
                        onClick={handleDelete}
                        className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="status-panel"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{    opacity: 0, x: 8 }}
                      transition={{ duration: 0.14 }}
                      className="w-44 overflow-hidden rounded-xl border border-border"
                      style={MENU_STYLE}
                    >
                      {/* Back header */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowStatusPanel(false); }}
                        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-white/6"
                      >
                        ‹ Status
                      </button>
                      <div className="h-px bg-border/60" />

                      {STATUS_OPTIONS.map((s) => {
                        const cfg       = STATUS_CONFIG[s];
                        const isCurrent = effectiveStatus === s;
                        const isLoading = loadingStatus === s;
                        return (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(s); }}
                            disabled={!!loadingStatus}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/6 disabled:opacity-60",
                              isCurrent ? cfg.text : "text-foreground"
                            )}
                          >
                            {isLoading
                              ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                              : <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", cfg.dot)} />
                            }
                            {cfg.label}
                            {isCurrent && <span className="ml-auto text-[10px] text-muted-foreground">✓</span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="p-5 flex flex-col justify-between h-[150px]">
        <div>
          <h3 className="truncate text-lg font-semibold text-foreground transition-colors group-hover:text-brand">
            {journey.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <MapPin size={12} className="flex-shrink-0 text-brand" />
            {journey.destination}
          </p>
        </div>

        <div className="mt-auto">
          {/* Progress Bar */}
          {(() => {
            const now = new Date();
            const start = new Date(journey.startDate);
            const end = new Date(journey.endDate);
            const totalDuration = end.getTime() - start.getTime();
            let progress = 0;
            if (totalDuration > 0) {
              progress = Math.max(0, Math.min(100, ((now.getTime() - start.getTime()) / totalDuration) * 100));
            } else {
              progress = now > end ? 100 : 0;
            }
            return (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
                  <span>{progress === 100 ? "Completed" : progress === 0 ? "Upcoming" : "In Progress"}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
              <Calendar size={13} />
              <span>
                {new Date(journey.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" – "}
                {new Date(journey.endDate).toLocaleDateString("en-US",   { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

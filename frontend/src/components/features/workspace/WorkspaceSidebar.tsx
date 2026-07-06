import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, ListTodo, Sparkles, PiggyBank, Image as ImageIcon, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { type JourneyStatus } from "@/lib/api";

const statusColors: Record<JourneyStatus, { bg: string; text: string; dot: string }> = {
  PLANNED: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
  ONGOING: { bg: "bg-brand/10", text: "text-brand", dot: "bg-brand" },
  COMPLETED: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

export type ModuleId = "overview" | "timeline" | "ai-planner" | "budget" | "album" | "settings";

export const WORKSPACE_MODULES: { id: ModuleId; label: string; icon: any; color: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, color: "#FBA15A" },
  { id: "timeline", label: "Timeline", icon: ListTodo, color: "#60A5FA" },
  { id: "ai-planner", label: "AI Planner", icon: Sparkles, color: "#A78BFA" },
  { id: "budget", label: "Budget", icon: PiggyBank, color: "#F472B6" },
  { id: "album", label: "Album", icon: ImageIcon, color: "#14B8A6" },
  { id: "settings", label: "Settings", icon: Settings, color: "#A1A1AA" },
];

interface WorkspaceSidebarProps {
  journeyId: string;
  journeyTitle: string;
  journeyDestination: string;
  journeyStatus: JourneyStatus;
  activeModule: ModuleId;
  onModuleChange: (id: ModuleId) => void;
}

export function WorkspaceSidebar({
  journeyTitle,
  journeyDestination,
  journeyStatus,
  activeModule,
  onModuleChange,
}: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const status = statusColors[journeyStatus] ?? statusColors.PLANNED;

  return (
    <div className="flex flex-col h-full w-full lg:w-64 border-r border-border bg-card/50 backdrop-blur-sm lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">
      
      {/* Header (Desktop) */}
      <div className="hidden lg:flex flex-col p-6 border-b border-border/50">
        <button
          onClick={() => navigate("/my-trips")}
          className="mb-6 flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded-md -ml-2"
        >
          <ArrowLeft size={14} />
          Back to Library
        </button>

        <span
          className={cn(
            "mb-3 w-fit flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            status.bg,
            status.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {journeyStatus}
        </span>
        
        <h2 className="text-xl font-bold text-foreground leading-tight tracking-tight mb-1 truncate" title={journeyTitle}>
          {journeyTitle}
        </h2>
        <p className="flex items-center gap-1 text-xs text-muted-foreground truncate" title={journeyDestination}>
          <MapPin size={12} className="flex-shrink-0" />
          {journeyDestination}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 lg:px-3 lg:py-6 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-hidden hide-scrollbar">
        {WORKSPACE_MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onModuleChange(mod.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap lg:whitespace-normal",
                isActive 
                  ? "bg-muted text-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div 
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200",
                  isActive ? "bg-background shadow-sm border border-border/50" : "bg-transparent group-hover:bg-background/50"
                )}
              >
                <Icon size={16} style={{ color: isActive ? mod.color : 'currentColor' }} className={cn(!isActive && "opacity-70 group-hover:opacity-100 group-hover:text-brand transition-colors")} />
              </div>
              <span className={cn(isActive && "font-semibold")}>{mod.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full hidden lg:block"
                  style={{ backgroundColor: mod.color }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { journeyApi, type Journey } from "@/lib/api";
import { toast } from "sonner";
import { WorkspaceSidebar, type ModuleId } from "@/components/features/workspace/WorkspaceSidebar";
import { OverviewModule } from "@/components/features/workspace/OverviewModule";
import { TimelineModule } from "@/components/features/workspace/TimelineModule";
import { AlbumModule } from "@/components/features/workspace/AlbumModule";
import { BudgetModule } from "@/components/features/workspace/BudgetModule";
import { AIPlannerModule } from "@/components/features/workspace/AIPlannerModule";
import { SettingsModule } from "@/components/features/workspace/SettingsModule";

export default function JourneyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ModuleId>("overview");

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setIsLoading(true);
        if (!id) return;
        const data = await journeyApi.getById(id);
        setJourney(data.journey);
      } catch (error: any) {
        toast.error(error.message || "Failed to load journey details");
        navigate("/my-trips");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJourney();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!journey) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] w-full bg-muted/10 overflow-hidden">
        {/* Mobile Header (Back button) */}
        <div className="lg:hidden flex items-center p-4 border-b border-border bg-card shrink-0">
          <button
            onClick={() => navigate("/my-trips")}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <span className="text-lg leading-none mb-0.5">‹</span>
            Back
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-semibold truncate max-w-[150px]">{journey.title}</span>
          </div>
        </div>

        {/* Sidebar */}
        <WorkspaceSidebar 
          journeyId={journey.id}
          journeyTitle={journey.title}
          journeyDestination={journey.destination}
          journeyStatus={journey.status}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {activeModule === "overview" && <OverviewModule journey={journey} onNavigate={setActiveModule} />}
          {activeModule === "timeline" && <TimelineModule journeyId={journey.id} />}
          {activeModule === "ai-planner" && <AIPlannerModule journey={journey} />}
          {activeModule === "budget" && <BudgetModule journeyId={journey.id} />}
          {activeModule === "album" && <AlbumModule journeyId={journey.id} />}
          {activeModule === "settings" && <SettingsModule journey={journey} />}
        </div>
      </div>
    </DashboardLayout>
  );
}

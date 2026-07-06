import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardHero } from "@/components/features/dashboard/DashboardHero";
import { AIPromptCard } from "@/components/features/dashboard/AIPromptCard";
import { QuickActions } from "@/components/features/dashboard/QuickActions";
import { BudgetOverview } from "@/components/features/dashboard/BudgetOverview";
import { RecentActivity } from "@/components/features/dashboard/RecentActivity";
import { Recommendations } from "@/components/features/dashboard/Recommendations";
import { dashboardApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => dashboardApi.getSummary(),
  });

  const summary = data?.summary;

  return (
    <DashboardLayout>
      <DashboardHero />

      <div className="space-y-12 pb-20">
        <AIPromptCard />
        <QuickActions />
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : summary ? (
          <BudgetOverview summary={summary} />
        ) : null}

        {/* Two-column: Activity + Recommendations */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <RecentActivity expenses={summary?.recentExpenses || []} />
            </div>
            <div className="lg:col-span-3">
              <Recommendations />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

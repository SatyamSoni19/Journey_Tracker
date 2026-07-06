import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, Receipt, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { budgetApi } from "@/lib/api";
import { BudgetOverviewTab } from "./budget/BudgetOverviewTab";
import { ExpensesTab } from "./budget/ExpensesTab";
import { MembersTab } from "./budget/MembersTab";
import { useQuery } from "@tanstack/react-query";

const BUDGET_TABS = [
  { id: "overview", label: "Overview", icon: IndianRupee },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "members", label: "Members", icon: Users },
] as const;

type BudgetTabId = typeof BUDGET_TABS[number]["id"];

interface BudgetModuleProps {
  journeyId: string;
}

export function BudgetModule({ journeyId }: BudgetModuleProps) {
  const [activeTab, setActiveTab] = useState<BudgetTabId>("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["budgetSummary", journeyId],
    queryFn: () => budgetApi.getSummary(journeyId),
  });

  const summary = data?.summary;

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-10 pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Budget & Expenses</h2>
            <p className="text-sm text-muted-foreground mt-1">Track your spending and split bills.</p>
          </div>
          
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
            {BUDGET_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
                    isActive ? "text-foreground shadow-sm bg-card" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[400px]">
          {isLoading && activeTab === "overview" ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "overview" && summary && <BudgetOverviewTab summary={summary} journeyId={journeyId} />}
                {activeTab === "expenses" && <ExpensesTab journeyId={journeyId} />}
                {activeTab === "members" && <MembersTab journeyId={journeyId} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

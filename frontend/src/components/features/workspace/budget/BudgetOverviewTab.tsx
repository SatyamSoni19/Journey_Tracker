import { DollarSign, Percent, Edit2, Loader2, Check, X } from "lucide-react";
import { type BudgetSummary, journeyApi } from "@/lib/api";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BudgetOverviewTabProps {
  summary: BudgetSummary;
  journeyId: string;
}

export function BudgetOverviewTab({ summary, journeyId }: BudgetOverviewTabProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(summary.totalBudget.toString());

  const updateBudgetMutation = useMutation({
    mutationFn: (budget: number) => journeyApi.update(journeyId, { budget }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetSummary", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["journey", journeyId] });
      toast.success("Budget updated");
      setIsEditing(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update budget"),
  });

  const handleSaveBudget = () => {
    const val = parseFloat(newBudget);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    updateBudgetMutation.mutate(val);
  };

  const budgetProgress = summary.totalBudget > 0 ? (summary.totalSpent / summary.totalBudget) * 100 : 0;
  const isOverBudget = summary.totalSpent > summary.totalBudget;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
            {!isEditing && (
              <button onClick={() => { setIsEditing(true); setNewBudget(summary.totalBudget.toString()); }} className="text-muted-foreground hover:text-brand transition-colors">
                <Edit2 size={14} />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="number" 
                value={newBudget} 
                onChange={(e) => setNewBudget(e.target.value)} 
                className="w-full bg-background border border-input rounded-md px-2 py-1 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-brand h-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveBudget();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <button disabled={updateBudgetMutation.isPending} onClick={handleSaveBudget} className="h-9 w-9 flex items-center justify-center bg-brand text-white rounded-md hover:bg-brand/90 flex-shrink-0">
                {updateBudgetMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button onClick={() => setIsEditing(false)} className="h-9 w-9 flex items-center justify-center bg-muted text-muted-foreground rounded-md hover:bg-muted/80 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="text-2xl font-bold">{summary.totalBudget.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{summary.currency}</span></div>
          )}
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
            {summary.totalSpent.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{summary.currency}</span>
          </div>
          {isOverBudget && (
             <div className="absolute top-0 right-0 p-2 text-xs font-semibold text-destructive bg-destructive/10 rounded-bl-xl">
               Over Budget
             </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-emerald-500'}`}>
            {summary.remaining.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{summary.currency}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
           <h3 className="text-sm font-semibold text-foreground">Budget Progress</h3>
           <span className="text-sm font-medium text-muted-foreground">{budgetProgress.toFixed(1)}% spent</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-destructive' : 'bg-pink-500'}`}
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-6">Spending by Category</h3>
        
        {summary.categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No expenses recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {summary.categories.sort((a, b) => b.amount - a.amount).map((cat, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold">{cat.amount.toLocaleString()} {summary.currency}</span>
                      <span className="text-muted-foreground w-12 text-right">{cat.percentage.toFixed(1)}%</span>
                   </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

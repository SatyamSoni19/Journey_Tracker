import { Loader2, Receipt, Trash2 } from "lucide-react";
import { budgetApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface ExpensesTabProps {
  journeyId: string;
}

export function ExpensesTab({ journeyId }: ExpensesTabProps) {
  const queryClient = useQueryClient();

  const { data: membersData } = useQuery({
    queryKey: ["budgetMembers", journeyId],
    queryFn: () => budgetApi.getMembers(journeyId),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["budgetCategories", journeyId],
    queryFn: () => budgetApi.getCategories(journeyId),
  });

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["budgetExpenses", journeyId],
    queryFn: () => budgetApi.getExpenses(journeyId),
  });

  const deleteMutation = useMutation({
    mutationFn: (expenseId: string) => budgetApi.deleteExpense(journeyId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetExpenses", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary", journeyId] });
      toast.success("Expense deleted");
    },
    onError: () => toast.error("Failed to delete expense"),
  });

  const expenses = expensesData?.expenses || [];
  const members = membersData?.members || [];
  const categories = categoriesData?.categories || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Expenses</h3>
        <AddExpenseDialog journeyId={journeyId} categories={categories} members={members} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 text-pink-500 mb-4">
              <Receipt size={24} />
            </div>
            <h3 className="text-lg font-semibold">No expenses yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Add your first expense to start tracking the journey's budget.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {expenses.map((expense) => (
              <li key={expense.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${expense.category.color}20`, color: expense.category.color }}
                    >
                      <Receipt size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-base leading-tight">{expense.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Paid by {expense.paidBy.name} • {format(new Date(expense.date), "MMM d, yyyy")}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${expense.category.color}20`, color: expense.category.color }}>
                          {expense.category.name}
                        </span>
                        {expense.notes && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{expense.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-lg">{expense.amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{expense.currency}</span></span>
                    <button
                      onClick={() => {
                        if (confirm("Delete this expense?")) deleteMutation.mutate(expense.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Splits Preview */}
                <div className="mt-3 ml-13 flex flex-wrap gap-2">
                  {expense.splits.map(split => (
                    <div key={split.id} className="text-[11px] bg-background border border-border px-2 py-1 rounded-md text-muted-foreground flex items-center gap-1">
                      <span className="font-medium text-foreground">{split.member.name}</span>
                      <span>{split.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

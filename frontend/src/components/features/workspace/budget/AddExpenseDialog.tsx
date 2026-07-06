import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { budgetApi, type BudgetMember, type ExpenseCategory } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DateInput } from "@/components/ui/date-input";

interface AddExpenseDialogProps {
  journeyId: string;
  categories: ExpenseCategory[];
  members: BudgetMember[];
}

export function AddExpenseDialog({ journeyId, categories, members }: AddExpenseDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paidById, setPaidById] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [splitType, setSplitType] = useState<"EQUALLY" | "CUSTOM">("EQUALLY");

  const [splits, setSplits] = useState<{ memberId: string; amount: number }[]>([]);

  const addMutation = useMutation({
    mutationFn: (data: any) => budgetApi.createExpense(journeyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetExpenses", journeyId] });
      queryClient.invalidateQueries({ queryKey: ["budgetSummary", journeyId] });
      toast.success("Expense added");
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => toast.error(error.message || "Failed to add expense"),
  });

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategoryId("");
    setPaidById("");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setSplitType("EQUALLY");
    setSplits([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) resetForm();
  };

  const calculateEqualSplits = (total: number) => {
    if (members.length === 0) return [];
    const equalAmount = total / members.length;
    return members.map(m => ({ memberId: m.id, amount: equalAmount }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId || !paidById || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const totalAmount = parseFloat(amount);
    let finalSplits = splits;

    if (splitType === "EQUALLY") {
      finalSplits = calculateEqualSplits(totalAmount);
    } else {
      const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(splitTotal - totalAmount) > 0.01) {
        toast.error("Splits do not add up to total amount.");
        return;
      }
    }

    addMutation.mutate({
      title,
      amount: totalAmount,
      categoryId,
      paidById,
      date: new Date(date).toISOString(),
      notes,
      splits: finalSplits,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand/90 hover:scale-105 shadow-sm">
        <Plus size={16} />
        Add Expense
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        {members.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm">
            Please add members to this journey before adding expenses.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Dinner at restaurant"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Amount</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
                <DateInput
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Select...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Paid By</label>
                <select
                  required
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Select...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Split</label>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 mb-3">
                <button
                  type="button"
                  onClick={() => setSplitType("EQUALLY")}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${splitType === "EQUALLY" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Equally
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSplitType("CUSTOM");
                    setSplits(members.map(m => ({ memberId: m.id, amount: 0 })));
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${splitType === "CUSTOM" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Custom
                </button>
              </div>
              
              {splitType === "CUSTOM" && (
                <div className="space-y-2 border border-border rounded-xl p-3 bg-muted/20">
                  {members.map((m) => {
                    const currentSplit = splits.find(s => s.memberId === m.id)?.amount || 0;
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm">{m.name}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={currentSplit || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSplits(prev => prev.map(s => s.memberId === m.id ? { ...s, amount: val } : s));
                          }}
                          className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand text-right"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none h-20"
                placeholder="Optional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-medium text-white transition-all hover:bg-brand/90 disabled:opacity-50"
            >
              {addMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Expense"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

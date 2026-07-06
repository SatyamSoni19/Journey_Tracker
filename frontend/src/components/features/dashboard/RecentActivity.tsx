import { motion } from "framer-motion";
import { Clock, Receipt } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
  expenses: any[];
}

export function RecentActivity({ expenses }: RecentActivityProps) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your latest trip expenses
          </p>
        </div>
        <button className="text-sm font-medium text-brand hover:text-brand/80">
          View all
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2 shadow-card">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No recent activity found.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {expenses.map((expense, i) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group flex cursor-pointer items-start gap-4 rounded-xl p-3 hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${expense.categoryColor}20`, color: expense.categoryColor }}
                >
                  <Receipt className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {expense.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {expense.journeyTitle} • {expense.categoryName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{expense.amount.toLocaleString()}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(expense.date), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

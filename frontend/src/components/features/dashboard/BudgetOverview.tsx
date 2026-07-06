import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardSummary } from "@/lib/api";

interface BudgetOverviewProps {
  summary: DashboardSummary;
}

export function BudgetOverview({ summary }: BudgetOverviewProps) {
  const stats = [
    {
      label: "Total Budget",
      value: summary.totalBudget,
      icon: Wallet,
      color: "text-foreground",
      bg: "bg-muted",
    },
    {
      label: "Spent",
      value: summary.totalSpent,
      icon: TrendingUp,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Remaining",
      value: summary.remaining,
      icon: TrendingDown,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  const chartData = summary.categories.map((c) => ({
    name: c.name,
    value: c.amount,
  }));
  const colors = summary.categories.map((c) => c.color);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Global Budget Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your spending across all your journeys
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  ₹{stat.value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-5 shadow-card min-h-[220px]"
        >
          {summary.totalSpent === 0 ? (
            <div className="text-sm text-muted-foreground text-center">No spending recorded yet.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value: any) => [
                      `₹${Number(value).toLocaleString()}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
                {summary.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

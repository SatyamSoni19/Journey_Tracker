import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
  Receipt,
  Users,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";
import { QUICK_ACTIONS } from "@/constants/dashboard";
import { CreateJourneyDialog } from "../trips/CreateJourneyDialog";

const iconMap: Record<string, LucideIcon> = {
  Compass,
  Sparkles,
  Receipt,
  Users,
  PiggyBank,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function QuickActions() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump right into what you need
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = iconMap[action.icon] ?? Compass;
          
          const buttonContent = (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover w-full h-full"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon
                  className="h-6 w-6"
                  style={{ color: action.color }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {action.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground hidden sm:block">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );

          if (action.id === "new-journey") {
            return (
              <CreateJourneyDialog key={action.id}>
                {buttonContent}
              </CreateJourneyDialog>
            );
          }

          return buttonContent;
        })}
      </motion.div>
    </section>
  );
}

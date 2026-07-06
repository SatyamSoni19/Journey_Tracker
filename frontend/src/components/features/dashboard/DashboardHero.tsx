import { motion } from "framer-motion";

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Removed orange background gradient divs */}

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 text-sm font-medium text-brand"
          >
            Good afternoon, Traveler ☀️
          </motion.p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Where do you want
            <br />
            <span className="text-[#FBA15A]">to travel next?</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg"
          >
            Plan your perfect journey with AI-powered recommendations, smart
            budgeting, and real-time collaboration.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

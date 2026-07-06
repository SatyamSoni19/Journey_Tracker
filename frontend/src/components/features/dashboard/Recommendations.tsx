import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { RECOMMENDATIONS } from "@/constants/dashboard";

const priceLabels: Record<number, string> = {
  1: "₹",
  2: "₹₹",
  3: "₹₹₹",
  4: "₹₹₹₹",
};

export function Recommendations() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Recommended for You
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Destinations you'll love
          </p>
        </div>
        <motion.button
          whileHover={{ x: 4 }}
          className="flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-dark"
        >
          Explore more <ArrowRight size={14} />
        </motion.button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RECOMMENDATIONS.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={rec.image}
                alt={rec.destination}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Price level */}
              <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {priceLabels[rec.priceLevel]}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {rec.destination}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                  <span className="text-xs font-medium text-foreground">
                    {rec.rating}
                  </span>
                </div>
              </div>

              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {rec.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {rec.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

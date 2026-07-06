import { motion } from "framer-motion";
import { MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedButton } from "@/components/common/AnimatedButton";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="text-center"
      >
        {/* Animated icon */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand/10"
        >
          <MapPin className="h-12 w-12 text-brand" />
        </motion.div>

        {/* Text */}
        <h1 className="text-7xl font-bold text-gradient sm:text-8xl">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Lost in transit
        </h2>
        <p className="mt-2 max-w-md text-base text-muted-foreground">
          Looks like this route doesn't exist on our map. Let's get you back to
          familiar territory.
        </p>

        {/* Action */}
        <div className="mt-8">
          <Link to="/">
            <AnimatedButton size="lg" icon={<ArrowLeft size={16} />}>
              Back to Home
            </AnimatedButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

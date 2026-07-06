import { motion } from "framer-motion";
import { Plane, MapPin, Globe } from "lucide-react";

export function AuthLeftPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F1115] via-[#1a1d27] to-[#171A21]">
      {/* Decorative gradient orbs */}
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-brand/10 blur-[100px]" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-brand/8 blur-[120px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating animated elements */}
      <div className="relative z-10 flex flex-col items-center px-12 text-center">
        {/* Animated plane */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand/10 backdrop-blur-sm border border-brand/20">
            <Plane className="h-10 w-10 text-brand" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-4 text-4xl font-bold text-white"
        >
          Your Journey
          <br />
          <span className="text-gradient">Starts Here</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-10 max-w-sm text-base text-white/50 leading-relaxed"
        >
          Plan smarter. Travel better. Let AI craft the perfect itinerary for every adventure.
        </motion.p>

        {/* Floating stat cards */}
        <div className="flex gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md"
          >
            <MapPin className="h-5 w-5 text-brand" />
            <div className="text-left">
              <p className="text-lg font-bold text-white">150+</p>
              <p className="text-xs text-white/40">Destinations</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md"
          >
            <Globe className="h-5 w-5 text-brand" />
            <div className="text-left">
              <p className="text-lg font-bold text-white">10K+</p>
              <p className="text-xs text-white/40">Travelers</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

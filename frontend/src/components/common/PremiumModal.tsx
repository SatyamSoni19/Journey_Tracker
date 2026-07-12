import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Cross Bar */}
            <div className="sticky top-0 z-50 flex items-center justify-end px-4 py-3 bg-card/80 backdrop-blur-md border-b border-border/30">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto scrollbar-thin">
              {/* Header Content */}
              <div className="relative overflow-hidden px-8 pb-6 pt-6 text-center">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand/20 via-background to-background" />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 ring-1 ring-brand/20 shadow-[0_0_30px_-5px_rgba(var(--brand),0.3)]">
                  <Sparkles className="h-8 w-8 text-brand" />
                </div>
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Unlock Unlimited Planning
              </h2>
              <p className="mx-auto max-w-lg text-muted-foreground">
                Level up your journey with premium AI capabilities, real-time collaboration, and unlimited itinerary generation.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-6 px-6 pb-12 sm:px-12 md:grid-cols-2">
              
              {/* Pro Plan */}
              <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 transition-all hover:border-brand/30 hover:shadow-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Explorer Pro
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Perfect for frequent travelers.</p>
                </div>
                <div className="mb-6 flex items-baseline text-3xl font-bold">
                  $9.99
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" /> <span>50 AI generations per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" /> <span>Export to PDF & Google Maps</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" /> <span>Priority AI Response Speed</span>
                  </li>
                  <li className="flex items-center gap-3 opacity-50">
                    <X className="h-4 w-4 text-muted-foreground" /> <span>Team Collaboration</span>
                  </li>
                </ul>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl border border-border bg-muted py-3 font-semibold text-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                >
                  Get Explorer Pro
                </button>
              </div>

              {/* Ultimate Plan (Highlighted) */}
              <div className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-brand bg-card p-6 shadow-xl shadow-brand/10 transition-all hover:shadow-brand/20">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-purple-500 to-brand" />
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand/10 blur-2xl" />
                
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Star className="h-5 w-5 text-brand" />
                      Nomad Ultimate
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">For power users and digital nomads.</p>
                  </div>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand/20">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6 flex items-baseline text-3xl font-bold">
                  $19.99
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                </div>
                <ul className="mb-8 flex-1 space-y-3 text-sm text-foreground">
                  <li className="flex items-center gap-3">
                    <div className="rounded-full bg-brand/20 p-0.5"><Check className="h-3 w-3 text-brand" /></div>
                    <span className="font-medium text-brand">Unlimited AI generations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" /> <span>Export to PDF & Google Maps</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" /> <span>Ultra-fast AI Response Speed</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500" /> <span>Real-time Team Collaboration</span>
                  </li>
                </ul>
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-gradient-to-r from-brand to-purple-600 py-3 font-bold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-brand/40"
                >
                  Upgrade to Ultimate
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-muted/30 px-6 py-4 text-center text-xs text-muted-foreground">
              Cancel anytime. Prices are in USD and may be subject to local taxes.
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

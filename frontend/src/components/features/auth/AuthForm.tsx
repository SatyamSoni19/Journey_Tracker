import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { Logo } from "@/components/common/Logo";

type AuthTab = "signin" | "signup";

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");

  const tabs: { id: AuthTab; label: string }[] = [
    { id: "signin", label: "Sign In" },
    { id: "signup", label: "Sign Up" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="w-full max-w-md mx-auto"
    >
      {/* Logo — visible on mobile */}
      <div className="mb-8 flex justify-center lg:hidden">
        <Logo size="lg" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
        {/* Welcome */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {activeTab === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {activeTab === "signin"
              ? "Sign in to continue your journey"
              : "Start planning your next adventure"}
          </p>
        </div>

        {/* Tabs */}
        <div className="relative mb-8 flex rounded-xl bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative z-10 flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-200",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="auth-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-card shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          {activeTab === "signin" ? (
            <SignInForm key="signin" />
          ) : (
            <SignUpForm key="signup" />
          )}
        </AnimatePresence>
      </div>

      {/* Footer text */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <button className="text-brand hover:underline">Terms of Service</button>{" "}
        and{" "}
        <button className="text-brand hover:underline">Privacy Policy</button>
      </p>
    </motion.div>
  );
}

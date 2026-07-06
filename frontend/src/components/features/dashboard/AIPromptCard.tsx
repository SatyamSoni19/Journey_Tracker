import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { AI_SUGGESTIONS } from "@/constants/dashboard";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function AIPromptCard() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleOpenPlanner = (text: string) => {
    if (!text.trim()) return;
    // We navigate to /ai-planner and can pass the prompt via state if we update AIPlannerPage to read it.
    // For now we just go there. If the user wants to start right away, we could execute the API request here and redirect,
    // but the easiest is just let AIPlannerPage handle it, or we just jump to the page.
    navigate('/ai-planner', { state: { initialPrompt: text } });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card"
      >
        {/* Subtle gradient accent */}
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand/8 blur-[80px]" />

        <div className="relative">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                AI Travel Planner
              </h2>
              <p className="text-sm text-muted-foreground">
                Describe your dream trip and let AI do the rest
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me to plan your next trip..."
              rows={3}
              className={cn(
                "w-full resize-none rounded-xl border bg-background p-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground/60",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
                "border-border hover:border-muted-foreground/30"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleOpenPlanner(prompt);
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenPlanner(prompt)}
              className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              <Send size={16} />
            </motion.button>
          </div>

          {/* Suggestions */}
          <div className="mt-6 flex flex-wrap gap-2">
            {AI_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleOpenPlanner(suggestion)}
                className="rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

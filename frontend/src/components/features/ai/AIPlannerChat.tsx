import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiPlannerApi } from "@/lib/api";
import type { AIPlannerResponse, AIPlannerRequest } from "@/types/aiPlanner.types";
import { AITypingIndicator } from "./AITypingIndicator";
import { PlanSkeleton } from "./PlanSkeleton";

interface AIPlannerChatProps {
  journeyId: string;
  destination: string;
  budget: number;
  startDate: string;
  endDate: string;
  onPlanGenerated: (plan: AIPlannerResponse, planId: string) => void;
}

export function AIPlannerChat({
  journeyId,
  destination,
  budget,
  startDate,
  endDate,
  onPlanGenerated,
}: AIPlannerChatProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);
      
      const request: AIPlannerRequest = {
        prompt: prompt.trim(),
        destination,
        budget,
        days,
        journeyId,
      };

      const res = await aiPlannerApi.generatePlan(request);
      onPlanGenerated(res.plan, res.planId);
      setPrompt("");
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const suggestions = [
    "Plan a relaxing trip focused on food and culture.",
    "Make an action-packed itinerary with adventure sports.",
    "I'm traveling with kids, include family-friendly activities.",
    "Keep the budget as low as possible without sacrificing safety.",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      
      {!isGenerating && !error && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setPrompt(suggestion)}
              className="text-xs bg-muted/40 hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isGenerating ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1 pt-1 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Analyzing request for {destination}...
              </p>
              <AITypingIndicator />
            </div>
          </div>
          <PlanSkeleton />
        </div>
      ) : (
        <div className="relative group">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell AI your travel style, preferences, or specific things you want to do..."
            className="w-full bg-card border-2 border-border focus:border-brand/50 rounded-2xl p-4 pr-14 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-brand/10"
            rows={1}
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "absolute right-3 bottom-3 p-2 rounded-xl flex items-center justify-center transition-all",
              prompt.trim() && !isGenerating
                ? "bg-brand text-white shadow-md hover:bg-brand/90 hover:scale-105"
                : "bg-muted text-muted-foreground/50 cursor-not-allowed"
            )}
          >
            <Send size={16} className={prompt.trim() && !isGenerating ? "translate-x-0.5" : ""} />
          </button>
        </div>
      )}

    </div>
  );
}

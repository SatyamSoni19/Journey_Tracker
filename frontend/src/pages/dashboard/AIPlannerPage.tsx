import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Map,
  ArrowRight,
  Loader2,
  AlertCircle,
  MessageSquare,
  Trash2,
  Plus,
  Compass,
  ArrowLeft,
  Edit2,
  Check,
  Send,
  Bot,
  User,
} from "lucide-react";
import { aiPlannerApi } from "@/lib/api";
import { journeyApi } from "@/lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ItineraryRenderer } from "../../components/features/ai/ItineraryRenderer";
import { PremiumModal } from "../../components/common/PremiumModal";
import ReactMarkdown from "react-markdown";
import type { AIPlannerResponse, AIPlannerRequest } from "@/types/aiPlanner.types";

interface SavedPlan {
  id: string;
  prompt: string;
  destination: string;
  result: AIPlannerResponse;
  createdAt: string;
}

type ChatMessage = {
  id: string;
  role: "user" | "model";
  content: string;
};

export function AIPlannerPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingJourney, setIsCreatingJourney] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  
  // Chat state for follow-up conversations within a plan
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const initialPrompt = location.state?.initialPrompt;
    if (initialPrompt && !hasAutoTriggered) {
      setHasAutoTriggered(true);
      setPrompt(initialPrompt);
      
      // We must pass the text directly since state setter is async
      handleGeneratePlan(undefined, initialPrompt);
      
      // Clear state so it doesn't re-trigger on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, hasAutoTriggered, navigate]);

  // Clear chat when switching plans
  useEffect(() => {
    setChatMessages([]);
    setFollowUpPrompt("");
  }, [activePlanId]);

  // Auto-scroll to bottom when new chat messages arrive
  useEffect(() => {
    if (chatMessages.length > 0 && scrollRef.current) {
      // Small delay to let DOM update
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [chatMessages, isChatting]);

  const fetchPlans = async () => {
    try {
      const res = await aiPlannerApi.listPlans();
      setPlans(res.plans);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch AI plan history");
    }
  };

  const handleGeneratePlan = async (e?: React.FormEvent, overridePrompt?: string) => {
    e?.preventDefault();
    const currentPrompt = overridePrompt || prompt;
    if (!currentPrompt.trim()) return;
    
    try {
      setIsGenerating(true);
      setError(null);
      setActivePlanId(null); // Deselect to show generating state

      const request: AIPlannerRequest = {
        prompt: currentPrompt,
      };

      const res = await aiPlannerApi.generatePlan(request);
      
      // Refresh list and select the new one
      await fetchPlans();
      setActivePlanId(res.planId);
      setPrompt("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate travel plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFollowUpChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!followUpPrompt.trim() || !activePlanId || isChatting) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: followUpPrompt.trim(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setFollowUpPrompt("");
    setIsChatting(true);

    try {
      // Build history from existing chat messages
      const history = chatMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const res = await aiPlannerApi.chatWithPlan(activePlanId, {
        prompt: userMsg.content,
        history,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: res.response,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `❌ **Error**: ${err.message || "Failed to get response"}`,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiPlannerApi.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (activePlanId === id) setActivePlanId(null);
      toast.success("Chat deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat");
    }
  };

  const handleCreateJourney = async (planId: string) => {
    try {
      setIsCreatingJourney(true);
      const res = await journeyApi.createFromAIPlan(planId);
      toast.success("Journey created successfully!");
      navigate(`/journeys/${res.journey.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create journey from plan");
    } finally {
      setIsCreatingJourney(false);
    }
  };

  const handleUpdateName = async () => {
    if (!activePlanId || !editNameValue.trim()) return;
    try {
      await aiPlannerApi.updatePlan(activePlanId, editNameValue.trim());
      setPlans(plans.map(p => p.id === activePlanId ? { ...p, destination: editNameValue.trim() } : p));
      setIsEditingName(false);
      toast.success("Name updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update name");
    }
  };

  const activePlan = plans.find(p => p.id === activePlanId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar History */}
      <div className="w-80 border-r border-border bg-card/30 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border/50">
          <button
            onClick={() => setActivePlanId(null)}
            className="w-full flex items-center justify-center gap-2 bg-brand text-brand-foreground hover:bg-brand/90 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-brand/25 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New AI Plan
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Recent Plans
          </h3>
          {plans.length === 0 && !isGenerating && (
             <div className="text-sm text-muted-foreground px-2 italic">No history yet.</div>
          )}
          
          <AnimatePresence>
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <button
                  onClick={() => setActivePlanId(plan.id)}
                  className={`w-full group flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                    activePlanId === plan.id
                      ? "bg-muted shadow-sm ring-1 ring-border"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <MessageSquare className={`w-5 h-5 shrink-0 mt-0.5 ${
                    activePlanId === plan.id ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                  }`} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate text-foreground">
                      {plan.destination}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {plan.prompt}
                    </p>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePlanId(plan.id);
                        setEditNameValue(plan.destination);
                        setIsEditingName(true);
                      }}
                      className="p-1.5 hover:bg-brand/10 text-muted-foreground hover:text-brand rounded-lg transition-all"
                      title="Rename Plan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePlan(plan.id, e)}
                      className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground leading-tight">
                AI Travel Consultant
              </h2>
              {activePlan ? (
                isEditingName ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      autoFocus
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                      onBlur={handleUpdateName}
                      className="text-sm bg-background border border-brand/50 rounded px-1.5 py-0.5 h-6 focus:outline-none focus:ring-1 focus:ring-brand w-48"
                    />
                    <button onMouseDown={(e) => { e.preventDefault(); handleUpdateName(); }} className="text-brand hover:bg-brand/10 p-0.5 rounded">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5 group/edit">
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {activePlan.destination}
                    </p>
                    <button
                      onClick={() => {
                        setEditNameValue(activePlan.destination);
                        setIsEditingName(true);
                      }}
                      className="opacity-0 group-hover/edit:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  Crafting your perfect itinerary
                </p>
              )}
            </div>
          </div>

          {/* Create Journey button in header when plan is active */}
          {activePlan && !isGenerating && !error && (
            <button
              onClick={() => handleCreateJourney(activePlan.id)}
              disabled={isCreatingJourney}
              className="bg-brand hover:bg-brand/90 text-brand-foreground px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-sm"
            >
              {isCreatingJourney ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Map className="w-4 h-4" />
                  Create Journey from Plan
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin relative bg-gradient-to-br from-background via-background to-muted/20">
          <AnimatePresence mode="wait">
            {!activePlanId && !isGenerating && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
              >
                <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-brand/20">
                   <Compass className="w-10 h-10 text-brand" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
                  Where to next?
                </h1>
                <p className="text-lg text-muted-foreground text-center max-w-lg mb-12">
                  Describe your dream trip in natural language. Our AI will craft a personalized itinerary with hotels, restaurants, and activities.
                </p>
                
                <form onSubmit={handleGeneratePlan} className="w-full max-w-2xl relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand to-brand/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative flex items-center bg-card rounded-2xl shadow-xl ring-1 ring-border focus-within:ring-2 focus-within:ring-brand overflow-hidden transition-all">
                    <input
                      type="text"
                      placeholder="e.g. A 4-day solo backpacker trip to Jaipur under ₹15,000..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1 bg-transparent border-none py-5 pl-6 pr-4 text-base md:text-lg focus:outline-none placeholder:text-muted-foreground/50"
                      disabled={isGenerating}
                    />
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isGenerating}
                      className="bg-brand hover:bg-brand/90 text-brand-foreground p-3 mr-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-brand/25 flex items-center justify-center"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/50">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>3 of 10 free AI generations remaining</span>
                  </div>
                  <button 
                    onClick={() => setIsPremiumModalOpen(true)}
                    type="button"
                    className="text-xs text-brand hover:underline flex items-center gap-1 font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Upgrade to Premium for unlimited planning
                  </button>
                </div>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-sm z-50"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-brand animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-8 mb-2">Crafting your itinerary...</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Analyzing millions of places, hotels, and restaurants to build your perfect trip. This usually takes 15-30 seconds.
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-3xl max-w-md text-center flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Oops! Something went wrong</h3>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="bg-background text-foreground hover:bg-muted px-6 py-2.5 rounded-xl font-medium border border-border shadow-sm transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}

            {activePlan && !isGenerating && !error && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-10 max-w-5xl mx-auto"
              >
                <div className="bg-card/50 border border-border/50 rounded-2xl p-4 mb-8 flex items-start gap-4">
                  <MessageSquare className="w-5 h-5 text-brand shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Your Prompt</p>
                    <p className="text-sm text-muted-foreground italic mt-1">"{activePlan.prompt}"</p>
                  </div>
                </div>
                
                <ItineraryRenderer plan={activePlan.result} />

                {/* Chat Messages Section */}
                {chatMessages.length > 0 && (
                  <div className="mt-10 border-t border-border/50 pt-8 space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Follow-up Conversation
                    </h3>
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.role === "user" ? "bg-brand text-white" : "bg-card border border-border text-brand"
                          }`}>
                            {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                          </div>
                          <div className={`px-4 py-3 rounded-2xl shadow-sm prose prose-sm dark:prose-invert max-w-none ${
                            msg.role === "user"
                              ? "bg-brand text-white rounded-tr-sm"
                              : "bg-card border border-border/50 text-foreground rounded-tl-sm"
                          }`}>
                            {msg.content.startsWith("❌") ? (
                              <div className="flex items-center gap-2 text-destructive">
                                <AlertCircle size={16} />
                                <span className="font-medium">{msg.content.replace("❌ **Error**: ", "")}</span>
                              </div>
                            ) : (
                              <div className="leading-relaxed">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isChatting && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex gap-3 max-w-[85%] md:max-w-[75%]">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border border-border text-brand flex items-center justify-center">
                            <Bot size={16} />
                          </div>
                          <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border/50 flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-brand" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Spacer for bottom input */}
                <div className="h-28" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Input Bar — for follow-up chat (only when viewing a plan) */}
        <AnimatePresence>
          {activePlan && !isGenerating && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="shrink-0 border-t border-border/50 bg-card/80 backdrop-blur-sm p-4 z-20"
            >
              <form 
                onSubmit={handleFollowUpChat} 
                className="max-w-4xl mx-auto relative flex items-center bg-background rounded-2xl border border-border focus-within:ring-2 focus-within:ring-brand/30 overflow-hidden transition-all"
              >
                <input
                  type="text"
                  placeholder="Ask a follow-up question about this plan..."
                  value={followUpPrompt}
                  onChange={(e) => setFollowUpPrompt(e.target.value)}
                  className="flex-1 bg-transparent border-none px-5 py-4 text-sm focus:outline-none placeholder:text-muted-foreground/60"
                  disabled={isChatting}
                />
                <button
                  type="submit"
                  disabled={!followUpPrompt.trim() || isChatting}
                  className="bg-brand hover:bg-brand/90 text-brand-foreground p-2.5 mr-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center"
                >
                  {isChatting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
      />
    </div>
  );
}

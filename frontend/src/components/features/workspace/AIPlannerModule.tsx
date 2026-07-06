import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Map, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { aiPlannerApi, type Journey } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface AIPlannerModuleProps {
  journey: Journey;
}

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
};

export function AIPlannerModule({ journey }: AIPlannerModuleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: `Hi! I'm your AI Travel Assistant for **${journey.destination}**. Ask me anything about your trip, like "Find cafes within 2 km" or "Suggest an itinerary for tomorrow."`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Map current messages to history format expected by backend (excluding the welcome message if needed, but Gemini handles it fine)
      const history = messages
        .filter(m => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      const res = await aiPlannerApi.chat({
        journeyId: journey.id,
        prompt: userMsg.content,
        history,
      });

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "model", content: res.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      // We can also insert an error message directly into the chat
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "model", content: `❌ **Error**: ${err.message || "Failed to connect to AI"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseContent = (content: string) => {
    // Regex to match [PLACE_RECOMMENDATION: {...}]
    const regex = /\[PLACE_RECOMMENDATION:\s*({[^}]+})\]/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      try {
        const placeData = JSON.parse(match[1]);
        parts.push(
          <PlaceRecommendationCard 
            key={match.index}
            name={placeData.name}
            query={placeData.query}
            type={placeData.type}
          />
        );
      } catch (e) {
        parts.push(match[0]);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full max-w-5xl mx-auto bg-background rounded-xl overflow-hidden border border-border/50">
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Journey AI Assistant
            </h2>
            <p className="text-sm text-muted-foreground">
              Context-aware planning for {journey.destination}
            </p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-muted/10 scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex gap-3 max-w-[85%] md:max-w-[75%]",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  msg.role === "user" ? "bg-brand text-white" : "bg-card border border-border text-brand"
                )}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className={cn(
                  "px-4 py-3 rounded-2xl shadow-sm prose prose-sm dark:prose-invert max-w-none",
                  msg.role === "user" 
                    ? "bg-brand text-white rounded-tr-sm" 
                    : "bg-card border border-border/50 text-foreground rounded-tl-sm"
                )}>
                  {msg.role === "model" && msg.content.startsWith("❌") ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle size={16} />
                      <span className="font-medium">{msg.content.replace("❌ **Error**: ", "")}</span>
                    </div>
                  ) : (
                    <div className="leading-relaxed">
                      {parseContent(msg.content).map((part, i) => 
                        typeof part === "string" ? (
                          <div key={i} className="mb-2 last:mb-0">
                            <ReactMarkdown>
                              {part}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          part
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
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
                  <span className="text-sm text-muted-foreground">Assistant is typing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border/50 shrink-0">
        <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to optimize tomorrow's route or find a cafe..."
            className="w-full min-h-[52px] max-h-32 bg-background border border-border rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 w-9 h-9 flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          <button onClick={() => setInput("Suggest hidden gems nearby")} className="text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-md transition-colors">Suggest hidden gems nearby</button>
          <button onClick={() => setInput("Best breakfast near my hotel")} className="text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-md transition-colors">Best breakfast near my hotel</button>
          <button onClick={() => setInput("Optimize tomorrow's route")} className="text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-2.5 py-1 rounded-md transition-colors">Optimize tomorrow's route</button>
        </div>
      </div>

    </div>
  );
}

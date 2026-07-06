import React, { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  value: string; // "HH:mm" 24h
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  error?: boolean;
}

export function TimeInput({ value, onChange, required, className, error }: TimeInputProps) {
  const [focused, setFocused] = useState(false);
  
  // parse "14:30" -> h=14, m=30
  const parseTime = (val: string) => {
    if (!val) return { h12: "12", m: "00", ampm: "AM" };
    const [h, m] = val.split(":");
    let hNum = parseInt(h, 10) || 0;
    const ampm = hNum >= 12 ? "PM" : "AM";
    if (hNum > 12) hNum -= 12;
    if (hNum === 0) hNum = 12;
    return {
      h12: hNum.toString().padStart(2, "0"),
      m: (m || "00").padStart(2, "0"),
      ampm
    };
  };

  const parsed = parseTime(value);

  const updateTime = (h12: string, m: string, ampm: string) => {
    let h = parseInt(h12, 10) || 0;
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const hh = h.toString().padStart(2, "0");
    const mm = m.padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  return (
    <div
      className={cn(
        "relative flex items-center rounded-xl border transition-all duration-200 h-11 w-full text-sm",
        focused
          ? "border-brand/60 shadow-sm ring-2 ring-brand/15 bg-background"
          : error
          ? "border-destructive/60 bg-muted/40"
          : "border-border bg-muted/40 hover:border-border/80 hover:bg-muted/60",
        className
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-muted-foreground/60 z-10 pointer-events-none">
        <Clock size={15} />
      </div>
      
      <div className="flex items-center pl-10 pr-3 w-full h-full gap-1">
        <select
          value={parsed.h12}
          onChange={(e) => updateTime(e.target.value, parsed.m, parsed.ampm)}
          className="appearance-none bg-transparent focus:outline-none text-foreground font-medium text-center w-8 cursor-pointer"
          required={required}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const hStr = h.toString().padStart(2, "0");
            return <option key={hStr} value={hStr} className="bg-background text-foreground">{hStr}</option>;
          })}
        </select>
        
        <span className="text-muted-foreground font-bold">:</span>
        
        <select
          value={parsed.m}
          onChange={(e) => updateTime(parsed.h12, e.target.value, parsed.ampm)}
          className="appearance-none bg-transparent focus:outline-none text-foreground font-medium text-center w-8 cursor-pointer"
          required={required}
        >
          {Array.from({ length: 60 }, (_, i) => i).map((m) => {
            const mStr = m.toString().padStart(2, "0");
            return <option key={mStr} value={mStr} className="bg-background text-foreground">{mStr}</option>;
          })}
        </select>

        <select
          value={parsed.ampm}
          onChange={(e) => updateTime(parsed.h12, parsed.m, e.target.value)}
          className="appearance-none bg-transparent focus:outline-none text-foreground font-medium text-center ml-1 cursor-pointer w-10"
          required={required}
        >
          <option value="AM" className="bg-background text-foreground">AM</option>
          <option value="PM" className="bg-background text-foreground">PM</option>
        </select>
      </div>
    </div>
  );
}

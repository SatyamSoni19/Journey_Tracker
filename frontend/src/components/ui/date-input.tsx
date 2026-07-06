import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function DateInput({ error, className, onChange, value, name, ...props }: DateInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (inputRef.current) {
      try {
        (inputRef.current as any).showPicker();
      } catch {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center rounded-xl border transition-all duration-200",
        focused
          ? "border-brand/60 shadow-sm ring-2 ring-brand/15 bg-background"
          : error
          ? "border-destructive/60 bg-muted/40"
          : "border-border bg-muted/40 hover:border-border/80 hover:bg-muted/60"
      )}
    >
      {/* Clickable calendar icon */}
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center transition-colors duration-200 rounded-l-xl z-10",
          focused ? "text-brand" : "text-muted-foreground/60 hover:text-brand"
        )}
        tabIndex={-1}
        aria-label="Open calendar"
      >
        <Calendar size={15} />
      </button>

      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "h-11 w-full bg-transparent pl-10 pr-3 text-sm text-foreground focus:outline-none",
          "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0",
          className
        )}
        {...props}
      />
    </div>
  );
}

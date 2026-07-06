import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface AnimatedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

export function AnimatedInput({
  label,
  icon,
  error,
  type,
  className,
  id,
  ...props
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-1.5"
    >
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
              focused ? "text-brand" : "text-muted-foreground"
            )}
          >
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60",
            "transition-all duration-200 ease-out",
            "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
            icon && "pl-11",
            isPassword && "pr-11",
            error
              ? "border-destructive focus:ring-destructive/40"
              : "border-border hover:border-muted-foreground/30",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

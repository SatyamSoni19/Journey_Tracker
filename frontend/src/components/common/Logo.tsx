import { Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 18, text: "text-base" },
  md: { icon: 22, text: "text-lg" },
  lg: { icon: 28, text: "text-xl" },
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizes[size];

  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-2.5 font-heading font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80",
        className
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
        <Compass className="text-white" size={s.icon} strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={cn(s.text, "hidden sm:inline-block")}>
          Journey<span className="text-brand">Tracker</span>
        </span>
      )}
    </Link>
  );
}

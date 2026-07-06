import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
}

export function GradientText({
  children,
  className,
  as: Tag = "h1",
}: GradientTextProps) {
  return (
    <Tag className={cn("text-gradient font-heading font-bold", className)}>
      {children}
    </Tag>
  );
}

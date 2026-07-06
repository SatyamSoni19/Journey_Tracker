import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  glass = false,
  hover = true,
  delay = 0,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        "rounded-2xl border border-border bg-card p-6 transition-shadow duration-300",
        hover && "cursor-pointer hover:shadow-card-hover",
        glass && "glass dark:glass",
        !glass && "shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

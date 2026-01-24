"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "amber";
  blur?: "sm" | "md" | "lg";
  hover?: boolean;
  border?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "light",
      blur = "md",
      hover = false,
      border = true,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-2xl transition-all duration-300";

    const variants = {
      light: "bg-white/80",
      dark: "bg-stone-900/80",
      amber: "bg-amber-50/80",
    };

    const blurs = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
    };

    const borderStyles = border
      ? variant === "dark"
        ? "border border-stone-800/50"
        : "border border-white/20"
      : "";

    const hoverStyles = hover
      ? "hover:-translate-y-1 hover:shadow-card-hover cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          blurs[blur],
          borderStyles,
          hoverStyles,
          "shadow-card",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };

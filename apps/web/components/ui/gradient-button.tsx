"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
      primary: cn(
        "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
        "hover:from-amber-600 hover:to-amber-700",
        "shadow-amber-md hover:shadow-amber-lg",
        "btn-shine"
      ),
      secondary: cn(
        "bg-stone-100 text-stone-700",
        "hover:bg-stone-200",
        "border border-stone-200"
      ),
      outline: cn(
        "border-2 border-amber-500 text-amber-600",
        "hover:bg-amber-50",
        "bg-transparent"
      ),
      ghost: cn(
        "text-stone-600",
        "hover:bg-stone-100",
        "bg-transparent"
      ),
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
      md: "px-5 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-6 py-3.5 text-base rounded-xl gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton };

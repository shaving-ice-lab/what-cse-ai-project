"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card",
        className
      )}
    >
      <Icon className="w-16 h-16 mx-auto text-stone-200 mb-4" />
      <h3 className="text-lg font-semibold text-stone-700 mb-2">{title}</h3>
      {description && <p className="text-stone-500 mb-6 max-w-sm mx-auto">{description}</p>}
      {action &&
        (action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}

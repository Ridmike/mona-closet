// components/ui/Badge.tsx
"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "blush" | "plum" | "green" | "yellow" | "red" | "grey";

interface BadgeProps {
  label:     string;
  variant?:  BadgeVariant;
  className?: string;
}

const badgeColors: Record<BadgeVariant, string> = {
  blush:  "bg-brand-blush  text-brand-plum",
  plum:   "bg-brand-plum   text-white",
  green:  "bg-emerald-100  text-emerald-800",
  yellow: "bg-amber-100    text-amber-800",
  red:    "bg-red-100      text-red-700",
  grey:   "bg-brand-sand   text-brand-charcoal/70",
};

export function Badge({ label, variant = "blush", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium font-body",
        badgeColors[variant],
        className
      )}
    >
      {label}
    </span>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin text-brand-mauve", spinnerSizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cn("border-brand-sand", className)} />;
  }
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <hr className="flex-1 border-brand-sand" />
      <span className="text-xs text-brand-charcoal/50 font-body shrink-0">{label}</span>
      <hr className="flex-1 border-brand-sand" />
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?:       React.ReactNode;
  title:       string;
  description?: string;
  action?:     React.ReactNode;
  className?:  string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-20 text-center", className)}>
      {icon && (
        <div className="text-brand-blush w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-xl font-display text-brand-plum">{title}</h3>
        {description && (
          <p className="text-sm text-brand-charcoal/60 max-w-xs font-body">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

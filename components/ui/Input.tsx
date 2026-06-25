// components/ui/Input.tsx
"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string;
  error?:     string;
  hint?:      string;
  leftIcon?:  React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-brand-charcoal font-body"
          >
            {label}
            {props.required && (
              <span className="text-brand-mauve ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mauve pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              "w-full font-body text-sm text-brand-charcoal bg-white",
              "border rounded-card px-3.5 py-2.5",
              "placeholder:text-brand-charcoal/40",
              "transition-colors duration-200",
              // Border states
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                : "border-brand-sand focus:border-brand-mauve focus:ring-brand-blush/40",
              // Focus ring
              "focus:outline-none focus:ring-2",
              // Icon padding
              leftIcon  && "pl-10",
              rightIcon && "pr-10",
              // Disabled
              "disabled:bg-brand-sand/50 disabled:cursor-not-allowed disabled:opacity-70",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-mauve">
              {rightIcon}
            </span>
          )}
        </div>

        {(error || hint) && (
          <p
            className={cn(
              "text-xs font-body",
              error ? "text-red-500" : "text-brand-charcoal/60"
            )}
            role={error ? "alert" : undefined}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

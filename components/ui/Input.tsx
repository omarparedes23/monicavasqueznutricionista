"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900",
              "transition-all duration-150 placeholder:text-slate-400",
              "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500",
              "disabled:bg-slate-50 disabled:opacity-50",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 hover:border-slate-300",
              leftIcon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

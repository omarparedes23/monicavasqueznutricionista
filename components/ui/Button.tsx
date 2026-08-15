"use client";

import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Si es true, clona el único hijo (ej: <Link>) con las clases del botón */
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm " +
    "focus-visible:ring-brand-500",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 " +
    "active:bg-slate-100 shadow-sm focus-visible:ring-slate-400",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 " +
    "focus-visible:ring-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm " +
    "focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8  px-3 text-sm  gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm  gap-2   rounded-xl",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

const baseClasses =
  "inline-flex items-center justify-center font-medium transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "select-none disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Modo asChild: clona el único hijo (típicamente un <Link>) con las clases del botón
    if (asChild) {
      const child = Children.only(children);
      if (!isValidElement(child)) {
        throw new Error("<Button asChild> requiere un único hijo válido (ej: <Link> de next/link)");
      }
      return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        ...props,
        className: cn(baseClasses, variantClasses[variant], sizeClasses[size], className),
      });
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

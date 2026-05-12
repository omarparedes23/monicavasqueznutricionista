import { cn } from "@/lib/utils/cn";

type BadgeVariant = "green" | "blue" | "slate" | "red" | "yellow";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-green-100  text-green-700  border-green-200",
  blue: "bg-blue-100   text-blue-700   border-blue-200",
  slate: "bg-slate-100  text-slate-600  border-slate-200",
  red: "bg-red-100    text-red-700    border-red-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export function Badge({ children, variant = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        "border text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

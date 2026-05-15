"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-50 text-brand-700"
          : "text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </Link>
  );
}

import { cn } from "@/lib/utils"
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
};

export function Button({ className, variant="primary", size="md", icon, children, ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  }[size];
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-900/30",
    secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
    ghost: "bg-transparent text-[rgb(var(--fg))] hover:bg-slate-100 dark:hover:bg-slate-800",
    destructive: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
  }[variant];
  return (
    <button className={cn(base, sizes, variants, className)} {...props}>
      {icon}{children}
    </button>
  );
}

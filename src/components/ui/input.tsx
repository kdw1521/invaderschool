import { cn } from "@/lib/utils";
import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl bg-white text-slate-900 border border-[rgb(var(--border))] px-3 py-2 outline-none",
        "placeholder:text-slate-400",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-600/30",
        "dark:bg-slate-900 dark:text-slate-100",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

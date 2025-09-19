import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("mb-1 block text-sm text-slate-600 dark:text-slate-300", className)}
      {...props}
    >
      {children}
    </label>
  )
);
Label.displayName = "Label";

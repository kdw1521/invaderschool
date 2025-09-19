import React from "react";
import { cn } from "@/lib/utils";

// interface → type으로 교체(빈 인터페이스 규칙 회피)
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

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

import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-foreground mb-1.5",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

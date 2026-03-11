import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-3 rounded-lg text-sm transition-colors",
            "bg-background text-foreground placeholder:text-muted-foreground",
            "border border-input",
            "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
            error && "border-destructive focus:ring-destructive/40 focus:border-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

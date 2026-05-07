import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full bg-bg-surface text-text-primary placeholder:text-text-tertiary",
            "border border-border-default rounded-lg px-4 py-2.5",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            "transition-colors duration-150",
            disabled && "bg-bg-subtle opacity-60 cursor-not-allowed",
            error && "border-severity-severe focus:ring-severity-severe/30 focus:border-severity-severe",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-severity-severe mt-1 flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

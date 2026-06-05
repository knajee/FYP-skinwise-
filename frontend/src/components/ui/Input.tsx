import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/* ─── Component ─── */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-skin-charcoal"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-4 py-2.5 rounded-card border border-skin-border bg-skin-surface text-skin-charcoal placeholder:text-skin-muted/60",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-skin-sage/40 focus:border-skin-sage",
            error && "border-skin-rose focus:ring-skin-rose/40 focus:border-skin-rose",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-xs text-skin-rose font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

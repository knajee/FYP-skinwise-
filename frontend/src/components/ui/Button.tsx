import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/* ─── Variant Styles ─── */
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-text-inverse hover:bg-brand-hover border border-brand active:scale-[0.98] font-semibold",
  secondary:
    "bg-transparent text-text-primary border border-border-default hover:bg-bg-subtle active:scale-[0.98] font-medium",
  ghost:
    "bg-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary border-transparent active:scale-[0.98]",
  danger:
    "bg-severity-severe text-text-primary hover:opacity-90 border border-severity-severe font-semibold",
  accent:
    "bg-accent text-text-primary hover:bg-accent-dark border border-accent font-semibold",
} as const;

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3.5 text-base rounded-lg",
} as const;

/* ─── Component ─── */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2
            size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
            className="animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

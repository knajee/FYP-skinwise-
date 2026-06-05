import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/* ─── Variant Styles ─── */
const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-skin-charcoal text-skin-cream hover:bg-skin-charcoal/90 active:bg-skin-charcoal/80",
  secondary:
    "bg-transparent text-skin-charcoal border border-skin-charcoal hover:bg-skin-charcoal/5 active:bg-skin-charcoal/10",
  ghost:
    "bg-transparent text-skin-charcoal border-none hover:bg-skin-warm active:bg-skin-warm/80",
  danger:
    "bg-skin-rose text-white hover:bg-skin-rose/90 active:bg-skin-rose/80",
} as const;

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
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
          "inline-flex items-center justify-center font-medium rounded-card transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-skin-sage",
          "disabled:opacity-50 disabled:cursor-not-allowed",
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

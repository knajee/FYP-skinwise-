import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "subtle" | "ghost";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: "surface-card",
  elevated: "surface-card-elevated",
  subtle: "surface-subtle",
  ghost: "bg-transparent border-none shadow-none",
};

const PADDING_STYLES: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          VARIANT_STYLES[variant],
          PADDING_STYLES[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export { Card };

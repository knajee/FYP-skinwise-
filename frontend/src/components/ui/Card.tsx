import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export default function Card({ children, className, elevated = false }: CardProps) {
  return (
    <div
      className={cn(
        "glass-panel p-5 transition-shadow duration-200",
        elevated && "shadow-elevated",
        className
      )}
    >
      {children}
    </div>
  );
}

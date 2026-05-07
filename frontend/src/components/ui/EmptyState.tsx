import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: 
    | { label: string; href: string }
    | { label: string; onClick: () => void };
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]", className)}>
      <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center mb-6">
        <Icon size={32} className="text-text-tertiary" />
      </div>
      <h3 className="font-display text-2xl text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-tertiary max-w-[320px] mx-auto mb-8">
        {description}
      </p>
      
      {action && (
        'href' in action ? (
          <Link
            href={action.href}
            className="h-11 px-6 flex items-center justify-center rounded-card bg-brand text-text-inverse text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="h-11 px-6 rounded-card bg-brand text-text-inverse text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

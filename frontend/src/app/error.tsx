"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="glass-panel p-8 md:p-10 max-w-md w-full text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-severity-severe/10 flex items-center justify-center mb-6">
          <AlertCircle size={32} className="text-severity-severe" />
        </div>
        
        <h1 className="font-display text-2xl text-text-primary mb-3">Something went wrong!</h1>
        
        <p className="text-sm text-text-tertiary mb-8 max-w-[280px]">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 h-11 rounded-full bg-brand text-text-inverse font-medium hover:bg-brand/90 transition-colors shadow-sm"
          >
            Try again
          </button>
          
          <Link
            href={ROUTES.DASHBOARD}
            className="flex-1 h-11 flex items-center justify-center rounded-full border border-border-default text-text-primary font-medium hover:bg-bg-subtle transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

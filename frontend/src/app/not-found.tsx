import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
      {/* Ghost-like 404 background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 select-none pointer-events-none opacity-50">
        <span className="font-display text-[180px] md:text-[240px] text-skin-warm font-bold leading-none">
          404
        </span>
      </div>
      
      <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-4 relative z-10">
        Page not found
      </h1>
      
      <p className="text-text-tertiary max-w-sm mx-auto mb-8 relative z-10">
        We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      
      <Link
        href={ROUTES.DASHBOARD}
        className="relative z-10 h-11 px-8 inline-flex items-center justify-center rounded-full bg-brand text-text-inverse font-medium hover:bg-brand/90 transition-colors shadow-sm"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

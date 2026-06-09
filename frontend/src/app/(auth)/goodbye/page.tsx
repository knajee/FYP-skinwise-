import Link from "next/link";
import { UserMinus } from "lucide-react";
export default function GoodbyePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-bg-subtle flex items-center justify-center mb-6">
        <UserMinus size={40} className="text-text-primary/60" />
      </div>
      
      <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-4">
        We&apos;re sorry to see you go
      </h1>
      
      <p className="text-text-tertiary max-w-md mx-auto mb-8 text-sm md:text-base">
        Your account has been deleted. All your check-in data and personal information will be permanently removed from our servers within 72 hours in accordance with GDPR. Thank you for trying SkinWISE.
      </p>
      
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center px-8 rounded-full bg-brand text-text-inverse font-medium hover:bg-brand/90 transition-colors shadow-sm"
      >
        Return to Homepage
      </Link>
    </div>
  );
}

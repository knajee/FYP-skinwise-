"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-bg-base py-16 md:py-24">
      <div className="relative z-10 max-w-content mx-auto px-6 pt-24 pb-16 text-center">
        {/* Headline */}
        <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] leading-[1.1] tracking-tight text-text-primary mb-6">
          Track your skin with
          <br className="hidden md:block" /> the precision of a{" "}
          <span className="text-accent">dermatology dashboard.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-text-secondary text-lg leading-relaxed max-w-xl mx-auto mb-10 text-balance">
          AI-powered lesion detection, hybrid skin typing, and environmental
          correlation — all without a prescription.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link href="/auth?mode=register">
            <Button variant="primary" size="lg">Get Started Free</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="secondary" size="lg">See how it works</Button>
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-text-tertiary">
          <span>Not a medical device</span>
          <span className="hidden sm:inline">·</span>
          <span>GDPR compliant</span>
          <span className="hidden sm:inline">·</span>
          <span>Wellness tracking only</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-subtle">
        <ChevronDown className="w-5 h-5 text-text-tertiary" />
      </div>
    </section>
  );
}

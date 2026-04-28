"use client";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center noise-overlay gradient-radial-hero">
      <div className="relative z-10 max-w-content mx-auto px-6 pt-24 pb-16 text-center">
        {/* Headline */}
        <h1 className="font-display text-hero md:text-hero-lg text-white text-balance leading-tight mb-6">
          Track your skin with
          <br className="hidden md:block" /> the precision of a{" "}
          <span className="text-accent">dermatology dashboard.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-emphasis text-slate-400 max-w-lg mx-auto mb-10 text-balance">
          AI-powered lesion detection, hybrid skin typing, and environmental
          correlation — all without a prescription.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/auth?mode=register"
            className="bg-accent text-black font-medium text-sm h-11 px-5 rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center gap-2"
          >
            Get Started Free
          </Link>
          <a
            href="#how-it-works"
            className="border border-white/[0.12] text-white font-medium text-sm h-11 px-5 rounded-lg hover:bg-white/5 transition-colors duration-150 flex items-center"
          >
            See how it works
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-2 text-micro font-mono text-slate-500">
          <span>Not a medical device</span>
          <span className="text-slate-700">·</span>
          <span>GDPR compliant</span>
          <span className="text-slate-700">·</span>
          <span>Wellness tracking only</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-subtle">
        <ChevronDown className="w-5 h-5 text-slate-500" />
      </div>
    </section>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-container mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl text-white">SkinWISE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-xs-body text-slate-400 hover:text-white transition-colors duration-150">
            Features
          </a>
          <a href="#methodology" className="text-xs-body text-slate-400 hover:text-white transition-colors duration-150">
            Methodology
          </a>
          <a href="#how-it-works" className="text-xs-body text-slate-400 hover:text-white transition-colors duration-150">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth?mode=login"
            className="text-xs-body text-slate-400 hover:text-white transition-colors duration-150 hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/auth?mode=register"
            className="bg-accent text-black font-medium text-sm h-9 px-4 rounded-lg hover:bg-accent-hover transition-colors duration-150 flex items-center"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

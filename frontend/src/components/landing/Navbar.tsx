"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

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
          ? "bg-bg-surface/80 backdrop-blur-md border-b border-border-default"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-container mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl text-text-primary">SkinWISE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150">
            Features
          </a>
          <a href="#methodology" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150">
            Methodology
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth?mode=login"
            className="text-sm font-medium text-text-primary hover:text-accent transition-colors duration-150 hidden sm:block"
          >
            Sign In
          </Link>
          <Link href="/auth?mode=register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

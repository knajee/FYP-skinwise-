"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
    </svg>
  );
}

function AuthFormInner() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left visual panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 gradient-teal-dark relative items-center justify-center p-12">
        <div className="absolute top-8 left-8">
          <Link href="/" className="font-display text-xl text-white">
            SkinWISE
          </Link>
          <p className="text-micro text-slate-400 mt-1">
            AI-powered skin wellness
          </p>
        </div>

        {/* Floating glass card */}
        <div className="card-surface-1 p-6 max-w-xs backdrop-blur-sm bg-surface-1/80">
          {/* Mock analysis */}
          <div className="w-full h-32 bg-surface-2 rounded-lg mb-4 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-surface-1 border border-white/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-accent/40 animate-pulse-glow" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="badge-moderate text-micro font-mono px-2 py-1 rounded">
              MODERATE
            </span>
            <span className="text-micro font-mono text-slate-500">
              April 14, 2026
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-micro font-mono text-slate-400 bg-surface-2 px-2 py-1 rounded">
              12 Papules
            </span>
            <span className="text-micro font-mono text-slate-400 bg-surface-2 px-2 py-1 rounded">
              8 Comedones
            </span>
            <span className="text-micro font-mono text-slate-400 bg-surface-2 px-2 py-1 rounded">
              UV 7.2
            </span>
          </div>
        </div>

        {/* Testimonial */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-body italic text-slate-300">
            &ldquo;Finally, a tool that tracks my skin with the same rigor I
            track my fitness.&rdquo;
          </p>
          <p className="text-micro text-slate-500 mt-2">— Beta tester</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-1 lg:bg-canvas">
        <div className="w-full max-w-sm">
          {/* Logo (mobile) */}
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="font-display text-2xl text-white">
              SkinWISE
            </Link>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-surface-2 rounded-lg p-1 mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200 ${
                mode === "login"
                  ? "bg-accent text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 text-sm font-medium py-2 rounded-md transition-all duration-200 ${
                mode === "register"
                  ? "bg-accent text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs-body font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 text-white text-sm placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs-body font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 pr-11 text-white text-sm placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs-body font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg h-11 px-4 text-white text-sm placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20 outline-none transition-all"
                />
              </div>
            )}

            {/* Google OAuth */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-[#1A1A2E] border border-white/10 rounded-lg h-11 text-sm text-white hover:bg-white/5 transition-colors duration-150"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {mode === "register" && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/20"
                />
                <span className="text-micro text-slate-400">
                  I agree to the{" "}
                  <a href="#" className="text-accent hover:underline">Privacy Policy</a>{" "}
                  and{" "}
                  <a href="#" className="text-accent hover:underline">Terms of Use</a>
                </span>
              </label>
            )}

            <button
              type="submit"
              className="w-full bg-accent text-black font-medium text-sm h-11 rounded-lg hover:bg-accent-hover transition-colors duration-150"
            >
              {mode === "register" ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Disclaimer */}
          <p className="text-center text-micro font-mono text-slate-500 mt-6">
            Wellness tracking only — not a medical device.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <AuthFormInner />
    </Suspense>
  );
}

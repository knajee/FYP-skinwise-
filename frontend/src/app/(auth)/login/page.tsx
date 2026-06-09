"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { loginSchema, type LoginFormData } from "@/lib/validations";

import { loginAction } from "@/app/actions/auth";
import { useAuthStore } from "@/store";

/* ─── Google SVG Icon ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─── Login Page ─── */
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("[SkinWISE] Login onSubmit called", data);
    setServerError(null);
    try {
      const result = await loginAction(data as unknown as Record<string, string>);
      console.log("[SkinWISE] Login action result:", result);
      if (result.success && result.token && result.user) {
        setToken(result.token);
        setUser(result.user as any);
        router.push(ROUTES.DASHBOARD);
      } else {
        setServerError(result.error || "Invalid email or password.");
      }
    } catch {
      setServerError("An unexpected error occurred.");
    }
  };

  const handleGoogleAuth = () => {
    // Placeholder — will redirect to FastAPI Google OAuth endpoint
    console.log("[SkinWISE] Google OAuth redirect");
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 hidden lg:block">
        <h2 className="font-display text-2xl text-text-primary">
          Welcome back
        </h2>
        <p className="text-sm text-text-tertiary mt-1">
          Sign in to continue tracking your skin health.
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 border border-border-default rounded-card h-11 text-sm font-medium text-text-primary hover:bg-bg-base/60 transition-colors duration-200"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-bg-surface px-3 text-xs text-text-tertiary uppercase tracking-widest">
            or
          </span>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-severity-severe/10 border border-severity-severe/20 text-sm text-severity-severe">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-text-primary"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-card border bg-bg-surface text-text-primary placeholder:text-text-tertiary/50 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent ${
              errors.email ? "border-severity-severe" : "border-border-default"
            }`}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs text-severity-severe">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-accent hover:underline underline-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`w-full px-4 py-2.5 pr-11 rounded-card border bg-bg-surface text-text-primary placeholder:text-text-tertiary/50 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent ${
                errors.password ? "border-severity-severe" : "border-border-default"
              }`}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="text-xs text-severity-severe">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-border-default text-accent focus:ring-accent/30 accent-accent"
            {...register("rememberMe")}
          />
          <span className="text-sm text-text-tertiary">Remember me</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-brand text-text-inverse font-medium text-sm h-11 rounded-card hover:bg-brand/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-text-tertiary mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="text-accent font-medium hover:underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </>
  );
}

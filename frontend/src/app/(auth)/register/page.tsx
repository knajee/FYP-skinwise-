"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { registerSchema, type RegisterFormData } from "@/lib/validations";

/* ─── Placeholder API call (will be replaced in Prompt 3) ─── */
async function registerUser(
  email: string,
  password: string
): Promise<{ success: boolean }> {
  console.log("[SkinWISE] Register:", { email, passwordLength: password.length });
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 1500)
  );
}

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

/* ─── Register Page ─── */
export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const result = await registerUser(data.email, data.password);
      if (result.success) {
        router.push(ROUTES.DASHBOARD);
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
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
        <h2 className="font-serif text-card-header text-skin-charcoal">
          Create your account
        </h2>
        <p className="text-sm text-skin-muted mt-1">
          Start tracking your skin with clinical precision.
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 border border-skin-border rounded-card h-11 text-sm font-medium text-skin-charcoal hover:bg-skin-cream/60 transition-colors duration-200"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-skin-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-skin-surface px-3 text-xs text-skin-muted uppercase tracking-widest">
            or
          </span>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-skin-rose/10 border border-skin-rose/20 text-sm text-skin-rose">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-skin-charcoal"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-card border bg-skin-surface text-skin-charcoal placeholder:text-skin-muted/50 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-skin-sage/40 focus:border-skin-sage ${
              errors.email ? "border-skin-rose" : "border-skin-border"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-skin-rose">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-skin-charcoal"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className={`w-full px-4 py-2.5 pr-11 rounded-card border bg-skin-surface text-skin-charcoal placeholder:text-skin-muted/50 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-skin-sage/40 focus:border-skin-sage ${
                errors.password ? "border-skin-rose" : "border-skin-border"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-skin-muted hover:text-skin-charcoal transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-skin-rose">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="register-confirm"
            className="block text-sm font-medium text-skin-charcoal"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="register-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={`w-full px-4 py-2.5 pr-11 rounded-card border bg-skin-surface text-skin-charcoal placeholder:text-skin-muted/50 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-skin-sage/40 focus:border-skin-sage ${
                errors.confirmPassword
                  ? "border-skin-rose"
                  : "border-skin-border"
              }`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-skin-muted hover:text-skin-charcoal transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-skin-rose">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 rounded border-skin-border text-skin-sage focus:ring-skin-sage/30 accent-skin-sage"
            {...register("acceptTerms")}
          />
          <span className="text-xs text-skin-muted leading-relaxed">
            I agree to the{" "}
            <Link
              href="/privacy"
              className="text-skin-sage underline underline-offset-2 hover:text-skin-sage/80"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-skin-sage underline underline-offset-2 hover:text-skin-sage/80"
            >
              Terms of Use
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-xs text-skin-rose -mt-2">
            {errors.acceptTerms.message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-skin-charcoal text-skin-cream font-medium text-sm h-11 rounded-card hover:bg-skin-charcoal/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-sm text-skin-muted mt-6">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-skin-sage font-medium hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

/**
 * Centralised route path constants.
 * Never use raw route strings in components — import from here.
 */
export const ROUTES = {
  // ─── Public ───
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // ─── Authenticated ───
  DASHBOARD: "/dashboard",
  CHECK_IN: "/check-in",
  HISTORY: "/history",
  ANALYTICS: "/analytics",
  INGREDIENTS: "/ingredients",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ONBOARDING: "/onboarding",
  QUESTIONNAIRE: "/questionnaire",
  RESULTS: (id: string) => `/results/${id}` as const,
} as const;

/** Routes that require authentication */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/check-in",
  "/history",
  "/analytics",
  "/ingredients",
  "/profile",
  "/settings",
  "/results",
  "/onboarding",
  "/questionnaire",
] as const;

/** Routes that should redirect to dashboard if already authenticated */
export const AUTH_ROUTES = ["/login", "/register"] as const;

/** Cookie name for the JWT token set by the FastAPI backend */
export const AUTH_COOKIE_NAME = "skinwise_token";

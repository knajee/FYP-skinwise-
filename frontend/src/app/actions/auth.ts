"use server";

import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/routes";
import { env } from "@/lib/env";

export async function loginAction(data: Record<string, string>) {
  try {
    const res = await fetch(`${env.apiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Invalid email or password.";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {}
      return { error: errorMessage };
    }

    const json = await res.json();
    
    // Support FastAPI OAuth2PasswordRequestForm response (access_token) or custom (token)
    const token = json.token || json.access_token;
    const user = json.user || { id: "1", email: data.email }; // fallback if API doesn't return user

    if (token) {
      cookies().set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return { success: true, user, token };
  } catch (error) {
    return { error: "Network error. Please ensure the backend is running." };
  }
}

export async function registerAction(data: Record<string, string>) {
  try {
    const res = await fetch(`${env.apiUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Registration failed.";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {}
      return { error: errorMessage };
    }

    const json = await res.json();
    const token = json.token || json.access_token;
    const user = json.user || { id: "1", email: data.email };

    if (token) {
      cookies().set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return { success: true, user, token };
  } catch (error) {
    return { error: "Network error. Please ensure the backend is running." };
  }
}

export async function logoutAction() {
  cookies().delete(AUTH_COOKIE_NAME);
  return { success: true };
}

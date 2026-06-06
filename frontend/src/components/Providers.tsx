"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState, type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "14px",
            background: "var(--skin-surface)",
            color: "var(--skin-charcoal)",
            border: "1px solid var(--skin-border)",
            borderRadius: "12px",
            boxShadow:
              "0 4px 12px rgba(28, 25, 23, 0.08), 0 12px 32px rgba(28, 25, 23, 0.06)",
          },
          success: {
            iconTheme: {
              primary: "var(--skin-sage)",
              secondary: "var(--skin-surface)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--skin-rose)",
              secondary: "var(--skin-surface)",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkinWISE 2.0",
  description: "AI-powered skincare wellness tracking",
  keywords: [
    "skincare",
    "AI",
    "dermatology",
    "wellness",
    "lesion detection",
    "skin tracking",
  ],
  openGraph: {
    title: "SkinWISE 2.0",
    description: "AI-powered skincare wellness tracking",
    siteName: "SkinWISE 2.0",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkinWISE 2.0",
    description: "AI-powered skincare wellness tracking",
  },
};

export const viewport = {
  themeColor: "#F5EFE6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body
        className={`${dmSans.className} bg-bg-base min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

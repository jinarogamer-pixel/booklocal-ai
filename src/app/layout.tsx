import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ErrorBoundary from "./components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookLocal – Find & Book Trusted Local Services",
  description: "Join BookLocal to discover, book, and grow with trusted local service providers in your area.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "BookLocal – Find & Book Trusted Local Services",
    description: "Join BookLocal to discover, book, and grow with trusted local service providers in your area.",
    images: [
      {
        url: "/social-preview.png",
        width: 1200,
        height: 630,
        alt: "BookLocal social preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookLocal – Find & Book Trusted Local Services",
    description: "Join BookLocal to discover, book, and grow with trusted local service providers in your area.",
    images: ["/social-preview.png"],
  },
};


import CookieBanner from "@/components/CookieBanner";
import NavBarMinimal from "@/components/NavBarMinimal";
import { cookies } from "next/headers";
import Link from "next/link";
import { NotificationProvider } from "../components/NotificationProvider";
import { AuthProvider } from "./components/AuthProvider";

// Client-only listener moved to a dedicated component
import ClientErrorListener from '@/components/ClientErrorListener';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ClientErrorListener takes care of window-level error listeners
  let consent = false;
  try {
    const cookieStore = await cookies();
    consent = cookieStore.get('bl_consent')?.value?.includes('analytics=true') ?? false;
  } catch { }
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400..700&family=Geist+Mono:wght@400..700&family=Geist+Sans:wght@400..800&display=swap" rel="stylesheet" />
        {/* Example: gate analytics */}
        {consent && (
          // <script defer src="/* your analytics script */"></script>
          <></>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white`}>
        <NotificationProvider>
          <AuthProvider>
            {/* Mount client-only global error listener */}
            <ClientErrorListener />
            <NavBarMinimal />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <footer className="w-full text-center text-xs text-neutral-500 py-8">
              <Link href="/legal/privacy" className="underline mx-2">Privacy</Link>
              <Link href="/legal/terms" className="underline mx-2">Terms</Link>
            </footer>
            <CookieBanner />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}

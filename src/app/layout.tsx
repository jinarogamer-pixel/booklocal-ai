import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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


import NavBar from "./components/NavBar";
import { AuthProvider } from "./components/AuthProvider";
import { NotificationProvider } from "./components/NotificationProvider";
import DarkModeToggle from "./components/DarkModeToggle";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";
import { cookies } from "next/headers";

// Client-only listener moved to a dedicated component
import ClientErrorListener from '@/components/ClientErrorListener';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ClientErrorListener takes care of window-level error listeners
   let consent = false;
  try {
    const cookieStore = await cookies();
    consent = cookieStore.get('bl_consent')?.value?.includes('analytics=true') ?? false;
  } catch {}
  return (
    <html lang="en">
      <head>
        {/* Example: gate analytics */}
        {consent && (
          // <script defer src="/* your analytics script */"></script>
          <></>
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NotificationProvider>
          <AuthProvider>
            {/* Mount client-only global error listener */}
            <ClientErrorListener />
            <DarkModeToggle />
            <NavBar />
            {children}
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

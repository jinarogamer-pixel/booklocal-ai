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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NotificationProvider>
          <AuthProvider>
            <DarkModeToggle />
            <NavBar />
            {children}
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}

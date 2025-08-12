"use client";
import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur shadow-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-lg group">
          <img src="/booklocal-logo.svg" alt="BookLocal logo" width={36} height={36} className="drop-shadow-md transition-transform group-hover:scale-105" />
          <span className="text-white">Book</span>
          <span className="text-sky-400">Local</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-neutral-300 hover:text-white transition-colors">
            ← Back to Home
          </Link>
          <Link href="/provider-signup" className="text-sm text-neutral-300 hover:text-white transition-colors">
            For Providers
          </Link>
        </div>
      </nav>
    </header>
  );
}

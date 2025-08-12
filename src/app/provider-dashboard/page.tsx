"use client";
import { useEffect } from "react";
import { NavBar } from "../../components/NavBar";
import { DarkModeToggle } from "../../components/DarkModeToggle";

export default function ProviderDashboard() {
  useEffect(() => {
    document.title = "Provider Dashboard | BookLocal";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-neutral-950 to-neutral-900 text-neutral-50">
      <div className="flex items-center justify-end max-w-6xl mx-auto px-4 pt-4">
        <DarkModeToggle />
      </div>
      <NavBar />
      <main className="max-w-4xl mx-auto py-16 px-2 sm:px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg animate-fade-in-up">Provider Dashboard</h1>
        <p className="text-neutral-300 mb-8 text-lg animate-fade-in-up">Welcome! Here you’ll be able to manage your applications, view leads, and track your business growth. <span className="text-sky-400">(Coming soon!)</span></p>
        <div className="glass-card p-8 text-center text-neutral-400 animate-fade-in-up" tabIndex={0} role="status" aria-live="polite">
          🚧 Provider dashboard features are coming soon. Stay tuned!
        </div>
      </main>
    </div>
  );
}

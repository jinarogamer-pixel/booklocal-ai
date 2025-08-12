"use client";


import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "../lib/analytics";
import { captureError } from "../lib/errorMonitoring";
import AdvancedSearch from "./components/AdvancedSearch";
import SearchResults, { SearchResult } from "./components/SearchResults";
import { useNotification } from "./components/NotificationProvider";

//** simple client FAQ accordion */
function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  function handleToggle() {
    setOpen((v) => {
      const next = !v;
      if (next) trackEvent("faq_opened", { question: q });
      return next;
    });
  }
  return (
    <div className="glass-card animate-fade-in-up">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${q.replace(/\s+/g, '-')}`}
      >
        <span>{q}</span>
        <span className="text-neutral-400">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div id={`faq-panel-${q.replace(/\s+/g, '-')}`} className="px-4 pb-4 text-sm text-neutral-300">
          {children}
        </div>
      )}
    </div>
  );
}


export default function Home() {
  // State for advanced search
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [activeQuery, setActiveQuery] = useState("");

  // State for project posting
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    email: '',
    phone: ''
  });
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectMsg, setProjectMsg] = useState<string | null>(null);

  // State for waitlist
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { showNotification } = useNotification();

  // Project posting handler
  async function onPostProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProjectLoading(true);
    setProjectMsg(null);
    try {
      // Example: await supabase.from('projects').insert([{ ...projectForm }]);
      setTimeout(() => {
        setProjectMsg("Project posted! Local pros will reach out soon.");
        setProjectForm({
          title: '',
          description: '',
          category: '',
          location: '',
          budgetMin: '',
          budgetMax: '',
          email: '',
          phone: ''
        });
        setProjectLoading(false);
        trackEvent("project_post_success");
      }, 1000);
    } catch (err: unknown) {
      setProjectMsg("Error posting project. Please try again.");
      setProjectLoading(false);
      captureError(err, { form: projectForm });
      trackEvent("project_post_error");
    }
  }

  // Waitlist join handler
  async function onJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim();

    if (!email) {
      setMsg("Please enter an email address.");
      setLoading(false);
      trackEvent("waitlist_join_validation_error");
      return;
    }

    const { error } = await supabase.from("waitlist").insert([{ email }]);

    if (error) {
      setMsg(`Error: ${error.message}`);
      captureError(error, { email });
      trackEvent("waitlist_join_error");
    } else {
      setMsg("Thanks! You’re on the list — we’ll email you soon.");
      form.reset();
      trackEvent("waitlist_join_success");
    }
    setLoading(false);
  }

  // Advanced search handler (live Supabase search)
  async function handleAdvancedSearch(query: string, filters: Record<string, string>) {
    setSearchLoading(true);
    setSearchPerformed(true);
    setActiveFilters(filters);
    setActiveQuery(query);
    showNotification("info", `Searching for: ${query} ${filters.category ? `in ${filters.category}` : ''} ${filters.location ? `at ${filters.location}` : ''}`);
    let supa = supabase.from("providers").select("id,name,category,location,description");
    if (query) supa = supa.ilike("name", `%${query}%`);
    if (filters.category) supa = supa.eq("category", filters.category);
    if (filters.location) supa = supa.ilike("location", `%${filters.location}%`);
    const { data, error } = await supa.limit(20);
    if (error) {
      showNotification("error", "Search failed. Try again later.");
      setSearchResults([]);
    } else {
      setSearchResults(data || []);
      if (!data?.length) showNotification("info", "No results found.");
    }
    setSearchLoading(false);
  }

  // Real-time subscription for provider listings
  useEffect(() => {
    // Only subscribe if a search has been performed
    if (!searchPerformed) return;
    const channel = supabase.channel('realtime:providers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'providers' }, async (payload) => {
        // Re-run the search with current filters
        let supa = supabase.from("providers").select("id,name,category,location,description");
        if (activeQuery) supa = supa.ilike("name", `%${activeQuery}%`);
        if (activeFilters.category) supa = supa.eq("category", activeFilters.category);
        if (activeFilters.location) supa = supa.ilike("location", `%${activeFilters.location}%`);
        const { data } = await supa.limit(20);
        setSearchResults(data || []);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchPerformed, activeQuery, activeFilters]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Top Nav */}
      {/* ...existing code... */}
    </div>
  );
}





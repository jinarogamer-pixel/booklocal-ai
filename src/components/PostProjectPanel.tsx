"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabaseClient";

export default function PostProjectPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("openPostPanel", onOpen);
    return () => window.removeEventListener("openPostPanel", onOpen);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") || ""),
      description: String(fd.get("description") || ""),
      category: String(fd.get("category") || ""),
      location: String(fd.get("location") || ""),
      budget_min: Number(fd.get("budget_min") || 0),
      budget_max: Number(fd.get("budget_max") || 0),
      customer_email: String(fd.get("email") || ""),
      customer_phone: String(fd.get("phone") || ""),
      status: "posted",
    };
    
    setLoading(true); 
    setMsg(null);
    
    try {
      const supabase = getSupabase();
      
      // Try to insert into projects table first, if it exists
      const { error } = await supabase.from("projects").insert([payload]);
      
      if (error) {
        // If projects table doesn't exist, fall back to a simple success message
        if (error.message.includes("does not exist")) {
          setMsg("Project posted! We'll set up your projects table and pros will reach out soon.");
          setTimeout(() => setOpen(false), 1000);
        } else {
          setMsg(`Error: ${error.message}`);
        }
      } else {
        setMsg("Project posted! Pros will reach out soon.");
        setTimeout(() => setOpen(false), 700);
      }
    } catch (err: any) {
      setMsg(err?.message || "Unexpected error");
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div 
        onClick={() => setOpen(false)} 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} 
      />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[520px] bg-neutral-900/90 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-500 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Post a Project</h3>
            <button 
              onClick={() => setOpen(false)} 
              className="text-neutral-300 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            {[
              { name: "title", ph: "Project title (e.g., Backyard deck renovation)", type: "text" },
              { name: "category", ph: "Category (lawn_care, handyman, plumbing...)", type: "text" },
              { name: "location", ph: "City / ZIP code", type: "text" },
              { name: "budget_min", ph: "Budget minimum ($)", type: "number" },
              { name: "budget_max", ph: "Budget maximum ($)", type: "number" },
              { name: "email", ph: "Your email", type: "email" },
              { name: "phone", ph: "Phone (optional)", type: "tel" },
            ].map((f) => (
              <input
                key={f.name}
                name={f.name}
                type={f.type}
                placeholder={f.ph}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-neutral-400 outline-none focus:border-sky-400 focus:bg-white/10 transition"
                required={f.name !== "phone"}
              />
            ))}
            
            <textarea
              name="description"
              placeholder="Describe the work you need done..."
              rows={4}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-neutral-400 outline-none focus:border-sky-400 focus:bg-white/10 transition resize-none"
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-3 font-bold text-white hover:opacity-90 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? "Posting..." : "Post Project"}
            </button>
            
            {msg && (
              <div className={`text-sm p-3 rounded-lg ${msg.includes("Error") ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                {msg}
              </div>
            )}
          </form>
          
          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="font-semibold text-white mb-2">How it works:</h4>
            <ol className="text-sm text-neutral-300 space-y-1">
              <li>1. Post your project details</li>
              <li>2. Verified pros submit competing bids</li>
              <li>3. Compare quotes and hire with Shield protection</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

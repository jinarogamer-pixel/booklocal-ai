// SearchResults: Shows provider/service search results
import React from "react";

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  location: string;
  description?: string;
}

export default function SearchResults({ results, loading, error }: { results: SearchResult[]; loading: boolean; error?: string }) {
  if (loading) return <div className="empty-state">Searching…</div>;
  if (error) return <div className="empty-state text-red-500">{error}</div>;
  if (!results.length) return <div className="empty-state">No results found.</div>;
  return (
    <div className="grid gap-4 mt-6">
      {results.map((r) => (
        <div key={r.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-2 animate-fade-in-up">
          <div className="flex-1">
            <div className="font-bold text-lg text-sky-700">{r.name}</div>
            <div className="text-sm text-neutral-500 mb-1">{r.category} • {r.location}</div>
            {r.description && <div className="text-neutral-700 text-sm mb-1">{r.description}</div>}
          </div>
          <button className="btn-primary px-6 py-2 mt-2 md:mt-0">View</button>
        </div>
      ))}
    </div>
  );
}

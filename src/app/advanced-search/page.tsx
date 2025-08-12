"use client";
import { useState } from 'react';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  return (
    <div className="glass-card" style={{ maxWidth: 700, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Advanced Search</h1>
      <form onSubmit={e => { e.preventDefault(); setResults([`Result for "${query}"`]); }}>
        <input value={query} onChange={e => setQuery(e.target.value)} className="w-full mb-4" placeholder="Search providers or services..." />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      <ul style={{ marginTop: 24 }}>
        {results.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}

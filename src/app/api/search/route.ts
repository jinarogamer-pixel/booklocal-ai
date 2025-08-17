// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseServer";
import { embed, type ProviderSearchResult } from "../../../../ai";

export async function POST(req: NextRequest) {
  try {
    const { q, limit = 12, city, state, category } = await req.json();
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    // Generate embedding for search query
    const queryEmbedding = await embed(q.trim());
    
    const supabase = getSupabase();
    
    // Use semantic search with optional filters
    const { data, error } = await supabase.rpc("match_providers", {
      query_embedding: queryEmbedding,
      match_count: Math.min(limit, 50),
      similarity_threshold: 0.65
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    // Apply additional filters client-side if needed
    let results: ProviderSearchResult[] = (data as ProviderSearchResult[]) || [];
    if (city) {
      results = results.filter((r) => 
        r.city?.toLowerCase().includes(city.toLowerCase())
      );
    }
    if (state) {
      results = results.filter((r) => 
        r.state?.toLowerCase() === state.toLowerCase()
      );
    }
    if (category) {
      results = results.filter((r) => 
        r.primary_category?.toLowerCase().includes(category.toLowerCase())
      );
    }

    return NextResponse.json({ 
      results: results.slice(0, limit),
      query: q,
      total: results.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: "Internal search error" }, 
      { status: 500 }
    );
  }
}

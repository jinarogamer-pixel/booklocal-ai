// src/app/api/embeddings/reindex/route.ts
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseServer";
import { embedBatch } from "../../../../../ai";

export async function POST() {
  try {
    const supabase = getSupabase();
    
    // Get providers that need embedding updates
    const { data: providers, error } = await supabase
      .from("providers")
      .select("id,name,primary_category,city,state,description")
      .is('name_desc_embedding', null)
      .limit(100); // Process in batches

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json({ 
        message: "No providers need embedding updates",
        indexed: 0 
      });
    }

    // Prepare text for embedding
    const texts = providers.map(provider => {
      const parts = [
        provider.name,
        provider.primary_category,
        provider.city && provider.state ? `${provider.city}, ${provider.state}` : provider.city || provider.state || '',
        provider.description
      ].filter(Boolean);
      
      return parts.join('. ');
    });

    // Generate embeddings in batch
    const embeddings = await embedBatch(texts);

    // Update providers with embeddings
    const updates = providers.map((provider, index) => ({
      id: provider.id,
      name_desc_embedding: embeddings[index]
    }));

    // Update in database
    for (const update of updates) {
      await supabase
        .from("providers")
        .update({ name_desc_embedding: update.name_desc_embedding })
        .eq("id", update.id as string);
    }

    return NextResponse.json({ 
      indexed: providers.length,
      message: `Successfully indexed ${providers.length} providers`
    });

  } catch (error) {
    console.error('Embeddings reindex error:', error);
    return NextResponse.json(
      { error: "Failed to reindex embeddings" }, 
      { status: 500 }
    );
  }
}

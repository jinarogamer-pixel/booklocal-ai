// src/app/api/recommend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseServer";
import type { RecommendationResult } from "../../../../ai";

export async function POST(req: NextRequest) {
  try {
    const { userId, providerId, limit = 8 } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Use the database function for recommendations
    const { data, error } = await supabase.rpc("get_recommendations", {
      user_id: userId,
      provider_id: providerId || null,
      limit_count: limit
    });

    if (error) {
      console.error('Recommendations error:', error);
      return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
    }

    const recommendations: RecommendationResult[] = (data as RecommendationResult[]) || [];

    return NextResponse.json({ 
      recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Recommend API error:', error);
    return NextResponse.json(
      { error: "Internal recommendation error" }, 
      { status: 500 }
    );
  }
}

// src/app/api/brief/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateProjectBrief } from "../../../../ai";

export async function POST(req: NextRequest) {
  try {
    const { title, notes, sqft, location } = await req.json();

    if (!title || !notes) {
      return NextResponse.json(
        { error: "Missing required fields: title and notes" }, 
        { status: 400 }
      );
    }

    const brief = await generateProjectBrief(title, notes, sqft, location);
    
    return NextResponse.json({ 
      success: true,
      brief
    });

  } catch (error) {
    console.error('Brief API error:', error);
    return NextResponse.json(
      { error: "Failed to generate project brief" }, 
      { status: 500 }
    );
  }
}

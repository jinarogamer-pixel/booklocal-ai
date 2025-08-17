// src/app/api/moderation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { isAllowedText, getModerationDetails } from '@/ai/moderation';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    // Check if content is allowed
    const allowed = await isAllowedText(text);
    
    // Get detailed moderation results if needed
    const details = await getModerationDetails(text);
    
    return NextResponse.json({
      allowed,
      details,
      checked_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json(
      { error: 'Failed to moderate content' },
      { status: 500 }
    );
  }
}

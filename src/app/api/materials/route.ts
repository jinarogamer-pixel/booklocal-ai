import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'floor';
    const style = searchParams.get('style') || 'modern';
    
    // Fast response with mock data
    const mockProviders = [
      {
        id: 'provider-1',
        name: 'Elite Flooring Solutions',
        category: 'flooring',
        materialType: 'hardwood',
        expertise: 'expert',
        brands: ['Shaw', 'Bruce', 'Mohawk'],
        styles: ['modern', 'contemporary'],
        trustScore: 94,
        badge: 'Elite'
      },
      {
        id: 'provider-2', 
        name: 'Premium Contractors',
        category: 'flooring',
        materialType: 'vinyl',
        expertise: 'expert',
        brands: ['Armstrong', 'Pergo'],
        styles: ['modern', 'industrial'],
        trustScore: 87,
        badge: 'Verified'
      }
    ];

    return NextResponse.json({
      success: true,
      category,
      style,
      count: mockProviders.length,
      providers: mockProviders
    });
    
  } catch {
    return NextResponse.json({ 
      error: 'API error',
      providers: []
    }, { status: 500 });
  }
}

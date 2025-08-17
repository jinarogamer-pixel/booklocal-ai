// src/app/api/estimate/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface EstimateRequest {
  sqft: number;
  material: string;
  location?: string;
  category?: string;
}

const materialCosts = {
  hardwood: { base: 12, labor: 8 },
  tile: { base: 8, labor: 6 },
  concrete: { base: 6, labor: 4 },
  laminate: { base: 4, labor: 3 },
  carpet: { base: 3, labor: 2 }
};

const locationMultipliers = {
  'san francisco': 1.4,
  'new york': 1.3,
  'seattle': 1.2,
  'austin': 1.1,
  'denver': 1.05,
  default: 1.0
};

export async function POST(request: NextRequest) {
  try {
    const { sqft, material, location }: EstimateRequest = await request.json();
    
    if (!sqft || !material) {
      return NextResponse.json(
        { error: 'Square footage and material are required' },
        { status: 400 }
      );
    }

    const materialData = materialCosts[material.toLowerCase() as keyof typeof materialCosts];
    if (!materialData) {
      return NextResponse.json(
        { error: 'Invalid material type' },
        { status: 400 }
      );
    }

    // Calculate base cost
    const baseCostPerSqft = materialData.base + materialData.labor;
    
    // Apply location multiplier
    const locationKey = location?.toLowerCase() || 'default';
    const multiplier = locationMultipliers[locationKey as keyof typeof locationMultipliers] || locationMultipliers.default;
    
    const adjustedCostPerSqft = baseCostPerSqft * multiplier;
    const totalEstimate = Math.round(sqft * adjustedCostPerSqft);
    
    // Calculate timeline (roughly 1 week per 500 sqft, minimum 1 week)
    const estimatedWeeks = Math.max(1, Math.ceil(sqft / 500));
    
    // Generate material alternatives
    const alternatives = Object.keys(materialCosts)
      .filter(mat => mat !== material.toLowerCase())
      .slice(0, 3);

    const response = {
      estimate: totalEstimate,
      cost_breakdown: {
        material_cost: Math.round(sqft * materialData.base * multiplier),
        labor_cost: Math.round(sqft * materialData.labor * multiplier),
        cost_per_sqft: Math.round(adjustedCostPerSqft)
      },
      timeline: {
        estimated_weeks: estimatedWeeks,
        estimated_days: estimatedWeeks * 7
      },
      alternatives,
      location_adjustment: multiplier,
      sqft_analyzed: sqft,
      material: material
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Estimate calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate estimate' },
      { status: 500 }
    );
  }
}

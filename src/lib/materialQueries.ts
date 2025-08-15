/**
 * Enhanced material selection queries for 3D room customization
 * Connects provider expertise to room materials (picks/floor/wall/sofa)
 */

import { getSupabase } from './supabaseClient';

export interface MaterialProvider {
  provider_id: string;
  name: string;
  avg_rating: number;
  trust_score: number;
  material_category: 'flooring' | 'wall' | 'furniture' | 'lighting';
  material_type: string;
  expertise_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  brand_names: string[];
  style_specialties: string[];
  color_expertise: string[];
  hourly_rate_min: number;
  hourly_rate_max: number;
  response_time_hours: number;
  jobs_completed: number;
}

export interface MaterialQuery {
  category: 'floor' | 'wall' | 'sofa' | 'lighting';
  style?: string;
  color_preference?: 'dark' | 'light' | 'neutral' | 'bold';
  expertise_level?: string;
  location?: {
    zip_code?: string;
    city?: string;
    state?: string;
    radius?: number; // miles
  };
  budget_range?: {
    min?: number;
    max?: number;
  };
  sort_by?: 'trust_score' | 'rating' | 'price' | 'response_time';
  limit?: number;
}

/**
 * Find providers who specialize in specific room materials
 * Maps room elements to provider categories:
 * - floor -> flooring specialists
 * - wall -> painting/wall treatment specialists  
 * - sofa -> furniture/upholstery specialists
 */
export async function findMaterialProviders(query: MaterialQuery): Promise<MaterialProvider[]> {
  const supabase = getSupabase();
  
  // Map room materials to provider categories
  const categoryMapping = {
    floor: 'flooring',
    wall: 'wall',
    sofa: 'furniture',
    lighting: 'lighting'
  };
  
  const targetCategory = categoryMapping[query.category];
  
  let sqlQuery = supabase
    .from('provider_material_expertise')
    .select(`
      provider_id,
      name,
      material_category,
      material_type,
      expertise_level,
      brand_names,
      style_specialties,
      color_expertise,
      trust_score,
      providers!inner(
        avg_rating,
        hourly_rate_min,
        hourly_rate_max,
        response_time_hours,
        jobs_completed,
        city,
        state,
        zip_code,
        service_radius
      )
    `)
    .eq('material_category', targetCategory);

  // Filter by style if specified
  if (query.style) {
    sqlQuery = sqlQuery.contains('style_specialties', [query.style]);
  }

  // Filter by color preference
  if (query.color_preference) {
    sqlQuery = sqlQuery.contains('color_expertise', [query.color_preference]);
  }

  // Filter by expertise level
  if (query.expertise_level) {
    sqlQuery = sqlQuery.eq('expertise_level', query.expertise_level);
  }

  // Apply sorting
  const sortBy = query.sort_by || 'trust_score';
  switch (sortBy) {
    case 'trust_score':
      sqlQuery = sqlQuery.order('trust_score', { ascending: false });
      break;
    case 'rating':
      sqlQuery = sqlQuery.order('providers.avg_rating', { ascending: false });
      break;
    case 'price':
      sqlQuery = sqlQuery.order('providers.hourly_rate_min', { ascending: true });
      break;
    case 'response_time':
      sqlQuery = sqlQuery.order('providers.response_time_hours', { ascending: true });
      break;
  }

  // Apply limit
  if (query.limit) {
    sqlQuery = sqlQuery.limit(query.limit);
  }

  const { data, error } = await sqlQuery;

  if (error) {
    console.error('Error fetching material providers:', error);
    return [];
  }

  // Transform and filter results
  return (data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      provider_id: item.provider_id,
      name: item.name,
      avg_rating: item.providers.avg_rating,
      trust_score: item.trust_score,
      material_category: item.material_category,
      material_type: item.material_type,
      expertise_level: item.expertise_level,
      brand_names: item.brand_names || [],
      style_specialties: item.style_specialties || [],
      color_expertise: item.color_expertise || [],
      hourly_rate_min: item.providers.hourly_rate_min,
      hourly_rate_max: item.providers.hourly_rate_max,
      response_time_hours: item.providers.response_time_hours,
      jobs_completed: item.providers.jobs_completed,
    }))
    .filter((provider) => {
      // Apply budget filter if specified
      if (query.budget_range) {
        const { min, max } = query.budget_range;
        if (min && provider.hourly_rate_max < min) return false;
        if (max && provider.hourly_rate_min > max) return false;
      }

      // Apply location filter if specified (simplified - in production use proper geo queries)
      if (query.location?.city) {
        // This would need to be implemented with proper geo-distance queries
        // For now, just a placeholder
      }

      return true;
    });
}

/**
 * Get top providers for each room material category
 * Returns best matches for floor, wall, sofa materials
 */
export async function getTopMaterialProviders(style: string = 'modern', limit: number = 3) {
  const [floorProviders, wallProviders, sofaProviders] = await Promise.all([
    findMaterialProviders({
      category: 'floor',
      style,
      sort_by: 'trust_score',
      limit
    }),
    findMaterialProviders({
      category: 'wall',
      style,
      sort_by: 'trust_score',
      limit
    }),
    findMaterialProviders({
      category: 'sofa',
      style,
      sort_by: 'trust_score',
      limit
    })
  ]);

  return {
    floor: floorProviders,
    wall: wallProviders,
    sofa: sofaProviders
  };
}

/**
 * Get providers who can handle multiple room materials
 * Useful for comprehensive room makeovers
 */
export async function getFullRoomProviders(
  materials: Array<'floor' | 'wall' | 'sofa'>,
  style?: string,
  limit: number = 5
): Promise<{
  provider_id: string;
  name: string;
  trust_score: number;
  capabilities: string[];
  avg_rating: number;
}[]> {
  const supabase = getSupabase();

  // Get providers who work with multiple material categories
  const { data, error } = await supabase
    .from('provider_material_expertise')
    .select(`
      provider_id,
      name,
      trust_score,
      material_category,
      material_type,
      style_specialties
    `)
    .in('material_category', materials.map(m => m === 'floor' ? 'flooring' : m === 'wall' ? 'wall' : 'furniture'));

  if (error) {
    console.error('Error fetching full room providers:', error);
    return [];
  }

  // Group by provider and filter those who handle multiple categories
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerGroups = (data || []).reduce((acc: any, item: any) => {
    if (!acc[item.provider_id]) {
      acc[item.provider_id] = {
        provider_id: item.provider_id,
        name: item.name,
        trust_score: item.trust_score,
        capabilities: [],
        categories: new Set()
      };
    }
    
    acc[item.provider_id].categories.add(item.material_category);
    acc[item.provider_id].capabilities.push(`${item.material_category}: ${item.material_type}`);
    
    return acc;
  }, {});

  // Filter providers who can handle at least 2 of the requested materials
  const multiMaterialProviders = Object.values(providerGroups)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((provider: any) => provider.categories.size >= Math.min(2, materials.length))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => b.trust_score - a.trust_score)
    .slice(0, limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return multiMaterialProviders.map((provider: any) => ({
    provider_id: provider.provider_id,
    name: provider.name,
    trust_score: provider.trust_score,
    capabilities: provider.capabilities,
    avg_rating: 4.5 // Would get this from join in real implementation
  }));
}

/**
 * Quick material search for demo mode
 * Returns sample providers for each material type quickly
 */
export async function getDemoMaterialProviders() {
  // Return cached/sample data for demo mode to avoid DB calls
  return {
    floor: [
      {
        provider_id: 'demo-floor-1',
        name: 'Elite Flooring Solutions',
        trust_score: 92,
        material_category: 'flooring' as const,
        material_type: 'hardwood',
        expertise_level: 'expert' as const,
        avg_rating: 4.8,
        hourly_rate_min: 85,
        hourly_rate_max: 150,
        response_time_hours: 2.3,
        jobs_completed: 89,
        brand_names: ['Shaw', 'Bruce', 'Mohawk'],
        style_specialties: ['modern', 'traditional'],
        color_expertise: ['dark', 'medium', 'light']
      }
    ],
    wall: [
      {
        provider_id: 'demo-wall-1',
        name: 'Modern Wall Studio',
        trust_score: 89,
        material_category: 'wall' as const,
        material_type: 'paint',
        expertise_level: 'expert' as const,
        avg_rating: 4.6,
        hourly_rate_min: 65,
        hourly_rate_max: 120,
        response_time_hours: 3.7,
        jobs_completed: 156,
        brand_names: ['Benjamin Moore', 'Sherwin Williams'],
        style_specialties: ['modern', 'contemporary'],
        color_expertise: ['neutral', 'bold', 'accent']
      }
    ],
    sofa: [
      {
        provider_id: 'demo-sofa-1',
        name: 'Custom Furniture Co',
        trust_score: 95,
        material_category: 'furniture' as const,
        material_type: 'upholstery',
        expertise_level: 'expert' as const,
        avg_rating: 4.9,
        hourly_rate_min: 95,
        hourly_rate_max: 200,
        response_time_hours: 4.2,
        jobs_completed: 67,
        brand_names: ['Leather Craft', 'Sunbrella'],
        style_specialties: ['modern', 'mid-century'],
        color_expertise: ['neutral', 'dark', 'bold']
      }
    ]
  };
}

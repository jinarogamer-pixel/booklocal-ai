"use client";
import { useState, useEffect } from 'react';

interface Provider {
  id: string;
  name: string;
  category: string;
  materialType: string;
  expertise: string;
  brands: string[];
  styles: string[];
  colors: string[];
  trustScore: number;
  badge: string;
}

interface ProviderData {
  preset: string;
  providers: {
    floor: Provider[];
    wall: Provider[];
    furniture: Provider[];
  };
}

export default function ProviderDisplay() {
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
  const [activeCategory, setActiveCategory] = useState<'floor' | 'wall' | 'furniture'>('floor');

  useEffect(() => {
    const handleProvidersUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as ProviderData;
      setProviderData(detail);
    };

    window.addEventListener('providersUpdated', handleProvidersUpdate as EventListener);
    return () => window.removeEventListener('providersUpdated', handleProvidersUpdate as EventListener);
  }, []);

  if (!providerData) {
    return (
      <div className="bg-black/20 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-white/60 text-sm">
            Select a material preset to see matched providers
          </span>
        </div>
      </div>
    );
  }

  const currentProviders = providerData.providers[activeCategory] || [];
  const totalProviders = Object.values(providerData.providers).reduce((sum, cat) => sum + cat.length, 0);

  return (
    <div className="bg-black/20 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">
              {providerData.preset} Specialists
            </h3>
            <p className="text-white/60 text-sm">
              {totalProviders} matched providers
            </p>
          </div>
          
          {/* Category tabs */}
          <div className="flex gap-1 bg-black/30 rounded-lg p-1">
            {(['floor', 'wall', 'furniture'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded text-xs transition-all ${
                  activeCategory === cat 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                {cat} ({providerData.providers[cat].length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Provider list */}
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {currentProviders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/40 text-sm">
              No {activeCategory} specialists found
            </div>
            <div className="text-white/30 text-xs mt-1">
              Database setup may be needed
            </div>
          </div>
        ) : (
          currentProviders.map((provider) => (
            <div 
              key={provider.id}
              className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium text-sm">
                      {provider.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      provider.badge === 'Elite' ? 'bg-yellow-500/20 text-yellow-300' :
                      provider.badge === 'Verified' ? 'bg-green-500/20 text-green-300' :
                      provider.badge === 'Trusted' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {provider.badge}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-xs text-white/60">
                    {provider.materialType} • {provider.expertise}
                  </div>
                  
                  {provider.brands.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {provider.brands.slice(0, 3).map((brand) => (
                        <span 
                          key={brand}
                          className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold text-sm">
                    {provider.trustScore}%
                  </div>
                  <div className="text-white/40 text-xs">
                    trust score
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {currentProviders.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm py-2 rounded-lg transition-all">
            View All {activeCategory} Specialists →
          </button>
        </div>
      )}
    </div>
  );
}

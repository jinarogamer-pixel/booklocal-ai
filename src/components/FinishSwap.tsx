"use client";
import { useRef, useState, useEffect } from "react";

const MATERIAL_PRESETS = [
  {
    name: "Dark Modern",
    floor: "#2D1B1B", // Dark mahogany
    wall: "#1F1F23",  // Charcoal
    sofa: "#0F0F0F",  // Deep black leather
    roughness: 0.3,
    metalness: 0.1,
    gradient: ["#1a1a1a", "#2d1b1b", "#0f0f0f"], // Dark theme gradient
    description: "Sophisticated dark elegance"
  },
  {
    name: "Warm Minimal", 
    floor: "#D4A574", // Warm oak
    wall: "#F5F1EA",  // Cream
    sofa: "#8B6F47",  // Tan leather
    roughness: 0.4,
    metalness: 0.05,
    gradient: ["#f5f1ea", "#d4a574", "#8b6f47"], // Warm earth tones
    description: "Cozy Scandinavian warmth"
  },
  {
    name: "Cool Studio",
    floor: "#A8B2B8", // Cool concrete
    wall: "#E8EAED",  // Light gray
    sofa: "#4A5568",  // Slate blue
    roughness: 0.6,
    metalness: 0.2,
    gradient: ["#e8eaed", "#a8b2b8", "#4a5568"], // Cool industrial 
    description: "Clean industrial aesthetic"
  },
  {
    name: "Industrial Loft",
    floor: "#5D4E37", // Dark wood
    wall: "#2C2C2C",  // Exposed brick gray
    sofa: "#8B4513",  // Cognac leather
    roughness: 0.7,
    metalness: 0.3,
    gradient: ["#2c2c2c", "#5d4e37", "#8b4513"], // Industrial rust tones
    description: "Urban loft vibes"
  },
  {
    name: "Luxury Gold",
    floor: "#CD7F32", // Bronze hardwood
    wall: "#F4F1DE",  // Champagne
    sofa: "#DAA520",  // Goldrod velvet
    roughness: 0.2,
    metalness: 0.4,
    gradient: ["#f4f1de", "#cd7f32", "#daa520"], // Luxury gold accents
    description: "Opulent golden luxury"
  },
  {
    name: "Ocean Breeze",
    floor: "#B0C4DE", // Light blue-gray
    wall: "#F0F8FF",  // Alice blue
    sofa: "#4682B4",  // Steel blue
    roughness: 0.5,
    metalness: 0.1,
    gradient: ["#f0f8ff", "#b0c4de", "#4682b4"], // Ocean blues
    description: "Coastal tranquility"
  }
];

export default function FinishSwap() {
  const [preset, setPreset] = useState(0);
  const total = MATERIAL_PRESETS.length;

  // Listen for demo mode preset changes
  useEffect(() => {
    const handleDemoPreset = (e: Event) => {
      const detail = (e as CustomEvent).detail as { index: number };
      setPreset(detail.index % total);
    };
    
    window.addEventListener("heroPreset", handleDemoPreset as EventListener);
    return () => window.removeEventListener("heroPreset", handleDemoPreset as EventListener);
  }, [total]);

  function next() {
    const nextIx = (preset + 1) % total;
    setPreset(nextIx);
    
    // Broadcast preset change for 3D scene
    window.dispatchEvent(new CustomEvent("heroPreset", { detail: { index: nextIx } }));
    
    // Broadcast gradient change for headline
    const currentPreset = MATERIAL_PRESETS[nextIx];
    window.dispatchEvent(new CustomEvent("gradientChange", { 
      detail: { 
        gradient: currentPreset.gradient,
        preset: currentPreset.name,
        colors: {
          floor: currentPreset.floor,
          wall: currentPreset.wall,
          sofa: currentPreset.sofa
        }
      } 
    }));
    
    // Query providers for this material preset
    queryProvidersForPreset(currentPreset);
  }

  // Query providers based on material preset
  async function queryProvidersForPreset(preset: any) {
    try {
      const style = preset.name.toLowerCase().includes('modern') ? 'modern' : 
                   preset.name.toLowerCase().includes('minimal') ? 'contemporary' :
                   preset.name.toLowerCase().includes('industrial') ? 'industrial' : 
                   'modern';
      
      const [floorProviders, wallProviders, furnitureProviders] = await Promise.all([
        fetch(`/api/materials?category=floor&style=${style}`).then(r => r.json()),
        fetch(`/api/materials?category=wall&style=${style}`).then(r => r.json()),
        fetch(`/api/materials?category=furniture&style=${style}`).then(r => r.json())
      ]);
      
      console.log('🏗️ Provider data for', preset.name, {
        floor: floorProviders.count || 0,
        wall: wallProviders.count || 0,
        furniture: furnitureProviders.count || 0
      });
      
      // Broadcast provider data for other components
      window.dispatchEvent(new CustomEvent('providersUpdated', {
        detail: {
          preset: preset.name,
          providers: {
            floor: floorProviders.providers || [],
            wall: wallProviders.providers || [],
            furniture: furnitureProviders.providers || []
          }
        }
      }));
      
    } catch (error) {
      console.log('⚠️ Provider query failed:', error);
    }
  }

  const currentPreset = MATERIAL_PRESETS[preset];

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={next}
        className="group relative rounded-2xl border border-white/15 px-5 py-3 text-sm bg-white/5 hover:bg-white/10 transition-all hover:border-white/25 overflow-hidden"
      >
        {/* Animated background that matches current preset */}
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${currentPreset.gradient[0]} 0%, ${currentPreset.gradient[1]} 50%, ${currentPreset.gradient[2]} 100%)`
          }}
        />
        
        <span className="relative flex items-center gap-3">
          {/* Color indicator that matches current material */}
          <div className="flex gap-1">
            <div 
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: currentPreset.floor }}
            />
            <div 
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: currentPreset.wall }}
            />
            <div 
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: currentPreset.sofa }}
            />
          </div>
          
          <div className="text-left">
            <div className="font-semibold text-white">{currentPreset.name}</div>
            <div className="text-xs text-white/60">{currentPreset.description}</div>
          </div>
          
          <div className="text-white/40 text-xs ml-2">
            {preset + 1}/{total}
          </div>
        </span>
      </button>
      
      {/* Material preview dots */}
      <div className="flex gap-1">
        {MATERIAL_PRESETS.map((p, index) => (
          <button
            key={p.name}
            onClick={() => {
              setPreset(index);
              window.dispatchEvent(new CustomEvent("heroPreset", { detail: { index } }));
              window.dispatchEvent(new CustomEvent("gradientChange", { 
                detail: { 
                  gradient: p.gradient,
                  preset: p.name,
                  colors: { floor: p.floor, wall: p.wall, sofa: p.sofa }
                } 
              }));
              // Query providers for this preset
              queryProvidersForPreset(p);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === preset ? 'scale-125' : 'opacity-50 hover:opacity-80'
            }`}
            style={{ 
              background: `linear-gradient(45deg, ${p.floor}, ${p.wall}, ${p.sofa})`
            }}
          />
        ))}
      </div>
    </div>
  );
}

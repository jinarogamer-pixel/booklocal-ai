"use client";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface DemoModeProps {
  onToggle?: (active: boolean) => void;
}

export default function DemoModeToggle({ onToggle }: DemoModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPreset, setCurrentPreset] = useState(0);
  
  const presetNames = ["Dark Modern", "Warm Minimal", "Cool Studio", "Industrial Loft"];
  
  // Demo sequence timing
  const DEMO_INTERVALS = {
    SCROLL_STEP: 3000,    // 3 seconds per scroll step
    PRESET_CYCLE: 2500,   // 2.5 seconds per material preset
    FULL_CYCLE: 15000     // 15 seconds full demo cycle
  };

  // Auto-play scroll timeline
  const runScrollSequence = useCallback(() => {
    if (!isActive) return;
    
    let step = 0;
    const maxSteps = 4; // 0, 1, 2, 3
    
    const scrollInterval = setInterval(() => {
      if (!isActive) {
        clearInterval(scrollInterval);
        return;
      }
      
      // Broadcast the current step
      window.dispatchEvent(new CustomEvent("demoStep", { detail: { step } }));
      setCurrentStep(step);
      
      step = (step + 1) % maxSteps;
    }, DEMO_INTERVALS.SCROLL_STEP);
    
    return scrollInterval;
  }, [isActive]);

  // Auto-cycle material presets
  const runPresetSequence = useCallback(() => {
    if (!isActive) return;
    
    let preset = 0;
    const maxPresets = presetNames.length;
    
    const presetInterval = setInterval(() => {
      if (!isActive) {
        clearInterval(presetInterval);
        return;
      }
      
      // Broadcast preset change
      window.dispatchEvent(new CustomEvent("heroPreset", { detail: { index: preset } }));
      setCurrentPreset(preset);
      
      preset = (preset + 1) % maxPresets;
    }, DEMO_INTERVALS.PRESET_CYCLE);
    
    return presetInterval;
  }, [isActive, presetNames.length]);

  // Auto-scroll page to show sections
  const runAutoScroll = useCallback(() => {
    if (!isActive) return;
    
    const scrollTargets = [
      { selector: "#hero-section", duration: 2000 },
      { selector: "#story-sections", duration: 3000 },
      { selector: "#enterprise", duration: 2000 },
      { selector: "footer", duration: 2000 }
    ];
    
    let targetIndex = 0;
    
    const autoScrollInterval = setInterval(() => {
      if (!isActive) {
        clearInterval(autoScrollInterval);
        return;
      }
      
      const target = document.querySelector(scrollTargets[targetIndex].selector);
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
      
      targetIndex = (targetIndex + 1) % scrollTargets.length;
    }, DEMO_INTERVALS.FULL_CYCLE / scrollTargets.length);
    
    return autoScrollInterval;
  }, [isActive]);

  // Demo mode control
  useEffect(() => {
    if (!isActive) return;
    
    // Start demo sequences
    const scrollInterval = runScrollSequence();
    const presetInterval = runPresetSequence();
    const autoScrollInterval = runAutoScroll();
    
    // Cleanup function
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
      if (presetInterval) clearInterval(presetInterval);
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
  }, [isActive, runScrollSequence, runPresetSequence, runAutoScroll]);

  const toggleDemo = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
    
    if (!newState) {
      // Reset to initial state
      setCurrentStep(0);
      setCurrentPreset(0);
      window.dispatchEvent(new CustomEvent("demoStep", { detail: { step: 0 } }));
      window.dispatchEvent(new CustomEvent("heroPreset", { detail: { index: 0 } }));
    }
  };

  const resetDemo = () => {
    setIsActive(false);
    setCurrentStep(0);
    setCurrentPreset(0);
    onToggle?.(false);
    
    // Reset all demo states
    window.dispatchEvent(new CustomEvent("demoStep", { detail: { step: 0 } }));
    window.dispatchEvent(new CustomEvent("heroPreset", { detail: { index: 0 } }));
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2">
      {/* Main Demo Toggle */}
      <button
        onClick={toggleDemo}
        className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl font-semibold transition-all duration-300 ${
          isActive 
            ? 'bg-red-500/90 border-red-400/50 text-white shadow-lg shadow-red-500/25' 
            : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
        }`}
      >
        {isActive ? (
          <>
            <Pause className="w-4 h-4" />
            <span>Stop Demo</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Demo Mode</span>
          </>
        )}
      </button>

      {/* Demo Status & Controls */}
      {isActive && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 min-w-48">
          <div className="text-xs text-white/70 mb-2">DEMO ACTIVE</div>
          
          {/* Current Status */}
          <div className="space-y-2 text-sm text-white">
            <div className="flex justify-between">
              <span>Scroll Step:</span>
              <span className="font-mono">{currentStep + 1}/4</span>
            </div>
            <div className="flex justify-between">
              <span>Material:</span>
              <span className="font-mono text-xs">{presetNames[currentPreset]}</span>
            </div>
          </div>
          
          {/* Progress Indicators */}
          <div className="mt-3 space-y-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    step === currentStep ? 'bg-sky-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1">
              {presetNames.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    index === currentPreset ? 'bg-purple-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Reset Button */}
          <button
            onClick={resetDemo}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo
          </button>
        </div>
      )}
    </div>
  );
}

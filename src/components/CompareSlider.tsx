'use client';
import { useState } from 'react';

export default function CompareSlider({
    left,
    right,
}: {
    left: React.ReactNode;
    right: React.ReactNode;
}) {
    const [x, setX] = useState(50);
    return (
        <div className="relative w-full h-[52vh] md:h-[62vh] rounded-3xl overflow-hidden">
            <div className="absolute inset-0">{right}</div>
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
                {left}
            </div>
            <input
                aria-label="Before/after slider"
                type="range"
                min={0}
                max={100}
                value={x}
                onChange={e => setX(parseInt(e.target.value))}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] appearance-none bg-white/20 h-1 rounded-full outline-none slider"
            />
            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
        </div>
    );
}

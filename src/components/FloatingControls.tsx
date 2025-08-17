"use client";

import { useMemo } from "react";

type Finish = "oak" | "tile" | "concrete";

export default function FloatingControls({
    finish,
    onSwap,
    compare,
    onToggleCompare,
    onOpenEstimate,
}: {
    finish: Finish;
    onSwap: (f: Finish) => void;
    compare: boolean;
    onToggleCompare: () => void;
    onOpenEstimate: () => void;
}) {
    const finishes: Finish[] = ["oak", "tile", "concrete"];
    const badgeTint = useMemo(() => {
        switch (finish) {
            case "oak": return "bg-amber-500/20 border-amber-400/40 text-amber-200";
            case "tile": return "bg-sky-500/20 border-sky-400/40 text-sky-200";
            case "concrete": return "bg-neutral-500/20 border-neutral-400/40 text-neutral-200";
        }
    }, [finish]);

    return (
        <aside
            aria-label="Visualizer controls"
            className="
        fixed right-4 top-[20vh] z-[60]
        w-[280px] max-w-[85vw]
        rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl
        shadow-2xl p-4 flex flex-col gap-3
      "
        >
            {/* Risk-free / Shield "sticker" */}
            <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${badgeTint}`}
                title="Protected by escrow & verified pros"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                    <path fill="currentColor" d="M12 2l7 3v6c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V5l7-3zm-1 12.6l5.3-5.3l-1.4-1.4L11 11.8L9.1 9.9l-1.4 1.4L11 14.6z" />
                </svg>
                <span>Shield Protection • Risk-free escrow</span>
            </div>

            {/* Finish swap */}
            <div className="flex flex-wrap gap-2">
                {finishes.map((f) => (
                    <button
                        key={f}
                        onClick={() => onSwap(f)}
                        aria-pressed={finish === f}
                        className={`
              px-3 py-2 rounded-lg text-sm font-semibold transition
              border ${finish === f ? "border-white/60 bg-white/10" : "border-white/10 hover:border-white/30"}
            `}
                    >
                        {f[0].toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Compare toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
                <span className="text-sm text-white/80">Compare mode</span>
                <button
                    onClick={onToggleCompare}
                    role="switch"
                    aria-checked={compare}
                    className={`w-12 h-7 rounded-full transition relative
            ${compare ? "bg-emerald-500/80" : "bg-white/10"}
          `}
                >
                    <span className={`absolute top-0.5 h-6 w-6 bg-white rounded-full transition
            ${compare ? "right-0.5" : "left-0.5"}
          `} />
                </button>
            </div>

            {/* CTA */}
            <button
                onClick={onOpenEstimate}
                className="btn-primary w-full text-center py-3 rounded-xl font-bold"
            >
                Get Instant Estimate
            </button>

            {/* Micro help */}
            <p className="text-[11px] leading-snug text-white/60">
                Prices are illustrative. Actual quotes vary by provider availability & scope.
            </p>
        </aside>
    );
}

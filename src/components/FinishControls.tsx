'use client';
import { FINISHES, FinishKey } from './RoomViewer';

const LEGEND: Record<FinishKey, { price: string; durability: string; care: string }> = {
    oak: { price: '$$–$$$', durability: 'High (refinishable)', care: 'Mop, occasional refinish' },
    tile: { price: '$$–$$$', durability: 'Very high', care: 'Easy, grout care' },
    concrete: { price: '$$', durability: 'High', care: 'Seal every 2–3 yrs' },
};

export default function FinishControls({
    value,
    onChange,
    compareEnabled,
    onToggleCompare,
    onFilterProviders,
}: {
    value: FinishKey;
    onChange: (f: FinishKey) => void;
    compareEnabled: boolean;
    onToggleCompare: () => void;
    onFilterProviders: (f: FinishKey) => void;
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
                {Object.keys(FINISHES).map((k) => {
                    const key = k as FinishKey;
                    return (
                        <button
                            key={key}
                            onClick={() => { onChange(key); onFilterProviders(key); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${value === key
                                    ? 'bg-white text-black border-white shadow-lg'
                                    : 'bg-black/40 text-white border-white/20 hover:border-white/40'
                                }`}
                        >
                            {FINISHES[key].label}
                        </button>
                    );
                })}
                <div className="flex-1" />
                <label className="inline-flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={compareEnabled}
                        onChange={onToggleCompare}
                        className="rounded border-white/20 bg-black/20 text-white focus:ring-white/20"
                    />
                    <span>Compare</span>
                </label>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 text-xs bg-black/40 border border-white/10 rounded-xl p-4">
                <div>
                    <div className="text-neutral-400 mb-1">Price</div>
                    <div className="font-medium">{LEGEND[value].price}</div>
                </div>
                <div>
                    <div className="text-neutral-400 mb-1">Durability</div>
                    <div className="font-medium">{LEGEND[value].durability}</div>
                </div>
                <div>
                    <div className="text-neutral-400 mb-1">Maintenance</div>
                    <div className="font-medium">{LEGEND[value].care}</div>
                </div>
            </div>
        </div>
    );
}

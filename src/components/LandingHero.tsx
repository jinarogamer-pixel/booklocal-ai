'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const RoomViewer = dynamic(() => import('./PremiumRoomViewer'), {
    ssr: false,
    loading: () => (
        <div className="h-[320px] md:h-[400px] bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl flex items-center justify-center">
            <div className="text-neutral-400">Loading 3D preview...</div>
        </div>
    )
});

type Finish = 'oak' | 'tile' | 'conc';

export default function LandingHero() {
    const [finish, setFinish] = useState<Finish>('oak');

    const finishNames = {
        oak: 'European Oak',
        tile: 'Porcelain Tile',
        conc: 'Polished Concrete'
    };

    return (
        <section className="bg-gradient-to-b from-black via-zinc-950 to-black">
            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300 mb-6">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                            New • Instant visual estimates
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.9] mb-4">
                            See your space.{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                                Get an instant estimate.
                            </span>{' '}
                            Book.
                        </h1>

                        <p className="text-lg text-neutral-300 max-w-xl mb-8">
                            Swap finishes live and compare. When you&apos;re ready, we connect you to vetted local pros.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <a
                                href="#estimate"
                                className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-sky-500 to-emerald-400 text-black hover:shadow-lg transition-shadow text-center"
                            >
                                Get instant estimate
                            </a>
                            <a
                                href="#providers"
                                className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors text-center"
                            >
                                Browse top providers
                            </a>
                        </div>

                        {/* Material selector chips */}
                        <div className="flex flex-wrap gap-2">
                            {(['oak', 'tile', 'conc'] as const).map(k => (
                                <button
                                    key={k}
                                    onClick={() => setFinish(k)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${finish === k
                                            ? 'border-white/30 bg-white/10 text-white shadow-sm'
                                            : 'border-white/10 text-neutral-300 hover:text-white hover:border-white/20'
                                        }`}
                                >
                                    {finishNames[k]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3D preview */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 shadow-2xl">
                        <RoomViewer finish={finish} />
                    </div>
                </div>
            </div>
        </section>
    );
}

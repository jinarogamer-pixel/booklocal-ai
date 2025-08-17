'use client';
import type { CaseItem } from '@/app/cases/data';
import { useEffect, useRef } from 'react';

export default function CaseDetailHero({ item }: { item: CaseItem }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
        const t = setTimeout(() => {
            el.style.transition = 'opacity .6s ease, transform .6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 30);
        return () => clearTimeout(t);
    }, []);

    const m = item.heroMedia;

    return (
        <header className="relative border-b border-white/10">
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div ref={ref}>
                    <p className="text-xs tracking-widest text-neutral-400 uppercase">{item.eyebrow}</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-2">{item.title}</h1>
                    <p className="text-neutral-300 mt-3 max-w-2xl">{item.blurb}</p>

                    <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                        {item.stats.map((s) => (
                            <li
                                key={s.k}
                                className="rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5"
                            >
                                <span className="text-neutral-400">{s.k}: </span>
                                <span className="text-white font-semibold">{s.v}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div
                className="max-w-6xl mx-auto px-4 pb-10"
                style={{ maskImage: 'linear-gradient(black 85%, transparent)' }}
            >
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]">
                    {m.type === 'image' ? (
                        <img src={m.src} alt={m.alt ?? ''} className="w-full h-[44vh] md:h-[56vh] object-cover" />
                    ) : (
                        <video
                            className="w-full h-[44vh] md:h-[56vh] object-cover"
                            src={m.src}
                            poster={m.poster}
                            playsInline
                            muted
                            loop
                            autoPlay
                        />
                    )}
                </div>
            </div>
        </header>
    );
}

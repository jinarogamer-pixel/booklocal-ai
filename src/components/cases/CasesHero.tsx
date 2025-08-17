'use client';
import { useEffect, useRef } from 'react';

export default function CasesHero() {
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
        }, 40);
        return () => clearTimeout(t);
    }, []);

    return (
        <header className="relative border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-20">
                <div ref={ref}>
                    <p className="text-sm tracking-widest text-neutral-400 uppercase">Selected Work</p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-3">
                        Results first. Cinematic by default.
                    </h1>
                    <p className="text-neutral-300 mt-4 max-w-2xl">
                        A few examples of how we mix real-time visuals, AI estimates, and trust scoring to
                        move key metrics for local services.
                    </p>
                </div>
            </div>

            {/* faint grid background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
                style={{
                    background:
                        'linear-gradient(transparent 95%, rgba(255,255,255,.06) 95%) 0 0/100% 40px, linear-gradient(90deg, transparent 95%, rgba(255,255,255,.06) 95%) 0 0/40px 100%',
                }}
            />
        </header>
    );
}

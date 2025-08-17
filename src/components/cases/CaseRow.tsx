'use client';
import type { CaseItem } from '@/app/cases/data';
import { useEffect, useRef } from 'react';

export default function CaseRow({
    caseItem,
    index,
}: {
    caseItem: CaseItem;
    index: number;
}) {
    const rowRef = useRef<HTMLDivElement>(null);
    const mediaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load GSAP lazily on client (no SSR)
        (async () => {
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) return;

            try {
                const gsap = (await import('gsap')).default;
                const { ScrollTrigger } = await import('gsap/ScrollTrigger');
                gsap.registerPlugin(ScrollTrigger);

                if (!rowRef.current || !mediaRef.current) return;

                const yFrom = index % 2 === 0 ? 40 : -40;
                const ctx = gsap.context(() => {
                    gsap.fromTo(
                        rowRef.current!.querySelector('.copy'),
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power2.out',
                            scrollTrigger: { trigger: rowRef.current, start: 'top 80%' },
                        }
                    );

                    gsap.fromTo(
                        mediaRef.current,
                        { y: yFrom, opacity: 0.9 },
                        {
                            y: 0,
                            opacity: 1,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: rowRef.current,
                                start: 'top 85%',
                                scrub: 0.4,
                            },
                        }
                    );
                }, rowRef);

                return () => ctx.revert();
            } catch (error) {
                console.warn('GSAP loading failed:', error);
            }
        })();
    }, [index]);

    const m = caseItem.heroMedia;
    const MediaEl =
        m.type === 'image' ? (
            <img
                src={m.src}
                alt={m.alt ?? ''}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
            />
        ) : (
            <video
                className="w-full h-full object-cover"
                src={m.src}
                poster={m.poster}
                playsInline
                muted
                loop
                autoPlay
            />
        );

    return (
        <article
            ref={rowRef}
            className="grid md:grid-cols-2 gap-10 items-center py-16 border-b border-white/10"
        >
            <div className={`order-2 md:order-${index % 2 === 0 ? '1' : '2'} copy`}>
                <p className="text-xs tracking-widest text-neutral-400 uppercase">{caseItem.eyebrow}</p>
                <h2 className="text-2xl md:text-4xl font-semibold mt-2">{caseItem.title}</h2>
                <p className="text-neutral-300 mt-3">{caseItem.blurb}</p>

                <ul className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    {caseItem.stats.map((s) => (
                        <li key={s.k} className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="text-neutral-400">{s.k}</div>
                            <div className="text-white font-semibold">{s.v}</div>
                        </li>
                    ))}
                </ul>
            </div>

            <div
                ref={mediaRef}
                className={`order-1 md:order-${index % 2 === 0 ? '2' : '1'} rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_80px_-20px_rgba(0,0,0,.6)]`}
                style={{
                    WebkitMaskImage:
                        'radial-gradient(24px at 24px 24px, #0000 98%, #000) top left, radial-gradient(24px at calc(100% - 24px) 24px, #0000 98%, #000) top right, radial-gradient(24px at 24px calc(100% - 24px), #0000 98%, #000) bottom left, radial-gradient(24px at calc(100% - 24px) calc(100% - 24px), #0000 98%, #000) bottom right',
                    WebkitMaskSize: '51% 51%',
                    WebkitMaskRepeat: 'no-repeat',
                }}
            >
                {MediaEl}
            </div>
        </article>
    );
}

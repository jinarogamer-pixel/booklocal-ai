'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function CaseStudyScroll() {
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!root.current || typeof window === 'undefined') return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: root.current,
                    start: 'top 75%',
                    end: '+=200%',
                    scrub: 0.6,
                    pin: true,
                }
            });

            // Animate elements in sequence
            tl.from('.cs-line', { width: 0, duration: 1 })
                .from('.cs-h', { y: 40, opacity: 0, stagger: 0.2, duration: 0.8 }, '<+0.2')
                .from('.cs-block', { y: 80, opacity: 0, stagger: 0.15, duration: 0.8 }, '-=0.3');
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={root} className="relative px-6 py-20 bg-transparent">
            <div className="max-w-6xl mx-auto">
                <div className="h-1 bg-gradient-to-r from-white/10 to-white/40 rounded cs-line mb-8" />
                <h2 className="text-3xl md:text-5xl font-bold cs-h">From Idea → Working Bookings</h2>
                <p className="text-neutral-400 mt-3 cs-h">Scroll the story: validation, providers, revenue.</p>

                <div className="grid md:grid-cols-3 gap-6 mt-10">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 cs-block">
                        <div className="text-4xl font-black mb-2">98%</div>
                        <div className="text-sm text-neutral-400">Customer satisfaction</div>
                        <div className="text-xs text-neutral-500 mt-1">Avg. project rating</div>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 cs-block">
                        <div className="text-4xl font-black mb-2">10k+</div>
                        <div className="text-sm text-neutral-400">Monthly visitors</div>
                        <div className="text-xs text-neutral-500 mt-1">Organic & referral traffic</div>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10 cs-block">
                        <div className="text-4xl font-black mb-2">$85k+</div>
                        <div className="text-sm text-neutral-400">Projects facilitated</div>
                        <div className="text-xs text-neutral-500 mt-1">Since beta launch</div>
                    </div>
                </div>

                <div className="mt-12 grid md:grid-cols-2 gap-8">
                    <div className="cs-block">
                        <h3 className="text-xl font-semibold mb-4">Trust-First Approach</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            Our AI-powered trust scoring combines 10+ data points including project history,
                            customer feedback, insurance verification, and real-time performance metrics to
                            ensure you&apos;re matched with the most reliable professionals.
                        </p>
                    </div>
                    <div className="cs-block">
                        <h3 className="text-xl font-semibold mb-4">Visual Decision Making</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            See your space transformed before you commit. Our 3D visualization technology
                            lets you swap materials, compare finishes, and understand exactly what your
                            project will look like - reducing surprises and ensuring satisfaction.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

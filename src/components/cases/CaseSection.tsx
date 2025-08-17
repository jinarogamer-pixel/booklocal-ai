'use client';
import type { CaseItem } from '@/app/cases/data';

export default function CaseSection({
    section,
}: {
    section: NonNullable<CaseItem['sections']>[number];
}) {
    if (section.kind === 'copy') {
        return (
            <section>
                {section.title && <h3 className="text-xl md:text-2xl font-semibold mb-2">{section.title}</h3>}
                <p className="text-neutral-300 leading-relaxed">{section.copy}</p>
            </section>
        );
    }

    if (section.kind === 'media' && section.media) {
        const m = section.media;
        return (
            <section>
                {section.title && <h3 className="text-xl md:text-2xl font-semibold mb-4">{section.title}</h3>}
                <div className="rounded-xl overflow-hidden border border-white/10">
                    {m.type === 'image' ? (
                        <img src={m.src} alt={m.alt ?? ''} className="w-full h-auto" />
                    ) : (
                        <video src={m.src} poster={m.poster} controls className="w-full h-auto" />
                    )}
                </div>
            </section>
        );
    }

    if (section.kind === 'quote' && section.quote) {
        return (
            <blockquote className="border-l-2 border-white/20 pl-4 py-2 text-lg text-neutral-200 italic">
                "{section.quote.text}"
                {section.quote.cite && <footer className="not-italic text-sm text-neutral-400 mt-2">— {section.quote.cite}</footer>}
            </blockquote>
        );
    }

    if (section.kind === 'steps' && section.steps) {
        return (
            <section>
                {section.title && <h3 className="text-xl md:text-2xl font-semibold mb-4">{section.title}</h3>}
                <ol className="grid gap-3">
                    {section.steps.map((s, i) => (
                        <li key={i} className="rounded-lg border border-white/10 bg-white/[.04] p-4">
                            <div className="text-neutral-400 text-sm">Step {i + 1}</div>
                            <div className="font-semibold">{s.title}</div>
                            {s.detail && <p className="text-neutral-300 mt-1">{s.detail}</p>}
                        </li>
                    ))}
                </ol>
            </section>
        );
    }

    if (section.kind === 'kpis' && section.kpis) {
        return (
            <section>
                {section.title && <h3 className="text-xl md:text-2xl font-semibold mb-4">{section.title}</h3>}
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {section.kpis.map((s) => (
                        <li key={s.k} className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="text-neutral-400">{s.k}</div>
                            <div className="text-white font-semibold text-lg">{s.v}</div>
                        </li>
                    ))}
                </ul>
            </section>
        );
    }

    return null;
}

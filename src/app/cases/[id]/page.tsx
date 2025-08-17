import CaseDetailHero from '@/components/cases/CaseDetailHero';
import CaseSection from '@/components/cases/CaseSection';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { caseById, caseIds } from '../data';

type Params = { id: string };

export function generateStaticParams() {
    return caseIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { id } = await params;
    const item = caseById(id);
    if (!item) return {};
    return {
        title: `${item.title} – Cases – BookLocal`,
        description: item.blurb,
        openGraph: {
            title: item.title,
            description: item.blurb,
            images: item.heroMedia.type === 'image' ? [{ url: item.heroMedia.src }] : undefined,
        },
    };
}

export default async function CaseDetailPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const item = caseById(id);
    if (!item) return notFound();

    return (
        <main className="bg-black text-white">
            <CaseDetailHero item={item} />
            <article className="max-w-5xl mx-auto px-4 py-12 space-y-14">
                {(item.sections ?? []).map((s, i) => (
                    <CaseSection key={i} section={s} />
                ))}
            </article>
            <nav className="max-w-5xl mx-auto px-4 pb-20 flex items-center justify-between text-sm">
                <a className="text-neutral-400 hover:text-white underline" href="/cases">← All cases</a>
                <a className="text-neutral-400 hover:text-white underline" href="/#estimate">Get an instant estimate</a>
            </nav>
        </main>
    );
}

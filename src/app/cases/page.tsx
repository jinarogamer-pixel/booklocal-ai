import CaseRow from '@/components/cases/CaseRow';
import CasesHero from '@/components/cases/CasesHero';
import type { Metadata } from 'next';
import { CASES } from './data';

export const metadata: Metadata = {
    title: 'Cases – BookLocal',
    description: 'Selected work: interactive visualizations, instant estimates, and trusted provider tooling.',
};

export default function CasesPage() {
    return (
        <main className="bg-black text-white">
            <CasesHero />
            <section className="max-w-6xl mx-auto px-4">
                {CASES.map((c, i) => (
                    <CaseRow key={c.id} caseItem={c} index={i} />
                ))}
            </section>
            <footer className="border-t border-white/10 mt-20">
                <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-neutral-400">
                    Ready to build something similar? <a className="text-white underline" href="/#estimate">Get an instant estimate</a>.
                </div>
            </footer>
        </main>
    );
}

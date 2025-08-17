export type Stat = { k: string; v: string };
export type Media =
    | { type: 'image'; src: string; alt?: string }
    | { type: 'video'; src: string; poster?: string; alt?: string };

export type CaseItem = {
    id: string;
    eyebrow: string;
    title: string;
    blurb: string;
    stats: Stat[];
    heroMedia: Media;
    // detail-only fields
    sections?: {
        title?: string;
        kind?: 'copy' | 'media' | 'quote' | 'steps' | 'kpis';
        copy?: string;
        media?: Media;
        quote?: { text: string; cite?: string };
        steps?: { title: string; detail?: string }[];
        kpis?: Stat[];
    }[];
};

export const CASES: CaseItem[] = [
    {
        id: 'reno-savings',
        eyebrow: 'Home Services',
        title: 'Cut estimate time from days to minutes',
        blurb:
            'We replaced PDF quotes with live 3D + AI estimates. Conversion +41%, refund rate –22%.',
        stats: [
            { k: 'Conversion', v: '+41%' },
            { k: 'Quote time', v: '48h → 2m' },
            { k: 'Refunds', v: '–22%' },
        ],
        heroMedia: { type: 'image', src: '/cases/reno-savings-hero.jpg', alt: 'Renovation savings case study' },
        sections: [
            {
                title: 'Context',
                kind: 'copy',
                copy:
                    'Legacy quoting relied on manual measurements and email back-and-forth. We introduced a guided flow + instant AI estimate based on photos and room dimensions.',
            },
            {
                title: 'Approach',
                kind: 'steps',
                steps: [
                    { title: 'Upload & detect', detail: 'Edge models detect planes and rough dimensions.' },
                    { title: 'Generate 3D', detail: 'Reconstruct floor plane + lighting proxy.' },
                    { title: 'Price instantly', detail: 'Material, sqft, labor tables → instant total.' },
                ],
            },
            {
                kind: 'media',
                media: { type: 'image', src: '/cases/reno-savings-detail.jpg', alt: 'Guided estimate flow' },
            },
            {
                kind: 'quote',
                quote: { text: '"Estimates went from days to minutes."', cite: 'Head of Ops' },
            },
            { kind: 'kpis', kpis: [{ k: 'CSAT', v: '4.8/5' }, { k: 'On-time', v: '96.3%' }] },
        ],
    },
    {
        id: 'tile-configurator',
        eyebrow: 'Configurator',
        title: 'Try finishes before you buy',
        blurb:
            'Material swapper with realistic lighting and a before/after scrub for confidence at checkout.',
        stats: [
            { k: 'AOV', v: '+18%' },
            { k: 'Return rate', v: '–15%' },
            { k: 'Time on page', v: '2.6×' },
        ],
        heroMedia: { type: 'image', src: '/cases/tile-configurator-hero.jpg', alt: 'Tile Configurator' },
    },
    {
        id: 'pro-network',
        eyebrow: 'Provider Network',
        title: 'Trust scoring that scales',
        blurb:
            'Signal-based scoring: reliability, responsiveness, experience. Surfaces the best local pros.',
        stats: [{ k: 'Repeat jobs', v: '+27%' }, { k: 'On-time', v: '96.3%' }, { k: 'NPS', v: '72' }],
        heroMedia: { type: 'image', src: '/cases/pro-network-hero.jpg', alt: 'Provider Network' },
    },
];

export const caseById = (id: string) => CASES.find((c) => c.id === id);
export const caseIds = () => CASES.map((c) => c.id);

'use client'
import { motion } from 'framer-motion'

export default function SimpleTrustMeter({ score = 72, small = false }: { score?: number; small?: boolean }) {
    const pct = Math.max(0, Math.min(100, score))
    const color = pct > 80 ? 'var(--ok)' : pct > 60 ? 'var(--warn)' : 'var(--bad)'

    return (
        <div className="card" style={{ padding: small ? '.5rem' : '1rem' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong style={{ fontSize: small ? '.75rem' : '1rem' }}>Trust score</strong>
                <span className="muted" style={{ fontSize: small ? '.75rem' : '1rem' }}>{pct}%</span>
            </div>
            <div style={{ height: small ? 6 : 10, borderRadius: 999, background: 'rgba(255,255,255,.06)', marginTop: small ? 6 : 10, overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, hsl(${color}), hsl(${color})` }}
                />
            </div>
        </div>
    )
}
            )}
<div className={`w-full ${size} bg-neutral-800/70 rounded-full overflow-hidden`}>
    <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`h-full rounded-full`}
        style={{ background: `linear-gradient(90deg, hsl(${hue},90%,55%), hsl(${hue + 25},90%,50%))` }}
    />
</div>
        </div >
    );
}

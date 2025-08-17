'use client'
import Link from 'next/link'

export function ProNavbar({ authed = false }: { authed?: boolean }) {
    return (
        <header className="row" style={{ justifyContent: 'space-between', padding: '1rem 1.25rem', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
            <Link href="/" className="row">
                <div className="card" style={{ padding: '.4rem .7rem' }}>
                    <span className="font-bold text-white">BookLocal</span>
                </div>
            </Link>
            <nav className="row">
                <Link className="muted link-underline" href="/features">Features</Link>
                <Link className="muted link-underline" href="/pricing">Pricing</Link>
                <Link className="muted link-underline" href="/cases">Cases</Link>
            </nav>
            <div className="row">
                {!authed ? (
                    <>
                        <Link className="btn ghost" href="/signin">Sign in</Link>
                        <Link className="btn" href="/get-started">Get Started</Link>
                    </>
                ) : (
                    <Link className="btn" href="/dashboard">Open Dashboard</Link>
                )}
            </div>
        </header>
    )
}

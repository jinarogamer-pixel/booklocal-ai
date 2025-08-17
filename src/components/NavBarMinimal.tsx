'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NavBarMinimal() {
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        // Simple auth check via cookie presence
        setAuthed(document.cookie.includes('sb-access-token='));
    }, []);

    return (
        <nav className="sticky top-0 z-40 bg-black/40 backdrop-blur border-b border-white/10">
            <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between">
                <Link href="/" className="font-black tracking-tight text-white">
                    BookLocal
                </Link>

                <div className="flex items-center gap-3">
                    {/* Single dropdown for the whole site */}
                    <details className="group relative">
                        <summary className="list-none px-3 py-1.5 rounded-full border border-white/10 text-sm text-neutral-300 hover:text-white cursor-pointer">
                            Menu
                        </summary>
                        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur shadow-2xl p-1">
                            {!authed ? (
                                <>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="#features">
                                        Features
                                    </Link>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="#pricing">
                                        Pricing
                                    </Link>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="/legal/privacy">
                                        Privacy
                                    </Link>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="/legal/terms">
                                        Terms
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="/dashboard">
                                        Dashboard
                                    </Link>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="/projects">
                                        Projects
                                    </Link>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="/profile">
                                        Profile
                                    </Link>
                                    <Link className="block px-3 py-2 rounded-lg hover:bg-white/5 text-white" href="/settings">
                                        Settings
                                    </Link>
                                </>
                            )}
                        </div>
                    </details>

                    {!authed ? (
                        <Link
                            href="/signin"
                            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 text-black font-semibold"
                        >
                            Sign in
                        </Link>
                    ) : (
                        <Link
                            href="/new"
                            className="px-3 py-1.5 rounded-full bg-white text-black font-semibold"
                        >
                            New Project
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

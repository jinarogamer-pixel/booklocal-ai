'use client';

export default function AnimatedBG() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/5 to-transparent animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(20,184,166,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_70%,rgba(34,211,238,0.1),transparent_50%)]" />
            </div>
        </div>
    );
}

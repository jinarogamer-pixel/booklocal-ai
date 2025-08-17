"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ThanksContent({ projectId }: { projectId?: string }) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!projectId) {
            const t = setInterval(() => setCountdown((s) => (s > 0 ? s - 1 : 0)), 1000);
            const r = setTimeout(() => router.push("/"), 5000);
            return () => {
                clearInterval(t);
                clearTimeout(r);
            };
        }
    }, [projectId, router]);

    if (!projectId) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center px-6">
                <div className="max-w-xl w-full text-center space-y-6">
                    <div className="flex items-center justify-center">
                        <span
                            className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white"
                            aria-hidden
                        />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold">Your request is processing…</h1>
                    <p className="text-white/70">
                        We're validating your submission and preparing your estimate. You'll be redirected to the home page in{" "}
                        <span className="font-mono">{countdown}s</span>.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Link href="/" className="btn-primary">Go to Home now</Link>
                        <Link href="/cases" className="underline">See case studies</Link>
                    </div>
                </div>
            </main>
        );
    }

    // Normal "Thanks" when a project id exists
    return (
        <main className="min-h-[70vh] flex items-center justify-center px-6">
            <div className="max-w-xl w-full text-center space-y-6">
                <h1 className="text-3xl md:text-4xl font-extrabold">Thanks — we received your project</h1>
                <p className="text-white/70">
                    Reference ID: <span className="font-mono">{projectId.slice(0, 8)}</span>
                </p>
                <p className="text-white/70">
                    A matching specialist is reviewing details. We'll email/txt you updates.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/" className="btn-primary">Back to Home</Link>
                    <Link href="/cases" className="underline">See recent case studies</Link>
                </div>
            </div>
        </main>
    );
}

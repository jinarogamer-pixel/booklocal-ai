"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function PostProjectSheet({
    open,
    onClose,
    defaultFinish,
}: {
    open: boolean;
    onClose: () => void;
    defaultFinish: "oak" | "tile" | "concrete";
}) {
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setErr(null);
        setOkMsg(null);

        const fd = new FormData(e.currentTarget);
        const payload = {
            finish: (fd.get('finish') as string) || defaultFinish,
            budget: Number(fd.get('budget') as string),
            timeline: fd.get('timeline') as string,
            notes: (fd.get('notes') as string) || undefined,
            email: (fd.get('email') as string) || undefined,
            phone: (fd.get('phone') as string) || undefined,
        };

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok || !json?.ok) {
                throw new Error(json?.error || 'Failed to post project');
            }
            setOkMsg('Project submitted! We\'ll match providers shortly.');

            // Redirect to thanks page if provided
            if (json.redirect) {
                window.location.href = json.redirect;
                return;
            }

            setTimeout(() => {
                onClose();
            }, 900);
        } catch (e: any) {
            setErr(e?.message ?? 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div className="fixed inset-0 z-[70] flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        className="relative ml-auto h-full w-full max-w-md bg-zinc-950/95 text-white p-6 rounded-l-2xl shadow-2xl overflow-y-auto"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 24, stiffness: 300 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Post Your Project</h2>
                            <button onClick={onClose} className="text-white/60 hover:text-white transition">✕</button>
                        </div>

                        {/* Feedback */}
                        {okMsg && <div className="mb-4 rounded-lg bg-emerald-600/20 border border-emerald-500/40 px-3 py-2 text-sm">{okMsg}</div>}
                        {err && <div className="mb-4 rounded-lg bg-red-600/20 border border-red-500/40 px-3 py-2 text-sm">{err}</div>}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium mb-1">Preferred Finish</label>
                                <select name="finish" defaultValue={defaultFinish} className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2">
                                    <option value="oak">Oak</option>
                                    <option value="tile">Tile</option>
                                    <option value="concrete">Concrete</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estimated Budget</label>
                                    <input type="number" name="budget" placeholder="15000" required className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Timeline</label>
                                    <select name="timeline" className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2">
                                        <option>1-3 months</option>
                                        <option>3-6 months</option>
                                        <option>6-12 months</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email (optional)</label>
                                    <input type="email" name="email" placeholder="you@email.com" className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                                    <input name="phone" placeholder="(555) 555-5555" className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Additional Details</label>
                                <textarea name="notes" rows={4} placeholder="Tell us about your project goals..." className="w-full rounded-md bg-black/40 border border-white/20 px-3 py-2" />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold disabled:opacity-60"
                            >
                                {submitting ? 'Submitting…' : 'Submit Project'}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

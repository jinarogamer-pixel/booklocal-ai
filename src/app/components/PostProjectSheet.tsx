"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "./NotificationProvider";

type SheetContext = {
    finish?: "oak" | "tile" | "concrete" | string;
    tint?: string;
    city?: string;
    state?: string;
    zip?: string;
    providerId?: string;
    providerName?: string;
    focus?: string;
};

type FormData = {
    name: string;
    email: string;
    phone: string;
    sqft: string;
    city: string;
    state: string;
    zip: string;
    notes: string;
};

export default function PostProjectSheet() {
    const [open, setOpen] = useState(false);
    const [context, setContext] = useState<SheetContext | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        sqft: "",
        city: "",
        state: "",
        zip: "",
        notes: "",
    });

    // Listen for sheet open events
    useEffect(() => {
        function handleOpen(e: Event) {
            const detail = (e as CustomEvent).detail || {};
            setContext(detail);
            setOpen(true);

            // Pre-fill form from context
            setFormData(prev => ({
                ...prev,
                city: detail.city || prev.city,
                state: detail.state || prev.state,
                zip: detail.zip || prev.zip,
            }));

            // Focus specific field after animation
            setTimeout(() => {
                const focusField = detail.focus || "name";
                const input = formRef.current?.querySelector<HTMLInputElement>(`input[name="${focusField}"]`);
                input?.focus();
            }, 300);
        }

        // Listen for multiple event types
        window.addEventListener("open-post-project", handleOpen as EventListener);
        window.addEventListener("bl-open-post-project", handleOpen as EventListener);
        window.addEventListener("open-project-sheet", handleOpen as EventListener);

        return () => {
            window.removeEventListener("open-post-project", handleOpen as EventListener);
            window.removeEventListener("bl-open-post-project", handleOpen as EventListener);
            window.removeEventListener("open-project-sheet", handleOpen as EventListener);
        };
    }, []);

    // Load saved location on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedCity = localStorage.getItem("bl_last_city");
                const savedState = localStorage.getItem("bl_last_state");
                const savedZip = localStorage.getItem("bl_last_zip");

                if (savedCity || savedState || savedZip) {
                    setFormData(prev => ({
                        ...prev,
                        city: savedCity || prev.city,
                        state: savedState || prev.state,
                        zip: savedZip || prev.zip,
                    }));
                }
            } catch (error) {
                // Ignore localStorage errors
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (formData.sqft && (isNaN(Number(formData.sqft)) || Number(formData.sqft) < 50)) {
            newErrors.sqft = "Square footage must be at least 50";
        }

        if (formData.zip && !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
            newErrors.zip = "Please enter a valid ZIP code";
        }

        if (formData.notes.length > 2000) {
            newErrors.notes = "Notes must be under 2000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            showNotification("error", "Please fix the highlighted fields");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                sqft: formData.sqft ? parseInt(formData.sqft, 10) : undefined,
                finish: context?.finish || "oak",
                providerId: context?.providerId,
            };

            const response = await fetch("/api/projects/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                showNotification("error", result.message || "Failed to submit project");
                return;
            }

            // Save location data
            if (formData.city) localStorage.setItem("bl_last_city", formData.city);
            if (formData.state) localStorage.setItem("bl_last_state", formData.state);
            if (formData.zip) localStorage.setItem("bl_last_zip", formData.zip);

            // Update URL with location context
            const url = new URL(window.location.href);
            if (formData.city) url.searchParams.set("city", formData.city);
            if (formData.state) url.searchParams.set("state", formData.state);
            if (formData.zip) url.searchParams.set("zip", formData.zip);
            window.history.replaceState({}, "", url.toString());

            // Success notification
            showNotification("success", "Project submitted! We'll match you with top providers.");

            // Close sheet and redirect
            setOpen(false);

            // Redirect to thanks page
            const thanksParams = new URLSearchParams({
                project: result.projectId,
                finish: String(context?.finish || ""),
                city: formData.city || "",
            });

            setTimeout(() => {
                window.location.assign(`/thanks?${thanksParams.toString()}`);
            }, 500);

        } catch (error) {
            console.error("Submission error:", error);
            showNotification("error", "Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        // Reset form after animation
        setTimeout(() => {
            setFormData({
                name: "",
                email: "",
                phone: "",
                sqft: "",
                city: "",
                state: "",
                zip: "",
                notes: "",
            });
            setErrors({});
            setContext(null);
        }, 300);
    };

    const getMaterialTint = (finish?: string) => {
        switch (finish) {
            case "oak": return "#E6D2B5";
            case "tile": return "#CFE4F7";
            case "concrete": return "#D3D6D8";
            default: return "#10B981";
        }
    };

    const tintColor = context?.tint || getMaterialTint(context?.finish);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="fixed right-0 top-0 h-full w-full max-w-lg z-[9999] studio-card-glass border-l border-gray-700 overflow-y-auto"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 280, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Post Your Project</h2>
                                    <p className="text-sm text-gray-400 mt-1">Get matched with verified local pros</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Context display */}
                            {(context?.finish || context?.providerName) && (
                                <div
                                    className="mt-4 p-3 rounded-lg border"
                                    style={{
                                        borderColor: tintColor + "40",
                                        backgroundColor: tintColor + "10"
                                    }}
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        {context.finish && (
                                            <span style={{ color: tintColor }}>
                                                {context.finish.charAt(0).toUpperCase() + context.finish.slice(1)} finish
                                            </span>
                                        )}
                                        {context.finish && context.providerName && (
                                            <span className="text-gray-400">•</span>
                                        )}
                                        {context.providerName && (
                                            <span className="text-gray-300">
                                                Preferred: {context.providerName}
                                            </span>
                                        )}
                                    </div>
                                    {context.city && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {context.city}{context.state ? `, ${context.state}` : ""}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <div className="p-6">
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                {/* Name & Phone */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`studio-input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            placeholder="Your full name"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="studio-input"
                                            placeholder="(555) 555-5555"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`studio-input ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                        placeholder="your@email.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="studio-input"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="studio-input"
                                            placeholder="TX"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>

                                {/* ZIP & Square Footage */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleInputChange}
                                            className={`studio-input ${errors.zip ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            placeholder="78701"
                                            maxLength={10}
                                        />
                                        {errors.zip && (
                                            <p className="text-red-400 text-xs mt-1">{errors.zip}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-2">
                                            Square Feet
                                        </label>
                                        <input
                                            type="number"
                                            name="sqft"
                                            value={formData.sqft}
                                            onChange={handleInputChange}
                                            className={`studio-input ${errors.sqft ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                            placeholder="300"
                                            min="50"
                                        />
                                        {errors.sqft && (
                                            <p className="text-red-400 text-xs mt-1">{errors.sqft}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Project Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Project Details
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`studio-input resize-none ${errors.notes ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                                        placeholder="Tell us about your project goals, timeline, and any specific requirements..."
                                        maxLength={2000}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        {errors.notes && (
                                            <p className="text-red-400 text-xs">{errors.notes}</p>
                                        )}
                                        <p className="text-gray-500 text-xs ml-auto">
                                            {formData.notes.length}/2000
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full studio-btn-primary px-6 py-4 text-lg font-semibold mt-6"
                                    style={{
                                        boxShadow: submitting ? undefined : `0 6px 24px 0 ${tintColor}40`,
                                    }}
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </div>
                                    ) : (
                                        "Get Matched with Top Pros"
                                    )}
                                </button>

                                {/* Footer */}
                                <div className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-800">
                                    By submitting, you agree to be contacted by verified local contractors.
                                    <br />
                                    No spam, unsubscribe anytime.
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY";
import toast, { Toaster } from "react-hot-toast";
import { getSupabase } from "../../lib/supabaseClient";
import { NavBar } from "../../components/NavBar";
import { DarkModeToggle } from "../../components/DarkModeToggle";
import { BenefitsGrid } from "../../components/BenefitsGrid";
import { providerFormSchema } from "../../lib/providerValidation";
import { sanitizeInput } from "../../lib/sanitize";
import { trackEvent } from "../../lib/analytics";
import { captureError } from "../../lib/errorMonitoring";
import type { ProviderFormData } from "../../types/provider";

export default function ProviderSignup() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    services: [],
    location: '',
    experience: '',
    description: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Analytics: track form view
  useEffect(() => {
    trackEvent("provider_signup_form_viewed");
  }, []);

  const handleServiceChange = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  // Always use a local supabase instance if needed
  const supabase = getSupabase();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setFieldErrors({});

    // Zod validation
    const result = providerFormSchema.safeParse(formData);
    if (!result.success) {
      trackEvent("provider_signup_validation_error", { errorCount: result.error.issues.length });
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path && err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setFieldErrors(errors);
      setMsg("Please fix the errors below.");
      toast.error("Please fix the errors below.");
      setLoading(false);
      return;
    }
    trackEvent("provider_signup_form_submitted");


    // Input sanitization
    const sanitized = {
      ...formData,
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      business_name: sanitizeInput(formData.business_name),
      location: sanitizeInput(formData.location),
      experience: sanitizeInput(formData.experience),
      description: sanitizeInput(formData.description),
    };

    if (!captchaToken) {
      setMsg("Please complete the CAPTCHA challenge.");
      toast.error("Please complete the CAPTCHA challenge.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/provider-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sanitized, services: formData.services, captchaToken })
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(data.error || "Submission failed");
        toast.error(data.error || "Submission failed");
        captureError(data.error, { formData: sanitized });
        // Reset CAPTCHA if error
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken(null);
      } else {
        setMsg("Success! Thanks for applying. We'll review your application and get back to you within 24 hours with next steps.");
        toast.success("Application submitted! We'll review and get back to you soon.");
        setFormData({
          name: '', email: '', phone: '', business_name: '',
          services: [], location: '', experience: '', description: ''
        });
        trackEvent("provider_signup_success", { email: sanitized.email });
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken(null);
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), { formData: sanitized });
      toast.error("Unexpected error. Please try again later.");
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
    setLoading(false);
  }

  // Service options (could be moved to a config file)
  const serviceOptions = [
    { category: "🏠 Home Cleaning", services: ["Regular House Cleaning", "Deep Cleaning", "Carpet Cleaning", "Window Cleaning", "Pressure Washing"] },
    { category: "🔧 Handyman", services: ["General Repairs", "Plumbing (Minor)", "Electrical (Minor)", "Painting", "Furniture Assembly", "TV Mounting"] },
    { category: "🌱 Yard Work", services: ["Lawn Mowing", "Landscaping", "Tree Trimming", "Garden Care", "Fence Installation"] },
    { category: "📸 Photography", services: ["Wedding Photography", "Event Photography", "Portrait Photography", "Real Estate Photography"] },
    { category: "💪 Fitness", services: ["Personal Training", "Group Fitness", "Yoga Instruction", "Nutrition Coaching"] },
    { category: "🍽️ Catering", services: ["Wedding Catering", "Corporate Catering", "Private Chef", "Bartending"] },
    { category: "🐕 Pet Care", services: ["Dog Walking", "Pet Sitting", "Dog Grooming", "Pet Training"] },
    { category: "💻 Technology", services: ["Computer Repair", "WiFi Setup", "Smart Home Installation", "Website Design"] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-950 via-neutral-950 to-neutral-900 text-neutral-50">
      <Toaster position="top-center" />
      <div className="flex items-center justify-end max-w-6xl mx-auto px-4 pt-4">
        <DarkModeToggle />
      </div>
      <NavBar />
      {/* Main Content */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">Become a Trusted BookLocal Provider</h1>
            <p className="text-xl text-neutral-200 mb-6 font-medium">
              Reach more local customers, set your own prices, and grow your business with BookLocal.
            </p>
            <div className="mb-8">
              <BenefitsGrid />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto mb-6 shadow-lg">
              <h2 className="text-lg font-semibold text-sky-300 mb-2">Why join BookLocal?</h2>
              <ul className="text-neutral-200 text-base space-y-1 list-disc list-inside">
                <li>No upfront costs or hidden fees</li>
                <li>Get high-quality leads from real local customers</li>
                <li>Easy-to-use dashboard for managing your business</li>
                <li>Support from a real, local team</li>
              </ul>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-4 max-w-xs mx-auto shadow">
                <p className="text-emerald-300 font-semibold mb-1">“BookLocal helped me double my clients in just 2 months!”</p>
                <span className="text-neutral-200 text-sm">— Jamie, Home Cleaning Pro</span>
              </div>
              <div className="bg-sky-500/10 border border-sky-400/20 rounded-lg p-4 max-w-xs mx-auto shadow">
                <p className="text-sky-300 font-semibold mb-1">“I love how easy it is to manage my bookings and get paid.”</p>
                <span className="text-neutral-200 text-sm">— Alex, Handyman</span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-10" aria-label="Provider signup form">
            {/* Personal Info */}
            <div className="glass-card p-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-6 text-sky-300 flex items-center gap-2">
                <svg width='24' height='24' fill='none' stroke='#0ea5e9' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='7' r='4'/><path d='M5.5 21a6.5 6.5 0 0113 0'/></svg>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-200 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-sky-500/50 placeholder:text-neutral-400 focus:ring-2"
                    placeholder="John Smith"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  />
                  {fieldErrors.name && <span id="name-error" className="text-red-400 text-xs">{fieldErrors.name}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-sky-500/50 placeholder:text-neutral-400 focus:ring-2"
                    placeholder="Smith's Home Services"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-sky-500/50 placeholder:text-neutral-400 focus:ring-2"
                    placeholder="john@example.com"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  />
                  {fieldErrors.email && <span id="email-error" className="text-red-400 text-xs">{fieldErrors.email}</span>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-200 mb-2">
                    Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-sky-500/50 placeholder:text-neutral-400 focus:ring-2"
                    placeholder="(555) 123-4567"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                  />
                  {fieldErrors.phone && <span id="phone-error" className="text-red-400 text-xs">{fieldErrors.phone}</span>}
                </div>
              </div>

                <div className="mt-4">
                  <label htmlFor="location" className="block text-sm font-medium text-neutral-200 mb-2">
                    Service Area *
                  </label>
                  <input
                    id="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Miami, FL (or surrounding areas)"
                    className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-sky-500/50 placeholder:text-neutral-400 focus:ring-2"
                    aria-invalid={!!fieldErrors.location}
                    aria-describedby={fieldErrors.location ? "location-error" : undefined}
                  />
                  {fieldErrors.location && <span id="location-error" className="text-red-400 text-xs">{fieldErrors.location}</span>}
                </div>
            </div>

            {/* Divider */}
            <div className="h-0.5 w-full bg-gradient-to-r from-sky-500/30 via-white/10 to-emerald-400/20 my-8 rounded-full" />

            {/* Services */}
            <div className="glass-card p-8 animate-fade-in-up">
              <h2 className="text-2xl font-bold mb-6 text-emerald-300 flex items-center gap-2">
                <svg width='24' height='24' fill='none' stroke='#10b981' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='7' width='18' height='13' rx='2'/><path d='M16 3v4M8 3v4'/></svg>
                Services You Offer *
              </h2>
              <p className="text-base text-neutral-200 mb-4">Select all services you can provide:</p>
              <div className="space-y-4">
                {serviceOptions.map((group) => (
                  <div key={group.category}>
                    <h3 className="font-medium text-neutral-200 mb-2">{group.category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {group.services.map((service) => (
                        <label key={service} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceChange(service)}
                            className="mr-2 rounded border-white/10 bg-neutral-900 text-sky-500 focus:ring-2 focus:ring-sky-400 transition-shadow duration-150 hover:scale-105"
                            aria-checked={formData.services.includes(service)}
                          />
                          <span className="text-sm text-neutral-200 select-none">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                  {fieldErrors.services && <span className="text-red-400 text-xs">{fieldErrors.services}</span>}
              </div>
            </div>



            {/* Divider */}
            <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400/20 via-white/10 to-sky-500/30 my-8 rounded-full" />

            {/* CAPTCHA */}
            <div className="flex flex-col items-center my-4 animate-fade-in-up">
              <label className="mb-2 text-neutral-300 text-sm font-medium">Please verify you are human</label>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token: string | null) => setCaptchaToken(token)}
                theme="dark"
              />
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-busy={loading}
              >
                {loading ? "Submitting Application..." : "Apply to Join BookLocal"}
              </button>
            </div>

            {/* Message */}
            {msg && (
              <div className={`glass-card text-center text-sm p-4 mt-4 animate-fade-in-up ${
                msg.startsWith("Error") 
                  ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`} role="status" aria-live="polite">
                {msg}
              </div>
            )}
            {/* TODO: Add toast notifications for better UX */}
            {/* TODO: Add dark mode toggle and theme switcher */}
            {/* TODO: Add E2E and unit test scaffolding */}
            {/* TODO: Add lazy loading for BenefitsGrid if needed */}
          </form>
        </div>
      </div>
    </div>
  );
}
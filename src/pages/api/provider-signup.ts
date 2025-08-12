import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '../../lib/supabaseClient';
import { providerFormSchema } from '../../lib/providerValidation';
import { sanitizeInput } from '../../lib/sanitize';
import { captureError } from '../../lib/errorMonitoring';
import { sendTransactionalEmail } from '../../lib/sendEmail';

// Add type to globalThis for providerRateLimit
declare global {
  // eslint-disable-next-line no-var
  var providerRateLimit: Record<string, { count: number; start: number }> | undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getSupabase();
  // --- Simple in-memory rate limiting (per IP, resets on server restart) ---
  const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
  const RATE_LIMIT_MAX = 5; // max 5 requests per window
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  if (!globalThis.providerRateLimit) globalThis.providerRateLimit = {};
  const now = Date.now();
  const rl = globalThis.providerRateLimit[ip] || { count: 0, start: now };
  if (now - rl.start > RATE_LIMIT_WINDOW) {
    rl.count = 0; rl.start = now;
  }
  rl.count++;
  globalThis.providerRateLimit[ip] = rl;
  if (rl.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  // --- CAPTCHA verification (Google reCAPTCHA v2/v3) ---
  const captchaToken = req.body.captchaToken;
  if (!captchaToken) {
    return res.status(400).json({ error: "Missing CAPTCHA token." });
  }
  const captchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  try {
    const captchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaSecret}&response=${captchaToken}`, { method: 'POST' });
    const captchaData = (await captchaRes.json()) as { success: boolean };
    if (!captchaData.success) {
      return res.status(400).json({ error: "CAPTCHA verification failed." });
    }
  } catch (err) {
    await captureError(err, { ip, captchaToken });
    return res.status(500).json({ error: "CAPTCHA verification error." });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate and sanitize input
    const parsed = providerFormSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }
    const formData = parsed.data;
    const sanitized = {
      ...formData,
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone),
      business_name: sanitizeInput(formData.business_name ?? ''),
      location: sanitizeInput(formData.location),
      experience: sanitizeInput(formData.experience ?? ''),
      description: sanitizeInput(formData.description ?? ''),
    };

    // Insert into Supabase
    const { error } = await supabase.from('providers').insert([{
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      business_name: sanitized.business_name || sanitized.name,
      services: sanitized.services,
      location: sanitized.location,
      experience: sanitized.experience,
      description: sanitized.description,
      trust_score: 5.0
    }]);

    if (error) {
      await captureError(error, { sanitized });
      return res.status(500).json({ error: error.message });
    }

    // Send transactional email (provider confirmation)
    try {
      await sendTransactionalEmail({
        to: sanitized.email,
        subject: "BookLocal: Application Received",
        html: `<p>Hi ${sanitized.name},</p><p>Thank you for applying to join BookLocal as a service provider! Our team will review your application and get back to you within 24 hours.</p><p>Best,<br/>BookLocal Team</p>`
      });
    } catch (err) {
      await captureError(err, { email: sanitized.email });
      // Don't block success if email fails
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    await captureError(err, { reqBody: req.body });
    return res.status(500).json({ error: 'Unexpected error' });
  }
}

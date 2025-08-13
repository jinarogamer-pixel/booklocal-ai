# SaaS Foundation Checklist

- [x] Rate limiting middleware scaffolded (see `middleware.ts`)
- [x] Notification utility stub (see `src/utils/notify.ts`)
- [x] Monitoring/logging stub (see `src/utils/monitoring.ts`)
- [x] `.env.example` for environment variables
- [ ] Set up and test real rate limiting (Redis, upstash, or API gateway)
- [ ] Integrate and test notification service (SendGrid, Resend, Twilio, etc.)
- [ ] Integrate and test monitoring/logging (Sentry, Logflare, etc.)
- [ ] Store all secrets in environment variables (never hardcode)
- [ ] Enable and test automated backups in Supabase dashboard
- [ ] Document and test restore process

# 🚀 Production Environment Setup Checklist

## ✅ Environment Variables Required

### **Supabase (Database)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres.project:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### **Upstash Redis (Rate Limiting)**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### **NextAuth (Authentication)**
```bash
NEXTAUTH_SECRET=your-32-character-random-string
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Stripe (Payments)**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### **Sentry (Monitoring)**
```bash
NEXT_PUBLIC_SENTRY_PUBLIC_KEY=your-public-key
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

---

## 🔧 Production Setup Steps

### **1. Vercel Deployment** (5 minutes)
1. Connect GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Set production domain
4. Enable preview deployments

### **2. Database Production Setup** (5 minutes)
1. ✅ Migration already applied via GitHub Actions
2. Verify RLS policies are active
3. Test admin user creation
4. Backup strategy in place

### **3. Rate Limiting Production** (2 minutes)
1. Create Upstash production Redis database
2. Add credentials to Vercel environment variables
3. Test rate limiting on production

### **4. Monitoring & Alerts** (3 minutes)
1. Sentry error tracking configured
2. Uptime monitoring (optional: UptimeRobot)
3. Performance monitoring (Vercel Analytics)

---

## 🛡️ Security Checklist

- [x] **RLS enabled** on all sensitive tables
- [x] **Rate limiting** on all public API endpoints  
- [x] **HTTPS enforced** (Vercel default)
- [x] **Environment secrets** properly configured
- [ ] **CSP headers** configured (optional enhancement)
- [x] **Webhook signature verification** (Stripe)
- [x] **Input validation** on all forms
- [x] **SQL injection protection** (Supabase RLS)

---

## 📊 Performance Optimizations

- [x] **Database indexes** created for key queries
- [x] **Redis caching** for rate limiting
- [x] **Next.js optimizations** (static generation where possible)
- [ ] **CDN for assets** (Vercel handles this)
- [x] **Lazy loading** for charts and components

---

## 🧪 Testing Commands

```bash
# Test enterprise functions
./scripts/test-enterprise.sh

# Test API endpoints
curl -X GET https://your-domain.com/api/admin/metrics
curl -X POST https://your-domain.com/api/log-error

# Test rate limiting
for i in {1..15}; do curl -X POST https://your-domain.com/api/auth/signin; done
```

---

## 🎯 Go-Live Checklist

- [ ] All environment variables configured in Vercel
- [ ] Domain configured and SSL working
- [ ] Database migration applied and tested
- [ ] Rate limiting active with Upstash Redis
- [ ] Admin dashboard accessible at `/admin/dashboard`
- [ ] Error monitoring working (test with `/sentry-test-error`)
- [ ] Stripe webhooks configured with production endpoint
- [ ] Google OAuth configured with production domain
- [ ] Backup strategy documented
- [ ] Monitoring alerts configured

---

## 📈 Post-Launch Monitoring

1. **Monitor key metrics:**
   - API response times
   - Rate limit hits
   - Error rates
   - User conversion

2. **Regular maintenance:**
   - Review audit logs weekly
   - Check database performance
   - Update dependencies monthly
   - Security review quarterly

---

## 🆘 Troubleshooting

**Rate limiting not working?**
- Check UPSTASH_REDIS_REST_URL and TOKEN
- Verify Redis database is active
- Check logs for connection errors

**Admin dashboard showing errors?**
- Verify user has `admin` role in database
- Check NEXTAUTH configuration
- Ensure database connection is working

**Build failures?**
- Verify all required environment variables
- Check for TypeScript errors
- Ensure dependencies are installed

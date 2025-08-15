# 🚀 Production Deployment Guide for BookLocal AI

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup
All required environment variables are configured in `.env.local`. For production, you'll need to set these in your hosting platform:

```bash
# Supabase (Database & Real-time)
NEXT_PUBLIC_SUPABASE_URL=https://csofbjtknmxhbxyshmyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=https://52b3b3cb8aa92c224f1f331407400bbc@o4505838528086016.ingest.us.sentry.io/4509387729379329
SENTRY_DSN=https://52b3b3cb8aa92c224f1f331407400bbc@o4505838528086016.ingest.us.sentry.io/4509387729379329

# Stripe (Subscriptions)
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://loyal-sloth-19555.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### 2. Database Setup ✅ COMPLETED
- All tables created successfully
- Storage bucket configured
- Row-level security policies in place

### 3. Code Quality ✅ COMPLETED
- TypeScript compilation successful
- All Phase 2 features implemented
- Error handling and fallbacks in place

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Set Environment Variables in Vercel Dashboard**
   - Go to your Vercel project settings
   - Add all environment variables from above
   - Make sure to use `LIVE` keys for production

3. **Configure Stripe Webhooks**
   - Add webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`

### Option 2: Netlify

1. **Deploy via Git**
   ```bash
   # Build command
   npm run build
   
   # Publish directory
   .next
   ```

2. **Environment Variables**
   - Set in Netlify dashboard under Site Settings > Environment Variables

### Option 3: Self-Hosted (Docker)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Production Configuration

### Update Production URLs
Update your `.env.local` for production:

```bash
# Change localhost to your domain
NEXTAUTH_URL=https://yourdomain.com

# Use production Stripe keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Stripe Webhook Configuration
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/subscriptions/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Sentry Configuration
1. Go to Sentry Dashboard
2. Update allowed domains to include your production domain
3. Configure release tracking for better error monitoring

## 📊 Monitoring & Analytics

### Health Check Endpoints
Your app includes these monitoring endpoints:

- `/api/health` - Basic health check
- `/api/admin/metrics` - System metrics (requires authentication)

### Error Monitoring
- Sentry is configured for automatic error tracking
- Performance monitoring enabled
- User context capture active

### Business Analytics
- Custom analytics dashboard at `/analytics`
- Real-time metrics tracking
- Export functionality for reporting

## 🛡️ Security Checklist

### ✅ Implemented Security Features
- [x] Rate limiting on all API endpoints
- [x] Authentication with NextAuth
- [x] Row-level security in database
- [x] Input validation and sanitization
- [x] Secure file upload handling
- [x] HTTPS enforcement (via hosting platform)

### Additional Security Recommendations
1. **Enable CSP Headers**
2. **Configure CORS properly**
3. **Set up monitoring alerts**
4. **Regular security audits**

## 🚀 Deployment Commands

### Development to Production Workflow

1. **Test locally**
   ```bash
   npm run dev
   ```

2. **Build and test production build**
   ```bash
   npm run build
   npm start
   ```

3. **Deploy to production**
   ```bash
   # For Vercel
   vercel --prod
   
   # For Netlify
   netlify deploy --prod
   
   # For custom hosting
   docker build -t booklocal-ai .
   docker run -p 3000:3000 booklocal-ai
   ```

## 📈 Post-Deployment Verification

### 1. Functionality Tests
- [ ] User authentication works
- [ ] Chat system sends/receives messages
- [ ] File uploads work correctly
- [ ] Subscription checkout flows
- [ ] Analytics dashboard loads
- [ ] Error monitoring captures issues

### 2. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Real-time features respond instantly
- [ ] Database queries perform well under load
- [ ] API endpoints respond within SLA

### 3. Monitoring Setup
- [ ] Sentry receives error reports
- [ ] Analytics events are being tracked
- [ ] Rate limiting is active
- [ ] Uptime monitoring configured

## 🎉 Success Metrics

### Technical Metrics
- **Uptime**: 99.9%+
- **Page Load**: < 3 seconds
- **Error Rate**: < 0.1%
- **API Response**: < 500ms

### Business Metrics  
- **User Engagement**: Track via analytics dashboard
- **Subscription Conversion**: Monitor via Stripe
- **Support Tickets**: Reduced due to real-time chat
- **Revenue Growth**: Track via analytics

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check TypeScript errors
   - Verify all environment variables
   - Ensure dependencies are installed

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check database table creation
   - Test connection with service role key

3. **Stripe Webhooks Not Working**
   - Verify webhook URL is accessible
   - Check webhook secret matches
   - Test with Stripe CLI

4. **Chat Not Working**
   - Verify Supabase real-time is enabled
   - Check database policies
   - Test WebSocket connections

## 📞 Support

If you encounter any issues during deployment:

1. Check the logs in your hosting platform
2. Verify all environment variables are set correctly
3. Test individual components in development first
4. Use the built-in error monitoring via Sentry

## 🎯 Next Steps After Deployment

1. **Monitor Performance**: Use analytics dashboard
2. **Gather User Feedback**: Via real-time chat
3. **Scale Infrastructure**: Based on usage metrics
4. **Add Features**: Using the modular architecture

---

**Your BookLocal AI platform is now ready for production! 🚀**

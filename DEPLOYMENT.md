# TiKiT OS Deployment Guide

## Overview
This guide covers deploying the TiKiT OS web application to production. The application is built with Next.js 15 and requires specific configuration for deployment.

---

## Prerequisites

### Required Services
1. **Supabase Account** (Database & Auth)
   - Sign up at https://app.supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Google Gemini API** (AI Features)
   - Get API key from https://makersuite.google.com/app/apikey
   - Free tier: 1,500 requests/day

3. **Hosting Platform** (Choose one)
   - Vercel (Recommended - seamless Next.js integration)
   - Netlify
   - AWS/GCP/Azure
   - Self-hosted (Docker)

### Required Tools
- Node.js 20+ 
- pnpm 8+
- Git

---

## Environment Configuration

### 1. Database Setup (Supabase)

#### Create Supabase Project
```bash
# 1. Go to https://app.supabase.com
# 2. Click "New Project"
# 3. Fill in project details:
#    - Name: tikit-os-production
#    - Database Password: (generate strong password)
#    - Region: (choose closest to users)
#    - Pricing Plan: (Free tier for testing, Pro for production)

# 4. Wait for project to provision (~2 minutes)
```

#### Run Database Migrations
```bash
# Option A: Using Supabase CLI (recommended)
cd PrecisionFlow-by-AK
supabase link --project-ref your-project-ref
supabase db push

# Option B: Manual SQL execution
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Run migration files from supabase/migrations/ in order
```

#### Get API Keys
```bash
# In Supabase Dashboard:
# Settings > API > Project URL
# Settings > API > Project API keys
#   - anon/public key (safe for client)
#   - service_role key (server-side only, keep secret!)
```

### 2. Configure Environment Variables

#### Production Environment
Create environment variables in your hosting platform:

```bash
# === REQUIRED: Supabase Configuration ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your_service_role_key

# === REQUIRED: AI Configuration ===
GOOGLE_GEMINI_API_KEY=AIza...your_gemini_api_key

# === REQUIRED: Application URLs ===
NEXT_PUBLIC_APP_URL=https://your-domain.com

# === OPTIONAL: Monitoring & Analytics ===
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
# SENTRY_DSN=
# SENTRY_AUTH_TOKEN=
```

#### Vercel Deployment
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Configure project
vercel link

# 4. Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_GEMINI_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# 5. Deploy
vercel --prod
```

---

## Build & Deployment

### Method 1: Vercel (Recommended)

#### Automatic Deployment
```bash
# 1. Connect GitHub repository to Vercel
# - Go to https://vercel.com/new
# - Import your repository
# - Configure build settings:
#   - Framework Preset: Next.js
#   - Root Directory: ./
#   - Build Command: pnpm build --filter=web
#   - Output Directory: apps/web/.next
#   - Install Command: pnpm install --no-frozen-lockfile

# 2. Add environment variables (see above)

# 3. Deploy
# - Vercel auto-deploys on push to main
# - Preview deployments for PRs
```

### Method 2: Docker Deployment

#### Build Docker Image
```bash
# 1. Build the image
docker build -t tikit-os-web:latest -f apps/web/Dockerfile .

# 2. Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e GOOGLE_GEMINI_API_KEY=your_key \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  tikit-os-web:latest

# 3. Or use docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Method 3: Manual Deployment

#### Build for Production
```bash
# 1. Install dependencies
cd PrecisionFlow-by-AK
pnpm install --no-frozen-lockfile

# 2. Build web app
pnpm build:web

# 3. Start production server
cd apps/web
pnpm start

# Server runs on http://localhost:3000
# Use nginx or similar as reverse proxy
```

---

## Post-Deployment Verification

### 1. Health Checks
```bash
# Check if app is running
curl https://your-domain.com

# Check API endpoint
curl https://your-domain.com/api/trpc/campaigns.list

# Expected: 200 OK or authentication required
```

### 2. Database Connectivity
```bash
# Test Supabase connection
# 1. Login to your app
# 2. Try creating a campaign
# 3. Check Supabase Dashboard > Table Editor for new records
```

### 3. Monitor Logs
```bash
# Vercel
vercel logs --prod

# Docker
docker logs tikit-os-web

# Manual
tail -f logs/production.log
```

---

## Performance Optimization

### 1. Enable Caching
```javascript
// next.config.js - Already configured
module.exports = {
  // ... existing config
  images: {
    domains: ['your-project-id.supabase.co'],
  },
};
```

### 2. CDN Configuration
- Vercel automatically provides CDN
- For custom hosting: use Cloudflare or similar

### 3. Database Optimization
```sql
-- Add indexes for common queries (already in migrations)
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_approvals_status ON approvals(status, approver_id);
```

---

## Security Checklist

- [ ] Environment variables set correctly
- [ ] Service role key is server-side only (never exposed to client)
- [ ] Supabase RLS (Row Level Security) policies enabled
- [ ] HTTPS enforced
- [ ] API rate limiting configured
- [ ] CORS configured appropriately
- [ ] Authentication working
- [ ] Sensitive data encrypted at rest

---

## Monitoring & Maintenance

### Error Tracking (Recommended: Sentry)
```bash
# 1. Sign up at https://sentry.io
# 2. Create new project for Next.js
# 3. Add to environment variables:
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_auth_token

# 4. Errors will auto-report to Sentry
```

### Application Monitoring
- Use Vercel Analytics (free with Vercel)
- Or configure Google Analytics
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Database Backups
```bash
# Supabase automatically backs up database
# Additional manual backup:
# Dashboard > Database > Backup > Create Backup

# Or use pg_dump via CLI
supabase db dump > backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Build Failures

#### TypeScript Errors
```bash
# The build is configured to skip TypeScript checking
# This is intentional to speed up builds
# TypeScript is checked separately via:
pnpm typecheck

# If you want strict checking during build:
# 1. Edit apps/web/next.config.js
# 2. Remove: typescript: { ignoreBuildErrors: true }
```

#### Module Not Found
```bash
# Ensure all workspace packages are built:
pnpm build --filter=@tikit/api
pnpm build --filter=@tikit/database
pnpm build --filter=@tikit/types

# Or clear cache:
rm -rf .next node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile
pnpm build
```

### Runtime Errors

#### Cannot Connect to Database
```bash
# Verify environment variables are set:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check Supabase project is active:
# Dashboard > Settings > General > Project Status

# Verify network/firewall allows connections
```

#### Authentication Not Working
```bash
# Check Supabase Auth settings:
# Dashboard > Authentication > Providers
# Enable Email provider
# Configure redirect URLs

# Verify JWT secret is configured
```

### Performance Issues

#### Slow Page Loads
```bash
# Check database query performance:
# Dashboard > Database > Query Performance

# Add missing indexes
# Optimize Supabase queries (use .select() wisely)

# Enable Next.js caching:
# Use ISR (Incremental Static Regeneration) where possible
```

---

## Rollback Procedure

### Quick Rollback (Vercel)
```bash
# 1. Go to Vercel Dashboard > Deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"

# Or via CLI:
vercel rollback
```

### Manual Rollback
```bash
# 1. Checkout previous version
git checkout <previous-commit-hash>

# 2. Deploy
pnpm build:web
pnpm start

# 3. Or redeploy via CI/CD
```

### Database Rollback
```bash
# 1. Restore from backup
supabase db reset

# 2. Or restore specific backup:
# Dashboard > Database > Backups > Restore
```

---

## Scaling Considerations

### Horizontal Scaling
- Vercel automatically scales
- For self-hosted: use load balancer (nginx, HAProxy)
- Scale Supabase: upgrade to Pro/Team plan

### Database Scaling
- Supabase connection pooling (enabled by default)
- Use read replicas for heavy read loads
- Implement caching layer (Redis/Vercel Edge Cache)

### Cost Optimization
```bash
# Monitor usage:
# - Supabase Dashboard > Settings > Usage
# - Vercel Dashboard > Analytics > Usage

# Free tier limits:
# - Supabase: 500MB database, 1GB file storage, 2GB bandwidth
# - Vercel: 100GB bandwidth, 100 hours serverless
# - Gemini API: 1,500 requests/day

# Upgrade when:
# - Approaching limits
# - Need better performance
# - Require SLA/support
```

---

## Support & Documentation

### Internal Documentation
- [Architecture](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./API_SPEC.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### External Resources
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- tRPC: https://trpc.io/docs
- Vercel: https://vercel.com/docs

### Getting Help
- GitHub Issues: Report bugs and feature requests
- Internal Team: Slack channel #tikit-os-support

---

## Checklist: Pre-Launch

### Infrastructure
- [ ] Supabase project created and configured
- [ ] Database migrations run
- [ ] RLS policies enabled and tested
- [ ] Environment variables set
- [ ] Domain configured (DNS/SSL)

### Application
- [ ] Production build succeeds
- [ ] Application starts without errors
- [ ] All critical pages load
- [ ] Authentication works
- [ ] API endpoints respond correctly

### Security
- [ ] HTTPS enforced
- [ ] API keys secured
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring set up
- [ ] Analytics configured
- [ ] Logging enabled
- [ ] Alerts configured

### Performance
- [ ] Page load times < 3s
- [ ] Lighthouse score > 80
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] CDN configured

### Documentation
- [ ] Deployment guide reviewed
- [ ] Runbooks created
- [ ] Team trained
- [ ] Emergency contacts documented
- [ ] Rollback procedure tested

---

*Last updated: February 8, 2026*

# 🚀 TiKiT OS - Deployment Guide

**Complete deployment checklist for TiKiT OS**  
**Last Updated:** February 2026

---

## 📋 Pre-Deployment Checklist

Before deploying TiKiT OS, ensure you have completed:

- [ ] **Supabase Account** - Created and verified
- [ ] **Vercel Account** - Created and verified (for web deployment)
- [ ] **GitHub Repository** - Code pushed to repository
- [ ] **Google Gemini API Key** - Obtained from Google AI Studio
- [ ] **Environment Variables** - Configured (see below)
- [ ] **Database Migrations** - Reviewed and tested locally
- [ ] **Storage Buckets** - Configuration verified

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** `tikit-os-production` (or your preferred name)
   - **Database Password:** Generate a strong password (save it securely)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is sufficient for MVP
4. Click "Create new project"
5. Wait for project to finish setting up (~2 minutes)

### Step 2: Get API Credentials

1. Go to **Settings** > **API**
2. Copy the following values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (starts with eyJ)
   - **service_role key:** `eyJhbGc...` (KEEP THIS SECRET!)
3. Save these values - you'll need them for environment variables

### Step 3: Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Verify migrations
supabase db diff
```

#### Option B: Using Supabase Dashboard

1. Go to **Database** > **SQL Editor**
2. Run each migration file in order:
   - `20260207000000_initial_setup.sql`
   - `20260207000001_core_tables.sql`
   - `20260207000002_campaign_data_tables.sql`
   - `20260207000003_rls_policies.sql`
   - `20260207000004_audit_triggers.sql`
   - `20260207000005_storage_buckets.sql`
3. Verify no errors in the output

### Step 4: Verify Database Setup

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- `users`
- `clients`
- `campaigns`
- `campaign_members`
- `influencers`
- `campaign_influencers`
- `briefs`
- `strategies`
- `content_tasks`
- `content_artifacts`
- `approvals`
- `financial_objects`
- `risk_flags`
- `audit_logs`

### Step 5: Configure Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Verify the following buckets exist:
   - `briefs` (Private)
   - `content` (Private)
   - `contracts` (Private)
   - `invoices` (Private)
   - `avatars` (Public)
3. Check bucket policies are applied correctly

### Step 6: Configure Authentication

1. Go to **Authentication** > **Settings**
2. Configure settings:
   - **Site URL:** `https://your-domain.com` (or `http://localhost:3000` for development)
   - **Redirect URLs:** Add your deployment URLs
3. Enable email provider:
   - Go to **Authentication** > **Providers**
   - Enable **Email** provider
   - Configure email templates (optional)
4. (Optional) Enable OAuth providers:
   - Google, GitHub, etc.

---

## 🌐 Vercel Deployment (Web App)

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `cabdelkhalegh/PrecisionFlow-by-AK`
4. Select the repository

### Step 2: Configure Build Settings

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web` (if using monorepo) or `.` (if single app)
- **Build Command:** `pnpm build` (or `npm run build`)
- **Output Directory:** `.next`
- **Install Command:** `pnpm install` (or `npm install`)

### Step 3: Add Environment Variables

In Vercel dashboard, go to **Settings** > **Environment Variables** and add:

#### Production Environment Variables

```bash
# Supabase (Public - safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase (Server-only - NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google Gemini API (Server-only)
GEMINI_API_KEY=your-gemini-api-key

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api/trpc

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REALTIME=true
```

**Important:** 
- Set environment for: **Production**, **Preview**, and **Development**
- Click "Add" for each variable
- Verify SUPABASE_SERVICE_ROLE_KEY is NOT prefixed with `NEXT_PUBLIC_`

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete (~2-5 minutes)
3. Verify deployment at the provided URL
4. Test key features:
   - User can sign up / login
   - Dashboard loads
   - Database connection works

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## 📱 Mobile App Deployment (Expo)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

```bash
cd apps/mobile
eas build:configure
```

### Step 4: Set Environment Variables

Create `apps/mobile/.env.production`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_API_URL=https://your-domain.vercel.app/api/trpc
```

**Note:** Never include `SUPABASE_SERVICE_ROLE_KEY` in mobile env

### Step 5: Build for iOS and Android

```bash
# Build for both platforms
eas build --platform all --profile production

# Or build individually
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Step 6: Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

### Step 7: Set Up OTA Updates

```bash
# Create update branch
eas update:configure

# Publish update
eas update --branch production --message "Initial release"
```

---

## 🔧 Post-Deployment Verification

### Database Verification

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show 't' for rowsecurity

-- Check storage buckets
SELECT * FROM storage.buckets;
-- Should show 5 buckets

-- Check audit trigger
SELECT * FROM audit_logs LIMIT 5;
```

### API Verification

Test these endpoints:

1. **Health Check:** `GET /api/health`
2. **Auth:** `POST /auth/v1/signup`
3. **tRPC:** `GET /api/trpc/campaigns.list`

### Storage Verification

1. Upload a test file to each bucket
2. Verify access permissions work
3. Test download URLs

### Real-time Verification

1. Open two browser windows
2. Update a campaign in one window
3. Verify real-time update in other window

---

## 🔐 Security Checklist

Before going live, verify:

- [ ] RLS policies enabled on all tables
- [ ] Service role key NOT exposed in client code
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CORS configured correctly
- [ ] Rate limiting configured (Vercel + Supabase)
- [ ] API keys stored as environment variables
- [ ] Storage bucket policies tested
- [ ] Audit logging working
- [ ] Password requirements enforced
- [ ] MFA available for admin users

---

## 📊 Monitoring Setup

### Vercel Analytics

1. Go to Vercel dashboard > **Analytics**
2. Enable Web Analytics
3. Review performance metrics

### Sentry (Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create new project for Next.js
3. Add Sentry DSN to environment variables:
   ```bash
   SENTRY_DSN=your-sentry-dsn
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```
4. Install Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   ```

### Supabase Monitoring

1. Go to Supabase dashboard > **Database**
2. Monitor:
   - Connection pool usage
   - Query performance
   - Storage usage
3. Set up alerts for critical thresholds

---

## 🔄 Continuous Deployment

### GitHub Actions (Automatic)

Vercel automatically deploys on:
- **Main branch push** → Production deployment
- **Pull request** → Preview deployment

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 📈 Scaling Considerations

### When to Upgrade from Free Tier

**Supabase Free Tier Limits:**
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- 500K edge function invocations/month

**Upgrade to Supabase Pro ($25/month) when:**
- Database exceeds 400MB
- Need more than 1GB file storage
- Require daily backups
- Need more than 50K database rows

**Vercel Free Tier Limits:**
- 100GB bandwidth/month
- Unlimited requests (fair use)

**Upgrade to Vercel Pro ($20/month) when:**
- Need more bandwidth
- Require team collaboration
- Need advanced analytics

---

## 🆘 Troubleshooting

### Migration Errors

**Error: "relation already exists"**
- Solution: Check if migrations were partially run
- Fix: Drop and recreate, or skip to next migration

**Error: "permission denied"**
- Solution: Verify you're running as database owner
- Fix: Use service role key or postgres role

### Connection Errors

**Error: "Failed to connect to database"**
- Check Supabase project is running
- Verify credentials in environment variables
- Check network/firewall settings

### Storage Upload Errors

**Error: "Permission denied"**
- Check RLS policies on storage.objects
- Verify user is authenticated
- Check bucket name is correct

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [tRPC Deployment](https://trpc.io/docs/deployment)

---

## ✅ Deployment Completion Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations run successfully
- [ ] Storage buckets created with policies
- [ ] Authentication configured
- [ ] Vercel project deployed
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)
- [ ] Mobile app built and submitted
- [ ] Monitoring tools configured
- [ ] Security checklist completed
- [ ] API endpoints tested
- [ ] Real-time features verified
- [ ] Backup strategy in place
- [ ] Documentation updated

---

**Need Help?**  
Contact: dev-team@tikit-os.com  
Documentation: [Project Wiki](https://github.com/cabdelkhalegh/PrecisionFlow-by-AK/wiki)

**Last Updated:** February 2026

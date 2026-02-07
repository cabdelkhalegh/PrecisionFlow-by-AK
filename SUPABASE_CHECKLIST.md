# ✅ Supabase Deployment Checklist for TiKiT OS

Use this checklist to ensure your Supabase setup is complete and ready for deployment.

---

## 📋 Pre-Deployment Checklist

### 1. Supabase Project Setup

- [ ] **Supabase account created** at [app.supabase.com](https://app.supabase.com)
- [ ] **Project created** with appropriate name and region
- [ ] **Database password** saved securely
- [ ] **Project URL** copied from Settings > API
- [ ] **Anon key** copied from Settings > API
- [ ] **Service role key** copied and stored securely

### 2. Local Development Setup

- [ ] **Supabase CLI installed**: `npm install -g supabase`
- [ ] **Logged in to Supabase**: `supabase login`
- [ ] **Project linked**: `supabase link --project-ref YOUR_PROJECT_REF`
- [ ] **Local Supabase started** (if using local dev): `supabase start`

### 3. Database Migrations

- [ ] **Migration files exist** in `supabase/migrations/`:
  - [ ] `20260207000000_initial_setup.sql` (Extensions and enums)
  - [ ] `20260207000001_core_tables.sql` (Users, clients, campaigns)
  - [ ] `20260207000002_campaign_data_tables.sql` (Briefs, content, approvals)
  - [ ] `20260207000003_rls_policies.sql` (Row Level Security)
  - [ ] `20260207000004_audit_triggers.sql` (Audit logging)
  - [ ] `20260207000005_storage_buckets.sql` (Storage configuration)

- [ ] **Migrations applied**: `supabase db push`
- [ ] **No migration errors** in output
- [ ] **Tables verified** in Supabase dashboard > Database > Tables

### 4. Database Schema Verification

Run these queries in SQL Editor to verify:

```sql
-- Check all tables exist (should return 14 tables)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show 't' for rowsecurity

-- Check storage buckets (should return 5 buckets)
SELECT COUNT(*) FROM storage.buckets;
```

- [ ] **14 core tables** created
- [ ] **RLS enabled** on all tables
- [ ] **5 storage buckets** created
- [ ] **Extensions enabled** (uuid-ossp, pgcrypto, pg_trgm, btree_gin)
- [ ] **Enums created** (check with `\dT` in psql)
- [ ] **Triggers created** (check with `\dy` in psql)

### 5. Storage Buckets

Verify in Dashboard > Storage:

- [ ] **Briefs bucket** created (Private, 50MB limit)
- [ ] **Content bucket** created (Private, 500MB limit)
- [ ] **Contracts bucket** created (Private, 10MB limit)
- [ ] **Invoices bucket** created (Private, 10MB limit)
- [ ] **Avatars bucket** created (Public, 2MB limit)
- [ ] **Storage policies** applied (check in Policies tab)

### 6. Authentication Configuration

In Dashboard > Authentication > Settings:

- [ ] **Site URL** configured (your domain or localhost:3000)
- [ ] **Redirect URLs** added (all deployment URLs)
- [ ] **Email provider** enabled
- [ ] **Email templates** customized (optional)
- [ ] **OAuth providers** configured (optional):
  - [ ] Google OAuth
  - [ ] GitHub OAuth
- [ ] **MFA** enabled for admin users (optional)

### 7. Environment Variables

#### Production (.env.local or Vercel)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only!)
- [ ] `GEMINI_API_KEY` set (for AI features)
- [ ] `NEXT_PUBLIC_APP_URL` set
- [ ] `NEXT_PUBLIC_API_URL` set
- [ ] Feature flags set (`NEXT_PUBLIC_ENABLE_*`)

#### Mobile App (.env.local in apps/mobile)

- [ ] `EXPO_PUBLIC_SUPABASE_URL` set
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `EXPO_PUBLIC_API_URL` set
- [ ] **NO service role key** in mobile env (security!)

### 8. Security Verification

- [ ] **Service role key NOT in client code**
- [ ] **Service role key NOT in NEXT_PUBLIC_* variables**
- [ ] **All tables have RLS enabled**
- [ ] **Storage buckets have policies**
- [ ] **No public access to sensitive data**
- [ ] **Audit logging working** (insert test record, check audit_logs)
- [ ] **Password requirements** configured
- [ ] **Rate limiting** configured (Supabase default)

### 9. Functional Testing

#### Authentication Tests

- [ ] User can sign up with email
- [ ] User receives confirmation email (if enabled)
- [ ] User can log in
- [ ] User can reset password
- [ ] OAuth login works (if configured)
- [ ] Session persists correctly
- [ ] Logout works

#### Database Tests

- [ ] Can create a campaign
- [ ] Can view campaigns (with proper permissions)
- [ ] Can update campaign (with proper permissions)
- [ ] Cannot access other users' data
- [ ] Audit log captures changes
- [ ] Triggers work (risk score, budget updates)

#### Storage Tests

- [ ] Can upload file to briefs bucket
- [ ] Can download uploaded file
- [ ] Cannot access without permission
- [ ] File size limits enforced
- [ ] MIME type restrictions work
- [ ] Public bucket (avatars) is publicly accessible

#### Real-time Tests

- [ ] Real-time subscription works
- [ ] Changes propagate to all clients
- [ ] Subscription cleanup works on disconnect

### 10. Performance & Optimization

- [ ] **Indexes created** on frequently queried columns
- [ ] **Connection pooling** configured (PgBouncer via Supabase)
- [ ] **Query performance** tested (use EXPLAIN ANALYZE)
- [ ] **No N+1 queries** in critical paths
- [ ] **Materialized views** created for complex queries (optional)

### 11. Monitoring & Observability

- [ ] **Database monitoring** enabled in Supabase dashboard
- [ ] **Query performance** tracking configured
- [ ] **Error tracking** set up (Sentry)
- [ ] **Alerts** configured for:
  - [ ] High CPU usage
  - [ ] High memory usage
  - [ ] Storage limits
  - [ ] Connection pool exhaustion
- [ ] **Backup schedule** verified (daily automatic backups on Supabase)

### 12. Documentation

- [ ] **DEPLOYMENT.md** updated with project-specific details
- [ ] **Environment variables** documented
- [ ] **API endpoints** documented
- [ ] **Database schema** documented
- [ ] **RLS policies** documented
- [ ] **Setup scripts** tested and working

### 13. Backup & Recovery

- [ ] **Automatic daily backups** enabled (Supabase Pro)
- [ ] **Backup retention** configured
- [ ] **Point-in-time recovery** available (Supabase Pro)
- [ ] **Disaster recovery plan** documented
- [ ] **Database export** tested
- [ ] **Restore procedure** tested

### 14. Production Deployment

#### Vercel Deployment

- [ ] **GitHub repo** connected to Vercel
- [ ] **Environment variables** set in Vercel dashboard
- [ ] **Build settings** configured
- [ ] **Preview deployments** working
- [ ] **Production deployment** successful
- [ ] **Custom domain** configured (optional)
- [ ] **SSL certificate** active

#### Mobile Deployment

- [ ] **EAS Build** configured
- [ ] **Environment variables** set for production
- [ ] **iOS build** successful
- [ ] **Android build** successful
- [ ] **App Store** submission (if ready)
- [ ] **Google Play Store** submission (if ready)
- [ ] **OTA updates** configured

### 15. Post-Deployment Verification

- [ ] **Health check endpoint** working
- [ ] **Authentication** working in production
- [ ] **Database queries** working
- [ ] **File uploads** working
- [ ] **Real-time features** working
- [ ] **AI features** working (if enabled)
- [ ] **No console errors** in browser
- [ ] **No server errors** in logs
- [ ] **Performance metrics** acceptable:
  - [ ] Page load < 2s
  - [ ] API response < 500ms
  - [ ] Database queries < 100ms

### 16. Scaling Readiness

- [ ] **Connection pooling** configured
- [ ] **Database indexes** optimized
- [ ] **Caching strategy** implemented
- [ ] **CDN** configured for static assets
- [ ] **Rate limiting** in place
- [ ] **Upgrade path** from free tier documented

---

## 🚨 Critical Security Reminders

- ⚠️ **NEVER** commit `.env.local` to Git
- ⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to client code
- ⚠️ **NEVER** use service role key in mobile apps
- ⚠️ **ALWAYS** use RLS for data access control
- ⚠️ **ALWAYS** validate user input
- ⚠️ **ALWAYS** use prepared statements (automatic with Supabase)

---

## 📊 Success Metrics

Track these metrics after deployment:

- **Uptime**: Target 99.9%
- **API Response Time**: P95 < 500ms
- **Database Query Time**: P95 < 100ms
- **Error Rate**: < 0.1%
- **User Signup Success Rate**: > 95%
- **File Upload Success Rate**: > 98%

---

## 🎉 Deployment Complete!

Once all items are checked:

1. ✅ Mark deployment as complete
2. 📝 Document any deviations from checklist
3. 🔍 Monitor for first 48 hours
4. 📊 Review metrics after 1 week
5. 🔄 Schedule regular security audits

---

**Checklist Version:** 1.0  
**Last Updated:** February 2026  
**Next Review:** After Phase 1 MVP Completion

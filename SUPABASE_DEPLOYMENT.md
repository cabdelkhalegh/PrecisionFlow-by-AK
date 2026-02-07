# Supabase Deployment Guide

This guide provides step-by-step instructions for deploying the TiKiT OS database to Supabase.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Method 1: Automated Deployment (Recommended)](#method-1-automated-deployment-recommended)
3. [Method 2: Manual Deployment](#method-2-manual-deployment)
4. [Method 3: Local Development Setup](#method-3-local-development-setup)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Database Schema Overview](#database-schema-overview)

---

## Prerequisites

### 1. Supabase Account
- Create a free account at [supabase.com](https://supabase.com)
- Verify your email address

### 2. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux/WSL:**
```bash
brew install supabase/tap/supabase
# OR using npm
npm install -g supabase
```

**Windows:**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verify installation:**
```bash
supabase --version
```

### 3. Install Git (if not already installed)
```bash
git --version
```

---

## Method 1: Automated Deployment (Recommended)

### Step 1: Run the Deployment Script

```bash
# Make sure you're in the project root
cd /path/to/PrecisionFlow-by-AK

# Make the script executable (first time only)
chmod +x scripts/deploy-supabase.sh

# Run the deployment script
./scripts/deploy-supabase.sh
```

The script will:
1. ✅ Check for Supabase CLI installation
2. ✅ Prompt you to log in to Supabase
3. ✅ Guide you through project creation/linking
4. ✅ Deploy database migrations
5. ✅ Set up environment variables
6. ✅ Verify the deployment

### Step 2: Follow the Script Prompts

The script will ask you to:
- Log in to Supabase (opens browser)
- Choose or create a project
- Confirm deployment settings

### Step 3: Update Environment Variables

Copy the generated credentials to your `.env.local` file:

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual Supabase credentials
```

---

## Method 2: Manual Deployment

### Step 1: Log in to Supabase CLI

```bash
supabase login
```

This will open your browser for authentication.

### Step 2: Create a New Supabase Project

**Option A: Via Supabase Dashboard**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `tikit-os` (or your preferred name)
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

**Option B: Via CLI**
```bash
supabase projects create tikit-os --region us-east-1
```

### Step 3: Link Your Local Project

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your cloud project
supabase link --project-ref your-project-ref
```

To find your project ref:
1. Go to your project in Supabase Dashboard
2. Click "Settings" → "General"
3. Copy the "Reference ID"

### Step 4: Deploy the Migration

```bash
# Deploy the database migration
supabase db push

# Alternative: Run migration directly
supabase db push --file supabase/migrations/20260207000000_initial_schema.sql
```

### Step 5: Get Your API Credentials

```bash
# Get project details
supabase status

# Or from the dashboard:
# Settings → API → Project URL and API Keys
```

You'll need:
- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: Public key for client-side use
- **Service Role Key**: Secret key for server-side use (⚠️ Keep secret!)

### Step 6: Configure Environment Variables

Create or update `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Gemini API (optional for now)
GEMINI_API_KEY=your-gemini-api-key-here

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

**⚠️ Important:** Never commit `.env.local` to version control!

---

## Method 3: Local Development Setup

For local development without cloud deployment:

### Step 1: Start Local Supabase

```bash
# Start all Supabase services locally
supabase start
```

This will start:
- PostgreSQL database
- Supabase Studio (UI)
- Auth server
- Storage server
- Realtime server

### Step 2: Access Local Services

Once started, you'll see:
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54324
Inbucket URL: http://localhost:54325
```

### Step 3: Configure Local Environment

```bash
# Copy the example file
cp .env.local.example .env.local

# Update with local credentials
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

Local keys are displayed when you run `supabase start`.

### Step 4: Apply Migrations

```bash
# Reset and apply migrations
supabase db reset

# Or apply specific migration
supabase migration up
```

### Step 5: Access Supabase Studio

Open http://localhost:54324 in your browser to:
- View tables and data
- Run SQL queries
- Test authentication
- Manage storage

### Step 6: Stop Local Services

```bash
# Stop all services
supabase stop

# Stop and remove data
supabase stop --no-backup
```

---

## Post-Deployment Verification

### 1. Verify Database Tables

```bash
# List all tables
supabase db diff

# Or use psql
supabase db connect
# Then run: \dt
```

Expected tables:
- `users`
- `clients`
- `campaigns`
- `campaign_members`
- `audit_logs`

### 2. Verify RLS Policies

In Supabase Dashboard:
1. Go to "Authentication" → "Policies"
2. Check that all tables have RLS enabled
3. Verify policies exist for each table

Or via SQL:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Test Database Connection

Run the verification script:
```bash
./scripts/verify-supabase.sh
```

Or test manually:
```bash
# Test connection
curl https://your-project-ref.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### 4. Test Application Connection

```bash
# Start the development server
pnpm dev:web

# Visit http://localhost:3000
# Check browser console for Supabase connection errors
```

---

## Troubleshooting

### Issue: "supabase: command not found"

**Solution:**
```bash
# Reinstall Supabase CLI
npm install -g supabase

# Or with brew
brew install supabase/tap/supabase

# Verify installation
which supabase
```

### Issue: "Failed to connect to Supabase"

**Check:**
1. Is your internet connection working?
2. Is the Supabase project running? (Check dashboard)
3. Are your API keys correct in `.env.local`?
4. Did you restart your dev server after changing `.env.local`?

**Solution:**
```bash
# Verify environment variables
cat .env.local

# Test connection
curl https://your-project-ref.supabase.co/rest/v1/

# Restart dev server
pnpm dev:web
```

### Issue: "Migration failed"

**Common causes:**
- Syntax error in SQL
- Table already exists
- Permission issues

**Solution:**
```bash
# Check migration status
supabase migration list

# View migration details
cat supabase/migrations/20260207000000_initial_schema.sql

# Reset database (⚠️ deletes all data!)
supabase db reset

# Reapply migration
supabase db push
```

### Issue: "RLS policies blocking queries"

**Check:**
1. Are you authenticated?
2. Does the policy allow your user role?
3. Are you a member of the campaign?

**Solution:**
```sql
-- Temporarily disable RLS for testing (⚠️ development only!)
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Check your user's role
SELECT role FROM users WHERE id = auth.uid();

-- Check campaign membership
SELECT * FROM campaign_members WHERE user_id = auth.uid();
```

### Issue: "Cannot read property of null (reading 'supabase')"

**Solution:**
```bash
# Ensure environment variables are set
cat .env.local | grep SUPABASE

# Restart Next.js server
pnpm dev:web

# Clear Next.js cache
rm -rf .next/
pnpm dev:web
```

### Issue: "Database migrations out of sync"

**Solution:**
```bash
# Check migration status
supabase migration list

# Repair migrations
supabase migration repair --status applied

# Or reset and reapply
supabase db reset
```

---

## Database Schema Overview

### Core Tables

1. **users** - Extends Supabase auth with custom fields
   - Roles: campaign_manager, director, finance, admin, client, influencer
   - Status: active, inactive, suspended

2. **clients** - Client organizations and contacts
   - Contact information
   - Address and metadata

3. **campaigns** (ROOT ENTITY)
   - Campaign details and lifecycle
   - Status: 11 states (draft → closed)
   - Risk levels: low, medium, high, critical
   - Financial tracking
   - Timeline management

4. **campaign_members** - User-campaign relationships
   - Team assignments
   - Roles and permissions

5. **audit_logs** - Immutable audit trail
   - All INSERT/UPDATE/DELETE operations
   - User context and timestamps

### Key Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic `updated_at` timestamps
- ✅ Soft deletes (`deleted_at` column)
- ✅ Audit logging via triggers
- ✅ UUID primary keys
- ✅ JSONB for flexible metadata
- ✅ Campaign-centric design

### Enums

- `campaign_status`: 11 states for campaign lifecycle
- `risk_level`: low, medium, high, critical
- `user_role`: 6 roles with different permissions
- `user_status`: active, inactive, suspended
- `approval_status`: pending, approved, rejected, revisions_requested

---

## Next Steps

After successful deployment:

1. **Create your first user**
   ```bash
   # Via Supabase Dashboard
   # Go to Authentication → Users → Add User
   ```

2. **Create sample data**
   ```sql
   -- Create a client
   INSERT INTO clients (name, email, company)
   VALUES ('ACME Corp', 'contact@acme.com', 'ACME Corporation');

   -- Create a campaign
   INSERT INTO campaigns (name, client_id, created_by, budget_amount)
   VALUES ('Summer Campaign', '<client-id>', '<user-id>', 50000);
   ```

3. **Test the application**
   ```bash
   pnpm dev:web
   # Visit http://localhost:3000/campaigns
   ```

4. **Set up CI/CD** (optional)
   - Configure GitHub Actions
   - Automate migrations on deploy
   - See `.github/workflows/` for examples

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review Supabase logs in the dashboard
3. Check application logs (`pnpm dev:web`)
4. Consult Supabase documentation
5. Open an issue in the repository

---

**Last Updated:** February 7, 2026  
**Version:** 1.0  
**Supabase Version:** Compatible with Supabase CLI v1.x

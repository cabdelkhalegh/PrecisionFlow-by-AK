# 🚀 Phase 1 Setup Guide - Backend Infrastructure

**TiKiT OS - Campaign Execution & Intelligence**  
**Date:** February 7, 2026  
**Status:** Phase 1 Complete - Ready for Deployment

---

## 📋 Overview

This guide walks you through setting up the Phase 1 backend infrastructure for TiKiT OS, including:
- Supabase project creation
- Database migrations
- Environment configuration
- API testing

---

## ✅ Prerequisites

Before starting, ensure you have:

- [x] Node.js 20+ installed
- [x] pnpm 8+ installed (`npm install -g pnpm`)
- [x] Supabase account (sign up at [supabase.com](https://supabase.com))
- [x] Repository cloned locally

---

## 🔧 Step 1: Create Supabase Project

### 1.1 Sign up / Log in to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in with GitHub
3. Accept the free tier

### 1.2 Create New Project

1. Click **"New Project"**
2. Fill in project details:
   - **Organization:** Select or create one
   - **Project Name:** `tikit-os` (or your preference)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier

3. Click **"Create new project"**
4. Wait ~2 minutes for project to initialize

### 1.3 Get Project Credentials

Once the project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ keep this secret!)

---

## 🔐 Step 2: Configure Environment Variables

### 2.1 Create `.env.local` file

In the project root, create `.env.local`:

```bash
cp .env.example .env.local
```

### 2.2 Add Your Supabase Credentials

Edit `.env.local` and replace the placeholders:

```bash
# Supabase (public - safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase

# ⚠️ SERVER-ONLY SECRET - Never expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase

# Google Gemini (server-only secret) - Can be added later in Phase 2
GEMINI_API_KEY=your-gemini-api-key-here

# App URLs (public - safe for client)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# Feature Flags (public - safe for client)
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

⚠️ **Security Note:** Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## 🗄️ Step 3: Run Database Migrations

### 3.1 Install Supabase CLI

```bash
pnpm add -g supabase
```

### 3.2 Link to Your Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Enter your database password when prompted
```

### 3.3 Run Migrations

```bash
# Push all migrations to Supabase
supabase db push
```

This will run all 9 migration files in order:
1. ✅ Initial schema setup
2. ✅ Users table
3. ✅ Clients table
4. ✅ Campaigns table
5. ✅ Briefs table
6. ✅ Approvals table
7. ✅ Audit logs table
8. ✅ Audit triggers
9. ✅ Campaign members table

### 3.4 Verify Migrations

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see all tables created:
   - users
   - clients
   - campaigns
   - briefs
   - approvals
   - campaign_members
   - audit_logs

---

## 🔢 Step 4: Generate TypeScript Types

Generate TypeScript types from your database schema:

```bash
pnpm db:generate
```

This creates `packages/database/src/database.types.ts` with all your table types.

---

## 📦 Step 5: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This installs:
- @supabase/supabase-js
- @trpc/server
- zod
- And all other dependencies

---

## 🧪 Step 6: Test the Setup

### 6.1 Build the Project

```bash
pnpm build
```

Expected output:
```
✓ Compiled successfully
✓ All packages built
```

### 6.2 Start Development Server

```bash
pnpm dev:web
```

The web app should start at `http://localhost:3000`

### 6.3 Verify Database Connection

Check the browser console for any errors. If the Supabase client initializes successfully, you'll see no errors.

---

## 🌱 Step 7: Seed Development Data (Optional)

### 7.1 Run Seed Script

```bash
supabase db seed
```

This creates sample clients:
- Nike Marketing (platinum)
- Tesla Motors (gold)
- Apple (platinum)

### 7.2 Verify Seed Data

In Supabase Dashboard:
1. Go to **Table Editor** → **clients**
2. You should see 3 sample clients

---

## ✅ Step 8: Create Your First User

### 8.1 Enable Email Auth

In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Disable email confirmations for development:
   - Go to **Authentication** → **Settings**
   - Uncheck "Enable email confirmations"

### 8.2 Create Test User

You can create users in two ways:

**Option 1: Via Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter email and password
4. Click **"Create user"**

**Option 2: Via Sign Up Flow (Phase 3)**
We'll implement the sign-up UI in Phase 3.

### 8.3 Add User Profile

After creating a user in auth.users, add their profile to public.users:

```sql
-- In Supabase SQL Editor
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'auth-user-id-from-auth-users',
  'user@example.com',
  'Test User',
  'campaign_manager'
);
```

---

## 🎯 Verification Checklist

After completing all steps, verify:

- [ ] Supabase project created
- [ ] Environment variables configured in `.env.local`
- [ ] All 9 database migrations applied successfully
- [ ] TypeScript types generated
- [ ] Dependencies installed
- [ ] Project builds without errors
- [ ] Development server runs at localhost:3000
- [ ] Sample data seeded (optional)
- [ ] Test user created

---

## 🔍 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Ensure `.env.local` exists and has correct values:
```bash
cat .env.local | grep SUPABASE_URL
```

### Issue: Migration fails

**Solution:** Check Supabase project status:
1. Go to Supabase Dashboard
2. Check **Project Status** (top right)
3. Ensure project is "Healthy"

### Issue: Cannot connect to database

**Solution:** 
1. Verify project URL is correct
2. Check if anon key matches
3. Ensure project is active (not paused)

### Issue: TypeScript types not generated

**Solution:**
```bash
# Re-run type generation
pnpm --filter=database generate

# If that fails, check Supabase CLI is linked
supabase status
```

---

## 📚 What's Next?

With Phase 1 complete, you can now:

### Immediate Next Steps:
1. **Test tRPC API** - Create test API calls
2. **Implement Auth UI** - Login/signup components (Phase 2/3)
3. **Build Campaign UI** - Dashboard and forms (Phase 3)

### Phase 2 Preview:
- AI brief processing with Google Gemini
- Campaign CRUD operations
- Client management
- Risk assessment logic

---

## 🆘 Getting Help

### Resources:
- **Supabase Docs:** https://supabase.com/docs
- **tRPC Docs:** https://trpc.io/docs
- **Project README:** See `README_DEV.md`

### Common Commands:
```bash
# Check Supabase status
supabase status

# View database logs
supabase db logs

# Reset database (⚠️ deletes all data)
supabase db reset

# Generate types
pnpm db:generate

# Build project
pnpm build

# Run dev server
pnpm dev:web
```

---

## ✅ Success!

If you've completed all steps, Phase 1 Backend Infrastructure is now fully operational!

**You now have:**
- ✅ Supabase database with complete schema
- ✅ Row Level Security protecting your data
- ✅ Type-safe tRPC API
- ✅ Audit trail logging all changes
- ✅ Ready for Phase 2 development

🎉 **Congratulations!** You're ready to build TiKiT OS.

---

*Last Updated: February 7, 2026*

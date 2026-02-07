# Quick Start Guide - TiKiT OS

Get TiKiT OS up and running in minutes!

## 🚀 Quick Setup (5 minutes)

### Option 1: Cloud Deployment (Recommended for Production)

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Run deployment script
./scripts/deploy-supabase.sh

# 3. Update environment variables
# Edit .env.local with your Supabase credentials

# 4. Install dependencies
pnpm install

# 5. Start the app
pnpm dev:web

# 6. Visit http://localhost:3000
```

### Option 2: Local Development

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Setup local Supabase
./scripts/setup-supabase-local.sh

# 3. Install dependencies
pnpm install

# 4. Start the app
pnpm dev:web

# 5. Visit http://localhost:3000
```

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Supabase Account** - Sign up at [supabase.com](https://supabase.com) (for cloud deployment)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/) (for local development)

## 🎯 What's Included

- ✅ Next.js 15 with App Router
- ✅ Supabase for database and auth
- ✅ React Query for data fetching
- ✅ TailwindCSS for styling
- ✅ TypeScript for type safety
- ✅ Comprehensive testing suite
- ✅ Campaign management system

## 📚 Detailed Guides

For more detailed instructions, see:

- **[SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md)** - Complete Supabase setup guide
- **[SETUP.md](./SETUP.md)** - Full project setup instructions
- **[TESTING.md](./apps/web/TESTING.md)** - Testing guide

## 🔧 Common Commands

```bash
# Development
pnpm dev:web              # Start dev server
pnpm build:web            # Build for production
pnpm test:unit            # Run unit tests
pnpm test:coverage        # Run tests with coverage

# Supabase
supabase start            # Start local Supabase
supabase stop             # Stop local Supabase
supabase db reset         # Reset local database
supabase db push          # Deploy migrations
supabase db studio        # Open database UI

# Testing
pnpm test:watch           # Run tests in watch mode
pnpm test:e2e             # Run E2E tests
pnpm test                 # Run all tests
```

## 🌐 URLs

**Development:**
- App: http://localhost:3000
- Supabase Studio (local): http://localhost:54324
- API: http://localhost:3000/api/trpc

**Production:**
- App: Your deployed URL
- Supabase Dashboard: https://app.supabase.com

## 📖 Key Pages

- `/` - Home page
- `/dashboard` - Main dashboard
- `/campaigns` - Campaign list
- `/campaigns/[id]` - Campaign details

## 🆘 Troubleshooting

### "Command not found: supabase"
```bash
# Install Supabase CLI
brew install supabase/tap/supabase
# OR
npm install -g supabase
```

### "Cannot connect to Supabase"
```bash
# 1. Check .env.local exists and has correct values
cat .env.local

# 2. Verify Supabase project is running
# (For cloud: check dashboard)
# (For local: run 'supabase status')

# 3. Restart dev server
pnpm dev:web
```

### "Docker not running"
```bash
# Start Docker Desktop first, then:
./scripts/setup-supabase-local.sh
```

### Migration errors
```bash
# Reset database (⚠️ deletes all data!)
supabase db reset

# Or check migration file for syntax errors
cat supabase/migrations/20260207000000_initial_schema.sql
```

## 📞 Support

- **Documentation**: See the `docs/` folder
- **Issues**: Open an issue on GitHub
- **Supabase Docs**: https://supabase.com/docs

## 🎉 Next Steps

After setup:

1. **Create your first user** in Supabase Dashboard
2. **Add sample data** to test the app
3. **Explore the features** in the dashboard
4. **Read the documentation** for advanced features
5. **Start building!** 🚀

---

**Version:** 1.0  
**Last Updated:** February 7, 2026

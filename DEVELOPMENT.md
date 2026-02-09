# PrecisionFlow - Local Development Setup Guide

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A Supabase account (free tier works)
- Google Gemini API key (optional, for AI features)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies across the monorepo.

### 2. Set Up Supabase

#### Option A: Use Supabase Cloud (Recommended for Quick Start)

1. Create a project at https://app.supabase.com
2. Go to Project Settings > API
3. Copy your Project URL and anon key

#### Option B: Use Local Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase
cd supabase
supabase start

# This will give you local connection details
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp apps/web/.env.example apps/web/.env.local

# Edit the file and add your Supabase credentials
# Get these from your Supabase project settings
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side)

Optional variables:
- `GEMINI_API_KEY` - For AI brief processing features

### 4. Run Database Migrations

If using Supabase Cloud:
1. Go to your project's SQL Editor
2. Copy and paste migrations from `supabase/migrations/` folder
3. Run them in order (by filename number)

If using Local Supabase:
```bash
cd supabase
supabase db push
```

### 5. Start Development Server

```bash
# From the root directory
pnpm dev

# Or specifically for web app
pnpm --filter web dev
```

The app will be available at http://localhost:3000

## Project Structure

```
precisionflow/
├── apps/
│   ├── web/           # Next.js web application
│   └── mobile/        # React Native mobile app (future)
├── packages/
│   ├── api/           # tRPC API routers
│   ├── database/      # Supabase client and types
│   ├── types/         # Shared TypeScript types
│   ├── ai/            # AI/ML services (Gemini)
│   └── ui/            # Shared UI components
└── supabase/
    └── migrations/    # Database migrations
```

## Development Workflow

### Running Type Checks

```bash
pnpm typecheck
```

### Running Linting

```bash
pnpm lint
```

### Building for Production

```bash
pnpm build
```

### Working with Database

#### Generate TypeScript types from Supabase schema:
```bash
cd packages/database
pnpm generate
```

#### Create a new migration:
```bash
cd supabase
supabase migration new your_migration_name
```

## Common Issues

### Issue: `workspace:*` protocol error

**Solution:** Make sure you're using pnpm, not npm. Install pnpm globally:
```bash
npm install -g pnpm
```

### Issue: Database connection errors

**Solution:** 
1. Check your .env.local file has correct Supabase credentials
2. Verify your Supabase project is running
3. Check network connectivity to Supabase

### Issue: TypeScript errors about database types

**Solution:** 
1. Make sure you've run migrations
2. Regenerate types: `cd packages/database && pnpm generate`
3. Restart your TypeScript server in your IDE

### Issue: Module not found errors

**Solution:**
```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## Testing

### Run all tests:
```bash
pnpm test
```

### Run tests in watch mode:
```bash
pnpm test:watch
```

### Check test coverage:
```bash
pnpm test:coverage
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- All variables from .env.example
- Set `NEXT_PUBLIC_APP_URL` to your production domain

## Getting Help

- Check the full documentation in `/docs`
- Review API documentation in `/docs/api`
- See architecture docs in `/docs/ARCHITECTURE.md`

## Next Steps

1. ✅ Set up your development environment
2. ✅ Create your first campaign
3. ✅ Upload a brief and see AI processing
4. ✅ Test the approval workflow
5. ✅ Explore creator management features

Happy coding! 🚀

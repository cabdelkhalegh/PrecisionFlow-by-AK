# Quick Start Guide - TiKiT OS Web App

## Prerequisites
- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account (for database)
- Google Gemini API key (for AI features)

## Setup Steps

### 1. Install Dependencies
```bash
cd /path/to/PrecisionFlow-by-AK
pnpm install
```

### 2. Configure Environment Variables
```bash
# Copy example environment file
cp apps/web/.env.example apps/web/.env.local

# Edit the file with your credentials
nano apps/web/.env.local
```

Required variables:
```env
# Supabase (Get from https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini AI (Get from https://makersuite.google.com/app/apikey)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
# Start the web app
pnpm dev:web

# Or start all apps
pnpm dev
```

The app will be available at: http://localhost:3000

### 4. Build for Production
```bash
# Build all packages
pnpm build

# Or just the web app
pnpm build:web
```

### 5. Start Production Server
```bash
cd apps/web
pnpm start
```

## Common Commands

```bash
# Development
pnpm dev                 # Start all apps in dev mode
pnpm dev:web            # Start only web app
pnpm dev:mobile         # Start only mobile app

# Building
pnpm build              # Build all packages
pnpm build:web          # Build web app only

# Testing
pnpm test               # Run all tests
pnpm test:unit          # Run unit tests
pnpm test:e2e           # Run E2E tests

# Code Quality
pnpm lint               # Run linters
pnpm lint:fix           # Fix linting issues
pnpm typecheck          # Check TypeScript types
pnpm format             # Format code with Prettier

# Database
pnpm db:generate        # Generate types from Supabase
pnpm db:migrate         # Run migrations
pnpm db:seed            # Seed database
```

## Troubleshooting

### Module not found errors
```bash
# Re-install dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Build fails
```bash
# Clean and rebuild
rm -rf .next
rm -rf dist
pnpm build
```

### Environment variables not working
1. Ensure `.env.local` is in `apps/web/` directory
2. Restart the dev server after changing env vars
3. Check that variable names start with `NEXT_PUBLIC_` for client-side access

### TypeScript errors
```bash
# Regenerate TypeScript build info
rm -rf **/*.tsbuildinfo
pnpm typecheck
```

## Project Structure

```
PrecisionFlow-by-AK/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── api/              # tRPC API layer
│   ├── database/         # Supabase client & types
│   ├── types/            # Shared TypeScript types
│   ├── ai/               # AI integration (Gemini)
│   └── ui/               # Shared UI components
└── docs/                 # Documentation
```

## Key Files

- `apps/web/next.config.js` - Next.js configuration
- `apps/web/src/app/` - Next.js app router pages
- `apps/web/src/components/` - React components
- `packages/api/src/` - tRPC routers and procedures
- `packages/database/src/client.ts` - Supabase client setup

## Need Help?

- Check the main [README.md](./README.md)
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Check issues on GitHub repository

## Status

- ✅ Development environment: Working
- ✅ Build process: Working (with warnings)
- ⚠️ TypeScript: Has warnings
- ❓ Tests: Not verified
- ❌ Production: Not configured

Last updated: February 8, 2026

# Setup Instructions for TiKiT OS

This guide will help you get the TiKiT OS web application up and running.

## Prerequisites

- Node.js 20.x or later
- pnpm 8.x or later
- A Supabase account (free tier)

## Quick Start

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy your project URL and anon key

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set Up Database (Optional for now)

If you want to run the database migrations:

```bash
# Install Supabase CLI
pnpm add -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
pnpm db:migrate
```

### 6. Start Development Server

```bash
pnpm dev:web
```

The app will be running at http://localhost:3000

## What's Working Now

✅ **Monorepo Structure** - Turborepo + pnpm workspaces configured
✅ **Next.js 14 Web App** - Running with App Router
✅ **TailwindCSS** - Styling configured and working
✅ **TypeScript** - Strict mode enabled
✅ **Database Schema** - Initial schema defined in migrations
✅ **Type System** - Zod schemas for runtime validation

## What's Next to Implement

⚠️ **Supabase Integration** - Connect to your Supabase instance
⚠️ **Authentication** - User login/signup with Supabase Auth
⚠️ **Campaign Management** - CRUD operations for campaigns
⚠️ **Brief Processing** - Upload and AI-powered brief structuring
⚠️ **Approval Workflows** - Multi-layer approval gates
⚠️ **Content Management** - Task and artifact management
⚠️ **Financial Tracking** - Budget and expense management
⚠️ **Reporting** - Dashboards and analytics

## Project Structure

```
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   ├── database/         # Supabase client and types
│   └── types/            # Shared TypeScript types and Zod schemas
├── supabase/
│   ├── migrations/       # Database migration files
│   └── config.toml       # Supabase configuration
└── package.json          # Root package.json with workspace scripts
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript type checking
pnpm format       # Format code with Prettier
```

## Documentation

For more detailed information, see:

- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
- [DEV_SETUP.md](./DEV_SETUP.md) - Detailed setup guide

## Need Help?

Check the existing documentation or create an issue on GitHub.

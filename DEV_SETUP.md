# 🛠️ Development Environment Setup

**Product:** TiKiT OS — Campaign Execution & Intelligence  
**Last Updated:** February 2026

---

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 20.x LTS | Runtime environment |
| **pnpm** | 8.x+ | Package manager |
| **Git** | 2.x+ | Version control |
| **VS Code** | Latest | Recommended IDE |
| **Docker** | 24.x+ | Optional (for local databases) |

### Accounts Required

- [x] **GitHub Account** - For repository access
- [x] **Supabase Account** - For database and auth (free tier)
- [x] **Vercel Account** - For deployment (free tier)
- [x] **OpenAI Account** - For AI features (pay-as-you-go)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/cabdelkhalegh/PrecisionFlow-by-AK.git
cd PrecisionFlow-by-AK
```

### 2. Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Set Up Environment Variables

```bash
# Copy example env files
cp .env.example .env.local

# Fill in your credentials (see Environment Variables section)
```

### 5. Initialize Supabase Project

```bash
# Install Supabase CLI
pnpm add -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 6. Run Development Server

```bash
# Start all apps (web + mobile)
pnpm dev

# Or start individually
pnpm dev:web    # Web app on http://localhost:3000
pnpm dev:mobile # Mobile app with Expo
```

---

## 📁 Project Structure

```
PrecisionFlow-by-AK/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and helpers
│   │   ├── public/            # Static assets
│   │   └── package.json
│   │
│   ├── mobile/                 # React Native (Expo) app
│   │   ├── app/               # expo-router screens
│   │   ├── components/        # React Native components
│   │   ├── lib/               # Utilities
│   │   └── package.json
│   │
│   └── docs/                   # Documentation site (Nextra)
│       └── package.json
│
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── api/                    # tRPC API definitions
│   │   ├── src/
│   │   │   ├── routers/       # API routers
│   │   │   ├── procedures/    # Shared procedures
│   │   │   └── trpc.ts        # tRPC setup
│   │   └── package.json
│   │
│   ├── database/               # Database utilities
│   │   ├── src/
│   │   │   ├── client.ts      # Supabase client
│   │   │   ├── types.ts       # Generated types
│   │   │   └── migrations/    # Local migrations
│   │   └── package.json
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── utils/                  # Business logic utilities
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── stores/                 # Zustand state stores
│   │   ├── src/
│   │   └── package.json
│   │
│   └── config/                 # Shared configurations
│       ├── eslint/            # ESLint configs
│       ├── typescript/        # TypeScript configs
│       └── tailwind/          # Tailwind configs
│
├── supabase/
│   ├── functions/              # Supabase Edge Functions
│   ├── migrations/             # Database migrations
│   ├── seed.sql               # Seed data
│   └── config.toml            # Supabase config
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── ci.yml
│       ├── deploy-web.yml
│       ├── deploy-mobile.yml
│       └── test.yml
│
├── scripts/                    # Utility scripts
│   ├── setup.sh               # Initial setup
│   ├── generate-types.ts      # Generate DB types
│   └── seed-data.ts           # Seed development data
│
├── .env.example                # Environment variables template
├── .gitignore
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # pnpm workspace config
├── turbo.json                  # Turborepo config
└── README.md
```

---

## 🔐 Environment Variables

### Root `.env.local`

> **⚠️ SECURITY WARNING:** `SUPABASE_SERVICE_ROLE_KEY` is a **server-only secret**. It must **NEVER** be used in client-side code (browser or mobile), must **NOT** be exposed in any `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*` environment variables, and should only be loaded in trusted server runtimes (e.g., Next.js API routes, server components, server actions, or edge/serverless functions).

```bash
# Supabase (public - safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ⚠️ SERVER-ONLY SECRET - Never expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini (server-only secret)
GEMINI_API_KEY=your-gemini-api-key

# App URLs (public - safe for client)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# Feature Flags (public - safe for client)
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Vercel (production only)
# VERCEL_URL - Auto-populated by Vercel
# VERCEL_ENV - Auto-populated by Vercel
```

### Mobile `.env.local` (`apps/mobile/.env.local`)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000/api/trpc

# ⚠️ Never include server secrets (SERVICE_ROLE_KEY, GEMINI_API_KEY) in mobile env
```

---

## 🎨 IDE Setup (VS Code)

### Recommended Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "supabase.supabase-vscode",
    "expo.vscode-expo-tools",
    "mikestead.dotenv"
  ]
}
```

### VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## 📦 Package Scripts

### Root Scripts

```bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm dev:web          # Start web app only
pnpm dev:mobile       # Start mobile app only
pnpm dev:docs         # Start docs site

# Building
pnpm build            # Build all apps
pnpm build:web        # Build web app
pnpm build:mobile     # Build mobile app (EAS)

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:watch       # Run tests in watch mode

# Linting & Formatting
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
pnpm typecheck        # Type check all packages

# Database
pnpm db:generate      # Generate TypeScript types from DB
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database with test data
pnpm db:reset         # Reset database (careful!)

# Utilities
pnpm clean            # Clean build artifacts
pnpm clean:modules    # Remove all node_modules
```

---

## 🗄️ Database Setup

### Option 1: Supabase Cloud (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy project URL and anon key

2. **Set Up Database**
   ```bash
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Run migrations
   supabase db push
   
   # Seed data (optional)
   pnpm db:seed
   ```

3. **Generate Types**
   ```bash
   pnpm db:generate
   ```

### Option 2: Local Supabase (Advanced)

```bash
# Start local Supabase
supabase start

# This will spin up:
# - PostgreSQL database
# - Auth server
# - Storage server
# - Real-time server
# - Studio UI at http://localhost:54323

# Run migrations
supabase db push

# Stop local Supabase
supabase stop
```

---

## 📱 Mobile Development

### Prerequisites

```bash
# Install Expo CLI
pnpm add -g expo-cli eas-cli

# Login to Expo
eas login
```

### Running on Devices

#### iOS Simulator (Mac only)

```bash
pnpm dev:mobile
# Press 'i' to open iOS simulator
```

#### Android Emulator

```bash
pnpm dev:mobile
# Press 'a' to open Android emulator
```

#### Physical Device

```bash
pnpm dev:mobile
# Scan QR code with Expo Go app
```

### Building for Production

```bash
# Configure EAS Build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

---

## 🧪 Testing Setup

### Unit Tests (Vitest)

```bash
# Run unit tests
pnpm test:unit

# Watch mode
pnpm test:unit --watch

# Coverage
pnpm test:unit --coverage
```

### E2E Tests (Playwright)

```bash
# Install Playwright
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e --ui

# Run specific test
pnpm test:e2e tests/campaigns.spec.ts
```

### Component Tests (Testing Library)

```bash
# Run component tests
pnpm test:components
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. `pnpm install` fails

```bash
# Clear cache
pnpm store prune

# Remove node_modules and reinstall
pnpm clean:modules
pnpm install
```

#### 2. TypeScript errors after DB changes

```bash
# Regenerate types
pnpm db:generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

#### 3. Supabase connection issues

```bash
# Check Supabase status
supabase status

# Restart local Supabase
supabase stop
supabase start
```

#### 4. Mobile app not loading

```bash
# Clear Metro cache
pnpm dev:mobile --clear

# Reset Expo cache
expo start -c
```

#### 5. Build errors

```bash
# Clean build artifacts
pnpm clean

# Rebuild
pnpm build
```

---

## 🚀 Deployment

### Web App (Vercel)

#### Automatic Deployment

1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Every push to `main` triggers production deployment
4. PRs get preview deployments automatically

#### Manual Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Mobile App (EAS)

#### Production Build

```bash
# Build
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

#### OTA Updates

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Create preview
eas update --branch preview
```

---

## 🔍 Code Quality Tools

### Pre-commit Hooks (Husky)

Automatically runs before each commit:
- Lint staged files
- Type check
- Run tests for changed files

### Pre-push Hooks

Runs before pushing:
- Full type check
- Build check
- Run all tests

### Continuous Integration

GitHub Actions runs on every PR:
- Lint and format check
- Type check
- Unit tests
- E2E tests
- Build verification
- Security scan

---

## 📚 Learning Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Turborepo Docs](https://turbo.build/repo/docs)

### Internal Docs

- `ARCHITECTURE.md` - Technical architecture
- `DATABASE_SCHEMA.md` - Database design
- `API_SPEC.md` - API documentation
- `CONTRIBUTING.md` - Contribution guidelines

---

## 🆘 Getting Help

### Team Communication

- **Slack/Discord:** [Link to be added]
- **Email:** dev-team@tikit-os.com

### Issue Reporting

1. Check existing issues on GitHub
2. Create new issue with template
3. Tag with appropriate labels
4. Assign to relevant team member

---

## ✅ Setup Checklist

- [ ] Node.js 20.x installed
- [ ] pnpm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] Supabase account created
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] TypeScript types generated
- [ ] Development server runs successfully
- [ ] VS Code extensions installed
- [ ] Pre-commit hooks working
- [ ] Can build project successfully
- [ ] Tests run successfully

---

**Need help?** Contact the development team or check the troubleshooting section.

**Last Updated:** February 2026

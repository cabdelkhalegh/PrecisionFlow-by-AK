# TiKiT OS - README for Developers

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ installed
- pnpm 8+ installed (`npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/cabdelkhalegh/PrecisionFlow-by-AK.git
cd PrecisionFlow-by-AK

# Install dependencies
pnpm install

# Run development server
pnpm dev:web
```

### Project Structure

```
PrecisionFlow-by-AK/
├── apps/
│   └── web/                 # Next.js 14 web application
│       ├── src/
│       │   └── app/        # App Router pages
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── config/             # Shared configurations
│   │   ├── eslint/        # ESLint configs
│   │   └── typescript/    # TypeScript configs
│   └── types/             # Shared TypeScript types
│       └── src/
│           ├── campaign.ts
│           ├── user.ts
│           └── approval.ts
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace config
├── turbo.json             # Turborepo config
└── IMPLEMENTATION_PLAN.md  # Detailed implementation roadmap
```

### Available Scripts

```bash
# Development
pnpm dev              # Run all apps in dev mode
pnpm dev:web          # Run web app only

# Building
pnpm build            # Build all apps
pnpm build:web        # Build web app

# Testing
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm typecheck        # Type check all packages
```

### Technology Stack

- **Frontend:** Next.js 14 (App Router, React Server Components)
- **Styling:** TailwindCSS
- **Monorepo:** Turborepo + pnpm workspaces
- **Type Safety:** TypeScript (strict mode)
- **Linting:** ESLint + Prettier

### Documentation

- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Detailed phased implementation plan
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
- [API_SPEC.md](./API_SPEC.md) - API documentation
- [DEV_SETUP.md](./DEV_SETUP.md) - Detailed development setup

### Current Status

✅ **Phase 0 Complete** - Foundation Setup
- Turborepo monorepo initialized
- Next.js 14 web app created
- TypeScript strict mode enabled
- Shared packages structure ready

🟡 **Phase 1 In Progress** - Backend Infrastructure
- Setting up Supabase
- Implementing database schema
- Creating tRPC API layer

### Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### License

*License to be determined*

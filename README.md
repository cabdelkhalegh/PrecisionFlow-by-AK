# 🎯 PrecisionFlow by AK

**PrecisionFlow — Campaign Execution & Intelligence Platform**

An enterprise-grade operating system for influencer marketing agencies. Built with campaign-centric design, AI-powered brief processing, multi-layer approval gates, and full financial traceability.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/cabdelkhalegh/PrecisionFlow-by-AK.git
cd PrecisionFlow-by-AK
pnpm install

# 2. Configure environment
pnpm setup              # Interactive setup wizard
# OR manually:
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Supabase + Gemini credentials

# 3. Start development
pnpm dev                # http://localhost:3000

# 4. Run tests
pnpm test               # 236+ unit & integration tests
```

---

## 📊 Project Status

| Metric | Status |
|--------|--------|
| **Build** | ✅ Passing |
| **Tests** | ✅ 236+ passing (170 API + 66 web) |
| **Pages** | 28 routes |
| **API Routers** | 12 routers, 60+ procedures |
| **E2E Tests** | ✅ Playwright suite |
| **CI/CD** | ✅ GitHub Actions |
| **Security** | ✅ Headers, rate limiting, auth middleware |
| **Deployment** | ✅ Docker + Vercel ready |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15 + React 19 + TailwindCSS)            │
│  28 pages: Dashboard, Campaigns, Clients, Creators,        │
│  Briefs, Approvals, Finance, Reports, Activity, Settings    │
├─────────────────────────────────────────────────────────────┤
│  API Layer (tRPC — end-to-end type safety)                  │
│  12 routers: campaigns, clients, briefs, approvals,         │
│  creators, shortlists, contentTasks, contentArtifacts,      │
│  activityLogs, budgets, expenses, invoices                  │
├─────────────────────────────────────────────────────────────┤
│  AI Engine (Google Gemini 2.0 Flash)                        │
│  Brief parsing, risk assessment, intelligence extraction    │
├─────────────────────────────────────────────────────────────┤
│  Database (Supabase — PostgreSQL + Auth + RLS)              │
│  14 tables, Row-Level Security, real-time subscriptions     │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TailwindCSS |
| **API** | tRPC v11 (type-safe, zero codegen) |
| **Database** | Supabase (PostgreSQL 15+, Auth, RLS) |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | Supabase Auth (JWT + cookies) |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel / Docker |

---

## 📱 Features

### Campaign Management
- Full lifecycle: Draft → Approval → Executing → Closing → Closed
- Budget tracking and financial oversight
- Multi-tab campaign detail: Overview, Shortlist, Content Tasks
- AI-powered brief parsing with risk assessment

### Creator Management
- Searchable creator database with platform filters
- Social media stats and engagement metrics
- Campaign shortlisting with ranked positions

### Content Workflow
- 3-gate approval pipeline: Script → Draft → Final
- Artifact version tracking
- Inline approve/reject with change requests

### Financial Management
- Budget allocation per campaign
- Expense tracking with approval workflow
- Invoice management with payment recording
- Financial dashboard with KPIs

### Approvals & Governance
- Multi-layer approval gates
- Pending approval notifications with badge count
- Director override capability with audit trail
- Complete audit log of all actions

### AI Intelligence
- Gemini-powered brief parsing
- Structured extraction: objectives, deliverables, timeline, budget, KPIs
- Risk assessment for missing information

---

## 📁 Project Structure

```
PrecisionFlow-by-AK/
├── apps/
│   └── web/                    # Next.js 15 web application
│       ├── src/app/            # 28 page routes
│       ├── src/components/     # Reusable UI components
│       ├── src/lib/            # Utilities, auth, tRPC client
│       └── src/test/           # Unit + E2E tests
├── packages/
│   ├── api/                    # tRPC API routers (12 routers)
│   ├── database/               # Supabase client + migrations
│   ├── types/                  # Shared TypeScript types
│   └── ai/                     # Gemini AI integration
├── docs/                       # API + deployment documentation
├── scripts/                    # Setup + deployment scripts
├── .github/workflows/          # CI/CD pipeline
├── Dockerfile                  # Multi-stage production build
└── docker-compose.prod.yml     # Full-stack Docker deployment
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run API tests only
pnpm --filter=api test

# Run web tests only
pnpm --filter=web test

# Run E2E tests (requires dev server)
cd apps/web && npx playwright test

# Run with coverage
pnpm --filter=api test -- --coverage
pnpm --filter=web test -- --coverage
```

### Test Coverage

| Suite | Tests | Coverage |
|-------|-------|----------|
| API (12 routers) | 170 tests | All routers covered |
| Web (components + pages) | 66 tests | Core components + pages |
| E2E (Playwright) | 20+ tests | Auth, navigation, API |
| **Total** | **236+** | — |

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Docker

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3000/api/health
```

📖 **Full guide:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🔒 Security

- **Authentication:** Supabase Auth with JWT + session cookies
- **Authorization:** Row-Level Security (RLS) on all tables
- **Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting:** 100 requests/minute per IP
- **Middleware:** Auth-protected routes with redirect
- **Audit Trail:** All mutations logged with user + timestamp

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/API.md](./docs/API.md) | Full API reference (12 routers, 60+ procedures) |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide (Vercel, Docker, self-hosted) |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines and code standards |
| [PRD.md](./PRD.md) | Product Requirements Document |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture decisions |

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management |
| **Director** | Governance, approval overrides, reports |
| **Campaign Manager** | Campaign CRUD, creator management, content workflow |
| **Finance** | Financial tracking, invoice management, budget oversight |
| **Client** | Brief approval, content approval, read-only dashboards |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guidelines.

```bash
# Development workflow
git checkout -b feature/your-feature
# Make changes
pnpm test                       # Ensure tests pass
pnpm build                      # Ensure build succeeds
git commit -m "feat(scope): description"
# Open PR
```

---

## 📞 Contact

**Product Owner:** PrecisionFlow Team
**Created by:** Adi Mustapha
**Reviewed by:** Cherif Hamadi
**Powered by:** PrecisionFlow by AK

---

## 📜 License

*License to be determined*

---

## 🔖 Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | Feb 2026 | Initial repository setup, PRD v1.0 approved |
| 0.2.0 | Feb 2026 | Architecture complete, free-tier stack selected |
| 0.3.0 | Feb 2026 | Core features: campaigns, clients, briefs, approvals |
| 0.4.0 | Feb 2026 | Creator management, content workflow, financial tracking |
| 0.5.0 | Feb 2026 | AI brief parsing, auth, E2E tests, CI/CD, security hardening |
| **1.0.0** | **Feb 2026** | **🚀 Production-ready: all phases complete** |

---

*Last updated: February 9, 2026*

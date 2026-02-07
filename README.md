# 🎯 PrecisionFlow by AK

**Building TiKiT OS - Campaign Execution & Intelligence Platform**

---

## 📘 Overview

This repository contains the development of **TiKiT OS**, an enterprise-grade operating system for influencer marketing agencies. TiKiT OS enforces governance, accountability, and intelligence across the entire campaign lifecycle using the **campaign as the single operating container**.

### Core Principle

> **Campaign is the OS container.** Everything is orchestrated through Campaign.

---

## 🚀 Project Status

**Current Phase:** Foundation - Ready for Implementation  
**PRD Version:** 1.0 (Approved & Locked)  
**Architecture:** ✅ Complete (Free-tier flagship stack)  
**Next Milestone:** Initialize Monorepo & Project Structure

---

## 📚 Key Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [PRD.md](./PRD.md) | Complete Product Requirements Document | ✅ Approved (PR #1) |
| [NEXT_STEPS.md](./NEXT_STEPS.md) | Implementation roadmap and next actions | ✅ Complete |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture & stack decisions | ✅ Complete |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Database design and ERD | ✅ Complete |
| [API_SPEC.md](./API_SPEC.md) | API documentation | ✅ Complete |
| [DEV_SETUP.md](./DEV_SETUP.md) | Development environment setup | ✅ Complete |

---

## 🎯 What is TiKiT OS?

TiKiT OS addresses the real reasons modern influencer campaigns fail:

❌ **Problems:**
- Unclear briefs leading to rework
- Influencer selection misalignment
- Missing approvals (brief/content)
- Schedule slips without governance
- Inconsistent KPI tracking
- Budget drift without traceability
- Weak closure discipline
- Loss of institutional learning

✅ **Solutions:**
- AI-assisted brief structuring
- Multi-layer approval gates
- Campaign-centric execution spine
- Risk-aware operations with transparency
- Financial traceability per campaign
- Enforced learning loop
- Complete audit trail

---

## 🏗️ System Architecture (Planned)

TiKiT OS will be built with:

### Core Entities
1. **Campaign** (root entity) - Single source of truth
2. **Client** - Client profiles and portfolio
3. **Brief** - Raw and AI-structured versions
4. **Strategy** - AI-generated and approved versions
5. **Influencer/Creator** - Profiles and performance data
6. **ContentTask** - Individual deliverables
7. **ContentArtifact** - SCRIPT → VIDEO_DRAFT → FINAL_CONTENT
8. **Approval** - All approval workflows
9. **FinancialObject** - Budget, expenses, invoices, payments
10. **Risk** - Risk flags and missing information tracking

### Technology Stack
✅ **Finalized - Free Tier Optimized**

**Frontend:**
- **Web:** Next.js 14 (App Router, Server Components, Vercel)
- **Mobile:** React Native + Expo (90% code sharing, OTA updates)
- **Styling:** TailwindCSS + NativeWind (universal design)
- **State:** Zustand + React Query (TanStack Query)

**Backend:**
- **API:** tRPC (type-safe, zero codegen) + Next.js API Routes
- **Functions:** Supabase Edge Functions (Deno)
- **Auth:** Supabase Auth (JWT, OAuth, MFA, RLS)

**Database:**
- **Primary:** Supabase (PostgreSQL 15+)
- **Storage:** Supabase Storage (S3-compatible, CDN)
- **Real-time:** Supabase Realtime (PostgreSQL replication)

**AI/ML:**
- **Primary:** Google Gemini API (Gemini 1.5 Flash) - Free tier: 1,500 requests/day
- **Use Cases:** Brief parsing, strategy generation, learning extraction
- **Alternative:** Anthropic Claude or OpenAI GPT-4

**Infrastructure:**
- **Web Hosting:** Vercel (Edge Network, Serverless)
- **Mobile Distribution:** EAS Build + OTA Updates
- **Monitoring:** Vercel Analytics, Sentry, LogRocket
- **CI/CD:** GitHub Actions

**Development:**
- **Language:** TypeScript 5.0+ (strict mode)
- **Monorepo:** Turborepo + pnpm workspaces
- **Testing:** Vitest (unit), Playwright (E2E), Testing Library
- **Code Quality:** ESLint, Prettier, Husky, lint-staged

---

## 👥 User Roles

### Internal Roles
- **Campaign Manager (CM)** - Campaign ownership and execution
- **Director (DIR)** - Governance and exceptions
- **Finance/Ops (FIN)** - Financial tracking and closure
- **Admin (ADM)** - System configuration

### External Roles
- **Client Approver (CLIENT)** - Brief, shortlist, and content approvals
- **Influencer/Creator (INF)** - Content creation and publishing

---

## 🗺️ Implementation Roadmap

### Foundation Phase (Weeks 1-4)
- Technical architecture design
- Database schema design
- Project structure setup
- API specification

### Phase 1: MVP Core (Months 1-2)
- Campaign management foundation
- AI brief processing
- User authentication & roles
- Basic approval workflows

### Phase 2: Creator & Content (Months 3-4)
- Creator database and matching
- Content task & artifact management
- Influencer onboarding

### Phase 3: Financial & Reporting (Months 5-6)
- Financial tracking
- KPI collection & reporting
- Schedule tracking

### Phase 4: Intelligence & Learning (Months 7-8)
- Campaign closure workflows
- AI learning engine
- Risk intelligence

📖 **Full details:** See [NEXT_STEPS.md](./NEXT_STEPS.md)

---

## 🎯 Success Metrics

TiKiT OS will measure success through:

### Operational Metrics
- Time: brief upload → structured brief ready
- Time: internal approval → client approval
- % campaigns with unresolved High-risk flags
- Approval latency (brief, shortlist, content)
- On-time publishing rate
- Budget revision documentation completeness

### Learning Metrics
- % campaigns fully closed with intelligence
- Issue recurrence reduction over time
- Best practices database growth

---

## 🚨 Core Requirements

All implementation must adhere to:

1. **Campaign-Centric Design** - Campaign is always the root container
2. **Audit Trail** - All actions logged with user and timestamp
3. **State Machine Integrity** - Deterministic lifecycle states
4. **Approval Gates** - Cannot bypass without explicit override
5. **Risk Visibility** - Missing info and risks always visible
6. **Financial Traceability** - All costs linked to CampaignID
7. **Learning Loop** - Every campaign produces intelligence

---

## 📋 Getting Started

### For Developers
1. Review [PRD.md](./PRD.md) to understand product requirements
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical stack and architecture
3. Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database design
4. Review [API_SPEC.md](./API_SPEC.md) for API documentation
5. Follow [DEV_SETUP.md](./DEV_SETUP.md) to set up your development environment
6. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

### For Stakeholders
1. Review [PRD.md](./PRD.md) for complete product vision
2. Review [NEXT_STEPS.md](./NEXT_STEPS.md) for timeline and milestones
3. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical decisions
4. Provide feedback on PRs as they are created
5. Participate in milestone reviews

---

## 🤝 Contributing

This is an early-stage project. Full contribution guidelines are available in [CONTRIBUTING.md](./CONTRIBUTING.md).

**Current Focus:** Initialize monorepo structure and begin Phase 1 MVP implementation

**Tech Stack:** Next.js 14 + React Native/Expo + Supabase (PostgreSQL) + tRPC

---

## 📞 Contact

**Product Owner:** TiKiT Product Team  
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
| 0.1.1 | Feb 2026 | Added NEXT_STEPS.md and README.md |
| 0.2.0 | Feb 2026 | ✅ Architecture complete - Free-tier flagship stack selected |

---

**Status:** 🟢 Foundation Complete - Ready for Implementation  
**Next Action:** Initialize Turborepo monorepo structure

*Last updated: February 7, 2026*

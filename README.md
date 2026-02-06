# 🎯 PrecisionFlow by AK

**Building TiKiT OS - Campaign Execution & Intelligence Platform**

---

## 📘 Overview

This repository contains the development of **TiKiT OS**, an enterprise-grade operating system for influencer marketing agencies. TiKiT OS enforces governance, accountability, and intelligence across the entire campaign lifecycle using the **campaign as the single operating container**.

### Core Principle

> **Campaign is the OS container.** Everything is orchestrated through Campaign.

---

## 🚀 Project Status

**Current Phase:** Planning & Architecture  
**PRD Version:** 1.0 (Approved & Locked)  
**Next Milestone:** Foundation Phase - Technical Architecture

---

## 📚 Key Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [PRD.md](./PRD.md) | Complete Product Requirements Document | ✅ Approved (PR #1) |
| [NEXT_STEPS.md](./NEXT_STEPS.md) | Implementation roadmap and next actions | ✅ Complete |
| ARCHITECTURE.md | Technical architecture & stack decisions | 📝 To be created |
| DATABASE_SCHEMA.md | Database design and ERD | 📝 To be created |
| API_SPEC.md | API documentation | 📝 To be created |

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
*(To be finalized in ARCHITECTURE.md)*

Considerations:
- **Backend:** Node.js/NestJS, Python/Django, or Ruby/Rails
- **Database:** PostgreSQL (for complex relationships and audit trails)
- **Frontend:** React, Vue.js, or Next.js
- **AI/ML:** OpenAI API integration for brief processing and learning
- **Auth:** JWT-based authentication with RBAC
- **Hosting:** Cloud infrastructure (AWS/GCP/Azure)

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
2. Review [NEXT_STEPS.md](./NEXT_STEPS.md) for implementation plan
3. Wait for ARCHITECTURE.md for technical setup instructions
4. Join the development team communication channel

### For Stakeholders
1. Review [PRD.md](./PRD.md) for complete product vision
2. Review [NEXT_STEPS.md](./NEXT_STEPS.md) for timeline and milestones
3. Provide feedback on PRs as they are created
4. Participate in milestone reviews

---

## 🤝 Contributing

This is an early-stage project. Contribution guidelines will be added as the project structure is established.

Current focus: **Foundation Phase - Architecture and Design**

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

---

**Status:** 🟡 Planning Phase  
**Next Action:** Create ARCHITECTURE.md with technical stack decisions

*Last updated: February 6, 2026*

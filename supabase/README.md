# Supabase Configuration for TiKiT OS

This directory contains all Supabase-related configuration, migrations, and edge functions for TiKiT OS.

## 📁 Directory Structure

```
supabase/
├── config.toml          # Supabase project configuration
├── seed.sql             # Seed data for development/testing
├── migrations/          # Database migration files
│   ├── 20260207000000_initial_setup.sql
│   ├── 20260207000001_core_tables.sql
│   ├── 20260207000002_campaign_data_tables.sql
│   ├── 20260207000003_rls_policies.sql
│   ├── 20260207000004_audit_triggers.sql
│   └── 20260207000005_storage_buckets.sql
└── functions/           # Supabase Edge Functions (to be added)
```

## 🚀 Quick Start

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. Run Migrations

```bash
supabase db push
```

## 📋 Migrations Overview

### Migration 1: Initial Setup (20260207000000)
- PostgreSQL extensions (uuid-ossp, pgcrypto, pg_trgm, btree_gin)
- Enum types for all state machines
- Helper functions for triggers

### Migration 2: Core Tables (20260207000001)
- **users** - Extended user profiles from Supabase Auth
- **clients** - Client organizations
- **campaigns** - Campaign management (root entity)
- **campaign_members** - Team assignments
- **influencers** - Influencer/creator profiles
- **campaign_influencers** - Campaign-influencer relationships
- **audit_logs** - Complete audit trail

### Migration 3: Campaign Data Tables (20260207000002)
- **briefs** - Campaign briefs (raw + AI-structured)
- **strategies** - Campaign strategies
- **content_tasks** - Content deliverables
- **content_artifacts** - Content versions (script → draft → final)
- **approvals** - All approval workflows
- **financial_objects** - Budget, expenses, invoices, payments
- **risk_flags** - Risk tracking and missing information

### Migration 4: RLS Policies (20260207000003)
- Row Level Security policies for all tables
- Role-based access control
- Multi-tenant data isolation
- Helper functions for permission checks

### Migration 5: Audit Triggers (20260207000004)
- Automatic audit logging for all tables
- Campaign state change tracking
- Approval decision logging
- Financial transaction tracking
- Budget and risk score calculation

### Migration 6: Storage Buckets (20260207000005)
- **briefs** - Brief documents (PDF, DOCX, TXT)
- **content** - Content artifacts (videos, images)
- **contracts** - Legal documents
- **invoices** - Financial documents
- **avatars** - User and client avatars (public)

## 🔧 Development Workflow

### Start Local Supabase

```bash
supabase start
```

This starts:
- PostgreSQL database (port 54322)
- API server (port 54321)
- Studio UI (port 54323)
- Inbucket email testing (port 54324)

### Create New Migration

```bash
supabase migration new migration_name
```

Edit the generated file in `supabase/migrations/`

### Apply Migrations

```bash
# Apply to local database
supabase db push

# Apply to remote database
supabase db push --db-url YOUR_DB_URL
```

### Reset Local Database

```bash
supabase db reset
```

### Generate TypeScript Types

```bash
supabase gen types typescript --local > ../packages/database/src/types.ts
```

## 🗄️ Database Schema

### Key Relationships

```
users → campaigns (campaign_manager_id)
clients → campaigns (client_id)
campaigns → briefs, strategies, content_tasks, financial_objects, risk_flags
influencers → campaign_influencers → campaigns
content_tasks → content_artifacts
campaigns → approvals
```

### Core Principles

1. **Campaign as Root Entity** - All data links back to campaign_id
2. **Immutable Audit Trail** - Append-only audit_logs table
3. **Row Level Security** - All tables have RLS enabled
4. **Soft Deletes** - Use deleted_at instead of hard deletes
5. **Automatic Timestamps** - created_at, updated_at on all tables

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS policies that enforce:
- Campaign managers can only access their campaigns
- Directors have elevated access
- Finance can view financial data
- Clients can only view approved content
- Influencers can only access assigned tasks

### Audit Logging

Every INSERT, UPDATE, DELETE on critical tables is logged to `audit_logs` with:
- User who made the change
- Timestamp
- Before/after data
- Action context

### Data Encryption

- Encryption at rest (Supabase default)
- Encryption in transit (TLS 1.3)
- Sensitive fields can be encrypted using `pgcrypto`

## 📊 Storage Buckets

### Bucket Configuration

| Bucket | Public | Size Limit | Allowed Types |
|--------|--------|------------|---------------|
| briefs | No | 50MB | PDF, DOCX, TXT |
| content | No | 500MB | Video, Image |
| contracts | No | 10MB | PDF, DOCX |
| invoices | No | 10MB | PDF, Image |
| avatars | Yes | 2MB | Image |

### Storage Policies

Each bucket has RLS policies matching the table-level permissions.

## 🧪 Seeding Data

### For Development Only

```bash
# Using Supabase CLI
supabase db seed

# Or run directly
psql $DATABASE_URL -f supabase/seed.sql
```

**Note:** Seed data is commented out by default. Uncomment as needed for testing.

## 🔄 Migration Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test migrations locally first** - Use `supabase db reset` to test from scratch
3. **Use transactions** - Wrap migrations in BEGIN/COMMIT blocks
4. **Add rollback notes** - Comment how to undo migration if needed
5. **Version control** - All migrations must be in Git

## 📚 Useful Commands

```bash
# Check migration status
supabase db status

# View differences from remote
supabase db diff

# Generate migration from schema changes
supabase db diff --schema public --use-migra

# Execute SQL
supabase db remote exec "SELECT * FROM campaigns LIMIT 5"

# View logs
supabase functions logs function_name

# Check database health
supabase db remote health
```

## 🆘 Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- Check if migration was partially applied
- Use `SELECT * FROM supabase_migrations.schema_migrations;` to see applied migrations

**Error: "permission denied"**
- Ensure you're connected with proper credentials
- Check RLS policies aren't blocking system operations

### Connection Issues

```bash
# Check status
supabase status

# Restart local Supabase
supabase stop && supabase start
```

### Reset Everything

```bash
supabase db reset
```

**Warning:** This deletes ALL data!

## 📖 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All migrations tested locally
- [ ] RLS policies verified
- [ ] Storage buckets created
- [ ] Audit triggers working
- [ ] Seed data removed (if not needed)
- [ ] Database performance tested
- [ ] Backup strategy in place
- [ ] Monitoring configured

---

**Last Updated:** February 2026  
**Schema Version:** 1.0

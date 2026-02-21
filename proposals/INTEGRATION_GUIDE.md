# 🎯 Integration Guide for Approved PRDs

**Version:** 1.0  
**Date:** February 2026  
**Purpose:** Guide for integrating approved enhancement features into TiKiT OS

---

## 📋 Overview

This guide provides step-by-step instructions for integrating approved PRD features into the main TiKiT OS application. Follow this process to ensure smooth, consistent integration that maintains code quality and system stability.

---

## 🎯 Integration Principles

### 1. **Incremental Integration**
- Integrate features in small, testable increments
- Each increment must be fully tested before proceeding
- Use feature flags for gradual rollout

### 2. **Maintain Backwards Compatibility**
- Existing features must continue to work
- Database migrations must be reversible
- API changes must be versioned

### 3. **Campaign-Centric Architecture**
- All new features must respect campaign as root entity
- Features must link to campaigns appropriately
- Maintain audit trail requirements

### 4. **Code Quality Standards**
- Follow existing code style and patterns
- Achieve 80%+ test coverage
- Pass all linters and type checks
- Update documentation

---

## 📝 Integration Checklist

Use this checklist for each approved PRD:

### Phase 1: Pre-Integration Planning
- [ ] PRD approved by council
- [ ] Technical specifications reviewed by engineering
- [ ] Dependencies identified and resolved
- [ ] Resource allocation confirmed
- [ ] Implementation timeline agreed
- [ ] Feature branch created: `feature/prd-XXX-feature-name`

### Phase 2: Database Changes
- [ ] Database migrations written
- [ ] Migrations tested on development environment
- [ ] Rollback migrations tested
- [ ] RLS policies implemented
- [ ] Indexes created for performance
- [ ] Materialized views created (if needed)
- [ ] Data persistence strategy documented
- [ ] Migration reviewed by database team

### Phase 3: API Implementation
- [ ] tRPC procedures implemented
- [ ] Zod schemas defined for validation
- [ ] Authentication middleware added
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] API tests written (integration tests)
- [ ] API documented (auto-generated + examples)

### Phase 4: Business Logic
- [ ] Service layer implemented
- [ ] Utility functions created
- [ ] Caching strategy implemented (if needed)
- [ ] Real-time subscriptions configured (if needed)
- [ ] Unit tests written (80%+ coverage)
- [ ] Edge cases handled

### Phase 5: Frontend Implementation
- [ ] UI components created
- [ ] Responsive design implemented
- [ ] Accessibility features added (WCAG 2.1 AA)
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented
- [ ] Component tests written
- [ ] E2E tests written

### Phase 6: Integration Testing
- [ ] Feature flag implemented
- [ ] Deployed to staging environment
- [ ] Manual QA completed
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Bug fixes completed

### Phase 7: Documentation
- [ ] User documentation written
- [ ] Technical documentation updated
- [ ] API documentation published
- [ ] Database schema documented
- [ ] Changelog updated
- [ ] Video tutorials created (if needed)

### Phase 8: Deployment
- [ ] Code review completed
- [ ] PR merged to develop branch
- [ ] Deployed to staging for final verification
- [ ] Production deployment scheduled
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Feature flag enabled for internal users
- [ ] Internal announcement sent

### Phase 9: Beta Rollout (if applicable)
- [ ] Beta users selected
- [ ] Feature flag enabled for beta users
- [ ] Feedback collection mechanism ready
- [ ] Support team briefed
- [ ] Performance monitoring active
- [ ] Feedback analyzed
- [ ] Adjustments made based on feedback

### Phase 10: General Availability
- [ ] Feature flag enabled for all users
- [ ] Marketing announcement published
- [ ] User onboarding flow updated
- [ ] Support documentation published
- [ ] Success metrics dashboard created
- [ ] Post-launch monitoring active

### Phase 11: Post-Launch
- [ ] Adoption metrics tracked
- [ ] User feedback collected
- [ ] Performance metrics monitored
- [ ] Bug reports triaged and fixed
- [ ] Optimization opportunities identified
- [ ] Post-launch review conducted

---

## 🏗️ Technical Integration Patterns

### Pattern 1: Adding New Database Tables

```sql
-- Create migration file: migrations/YYYYMMDDHHMMSS_add_feature_tables.sql

-- Always start with transaction
BEGIN;

-- Create new tables
CREATE TABLE feature_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE, -- Link to campaign
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- ... other fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Create indexes
CREATE INDEX idx_feature_table_campaign ON feature_table(campaign_id);
CREATE INDEX idx_feature_table_user ON feature_table(user_id);

-- Create RLS policies
ALTER TABLE feature_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own features"
ON feature_table FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Campaign members can view campaign features"
ON feature_table FOR SELECT
USING (
  campaign_id IN (
    SELECT campaign_id FROM campaign_members
    WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_feature_table_updated_at
  BEFORE UPDATE ON feature_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add audit logging if needed
CREATE TRIGGER audit_feature_table
  AFTER INSERT OR UPDATE OR DELETE ON feature_table
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_trigger();

COMMIT;

-- Create rollback migration: migrations/YYYYMMDDHHMMSS_rollback_add_feature_tables.sql
BEGIN;
DROP TABLE IF EXISTS feature_table CASCADE;
COMMIT;
```

### Pattern 2: Adding tRPC Procedures

```typescript
// packages/api/src/routers/feature.ts

import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

// Input schemas
const createFeatureSchema = z.object({
  campaignId: z.string().uuid(),
  name: z.string().min(1).max(255),
  config: z.record(z.any()).optional(),
});

const getFeatureSchema = z.object({
  id: z.string().uuid(),
});

export const featureRouter = router({
  // Create
  create: protectedProcedure
    .input(createFeatureSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      const hasAccess = await checkCampaignAccess(ctx.user.id, input.campaignId);
      if (!hasAccess) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Create feature
      const feature = await ctx.prisma.featureTable.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      });

      // Audit log
      await auditLog({
        userId: ctx.user.id,
        action: 'feature.create',
        resourceId: feature.id,
      });

      return feature;
    }),

  // Get by ID
  get: protectedProcedure
    .input(getFeatureSchema)
    .query(async ({ ctx, input }) => {
      const feature = await ctx.prisma.featureTable.findUnique({
        where: { id: input.id },
        include: {
          campaign: true,
          user: { select: { id: true, fullName: true } },
        },
      });

      if (!feature) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      // Check permissions (RLS handles this, but good to be explicit)
      const hasAccess = await checkFeatureAccess(ctx.user.id, feature.id);
      if (!hasAccess) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return feature;
    }),

  // List with filters
  list: protectedProcedure
    .input(z.object({
      campaignId: z.string().uuid().optional(),
      pagination: z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(30),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page = 1, perPage = 30 } = input.pagination || {};
      const skip = (page - 1) * perPage;

      const where = {
        deletedAt: null,
        ...(input.campaignId && { campaignId: input.campaignId }),
      };

      const [features, total] = await Promise.all([
        ctx.prisma.featureTable.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.prisma.featureTable.count({ where }),
      ]);

      return {
        features,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      };
    }),
});
```

### Pattern 3: Implementing Caching

```typescript
// services/featureService.ts

import { redis } from '../lib/redis';

const CACHE_TTL = 300; // 5 minutes

export class FeatureService {
  async getFeatureWithCache(featureId: string) {
    // Try cache first
    const cacheKey = `feature:${featureId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - fetch from database
    const feature = await prisma.featureTable.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      return null;
    }

    // Store in cache
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(feature));

    return feature;
  }

  async invalidateCache(featureId: string) {
    await redis.del(`feature:${featureId}`);
  }

  async updateFeature(featureId: string, data: any) {
    // Update database
    const feature = await prisma.featureTable.update({
      where: { id: featureId },
      data,
    });

    // Invalidate cache
    await this.invalidateCache(featureId);

    return feature;
  }
}
```

### Pattern 4: React Component with tRPC

```typescript
// apps/web/components/FeatureList.tsx

import { trpc } from '@/utils/trpc';
import { useState } from 'react';

export function FeatureList({ campaignId }: { campaignId: string }) {
  const [page, setPage] = useState(1);

  // Query with React Query via tRPC
  const { data, isLoading, error } = trpc.feature.list.useQuery({
    campaignId,
    pagination: { page, perPage: 10 },
  });

  // Mutation
  const createMutation = trpc.feature.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      trpc.useContext().feature.list.invalidate();
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h2>Features</h2>
      <ul>
        {data?.features.map(feature => (
          <li key={feature.id}>{feature.name}</li>
        ))}
      </ul>
      <Pagination
        page={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

## 🔄 Feature Flag Management

### Implementing Feature Flags

```typescript
// lib/featureFlags.ts

export const FEATURE_FLAGS = {
  ANALYTICS_DASHBOARD: 'analytics_dashboard',
  AI_PREDICTIONS: 'ai_predictions',
  PORTFOLIO_MANAGEMENT: 'portfolio_management',
  // ... more features
} as const;

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

export async function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string
): Promise<boolean> {
  // Check database for per-user flags
  const userFlag = userId
    ? await prisma.userFeatureFlag.findUnique({
        where: { userId_flag: { userId, flag } },
      })
    : null;

  if (userFlag !== null) {
    return userFlag.enabled;
  }

  // Check environment-wide flag
  const globalFlag = await prisma.featureFlag.findUnique({
    where: { flag },
  });

  return globalFlag?.enabled ?? false;
}

// React hook
export function useFeatureFlag(flag: FeatureFlag) {
  const { data: user } = useCurrentUser();
  const { data: enabled } = trpc.featureFlags.check.useQuery({
    flag,
    userId: user?.id,
  });

  return enabled ?? false;
}
```

### Using Feature Flags

```typescript
// In components
function CampaignDashboard() {
  const analyticsEnabled = useFeatureFlag(FEATURE_FLAGS.ANALYTICS_DASHBOARD);

  return (
    <div>
      <h1>Campaign Dashboard</h1>
      {analyticsEnabled && <AnalyticsDashboard />}
      {!analyticsEnabled && <ComingSoonBanner feature="Advanced Analytics" />}
    </div>
  );
}

// In API
router.query('getCampaign', async ({ ctx, input }) => {
  const campaign = await getCampaign(input.id);
  
  const analyticsEnabled = await isFeatureEnabled(
    FEATURE_FLAGS.ANALYTICS_DASHBOARD,
    ctx.user.id
  );

  return {
    ...campaign,
    analytics: analyticsEnabled ? await getAnalytics(campaign.id) : null,
  };
});
```

---

## 📊 Monitoring Integration

### Key Metrics to Track

1. **Feature Adoption**
   - Daily/weekly active users
   - Feature usage frequency
   - User segments using feature

2. **Performance Metrics**
   - API response times
   - Database query times
   - Cache hit rates
   - Error rates

3. **Business Metrics**
   - Time savings (measured)
   - User satisfaction (NPS)
   - ROI realization

### Implementation

```typescript
// utils/analytics.ts

export function trackFeatureUsage(
  featureName: string,
  action: string,
  metadata?: Record<string, any>
) {
  // Track in application
  analytics.track('Feature Used', {
    feature: featureName,
    action,
    ...metadata,
    timestamp: new Date(),
  });

  // Store in database for analysis
  prisma.featureUsage.create({
    data: {
      userId: getCurrentUserId(),
      feature: featureName,
      action,
      metadata,
    },
  });
}

// Usage
function AnalyticsDashboard() {
  useEffect(() => {
    trackFeatureUsage('analytics_dashboard', 'viewed');
  }, []);

  const handleExport = () => {
    trackFeatureUsage('analytics_dashboard', 'exported', { format: 'pdf' });
    // ... export logic
  };

  return <Dashboard onExport={handleExport} />;
}
```

---

## 🔒 Security Integration

### Security Checklist
- [ ] All inputs validated with Zod schemas
- [ ] RLS policies implemented and tested
- [ ] Authentication required for all endpoints
- [ ] Authorization checks before all operations
- [ ] Audit logging for sensitive operations
- [ ] Rate limiting configured
- [ ] SQL injection prevention (use ORM only)
- [ ] XSS prevention (React handles this)
- [ ] CSRF protection (Supabase handles this)

---

## 📝 Documentation Integration

### Required Documentation Updates

**User Documentation:**
1. Feature overview
2. Step-by-step guides
3. Video tutorials (for complex features)
4. FAQ section
5. Troubleshooting guide

**Technical Documentation:**
1. API reference (auto-generated)
2. Database schema updates
3. Architecture diagrams
4. Code examples
5. Migration guides

**Update These Files:**
- `README.md` - Add feature to feature list
- `ARCHITECTURE.md` - Update if architecture changes
- `DATABASE_SCHEMA.md` - Document new tables
- `API_SPEC.md` - Document new endpoints
- `CHANGELOG.md` - Add feature to changelog

---

## 🚀 Deployment Process

### Step-by-Step Deployment

**1. Prepare Release**
```bash
# Ensure you're on develop branch
git checkout develop
git pull origin develop

# Run tests
pnpm test
pnpm lint
pnpm type-check

# Build
pnpm build
```

**2. Database Migrations**
```bash
# Apply migrations to staging
supabase db push --db-url $STAGING_DATABASE_URL

# Verify migrations
supabase db diff --db-url $STAGING_DATABASE_URL

# Test rollback on staging
supabase db reset --db-url $STAGING_DATABASE_URL
supabase db push --db-url $STAGING_DATABASE_URL
```

**3. Deploy to Staging**
```bash
# Push to staging branch (auto-deploys to Vercel)
git push origin develop:staging

# Wait for deployment
# Verify on staging URL
```

**4. QA on Staging**
- Manual testing
- Automated E2E tests
- Performance testing
- Security scanning

**5. Deploy to Production**
```bash
# Create release PR
gh pr create --base main --head develop --title "Release: PRD-XXX Feature"

# After approval, merge to main
git checkout main
git pull origin main
git merge develop
git push origin main

# Tag release
git tag -a v1.x.0 -m "Release: PRD-XXX Feature"
git push origin v1.x.0
```

**6. Post-Deployment**
- Monitor error rates
- Check performance metrics
- Verify feature flag works
- Enable for internal users first
- Gradual rollout to all users

---

## ✅ Definition of Done

A feature is considered "done" when:

- [ ] All code merged to main branch
- [ ] All tests passing (80%+ coverage)
- [ ] Deployed to production
- [ ] Feature flag configured
- [ ] Documentation published
- [ ] Monitoring active
- [ ] Team trained
- [ ] Users notified

---

## 📞 Support

**Questions about integration?**
- Technical questions: #engineering on Slack
- Product questions: #product on Slack
- Documentation issues: Create GitHub issue

---

**Version:** 1.0  
**Last Updated:** February 8, 2026  
**Maintained By:** Engineering Team

*This guide evolves with our integration practices. Suggest improvements via PR.*

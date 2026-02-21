# 🗄️ Data Persistence Strategy for TiKiT OS Enhancements

**Version:** 1.0  
**Date:** February 2026  
**Status:** Approved Guideline

---

## 📋 Overview

This document defines the data persistence strategy for all TiKiT OS enhancements. It provides clear guidelines on what data should be persistent (stored in the database) versus non-persistent (cache, session, or computed on-demand).

**Purpose:** Ensure consistency, performance, and scalability while maintaining data integrity and audit requirements.

---

## 🎯 Core Principles

### 1. **Persistence by Default for Business Data**
- Any data that represents business value MUST be persistent
- Audit trail requirements drive persistence decisions
- Campaign-centric model: all data links to campaigns

### 2. **Performance Through Smart Caching**
- Computed/derived data should be cached, not stored
- Cache invalidation strategy is critical
- Real-time data can be ephemeral if reconstructable

### 3. **Compliance and Legal Requirements**
- Financial data: ALWAYS persistent with audit trail
- Contract data: ALWAYS persistent with versioning
- Approval records: ALWAYS persistent and immutable
- User actions: ALWAYS logged for audit

### 4. **Cost Optimization**
- Avoid storing easily recomputable data
- Archive old data to cheaper storage
- Use materialized views for expensive aggregations

---

## 📊 Data Classification Matrix

### ✅ PERSISTENT DATA (Database Storage)

#### Category 1: Core Business Entities
**Storage:** PostgreSQL (Supabase)  
**Backup:** Daily automated backups  
**Retention:** Indefinite (or per compliance policy)

**Examples:**
- Campaigns (all fields)
- Clients (profiles, contacts)
- Influencers (profiles, rates, availability)
- Briefs (raw and structured)
- Strategies (all versions)
- Content Tasks (all states)
- Content Artifacts (metadata and file references)
- Approvals (all records)
- Financial Objects (budgets, expenses, invoices, payments)
- Contracts (all versions)
- Users (profiles, preferences, permissions)

**Rationale:** Core to business operations, legal requirements, audit trail

---

#### Category 2: Analytics & Historical Data
**Storage:** PostgreSQL (with partitioning for large datasets)  
**Backup:** Daily automated backups  
**Retention:** 5+ years (or per compliance policy)

**Examples:**
- Campaign performance metrics (KPIs over time)
- Influencer performance history
- Content performance data
- Financial transactions and budget history
- Report snapshots
- A/B test results
- Conversion tracking data

**Rationale:** Required for trend analysis, ML training, compliance, reporting

---

#### Category 3: User Generated Content & Configuration
**Storage:** PostgreSQL (metadata) + Supabase Storage (files)  
**Backup:** Daily automated backups  
**Retention:** Based on campaign lifecycle + archive period

**Examples:**
- Custom report configurations
- Dashboard layouts
- Workflow automation rules
- Email templates
- Notification preferences
- Saved filters and views
- Custom fields and tags
- Best practices documentation
- Asset library content

**Rationale:** User investment in configuration, personalization value

---

#### Category 4: Audit & Compliance Data
**Storage:** PostgreSQL (append-only tables, partitioned by date)  
**Backup:** Daily automated backups + write-ahead logging  
**Retention:** 7+ years (regulatory compliance)

**Examples:**
- Audit logs (all user actions)
- State transition logs
- Approval history
- Contract change logs
- Financial transaction logs
- Data access logs
- Security events
- System configuration changes

**Rationale:** Legal requirements, compliance, security, investigation

---

#### Category 5: Machine Learning Models & Training Data
**Storage:** PostgreSQL (metadata) + Supabase Storage (model files)  
**Backup:** Versioned backups  
**Retention:** All model versions for rollback

**Examples:**
- ML model files and weights
- Training dataset references
- Model performance metrics
- Feature engineering configurations
- Prediction accuracy logs
- Model versioning metadata

**Rationale:** Model reproducibility, A/B testing, rollback capability

---

### ❌ NON-PERSISTENT DATA (Cache/Session/Computed)

#### Category 1: Real-Time Computed Metrics
**Storage:** Redis cache (if needed) or computed on-demand  
**TTL:** 5-60 minutes  
**Fallback:** Recompute from persistent data

**Examples:**
- Live dashboard statistics
- Current campaign status summaries
- Real-time budget utilization %
- Active user counts
- Trending content calculations
- Current portfolio health scores
- Resource utilization percentages

**Rationale:** Easily recomputed, high read frequency, changes frequently

---

#### Category 2: Temporary AI/ML Predictions
**Storage:** Memory or short-lived cache  
**TTL:** 15-30 minutes  
**Fallback:** Re-predict

**Examples:**
- Content performance predictions (before saved)
- Influencer match scores (during search)
- Budget estimate ranges (during planning)
- Risk score calculations (real-time)
- Optimization suggestions (ephemeral)
- Trend alignment scores

**Rationale:** Temporary aids for decision-making, saved only when acted upon

---

#### Category 3: Session State & User Context
**Storage:** Session storage (client) or Redis (server)  
**TTL:** Session duration  
**Fallback:** Re-establish from user profile

**Examples:**
- Active campaign filter selections
- Current page/tab state
- In-progress form data (auto-save drafts)
- UI state (expanded/collapsed sections)
- Shopping cart equivalents (before submission)
- Wizard/multi-step form progress

**Rationale:** User convenience, no business value until committed

---

#### Category 4: API Response Caches
**Storage:** Redis or CDN edge cache  
**TTL:** 1-60 minutes (based on data volatility)  
**Fallback:** Re-fetch from database

**Examples:**
- Paginated list responses
- Static reference data (countries, platforms)
- Frequently accessed read-only data
- Public-facing reports
- Influencer search results

**Rationale:** Reduce database load, improve response times

---

#### Category 5: File Processing Intermediates
**Storage:** Temporary file system or S3 with lifecycle policy  
**TTL:** 24 hours  
**Fallback:** Re-process if needed

**Examples:**
- Uploaded files during processing
- Image thumbnails (before optimization)
- PDF extractions (temporary)
- Video transcoding intermediates
- CSV import staging data

**Rationale:** Transient processing state, discarded after completion

---

## 🔄 Data Lifecycle Management

### Persistent Data Lifecycle

```
1. Creation
   ↓
2. Active Use (hot storage - PostgreSQL)
   ↓
3. Completed Campaign (warm storage - PostgreSQL with indexing)
   ↓
4. Archive (6+ months old - PostgreSQL partitioned tables)
   ↓
5. Long-term Retention (3+ years - compressed storage)
   ↓
6. Deletion (if allowed by compliance - soft delete)
```

### Non-Persistent Data Lifecycle

```
1. Compute/Generate
   ↓
2. Cache (Redis with TTL)
   ↓
3. Serve to client
   ↓
4. Expire (automatic TTL)
   ↓
5. Purge from cache
```

---

## 📐 Decision Framework

### When to Make Data Persistent

Ask these questions:

1. **Business Value:** Does this data represent a business decision or action?
   - YES → Persistent
   - NO → Continue

2. **Audit Trail:** Do we need to prove this data existed at a specific time?
   - YES → Persistent
   - NO → Continue

3. **Legal/Compliance:** Is this required for contracts, payments, or regulations?
   - YES → Persistent
   - NO → Continue

4. **Historical Analysis:** Will we analyze this data over time?
   - YES → Persistent
   - NO → Continue

5. **User Investment:** Did the user spend significant time creating this?
   - YES → Persistent
   - NO → Continue

6. **Reproducibility:** Can this be easily and cheaply recomputed?
   - NO → Persistent
   - YES → Non-Persistent (cache)

---

## 🎯 Enhancement-Specific Guidelines

### PRD-001: Advanced Analytics & BI Dashboard

**Persistent:**
- Custom report configurations
- Saved dashboard layouts
- Report snapshots (for historical comparison)
- Scheduled report settings
- User-defined KPI thresholds
- Historical metric data points

**Non-Persistent:**
- Live dashboard calculations
- Real-time chart data (cached 5 min)
- Export file generation (24h TTL)
- Preview calculations

---

### PRD-002: AI Content Performance Prediction

**Persistent:**
- Model training metadata
- Prediction results (when user saves/acts on them)
- Model performance metrics
- Feature importance logs
- User feedback on predictions (accuracy)

**Non-Persistent:**
- Real-time prediction scores (15 min cache)
- Optimization suggestions (until saved)
- What-if scenario calculations
- A/B test simulations

---

### PRD-003: Multi-Campaign Portfolio Management

**Persistent:**
- Resource allocation decisions
- Capacity planning configurations
- Team assignments across campaigns
- Timeline constraints
- Priority rankings

**Non-Persistent:**
- Real-time resource availability (5 min cache)
- Conflict detection results (computed)
- Optimization suggestions (until approved)
- Utilization percentages (computed)

---

### PRD-004: Influencer Relationship Management

**Persistent:**
- Relationship tier classifications
- Communication logs
- Notes and interactions
- Milestone tracking
- Performance history
- Contract preferences

**Non-Persistent:**
- Relationship health scores (computed daily)
- Engagement opportunity alerts (until addressed)
- Outreach template previews

---

### PRD-005: Contract & Legal Compliance

**Persistent:**
- Contract documents (all versions)
- E-signature records
- Compliance checklist completions
- Rights management logs
- Expiration dates
- Amendment history

**Non-Persistent:**
- Document preview renders
- Template merge previews
- Validation check results (re-run on demand)

---

### PRD-006: Advanced Workflow Automation

**Persistent:**
- Workflow definitions
- Trigger configurations
- Execution history
- Error logs
- Automation statistics

**Non-Persistent:**
- Workflow execution state (until completion)
- Preview/dry-run results
- Temporary variables during execution

---

### PRD-007: White-Label Client Portal

**Persistent:**
- Client branding configurations
- Portal access permissions
- Custom domain settings
- Client communication logs
- Portal activity logs

**Non-Persistent:**
- Session tokens
- Real-time notifications (until seen)
- Cached dashboard data (5 min)

---

### PRD-008: Competitive Intelligence

**Persistent:**
- Competitor campaign records
- Industry benchmarks (snapshots)
- Tracked metrics over time
- Alert configurations
- Saved searches

**Non-Persistent:**
- Real-time trend calculations
- Viral content rankings (cached hourly)
- Market rate estimates (cached daily)

---

### PRD-009: Advanced Budget Forecasting

**Persistent:**
- Budget scenarios
- Forecast models
- Actual vs. predicted variance logs
- Financial goal definitions
- Alert thresholds

**Non-Persistent:**
- Live forecast calculations
- What-if scenario results (until saved)
- Budget optimization suggestions

---

### PRD-010: Content Asset Library

**Persistent:**
- Asset metadata (all fields)
- File references
- Tags and categories
- Usage history
- Best practice documents
- Template versions

**Non-Persistent:**
- Search result rankings (computed)
- AI-generated tag suggestions (until approved)
- Similarity scores (computed)

---

## 💾 Implementation Patterns

### Pattern 1: Computed Fields with Caching

```typescript
// Example: Campaign health score
class CampaignHealthService {
  async getHealthScore(campaignId: string): Promise<number> {
    // Check cache first
    const cached = await redis.get(`health:${campaignId}`);
    if (cached) return JSON.parse(cached);
    
    // Compute from persistent data
    const score = await this.computeHealthScore(campaignId);
    
    // Cache for 10 minutes
    await redis.setex(`health:${campaignId}`, 600, JSON.stringify(score));
    
    return score;
  }
}
```

### Pattern 2: Persist on User Action

```typescript
// Example: Save AI prediction when user acts on it
async approvePrediction(predictionId: string, userId: string) {
  // Prediction was ephemeral, now persist it
  const prediction = await this.getTempPrediction(predictionId);
  
  await db.contentPredictions.create({
    ...prediction,
    status: 'approved',
    approvedBy: userId,
    approvedAt: new Date(),
  });
  
  // Clear temp prediction
  await redis.del(`prediction:${predictionId}`);
}
```

### Pattern 3: Materialized Views for Heavy Queries

```sql
-- Example: Campaign portfolio summary
CREATE MATERIALIZED VIEW campaign_portfolio_summary AS
SELECT 
  client_id,
  COUNT(*) as total_campaigns,
  SUM(budget_total) as total_budget,
  AVG(risk_score) as avg_risk,
  -- ... more aggregations
FROM campaigns
WHERE deleted_at IS NULL
GROUP BY client_id;

-- Refresh periodically (e.g., hourly via cron)
REFRESH MATERIALIZED VIEW campaign_portfolio_summary;
```

---

## 🔒 Security & Privacy

### Data at Rest
- **Persistent Data:** Encrypted at rest (Supabase default)
- **Sensitive Fields:** Additional field-level encryption (PII, financial)
- **Backups:** Encrypted backups with separate keys

### Data in Transit
- **All APIs:** HTTPS/TLS 1.3
- **Cache:** Redis over TLS
- **Internal Services:** VPC with encryption

### Data Retention
- **Active Data:** As long as needed
- **Archived Data:** Per compliance (5-7 years)
- **User Deletion:** Right to be forgotten (GDPR)

---

## 📊 Monitoring & Optimization

### Metrics to Track

**Persistent Data:**
- Database size growth rate
- Query performance (P95, P99)
- Index efficiency
- Backup completion time

**Non-Persistent Data:**
- Cache hit rates
- Cache eviction rates
- Average cache TTL effectiveness
- Memory usage

### Optimization Strategies

1. **Partition large tables** (audit logs by date)
2. **Archive old campaigns** (after 6-12 months)
3. **Optimize indexes** (based on query patterns)
4. **Tune cache TTLs** (based on data volatility)
5. **Implement lazy loading** (load data on demand)

---

## ✅ Checklist for New Features

When adding a new feature, answer:

- [ ] What data is created?
- [ ] Is it persistent or non-persistent?
- [ ] If persistent, what's the backup strategy?
- [ ] If persistent, what's the retention period?
- [ ] If non-persistent, what's the TTL?
- [ ] If non-persistent, what's the fallback?
- [ ] Is audit logging required?
- [ ] Is encryption required?
- [ ] What are the performance implications?
- [ ] How will this scale with data growth?

---

## 📚 References

- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [GDPR Compliance](https://gdpr.eu/)

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial persistence strategy |

---

**Owner:** Engineering Team  
**Reviewers:** Product Council, Security Team, Compliance  
**Status:** ✅ Approved

*Last updated: February 8, 2026*

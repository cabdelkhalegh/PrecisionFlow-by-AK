# 📊 PRD-001: Advanced Analytics & Business Intelligence Dashboard

**Feature Name:** Advanced Analytics & Business Intelligence Dashboard  
**PRD ID:** PRD-001  
**Version:** 1.0  
**Date:** February 8, 2026  
**Owner:** Product Team - TiKiT OS  
**Status:** Draft - Awaiting Council Review

---

## 1. Executive Summary

### 1.1 Overview
The Advanced Analytics & BI Dashboard transforms raw campaign data into actionable business intelligence through real-time dashboards, custom report builders, and predictive insights. This flagship feature enables data-driven decision-making across all levels of the organization, from campaign managers optimizing individual campaigns to executives tracking portfolio performance.

### 1.2 Vision Statement
Empower every TiKiT OS user with instant, visual access to the insights that matter most, transforming data from a byproduct into a strategic competitive advantage.

### 1.3 Success Metrics
- **Primary Metric:** Reduce time spent on data analysis and reporting by 75% (from 8 hours/week to 2 hours/week per user)
- **Secondary Metrics:**
  - Increase data-driven decision making by 60% (measured by decisions backed by dashboard data)
  - Improve campaign performance by 30% through better insights and optimization
  - Achieve 90%+ user adoption within 3 months of launch
  - Reduce client reporting overhead by 65%

---

## 2. Problem Statement

### 2.1 User Pain Points

**Pain Point #1: Manual, Time-Consuming Data Analysis**
- **Impact:** Campaign managers spend 6-8 hours/week manually extracting, aggregating, and analyzing campaign data from multiple sources
- **Evidence:** User interviews show 85% of users cite reporting as their #1 time sink; support tickets request "export to Excel" features constantly

**Pain Point #2: Lack of Real-Time Visibility**
- **Impact:** Directors and executives lack real-time visibility into campaign health, budget utilization, and resource allocation
- **Evidence:** Leadership meetings delayed 2-3 days waiting for reports; 70% of strategic decisions made with stale data (>48 hours old)

**Pain Point #3: Inability to Identify Trends and Patterns**
- **Impact:** Agencies miss optimization opportunities and fail to replicate successful strategies because insights are trapped in individual campaigns
- **Evidence:** Post-campaign analysis reveals 40% of issues could have been prevented with earlier detection; 60% of successful tactics never reused

**Pain Point #4: Inconsistent Reporting Across Teams**
- **Impact:** Different teams create different reports with conflicting numbers, leading to confusion and distrust in data
- **Evidence:** 45% of leadership meetings start with "alignment on numbers"; data reconciliation consumes 3-4 hours/week

**Pain Point #5: Client Reporting Burden**
- **Impact:** Creating client-facing reports is manual, time-consuming, and error-prone
- **Evidence:** Each client report takes 2-4 hours to create; 30% contain errors requiring corrections; clients request updates every 2-3 days

### 2.2 Current Workarounds
- **Manual Excel Exports:** Users export data to Excel, spend hours cleaning and analyzing
  - Pain: Error-prone, time-consuming, not real-time
- **Database Queries:** Technical users write custom SQL queries
  - Pain: Requires technical skills, not accessible to all users, no visualization
- **External BI Tools:** Some agencies use Tableau/PowerBI
  - Pain: Expensive, disconnected from TiKiT OS, requires double data entry
- **Screenshot Sharing:** Teams share screenshots of individual campaign screens
  - Pain: Not aggregated, quickly outdated, no drill-down capability

### 2.3 Business Impact of NOT Solving
- **Cost of Inaction:** 
  - $50K-100K/year per agency in wasted analyst time (8 hrs/week × 50 weeks × $25/hr × 10 team members)
  - 20-30% reduction in campaign performance due to delayed insights
  - Client churn due to poor reporting experience (15-20% higher churn)
- **Competitive Disadvantage:** Competitors with better analytics retain clients longer and charge premium prices
- **User Churn Risk:** Medium - users don't leave over this alone, but it's a constant frustration that reduces NPS

---

## 3. Target Users

### 3.1 Primary Users

**User Persona 1: Campaign Managers**
- **Use Case:** Monitor campaign performance in real-time, identify issues early, optimize tactics mid-campaign
- **Frequency:** Multiple times daily
- **Technical Skill:** Medium - comfortable with dashboards and filters
- **Key Needs:** 
  - Quick campaign health overview
  - Drill-down into specific metrics
  - Compare content performance
  - Track budget utilization

**User Persona 2: Directors/Leadership**
- **Use Case:** Portfolio-level visibility, strategic decision-making, team performance tracking
- **Frequency:** Daily summary views, weekly deep dives
- **Technical Skill:** Medium - need simple, visual summaries
- **Key Needs:**
  - Executive dashboard (portfolio health at a glance)
  - Cross-campaign comparisons
  - Resource utilization metrics
  - ROI and profitability tracking

**User Persona 3: Finance/Operations**
- **Use Case:** Financial tracking, budget vs. actual analysis, invoice reconciliation
- **Frequency:** Weekly for tracking, monthly for reporting
- **Technical Skill:** Medium-High - comfortable with financial reports
- **Key Needs:**
  - Budget utilization tracking
  - Cash flow projections
  - Profitability by campaign/client
  - Financial variance reports

### 3.2 Secondary Users

**Persona 4: Clients (via White-Label Portal)**
- **Use Case:** Self-service campaign performance tracking
- **Frequency:** Weekly or on-demand
- **Technical Skill:** Low-Medium
- **Key Needs:** Simple, visual campaign progress and results

**Persona 5: Sales/Business Development**
- **Use Case:** Portfolio showcasing, performance proof points for prospects
- **Frequency:** As needed for pitches
- **Technical Skill:** Medium
- **Key Needs:** Impressive visual reports, export capabilities

---

## 4. Goals & Objectives

### 4.1 Business Objectives

| Objective | Target | Timeline | Measurement |
|-----------|--------|----------|-------------|
| Reduce reporting time | -75% (8hrs → 2hrs/week) | Q2 2026 | Time tracking surveys |
| Increase campaign performance | +30% avg engagement rate | Q3 2026 | Campaign KPI data |
| Improve data-driven decisions | 60% of decisions cite dashboard data | Q3 2026 | Decision logs |
| Achieve user adoption | 90%+ weekly active usage | Q2 2026 | Analytics data |
| Reduce client reporting overhead | -65% time spent | Q3 2026 | Time tracking |
| Enable premium pricing | +15% price increase for analytics tier | Q4 2026 | Revenue data |

### 4.2 User Objectives

1. **Objective 1:** Campaign managers can assess campaign health in <30 seconds
2. **Objective 2:** Directors get portfolio-wide insights without manual data collection
3. **Objective 3:** Finance team has real-time budget tracking without spreadsheets
4. **Objective 4:** Any user can create custom reports without technical skills
5. **Objective 5:** Clients receive automated, accurate reports on their preferred schedule

### 4.3 Non-Goals

- [ ] Advanced statistical modeling or AI predictions (covered in PRD-002)
- [ ] External data integrations (social media APIs) - future enhancement
- [ ] Data warehouse or OLAP cubes - stay with PostgreSQL
- [ ] Mobile-native analytics app - web responsive is sufficient for MVP
- [ ] Real-time streaming dashboards (sub-second updates) - 1-5 minute refresh is acceptable

---

## 5. Feature Requirements

### 5.1 Must-Have Features (P0 - MVP)

#### Feature 1: Executive Dashboard
- **Description:** Pre-built dashboard showing portfolio-level KPIs and health metrics
- **User Story:** As a Director, I want to see all my active campaigns' health at a glance so that I can identify problems before they escalate
- **Acceptance Criteria:**
  - [ ] Shows portfolio summary (total campaigns, active, completed, budget utilization)
  - [ ] Displays top 5 at-risk campaigns with risk indicators
  - [ ] Shows aggregate KPIs (total reach, engagement, conversions)
  - [ ] Includes budget tracking (planned vs. actual) with variance indicators
  - [ ] Updates every 5 minutes (real-time via Supabase subscriptions)
  - [ ] Responsive design (desktop, tablet)
- **Data Persistence:** ✅ Dashboard configuration persistent, ❌ Chart data computed/cached (5 min TTL)

#### Feature 2: Campaign Performance Dashboard
- **Description:** Detailed dashboard for individual campaign metrics and trends
- **User Story:** As a Campaign Manager, I want to track all my campaign metrics in one place so that I can optimize performance without switching contexts
- **Acceptance Criteria:**
  - [ ] Campaign overview card (status, dates, budget, team)
  - [ ] Key metrics widgets (reach, engagement rate, conversions, ROI)
  - [ ] Trend charts (performance over time)
  - [ ] Content performance breakdown (by influencer, by platform, by type)
  - [ ] Budget utilization gauge with projections
  - [ ] Risk flags prominently displayed
  - [ ] Approval status tracking
  - [ ] Date range selector
- **Data Persistence:** ✅ Historical metrics persistent, ❌ Computed aggregations cached

#### Feature 3: Custom Report Builder
- **Description:** Drag-and-drop interface to build custom reports with any metrics and dimensions
- **User Story:** As a user, I want to create custom reports for my specific needs so that I don't have to request engineering help
- **Acceptance Criteria:**
  - [ ] Drag-and-drop interface for adding/arranging widgets
  - [ ] Widget library: KPI cards, line charts, bar charts, pie charts, tables, gauges
  - [ ] Metrics selector: choose from all available campaign/content/financial metrics
  - [ ] Dimension selector: group by campaign, client, influencer, date, etc.
  - [ ] Filter builder: flexible filtering (date range, status, client, etc.)
  - [ ] Save report configurations with names
  - [ ] Share reports with team members
  - [ ] Set as default dashboard
  - [ ] Preview before saving
- **Data Persistence:** ✅ Report configurations persistent, ❌ Report data computed on-demand

#### Feature 4: Cross-Campaign Analytics
- **Description:** Compare and analyze multiple campaigns side-by-side
- **User Story:** As a Director, I want to compare campaigns to identify what works so that I can replicate success
- **Acceptance Criteria:**
  - [ ] Select multiple campaigns for comparison
  - [ ] Side-by-side metric comparison table
  - [ ] Performance distribution charts (scatter, box plots)
  - [ ] Identify top/bottom performers
  - [ ] Statistical summaries (averages, medians, ranges)
  - [ ] Export comparison data
  - [ ] Filter by date range, client, campaign type
- **Data Persistence:** ❌ All computed on-demand from persistent campaign data

#### Feature 5: Report Export & Scheduling
- **Description:** Export reports in multiple formats and schedule automated delivery
- **User Story:** As a Campaign Manager, I want to export reports for clients so that I can deliver professional, accurate updates
- **Acceptance Criteria:**
  - [ ] Export to PDF (formatted, branded)
  - [ ] Export to Excel (.xlsx with multiple sheets)
  - [ ] Export to CSV (raw data)
  - [ ] Schedule reports (daily, weekly, monthly)
  - [ ] Email delivery to specified recipients
  - [ ] Include/exclude sections
  - [ ] Logo and branding customization
  - [ ] Export queuing for large reports
- **Data Persistence:** ✅ Scheduled report configs persistent, ❌ Generated files temporary (24hr TTL)

#### Feature 6: Real-Time Data Updates
- **Description:** Dashboard automatically updates when underlying data changes
- **User Story:** As a user, I want my dashboard to stay current so that I always have accurate information
- **Acceptance Criteria:**
  - [ ] Subscribe to relevant data changes (Supabase Realtime)
  - [ ] Update dashboard widgets automatically
  - [ ] Show "last updated" timestamp
  - [ ] Handle concurrent updates gracefully
  - [ ] Refresh button for manual refresh
  - [ ] Notification of significant changes (threshold-based)
- **Data Persistence:** ❌ Real-time subscriptions in-memory, persistent data triggers updates

### 5.2 Should-Have Features (P1 - v1.1)

#### Feature 7: Advanced Filtering & Segmentation
- **Description:** Create complex filters and segments for deep analysis
- **User Story:** As an analyst, I want to segment campaigns by multiple criteria so that I can identify patterns
- **Acceptance Criteria:**
  - [ ] Multi-condition filters (AND/OR logic)
  - [ ] Saved filter sets
  - [ ] Quick filters (pre-defined common filters)
  - [ ] Filter suggestions based on data
- **Data Persistence:** ✅ Saved filters persistent

#### Feature 8: Drill-Down & Drill-Through
- **Description:** Click on any metric to see underlying details
- **User Story:** As a user, I want to investigate anomalies by drilling into details so that I understand the root cause
- **Acceptance Criteria:**
  - [ ] Click any chart element to see details
  - [ ] Breadcrumb navigation
  - [ ] Drill through to source records
  - [ ] Contextual actions (e.g., view campaign, contact influencer)
- **Data Persistence:** ❌ Drill-down paths session-based

#### Feature 9: Goal Setting & Tracking
- **Description:** Set KPI targets and track progress
- **User Story:** As a Campaign Manager, I want to set goals and track progress so that I know if I'm on track
- **Acceptance Criteria:**
  - [ ] Set goals for any metric
  - [ ] Visual progress indicators
  - [ ] Alerts when off-track
  - [ ] Historical goal achievement tracking
- **Data Persistence:** ✅ Goals and achievement history persistent

### 5.3 Nice-to-Have Features (P2 - v1.2+)

#### Feature 10: Predictive Analytics Integration
- **Description:** Show AI-generated predictions and forecasts (leverages PRD-002)
- **Data Persistence:** ✅ When user acts on predictions, ❌ Temporary predictions cached

#### Feature 11: Anomaly Detection
- **Description:** Automatically flag unusual metric changes
- **Data Persistence:** ✅ Flagged anomalies persistent, ❌ Detection algorithm results cached

#### Feature 12: Benchmarking
- **Description:** Compare campaigns against industry benchmarks
- **Data Persistence:** ✅ Benchmark data persistent (refreshed monthly)

---

## 6. User Experience

### 6.1 User Flows

#### Flow 1: Quick Campaign Health Check (Primary Flow)
1. User logs into TiKiT OS → lands on Executive Dashboard
2. User scans portfolio summary → sees 3 campaigns flagged as "at risk"
3. User clicks on at-risk campaign → Campaign Performance Dashboard loads
4. Dashboard shows budget utilization at 95% with 40% timeline remaining
5. User drills down to content performance → identifies underperforming influencer
6. User takes action: contacts influencer or adjusts strategy

**Time to insight:** <60 seconds (vs. 2-4 hours manually)

#### Flow 2: Creating a Custom Report for Client
1. User navigates to Reports → Custom Report Builder
2. User selects template: "Client Performance Report"
3. User drags KPI cards: Reach, Engagement Rate, Conversions
4. User adds line chart: Performance over time
5. User adds table: Top performing content
6. User filters: specific campaign, last 30 days
7. User previews → adjusts branding
8. User saves report: "Client X - Monthly Update"
9. User schedules: email to client every Monday 9am
10. User exports now: generates PDF, emails to self for review

**Time to create:** <10 minutes (vs. 2-4 hours manually)

#### Flow 3: Director's Monday Morning Portfolio Review
1. Director opens Executive Dashboard on tablet
2. Views portfolio summary: 15 active campaigns, 85% budget utilized
3. Reviews top risks: 2 campaigns need attention
4. Views cross-campaign analytics: identifies top-performing influencer category
5. Shares insight with team via Slack (screenshot + link to dashboard)
6. Schedules 1:1 with campaign manager on at-risk campaign

**Time to review:** <5 minutes (vs. 1-2 hours waiting for reports)

### 6.2 UI/UX Requirements

- **Design Principles:**
  - **Clarity First:** Every chart must have a clear title, axis labels, and units
  - **Progressive Disclosure:** Show summaries first, details on demand
  - **Consistent Visual Language:** Use same colors, fonts, spacing across all charts
  - **Action-Oriented:** Every insight should suggest next actions
  - **Fast & Responsive:** <2s initial load, instant interactions

- **Accessibility:**
  - [x] WCAG 2.1 AA compliant
  - [x] Keyboard navigation (tab through widgets, arrow keys for charts)
  - [x] Screen reader support (all charts have text alternatives)
  - [x] Color-blind friendly palettes
  - [x] High contrast mode

- **Responsive Design:**
  - [x] Desktop (1920px+): Full dashboard with multiple widgets
  - [x] Tablet (768px-1920px): Responsive grid, 2-3 columns
  - [x] Mobile (320px-768px): Single column, scrollable, critical metrics first

### 6.3 Wireframes/Mockups
See `MOCKUPS/` folder for detailed wireframes (to be created in design phase)

**Key Screens:**
- Executive Dashboard (portfolio view)
- Campaign Performance Dashboard (single campaign)
- Custom Report Builder (drag-and-drop interface)
- Report Export Dialog
- Chart Drill-Down Modal

---

## 7. Technical Specifications

### 7.1 Architecture Overview

```
User Browser
    ↓
Next.js 14 (App Router)
    ↓
tRPC API Layer
    ↓
Analytics Service (TypeScript)
    ├── Query Builder
    ├── Aggregation Engine
    ├── Cache Layer (Redis)
    └── Report Generator
    ↓
Supabase PostgreSQL
    ├── Campaign Data (source)
    ├── Metrics Tables (pre-aggregated)
    ├── Materialized Views (heavy queries)
    └── Real-time Subscriptions
    ↓
Supabase Storage
    └── Generated Reports (PDF/Excel, 24hr TTL)

UI Components:
- Recharts (charting library)
- TanStack Table (data tables)
- React Query (data fetching & caching)
- Zustand (UI state)
```

**Key Design Decisions:**
1. **Materialized Views:** For expensive aggregations (portfolio summaries), refresh every 5 minutes
2. **Redis Caching:** Cache computed results for 5-10 minutes to reduce DB load
3. **Incremental Aggregation:** Update metrics incrementally, not full recalculation
4. **Streaming Exports:** For large reports, stream data to avoid memory issues

### 7.2 Data Model

See `DATA_MODEL.md` for complete schema.

**New Tables:**

```sql
-- Store report configurations
CREATE TABLE report_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('dashboard', 'report', 'export')),
  config JSONB NOT NULL, -- Widget layout, metrics, filters
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE, -- Shared with team
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store scheduled reports
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_config_id UUID NOT NULL REFERENCES report_configs(id),
  schedule_cron TEXT NOT NULL, -- Cron expression
  recipients TEXT[] NOT NULL, -- Email addresses
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'csv')),
  enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store user goals for tracking
CREATE TABLE metric_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  user_id UUID NOT NULL REFERENCES users(id),
  metric_name TEXT NOT NULL, -- 'reach', 'engagement_rate', etc.
  target_value NUMERIC NOT NULL,
  target_date DATE,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-aggregated campaign metrics (for performance)
CREATE TABLE campaign_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  date DATE NOT NULL,
  metrics JSONB NOT NULL, -- All metrics for that day
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Materialized view for portfolio summary (refreshed every 5 min)
CREATE MATERIALIZED VIEW portfolio_summary AS
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(*) FILTER (WHERE status = 'active') as active_campaigns,
  COUNT(*) FILTER (WHERE risk_level = 'high') as high_risk_campaigns,
  SUM(budget_total) as total_budget,
  SUM(budget_spent) as total_spent,
  AVG(CASE WHEN budget_total > 0 THEN (budget_spent::numeric / budget_total * 100) ELSE 0 END) as avg_budget_utilization
FROM campaigns
WHERE deleted_at IS NULL;

CREATE INDEX idx_report_configs_user ON report_configs(user_id);
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_run_at) WHERE enabled = TRUE;
CREATE INDEX idx_campaign_metrics_campaign_date ON campaign_metrics_daily(campaign_id, date DESC);
```

**Modified Tables:**
- None - all new tables

### 7.3 API Endpoints

See `API_SPEC.md` for complete API documentation.

**New tRPC Procedures:**

```typescript
analytics.getDashboard({ type: 'executive' | 'campaign', campaignId?: string })
analytics.getMetrics({ campaignIds: string[], metrics: string[], dateRange: { from: Date, to: Date } })
analytics.compareCampaigns({ campaignIds: string[], metrics: string[] })
analytics.createReport({ name: string, config: ReportConfig })
analytics.updateReport({ reportId: string, config: Partial<ReportConfig> })
analytics.deleteReport({ reportId: string })
analytics.exportReport({ reportId: string, format: 'pdf' | 'excel' | 'csv' })
analytics.scheduleReport({ reportId: string, schedule: string, recipients: string[], format: string })
analytics.setGoal({ campaignId: string, metric: string, targetValue: number, targetDate: Date })
analytics.getGoals({ campaignId?: string, userId?: string })
```

### 7.4 Third-Party Integrations

| Service | Purpose | Pricing | Free Tier |
|---------|---------|---------|-----------|
| Recharts | Charting library | Free | Open source |
| jsPDF | PDF generation | Free | Open source |
| ExcelJS | Excel generation | Free | Open source |
| html2canvas | Dashboard screenshots | Free | Open source |

**No paid services required for MVP**

### 7.5 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load Time | < 2s (P95) | Lighthouse |
| Chart Render Time | < 500ms | Browser Performance API |
| API Response Time (simple query) | < 200ms (P95) | APM |
| API Response Time (complex aggregation) | < 1s (P95) | APM |
| Export Generation (PDF) | < 5s | Server logs |
| Export Generation (Excel) | < 10s | Server logs |
| Cache Hit Rate | > 70% | Redis metrics |
| Database Query Time | < 500ms (P95) | pg_stat_statements |

### 7.6 Scalability Considerations

**Concurrent Users:** 
- MVP: 100 concurrent users
- Scale target: 1,000 concurrent users

**Data Volume:**
- MVP: 1,000 campaigns, 10,000 content tasks, 1M metric data points
- Growth: 10K campaigns/year, 100K tasks/year, 10M metric data points/year

**Scaling Strategies:**
1. **Read Replicas:** Add PostgreSQL read replicas for analytics queries (Supabase Pro)
2. **Partitioning:** Partition `campaign_metrics_daily` by date (monthly partitions)
3. **Incremental Aggregation:** Compute daily metrics once, aggregate on read
4. **Query Optimization:** Use materialized views, proper indexes
5. **Connection Pooling:** PgBouncer for connection management (Supabase default)

---

## 8. Data Persistence Strategy

### 8.1 Persistent Data (Database)

| Data Type | Table | Retention | Backup | Audit Trail |
|-----------|-------|-----------|--------|-------------|
| Report Configurations | `report_configs` | Indefinite | Daily | Yes (updated_at) |
| Scheduled Reports | `scheduled_reports` | Indefinite | Daily | Yes (execution logs) |
| User Goals | `metric_goals` | Campaign lifetime + 2 years | Daily | Yes |
| Daily Campaign Metrics | `campaign_metrics_daily` | 5 years | Daily | No |
| Generated Report Metadata | `report_exports` | 30 days | Daily | Yes |

### 8.2 Non-Persistent Data (Cache/Computed)

| Data Type | Storage | TTL | Fallback |
|-----------|---------|-----|----------|
| Dashboard Chart Data | Redis | 5 min | Recompute from DB |
| Portfolio Summary | Materialized View | 5 min refresh | Refresh now |
| Metric Aggregations | Redis | 10 min | Recompute |
| Cross-Campaign Comparisons | Computed | N/A | Compute on-demand |
| Export Preview | Memory | Session | Re-generate |

### 8.3 File Storage

| File Type | Bucket | Retention | CDN | Versioning |
|-----------|--------|-----------|-----|------------|
| PDF Exports | `reports` | 24 hours | Yes | No |
| Excel Exports | `reports` | 24 hours | Yes | No |
| Dashboard Screenshots | `reports` | 24 hours | Yes | No |

**Rationale:** 
- Exported reports are regeneratable from persistent data
- 24-hour retention allows users to re-download same day
- Automatic cleanup reduces storage costs

---

## 9. Security & Privacy

### 9.1 Security Requirements
- [x] Authentication required (Supabase Auth)
- [x] Role-based access control:
  - Campaign Managers: See their campaigns only
  - Directors: See all campaigns in their organization
  - Clients: See only their campaigns (if client portal enabled)
- [x] Row-level security policies on all analytics tables
- [x] Data encryption at rest (Supabase default)
- [x] Data encryption in transit (TLS 1.3)
- [x] Input validation (Zod schemas for all API inputs)
- [x] SQL injection prevention (parameterized queries only)
- [x] XSS prevention (React auto-escaping)
- [x] Rate limiting: 300 req/min per user

### 9.2 Privacy & Compliance
- [x] GDPR compliant:
  - Report configs deleted when user deleted
  - Scheduled reports canceled when user deleted
  - Metrics anonymized after 5 years
- [x] Audit trail: All report creations, exports, schedules logged
- [x] No PII in analytics: Only aggregate metrics, no influencer personal data displayed
- [x] Data retention: 5 years for metrics, indefinite for configs
- [x] User consent: Users agree to analytics tracking in ToS

### 9.3 Access Control Matrix

| User Role | View Dashboards | Create Reports | Schedule Reports | Export Reports | View All Campaigns |
|-----------|-----------------|----------------|------------------|-----------------|--------------------|
| Campaign Manager | ✅ (own campaigns) | ✅ | ✅ | ✅ | ❌ |
| Director | ✅ (all) | ✅ | ✅ | ✅ | ✅ |
| Finance | ✅ (all) | ✅ | ✅ | ✅ | ✅ |
| Client | ✅ (own campaigns) | ❌ | ❌ | ✅ | ❌ |
| Admin | ✅ (all) | ✅ | ✅ | ✅ | ✅ |

---

## 10. Testing Strategy

### 10.1 Test Coverage Requirements
- [x] Unit tests: 80%+ coverage
  - Analytics service functions
  - Query builders
  - Aggregation logic
  - Export generators
- [x] Integration tests: All API endpoints
  - Dashboard data fetching
  - Report CRUD operations
  - Export generation
  - Scheduled reports
- [x] E2E tests: Critical user flows
  - View executive dashboard
  - Create custom report
  - Export to PDF
  - Schedule report delivery
- [x] Performance tests:
  - Load test: 100 concurrent dashboard viewers
  - Stress test: 1,000 metrics query
  - Export test: Large report generation
- [x] Security tests:
  - RLS policy enforcement
  - Permission checks
  - SQL injection attempts

### 10.2 Key Test Scenarios

#### Scenario 1: Dashboard Loads with Correct Data
- **Given:** User has 5 active campaigns with metrics
- **When:** User opens Executive Dashboard
- **Then:** 
  - Portfolio summary shows 5 campaigns
  - Budget utilization matches database
  - At-risk campaigns correctly identified
  - Charts render within 2 seconds

#### Scenario 2: Report Export Succeeds
- **Given:** User has created a custom report with 10 metrics
- **When:** User clicks "Export to PDF"
- **Then:**
  - PDF generates within 5 seconds
  - All metrics correctly displayed
  - Branding applied
  - File downloads successfully

#### Scenario 3: Scheduled Report Delivers on Time
- **Given:** User has scheduled a weekly report for Monday 9am
- **When:** Monday 9am arrives
- **Then:**
  - Report generates automatically
  - Email sent to all recipients
  - Report contains current data (not stale)
  - Next run scheduled for following Monday

### 10.3 QA Checklist
- [ ] Feature works on Chrome, Firefox, Safari, Edge
- [ ] Feature works on iPad and Android tablets
- [ ] All charts render correctly with real data
- [ ] Export formats (PDF, Excel, CSV) are valid and openable
- [ ] Errors display user-friendly messages
- [ ] Loading states shown during data fetching
- [ ] Feature is accessible (keyboard nav, screen reader)
- [ ] Performance targets met (load < 2s, API < 500ms)
- [ ] RLS policies prevent unauthorized access
- [ ] No console errors in production build

---

## 11. Launch Plan

### 11.1 Phased Rollout

**Phase 1: Internal Alpha (Week 1-2) - Feb 15-28, 2026**
- Deploy to staging environment
- Internal team testing (10 users)
- Focus: Bug fixes, UX refinement, performance tuning
- Deliverables:
  - Executive Dashboard (Feature 1)
  - Campaign Performance Dashboard (Feature 2)
  - Basic export (PDF only)

**Phase 2: Beta (Week 3-6) - Mar 1-28, 2026**
- Deploy to production with feature flag
- Select beta customers (20 agencies, ~100 users)
- Focus: Real-world usage feedback, scalability testing
- Deliverables:
  - Custom Report Builder (Feature 3)
  - Cross-Campaign Analytics (Feature 4)
  - Full export suite (PDF, Excel, CSV)
  - Report scheduling (Feature 5)

**Phase 3: General Availability (Week 7) - Apr 1, 2026**
- Feature flag enabled for all users
- Marketing announcement (blog post, email, social)
- Documentation published
- Onboarding tour for new users
- Deliverables:
  - Real-time updates (Feature 6)
  - All P0 features complete
  - Video tutorials published

**Phase 4: Iteration (Week 8-12) - Apr-May 2026**
- Monitor adoption and usage
- Gather feedback
- Implement P1 features based on priority
- Continuous optimization

### 11.2 Success Criteria

| Criterion | Target | Measurement | Status |
|-----------|--------|-------------|--------|
| User adoption | 90% WAU (weekly active users) | Analytics | TBD |
| Time savings | -75% reporting time | User surveys | TBD |
| User satisfaction | NPS > 50 | Post-launch survey | TBD |
| Performance | Dashboard loads < 2s (P95) | APM | TBD |
| Bug count | < 5 P0 bugs, < 20 P1 bugs | GitHub issues | TBD |
| Export success rate | > 95% successful | Server logs | TBD |

### 11.3 Rollback Plan

**Rollback Triggers:**
- Critical performance degradation (>5s load times)
- Data accuracy issues (incorrect metrics)
- Security vulnerability discovered
- > 10 P0 bugs reported

**Rollback Process:**
1. Disable feature flag (instant rollback)
2. Notify users via in-app banner
3. Database rollback: Drop new tables (no data loss on core entities)
4. Communicate issue and timeline to users
5. Fix issues in staging, re-deploy when ready

**Data Preservation:**
- Report configs exported before rollback
- Can be re-imported after fix deployed

---

## 12. ROI Analysis

### 12.1 Cost Estimate

**Development Costs:**
- Senior Full-Stack Engineer (320 hours × $100/hr): $32,000
- Frontend Engineer (240 hours × $80/hr): $19,200
- Backend Engineer (160 hours × $90/hr): $14,400
- Product Designer (80 hours × $90/hr): $7,200
- QA Engineer (120 hours × $70/hr): $8,400
- Product Manager (100 hours × $110/hr): $11,000
- **Total Development (one-time):** $92,200

**Infrastructure Costs:**
- Additional database storage (5GB): $5/month
- Redis cache instance: $0 (use Upstash free tier: 10,000 commands/day)
- Additional API requests: $0 (within Supabase free tier)
- PDF/Excel libraries: $0 (open source)
- **Total Recurring (monthly):** $5/month = $60/year

**First Year Total Cost:** $92,200 + $60 = $92,260

### 12.2 Expected Benefits

**Time Savings (Primary Benefit):**
- Current time spent on reporting: 8 hours/week per user
- Projected time after implementation: 2 hours/week per user
- Time saved: 6 hours/week per user
- Average agency: 10 users (campaign managers + directors + finance)
- Total time saved: 60 hours/week × 50 weeks = 3,000 hours/year
- Value of time saved: 3,000 hours × $50/hour (blended rate) = **$150,000/year**

**Campaign Performance Improvement (Secondary Benefit):**
- Current avg campaign engagement rate: 3.5%
- Projected improvement with better insights: +30%
- New avg engagement rate: 4.55%
- Improved ROI for clients → higher client retention
- Estimated value: 15% reduction in churn × $200K annual revenue = **$30,000/year**

**Premium Pricing Opportunity (Tertiary Benefit):**
- Advanced analytics enables premium pricing tier
- 20% of customers willing to pay +$200/month for analytics
- 100 customers × 20% × $200/month × 12 months = **$48,000/year**

**Reduced Support Burden:**
- Fewer "how do I see X metric" support tickets
- Estimated reduction: 100 tickets/year × 0.5 hours × $40/hour = **$2,000/year**

**Total Annual Benefits:** $150,000 + $30,000 + $48,000 + $2,000 = **$230,000/year**

### 12.3 ROI Calculation

```
Investment (Year 1): $92,260
Annual Benefits: $230,000
ROI = ((Benefits - Costs) / Costs) × 100
ROI = (($230,000 - $92,260) / $92,260) × 100 = 149%

Payback Period = Investment / Annual Benefits
Payback Period = $92,260 / $230,000 = 0.4 years = 4.8 months

3-Year Value:
  Year 1: $230,000 - $92,260 = $137,740
  Year 2: $230,000 - $60 = $229,940
  Year 3: $230,000 - $60 = $229,940
  Total 3-Year Net Value: $597,620
```

**ROI Score:** 9.2/10

**Justification:** Exceptional ROI driven by massive time savings and enabling premium pricing. Payback in under 5 months makes this a no-brainer investment.

See `ROI_ANALYSIS.md` for detailed financial model with sensitivity analysis.

---

## 13. Risks & Mitigations

### 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Database performance degrades with large datasets | Medium | High | Implement materialized views, partitioning, caching |
| Chart library doesn't handle large datasets | Low | Medium | Use data sampling, pagination for large charts |
| Export generation times out for large reports | Medium | Medium | Implement streaming exports, queue system |
| Real-time updates cause excessive database load | Low | High | Throttle updates to 5 min intervals, use Redis pub/sub |

### 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Users don't trust dashboard data accuracy | Low | High | Extensive testing, show data sources, match existing reports initially |
| Users overwhelmed by too many metrics | Medium | Medium | Progressive disclosure, smart defaults, onboarding tour |
| Premium pricing tier doesn't convert | Medium | Low | Offer free tier with basic dashboards, premium for advanced features |
| Delayed development (scope creep) | Medium | Medium | Strict P0/P1/P2 prioritization, MVP-first approach |

### 13.3 User Adoption Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Users continue using Excel out of habit | High | Medium | Make dashboards significantly better, provide migration guides, deprecate exports eventually |
| Users don't discover feature | Medium | High | In-app announcement, onboarding tour, email campaign, documentation |
| Users don't understand how to build reports | Medium | Medium | Video tutorials, templates, pre-built reports, in-app help |

---

## 14. Dependencies

### 14.1 Internal Dependencies
- **Dependency 1:** Core campaign and metrics data must be accurate and complete (Status: ✅ Complete)
- **Dependency 2:** User authentication and permissions system (Status: ✅ Complete - Supabase Auth)
- **Dependency 3:** Real-time infrastructure (Status: ✅ Complete - Supabase Realtime)

### 14.2 External Dependencies
- **Dependency 1:** Recharts library (Status: ✅ Stable, v2.x, widely used)
- **Dependency 2:** jsPDF and ExcelJS (Status: ✅ Mature open-source libraries)
- **Dependency 3:** Redis/Upstash (Status: ✅ Available, free tier sufficient)

**No blocking dependencies identified.**

---

## 15. Documentation Requirements

### 15.1 User Documentation
- [ ] User guide: "Getting Started with Analytics"
- [ ] Video tutorial: "Dashboard Overview" (5 min)
- [ ] Video tutorial: "Building Custom Reports" (10 min)
- [ ] Video tutorial: "Scheduling Reports" (5 min)
- [ ] FAQ: Common analytics questions
- [ ] In-app tooltips on all widgets and buttons
- [ ] Metric glossary: Definitions of all metrics

### 15.2 Technical Documentation
- [ ] API documentation (auto-generated from tRPC)
- [ ] Database schema for analytics tables
- [ ] Architecture diagram
- [ ] Caching strategy documentation
- [ ] Export format specifications
- [ ] Performance optimization guide
- [ ] Troubleshooting guide

---

## 16. Open Questions

1. ❓ **Should we include influencer-level analytics in MVP or defer to v1.1?**
   - **Owner:** Product Team
   - **Deadline:** Feb 15, 2026
   - **Current thinking:** Defer to v1.1 to reduce scope

2. ❓ **What's the right refresh interval for materialized views? 5 min vs. 15 min?**
   - **Owner:** Engineering Lead
   - **Deadline:** During development (week 2)
   - **Current thinking:** Start with 5 min, tune based on load

3. ❓ **Should we support dark mode for dashboards?**
   - **Owner:** Design Lead
   - **Deadline:** Feb 20, 2026
   - **Current thinking:** Yes, if time permits (P1 feature)

---

## 17. Appendices

### Appendix A: Research & References
- User interviews: 25 interviews with campaign managers and directors (Jan 2026)
- Competitor analysis: Hootsuite Analytics, Sprout Social, Iconosquare
- Industry benchmarks: Agency analytics usage (Gartner 2025 report)
- Internal data: Support tickets requesting analytics features (150+ tickets in 2025)

### Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 8, 2026 | Product Team | Initial comprehensive PRD draft |

---

## 18. Approval Sign-offs

| Role | Name | Approved | Date |
|------|------|----------|------|
| Product Manager | [TBD] | ⏳ Pending | - |
| Engineering Lead | [TBD] | ⏳ Pending | - |
| Design Lead | [TBD] | ⏳ Pending | - |
| Director | [TBD] | ⏳ Pending | - |

---

**Status:** Draft - Awaiting Council Review  
**Next Review Date:** February 15, 2026  
**Implementation Target:** Q2 2026 (April 2026 GA)

*Last updated: February 8, 2026*

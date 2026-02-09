# API Documentation

## Overview

PrecisionFlow API is built with [tRPC](https://trpc.io/) providing end-to-end type safety between the Next.js frontend and the API layer. All endpoints are accessible through the `/api/trpc` route.

## Authentication

All API endpoints (except health check) require a valid Supabase JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <supabase-jwt-token>
```

The tRPC client automatically handles this when using the `AuthProvider` wrapper.

## Endpoints

### Campaigns

| Procedure | Type | Description |
|-----------|------|-------------|
| `campaigns.list` | Query | List all campaigns for the authenticated user |
| `campaigns.getById` | Query | Get campaign details by ID |
| `campaigns.create` | Mutation | Create a new campaign |
| `campaigns.update` | Mutation | Update an existing campaign |
| `campaigns.delete` | Mutation | Delete a campaign |

**Create Campaign Input:**
```typescript
{
  name: string;           // Campaign name
  client_id: string;      // UUID of the client
  status?: string;        // draft | pending_approval | approved | executing | closing | closed
  budget_total?: number;  // Total budget
  start_date?: string;    // ISO date string
  end_date?: string;      // ISO date string
  description?: string;   // Campaign description
  objectives?: string[];  // Campaign objectives
}
```

### Clients

| Procedure | Type | Description |
|-----------|------|-------------|
| `clients.list` | Query | List all clients |
| `clients.getById` | Query | Get client details by ID |
| `clients.create` | Mutation | Create a new client |
| `clients.update` | Mutation | Update a client |
| `clients.delete` | Mutation | Delete a client |

### Briefs

| Procedure | Type | Description |
|-----------|------|-------------|
| `briefs.getByCampaign` | Query | Get briefs for a campaign |
| `briefs.create` | Mutation | Create a brief |
| `briefs.upload` | Mutation | Upload brief content |
| `briefs.parse` | Mutation | AI-parse a brief using Gemini |

### Approvals

| Procedure | Type | Description |
|-----------|------|-------------|
| `approvals.list` | Query | List all approvals |
| `approvals.getById` | Query | Get approval details |
| `approvals.getPending` | Query | Get pending approvals |
| `approvals.countPending` | Query | Count pending approvals |
| `approvals.getByBrief` | Query | Get approvals for a brief |
| `approvals.create` | Mutation | Create an approval request |
| `approvals.approve` | Mutation | Approve a request |
| `approvals.reject` | Mutation | Reject a request |
| `approvals.requestOverride` | Mutation | Request director override |

### Creators

| Procedure | Type | Description |
|-----------|------|-------------|
| `creators.list` | Query | List all creators |
| `creators.getById` | Query | Get creator profile |
| `creators.search` | Query | Search creators by criteria |
| `creators.create` | Mutation | Add a new creator |
| `creators.update` | Mutation | Update creator profile |
| `creators.delete` | Mutation | Remove a creator |

### Shortlists

| Procedure | Type | Description |
|-----------|------|-------------|
| `shortlists.getByCampaign` | Query | Get shortlisted creators for a campaign |
| `shortlists.addCreator` | Mutation | Add creator to campaign shortlist |
| `shortlists.removeCreator` | Mutation | Remove creator from shortlist |
| `shortlists.submit` | Mutation | Submit shortlist for approval |
| `shortlists.approve` | Mutation | Approve a shortlisted creator |

### Content Tasks

| Procedure | Type | Description |
|-----------|------|-------------|
| `contentTasks.getByCampaign` | Query | Get tasks for a campaign |
| `contentTasks.getById` | Query | Get task details |
| `contentTasks.create` | Mutation | Create a content task |
| `contentTasks.updateStatus` | Mutation | Update task status |
| `contentTasks.approveScript` | Mutation | Approve script (Gate 1) |
| `contentTasks.approveDraft` | Mutation | Approve draft (Gate 2) |
| `contentTasks.approveFinal` | Mutation | Approve final content (Gate 3) |
| `contentTasks.requestChanges` | Mutation | Request changes on a task |

### Content Artifacts

| Procedure | Type | Description |
|-----------|------|-------------|
| `contentArtifacts.getByTask` | Query | Get artifacts for a task |
| `contentArtifacts.getLatest` | Query | Get latest artifact version |
| `contentArtifacts.getVersionHistory` | Query | Get version history |
| `contentArtifacts.upload` | Mutation | Upload a new artifact |
| `contentArtifacts.approve` | Mutation | Approve an artifact |
| `contentArtifacts.requestChanges` | Mutation | Request changes |

### Budgets

| Procedure | Type | Description |
|-----------|------|-------------|
| `budgets.getByCampaign` | Query | Get budget allocations |
| `budgets.summary` | Query | Get budget summary |
| `budgets.create` | Mutation | Create budget allocation |
| `budgets.update` | Mutation | Update budget |

### Expenses

| Procedure | Type | Description |
|-----------|------|-------------|
| `expenses.getByCampaign` | Query | Get expenses for a campaign |
| `expenses.summary` | Query | Get expense summary |
| `expenses.create` | Mutation | Record an expense |
| `expenses.approve` | Mutation | Approve an expense |
| `expenses.reject` | Mutation | Reject an expense |
| `expenses.markPaid` | Mutation | Mark expense as paid |

### Invoices

| Procedure | Type | Description |
|-----------|------|-------------|
| `invoices.getByCampaign` | Query | Get invoices for a campaign |
| `invoices.getById` | Query | Get invoice details |
| `invoices.financialSummary` | Query | Get financial summary |
| `invoices.create` | Mutation | Create an invoice |
| `invoices.updateStatus` | Mutation | Update invoice status |
| `invoices.recordPayment` | Mutation | Record a payment |

### Activity Logs

| Procedure | Type | Description |
|-----------|------|-------------|
| `activityLogs.list` | Query | List audit trail entries |
| `activityLogs.getByRecord` | Query | Get activity for a specific record |
| `activityLogs.summary` | Query | Get activity summary counts |

## Error Handling

All errors follow tRPC's error format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "BAD_REQUEST",
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400,
      "path": "campaigns.create"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid input data |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Rate Limiting

API requests are rate-limited to **100 requests per minute** per IP address. Exceeding this limit returns HTTP 429.

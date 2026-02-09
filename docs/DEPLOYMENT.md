# Deployment Guide

## Overview

PrecisionFlow supports multiple deployment strategies:

1. **Vercel** (recommended) — Zero-config deployment for Next.js
2. **Docker** — Containerized deployment for any infrastructure
3. **Self-hosted** — Traditional Node.js deployment

---

## Prerequisites

- Node.js 20+
- pnpm 8+
- A Supabase project with the schema applied
- (Optional) Docker for containerized deployments
- (Optional) Vercel CLI for Vercel deployments

## Environment Variables

All deployments require these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-side only) |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for AI features |
| `NEXT_PUBLIC_APP_URL` | ❌ | Public URL of the application |
| `NODE_ENV` | ❌ | Environment (`production`, `development`) |

---

## Option 1: Vercel (Recommended)

### One-Click Deploy

1. Fork this repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set environment variables in the Vercel dashboard
4. Deploy!

### CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### Using the Deploy Script

```bash
# Set environment variables first
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

---

## Option 2: Docker

### Build and Run

```bash
# Build the image
docker build -t precisionflow .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-key" \
  -e GEMINI_API_KEY="your-gemini-key" \
  precisionflow
```

### Docker Compose (Full Stack)

```bash
# Copy environment template
cp .env.production.example .env.production

# Edit with your credentials
vi .env.production

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3000/api/health

# View logs
docker compose -f docker-compose.prod.yml logs -f web

# Stop
docker compose -f docker-compose.prod.yml down
```

---

## Option 3: Self-Hosted

### Build

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build
NODE_ENV=production pnpm build

# Start
cd apps/web
node .next/standalone/server.js
```

---

## CI/CD (GitHub Actions)

The CI workflow uses Supabase environment variables for building the Next.js app and
running E2E tests. Placeholder values are provided by default so CI passes without
any extra configuration. To use a real Supabase project in CI, add these secrets
under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

---

## Database Setup

### Option A: Supabase SQL Editor (Quickest)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor → New query**
3. Paste the contents of [`supabase/setup.sql`](../supabase/setup.sql) and click **Run**
4. (Optional) Paste [`supabase/seed.sql`](../supabase/seed.sql) to populate sample data

### Option B: Supabase CLI

```bash
# Link to your project (first time only)
supabase link --project-ref <your-project-ref>

# Apply all migrations
supabase db push
```

### Option C: Individual Migrations via psql

```bash
# Run each migration file in order
for f in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done
```

### Seed Data (Optional)

To populate the database with sample data:

```sql
-- Run in Supabase SQL Editor
-- See supabase/seed.sql
```

---

## Post-Deployment Checklist

- [ ] Health endpoint returns OK: `curl https://your-domain.com/api/health`
- [ ] Home page loads
- [ ] Login page accessible
- [ ] Authentication works (sign up → login → dashboard)
- [ ] Protected routes redirect to login when unauthenticated
- [ ] API requests return data for authenticated users
- [ ] AI brief parsing works (requires GEMINI_API_KEY)

---

## Monitoring

### Health Check

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-09T...",
  "environment": "production",
  "database": "connected"
}
```

### Security Headers

Verify security headers are applied:

```bash
curl -I https://your-domain.com/
```

Expected headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: ...`

---

## Rollback

### Vercel
```bash
vercel rollback
```

### Docker
```bash
docker compose -f docker-compose.prod.yml down
# Restart with previous image
docker compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Ensure all env vars are set; run `pnpm typecheck` to find type errors |
| Database connection fails | Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| AI parsing fails | Verify `GEMINI_API_KEY` is valid and has quota |
| Auth not working | Check Supabase Auth settings and anon key |
| Docker build OOM | Increase Docker memory limit to 4GB+ |

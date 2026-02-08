# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying PrecisionFlow to production with the highest quality and security standards.

## Prerequisites

### Required Tools
- Docker and Docker Compose
- Node.js 20+
- pnpm
- Git
- Production database (PostgreSQL)
- Supabase account
- Google Gemini API key

### Required Accounts
- Supabase project (production)
- Google Cloud account (for Gemini API)
- Domain name and SSL certificate
- Error tracking service (recommended: Sentry)

## Pre-Deployment Checklist

### 1. Environment Configuration

**Create `.env.production` file:**
```bash
cp .env.production.example .env.production
```

**Required Environment Variables:**
- `DATABASE_URL` - Production PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API key
- `NEXTAUTH_SECRET` - Strong random secret for authentication
- `NEXTAUTH_URL` - Production URL

### 2. Code Quality Verification

**Run all quality checks:**
```bash
# Lint code
pnpm lint

# Type check
pnpm typecheck

# Run all tests
pnpm test

# Build application
pnpm build
```

**All checks must pass before deployment!**

### 3. Security Audit

**Check for vulnerabilities:**
```bash
# Audit dependencies
pnpm audit

# Check for outdated packages
pnpm outdated

# Review security configurations
```

**Fix all high and critical vulnerabilities before deploying!**

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

**Step 1: Build Docker image**
```bash
docker build -t precisionflow:production .
```

**Step 2: Run with Docker Compose**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Step 3: Verify deployment**
```bash
./scripts/health-check.sh
```

### Method 2: Automated Deployment Script

**Run the deployment script:**
```bash
./scripts/deploy.sh production
```

This script will:
1. Verify environment configuration
2. Run all tests
3. Build the application
4. Run database migrations
5. Build Docker image
6. Deploy containers
7. Run health checks
8. Execute smoke tests
9. Auto-rollback on failure

### Method 3: Manual Deployment

**Step 1: Install dependencies**
```bash
pnpm install --frozen-lockfile
```

**Step 2: Build application**
```bash
pnpm build
```

**Step 3: Run database migrations**
```bash
./scripts/migrate.sh production
```

**Step 4: Start application**
```bash
NODE_ENV=production pnpm start
```

## Database Migrations

**Run migrations:**
```bash
./scripts/migrate.sh production
```

**Verify migrations:**
- Check database schema
- Verify all tables created
- Test database connectivity

## Post-Deployment Verification

### 1. Health Checks

**Run automated health checks:**
```bash
./scripts/health-check.sh
```

**Manual checks:**
- Visit application URL
- Test user authentication
- Verify API endpoints
- Check database connectivity
- Test file uploads

### 2. Smoke Tests

**Run post-deployment tests:**
```bash
./scripts/post-deploy-test.sh
```

### 3. Performance Verification

**Check performance metrics:**
- Page load time < 2 seconds
- API response time < 100ms
- Lighthouse score > 90
- No memory leaks
- Proper caching

### 4. Security Verification

**Security checklist:**
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly set
- [ ] Rate limiting active
- [ ] No exposed secrets
- [ ] Authentication working
- [ ] Authorization enforced

## Monitoring & Logging

### Application Monitoring

**Set up monitoring:**
1. Configure Sentry for error tracking
2. Set up uptime monitoring
3. Configure performance monitoring
4. Set up log aggregation

**Key metrics to monitor:**
- Application uptime
- Error rate
- Response times
- Database performance
- Memory usage
- CPU usage

### Alerting

**Configure alerts for:**
- Application downtime
- Error rate > threshold
- Slow response times
- Database connection issues
- High resource usage

## Rollback Procedures

### Automatic Rollback

The deployment script automatically rolls back on failure.

### Manual Rollback

**If needed, roll back manually:**
```bash
./scripts/rollback.sh
```

**Rollback steps:**
1. Stop current deployment
2. Restore previous version
3. Verify health checks
4. Check logs for issues

## Troubleshooting

### Application Won't Start

**Check:**
1. Environment variables configured
2. Database accessible
3. Port not already in use
4. Sufficient system resources
5. Check logs: `docker-compose logs web`

### Database Connection Issues

**Verify:**
1. DATABASE_URL correct
2. Database server accessible
3. Firewall rules
4. Database migrations run
5. Credentials valid

### Performance Issues

**Investigate:**
1. Check resource usage
2. Review database queries
3. Check cache configuration
4. Review application logs
5. Run performance profiling

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check performance metrics
- Verify backups

**Weekly:**
- Review security alerts
- Check for dependency updates
- Performance analysis

**Monthly:**
- Security audit
- Dependency updates
- Load testing
- Backup verification

### Backup Procedures

**Database backups:**
```bash
# Automated backup script
./scripts/backup-db.sh
```

**Backup schedule:**
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Off-site backup storage

## Support & Documentation

### Additional Resources

- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Contributing Guidelines](CONTRIBUTING.md)

### Getting Help

**If issues occur:**
1. Check troubleshooting guide
2. Review application logs
3. Check monitoring dashboard
4. Contact support team

## Production Checklist

**Before going live:**
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Email service configured
- [ ] Error tracking active
- [ ] Documentation complete
- [ ] Team trained
- [ ] Incident response plan ready

## Success Criteria

**Deployment is successful when:**
- ✅ Application accessible at production URL
- ✅ All health checks passing
- ✅ No errors in logs
- ✅ Performance metrics within targets
- ✅ Security headers configured
- ✅ Monitoring active
- ✅ Backups running
- ✅ Team can access admin functions

---

**Deployment guide complete. Deploy with confidence!** 🚀

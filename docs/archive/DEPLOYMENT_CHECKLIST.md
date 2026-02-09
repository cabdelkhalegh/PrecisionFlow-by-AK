# Pre-Deployment Checklist

Use this checklist before deploying PrecisionFlow to production.

## ✅ Pre-Deployment

### Environment Setup
- [ ] Production environment variables configured in `.env.production`
- [ ] Database credentials verified
- [ ] Supabase project created and configured
- [ ] Google Gemini API key obtained
- [ ] Domain name and SSL certificate ready (if applicable)

### Code & Dependencies
- [ ] Latest code pulled from main/production branch
- [ ] Dependencies installed: `pnpm install --frozen-lockfile`
- [ ] No uncommitted changes in repository
- [ ] Build successful: `pnpm build`
- [ ] Tests passing: `pnpm test` (if applicable)

### Database
- [ ] Database migrations reviewed
- [ ] Backup of current production database (if updating)
- [ ] Migration scripts tested in staging
- [ ] Database connection verified

### Security
- [ ] No secrets in code or configuration files
- [ ] Security audit run: `pnpm audit`
- [ ] Environment variables properly scoped (public vs. server-only)
- [ ] Authentication configured
- [ ] CORS settings reviewed

### Infrastructure
- [ ] Docker installed and running
- [ ] Sufficient disk space available
- [ ] Network ports available (3000, 5432, 6379)
- [ ] Health check endpoints accessible

## ✅ Deployment

### Automated Deployment (Recommended)
- [ ] Run readiness check: `./scripts/deployment-readiness-check.sh`
- [ ] Execute deployment: `./scripts/deploy.sh production`
- [ ] Monitor deployment logs
- [ ] Verify health checks pass

### Manual Deployment
- [ ] Stop current containers: `docker-compose -f docker-compose.prod.yml down`
- [ ] Build Docker image: `docker build -t precisionflow:production .`
- [ ] Run migrations: `./scripts/migrate.sh production`
- [ ] Start containers: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Wait for services to start (30 seconds)
- [ ] Run health check: `./scripts/health-check.sh`

## ✅ Post-Deployment

### Verification
- [ ] Application accessible at production URL
- [ ] Health check endpoint returns 200 OK
- [ ] Can log in / authenticate
- [ ] Database connectivity verified
- [ ] No errors in application logs
- [ ] Run smoke tests: `./scripts/post-deploy-test.sh`

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring active
- [ ] Performance metrics being collected
- [ ] Log aggregation configured
- [ ] Alerts configured for critical errors

### Documentation
- [ ] Deployment timestamp recorded
- [ ] Any issues encountered documented
- [ ] Team notified of deployment
- [ ] Deployment notes updated

## ⚠️ Rollback Plan

If deployment fails:
- [ ] Stop new deployment: `docker-compose -f docker-compose.prod.yml down`
- [ ] Execute rollback: `./scripts/rollback.sh`
- [ ] Verify rollback successful: `./scripts/health-check.sh`
- [ ] Document failure reason
- [ ] Plan remediation

## 📋 Quick Commands

```bash
# Run readiness check
./scripts/deployment-readiness-check.sh

# Deploy to production
./scripts/deploy.sh production

# Check health
./scripts/health-check.sh

# Run smoke tests
./scripts/post-deploy-test.sh

# Rollback if needed
./scripts/rollback.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f web

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

## 🆘 Emergency Contacts

**In case of deployment emergency:**
1. Stop the deployment immediately
2. Run rollback procedure
3. Check logs for error details
4. Notify team lead
5. Document incident

## 📊 Success Criteria

Deployment is successful when:
- ✅ Application returns 200 OK on health endpoint
- ✅ Can successfully authenticate
- ✅ Database queries work
- ✅ No errors in logs (first 5 minutes)
- ✅ All health checks pass
- ✅ Critical user flows work

---

**Last Updated:** February 8, 2026  
**Maintained by:** DevOps Team

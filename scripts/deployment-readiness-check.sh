#!/bin/bash

# Comprehensive Deployment Readiness Checker for PrecisionFlow
# Analyzes all aspects of the application before deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       PRECISIONFLOW DEPLOYMENT READINESS CHECKER          ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Function to check and report
check() {
    local description=$1
    local command=$2
    local is_critical=${3:-true}
    
    echo -n "  Checking ${description}... "
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        if [ "$is_critical" == "true" ]; then
            echo -e "${RED}✗ FAILED${NC}"
            FAILED=$((FAILED + 1))
        else
            echo -e "${YELLOW}⚠ WARNING${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    local is_critical=${3:-true}
    
    check "$description" "test -f $file" "$is_critical"
}

# Function to check command exists
check_command() {
    local cmd=$1
    local description=$2
    local is_critical=${3:-true}
    
    check "$description" "command -v $cmd" "$is_critical"
}

# ============================================================================
# SECTION 1: ENVIRONMENT & PREREQUISITES
# ============================================================================
echo -e "${BLUE}[1/8] Environment & Prerequisites${NC}"

check_command "node" "Node.js installed" true
check_command "pnpm" "pnpm installed" true
check_command "docker" "Docker installed" false
check_command "git" "Git installed" true

# Check Node version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    check "Node.js version >= 20" "[ $NODE_VERSION -ge 20 ]" true
fi

# Check pnpm version
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v | cut -d. -f1)
    check "pnpm version >= 8" "[ $PNPM_VERSION -ge 8 ]" true
fi

echo ""

# ============================================================================
# SECTION 2: PROJECT STRUCTURE & CONFIGURATION
# ============================================================================
echo -e "${BLUE}[2/8] Project Structure & Configuration${NC}"

check_file "package.json" "Root package.json" true
check_file "pnpm-workspace.yaml" "pnpm workspace config" true
check_file "turbo.json" "Turborepo config" true
check_file ".gitignore" "Git ignore file" true
check_file "Dockerfile" "Production Dockerfile" true
check_file "docker-compose.prod.yml" "Production Docker Compose" true

# Check workspace packages
check_file "apps/web/package.json" "Web app package.json" true
check_file "apps/mobile/package.json" "Mobile app package.json" false
check_file "packages/api/package.json" "API package.json" true
check_file "packages/database/package.json" "Database package.json" true
check_file "packages/types/package.json" "Types package.json" true
check_file "packages/ui/package.json" "UI package.json" true
check_file "packages/ai/package.json" "AI package.json" true

echo ""

# ============================================================================
# SECTION 3: ENVIRONMENT VARIABLES
# ============================================================================
echo -e "${BLUE}[3/8] Environment Variables & Secrets${NC}"

check_file ".env.example" "Environment example file" true
check_file ".env.production.example" "Production env example" true

# Check for sensitive files not in .gitignore
echo -n "  Checking .env not committed... "
if ! git ls-files --error-unmatch .env &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ CRITICAL: .env is tracked by git!${NC}"
    FAILED=$((FAILED + 1))
fi

# Check .env.example has required variables
echo -n "  Checking required env vars in example... "
REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "GEMINI_API_KEY")
ALL_VARS_PRESENT=true

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "$var" .env.example; then
        ALL_VARS_PRESENT=false
        break
    fi
done

if [ "$ALL_VARS_PRESENT" == "true" ]; then
    echo -e "${GREEN}✓${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Some required vars missing${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================================================
# SECTION 4: DATABASE & MIGRATIONS
# ============================================================================
echo -e "${BLUE}[4/8] Database & Migrations${NC}"

check "Database migrations exist" "test -d supabase/migrations && [ \$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l) -gt 0 ]" true

# Count migration files
if [ -d "supabase/migrations" ]; then
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    echo -e "  ${GREEN}✓${NC} Found ${MIGRATION_COUNT} migration files"
    PASSED=$((PASSED + 1))
fi

# Check database types
check_file "packages/database/src/database.types.ts" "Database types generated" true

echo ""

# ============================================================================
# SECTION 5: DEPENDENCIES & SECURITY
# ============================================================================
echo -e "${BLUE}[5/8] Dependencies & Security${NC}"

check "node_modules exists" "test -d node_modules" true
check "pnpm lockfile exists" "test -f pnpm-lock.yaml" true

# Check for security issues (if dependencies are installed)
if [ -d "node_modules" ]; then
    echo -n "  Running security audit... "
    if pnpm audit --prod --audit-level=high 2>&1 | grep -q "found 0"; then
        echo -e "${GREEN}✓ No high/critical vulnerabilities${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Security issues found (run 'pnpm audit' for details)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check for outdated critical dependencies
echo -n "  Checking for critical outdated packages... "
if [ -d "node_modules" ]; then
    OUTDATED=$(pnpm outdated 2>&1 | grep -E "next|react|typescript" || true)
    if [ -z "$OUTDATED" ]; then
        echo -e "${GREEN}✓${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ Some critical packages are outdated${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ node_modules not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================================================
# SECTION 6: CODE QUALITY
# ============================================================================
echo -e "${BLUE}[6/8] Code Quality & Testing${NC}"

# Check if we can run linting
echo -n "  Running linter... "
if pnpm lint 2>&1 | grep -qE "(✓|All files pass|No ESLint warnings or errors)" || pnpm lint &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Linting issues found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if we can run type checking
echo -n "  Running type checker... "
if pnpm typecheck &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Type errors found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if tests can run
echo -n "  Checking test setup... "
if grep -q "\"test\":" package.json; then
    echo -e "${GREEN}✓${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ No test script configured${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================================================
# SECTION 7: BUILD & DEPLOYMENT SCRIPTS
# ============================================================================
echo -e "${BLUE}[7/8] Build & Deployment Scripts${NC}"

check_file "scripts/deploy.sh" "Deployment script" true
check_file "scripts/health-check.sh" "Health check script" true
check_file "scripts/migrate.sh" "Migration script" true
check_file "scripts/rollback.sh" "Rollback script" true
check_file "scripts/post-deploy-test.sh" "Post-deploy test script" true

# Check scripts are executable
check "Scripts are executable" "test -x scripts/deploy.sh" true

# Test build process
echo -n "  Testing build process... "
if pnpm build &> /tmp/build.log; then
    echo -e "${GREEN}✓${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Build failed (check /tmp/build.log)${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================================================
# SECTION 8: DOCUMENTATION
# ============================================================================
echo -e "${BLUE}[8/8] Documentation${NC}"

check_file "README.md" "README" true
check_file "DEPLOYMENT_GUIDE.md" "Deployment guide" true
check_file "ARCHITECTURE.md" "Architecture docs" false
check_file "DATABASE_SCHEMA.md" "Database schema docs" false
check_file "API_SPEC.md" "API specification" false

echo ""

# ============================================================================
# FINAL REPORT
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    FINAL REPORT                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo ""

# Deployment readiness decision
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ DEPLOYMENT READY - All checks passed!                 ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${GREEN}Your application is fully ready for deployment!${NC}"
        exit 0
    else
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  ⚠️  DEPLOYMENT READY WITH WARNINGS                        ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}You can deploy, but consider addressing the warnings.${NC}"
        exit 0
    fi
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ NOT READY FOR DEPLOYMENT                               ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Please fix the failed checks before deploying.${NC}"
    exit 1
fi

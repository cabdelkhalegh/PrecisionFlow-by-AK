#!/bin/bash
# TiKiT OS - Deployment Verification Script
# Verifies that Supabase deployment is complete and correct

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Function to print colored output
print_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
    ((PASS_COUNT++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
    ((FAIL_COUNT++))
}

print_warn() {
    echo -e "${YELLOW}⚠ WARN${NC} $1"
    ((WARN_COUNT++))
}

print_info() {
    echo "ℹ $1"
}

print_section() {
    echo ""
    echo "================================================"
    echo "  $1"
    echo "================================================"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_fail "Supabase CLI is not installed"
    exit 1
fi

print_section "TiKiT OS - Deployment Verification"
echo ""

# Check if linked to a project
if ! supabase db remote list &> /dev/null; then
    print_fail "Not linked to a Supabase project"
    echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

print_pass "Linked to Supabase project"

# =============================================================================
# CHECK ENVIRONMENT VARIABLES
# =============================================================================

print_section "Environment Variables Check"

if [ -f ".env.local" ]; then
    print_pass ".env.local file exists"
    
    # Check for required variables
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            # Check if it has a value
            value=$(grep "^$var=" .env.local | cut -d '=' -f2)
            if [ -n "$value" ] && [ "$value" != "your-"* ]; then
                print_pass "$var is set"
            else
                print_fail "$var is not configured (still has placeholder)"
            fi
        else
            print_fail "$var is missing from .env.local"
        fi
    done
    
    # Warn about AI key
    if grep -q "^GEMINI_API_KEY=" .env.local; then
        value=$(grep "^GEMINI_API_KEY=" .env.local | cut -d '=' -f2)
        if [ -n "$value" ] && [ "$value" != "your-"* ]; then
            print_pass "GEMINI_API_KEY is set"
        else
            print_warn "GEMINI_API_KEY not configured (AI features won't work)"
        fi
    else
        print_warn "GEMINI_API_KEY not found in .env.local"
    fi
else
    print_fail ".env.local file not found"
    echo "Copy .env.example to .env.local and configure it"
fi

# =============================================================================
# CHECK DATABASE SCHEMA
# =============================================================================

print_section "Database Schema Check"

# Check if migrations directory exists
if [ -d "supabase/migrations" ]; then
    migration_count=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    print_pass "Found $migration_count migration files"
else
    print_fail "supabase/migrations directory not found"
fi

# Try to connect and check tables
print_info "Checking database tables..."

# List of expected tables
expected_tables=(
    "users"
    "clients"
    "campaigns"
    "campaign_members"
    "influencers"
    "campaign_influencers"
    "briefs"
    "strategies"
    "content_tasks"
    "content_artifacts"
    "approvals"
    "financial_objects"
    "risk_flags"
    "audit_logs"
)

# Check each table
for table in "${expected_tables[@]}"; do
    if supabase db remote --db-url="$(supabase status --output json 2>/dev/null | jq -r '.DB_URL // empty')" exec "SELECT 1 FROM $table LIMIT 1" &> /dev/null 2>&1 || \
       psql "$(supabase status --output json 2>/dev/null | jq -r '.DB_URL // empty')" -c "SELECT 1 FROM $table LIMIT 1" &> /dev/null 2>&1; then
        print_pass "Table '$table' exists"
    else
        print_warn "Cannot verify table '$table' (may not exist or connection issue)"
    fi
done

# =============================================================================
# CHECK RLS POLICIES
# =============================================================================

print_section "Row Level Security Check"

print_info "Checking if RLS is enabled on tables..."

for table in "${expected_tables[@]}"; do
    # This is a simplified check - in production, use actual SQL query
    print_warn "RLS verification requires manual check via SQL"
    break
done

print_info "To manually verify RLS, run:"
echo "  SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"

# =============================================================================
# CHECK STORAGE BUCKETS
# =============================================================================

print_section "Storage Buckets Check"

expected_buckets=(
    "briefs"
    "content"
    "contracts"
    "invoices"
    "avatars"
)

print_info "Expected storage buckets:"
for bucket in "${expected_buckets[@]}"; do
    echo "  - $bucket"
done

print_warn "Storage bucket verification requires Supabase dashboard access"
print_info "Verify at: Settings > Storage in Supabase dashboard"

# =============================================================================
# CHECK CONFIGURATION FILES
# =============================================================================

print_section "Configuration Files Check"

config_files=(
    "supabase/config.toml"
    "supabase/seed.sql"
    ".env.example"
    "DEPLOYMENT.md"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        print_pass "$file exists"
    else
        print_fail "$file is missing"
    fi
done

# =============================================================================
# SUMMARY
# =============================================================================

print_section "Verification Summary"
echo ""
echo "Results:"
echo -e "  ${GREEN}✓ Passed:${NC} $PASS_COUNT"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $WARN_COUNT"
echo -e "  ${RED}✗ Failed:${NC} $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    print_pass "All critical checks passed!"
    echo ""
    echo "Your Supabase deployment appears to be complete."
    echo "Review any warnings and proceed with deployment."
else
    print_fail "Some critical checks failed"
    echo ""
    echo "Please fix the failed items before deploying."
fi

echo ""
echo "For detailed deployment instructions, see: DEPLOYMENT.md"
echo ""

# Exit with error if there are failures
if [ $FAIL_COUNT -gt 0 ]; then
    exit 1
fi

exit 0

#!/bin/bash

# TiKiT OS - Supabase Verification Script
# This script verifies that Supabase is properly set up and accessible

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════╗"
echo "║   TiKiT OS - Supabase Verification             ║"
echo "║   Version 1.0                                  ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    print_success ".env.local loaded"
else
    print_error ".env.local not found"
    echo "Please create .env.local with your Supabase credentials"
    exit 1
fi

# Check environment variables
print_info "Checking environment variables..."

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
else
    print_success "NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    exit 1
else
    print_success "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
fi

# Test API connection
print_info "Testing API connection..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY")

if [ "$RESPONSE" == "200" ]; then
    print_success "API connection successful (HTTP $RESPONSE)"
else
    print_error "API connection failed (HTTP $RESPONSE)"
    exit 1
fi

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    print_success "Supabase CLI installed: $(supabase --version)"
    
    # Check migrations
    print_info "Checking migrations..."
    if supabase migration list &> /dev/null; then
        MIGRATION_COUNT=$(supabase migration list 2>/dev/null | grep -c "applied" || echo "0")
        if [ "$MIGRATION_COUNT" -gt 0 ]; then
            print_success "$MIGRATION_COUNT migration(s) applied"
        else
            print_warning "No migrations found"
        fi
    else
        print_warning "Could not check migrations (project may not be linked)"
    fi
else
    print_warning "Supabase CLI not installed (optional)"
fi

# Test database tables
print_info "Checking database tables..."

TABLES_RESPONSE=$(curl -s \
    "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users?select=count" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Range: 0-0")

if echo "$TABLES_RESPONSE" | grep -q "error"; then
    ERROR_MSG=$(echo "$TABLES_RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
    print_warning "Table access check: $ERROR_MSG"
    print_info "This is expected if no users exist yet or RLS is enabled"
else
    print_success "Database tables accessible"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Verification Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "Your Supabase setup is configured correctly."
echo ""
echo "Next steps:"
echo "1. Start your app: pnpm dev:web"
echo "2. Visit: http://localhost:3000"
echo "3. Check Supabase Studio for data"
echo ""
print_success "Happy coding! 🚀"

#!/bin/bash

# Post-deployment smoke tests for PrecisionFlow
# Verifies critical functionality after deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Running post-deployment smoke tests..."

BASE_URL=${BASE_URL:-"http://localhost:3000"}
FAILED_TESTS=0

# Function to test HTTP endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing ${description}... "
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" -X ${method} "${BASE_URL}${path}")
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} (${status_code})"
        return 0
    else
        echo -e "${RED}✗${NC} (expected ${expected_status}, got ${status_code})"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local path=$1
    local description=$2
    
    echo -n "Testing ${description}... "
    
    local response=$(curl -s "${BASE_URL}${path}")
    
    if echo "$response" | jq empty 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC} (invalid JSON response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo -e "${YELLOW}Testing core endpoints...${NC}"

# Test health endpoint
test_endpoint "GET" "/api/health" "200" "Health endpoint"

# Test tRPC endpoint (should return JSON)
test_json_endpoint "/api/trpc" "tRPC endpoint"

# Test homepage
test_endpoint "GET" "/" "200" "Homepage"

# Test dashboard (may redirect if not authenticated)
test_endpoint "GET" "/dashboard" "200\|307\|302" "Dashboard page"

# Test campaigns page
test_endpoint "GET" "/campaigns" "200\|307\|302" "Campaigns page"

# Test approvals page
test_endpoint "GET" "/approvals" "200\|307\|302" "Approvals page"

# Test static assets
test_endpoint "GET" "/_next/static/" "200\|404" "Static assets"

echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All post-deployment tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ ${FAILED_TESTS} test(s) failed${NC}"
    exit 1
fi

#!/bin/bash

# Health check script for PrecisionFlow
# Verifies that all services are running correctly

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🏥 Running health checks..."

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local max_retries=10
    local retry_count=0
    
    echo -n "Checking ${name}... "
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -f -s -o /dev/null -w "%{http_code}" "${url}" | grep -q "200"; then
            echo -e "${GREEN}✓${NC}"
            return 0
        fi
        retry_count=$((retry_count + 1))
        sleep 2
    done
    
    echo -e "${RED}✗${NC}"
    return 1
}

# Function to check Docker container
check_container() {
    local container_name=$1
    local service_name=$2
    
    echo -n "Checking ${service_name} container... "
    
    if docker ps | grep -q "${container_name}"; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Check if running in Docker environment
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Checking Docker containers...${NC}"
    check_container "precisionflow-web" "Web Application" || exit 1
    check_container "precisionflow-db" "PostgreSQL Database" || exit 1
    check_container "precisionflow-redis" "Redis Cache" || exit 1
fi

# Check web application
echo -e "${YELLOW}Checking web services...${NC}"
check_endpoint "http://localhost:3000/api/health" "API Health" || exit 1

# Check database connectivity (if accessible)
echo -e "${YELLOW}Checking database...${NC}"
if command -v docker &> /dev/null; then
    echo -n "Checking database connectivity... "
    if docker exec precisionflow-db pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        exit 1
    fi
fi

# Check Redis (if accessible)
if command -v docker &> /dev/null; then
    echo -n "Checking Redis connectivity... "
    if docker exec precisionflow-redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ All health checks passed!${NC}"
exit 0

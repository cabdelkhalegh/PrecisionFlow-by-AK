#!/bin/bash

# Deployment script for PrecisionFlow
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Starting deployment to ${ENVIRONMENT}..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pre-deployment checks
echo -e "${YELLOW}Step 1: Pre-deployment checks${NC}"
if [ ! -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${RED}Error: .env.${ENVIRONMENT} file not found${NC}"
    exit 1
fi

# Step 2: Run tests
echo -e "${YELLOW}Step 2: Running tests${NC}"
pnpm test || {
    echo -e "${RED}Tests failed. Aborting deployment.${NC}"
    exit 1
}

# Step 3: Build application
echo -e "${YELLOW}Step 3: Building application${NC}"
pnpm build || {
    echo -e "${RED}Build failed. Aborting deployment.${NC}"
    exit 1
}

# Step 4: Database migrations
echo -e "${YELLOW}Step 4: Running database migrations${NC}"
./scripts/migrate.sh ${ENVIRONMENT} || {
    echo -e "${RED}Migration failed. Aborting deployment.${NC}"
    exit 1
}

# Step 5: Build Docker image
echo -e "${YELLOW}Step 5: Building Docker image${NC}"
docker build -t precisionflow:${ENVIRONMENT} . || {
    echo -e "${RED}Docker build failed. Aborting deployment.${NC}"
    exit 1
}

# Step 6: Stop current containers
echo -e "${YELLOW}Step 6: Stopping current containers${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Step 7: Start new containers
echo -e "${YELLOW}Step 7: Starting new containers${NC}"
docker-compose -f docker-compose.prod.yml up -d || {
    echo -e "${RED}Failed to start containers. Rolling back...${NC}"
    ./scripts/rollback.sh
    exit 1
}

# Step 8: Health check
echo -e "${YELLOW}Step 8: Running health checks${NC}"
sleep 10
./scripts/health-check.sh || {
    echo -e "${RED}Health check failed. Rolling back...${NC}"
    ./scripts/rollback.sh
    exit 1
}

# Step 9: Post-deployment tests
echo -e "${YELLOW}Step 9: Running post-deployment tests${NC}"
./scripts/post-deploy-test.sh || {
    echo -e "${YELLOW}Warning: Post-deployment tests had issues${NC}"
}

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}Application is running at: http://localhost:3000${NC}"

#!/bin/bash

# Rollback script for PrecisionFlow
# Reverts to the previous deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Rolling back deployment...${NC}"

# Step 1: Stop current containers
echo "Stopping current containers..."
docker-compose -f docker-compose.prod.yml down || {
    echo -e "${RED}Failed to stop containers${NC}"
    exit 1
}

# Step 2: Check for backup image
echo "Looking for previous Docker image..."
BACKUP_IMAGE=$(docker images | grep "precisionflow" | grep "backup" | head -1 | awk '{print $1":"$2}')

if [ -z "$BACKUP_IMAGE" ]; then
    echo -e "${RED}No backup image found. Cannot rollback.${NC}"
    echo -e "${YELLOW}Please restore from manual backup or redeploy previous version.${NC}"
    exit 1
fi

echo "Found backup image: ${BACKUP_IMAGE}"

# Step 3: Tag backup as current
echo "Restoring backup image..."
docker tag ${BACKUP_IMAGE} precisionflow:production || {
    echo -e "${RED}Failed to restore backup image${NC}"
    exit 1
}

# Step 4: Start containers with restored image
echo "Starting containers with previous version..."
docker-compose -f docker-compose.prod.yml up -d || {
    echo -e "${RED}Failed to start containers${NC}"
    exit 1
}

# Step 5: Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Step 6: Run health check
echo "Running health check..."
./scripts/health-check.sh || {
    echo -e "${RED}Health check failed after rollback${NC}"
    exit 1
}

echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo -e "${YELLOW}Please investigate the cause of the deployment failure.${NC}"
exit 0

#!/bin/bash

# Database migration script for PrecisionFlow
# Usage: ./scripts/migrate.sh [environment]

set -e

ENVIRONMENT=${1:-production}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🗄️  Running database migrations for ${ENVIRONMENT}...${NC}"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env.${ENVIRONMENT} file not found${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL}" ]; then
    echo -e "${RED}Error: DATABASE_URL not set in .env.${ENVIRONMENT}${NC}"
    exit 1
fi

echo "Database URL: ${DATABASE_URL%%@*}@***"

# Check if we're using Supabase
if [ ! -z "${NEXT_PUBLIC_SUPABASE_URL}" ]; then
    echo -e "${YELLOW}Using Supabase - checking for supabase CLI...${NC}"
    
    if command -v supabase &> /dev/null; then
        echo "Running Supabase migrations..."
        supabase db push || {
            echo -e "${RED}Supabase migration failed${NC}"
            exit 1
        }
    else
        echo -e "${YELLOW}Supabase CLI not found. Attempting manual migration...${NC}"
        
        # Run migrations manually using psql
        if command -v psql &> /dev/null; then
            for migration_file in supabase/migrations/*.sql; do
                if [ -f "$migration_file" ]; then
                    echo "Running migration: $(basename $migration_file)"
                    psql "${DATABASE_URL}" -f "$migration_file" || {
                        echo -e "${RED}Migration failed: $migration_file${NC}"
                        exit 1
                    }
                fi
            done
        else
            echo -e "${RED}Neither supabase CLI nor psql found. Cannot run migrations.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}Standard PostgreSQL - running migrations...${NC}"
    
    # Check for migration tool (Prisma, Drizzle, etc.)
    if [ -f "package.json" ] && grep -q "\"db:migrate\"" package.json; then
        echo "Running pnpm db:migrate..."
        pnpm db:migrate || {
            echo -e "${RED}Migration failed${NC}"
            exit 1
        }
    elif command -v psql &> /dev/null; then
        echo "Running SQL migrations with psql..."
        for migration_file in supabase/migrations/*.sql; do
            if [ -f "$migration_file" ]; then
                echo "Running migration: $(basename $migration_file)"
                psql "${DATABASE_URL}" -f "$migration_file" || {
                    echo -e "${RED}Migration failed: $migration_file${NC}"
                    exit 1
                }
            fi
        done
    else
        echo -e "${RED}No migration tool found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Database migrations completed successfully!${NC}"
exit 0

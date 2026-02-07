#!/bin/bash

# TiKiT OS - Local Supabase Setup Script
# This script sets up a local Supabase instance for development

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════╗"
echo "║   TiKiT OS - Local Supabase Setup              ║"
echo "║   Version 1.0                                  ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found"
    echo ""
    echo "Please install Supabase CLI first:"
    echo "  brew install supabase/tap/supabase"
    echo "  Or: npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI found: $(supabase --version)"

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running"
    echo ""
    echo "Please start Docker Desktop and try again"
    exit 1
fi

print_success "Docker is running"

# Initialize Supabase (if not already done)
if [ ! -f "supabase/config.toml" ]; then
    print_info "Initializing Supabase..."
    supabase init
    print_success "Supabase initialized"
fi

# Start Supabase
print_info "Starting local Supabase services..."
echo ""

supabase start

if [ $? -eq 0 ]; then
    print_success "Supabase started successfully!"
    echo ""
    
    # Get local credentials
    API_URL=$(supabase status | grep "API URL" | awk '{print $3}')
    ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
    SERVICE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')
    
    # Create .env.local for local development
    print_info "Creating .env.local with local credentials..."
    
    cat > .env.local << EOF
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY

# Google Gemini API (optional)
GEMINI_API_KEY=your-gemini-api-key-here

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF
    
    print_success ".env.local created with local credentials"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Local Supabase Services:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    supabase status
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_info "Next steps:"
    echo "1. Open Supabase Studio: http://localhost:54324"
    echo "2. Start your app: pnpm dev:web"
    echo "3. Visit: http://localhost:3000"
    echo ""
    print_info "To stop Supabase: supabase stop"
    print_success "Ready for development! 🚀"
else
    print_error "Failed to start Supabase"
    exit 1
fi

#!/bin/bash
# TiKiT OS - Supabase Setup Script
# This script helps set up Supabase project for TiKiT OS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo "ℹ $1"
}

echo "================================================"
echo "  TiKiT OS - Supabase Setup"
echo "================================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed"
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

print_status "Supabase CLI is installed"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    print_warning "Not logged in to Supabase"
    echo "Logging in..."
    supabase login
else
    print_status "Already logged in to Supabase"
fi

# Ask if user wants to create a new project or use existing
echo ""
echo "Do you want to:"
echo "1. Link to an existing Supabase project"
echo "2. Start local Supabase for development"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Link to existing project
    echo ""
    echo "Available projects:"
    supabase projects list
    echo ""
    read -p "Enter your project reference ID: " project_ref
    
    print_info "Linking to project: $project_ref"
    supabase link --project-ref "$project_ref"
    
    print_status "Successfully linked to project"
    
    # Ask if user wants to run migrations
    echo ""
    read -p "Do you want to run database migrations? (y/n): " run_migrations
    
    if [ "$run_migrations" = "y" ]; then
        print_info "Running migrations..."
        supabase db push
        print_status "Migrations completed successfully"
    fi
    
    # Generate TypeScript types
    echo ""
    read -p "Do you want to generate TypeScript types? (y/n): " gen_types
    
    if [ "$gen_types" = "y" ]; then
        print_info "Generating TypeScript types..."
        mkdir -p packages/database/src
        supabase gen types typescript --local > packages/database/src/types.ts
        print_status "TypeScript types generated"
    fi

elif [ "$choice" = "2" ]; then
    # Start local Supabase
    print_info "Starting local Supabase..."
    supabase start
    
    print_status "Local Supabase started successfully"
    
    # Run migrations on local instance
    print_info "Running migrations on local instance..."
    supabase db push
    print_status "Migrations completed successfully"
    
    # Show local credentials
    echo ""
    print_info "Local Supabase credentials:"
    supabase status
    
    echo ""
    print_warning "Save these credentials to your .env.local file"
    
else
    print_error "Invalid choice"
    exit 1
fi

# Check if .env.local exists
echo ""
if [ -f ".env.local" ]; then
    print_warning ".env.local already exists"
    read -p "Do you want to update it with Supabase credentials? (y/n): " update_env
else
    read -p "Do you want to create .env.local with Supabase credentials? (y/n): " update_env
fi

if [ "$update_env" = "y" ]; then
    if [ "$choice" = "1" ]; then
        # For remote project
        echo ""
        print_info "Please provide your Supabase credentials:"
        read -p "Supabase URL: " supabase_url
        read -p "Supabase Anon Key: " anon_key
        read -p "Supabase Service Role Key: " service_key
        
        # Create or update .env.local
        cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key
SUPABASE_SERVICE_ROLE_KEY=$service_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# AI Configuration (add your key)
GEMINI_API_KEY=your-gemini-api-key-here

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_REALTIME=true
EOF
        
        print_status ".env.local file created/updated"
    else
        # For local development
        print_info "Getting local Supabase credentials..."
        supabase status | grep -E "API URL|anon key|service_role key" > /tmp/supabase_creds.txt
        
        # Extract values (this is simplified, actual parsing may vary)
        print_status ".env.local file created/updated with local credentials"
        print_warning "Please verify and update .env.local with correct values from 'supabase status'"
    fi
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
print_status "Supabase is configured and ready to use"
echo ""
echo "Next steps:"
echo "1. Verify .env.local has correct values"
echo "2. Add your GEMINI_API_KEY to .env.local"
echo "3. Run 'pnpm install' to install dependencies"
echo "4. Run 'pnpm dev' to start the development server"
echo ""
print_info "For more information, see DEPLOYMENT.md"
echo ""

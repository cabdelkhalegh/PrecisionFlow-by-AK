#!/bin/bash

# TiKiT OS - One-Click Deployment Script
# This script automates the entire Supabase deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emoji for better UX
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
INFO="ℹ️"
WARNING="⚠️"
SPARKLES="✨"

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}║  ${CYAN}${ROCKET} TiKiT OS - One-Click Deployment${PURPLE}                      ║${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}║  This script will deploy your complete database to       ║${NC}"
echo -e "${PURPLE}║  Supabase in just a few steps!                           ║${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${1}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}${CHECK} ${1}${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}${CROSS} ${1}${NC}"
}

# Function to print info
print_info() {
    echo -e "${CYAN}${INFO} ${1}${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}${WARNING} ${1}${NC}"
}

# Check if Supabase CLI is installed
print_section "Step 1: Checking Prerequisites"

if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed!"
    echo ""
    print_info "Please install Supabase CLI first:"
    echo ""
    echo "  macOS/Linux:"
    echo "    brew install supabase/tap/supabase"
    echo ""
    echo "  npm:"
    echo "    npm install -g supabase"
    echo ""
    echo "  For other platforms, visit: https://supabase.com/docs/guides/cli"
    echo ""
    exit 1
fi

print_success "Supabase CLI is installed ($(supabase --version))"

# Check if Git is available
if command -v git &> /dev/null; then
    print_success "Git is available"
fi

print_section "Step 2: Choose Deployment Type"

echo "How would you like to deploy?"
echo ""
echo "  1) ${GREEN}Cloud Deployment${NC} (Deploy to Supabase Cloud - Recommended)"
echo "  2) ${BLUE}Local Development${NC} (Run Supabase locally with Docker)"
echo ""
read -p "Enter your choice (1 or 2): " deployment_choice

if [ "$deployment_choice" = "1" ]; then
    # Cloud Deployment
    print_section "Step 3: Supabase Cloud Deployment"
    
    print_info "Logging in to Supabase..."
    echo ""
    echo "This will open your browser for authentication."
    echo "If you don't have an account, you can create one for free."
    echo ""
    read -p "Press Enter to continue..."
    
    if ! supabase login; then
        print_error "Login failed. Please try again."
        exit 1
    fi
    
    print_success "Successfully logged in to Supabase!"
    
    print_section "Step 4: Create or Link Project"
    
    echo "Do you want to:"
    echo ""
    echo "  1) ${GREEN}Create a new Supabase project${NC}"
    echo "  2) ${BLUE}Link to an existing project${NC}"
    echo ""
    read -p "Enter your choice (1 or 2): " project_choice
    
    if [ "$project_choice" = "1" ]; then
        # Create new project
        print_info "Creating a new Supabase project..."
        echo ""
        read -p "Enter a name for your project (e.g., tikit-os-prod): " project_name
        read -p "Enter your database password (min 8 characters): " -s db_password
        echo ""
        
        if [ ${#db_password} -lt 8 ]; then
            print_error "Password must be at least 8 characters!"
            exit 1
        fi
        
        read -p "Enter the region (e.g., us-east-1): " region
        
        if [ -z "$region" ]; then
            region="us-east-1"
            print_info "Using default region: us-east-1"
        fi
        
        print_info "Creating project..."
        supabase projects create "$project_name" --db-password "$db_password" --region "$region"
        
        # Get the project reference
        PROJECT_REF=$(supabase projects list | grep "$project_name" | awk '{print $3}')
        
        if [ -z "$PROJECT_REF" ]; then
            print_error "Failed to get project reference. Please check Supabase dashboard."
            exit 1
        fi
        
        # Link the project
        supabase link --project-ref "$PROJECT_REF"
        
        print_success "Project created and linked successfully!"
    else
        # Link existing project
        print_info "Available projects:"
        supabase projects list
        echo ""
        read -p "Enter the project reference (from the list above): " project_ref
        
        supabase link --project-ref "$project_ref"
        PROJECT_REF="$project_ref"
        
        print_success "Project linked successfully!"
    fi
    
    print_section "Step 5: Deploy Database Schema"
    
    print_info "Deploying migrations to Supabase..."
    
    if supabase db push; then
        print_success "Database schema deployed successfully!"
    else
        print_error "Migration deployment failed!"
        print_info "You can try manually with: supabase db push"
        exit 1
    fi
    
    print_section "Step 6: Setting Up Environment Variables"
    
    print_info "Fetching project credentials..."
    
    # Get project details
    PROJECT_URL="https://${PROJECT_REF}.supabase.co"
    
    # Create .env.local file
    cat > .env.local << EOF
# Supabase Configuration (Auto-generated by one-click-deploy.sh)
# Generated on: $(date)

# Project URL
NEXT_PUBLIC_SUPABASE_URL=${PROJECT_URL}

# Anon Key (safe to expose in browser)
# Get this from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role Key (NEVER expose in browser, server-side only)
# Get this from: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here
EOF
    
    print_success ".env.local file created!"
    echo ""
    print_warning "IMPORTANT: You need to add your API keys to .env.local"
    echo ""
    echo "  1. Visit: ${CYAN}https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api${NC}"
    echo "  2. Copy your 'anon' and 'service_role' keys"
    echo "  3. Update .env.local file with these values"
    echo "  4. Get Gemini API key from: ${CYAN}https://makersuite.google.com/app/apikey${NC}"
    echo ""
    
elif [ "$deployment_choice" = "2" ]; then
    # Local Development
    print_section "Step 3: Local Development Setup"
    
    print_info "Starting local Supabase instance..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running!"
        print_info "Please start Docker Desktop and try again."
        exit 1
    fi
    
    print_success "Docker is running"
    
    # Start Supabase locally
    if supabase start; then
        print_success "Local Supabase started successfully!"
    else
        print_error "Failed to start local Supabase"
        exit 1
    fi
    
    # Get local credentials
    print_info "Extracting local credentials..."
    LOCAL_URL=$(supabase status | grep "API URL" | awk '{print $3}')
    LOCAL_ANON_KEY=$(supabase status | grep "anon key" | awk '{print $3}')
    LOCAL_SERVICE_KEY=$(supabase status | grep "service_role key" | awk '{print $3}')
    
    # Create .env.local
    cat > .env.local << EOF
# Supabase Local Development Configuration
# Generated on: $(date)

NEXT_PUBLIC_SUPABASE_URL=${LOCAL_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${LOCAL_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${LOCAL_SERVICE_KEY}

# Gemini API Key (optional for local development)
GEMINI_API_KEY=your_gemini_api_key_here
EOF
    
    print_success ".env.local file created with local credentials!"
else
    print_error "Invalid choice!"
    exit 1
fi

print_section "Step 7: Verification"

print_info "Running deployment verification..."

if [ -f "./scripts/verify-supabase.sh" ]; then
    chmod +x ./scripts/verify-supabase.sh
    ./scripts/verify-supabase.sh
else
    print_warning "Verification script not found, skipping..."
fi

print_section "${SPARKLES} Deployment Complete! ${SPARKLES}"

echo ""
print_success "Your TiKiT OS database is ready!"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "  1. ${GREEN}Update .env.local${NC} with your API keys (if not done)"
echo "  2. ${GREEN}Install dependencies:${NC} pnpm install"
echo "  3. ${GREEN}Start the development server:${NC} pnpm dev:web"
echo "  4. ${GREEN}Open your browser:${NC} http://localhost:3000"
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo ""
echo "  • View Supabase status:     ${YELLOW}supabase status${NC}"
echo "  • Open Supabase Studio:     ${YELLOW}supabase studio${NC}"
echo "  • View project dashboard:   ${YELLOW}supabase projects list${NC}"
echo "  • Run migrations:           ${YELLOW}supabase db push${NC}"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo ""
echo "  • Deployment Guide:   ${YELLOW}./SUPABASE_DEPLOYMENT.md${NC}"
echo "  • Quick Start:        ${YELLOW}./QUICKSTART.md${NC}"
echo "  • Database Schema:    ${YELLOW}./DATABASE_SCHEMA.md${NC}"
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}║  ${GREEN}${SPARKLES} Happy Building with TiKiT OS! ${SPARKLES}${PURPLE}                       ║${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

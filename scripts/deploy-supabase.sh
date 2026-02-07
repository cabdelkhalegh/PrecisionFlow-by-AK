#!/bin/bash

# TiKiT OS - Supabase Deployment Script
# This script automates the deployment of the database to Supabase

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

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

# Check if Supabase CLI is installed
check_cli() {
    print_header "Checking Prerequisites"
    
    if command -v supabase &> /dev/null; then
        SUPABASE_VERSION=$(supabase --version)
        print_success "Supabase CLI installed: $SUPABASE_VERSION"
    else
        print_error "Supabase CLI not found"
        echo ""
        echo "Please install Supabase CLI first:"
        echo "  macOS:   brew install supabase/tap/supabase"
        echo "  Linux:   brew install supabase/tap/supabase"
        echo "  Windows: scoop install supabase"
        echo "  npm:     npm install -g supabase"
        echo ""
        echo "For more details, visit: https://supabase.com/docs/guides/cli"
        exit 1
    fi
}

# Login to Supabase
login_supabase() {
    print_header "Logging in to Supabase"
    
    if supabase projects list &> /dev/null; then
        print_success "Already logged in to Supabase"
    else
        print_info "Opening browser for Supabase login..."
        supabase login
        
        if [ $? -eq 0 ]; then
            print_success "Successfully logged in"
        else
            print_error "Login failed"
            exit 1
        fi
    fi
}

# Link or create project
setup_project() {
    print_header "Setting up Supabase Project"
    
    # Check if already linked
    if [ -f ".supabase/config.toml" ]; then
        print_warning "Project seems to be already linked"
        read -p "Do you want to re-link? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping project setup"
            return 0
        fi
    fi
    
    echo ""
    echo "Choose an option:"
    echo "  1) Link to existing project"
    echo "  2) Create new project"
    echo ""
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            echo ""
            print_info "Listing your Supabase projects..."
            supabase projects list
            echo ""
            read -p "Enter project reference ID: " PROJECT_REF
            
            if [ -z "$PROJECT_REF" ]; then
                print_error "Project reference ID cannot be empty"
                exit 1
            fi
            
            print_info "Linking to project: $PROJECT_REF"
            supabase link --project-ref "$PROJECT_REF"
            
            if [ $? -eq 0 ]; then
                print_success "Project linked successfully"
            else
                print_error "Failed to link project"
                exit 1
            fi
            ;;
        2)
            echo ""
            read -p "Enter project name (e.g., tikit-os): " PROJECT_NAME
            read -p "Enter database password: " -s DB_PASSWORD
            echo ""
            read -p "Enter region (e.g., us-east-1): " REGION
            
            if [ -z "$PROJECT_NAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$REGION" ]; then
                print_error "All fields are required"
                exit 1
            fi
            
            print_info "Creating new project: $PROJECT_NAME"
            supabase projects create "$PROJECT_NAME" --region "$REGION" --db-password "$DB_PASSWORD"
            
            if [ $? -eq 0 ]; then
                print_success "Project created successfully"
                
                # Get project ref and link
                PROJECT_REF=$(supabase projects list | grep "$PROJECT_NAME" | awk '{print $4}')
                print_info "Linking to project: $PROJECT_REF"
                supabase link --project-ref "$PROJECT_REF"
            else
                print_error "Failed to create project"
                exit 1
            fi
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Deploy migrations
deploy_migrations() {
    print_header "Deploying Database Migrations"
    
    if [ ! -d "supabase/migrations" ]; then
        print_error "Migration directory not found"
        exit 1
    fi
    
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    
    if [ $MIGRATION_COUNT -eq 0 ]; then
        print_warning "No migrations found"
        return 0
    fi
    
    print_info "Found $MIGRATION_COUNT migration(s)"
    
    echo ""
    read -p "Deploy migrations now? (Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_warning "Skipping migration deployment"
        return 0
    fi
    
    print_info "Deploying migrations..."
    supabase db push
    
    if [ $? -eq 0 ]; then
        print_success "Migrations deployed successfully"
    else
        print_error "Migration deployment failed"
        print_info "Check the error messages above for details"
        exit 1
    fi
}

# Get and display credentials
setup_environment() {
    print_header "Environment Variables Setup"
    
    print_info "Fetching project credentials..."
    
    # Get project details
    PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')
    
    if [ -z "$PROJECT_URL" ]; then
        print_warning "Could not fetch project URL automatically"
        echo ""
        echo "Please get your credentials manually from:"
        echo "Supabase Dashboard → Settings → API"
        return 0
    fi
    
    print_success "Project URL: $PROJECT_URL"
    
    echo ""
    print_info "Creating .env.local file..."
    
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists"
        read -p "Overwrite? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping .env.local creation"
            return 0
        fi
    fi
    
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get-from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get-from-dashboard>

# Google Gemini API (optional)
GEMINI_API_KEY=your-gemini-api-key-here

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# Feature Flags
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF
    
    print_success ".env.local created"
    
    echo ""
    print_warning "ACTION REQUIRED:"
    echo "1. Open Supabase Dashboard: https://app.supabase.com"
    echo "2. Go to Settings → API"
    echo "3. Copy the Anon Key and Service Role Key"
    echo "4. Update .env.local with these keys"
    echo ""
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    print_info "Checking database connection..."
    
    # List migrations
    APPLIED_MIGRATIONS=$(supabase migration list 2>/dev/null | grep -c "applied" || echo "0")
    
    if [ "$APPLIED_MIGRATIONS" -gt 0 ]; then
        print_success "$APPLIED_MIGRATIONS migration(s) applied"
    else
        print_warning "No migrations found (this might be expected)"
    fi
    
    echo ""
    print_info "You can verify your deployment by:"
    echo "1. Opening Supabase Studio: supabase db studio"
    echo "2. Running: supabase db diff"
    echo "3. Checking tables in Dashboard → Table Editor"
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║   TiKiT OS - Supabase Deployment Script       ║"
    echo "║   Version 1.0                                  ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_cli
    login_supabase
    setup_project
    deploy_migrations
    setup_environment
    verify_deployment
    
    print_header "Deployment Complete! 🎉"
    
    echo "Next steps:"
    echo "1. Update .env.local with your API keys (if not done)"
    echo "2. Verify tables: supabase db studio"
    echo "3. Test connection: pnpm dev:web"
    echo "4. Visit: http://localhost:3000/campaigns"
    echo ""
    print_success "Happy coding!"
}

# Run main function
main

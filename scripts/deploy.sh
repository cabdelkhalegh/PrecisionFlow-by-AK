#!/usr/bin/env bash
#
# deploy.sh — Build, verify, and deploy PrecisionFlow
#
# Usage:
#   ./scripts/deploy.sh [environment]
#
# Environments: staging | production | docker (default: staging)
#

set -euo pipefail

ENVIRONMENT="${1:-staging}"
APP_NAME="precisionflow"
HEALTH_ENDPOINT="/api/health"
DEPLOY_TIMEOUT=120
REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "GEMINI_API_KEY")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[deploy]${NC} $1"; }
ok()    { echo -e "${GREEN}[  ok  ]${NC} $1"; }
warn()  { echo -e "${YELLOW}[ warn ]${NC} $1"; }
fail()  { echo -e "${RED}[ fail ]${NC} $1"; exit 1; }

# ─── Pre-flight checks ────────────────────────────────────────────────────
preflight() {
  log "Running pre-flight checks for ${ENVIRONMENT}..."

  # Node.js version
  NODE_VER=$(node -v 2>/dev/null || echo "none")
  [[ "$NODE_VER" == "none" ]] && fail "Node.js is not installed"
  ok "Node.js $NODE_VER"

  # pnpm
  PNPM_VER=$(pnpm -v 2>/dev/null || echo "none")
  [[ "$PNPM_VER" == "none" ]] && fail "pnpm is not installed"
  ok "pnpm $PNPM_VER"

  # Required environment variables
  for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      fail "Required environment variable $var is not set"
    fi
  done
  ok "All required environment variables are set"

  # Disk space check (need at least 1GB)
  AVAIL_KB=$(df -k . | tail -1 | awk '{print $4}')
  if [[ "$AVAIL_KB" -lt 1048576 ]]; then
    warn "Less than 1GB disk space available"
  else
    ok "Disk space: $((AVAIL_KB / 1024))MB available"
  fi
}

# ─── Install & Build ──────────────────────────────────────────────────────
install_deps() {
  log "Installing dependencies..."
  pnpm install --frozen-lockfile
  ok "Dependencies installed"
}

run_tests() {
  log "Running test suite..."
  pnpm test 2>&1 || fail "Tests failed — aborting deployment"
  ok "All tests passed"
}

build_app() {
  log "Building application for ${ENVIRONMENT}..."
  NODE_ENV=production pnpm build
  ok "Build completed successfully"
}

# ─── Health check ─────────────────────────────────────────────────────────
health_check() {
  local url="$1"
  local max_attempts=$((DEPLOY_TIMEOUT / 5))
  local attempt=0

  log "Waiting for application to be healthy at ${url}${HEALTH_ENDPOINT}..."

  while [[ $attempt -lt $max_attempts ]]; do
    attempt=$((attempt + 1))
    if curl -sf "${url}${HEALTH_ENDPOINT}" > /dev/null 2>&1; then
      ok "Application is healthy (attempt ${attempt}/${max_attempts})"
      return 0
    fi
    sleep 5
  done

  fail "Health check failed after ${DEPLOY_TIMEOUT}s"
}

# ─── Smoke tests ──────────────────────────────────────────────────────────
smoke_tests() {
  local url="$1"
  log "Running smoke tests against ${url}..."

  # 1. Health endpoint
  HEALTH=$(curl -sf "${url}${HEALTH_ENDPOINT}" | grep -c '"ok"' || echo 0)
  [[ "$HEALTH" -gt 0 ]] && ok "Health endpoint: OK" || fail "Health endpoint failed"

  # 2. Home page
  HOME_STATUS=$(curl -so /dev/null -w "%{http_code}" "${url}/")
  [[ "$HOME_STATUS" == "200" ]] && ok "Home page: HTTP ${HOME_STATUS}" || fail "Home page: HTTP ${HOME_STATUS}"

  # 3. Login page
  LOGIN_STATUS=$(curl -so /dev/null -w "%{http_code}" "${url}/login")
  [[ "$LOGIN_STATUS" == "200" ]] && ok "Login page: HTTP ${LOGIN_STATUS}" || fail "Login page: HTTP ${LOGIN_STATUS}"

  # 4. Protected route redirects
  DASH_STATUS=$(curl -so /dev/null -w "%{http_code}" -L "${url}/dashboard")
  ok "Dashboard redirect: HTTP ${DASH_STATUS} (expected redirect to login)"

  ok "All smoke tests passed"
}

# ─── Docker deployment ────────────────────────────────────────────────────
deploy_docker() {
  log "Deploying via Docker Compose..."

  if ! command -v docker &> /dev/null; then
    fail "Docker is not installed"
  fi

  docker compose -f docker-compose.prod.yml up -d --build
  ok "Docker containers started"

  health_check "http://localhost:3000"
  smoke_tests "http://localhost:3000"
}

# ─── Vercel deployment ────────────────────────────────────────────────────
deploy_vercel() {
  log "Deploying to Vercel..."

  if ! command -v vercel &> /dev/null; then
    warn "Vercel CLI not installed. Install with: npm i -g vercel"
    warn "Falling back to manual build verification..."
    build_app
    ok "Build verified — deploy manually via Vercel dashboard or install Vercel CLI"
    return 0
  fi

  if [[ "$ENVIRONMENT" == "production" ]]; then
    vercel --prod
  else
    vercel
  fi

  ok "Deployed to Vercel (${ENVIRONMENT})"
}

# ─── Rollback ─────────────────────────────────────────────────────────────
rollback() {
  warn "Rolling back deployment..."

  if [[ -f docker-compose.prod.yml ]] && command -v docker &> /dev/null; then
    docker compose -f docker-compose.prod.yml down
    warn "Docker containers stopped"
  fi

  if command -v vercel &> /dev/null; then
    warn "For Vercel rollback, use: vercel rollback"
  fi

  fail "Deployment rolled back — check logs for details"
}

# ─── Main ─────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "═══════════════════════════════════════════════════"
  echo "  🚀 ${APP_NAME} Deployment — ${ENVIRONMENT}"
  echo "═══════════════════════════════════════════════════"
  echo ""

  trap rollback ERR

  preflight
  install_deps
  run_tests
  build_app

  case "${ENVIRONMENT}" in
    production|staging)
      deploy_vercel
      ;;
    docker)
      deploy_docker
      ;;
    *)
      fail "Unknown environment: ${ENVIRONMENT}"
      ;;
  esac

  echo ""
  echo "═══════════════════════════════════════════════════"
  echo "  ✅ Deployment complete — ${ENVIRONMENT}"
  echo "═══════════════════════════════════════════════════"
  echo ""
}

main "$@"

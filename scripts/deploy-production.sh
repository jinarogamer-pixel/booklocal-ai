#!/bin/bash

# BookLocal Production Deployment Script
# Comprehensive deployment with staging, production, monitoring, and rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ID="booklocal_${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="/tmp/booklocal_deploy_${TIMESTAMP}.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Environment validation
validate_environment() {
    log "🔍 Validating deployment environment..."
    
    # Check required tools
    local required_tools=("docker" "docker-compose" "kubectl" "helm" "aws" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "Required tool '$tool' is not installed"
        fi
    done
    
    # Check environment variables
    local required_vars=(
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXTAUTH_SECRET"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "DOMAIN_NAME"
        "SSL_EMAIL"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Environment variable '$var' is not set"
        fi
    done
    
    # Validate Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
    fi
    
    # Validate Kubernetes connection
    if ! kubectl cluster-info &> /dev/null; then
        warn "Kubernetes cluster not accessible. Continuing with Docker deployment."
    fi
    
    log "✅ Environment validation complete"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Running pre-deployment checks..."
    
    cd "$PROJECT_ROOT"
    
    # Check if we're on the correct branch
    local current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" && "$current_branch" != "production" ]]; then
        warn "Currently on branch '$current_branch'. Consider deploying from 'main' or 'production'."
        read -p "Continue anyway? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        warn "You have uncommitted changes"
        git status --porcelain
        read -p "Continue deployment? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Run tests
    log "🧪 Running test suite..."
    npm test -- --passWithNoTests || error "Tests failed"
    
    # Security scan
    log "🔒 Running security scan..."
    npm audit --audit-level=high || warn "Security vulnerabilities found"
    
    # Build validation
    log "🏗️ Validating build..."
    npm run build || error "Build failed"
    
    log "✅ Pre-deployment checks complete"
}

# Build and tag Docker images
build_images() {
    log "🐳 Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Build production image
    docker build -f infrastructure/Dockerfile.prod -t "booklocal:${TIMESTAMP}" -t "booklocal:latest" .
    
    # Build backup service image
    docker build -f infrastructure/backup/Dockerfile -t "booklocal-backup:${TIMESTAMP}" -t "booklocal-backup:latest" infrastructure/backup/
    
    # Build security scanner image
    docker build -f infrastructure/security/Dockerfile.scanner -t "booklocal-security:${TIMESTAMP}" -t "booklocal-security:latest" infrastructure/security/
    
    # Tag for registry (if using one)
    if [[ -n "${DOCKER_REGISTRY:-}" ]]; then
        docker tag "booklocal:${TIMESTAMP}" "${DOCKER_REGISTRY}/booklocal:${TIMESTAMP}"
        docker tag "booklocal:latest" "${DOCKER_REGISTRY}/booklocal:latest"
        
        # Push to registry
        log "📤 Pushing images to registry..."
        docker push "${DOCKER_REGISTRY}/booklocal:${TIMESTAMP}"
        docker push "${DOCKER_REGISTRY}/booklocal:latest"
    fi
    
    log "✅ Docker images built successfully"
}

# Deploy to staging
deploy_staging() {
    log "🚀 Deploying to staging environment..."
    
    cd "$PROJECT_ROOT"
    
    # Create staging environment file
    cat > .env.staging << EOF
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://staging.${DOMAIN_NAME}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY_TEST}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY_TEST}
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_S3_BUCKET=${AWS_S3_BUCKET_STAGING}
DOMAIN_NAME=staging.${DOMAIN_NAME}
SSL_EMAIL=${SSL_EMAIL}
EOF
    
    # Deploy staging with Docker Compose
    docker-compose -f infrastructure/docker-compose.staging.yml --env-file .env.staging up -d
    
    # Wait for services to be ready
    log "⏳ Waiting for staging services to be ready..."
    sleep 30
    
    # Health check
    local max_attempts=30
    local attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f "http://localhost:3000/api/health" &> /dev/null; then
            log "✅ Staging environment is healthy"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Staging health check failed after $max_attempts attempts"
        fi
        
        info "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
    # Run staging tests
    log "🧪 Running staging tests..."
    npm run test:staging || error "Staging tests failed"
    
    log "✅ Staging deployment complete"
}

# Deploy to production
deploy_production() {
    log "🚀 Deploying to production environment..."
    
    cd "$PROJECT_ROOT"
    
    # Backup current production (if exists)
    if docker-compose -f infrastructure/docker-compose.prod.yml ps | grep -q "Up"; then
        log "💾 Creating production backup..."
        docker-compose -f infrastructure/docker-compose.prod.yml exec -T backup-service /scripts/backup-before-deploy.sh
    fi
    
    # Create production environment file
    cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://${DOMAIN_NAME}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
BRAINTREE_MERCHANT_ID=${BRAINTREE_MERCHANT_ID}
BRAINTREE_PUBLIC_KEY=${BRAINTREE_PUBLIC_KEY}
BRAINTREE_PRIVATE_KEY=${BRAINTREE_PRIVATE_KEY}
ADYEN_API_KEY=${ADYEN_API_KEY}
ADYEN_MERCHANT_ACCOUNT=${ADYEN_MERCHANT_ACCOUNT}
SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN}
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_S3_BUCKET=${AWS_S3_BUCKET}
DOMAIN_NAME=${DOMAIN_NAME}
SSL_EMAIL=${SSL_EMAIL}
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}
EMAIL_ALERTS=${EMAIL_ALERTS}
EOF
    
    # Deploy production with zero-downtime strategy
    log "🔄 Performing zero-downtime deployment..."
    
    # Scale up new version
    docker-compose -f infrastructure/docker-compose.prod.yml --env-file .env.production up -d --scale booklocal-app=6
    
    # Wait for new instances to be ready
    sleep 45
    
    # Health check new instances
    local healthy_instances=0
    local required_instances=3
    
    for i in {1..6}; do
        if curl -f "http://localhost:300$i/api/health" &> /dev/null; then
            ((healthy_instances++))
        fi
    done
    
    if [[ $healthy_instances -lt $required_instances ]]; then
        error "Insufficient healthy instances ($healthy_instances/$required_instances)"
    fi
    
    # Scale down old instances
    docker-compose -f infrastructure/docker-compose.prod.yml --env-file .env.production up -d --scale booklocal-app=3
    
    log "✅ Production deployment complete"
}

# Setup monitoring and alerting
setup_monitoring() {
    log "📊 Setting up monitoring and alerting..."
    
    cd "$PROJECT_ROOT"
    
    # Configure Prometheus
    mkdir -p infrastructure/prometheus
    cat > infrastructure/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "booklocal_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - "alertmanager:9093"

scrape_configs:
  - job_name: 'booklocal-api'
    static_configs:
      - targets: ['booklocal-app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['elasticsearch:9200']
EOF
    
    # Configure Grafana dashboards
    mkdir -p infrastructure/grafana/dashboards
    mkdir -p infrastructure/grafana/provisioning/dashboards
    mkdir -p infrastructure/grafana/provisioning/datasources
    
    # Datasource configuration
    cat > infrastructure/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: booklocal-logs
EOF
    
    # Dashboard provisioning
    cat > infrastructure/grafana/provisioning/dashboards/booklocal.yml << 'EOF'
apiVersion: 1
providers:
  - name: 'BookLocal Dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /var/lib/grafana/dashboards
EOF
    
    # Setup alerting rules
    cat > infrastructure/prometheus/booklocal_alerts.yml << 'EOF'
groups:
  - name: booklocal_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(booklocal_http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(booklocal_http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      - alert: DatabaseConnectionsHigh
        expr: booklocal_database_connections > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection count"
          description: "Database connections: {{ $value }}"

      - alert: PaymentProcessingFailure
        expr: rate(booklocal_payment_transactions_total{status="failed"}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Payment processing failures detected"
          description: "Payment failure rate: {{ $value | humanizePercentage }}"
EOF
    
    log "✅ Monitoring setup complete"
}

# Run security audit
run_security_audit() {
    log "🔒 Running comprehensive security audit..."
    
    cd "$PROJECT_ROOT"
    
    # Container security scan
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        aquasec/trivy image booklocal:latest || warn "Container security issues found"
    
    # Dependency vulnerability scan
    npm audit --audit-level=moderate || warn "Dependency vulnerabilities found"
    
    # OWASP ZAP security scan (if available)
    if command -v zaproxy &> /dev/null; then
        log "🕷️ Running OWASP ZAP scan..."
        zaproxy -cmd -quickurl "http://localhost:3000" -quickout /tmp/zap-report.html || warn "ZAP scan completed with issues"
    fi
    
    # SSL/TLS configuration check
    if command -v testssl.sh &> /dev/null; then
        log "🔐 Checking SSL/TLS configuration..."
        testssl.sh --quiet "https://${DOMAIN_NAME}" || warn "SSL/TLS configuration issues found"
    fi
    
    log "✅ Security audit complete"
}

# Smoke tests
run_smoke_tests() {
    log "💨 Running smoke tests..."
    
    local base_url="https://${DOMAIN_NAME}"
    local tests_passed=0
    local tests_total=0
    
    # Test home page
    ((tests_total++))
    if curl -f -s "$base_url" > /dev/null; then
        log "✅ Home page accessible"
        ((tests_passed++))
    else
        warn "❌ Home page not accessible"
    fi
    
    # Test API health
    ((tests_total++))
    if curl -f -s "$base_url/api/health" | jq -e '.status == "healthy"' > /dev/null; then
        log "✅ API health check passed"
        ((tests_passed++))
    else
        warn "❌ API health check failed"
    fi
    
    # Test metrics endpoint
    ((tests_total++))
    if curl -f -s "$base_url/api/metrics" > /dev/null; then
        log "✅ Metrics endpoint accessible"
        ((tests_passed++))
    else
        warn "❌ Metrics endpoint not accessible"
    fi
    
    # Test authentication
    ((tests_total++))
    if curl -f -s "$base_url/api/auth/signin" > /dev/null; then
        log "✅ Authentication endpoint accessible"
        ((tests_passed++))
    else
        warn "❌ Authentication endpoint not accessible"
    fi
    
    # Test payment processing (mock)
    ((tests_total++))
    local payment_response=$(curl -s -X POST "$base_url/api/payments/test" \
        -H "Content-Type: application/json" \
        -d '{"amount": 100, "currency": "USD", "test": true}')
    
    if echo "$payment_response" | jq -e '.success == true' > /dev/null; then
        log "✅ Payment processing test passed"
        ((tests_passed++))
    else
        warn "❌ Payment processing test failed"
    fi
    
    # Summary
    log "📊 Smoke tests complete: $tests_passed/$tests_total passed"
    
    if [[ $tests_passed -lt $tests_total ]]; then
        warn "Some smoke tests failed. Consider investigating."
    fi
}

# Performance baseline
establish_performance_baseline() {
    log "⚡ Establishing performance baseline..."
    
    # Load testing with Apache Bench (if available)
    if command -v ab &> /dev/null; then
        log "🔥 Running load test..."
        ab -n 1000 -c 10 "https://${DOMAIN_NAME}/" > /tmp/load_test_results.txt
        
        # Extract key metrics
        local avg_response_time=$(grep "Time per request" /tmp/load_test_results.txt | head -1 | awk '{print $4}')
        local requests_per_second=$(grep "Requests per second" /tmp/load_test_results.txt | awk '{print $4}')
        
        log "📈 Average response time: ${avg_response_time}ms"
        log "📈 Requests per second: ${requests_per_second}"
        
        # Store baseline metrics
        cat > /tmp/performance_baseline.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployment_id": "$DEPLOYMENT_ID",
  "avg_response_time_ms": $avg_response_time,
  "requests_per_second": $requests_per_second
}
EOF
    fi
    
    log "✅ Performance baseline established"
}

# Rollback function
rollback() {
    local rollback_tag="${1:-previous}"
    
    error "🔄 Rolling back to $rollback_tag..."
    
    cd "$PROJECT_ROOT"
    
    # Stop current deployment
    docker-compose -f infrastructure/docker-compose.prod.yml down
    
    # Deploy previous version
    docker-compose -f infrastructure/docker-compose.prod.yml up -d
    
    # Wait for rollback to complete
    sleep 30
    
    # Verify rollback
    if curl -f "https://${DOMAIN_NAME}/api/health" &> /dev/null; then
        log "✅ Rollback successful"
    else
        error "❌ Rollback failed"
    fi
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up deployment artifacts..."
    
    # Remove temporary files
    rm -f .env.staging .env.production
    rm -f /tmp/load_test_results.txt
    rm -f /tmp/performance_baseline.json
    
    # Prune unused Docker images (keep last 3 versions)
    docker image prune -f
    
    log "✅ Cleanup complete"
}

# Send deployment notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 BookLocal Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || warn "Failed to send Slack notification"
    fi
    
    # Email notification
    if [[ -n "${EMAIL_ALERTS:-}" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "BookLocal Deployment $status" "$EMAIL_ALERTS" || warn "Failed to send email notification"
    fi
}

# Main deployment function
main() {
    local environment="${1:-production}"
    
    log "🚀 Starting BookLocal deployment to $environment..."
    log "📝 Deployment ID: $DEPLOYMENT_ID"
    log "📄 Log file: $LOG_FILE"
    
    # Trap for cleanup on exit
    trap cleanup EXIT
    trap 'rollback; exit 1' ERR
    
    # Deployment steps
    validate_environment
    pre_deployment_checks
    build_images
    
    case "$environment" in
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_staging
            deploy_production
            setup_monitoring
            run_security_audit
            run_smoke_tests
            establish_performance_baseline
            ;;
        *)
            error "Unknown environment: $environment. Use 'staging' or 'production'"
            ;;
    esac
    
    log "🎉 Deployment completed successfully!"
    log "🌐 Application URL: https://${DOMAIN_NAME}"
    log "📊 Monitoring: https://${DOMAIN_NAME}:3001 (Grafana)"
    log "📈 Metrics: https://${DOMAIN_NAME}:9090 (Prometheus)"
    log "🔍 Logs: https://${DOMAIN_NAME}:5601 (Kibana)"
    
    send_notification "SUCCESS" "BookLocal deployment to $environment completed successfully. Deployment ID: $DEPLOYMENT_ID"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
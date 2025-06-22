#!/bin/bash

# Knowledge RAG WebUI Deployment Script
# Usage: ./deploy.sh [environment] [version]

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Use 'staging' or 'production'"
fi

log "Starting deployment to $ENVIRONMENT environment with version $VERSION"

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required but not installed"
    command -v docker >/dev/null 2>&1 || error "docker is required but not installed"
    
    # Check kubectl context
    CURRENT_CONTEXT=$(kubectl config current-context)
    log "Current kubectl context: $CURRENT_CONTEXT"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ ! "$CURRENT_CONTEXT" =~ production ]]; then
            warning "You're about to deploy to production but kubectl context doesn't contain 'production'"
            read -p "Continue? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                error "Deployment cancelled"
            fi
        fi
    fi
}

# Build and push Docker image
build_and_push() {
    log "Building and pushing Docker image..."
    
    cd "$PROJECT_DIR"
    
    # Build image
    docker build -t "ghcr.io/anubissbe/knowledge-rag-webui:$VERSION" .
    
    # Tag as environment-specific
    docker tag "ghcr.io/anubissbe/knowledge-rag-webui:$VERSION" \
               "ghcr.io/anubissbe/knowledge-rag-webui:$ENVIRONMENT-$VERSION"
    
    # Push images
    docker push "ghcr.io/anubissbe/knowledge-rag-webui:$VERSION"
    docker push "ghcr.io/anubissbe/knowledge-rag-webui:$ENVIRONMENT-$VERSION"
    
    success "Docker image built and pushed"
}

# Deploy to Kubernetes
deploy_k8s() {
    log "Deploying to Kubernetes..."
    
    cd "$PROJECT_DIR"
    
    # Create namespace if it doesn't exist
    kubectl create namespace "$ENVIRONMENT" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f "k8s/$ENVIRONMENT/"
    
    # Update image in deployment
    kubectl set image "deployment/knowledge-rag-webui$([ "$ENVIRONMENT" == "staging" ] && echo "-staging" || echo "")" \
                      "webui=ghcr.io/anubissbe/knowledge-rag-webui:$ENVIRONMENT-$VERSION" \
                      -n "$ENVIRONMENT"
    
    # Wait for rollout to complete
    kubectl rollout status "deployment/knowledge-rag-webui$([ "$ENVIRONMENT" == "staging" ] && echo "-staging" || echo "")" \
                          -n "$ENVIRONMENT" \
                          --timeout=300s
    
    success "Kubernetes deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Get service endpoint
    if [[ "$ENVIRONMENT" == "production" ]]; then
        ENDPOINT="https://knowledge-rag.example.com"
    else
        ENDPOINT="https://staging.knowledge-rag.example.com"
    fi
    
    # Wait for service to be ready
    for i in {1..30}; do
        if curl -sSf "$ENDPOINT" >/dev/null 2>&1; then
            success "Health check passed"
            return 0
        fi
        log "Waiting for service to be ready... ($i/30)"
        sleep 10
    done
    
    error "Health check failed - service not responding after 5 minutes"
}

# Cleanup old deployments
cleanup() {
    log "Cleaning up old deployments..."
    
    # Keep last 3 replica sets
    kubectl get rs -n "$ENVIRONMENT" \
        -l app="knowledge-rag-webui$([ "$ENVIRONMENT" == "staging" ] && echo "-staging" || echo "")" \
        --sort-by='.metadata.creationTimestamp' \
        -o name | head -n -3 | xargs -r kubectl delete -n "$ENVIRONMENT"
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    check_prerequisites
    
    if [[ "${SKIP_BUILD:-false}" != "true" ]]; then
        build_and_push
    fi
    
    deploy_k8s
    health_check
    cleanup
    
    success "Deployment to $ENVIRONMENT completed successfully!"
    log "Application is available at: $([ "$ENVIRONMENT" == "production" ] && echo "https://knowledge-rag.example.com" || echo "https://staging.knowledge-rag.example.com")"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
#!/bin/bash

# Knowledge RAG WebUI Rollback Script
# Usage: ./rollback.sh [environment] [revision]

set -e

ENVIRONMENT=${1:-staging}
REVISION=${2:-}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

DEPLOYMENT_NAME="knowledge-rag-webui$([ "$ENVIRONMENT" == "staging" ] && echo "-staging" || echo "")"

log "Starting rollback for $ENVIRONMENT environment"

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required but not installed"
    
    # Check kubectl context
    CURRENT_CONTEXT=$(kubectl config current-context)
    log "Current kubectl context: $CURRENT_CONTEXT"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ ! "$CURRENT_CONTEXT" =~ production ]]; then
            warning "You're about to rollback production but kubectl context doesn't contain 'production'"
            read -p "Continue? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                error "Rollback cancelled"
            fi
        fi
    fi
}

# Show deployment history
show_history() {
    log "Deployment history:"
    kubectl rollout history "deployment/$DEPLOYMENT_NAME" -n "$ENVIRONMENT"
}

# Perform rollback
perform_rollback() {
    if [[ -n "$REVISION" ]]; then
        log "Rolling back to revision $REVISION..."
        kubectl rollout undo "deployment/$DEPLOYMENT_NAME" \
                        --to-revision="$REVISION" \
                        -n "$ENVIRONMENT"
    else
        log "Rolling back to previous revision..."
        kubectl rollout undo "deployment/$DEPLOYMENT_NAME" \
                        -n "$ENVIRONMENT"
    fi
    
    # Wait for rollback to complete
    kubectl rollout status "deployment/$DEPLOYMENT_NAME" \
                          -n "$ENVIRONMENT" \
                          --timeout=300s
    
    success "Rollback completed"
}

# Health check after rollback
health_check() {
    log "Performing health check after rollback..."
    
    # Get service endpoint
    if [[ "$ENVIRONMENT" == "production" ]]; then
        ENDPOINT="https://knowledge-rag.example.com"
    else
        ENDPOINT="https://staging.knowledge-rag.example.com"
    fi
    
    # Wait for service to be ready
    for i in {1..30}; do
        if curl -sSf "$ENDPOINT" >/dev/null 2>&1; then
            success "Health check passed after rollback"
            return 0
        fi
        log "Waiting for service to be ready after rollback... ($i/30)"
        sleep 10
    done
    
    error "Health check failed after rollback - service not responding after 5 minutes"
}

# Main rollback flow
main() {
    check_prerequisites
    
    # Show history before rollback
    show_history
    
    # Confirm rollback
    if [[ -z "$REVISION" ]]; then
        warning "This will rollback to the previous revision"
    else
        warning "This will rollback to revision $REVISION"
    fi
    
    read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Rollback cancelled"
    fi
    
    perform_rollback
    health_check
    
    # Show updated history
    log "Updated deployment history:"
    show_history
    
    success "Rollback completed successfully!"
    log "Application is available at: $([ "$ENVIRONMENT" == "production" ] && echo "https://knowledge-rag.example.com" || echo "https://staging.knowledge-rag.example.com")"
}

# Handle script interruption
trap 'error "Rollback interrupted"' INT TERM

# Run main function
main "$@"
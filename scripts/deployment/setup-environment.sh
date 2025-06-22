#!/bin/bash

# Environment Setup Script for Knowledge RAG WebUI
# Usage: ./setup-environment.sh [environment]

set -e

ENVIRONMENT=${1:-staging}
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

log "Setting up $ENVIRONMENT environment"

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || error "kubectl is required but not installed"
    command -v helm >/dev/null 2>&1 || warning "helm is recommended but not installed"
    
    # Check kubectl access
    kubectl cluster-info >/dev/null 2>&1 || error "Cannot connect to Kubernetes cluster"
    
    success "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    log "Creating namespace: $ENVIRONMENT"
    
    kubectl create namespace "$ENVIRONMENT" --dry-run=client -o yaml | kubectl apply -f -
    
    # Label namespace
    kubectl label namespace "$ENVIRONMENT" \
            environment="$ENVIRONMENT" \
            app=knowledge-rag-webui \
            --overwrite
    
    success "Namespace created/updated"
}

# Setup RBAC
setup_rbac() {
    log "Setting up RBAC..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: knowledge-rag-webui
  namespace: $ENVIRONMENT
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: $ENVIRONMENT
  name: knowledge-rag-webui-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: knowledge-rag-webui-binding
  namespace: $ENVIRONMENT
subjects:
- kind: ServiceAccount
  name: knowledge-rag-webui
  namespace: $ENVIRONMENT
roleRef:
  kind: Role
  name: knowledge-rag-webui-role
  apiGroup: rbac.authorization.k8s.io
EOF
    
    success "RBAC setup completed"
}

# Setup secrets
setup_secrets() {
    log "Setting up secrets..."
    
    # Create TLS secret placeholder (replace with actual certificates)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        DOMAIN="knowledge-rag.example.com"
    else
        DOMAIN="staging.knowledge-rag.example.com"
    fi
    
    # Check if secret already exists
    if kubectl get secret knowledge-rag-webui-tls -n "$ENVIRONMENT" >/dev/null 2>&1; then
        warning "TLS secret already exists, skipping creation"
    else
        # Create a placeholder TLS secret (replace with real certificates)
        kubectl create secret tls knowledge-rag-webui-tls \
                --cert=/dev/null \
                --key=/dev/null \
                --dry-run=client -o yaml | kubectl apply -f - -n "$ENVIRONMENT" || true
        
        warning "Please update the TLS secret with actual certificates for $DOMAIN"
    fi
    
    success "Secrets setup completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create ServiceMonitor for Prometheus (if using Prometheus Operator)
    cat <<EOF | kubectl apply -f -
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: knowledge-rag-webui-monitor
  namespace: $ENVIRONMENT
  labels:
    app: knowledge-rag-webui
spec:
  selector:
    matchLabels:
      app: knowledge-rag-webui$([ "$ENVIRONMENT" == "staging" ] && echo "-staging" || echo "")
  endpoints:
  - port: http
    interval: 30s
    path: /metrics
EOF
    
    success "Monitoring setup completed"
}

# Setup network policies
setup_network_policies() {
    log "Setting up network policies..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: knowledge-rag-webui-netpol
  namespace: $ENVIRONMENT
spec:
  podSelector:
    matchLabels:
      app: knowledge-rag-webui$([ "$ENVIRONMENT" == "staging" ] && echo "-staging" || echo "")
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: nginx-ingress
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
  - to:
    - namespaceSelector:
        matchLabels:
          name: knowledge-rag-backend
    ports:
    - protocol: TCP
      port: 8001
    - protocol: TCP
      port: 8002
    - protocol: TCP
      port: 8003
    - protocol: TCP
      port: 8004
EOF
    
    success "Network policies setup completed"
}

# Create initial ConfigMaps
create_configmaps() {
    log "Creating ConfigMaps..."
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        API_BASE_URL="https://api.knowledge-rag.example.com"
        KNOWLEDGE_GRAPH_URL="https://graph.knowledge-rag.example.com"
        VECTOR_DB_URL="https://vector.knowledge-rag.example.com"
        UNIFIED_DB_URL="https://db.knowledge-rag.example.com"
    else
        API_BASE_URL="https://staging-api.knowledge-rag.example.com"
        KNOWLEDGE_GRAPH_URL="https://staging-graph.knowledge-rag.example.com"
        VECTOR_DB_URL="https://staging-vector.knowledge-rag.example.com"
        UNIFIED_DB_URL="https://staging-db.knowledge-rag.example.com"
    fi
    
    kubectl create configmap webui-$([ "$ENVIRONMENT" == "staging" ] && echo "staging-" || echo "")config \
            --from-literal=api-base-url="$API_BASE_URL" \
            --from-literal=knowledge-graph-url="$KNOWLEDGE_GRAPH_URL" \
            --from-literal=vector-db-url="$VECTOR_DB_URL" \
            --from-literal=unified-db-url="$UNIFIED_DB_URL" \
            --dry-run=client -o yaml | kubectl apply -f - -n "$ENVIRONMENT"
    
    success "ConfigMaps created"
}

# Setup resource quotas
setup_resource_quotas() {
    log "Setting up resource quotas..."
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        CPU_LIMIT="4"
        MEMORY_LIMIT="8Gi"
        PODS_LIMIT="20"
    else
        CPU_LIMIT="2"
        MEMORY_LIMIT="4Gi"
        PODS_LIMIT="10"
    fi
    
    cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: knowledge-rag-webui-quota
  namespace: $ENVIRONMENT
spec:
  hard:
    requests.cpu: $CPU_LIMIT
    requests.memory: $MEMORY_LIMIT
    limits.cpu: $CPU_LIMIT
    limits.memory: $MEMORY_LIMIT
    pods: $PODS_LIMIT
EOF
    
    success "Resource quotas setup completed"
}

# Main setup flow
main() {
    check_prerequisites
    create_namespace
    setup_rbac
    setup_secrets
    create_configmaps
    setup_resource_quotas
    setup_network_policies
    setup_monitoring
    
    success "Environment setup for $ENVIRONMENT completed successfully!"
    
    log "Next steps:"
    log "1. Update TLS certificates in secret 'knowledge-rag-webui-tls'"
    log "2. Review and adjust ConfigMap values if needed"
    log "3. Run deployment: ./deploy.sh $ENVIRONMENT"
}

# Handle script interruption
trap 'error "Environment setup interrupted"' INT TERM

# Run main function
main "$@"
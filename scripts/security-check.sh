#!/bin/bash

# Security Check Script for Knowledge RAG Web UI
# Scans for sensitive data before GitHub push

echo "🔍 Security Check: Scanning for sensitive data..."
echo "================================================"

# Define patterns to search for
declare -a SENSITIVE_PATTERNS=(
    "password.*=.*['\"].*['\"]"
    "secret.*=.*['\"].*['\"]"
    "token.*=.*['\"].*['\"]"
    "key.*=.*['\"].*['\"]"
    "api_key.*=.*['\"].*['\"]"
    "private_key"
    "-----BEGIN.*PRIVATE.*KEY-----"
    "sk_.*"
    "pk_.*"
    "AKIA[0-9A-Z]{16}"
    "192\.168\."
    "localhost:[0-9]+"
    "127\.0\.0\.1"
    "drwho"
    "anubissbe"
)

# Define files to exclude from search
declare -a EXCLUDE_PATTERNS=(
    "node_modules"
    ".git"
    "dist"
    "coverage"
    "playwright-report"
    "test-results"
    "*.log"
    "*.png"
    "*.jpg"
    "*.jpeg"
    "*.gif"
    "*.ico"
    "*.svg"
    "*.woff"
    "*.woff2"
    "*.ttf"
    "*.eot"
)

# Create exclude arguments for grep
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$pattern"
done

# Function to check for sensitive patterns
check_sensitive_data() {
    local found_issues=0
    
    echo "📋 Checking for sensitive patterns..."
    
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        echo "   Checking: $pattern"
        
        # Search for pattern in all files
        if grep -r -i -E "$pattern" . $EXCLUDE_ARGS --exclude="security-check.sh" >/dev/null 2>&1; then
            echo "   ⚠️  Found potential sensitive data:"
            grep -r -i -E "$pattern" . $EXCLUDE_ARGS --exclude="security-check.sh" -n --color=never | head -5
            found_issues=$((found_issues + 1))
            echo ""
        fi
    done
    
    return $found_issues
}

# Function to check environment files
check_env_files() {
    echo "📋 Checking environment files..."
    
    local env_files_found=0
    
    # Check for .env files
    if find . -name ".env*" -not -path "./node_modules/*" | grep -q .; then
        echo "   ⚠️  Found environment files:"
        find . -name ".env*" -not -path "./node_modules/*"
        env_files_found=1
        echo "   📝 Make sure these are in .gitignore"
        echo ""
    fi
    
    return $env_files_found
}

# Function to check for hardcoded URLs
check_hardcoded_urls() {
    echo "📋 Checking for hardcoded development URLs..."
    
    local url_issues=0
    
    # Check for localhost URLs in source files
    if grep -r -E "http://localhost|https://localhost|http://127\.0\.0\.1|https://127\.0\.0\.1|http://192\.168\." src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" >/dev/null 2>&1; then
        echo "   ⚠️  Found hardcoded development URLs in source code:"
        grep -r -E "http://localhost|https://localhost|http://127\.0\.0\.1|https://127\.0\.0\.1|http://192\.168\." src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -n | head -10
        url_issues=1
        echo ""
    fi
    
    return $url_issues
}

# Function to check for personal identifiers
check_personal_data() {
    echo "📋 Checking for personal identifiers..."
    
    local personal_issues=0
    
    # Check for personal usernames, emails, etc.
    if grep -r -i -E "drwho|anubissbe|your.*email|your.*name" . $EXCLUDE_ARGS --exclude="security-check.sh" --exclude="README.md" >/dev/null 2>&1; then
        echo "   ⚠️  Found potential personal identifiers:"
        grep -r -i -E "drwho|anubissbe|your.*email|your.*name" . $EXCLUDE_ARGS --exclude="security-check.sh" --exclude="README.md" -n | head -5
        personal_issues=1
        echo ""
    fi
    
    return $personal_issues
}

# Function to check .gitignore
check_gitignore() {
    echo "📋 Checking .gitignore configuration..."
    
    if [ ! -f ".gitignore" ]; then
        echo "   ⚠️  No .gitignore file found!"
        return 1
    fi
    
    # Check if important patterns are in .gitignore
    local missing_patterns=()
    
    if ! grep -q "\.env" .gitignore; then
        missing_patterns+=(".env*")
    fi
    
    if ! grep -q "node_modules" .gitignore; then
        missing_patterns+=("node_modules/")
    fi
    
    if ! grep -q "dist" .gitignore; then
        missing_patterns+=("dist/")
    fi
    
    if ! grep -q "coverage" .gitignore; then
        missing_patterns+=("coverage/")
    fi
    
    if [ ${#missing_patterns[@]} -gt 0 ]; then
        echo "   ⚠️  Missing important patterns in .gitignore:"
        printf '   %s\n' "${missing_patterns[@]}"
        return 1
    fi
    
    echo "   ✅ .gitignore looks good"
    return 0
}

# Function to generate security report
generate_report() {
    local total_issues=$1
    
    echo "================================================"
    echo "📊 Security Check Summary"
    echo "================================================"
    
    if [ $total_issues -eq 0 ]; then
        echo "✅ No security issues found!"
        echo "🚀 Project is ready for GitHub push"
        echo ""
        echo "🔒 Security checklist completed:"
        echo "   ✅ No sensitive credentials found"
        echo "   ✅ No hardcoded secrets"
        echo "   ✅ No personal identifiers"
        echo "   ✅ Proper .gitignore configuration"
        echo "   ✅ No development URLs in production code"
        return 0
    else
        echo "⚠️  Found $total_issues potential security issues"
        echo "🛑 Please review and fix before GitHub push"
        echo ""
        echo "📝 Security recommendations:"
        echo "   - Move secrets to environment variables"
        echo "   - Use .env.example for documentation"
        echo "   - Replace hardcoded URLs with configuration"
        echo "   - Remove personal identifiers"
        echo "   - Update .gitignore as needed"
        return 1
    fi
}

# Main execution
main() {
    local total_issues=0
    
    check_sensitive_data
    total_issues=$((total_issues + $?))
    
    check_env_files
    total_issues=$((total_issues + $?))
    
    check_hardcoded_urls
    total_issues=$((total_issues + $?))
    
    check_personal_data
    total_issues=$((total_issues + $?))
    
    check_gitignore
    total_issues=$((total_issues + $?))
    
    generate_report $total_issues
    
    exit $total_issues
}

# Run the security check
main
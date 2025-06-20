#!/bin/bash

# Knowledge RAG Web UI - Setup Verification Script

echo "🔍 Verifying Knowledge RAG Web UI Setup"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track overall status
ALL_GOOD=true

# Function to check condition
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ALL_GOOD=false
    fi
}

# 1. Check Node.js version
echo "1. Environment Requirements:"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
[ $NODE_VERSION -ge 18 ] && NODE_OK=0 || NODE_OK=1
check $NODE_OK "Node.js version 18+ (found: $(node -v))"

# 2. Check project files
echo ""
echo "2. Project Structure:"
[ -f "package.json" ] && check 0 "package.json exists" || check 1 "package.json missing"
[ -f "tsconfig.json" ] && check 0 "tsconfig.json exists" || check 1 "tsconfig.json missing"
[ -f "vite.config.ts" ] && check 0 "vite.config.ts exists" || check 1 "vite.config.ts missing"
[ -f "tailwind.config.js" ] && check 0 "tailwind.config.js exists" || check 1 "tailwind.config.js missing"
[ -f ".env" ] && check 0 ".env file exists" || check 1 ".env file missing"

# 3. Check directories
echo ""
echo "3. Directory Structure:"
[ -d "src/components" ] && check 0 "src/components directory" || check 1 "src/components missing"
[ -d "src/services" ] && check 0 "src/services directory" || check 1 "src/services missing"
[ -d "src/types" ] && check 0 "src/types directory" || check 1 "src/types missing"
[ -d "docs" ] && check 0 "docs directory" || check 1 "docs missing"

# 4. Check dependencies
echo ""
echo "4. Dependencies:"
npm list react &>/dev/null && check 0 "React installed" || check 1 "React not installed"
npm list typescript &>/dev/null && check 0 "TypeScript installed" || check 1 "TypeScript not installed"
npm list tailwindcss &>/dev/null && check 0 "Tailwind CSS installed" || check 1 "Tailwind CSS not installed"
npm list zustand &>/dev/null && check 0 "Zustand installed" || check 1 "Zustand not installed"
npm list @tanstack/react-query &>/dev/null && check 0 "React Query installed" || check 1 "React Query not installed"

# 5. Check TypeScript compilation
echo ""
echo "5. TypeScript Compilation:"
npx tsc --noEmit &>/dev/null && check 0 "TypeScript compiles without errors" || check 1 "TypeScript compilation errors"

# 6. Check documentation
echo ""
echo "6. Documentation:"
[ -f "README.md" ] && check 0 "README.md exists" || check 1 "README.md missing"
[ -f "CONTRIBUTING.md" ] && check 0 "CONTRIBUTING.md exists" || check 1 "CONTRIBUTING.md missing"
[ -f "docs/DESIGN.md" ] && check 0 "Design documentation exists" || check 1 "Design documentation missing"
[ -f "docs/ARCHITECTURE.md" ] && check 0 "Architecture documentation exists" || check 1 "Architecture documentation missing"

# 7. Check API configuration
echo ""
echo "7. API Configuration:"
if [ -f ".env" ]; then
    grep -q "VITE_RAG_URL" .env && check 0 "RAG API URL configured" || check 1 "RAG API URL not configured"
    grep -q "VITE_KG_URL" .env && check 0 "Knowledge Graph URL configured" || check 1 "Knowledge Graph URL not configured"
else
    check 1 "Environment file missing"
fi

# Summary
echo ""
echo "======================================"
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ All checks passed! Setup is complete.${NC}"
    echo ""
    echo "To start development:"
    echo "  npm run dev"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
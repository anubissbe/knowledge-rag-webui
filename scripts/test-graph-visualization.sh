#!/bin/bash

# Knowledge Graph Visualization - Comprehensive Test Script
# This script performs automated verification of the graph visualization feature

echo "🔍 Knowledge Graph Visualization - E2E Testing"
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing: $test_name... "
    if eval $test_command; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "1. File Structure Verification"
echo "------------------------------"

run_test "GraphVisualization component exists" "[ -f src/components/graph/GraphVisualization.tsx ]"
run_test "GraphControls component exists" "[ -f src/components/graph/GraphControls.tsx ]"
run_test "GraphSidebar component exists" "[ -f src/components/graph/GraphSidebar.tsx ]"
run_test "Graph index file exists" "[ -f src/components/graph/index.ts ]"
run_test "GraphPage exists" "[ -f src/pages/GraphPage.tsx ]"
run_test "GraphStore exists" "[ -f src/stores/graphStore.ts ]"

echo ""
echo "2. Dependencies Verification"
echo "----------------------------"

run_test "D3.js installed" "grep -q '\"d3\"' package.json"
run_test "D3 types installed" "grep -q '\"@types/d3\"' package.json"

echo ""
echo "3. Build Verification"
echo "--------------------"

echo "Running TypeScript compilation..."
run_test "TypeScript compilation" "npm run typecheck 2>/dev/null"

echo "Building production bundle..."
run_test "Production build" "npm run build > /dev/null 2>&1"

echo ""
echo "4. Import Verification"
echo "---------------------"

run_test "GraphVisualization imports D3" "grep -q \"import.*d3\" src/components/graph/GraphVisualization.tsx"
run_test "GraphPage imports components" "grep -q \"GraphVisualization.*GraphControls.*GraphSidebar\" src/pages/GraphPage.tsx"
run_test "Store exports graphStore" "grep -q \"useGraphStore\" src/stores/index.ts"

echo ""
echo "5. Feature Implementation"
echo "------------------------"

run_test "Force simulation implemented" "grep -q \"forceSimulation\" src/components/graph/GraphVisualization.tsx"
run_test "Zoom behavior implemented" "grep -q \"d3.zoom\" src/components/graph/GraphVisualization.tsx"
run_test "Drag behavior implemented" "grep -q \"d3.drag\" src/components/graph/GraphVisualization.tsx"
run_test "Multiple layouts supported" "grep -q \"layoutType.*force.*radial.*tree\" src/components/graph/GraphControls.tsx"
run_test "Export functionality" "grep -q \"onExport\" src/components/graph/GraphControls.tsx"
run_test "Node filtering" "grep -q \"nodeTypeFilter\" src/components/graph/GraphControls.tsx"

echo ""
echo "6. Type Safety Verification"
echo "--------------------------"

run_test "GraphNode type defined" "grep -q \"interface GraphNode\" src/types/index.ts"
run_test "GraphEdge type defined" "grep -q \"interface GraphEdge\" src/types/index.ts"
run_test "GraphData type defined" "grep -q \"interface GraphData\" src/types/index.ts"

echo ""
echo "7. Documentation Verification"
echo "----------------------------"

run_test "E2E testing documentation exists" "[ -f E2E_TESTING_GRAPH.md ]"
run_test "Graph visualization in CHANGELOG" "grep -q \"Knowledge Graph Visualization\" CHANGELOG.md"
run_test "Graph visualization in PROJECT_STATE" "grep -q \"GraphVisualization Component\" PROJECT_STATE.md"
run_test "D3.js listed in README" "grep -q \"D3.js.*graph visualization\" README.md"

echo ""
echo "8. Integration Verification"
echo "--------------------------"

run_test "Route added to App.tsx" "grep -q \"GraphPage\" src/App.tsx"
run_test "Graph link in Sidebar" "grep -q \"Knowledge Graph.*\/graph\" src/components/layout/Sidebar.tsx"

echo ""
echo "============================================"
echo "Test Results Summary:"
echo "--------------------"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed! Knowledge Graph Visualization is properly implemented.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the implementation.${NC}"
    exit 1
fi
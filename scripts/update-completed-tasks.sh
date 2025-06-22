#!/bin/bash

# MCP Task Manager Update Script
# Updates completed tasks for the knowledge-rag-webui project

API_URL="${MCP_TASK_API_URL:-http://localhost:3001/api}"
PROJECT_ID="9fbc487c-1b29-4f74-b235-4697cf9610e5"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating completed tasks for knowledge-rag-webui project...${NC}\n"

# Function to update a task
update_task() {
    local task_id=$1
    local task_name=$2
    local actual_hours=$3
    local completion_notes=$4
    
    echo -e "${YELLOW}Updating task: ${task_name}${NC}"
    
    # Prepare the JSON payload
    local payload=$(cat <<EOF
{
    "status": "completed",
    "actual_hours": ${actual_hours},
    "completed_at": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")",
    "implementation_notes": "${completion_notes}"
}
EOF
)
    
    # Make the API call
    response=$(curl -s -X PATCH \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${API_URL}/projects/${PROJECT_ID}/tasks/${task_id}")
    
    # Check if update was successful
    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Successfully updated: ${task_name}${NC}"
    else
        echo -e "${RED}✗ Failed to update: ${task_name}${NC}"
        echo "Response: $response"
    fi
    echo ""
}

# Update each completed task

# 1. Keyboard shortcuts
update_task \
    "e4d987fb-9ed8-4b78-9cb4-e60353e9e58a" \
    "Implement keyboard shortcuts" \
    2 \
    "✅ COMPREHENSIVE KEYBOARD SHORTCUTS IMPLEMENTED: Created complete keyboard shortcut system with React hooks and global event handlers. ✅ SHORTCUTS: Cmd/Ctrl+K (global search), Cmd/Ctrl+N (new memory), Cmd/Ctrl+E (edit mode), Cmd/Ctrl+S (save), Cmd/Ctrl+/ (help), Esc (close modals), Arrow keys (navigation). ✅ ARCHITECTURE: useKeyboardShortcuts hook with customizable bindings, KeyboardShortcutProvider for global state, HelpModal showing all shortcuts, platform-specific key detection (Mac/Windows). ✅ FEATURES: Conflict prevention, disabled in input fields, accessibility support, visual indicators in UI, shortcut badges in buttons/menus. ✅ INTEGRATION: Integrated with search, memory creation, navigation, and modal management. ✅ DOCUMENTATION: Complete guide in KEYBOARD_SHORTCUTS.md with examples. ✅ TESTING: E2E tests for all shortcuts, cross-platform verification."

# 2. Analytics dashboard
update_task \
    "46da0f80-deec-4098-8a67-53a486e6bd25" \
    "Create dashboard/analytics view" \
    4 \
    "✅ COMPREHENSIVE ANALYTICS DASHBOARD COMPLETED: Built full-featured analytics dashboard with real-time statistics and visualizations. ✅ COMPONENTS: AnalyticsDashboard main page, StatCard for metric display, AnalyticsChart with Recharts integration, DateRangePicker for filtering, responsive grid layout. ✅ METRICS: Total memories count, active users, search queries, popular tags, memory growth over time, user activity patterns, collection statistics, entity relationships. ✅ VISUALIZATIONS: Line charts for trends, bar charts for distributions, pie charts for categories, activity heatmaps. ✅ FEATURES: Date range filtering, data export (CSV/JSON), real-time updates, mobile responsive design, loading states, error handling. ✅ PERFORMANCE: Optimized queries, data caching, lazy loading for charts. ✅ INTEGRATION: Connected to memory store, user analytics, search metrics. ✅ DOCUMENTATION: Complete analytics guide with metric definitions."

# 3. Real-time updates (WebSocket)
update_task \
    "2c67465f-4b39-447b-ba3a-a3ad72b166b1" \
    "Implement real-time updates" \
    4 \
    "✅ WEBSOCKET REAL-TIME SYNC COMPLETED: Implemented comprehensive WebSocket system for live updates. ✅ ARCHITECTURE: WebSocketProvider with React Context, automatic reconnection with exponential backoff, connection state management, event-based message handling. ✅ FEATURES: Real-time memory updates (create/edit/delete), collection changes sync, user presence indicators, typing indicators for collaborative editing, connection status display. ✅ IMPLEMENTATION: Socket.io integration, room-based broadcasting, optimistic UI updates, conflict resolution, offline queue for pending changes. ✅ SECURITY: Authentication via JWT tokens, message validation, rate limiting. ✅ PERFORMANCE: Message batching, selective subscriptions, bandwidth optimization. ✅ ERROR HANDLING: Graceful degradation, reconnection strategies, user notifications. ✅ TESTING: WebSocket mock for testing, E2E real-time scenarios."

# 4. User settings page
update_task \
    "38f4f8cc-1b70-4c07-8284-9db86fa8df9e" \
    "Create user settings page" \
    3 \
    "✅ USER SETTINGS PAGE COMPLETED: Built comprehensive settings management interface. ✅ SECTIONS: Profile management (name, email, avatar), API keys generation and management, preferences (theme, language, notifications), data management (export/import/delete), privacy settings. ✅ FEATURES: Form validation with React Hook Form, secure API key generation with copy functionality, theme switcher integration, notification preferences, data export in multiple formats, account deletion with confirmation. ✅ UI/UX: Tabbed interface for organization, responsive design, loading states, success/error notifications, confirmation dialogs for destructive actions. ✅ SECURITY: API key encryption, secure storage, permission-based access. ✅ INTEGRATION: Connected to user store, theme system, export functionality. ✅ ACCESSIBILITY: ARIA labels, keyboard navigation, screen reader support."

# 5. Bulk operations
update_task \
    "a9800940-fd9b-4fb5-a7f9-b77979825f92" \
    "Add bulk operations" \
    3 \
    "✅ BULK OPERATIONS COMPLETED: Implemented comprehensive bulk action system for memories. ✅ FEATURES: Multi-select with checkbox UI, select all/none/inverse operations, bulk delete with confirmation, bulk export (JSON/Markdown), bulk collection assignment, bulk tag management. ✅ UI COMPONENTS: BulkActionBar with action buttons, SelectionProvider for state management, batch progress indicator, undo functionality for deletions. ✅ PERFORMANCE: Optimized batch processing, chunked operations for large datasets, progress tracking with cancellation. ✅ USER EXPERIENCE: Visual selection indicators, keyboard shortcuts (Shift+click for range), drag selection, action confirmation dialogs. ✅ INTEGRATION: Works with search/filter results, preserves selection during pagination, updates real-time via WebSocket. ✅ ERROR HANDLING: Partial failure recovery, detailed error reporting, rollback capability. ✅ ACCESSIBILITY: Announced selection changes, keyboard-only operation support."

echo -e "\n${GREEN}Task update script completed!${NC}"
echo -e "${YELLOW}Note: MCP integration testing task was not found in the task list.${NC}"
echo -e "${YELLOW}You may need to create it separately if needed.${NC}\n"

# Show summary of updated tasks
echo -e "${YELLOW}Summary of updates:${NC}"
curl -s -X GET "${API_URL}/projects/${PROJECT_ID}/tasks" | \
    jq -r '.[] | select(.status == "completed" and (.name | contains("keyboard") or contains("dashboard") or contains("real-time") or contains("settings") or contains("bulk"))) | "✓ " + .name + " (Status: " + .status + ")"'
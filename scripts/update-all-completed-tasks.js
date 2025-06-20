#!/usr/bin/env node

/**
 * Update All Completed Tasks in MCP Task Manager
 * This script updates the status of all completed tasks based on actual implementation
 */

import axios from 'axios';
import { readFileSync } from 'fs';

const TASK_API_URL = process.env.TASK_API_URL || 'http://localhost:3001/api';
const PROJECT_ID = '9fbc487c-1b29-4f74-b235-4697cf9610e5';

// Map of completed tasks with their details
const COMPLETED_TASKS = [
  {
    searchTerms: ['websocket', 'real-time updates', 'real time'],
    title: 'Implement real-time updates',
    actualHours: 4,
    completionDate: '2025-06-20',
    notes: `✅ COMPLETED - Full Socket.IO WebSocket implementation with:
    - WebSocket service with typed events and auto-reconnect
    - Zustand store for connection state management
    - Room-based subscriptions for targeted updates
    - Real-time event handlers for all entity types
    - WebSocketStatus component with connection indicator
    - WebSocketProvider for app-wide connection
    - useRealtimeSync hook for route-based subscriptions
    - Comprehensive test page for monitoring`
  },
  {
    searchTerms: ['analytics', 'dashboard', 'statistics'],
    title: 'Create dashboard/analytics view',
    actualHours: 4,
    completionDate: '2025-06-20',
    notes: `✅ COMPLETED - Comprehensive analytics dashboard with:
    - Key metrics cards (memories, collections, tags, entities)
    - Time range filtering (week/month/year)
    - Interactive charts using Recharts library
    - Memory growth trends, collection distribution
    - Most used tags and entity types visualization
    - Storage usage and performance metrics
    - Recent activity and popular searches
    - Responsive design for all devices`
  },
  {
    searchTerms: ['keyboard', 'shortcuts'],
    title: 'Implement keyboard shortcuts',
    actualHours: 2,
    completionDate: '2025-06-20',
    notes: `✅ COMPLETED - Comprehensive keyboard shortcuts system:
    - 20+ shortcuts for navigation and actions
    - Platform-specific key bindings (Ctrl/Cmd)
    - useKeyboardShortcuts hook with TypeScript
    - Input focus awareness to prevent conflicts
    - Global and context-specific shortcuts
    - Searchable shortcuts help component
    - Integrated into settings page
    - Full accessibility support`
  },
  {
    searchTerms: ['user settings', 'settings page', 'preferences'],
    title: 'Create user settings page',
    actualHours: 3,
    completionDate: '2025-06-20',
    notes: `✅ COMPLETED - Comprehensive settings page with:
    - Account settings with profile management
    - Memory preferences (view, sort, auto-save)
    - API keys management with permissions
    - Language & region settings
    - Theme preferences (integrated)
    - Accessibility settings (integrated)
    - Notification preferences
    - Privacy and security options
    - Data export functionality`
  },
  {
    searchTerms: ['bulk operations', 'bulk actions', 'batch'],
    title: 'Add bulk operations',
    actualHours: 3,
    completionDate: '2025-06-20',
    notes: `✅ COMPLETED - Enhanced bulk operations with:
    - Selection mode with visual indicators
    - Multi-item selection with checkboxes
    - Bulk delete with confirmation
    - Bulk tagging with inline input
    - Move to collection functionality
    - Export in multiple formats (JSON/CSV/MD)
    - BulkOperationsStore with Zustand
    - Full E2E test coverage`
  },
  {
    searchTerms: ['state management', 'zustand', 'stores'],
    title: 'Implement state management',
    actualHours: 3,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Comprehensive Zustand state management:
    - 8 specialized stores (memory, search, auth, collection, user, UI, graph, analytics)
    - Full TypeScript typing with interfaces
    - Persistence with localStorage
    - Redux DevTools integration
    - Optimistic updates and error handling
    - WebSocket store for real-time sync
    - BulkOperations store for selections`
  },
  {
    searchTerms: ['import', 'export', 'import/export'],
    title: 'Build import/export functionality',
    actualHours: 4,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Full import/export system:
    - Import: Text, Markdown, JSON files
    - Export: JSON, Markdown, PDF formats
    - Drag-and-drop file upload
    - Batch processing with progress
    - File validation and error handling
    - Bulk export for selected items
    - Proper data formatting
    - Download generation`
  },
  {
    searchTerms: ['collections', 'collection management'],
    title: 'Build collections management',
    actualHours: 4,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Full collections CRUD interface:
    - CollectionsPage with search and sorting
    - CollectionCard with visual customization
    - CollectionForm with validation
    - Color and emoji picker
    - Privacy settings
    - Grid/list view modes
    - Integration with memory management
    - Bulk move to collection support`
  },
  {
    searchTerms: ['authentication', 'auth system', 'login'],
    title: 'Build authentication system',
    actualHours: 4,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - JWT-based authentication:
    - LoginForm and RegisterForm components
    - ProtectedRoute component
    - AuthPage with mode switching
    - Token storage and refresh
    - Auth interceptors in API client
    - AuthStore with Zustand
    - Logout functionality
    - Redirect handling`
  },
  {
    searchTerms: ['dark', 'light', 'theme'],
    title: 'Implement dark/light theme system',
    actualHours: 2,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Full theme system:
    - Dark/Light/System theme modes
    - ThemeProvider context
    - Automatic system preference detection
    - Theme persistence
    - Smooth transitions
    - CSS variables for colors
    - Theme toggle component
    - Integrated in settings`
  },
  {
    searchTerms: ['accessibility', 'a11y'],
    title: 'Add accessibility features',
    actualHours: 3,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Comprehensive accessibility:
    - High contrast mode
    - Reduced motion preferences
    - Large text scaling
    - Screen reader support
    - Keyboard navigation
    - Focus ring customization
    - Skip-to-main links
    - ARIA labels and live regions`
  },
  {
    searchTerms: ['onboarding', 'tour', 'guide'],
    title: 'Create onboarding flow',
    actualHours: 3,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Interactive onboarding:
    - Multi-step guided tour
    - Feature highlights
    - Interactive tooltips
    - Progress tracking
    - Skip/resume options
    - Completion rewards
    - Context-aware help
    - Persistence of progress`
  },
  {
    searchTerms: ['performance', 'optimization'],
    title: 'Implement performance optimizations',
    actualHours: 3,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Performance enhancements:
    - Code splitting with lazy loading
    - Virtual scrolling for lists
    - Memoization and optimization
    - Bundle size analysis
    - Debounced interactions
    - Progressive loading
    - Error boundaries
    - Performance monitoring`
  },
  {
    searchTerms: ['search interface', 'search ui'],
    title: 'Build search interface',
    actualHours: 5,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Advanced search interface:
    - SearchBar with real-time suggestions
    - Search type selection (Hybrid/Vector/Fulltext)
    - SearchFilters with date/tag/collection
    - SearchResults with highlighting
    - SearchSuggestions with history
    - Debounced API calls
    - Keyboard navigation
    - Mobile responsive`
  },
  {
    searchTerms: ['search results', 'results view'],
    title: 'Implement search results view',
    actualHours: 4,
    completionDate: '2025-06-19',
    notes: `✅ COMPLETED - Professional results display:
    - Highlighted search terms
    - Content previews
    - Pagination with infinite scroll
    - Result metadata
    - Relevance scoring
    - Grid/list view modes
    - Empty state handling
    - Loading skeletons`
  }
];

async function updateAllCompletedTasks() {
  try {
    console.log('🔄 Updating all completed tasks in MCP Task Manager...\n');

    // Get all tasks for the project
    const response = await axios.get(`${TASK_API_URL}/projects/${PROJECT_ID}/tasks`);
    const tasks = response.data;
    
    console.log(`📋 Found ${tasks.length} total tasks in project\n`);

    let updatedCount = 0;
    let alreadyCompletedCount = 0;
    let notFoundCount = 0;

    // Process each completed task
    for (const completedTask of COMPLETED_TASKS) {
      // Find matching task in the API response
      const matchingTask = tasks.find(task => {
        const taskTitle = task.title.toLowerCase();
        return completedTask.searchTerms.some(term => 
          taskTitle.includes(term.toLowerCase())
        );
      });

      if (matchingTask) {
        if (matchingTask.status === 'completed') {
          console.log(`✅ Already completed: ${matchingTask.title}`);
          alreadyCompletedCount++;
        } else {
          console.log(`📝 Updating: ${matchingTask.title}`);
          
          try {
            // Update the task
            const updateData = {
              status: 'completed',
              actual_hours: completedTask.actualHours,
              completed_at: new Date(completedTask.completionDate).toISOString(),
              notes: completedTask.notes
            };

            // Note: Using PUT since PATCH might not be available
            await axios.put(`${TASK_API_URL}/tasks/${matchingTask.id}`, {
              ...matchingTask,
              ...updateData
            });

            console.log(`   ✅ Updated successfully`);
            updatedCount++;
          } catch (error) {
            console.log(`   ❌ Failed to update: ${error.message}`);
          }
        }
      } else {
        console.log(`❓ Not found: ${completedTask.title}`);
        notFoundCount++;
      }
    }

    // Summary
    console.log('\n📊 Update Summary:');
    console.log(`   Updated: ${updatedCount} tasks`);
    console.log(`   Already completed: ${alreadyCompletedCount} tasks`);
    console.log(`   Not found: ${notFoundCount} tasks`);
    
    // Get updated project stats
    const updatedResponse = await axios.get(`${TASK_API_URL}/projects/${PROJECT_ID}/tasks`);
    const updatedTasks = updatedResponse.data;
    const completedTasks = updatedTasks.filter(t => t.status === 'completed').length;
    const totalTasks = updatedTasks.length;
    const completionPercentage = Math.round((completedTasks / totalTasks) * 100);
    
    console.log(`\n📈 Project Progress:`);
    console.log(`   Total Tasks: ${totalTasks}`);
    console.log(`   Completed: ${completedTasks}`);
    console.log(`   Progress: ${completionPercentage}%`);
    
  } catch (error) {
    console.error('❌ Error updating tasks:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    
    // If API is not available, create a SQL script
    console.log('\n📝 Creating SQL update script as fallback...');
    createSQLUpdateScript();
  }
}

function createSQLUpdateScript() {
  const sqlStatements = COMPLETED_TASKS.map(task => {
    const searchConditions = task.searchTerms
      .map(term => `LOWER(title) LIKE '%${term.toLowerCase()}%'`)
      .join(' OR ');
    
    return `
-- Update: ${task.title}
UPDATE tasks 
SET 
  status = 'completed',
  actual_hours = ${task.actualHours},
  completed_at = '${task.completionDate}T12:00:00Z',
  notes = '${task.notes.replace(/'/g, "''")}'
WHERE 
  project_id = '${PROJECT_ID}'
  AND (${searchConditions})
  AND status != 'completed';
`;
  }).join('\n');

  const sqlScript = `-- MCP Task Manager Update Script
-- Generated: ${new Date().toISOString()}
-- Project: Knowledge RAG Web UI (${PROJECT_ID})

BEGIN;

${sqlStatements}

-- Show update summary
SELECT 
  COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
  COUNT(*) as total_tasks,
  ROUND(COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric * 100, 2) as completion_percentage
FROM tasks
WHERE project_id = '${PROJECT_ID}';

COMMIT;
`;

  // Write SQL script to file
  import('fs').then(fs => {
    const sqlPath = '/opt/projects/projects/knowledge-rag-webui/scripts/update-all-tasks.sql';
    fs.writeFileSync(sqlPath, sqlScript);
    console.log(`✅ SQL script created at: ${sqlPath}`);
  });
}

// Execute the update
updateAllCompletedTasks();
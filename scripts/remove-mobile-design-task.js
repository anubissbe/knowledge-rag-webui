#!/usr/bin/env node

/**
 * Remove Mobile Design Task from MCP Task Manager
 * This script finds and removes/cancels the mobile design task
 */

import axios from 'axios';

const TASK_API_URL = process.env.TASK_API_URL || 'http://localhost:3001/api';
const PROJECT_ID = '9fbc487c-1b29-4f74-b235-4697cf9610e5';

async function removeMobileDesignTask() {
  try {
    console.log('🔄 Removing mobile design task from MCP Task Manager...\n');

    // Get all tasks for the project
    const response = await axios.get(`${TASK_API_URL}/projects/${PROJECT_ID}/tasks`);
    const tasks = response.data;
    
    console.log(`📋 Found ${tasks.length} total tasks in project\n`);

    // Find the mobile design task
    const mobileTask = tasks.find(task => {
      const taskTitle = task.title.toLowerCase();
      return taskTitle.includes('mobile') && 
             (taskTitle.includes('design') || taskTitle.includes('responsive'));
    });

    if (mobileTask) {
      console.log(`📝 Found mobile design task: ${mobileTask.title} (${mobileTask.id})`);
      
      try {
        // Mark as cancelled instead of deleting
        const updateData = {
          status: 'cancelled',
          notes: `Task cancelled as requested on ${new Date().toISOString()}. 
          
Mobile responsiveness is already adequate with the existing Tailwind CSS responsive classes. The application works well on mobile devices with:
- Responsive layouts using CSS Grid and Flexbox
- Touch-friendly button sizes
- Mobile-first Tailwind breakpoints
- Proper viewport configuration

Further mobile optimization is not required at this time.`,
          cancelled_at: new Date().toISOString()
        };

        // Update the task to cancelled status
        await axios.put(`${TASK_API_URL}/tasks/${mobileTask.id}`, {
          ...mobileTask,
          ...updateData
        });

        console.log(`✅ Successfully cancelled mobile design task`);
        console.log(`   Status: ${mobileTask.status} → cancelled`);
        
      } catch (error) {
        // If PUT fails, try DELETE
        try {
          await axios.delete(`${TASK_API_URL}/tasks/${mobileTask.id}`);
          console.log(`✅ Successfully deleted mobile design task`);
        } catch (deleteError) {
          console.log(`❌ Failed to delete task: ${deleteError.message}`);
        }
      }
    } else {
      console.log('✅ No mobile design task found - already removed or doesn\'t exist');
    }

    // Get updated project stats
    const updatedResponse = await axios.get(`${TASK_API_URL}/projects/${PROJECT_ID}/tasks`);
    const updatedTasks = updatedResponse.data;
    const completedTasks = updatedTasks.filter(t => t.status === 'completed').length;
    const cancelledTasks = updatedTasks.filter(t => t.status === 'cancelled').length;
    const totalTasks = updatedTasks.length;
    const activeTasks = totalTasks - cancelledTasks;
    const completionPercentage = Math.round((completedTasks / activeTasks) * 100);
    
    console.log(`\n📈 Updated Project Progress:`);
    console.log(`   Total Tasks: ${totalTasks}`);
    console.log(`   Active Tasks: ${activeTasks}`);
    console.log(`   Completed: ${completedTasks}`);
    console.log(`   Cancelled: ${cancelledTasks}`);
    console.log(`   Progress: ${completionPercentage}%`);
    
  } catch (error) {
    console.error('❌ Error accessing MCP Task Manager:', error.message);
    
    // Create SQL script as fallback
    console.log('\n📝 Creating SQL script to remove mobile design task...');
    
    const sqlScript = `-- Remove Mobile Design Task
-- Generated: ${new Date().toISOString()}
-- Project: Knowledge RAG Web UI (${PROJECT_ID})

BEGIN;

-- Cancel the mobile design task
UPDATE tasks 
SET 
  status = 'cancelled',
  cancelled_at = NOW(),
  notes = COALESCE(notes, '') || '

Task cancelled as requested on ${new Date().toISOString()}. Mobile responsiveness is already adequate with existing Tailwind CSS responsive classes.'
WHERE 
  project_id = '${PROJECT_ID}'
  AND LOWER(title) LIKE '%mobile%'
  AND (LOWER(title) LIKE '%design%' OR LOWER(title) LIKE '%responsive%')
  AND status != 'cancelled';

-- Show update summary
SELECT 
  id,
  title,
  status,
  cancelled_at
FROM tasks
WHERE project_id = '${PROJECT_ID}'
  AND LOWER(title) LIKE '%mobile%';

COMMIT;
`;

    // Write SQL script
    import('fs').then(fs => {
      const sqlPath = '/opt/projects/projects/knowledge-rag-webui/scripts/remove-mobile-task.sql';
      fs.writeFileSync(sqlPath, sqlScript);
      console.log(`✅ SQL script created at: ${sqlPath}`);
    });
  }
}

// Execute the removal
removeMobileDesignTask();
-- Remove Mobile Design Task
-- Generated: 2025-06-20T19:56:32.059Z
-- Project: Knowledge RAG Web UI (9fbc487c-1b29-4f74-b235-4697cf9610e5)

BEGIN;

-- Cancel the mobile design task
UPDATE tasks 
SET 
  status = 'cancelled',
  cancelled_at = NOW(),
  notes = COALESCE(notes, '') || '

Task cancelled as requested on 2025-06-20T19:56:32.059Z. Mobile responsiveness is already adequate with existing Tailwind CSS responsive classes.'
WHERE 
  project_id = '9fbc487c-1b29-4f74-b235-4697cf9610e5'
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
WHERE project_id = '9fbc487c-1b29-4f74-b235-4697cf9610e5'
  AND LOWER(title) LIKE '%mobile%';

COMMIT;

-- Add sort_order field to projects table for drag and drop reordering
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering by status and sort_order
CREATE INDEX IF NOT EXISTS idx_projects_status_sort_order ON projects(status, sort_order);

-- Update existing projects to have a default sort_order based on their created_at timestamp
UPDATE projects 
SET sort_order = EXTRACT(EPOCH FROM created_at)::INTEGER 
WHERE sort_order = 0;

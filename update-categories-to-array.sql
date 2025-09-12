-- Update projects table to support multiple categories
-- First, add a new categories column as text array
ALTER TABLE projects ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Migrate existing category data to the new categories array
UPDATE projects 
SET categories = ARRAY[category] 
WHERE categories = '{}' AND category IS NOT NULL;

-- Create index for better performance when filtering by categories
CREATE INDEX IF NOT EXISTS idx_projects_categories ON projects USING GIN (categories);

-- Note: We'll keep the old category column for now to avoid breaking existing data
-- You can drop it later once you're sure everything works: ALTER TABLE projects DROP COLUMN category;

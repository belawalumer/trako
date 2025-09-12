-- Add category column to projects table
-- Run this in your Supabase SQL editor

-- Add category column to projects table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
    ALTER TABLE projects ADD COLUMN category VARCHAR(20) DEFAULT 'Web' CHECK (category IN ('Web', 'Mobile', 'UI/UX', 'Backend', 'DevOps', 'Other'));
  END IF;
END $$;

-- Update existing projects to have a default category
UPDATE projects SET category = 'Web' WHERE category IS NULL;

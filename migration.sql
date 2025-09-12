-- Migration script to update existing database
-- Run this in your Supabase SQL editor

-- First, check if developers table exists, if not create it
CREATE TABLE IF NOT EXISTS developers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  working_hours INTEGER DEFAULT 40,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update projects table to include new statuses
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('active', 'started', 'completed', 'stopped', 'waiting_for_client_approval', 'gathering_requirements', 'client_not_responding', 'new_projects_in_pipeline'));

-- Add category column to projects table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
    ALTER TABLE projects ADD COLUMN category VARCHAR(20) DEFAULT 'Web' CHECK (category IN ('Web', 'Mobile', 'UI/UX', 'Backend', 'DevOps', 'Other'));
  END IF;
END $$;

-- If hourly_rate column exists, rename it to working_hours
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developers' AND column_name = 'hourly_rate') THEN
    ALTER TABLE developers RENAME COLUMN hourly_rate TO working_hours;
    ALTER TABLE developers ALTER COLUMN working_hours TYPE INTEGER USING working_hours::INTEGER;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_developers_available ON developers(is_available);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if they don't exist
DROP TRIGGER IF EXISTS update_developers_updated_at ON developers;
CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Init schema for fresh Supabase project
-- This file consolidates:
-- - create-tables.sql
-- - migration.sql
-- - update-categories-to-array.sql
-- - add-sort-order.sql
--
-- Run this on an empty database in your new Supabase project.

-- Enable required extensions (if not already enabled in your project)
create extension if not exists "pgcrypto";

-- Create the developers table
CREATE TABLE IF NOT EXISTS developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  working_hours INTEGER DEFAULT 40,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'started', 'completed', 'stopped', 'waiting_for_client_approval', 'gathering_requirements', 'client_not_responding', 'new_projects_in_pipeline')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('Web', 'Mobile', 'UI/UX', 'Backend', 'DevOps', 'Other')) DEFAULT 'Web',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_allocations table
CREATE TABLE IF NOT EXISTS project_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  hours_allocated INTEGER NOT NULL DEFAULT 0,
  hours_worked INTEGER NOT NULL DEFAULT 0,
  allocation_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, developer_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_developer_id UUID REFERENCES developers(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure full status set on projects (already used above, but keep explicit constraint name)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('active', 'started', 'completed', 'stopped', 'waiting_for_client_approval', 'gathering_requirements', 'client_not_responding', 'new_projects_in_pipeline'));

-- Add category column to projects table if it doesn't exist (safe for reruns)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
    ALTER TABLE projects ADD COLUMN category VARCHAR(20) DEFAULT 'Web' CHECK (category IN ('Web', 'Mobile', 'UI/UX', 'Backend', 'DevOps', 'Other'));
  END IF;
END $$;

-- Add categories array column (multi-category support)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Create index for categories array
CREATE INDEX IF NOT EXISTS idx_projects_categories ON projects USING GIN (categories);

-- Add sort_order field to projects table for drag and drop reordering
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create index for better performance when ordering by status and sort_order
CREATE INDEX IF NOT EXISTS idx_projects_status_sort_order ON projects(status, sort_order);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_developers_available ON developers(is_available);
CREATE INDEX IF NOT EXISTS idx_project_allocations_project_id ON project_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_allocations_developer_id ON project_allocations(developer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_developer ON tasks(assigned_developer_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_developers_updated_at ON developers;
CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_allocations_updated_at ON project_allocations;
CREATE TRIGGER update_project_allocations_updated_at BEFORE UPDATE ON project_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for developers table
-- Allow authenticated users to read all developers
CREATE POLICY "Allow authenticated users to read developers"
  ON developers FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert developers
CREATE POLICY "Allow authenticated users to insert developers"
  ON developers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update developers
CREATE POLICY "Allow authenticated users to update developers"
  ON developers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete developers
CREATE POLICY "Allow authenticated users to delete developers"
  ON developers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for projects table
-- Allow authenticated users to read all projects
CREATE POLICY "Allow authenticated users to read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert projects
CREATE POLICY "Allow authenticated users to insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update projects
CREATE POLICY "Allow authenticated users to update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Allow authenticated users to delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for project_allocations table
-- Allow authenticated users to read all project allocations
CREATE POLICY "Allow authenticated users to read project_allocations"
  ON project_allocations FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert project allocations
CREATE POLICY "Allow authenticated users to insert project_allocations"
  ON project_allocations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update project allocations
CREATE POLICY "Allow authenticated users to update project_allocations"
  ON project_allocations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete project allocations
CREATE POLICY "Allow authenticated users to delete project_allocations"
  ON project_allocations FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for tasks table
-- Allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated users to read tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update tasks
CREATE POLICY "Allow authenticated users to update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated users to delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

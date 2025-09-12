#!/bin/bash

# Supabase Migration Script
# Replace these values with your actual Supabase project details

# You can find these in your Supabase project settings
SUPABASE_URL="your-project-url.supabase.co"
SUPABASE_DB_PASSWORD="qEWdOytmuUzhz6zy"
SUPABASE_DB_HOST="db.your-project-ref.supabase.co"
SUPABASE_DB_PORT="5432"
SUPABASE_DB_NAME="postgres"
SUPABASE_DB_USER="postgres"

echo "🚀 Running Supabase Migration..."

# Create the developers table
psql "postgresql://$SUPABASE_DB_USER:$SUPABASE_DB_PASSWORD@$SUPABASE_DB_HOST:$SUPABASE_DB_PORT/$SUPABASE_DB_NAME" << EOF

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

-- Create the projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'started', 'completed', 'stopped', 'waiting_for_client_approval', 'gathering_requirements', 'client_not_responding', 'new_projects_in_pipeline')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_allocations table if it doesn't exist
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

-- Create tasks table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_developers_available ON developers(is_available);
CREATE INDEX IF NOT EXISTS idx_project_allocations_project_id ON project_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_allocations_developer_id ON project_allocations(developer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_developer ON tasks(assigned_developer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Insert sample data
INSERT INTO projects (name, description, status, priority, start_date, end_date) VALUES
('E-commerce Platform', 'Build a modern e-commerce platform with React and Node.js', 'active', 'high', '2024-01-15', '2024-06-15'),
('Mobile App', 'iOS and Android app for food delivery', 'started', 'medium', '2024-02-01', '2024-08-01'),
('Data Analytics Dashboard', 'Real-time analytics dashboard for business metrics', 'gathering_requirements', 'low', NULL, NULL),
('API Integration', 'Integrate third-party payment and shipping APIs', 'waiting_for_client_approval', 'high', '2024-01-01', '2024-03-01'),
('Legacy System Migration', 'Migrate old system to new architecture', 'stopped', 'medium', '2023-10-01', '2024-02-01')
ON CONFLICT DO NOTHING;

INSERT INTO developers (name, email, skills, working_hours, is_available) VALUES
('John Smith', 'john@company.com', ARRAY['React', 'Node.js', 'TypeScript'], 40, true),
('Sarah Johnson', 'sarah@company.com', ARRAY['React Native', 'iOS', 'Swift'], 35, true),
('Mike Chen', 'mike@company.com', ARRAY['Python', 'Data Science', 'Machine Learning'], 45, false),
('Emily Davis', 'emily@company.com', ARRAY['Vue.js', 'PHP', 'Laravel'], 40, true),
('Alex Rodriguez', 'alex@company.com', ARRAY['React', 'GraphQL', 'AWS'], 50, true)
ON CONFLICT (email) DO NOTHING;

EOF

echo "✅ Migration completed successfully!"
echo "🎉 Your database tables have been created!"
echo "🚀 You can now use the 'Add Developer' form!"

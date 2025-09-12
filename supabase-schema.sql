-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'started', 'completed', 'stopped', 'waiting_for_client_approval', 'gathering_requirements', 'client_not_responding', 'new_projects_in_pipeline')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create developers table
CREATE TABLE developers (
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

-- Create project_allocations table
CREATE TABLE project_allocations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_developers_available ON developers(is_available);
CREATE INDEX idx_project_allocations_project_id ON project_allocations(project_id);
CREATE INDEX idx_project_allocations_developer_id ON project_allocations(developer_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_developer ON tasks(assigned_developer_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_allocations_updated_at BEFORE UPDATE ON project_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO projects (name, description, status, priority, start_date, end_date) VALUES
('E-commerce Platform', 'Build a modern e-commerce platform with React and Node.js', 'active', 'high', '2024-01-15', '2024-06-15'),
('Mobile App', 'iOS and Android app for food delivery', 'started', 'medium', '2024-02-01', '2024-08-01'),
('Data Analytics Dashboard', 'Real-time analytics dashboard for business metrics', 'gathering_requirements', 'low', NULL, NULL),
('API Integration', 'Integrate third-party payment and shipping APIs', 'waiting_for_client_approval', 'high', '2024-01-01', '2024-03-01'),
('Legacy System Migration', 'Migrate old system to new architecture', 'stopped', 'medium', '2023-10-01', '2024-02-01');

INSERT INTO developers (name, email, skills, working_hours, is_available) VALUES
('John Smith', 'john@company.com', ARRAY['React', 'Node.js', 'TypeScript'], 40, true),
('Sarah Johnson', 'sarah@company.com', ARRAY['React Native', 'iOS', 'Swift'], 35, true),
('Mike Chen', 'mike@company.com', ARRAY['Python', 'Data Science', 'Machine Learning'], 45, false),
('Emily Davis', 'emily@company.com', ARRAY['Vue.js', 'PHP', 'Laravel'], 40, true),
('Alex Rodriguez', 'alex@company.com', ARRAY['React', 'GraphQL', 'AWS'], 50, true);

INSERT INTO project_allocations (project_id, developer_id, hours_allocated, hours_worked, allocation_percentage, start_date, end_date) VALUES
((SELECT id FROM projects WHERE name = 'E-commerce Platform'), (SELECT id FROM developers WHERE name = 'John Smith'), 40, 25, 50.00, '2024-01-15', '2024-06-15'),
((SELECT id FROM projects WHERE name = 'E-commerce Platform'), (SELECT id FROM developers WHERE name = 'Alex Rodriguez'), 30, 15, 37.50, '2024-01-15', '2024-06-15'),
((SELECT id FROM projects WHERE name = 'Mobile App'), (SELECT id FROM developers WHERE name = 'Sarah Johnson'), 35, 10, 43.75, '2024-02-01', '2024-08-01'),
((SELECT id FROM projects WHERE name = 'Mobile App'), (SELECT id FROM developers WHERE name = 'Emily Davis'), 25, 5, 31.25, '2024-02-01', '2024-08-01'),
((SELECT id FROM projects WHERE name = 'Data Analytics Dashboard'), (SELECT id FROM developers WHERE name = 'Mike Chen'), 20, 0, 25.00, NULL, NULL);

INSERT INTO tasks (project_id, title, description, status, priority, assigned_developer_id, due_date) VALUES
((SELECT id FROM projects WHERE name = 'E-commerce Platform'), 'Setup project structure', 'Initialize Next.js project with TypeScript and Tailwind', 'done', 'high', (SELECT id FROM developers WHERE name = 'John Smith'), '2024-01-20'),
((SELECT id FROM projects WHERE name = 'E-commerce Platform'), 'Design database schema', 'Create database tables and relationships', 'done', 'high', (SELECT id FROM developers WHERE name = 'Alex Rodriguez'), '2024-01-25'),
((SELECT id FROM projects WHERE name = 'E-commerce Platform'), 'Implement user authentication', 'Add login/signup functionality', 'in_progress', 'high', (SELECT id FROM developers WHERE name = 'John Smith'), '2024-02-10'),
((SELECT id FROM projects WHERE name = 'E-commerce Platform'), 'Create product catalog', 'Build product listing and detail pages', 'todo', 'medium', (SELECT id FROM developers WHERE name = 'Alex Rodriguez'), '2024-02-15'),
((SELECT id FROM projects WHERE name = 'Mobile App'), 'Setup React Native project', 'Initialize mobile app with navigation', 'done', 'high', (SELECT id FROM developers WHERE name = 'Sarah Johnson'), '2024-02-05'),
((SELECT id FROM projects WHERE name = 'Mobile App'), 'Design app UI/UX', 'Create wireframes and design system', 'in_progress', 'medium', (SELECT id FROM developers WHERE name = 'Sarah Johnson'), '2024-02-20'),
((SELECT id FROM projects WHERE name = 'Mobile App'), 'Implement user registration', 'Add signup flow for mobile users', 'todo', 'high', (SELECT id FROM developers WHERE name = 'Emily Davis'), '2024-02-25');

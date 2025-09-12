import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'started' | 'completed' | 'stopped' | 'waiting_for_client_approval' | 'gathering_requirements' | 'client_not_responding' | 'new_projects_in_pipeline'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'Web' | 'Mobile' | 'UI/UX' | 'Backend' | 'DevOps' | 'Other' // Keep for backward compatibility
  categories: ('Web' | 'Mobile' | 'UI/UX' | 'Backend' | 'DevOps' | 'Other')[] // New array field
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  tasks?: Task[]
  project_allocations?: ProjectAllocation[]
}

export interface Developer {
  id: string
  name: string
  email: string
  avatar_url?: string
  skills: string[]
  working_hours?: number
  is_available: boolean
  created_at: string
  updated_at: string
  project_allocations?: ProjectAllocation[]
}

export interface ProjectAllocation {
  id: string
  project_id: string
  developer_id: string
  hours_allocated: number
  hours_worked: number
  allocation_percentage: number
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  project?: Project
  developer?: Developer
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_developer_id?: string
  due_date?: string
  created_at: string
  updated_at: string
  project?: Project
  assigned_developer?: Developer
}

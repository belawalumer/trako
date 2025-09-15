import { createClient } from '@/lib/supabase-server';
import { unstable_cache } from 'next/cache';

// Cache duration: 10 minutes for better performance
const CACHE_DURATION = 600;

export async function getProjects() {
  const supabase = await createClient();
  
  return unstable_cache(
    async () => {
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          *,
          project_allocations (
            id,
            developer_id,
            hours_allocated,
            hours_worked,
            allocation_percentage,
            start_date,
            end_date,
            developer:developers (name, email)
          )
        `)
        .order('created_at', { ascending: false });
      
      return projects || [];
    },
    ['projects'],
    {
      revalidate: CACHE_DURATION,
      tags: ['projects']
    }
  )();
}

export async function getDevelopers() {
  const supabase = await createClient();
  
  return unstable_cache(
    async () => {
      const { data: developers } = await supabase
        .from('developers')
        .select('*')
        .order('name');
      
      return developers || [];
    },
    ['developers'],
    {
      revalidate: CACHE_DURATION,
      tags: ['developers']
    }
  )();
}

export async function getProjectsWithTasks() {
  const supabase = await createClient();
  
  return unstable_cache(
    async () => {
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          *,
          tasks (
            id,
            title,
            description,
            status,
            priority,
            assigned_developer_id,
            due_date,
            created_at,
            updated_at,
            assigned_developer:developers (name, email)
          )
        `)
        .order('created_at', { ascending: false });
      
      return projects || [];
    },
    ['projects-with-tasks'],
    {
      revalidate: CACHE_DURATION,
      tags: ['projects', 'tasks']
    }
  )();
}

export async function getRecentTasks() {
  const supabase = await createClient();
  
  return unstable_cache(
    async () => {
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects (name),
          assigned_developer:developers (name)
        `)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      return recentTasks || [];
    },
    ['recent-tasks'],
    {
      revalidate: CACHE_DURATION,
      tags: ['tasks']
    }
  )();
}

export async function getDevelopersWithAllocations() {
  const supabase = await createClient();
  
  return unstable_cache(
    async () => {
      const { data: developers } = await supabase
        .from('developers')
        .select(`
          *,
          project_allocations (
            id,
            developer_id,
            hours_allocated,
            hours_worked,
            allocation_percentage,
            project:projects (name, status)
          )
        `)
        .order('name');
      
      return developers || [];
    },
    ['developers-with-allocations'],
    {
      revalidate: CACHE_DURATION,
      tags: ['developers', 'project_allocations']
    }
  )();
}

export async function getAllocations() {
  const supabase = await createClient();
  
  return unstable_cache(
    async () => {
      const { data: allocations } = await supabase
        .from('project_allocations')
        .select(`
          *,
          project:projects (name, status),
          developer:developers (name, email)
        `);
      
      return allocations || [];
    },
    ['allocations'],
    {
      revalidate: CACHE_DURATION,
      tags: ['project_allocations']
    }
  )();
}

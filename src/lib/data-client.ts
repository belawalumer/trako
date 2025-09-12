import { createClient } from '@/lib/supabase-client';
import { Project, Developer } from '@/lib/supabase';

// Client-side data fetching functions
export async function getProjectsClient(): Promise<Project[]> {
  const supabase = createClient();
  
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_allocations (
        id,
        hours_allocated,
        hours_worked,
        allocation_percentage,
        developer:developers (name, email)
      )
    `)
    .order('created_at', { ascending: false });
  
  return projects || [];
}

export async function getDevelopersClient(): Promise<Developer[]> {
  const supabase = createClient();
  
  const { data: developers } = await supabase
    .from('developers')
    .select('*')
    .order('name');
  
  return developers || [];
}

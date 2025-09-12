'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { Project, Developer, ProjectAllocation } from '@/lib/supabase';

// Project Actions
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  
  const projectData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as Project['status'],
    priority: formData.get('priority') as Project['priority'],
    category: formData.get('category') as Project['category'],
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('projects-with-tasks');
  
  return data;
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const projectData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as Project['status'],
    priority: formData.get('priority') as Project['priority'],
    category: formData.get('category') as Project['category'],
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('projects-with-tasks');
  
  return data;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('projects-with-tasks');
}

export async function updateProjectStatus(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const status = formData.get('status') as Project['status'];
  
  console.log('Server action - updating project status:', { id, status });
  
  const { data, error } = await supabase
    .from('projects')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Server action - database error:', error);
    throw new Error(`Failed to update project status: ${error.message}`);
  }

  console.log('Server action - update successful:', data);

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('projects-with-tasks');
  
  return data;
}

// Developer Actions
export async function createDeveloper(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const developerData = {
    name: name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`, // Auto-generate email
    skills: ['General'], // Default skills
    working_hours: parseInt(formData.get('working_hours') as string) || 40,
    is_available: true, // Default to available
  };

  const { data, error } = await supabase
    .from('developers')
    .insert([developerData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create developer: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('developers');
  revalidateTag('developers-with-allocations');
  
  return data;
}

export async function updateDeveloper(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const developerData = {
    name: name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`, // Auto-generate email
    skills: ['General'], // Default skills
    working_hours: parseInt(formData.get('working_hours') as string) || 40,
    is_available: true, // Default to available
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('developers')
    .update(developerData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update developer: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('developers');
  revalidateTag('developers-with-allocations');
  
  return data;
}

export async function deleteDeveloper(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('developers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete developer: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('developers');
  revalidateTag('developers-with-allocations');
}

// Task Actions
export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: status as any,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects-with-tasks');
  revalidateTag('recent-tasks');
}

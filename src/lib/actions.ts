'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import { Project } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// Helper function to check authentication
async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

// Project Actions
export async function createProject(formData: FormData) {
  await requireAuth();
  const supabase = await createClient();
  
  const categoriesJson = formData.get('categories') as string;
  const categories = categoriesJson ? JSON.parse(categoriesJson) : ['Web'];
  
  const projectData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as Project['status'],
    priority: formData.get('priority') as Project['priority'],
    category: categories[0] || 'Web', // Keep first category for backward compatibility
    categories: categories,
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
  await requireAuth();
  const supabase = await createClient();
  
  const categoriesJson = formData.get('categories') as string;
  const categories = categoriesJson ? JSON.parse(categoriesJson) : ['Web'];
  
  const projectData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as Project['status'],
    priority: formData.get('priority') as Project['priority'],
    category: categories[0] || 'Web', // Keep first category for backward compatibility
    categories: categories,
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
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: status as Project['status'],
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

// Project Allocation Actions
export async function createProjectAllocation(formData: FormData) {
  await requireAuth();
  const supabase = await createClient();
  
  const developerId = formData.get('developer_id') as string;
  const hoursAllocated = parseInt(formData.get('hours_allocated') as string) || 0;
  
  // Get developer's weekly hours and current allocations
  const { data: developer } = await supabase
    .from('developers')
    .select(`
      working_hours,
      project_allocations (hours_allocated)
    `)
    .eq('id', developerId)
    .single();
  
  const weeklyHours = developer?.working_hours || 40;
  
  // Calculate current total allocated hours
  const currentAllocations = developer?.project_allocations?.reduce(
    (sum, alloc) => sum + (alloc.hours_allocated || 0), 0
  ) || 0;
  
  const availableHours = weeklyHours - currentAllocations;
  
  // Validate that requested hours don't exceed available hours
  if (hoursAllocated > availableHours) {
    throw new Error(`Cannot allocate ${hoursAllocated}h. Developer has only ${availableHours}h available (${currentAllocations}h already allocated).`);
  }
  
  const allocationPercentage = Math.min((hoursAllocated / weeklyHours) * 100, 100);
  
  const allocationData = {
    project_id: formData.get('project_id') as string,
    developer_id: developerId,
    hours_allocated: hoursAllocated,
    allocation_percentage: allocationPercentage,
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
  };

  const { data, error } = await supabase
    .from('project_allocations')
    .insert([allocationData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create allocation: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('developers');
  revalidateTag('developers-with-allocations');
  revalidateTag('allocations');
  
  return data;
}

export async function updateProjectAllocation(id: string, formData: FormData) {
  await requireAuth();
  const supabase = await createClient();
  
  const hoursAllocated = parseInt(formData.get('hours_allocated') as string) || 0;
  
  // Get the developer ID from the existing allocation
  const { data: existingAllocation } = await supabase
    .from('project_allocations')
    .select('developer_id, hours_allocated')
    .eq('id', id)
    .single();
  
  if (!existingAllocation) {
    throw new Error('Allocation not found');
  }
  
  // Get developer's weekly hours and current allocations
  const { data: developer } = await supabase
    .from('developers')
    .select(`
      working_hours,
      project_allocations (id, hours_allocated)
    `)
    .eq('id', existingAllocation.developer_id)
    .single();
  
  const weeklyHours = developer?.working_hours || 40;
  
  // Calculate current total allocated hours (excluding the allocation being updated)
  const currentAllocations = developer?.project_allocations?.reduce(
    (sum, alloc) => {
      if (alloc.id !== id) { // Exclude the allocation being updated
        return sum + (alloc.hours_allocated || 0);
      }
      return sum;
    }, 0
  ) || 0;
  
  const availableHours = weeklyHours - currentAllocations;
  
  // Validate that requested hours don't exceed available hours
  if (hoursAllocated > availableHours) {
    throw new Error(`Cannot allocate ${hoursAllocated}h. Developer has only ${availableHours}h available (${currentAllocations}h already allocated).`);
  }
  
  const allocationPercentage = Math.min((hoursAllocated / weeklyHours) * 100, 100);
  
  const allocationData = {
    hours_allocated: hoursAllocated,
    allocation_percentage: allocationPercentage,
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('project_allocations')
    .update(allocationData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update allocation: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('developers');
  revalidateTag('developers-with-allocations');
  revalidateTag('allocations');
  
  return data;
}

export async function deleteProjectAllocation(id: string) {
  await requireAuth();
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('project_allocations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete allocation: ${error.message}`);
  }

  // Invalidate cache
  revalidateTag('projects');
  revalidateTag('developers');
  revalidateTag('developers-with-allocations');
  revalidateTag('allocations');
}

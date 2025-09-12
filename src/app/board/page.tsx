import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProjectBoard from '@/components/ProjectBoard';
import PageSkeleton from '@/components/PageSkeleton';
import BoardActions from '@/components/BoardActions';
import { getProjects, getDevelopers } from '@/lib/data';

async function BoardContent() {
  // Use optimized data fetching with caching
  const [projects, developers] = await Promise.all([
    getProjects(),
    getDevelopers()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop projects to manage their status
          </p>
        </div>
        <BoardActions />
      </div>

      <ProjectBoard 
        projects={projects} 
        developers={developers} 
      />
    </div>
  );
}

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <BoardContent />
      </Suspense>
    </Layout>
  );
}

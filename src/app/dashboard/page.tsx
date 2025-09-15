// import { createClient } from '@/lib/supabase-server';
// import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Layout from '@/components/Layout';
import DashboardStats from '@/components/DashboardStats';
import ProjectList from '@/components/ProjectList';
import RecentActivity from '@/components/RecentActivity';
import PageSkeleton from '@/components/PageSkeleton';
import DashboardActions from '@/components/DashboardActions';
import { getProjects, getRecentTasks } from '@/lib/data';

async function DashboardContent() {
  // Use optimized data fetching with caching
  const [projects, recentTasks] = await Promise.all([
    getProjects(),
    getRecentTasks()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your projects and team performance
          </p>
        </div>
        <DashboardActions />
      </div>

      <DashboardStats 
        projects={projects} 
        developers={[]} 
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectList projects={projects} />
        {/* <RecentActivity tasks={recentTasks} /> */}
      </div>
     
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <DashboardContent />
      </Suspense>
    </Layout>
  );
}

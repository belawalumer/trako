import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Layout from '@/components/Layout';
import DeveloperList from '@/components/DeveloperList';
import DeveloperStats from '@/components/DeveloperStats';
import PageSkeleton from '@/components/PageSkeleton';
import DeveloperActions from '@/components/DeveloperActions';
import { getDevelopersWithAllocations, getAllocations } from '@/lib/data';

async function DevelopersContent() {
  // Use optimized data fetching with caching
  const [developers, allocations] = await Promise.all([
    getDevelopersWithAllocations(),
    getAllocations()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage developer assignments and track project allocations
          </p>
        </div>
        <DeveloperActions />
      </div>

      <DeveloperStats 
        developers={developers} 
        allocations={allocations} 
      />

      <DeveloperList developers={developers} />
    </div>
  );
}

export default async function DevelopersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <DevelopersContent />
      </Suspense>
    </Layout>
  );
}

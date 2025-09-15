import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProjectCalendar from '@/components/ProjectCalendar';
import PageSkeleton from '@/components/PageSkeleton';
import { getProjects } from '@/lib/data';

async function CalendarContent() {
  const projects = await getProjects();

  return (
    <ProjectCalendar projects={projects} />
  );
}

export default async function CalendarPage() {
  return (
    <Layout>
      <Suspense fallback={<PageSkeleton />}>
        <CalendarContent />
      </Suspense>
    </Layout>
  );
}

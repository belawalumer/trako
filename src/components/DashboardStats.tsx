import { Project, Developer } from '@/lib/supabase';

interface DashboardStatsProps {
  projects: Project[];
  developers: Developer[];
}

export default function DashboardStats({ projects, developers }: DashboardStatsProps) {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalDevelopers = developers.length;
  const availableDevelopers = developers.filter(d => d.is_available).length;

  const statusCounts = {
    active: projects.filter(p => p.status === 'active').length,
    started: projects.filter(p => p.status === 'started').length,
    completed: projects.filter(p => p.status === 'completed').length,
    stopped: projects.filter(p => p.status === 'stopped').length,
    waiting_for_client_approval: projects.filter(p => p.status === 'waiting_for_client_approval').length,
    gathering_requirements: projects.filter(p => p.status === 'gathering_requirements').length,
  };

  const stats = [
    {
      name: 'Total Projects',
      value: totalProjects,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Projects',
      value: activeProjects,
      change: '+4%',
      changeType: 'positive' as const,
    },
    {
      name: 'Completed Projects',
      value: completedProjects,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Available Developers',
      value: `${availableDevelopers}/${totalDevelopers}`,
      change: '+2',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {stat.name === 'Total Projects' && 'P'}
                      {stat.name === 'Active Projects' && 'A'}
                      {stat.name === 'Completed Projects' && 'C'}
                      {stat.name === 'Available Developers' && 'D'}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project status breakdown */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Project Status Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const statusLabels = {
                active: 'Active',
                started: 'Started',
                completed: 'Completed',
                stopped: 'Stopped',
                waiting_for_client_approval: 'Waiting for Approval',
                gathering_requirements: 'Gathering Requirements',
              };
              
              const statusColors = {
                active: 'bg-green-100 text-green-800',
                started: 'bg-blue-100 text-blue-800',
                completed: 'bg-gray-100 text-gray-800',
                stopped: 'bg-red-100 text-red-800',
                waiting_for_client_approval: 'bg-yellow-100 text-yellow-800',
                gathering_requirements: 'bg-purple-100 text-purple-800',
              };

              return (
                <div key={status} className="text-center">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                    {statusLabels[status as keyof typeof statusLabels]}
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

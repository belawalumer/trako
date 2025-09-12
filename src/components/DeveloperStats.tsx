import { Developer, ProjectAllocation } from '@/lib/supabase';

interface DeveloperStatsProps {
  developers: Developer[];
  allocations: ProjectAllocation[];
}

export default function DeveloperStats({ developers, allocations }: DeveloperStatsProps) {
  const totalDevelopers = developers.length;
  const availableDevelopers = developers.filter(d => d.is_available).length;
  const busyDevelopers = totalDevelopers - availableDevelopers;

  // Calculate total hours allocated and worked
  const totalHoursAllocated = allocations.reduce((sum, alloc) => sum + alloc.hours_allocated, 0);
  const totalHoursWorked = allocations.reduce((sum, alloc) => sum + alloc.hours_worked, 0);

  // Calculate average allocation percentage
  const avgAllocation = allocations.length > 0 
    ? allocations.reduce((sum, alloc) => sum + alloc.allocation_percentage, 0) / allocations.length 
    : 0;

  const stats = [
    {
      name: 'Total Developers',
      value: totalDevelopers,
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      name: 'Available Now',
      value: availableDevelopers,
      change: `${Math.round((availableDevelopers / totalDevelopers) * 100)}%`,
      changeType: 'positive' as const,
    },
    {
      name: 'Hours Allocated',
      value: totalHoursAllocated,
      change: '+40h',
      changeType: 'positive' as const,
    },
    {
      name: 'Hours Worked',
      value: totalHoursWorked,
      change: '+25h',
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
                      {stat.name === 'Total Developers' && 'D'}
                      {stat.name === 'Available Now' && 'A'}
                      {stat.name === 'Hours Allocated' && 'H'}
                      {stat.name === 'Hours Worked' && 'W'}
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

      {/* Allocation overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Allocation Overview
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {Math.round(avgAllocation)}%
              </div>
              <div className="text-sm text-gray-500">Average Allocation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {allocations.length}
              </div>
              <div className="text-sm text-gray-500">Active Allocations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {Math.round((totalHoursWorked / totalHoursAllocated) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

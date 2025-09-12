'use client';

import { useState } from 'react';
import { Developer } from '@/lib/supabase';
import { UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DeveloperForm from './DeveloperForm';
import { deleteDeveloper } from '@/lib/actions';

interface DeveloperListProps {
  developers: Developer[];
}

export default function DeveloperList({ developers }: DeveloperListProps) {
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localDevelopers, setLocalDevelopers] = useState<Developer[]>(developers);
  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getAvailabilityIcon = (isAvailable: boolean) => {
    return isAvailable 
      ? <CheckCircleIcon className="h-4 w-4 text-green-500" />
      : <XCircleIcon className="h-4 w-4 text-red-500" />;
  };

  const calculateTotalAllocation = (allocations: any[] | undefined) => {
    return allocations?.reduce((sum, alloc) => sum + alloc.allocation_percentage, 0) || 0;
  };

  const calculateTotalHours = (allocations: any[] | undefined) => {
    return allocations?.reduce((sum, alloc) => sum + alloc.hours_allocated, 0) || 0;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this developer?')) return;
    
    setDeletingId(id);
    setIsLoading(true);
    try {
      await deleteDeveloper(id);
      setLocalDevelopers(prev => prev.filter(dev => dev.id !== id));
    } catch (error) {
      console.error('Error deleting developer:', error);
      alert('Failed to delete developer');
    } finally {
      setDeletingId(null);
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedDeveloper: Developer) => {
    setLocalDevelopers(prev => 
      prev.map(dev => dev.id === updatedDeveloper.id ? updatedDeveloper : dev)
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Developer Team
        </h3>
        
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">Updating developers...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localDevelopers.map((developer) => (
            <div key={developer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {developer.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={developer.avatar_url}
                        alt={developer.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {developer.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {developer.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getAvailabilityIcon(developer.is_available)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(developer.is_available)}`}>
                    {developer.is_available ? 'Available' : 'Busy'}
                  </span>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => setEditingDeveloper(developer)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Edit developer"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(developer.id)}
                      disabled={deletingId === developer.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete developer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {developer.skills && developer.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {developer.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {developer.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{developer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500">Total Allocation</p>
                    <p className="font-medium text-gray-900">
                      {Math.round(calculateTotalAllocation(developer.project_allocations))}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hours Allocated</p>
                    <p className="font-medium text-gray-900">
                      {calculateTotalHours(developer.project_allocations)}h
                    </p>
                  </div>
                </div>

                {developer.project_allocations && developer.project_allocations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Active Projects:</p>
                    <div className="space-y-1">
                      {developer.project_allocations.slice(0, 2).map((allocation) => (
                        <div key={allocation.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate">
                            {allocation.project?.name}
                          </span>
                          <span className="text-gray-500">
                            {allocation.allocation_percentage}%
                          </span>
                        </div>
                      ))}
                      {developer.project_allocations.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{developer.project_allocations.length - 2} more projects
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {developer.working_hours && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Working Hours: <span className="font-medium">{developer.working_hours} hours/week</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {localDevelopers.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No developers found</p>
          </div>
        )}
      </div>

      {editingDeveloper && (
        <DeveloperForm
          developer={editingDeveloper}
          onClose={() => setEditingDeveloper(null)}
          onSuccess={(updatedDeveloper) => {
            setEditingDeveloper(null);
            handleUpdate(updatedDeveloper);
          }}
        />
      )}
    </div>
  );
}

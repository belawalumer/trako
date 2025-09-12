'use client';

import { useState } from 'react';
import { Project, Developer, ProjectAllocation } from '@/lib/supabase';
import { createProjectAllocation, updateProjectAllocation } from '@/lib/actions';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProjectAllocationFormProps {
  project: Project;
  developers: Developer[];
  allocation?: ProjectAllocation;
  onClose: () => void;
  onSuccess: (updatedAllocation?: ProjectAllocation) => void;
}

export default function ProjectAllocationForm({ 
  project, 
  developers, 
  allocation, 
  onClose, 
  onSuccess 
}: ProjectAllocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState(
    allocation?.developer_id || ''
  );
  const [hoursAllocated, setHoursAllocated] = useState(
    allocation?.hours_allocated?.toString() || '0'
  );

  // Calculate allocation percentage based on selected developer's weekly hours
  const selectedDeveloper = developers.find(dev => dev.id === selectedDeveloperId);
  const weeklyHours = selectedDeveloper?.working_hours || 40;
  const allocationPercentage = selectedDeveloperId && hoursAllocated 
    ? Math.min((parseInt(hoursAllocated) / weeklyHours) * 100, 100).toFixed(1)
    : '0';

  // Calculate available developers (not already allocated to this project)
  const availableDevelopers = developers.filter(dev => {
    if (allocation && dev.id === allocation.developer_id) return true; // Allow current developer for editing
    return !project.project_allocations?.some(alloc => alloc.developer_id === dev.id);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedDeveloperId) {
      setError('Please select a developer');
      setIsSubmitting(false);
      return;
    }

    if (parseInt(hoursAllocated) <= 0) {
      setError('Hours allocated must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (parseInt(hoursAllocated) > weeklyHours) {
      setError(`Hours allocated cannot exceed developer's weekly hours (${weeklyHours}h)`);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('project_id', project.id);
      formData.append('developer_id', selectedDeveloperId);
      formData.append('hours_allocated', hoursAllocated);
      formData.append('allocation_percentage', allocationPercentage);

      let result;
      if (allocation) {
        result = await updateProjectAllocation(allocation.id, formData);
        toast.success('Allocation updated successfully');
      } else {
        result = await createProjectAllocation(formData);
        toast.success('Developer assigned to project successfully');
      }
      
      onSuccess(result);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {allocation ? 'Edit Allocation' : 'Assign Developer to Project'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <input
              type="text"
              value={project.name}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer *
            </label>
            <select
              value={selectedDeveloperId}
              onChange={(e) => setSelectedDeveloperId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a developer</option>
              {availableDevelopers.map((developer) => (
                <option key={developer.id} value={developer.id}>
                  {developer.name} ({developer.email})
                </option>
              ))}
            </select>
            {availableDevelopers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                All developers are already assigned to this project
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours Allocated *
            </label>
            <input
              type="number"
              min="1"
              max={weeklyHours}
              value={hoursAllocated}
              onChange={(e) => setHoursAllocated(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Developer's weekly hours: {weeklyHours}h (max: {weeklyHours}h)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allocation Percentage (Calculated)
            </label>
            <input
              type="text"
              value={`${allocationPercentage}%`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Automatically calculated based on hours allocated vs weekly hours
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableDevelopers.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (allocation ? 'Update Allocation' : 'Assign Developer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

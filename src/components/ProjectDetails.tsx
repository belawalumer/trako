'use client';

import { useState } from 'react';
import { Project, Developer } from '@/lib/supabase';
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ProjectAllocations from './ProjectAllocations';

interface ProjectDetailsProps {
  project: Project;
  developers: Developer[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProjectDetails({ project, developers, onClose, onUpdate }: ProjectDetailsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new_projects_in_pipeline': return 'text-purple-600 bg-purple-100';
      case 'gathering_requirements': return 'text-orange-600 bg-orange-100';
      case 'waiting_for_client_approval': return 'text-yellow-600 bg-yellow-100';
      case 'client_not_responding': return 'text-red-600 bg-red-100';
      case 'started': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-emerald-600 bg-emerald-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'active':
      case 'started':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'stopped':
      case 'client_not_responding':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const totalAllocatedHours = project.project_allocations?.reduce(
    (sum, alloc) => sum + alloc.hours_allocated, 0
  ) || 0;

  const totalAllocationPercentage = project.project_allocations?.reduce(
    (sum, alloc) => sum + alloc.allocation_percentage, 0
  ) || 0;

  // Calculate average allocation per developer
  const avgAllocationPerDeveloper = project.project_allocations?.length 
    ? totalAllocationPercentage / project.project_allocations.length 
    : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(project.status)}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </span>
                
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {project.category}
                </span>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Assigned Developers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {project.project_allocations?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Hours Allocated</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalAllocatedHours}h
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Allocation</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalAllocationPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: {avgAllocationPerDeveloper.toFixed(1)}% per developer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Dates */}
          {(project.start_date || project.end_date) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Project Timeline</h4>
              <div className="flex items-center space-x-6">
                {project.start_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Start:</span>
                    <span className="ml-1">{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">End:</span>
                    <span className="ml-1">{new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Developer Allocations */}
          <ProjectAllocations
            project={project}
            developers={developers}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

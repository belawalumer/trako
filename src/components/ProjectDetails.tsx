'use client';

import { useState } from 'react';
import { Project, Developer, ProjectAllocation } from '@/lib/supabase';
import { deleteProjectAllocation } from '@/lib/actions';
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import { useIsAuthenticated } from '@/lib/auth-utils';
import ProjectAllocationForm from './ProjectAllocationForm';
import ModalTransition from './ModalTransition';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import toast from 'react-hot-toast';

interface ProjectDetailsProps {
  project: Project;
  developers: Developer[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function ProjectDetails({ project, developers, onClose, onUpdate }: ProjectDetailsProps) {
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<ProjectAllocation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { isAuthenticated } = useIsAuthenticated();
  const { confirm, close, handleConfirm, isOpen: isConfirmOpen, options: confirmOptions } = useConfirm();

  const handleUnassign = async (allocationId: string) => {
    const confirmed = await confirm({
      title: 'Unassign Developer',
      message: 'Are you sure you want to unassign this developer from the project?',
      confirmText: 'Unassign',
      cancelText: 'Cancel',
      type: 'warning'
    });
    
    if (!confirmed) return;
    
    setDeletingId(allocationId);
    try {
      await deleteProjectAllocation(allocationId);
      toast.success('Developer unassigned from project');
      onUpdate();
    } catch (error) {
      console.error('Error unassigning developer:', error);
      toast.error('Failed to unassign developer from project');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (allocation: ProjectAllocation) => {
    setEditingAllocation(allocation);
    setShowAllocationForm(true);
  };

  const handleAdd = () => {
    setEditingAllocation(null);
    setShowAllocationForm(true);
  };

  const handleSuccess = () => {
    setShowAllocationForm(false);
    setEditingAllocation(null);
    onUpdate();
    // Don't close the modal - keep it open
  };

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
    <ModalTransition isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
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
                
                {/* Display categories */}
                <div className="flex flex-wrap gap-1">
                  {(project.categories && project.categories.length > 0) ? (
                    project.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {category}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {project.category}
                    </span>
                  )}
                </div>
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

          {/* Assigned Developers List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Assigned Developers</h4>
              {isAuthenticated && (
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  Add Developer
                </button>
              )}
            </div>
            {project.project_allocations && project.project_allocations.length > 0 ? (
              <div className="space-y-2">
                {project.project_allocations.map((allocation) => {
                  const developer = developers.find(dev => dev.id === allocation.developer_id);
                  if (!developer) return null;
                  
                  return (
                    <div key={allocation.id} className="flex items-center justify-between bg-white rounded-md p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{developer.name}</p>
                          <p className="text-xs text-gray-500">{allocation.hours_allocated}h allocated</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {allocation.allocation_percentage.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">allocation</p>
                        </div>
                        {isAuthenticated && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(allocation)}
                              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit allocation"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUnassign(allocation.id)}
                              disabled={deletingId === allocation.id}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              title="Unassign developer"
                            >
                              <UserMinusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No developers assigned to this project</p>
                {isAuthenticated && (
                  <p className="text-xs mt-2">Click "Add Developer" to get started</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Project Allocation Form Modal */}
      {showAllocationForm && (
        <ProjectAllocationForm
          project={project}
          developers={developers}
          allocation={editingAllocation || undefined}
          onClose={() => setShowAllocationForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={close}
        onConfirm={handleConfirm}
        title={confirmOptions.title}
        message={confirmOptions.message}
        confirmText={confirmOptions.confirmText}
        cancelText={confirmOptions.cancelText}
        type={confirmOptions.type}
      />
    </ModalTransition>
  );
}

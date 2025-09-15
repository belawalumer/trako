'use client';

import { useState } from 'react';
import { Project, Developer, ProjectAllocation } from '@/lib/supabase';
import { deleteProjectAllocation } from '@/lib/actions';
import { 
  UserIcon, 
  ClockIcon, 
  PencilIcon, 
  PlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';
import { useIsAuthenticated } from '@/lib/auth-utils';
import ProjectAllocationForm from './ProjectAllocationForm';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import toast from 'react-hot-toast';

interface ProjectAllocationsProps {
  project: Project;
  developers: Developer[];
  onUpdate: () => void;
}

export default function ProjectAllocations({ project, developers, onUpdate }: ProjectAllocationsProps) {
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
  };

  // Filter out allocations where developer is null (deleted developer)
  const allocations = project.project_allocations?.filter(alloc => alloc.developer) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Project Allocations</h4>
        {isAuthenticated && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Assign Developer
          </button>
        )}
      </div>

      {allocations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No developers assigned to this project</p>
          {isAuthenticated && (
            <p className="text-sm mt-2">Click &quot;Assign Developer&quot; to get started</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((allocation) => {
            const developer = developers.find(dev => dev.id === allocation.developer_id);
            if (!developer) return null;

            return (
              <div
                key={allocation.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {developer.name}
                      </h5>
                      <p className="text-sm text-gray-500 truncate">
                        {developer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{allocation.hours_allocated}h / {developer.working_hours || 40}h</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {allocation.allocation_percentage.toFixed(1)}% allocation
                      </div>
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

                {(allocation.start_date || allocation.end_date) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {allocation.start_date && (
                        <div>
                          <span className="font-medium">Start:</span> {new Date(allocation.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {allocation.end_date && (
                        <div>
                          <span className="font-medium">End:</span> {new Date(allocation.end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
    </div>
  );
}

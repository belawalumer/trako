'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Project, Developer } from '@/lib/supabase';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { deleteProject } from '@/lib/actions';
import { useIsAuthenticated } from '@/lib/auth-utils';
import ConfirmDialog from './ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import toast from 'react-hot-toast';

interface ProjectCardProps {
  project: Project;
  developers: Developer[];
  isOverlay?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onViewDetails?: (project: Project) => void;
}

export default function ProjectCard({ project, developers, isOverlay = false, onEdit, onDelete, onViewDetails }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAuthenticated, loading } = useIsAuthenticated();
  const { confirm, close, handleConfirm, isOpen: isConfirmOpen, options: confirmOptions } = useConfirm();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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

  // Filter out allocations where developer is null (deleted developer)
  const validAllocations = project.project_allocations?.filter(alloc => alloc.developer) || [];
  const assignedDevelopers = validAllocations.length;
  const totalTasks = project.tasks?.length || 0;
  const totalAllocatedHours = validAllocations.reduce(
    (sum, alloc) => sum + alloc.hours_allocated, 0
  );

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      onDelete?.(project.id);
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(project);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewDetails?.(project);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      } ${isOverlay ? 'rotate-3 shadow-xl' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {project.name}
          </h3>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium  ${getPriorityColor(project.priority)}`} style={{ fontSize: '10px' }}>
            {project.priority}
          </span>
          {!isOverlay && (
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={handleViewDetails}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                title="View project details"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              {loading ? (
                <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={handleEdit}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="Edit project"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    disabled={isDeleting}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete project"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div 
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
      >
        {project.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Display categories */}
        {(project.categories && project.categories.length > 0) && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {project.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>{assignedDevelopers} devs</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{totalTasks} tasks</span>
            </div>
            {totalAllocatedHours > 0 && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{totalAllocatedHours}h allocated</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`} style={{ fontSize: '10px' }}>
            {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          
          {project.start_date && (
            <div className="flex items-center text-xs text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{new Date(project.start_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

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

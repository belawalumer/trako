'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Developer } from '@/lib/supabase';
import { useIsAuthenticated } from '@/lib/auth-utils';
import toast from 'react-hot-toast';

interface TaskWithProject {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_developer_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
    id: string;
  };
  assigned_developer?: Developer;
}
import { createClient } from '@/lib/supabase-client';
import { 
  CalendarIcon, 
  UserIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: TaskWithProject;
  developers: Developer[];
  isOverlay?: boolean;
}

export default function TaskCard({ task, developers, isOverlay = false }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [assignedDeveloperId, setAssignedDeveloperId] = useState(task.assigned_developer_id || '');
  const { isAuthenticated } = useIsAuthenticated();
  const supabase = createClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleAssignDeveloper = async (developerId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        assigned_developer_id: developerId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    if (!error) {
      setAssignedDeveloperId(developerId);
      toast.success('Developer assigned successfully');
    } else {
      toast.error('Failed to assign developer');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      } ${isOverlay ? 'rotate-3 scale-105' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
            {task.title}
          </h4>
        </div>
        <div className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-2">
        {task.project && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">{task.project.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {task.due_date && (
              <div className="flex items-center text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {formatDate(task.due_date)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <UserIcon className="h-3 w-3 text-gray-400" />
            {isAuthenticated ? (
              <select
                value={assignedDeveloperId}
                onChange={(e) => handleAssignDeveloper(e.target.value)}
                className="text-xs border-none bg-transparent focus:ring-0 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">Unassigned</option>
                {developers.map(dev => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-gray-500">
                {task.assigned_developer?.name || 'Unassigned'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

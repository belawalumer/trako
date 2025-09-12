'use client';

import { useDroppable } from '@dnd-kit/core';
import { Developer, Project } from '@/lib/supabase';
import ProjectCard from './ProjectCard';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ProjectColumnProps {
  id: string;
  title: string;
  color: string;
  projects: Project[];
  developers: Developer[];
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onViewDetails?: (project: Project) => void;
}

export default function ProjectColumn({ id, title, color, projects, developers, onEdit, onDelete, onViewDetails }: ProjectColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="space-y-4">
      <div className={`${color} rounded-lg p-4`}>
        <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
        <div className="text-xs text-gray-600">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-3 p-3 rounded-lg border-2 border-dashed transition-colors ${
          isOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
        }`}
      >
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="text-sm">No projects</div>
            <div className="text-xs">Drag projects here</div>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              developers={developers}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}
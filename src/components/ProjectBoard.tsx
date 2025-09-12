'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { updateProjectStatus } from '@/lib/actions';
import { Project, Developer } from '@/lib/supabase';
import ProjectCard from './ProjectCard';
import ProjectColumn from './ProjectColumn';
import ProjectForm from './ProjectForm';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ProjectBoardProps {
  projects: Project[];
  developers: Developer[];
}

const statusColumns = [
  { id: 'new_projects_in_pipeline', title: 'New Projects in Pipeline', color: 'bg-purple-100' },
  { id: 'gathering_requirements', title: 'Gathering Requirements', color: 'bg-orange-100' },
  { id: 'waiting_for_client_approval', title: 'Waiting for Client Approval', color: 'bg-yellow-100' },
  { id: 'client_not_responding', title: 'Client Not Responding', color: 'bg-red-100' },
  { id: 'started', title: 'Started', color: 'bg-blue-100' },
  { id: 'active', title: 'Active', color: 'bg-green-100' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-100' },
  { id: 'stopped', title: 'Stopped', color: 'bg-gray-100' },
];

export default function ProjectBoard({ projects, developers }: ProjectBoardProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);

  const categories = ['Web', 'Mobile', 'UI/UX', 'Backend', 'DevOps', 'Other'];

  const filteredProjects = localProjects.filter(project => {
    const projectMatch = selectedProject === 'all' || project.id === selectedProject;
    const categoryMatch = selectedCategory === 'all' || project.category === selectedCategory;
    return projectMatch && categoryMatch;
  });

  const projectsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = filteredProjects.filter(project => project.status === column.id);
    return acc;
  }, {} as Record<string, Project[]>);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (projectId: string) => {
    setLocalProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setLocalProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = localProjects.find(p => p.id === active.id);
    setActiveProject(project || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as string;

    // Find the current project
    const currentProject = localProjects.find(p => p.id === projectId);
    if (!currentProject || currentProject.status === newStatus) return;

    // Optimistically update local state first (no loading state needed)
    setLocalProjects(prev => 
      prev.map(p => 
        p.id === projectId 
          ? { ...p, status: newStatus as Project['status'], updated_at: new Date().toISOString() }
          : p
      )
    );

    // Update database in background without showing loading state
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      console.log('Updating project status:', { projectId, newStatus });
      const result = await updateProjectStatus(projectId, formData);
      console.log('Project status updated successfully:', result);
    } catch (error) {
      console.error('Error updating project:', error);
      // Revert the optimistic update on error
      setLocalProjects(prev => 
        prev.map(p => 
          p.id === projectId 
            ? { ...p, status: currentProject.status, updated_at: currentProject.updated_at }
            : p
        )
      );
      alert(`Failed to update project status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="project-filter" className="text-sm font-medium text-gray-700">
              Project:
            </label>
            <select
              id="project-filter"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            >
              <option value="all">All Projects</option>
              {localProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
              Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {statusColumns.map((column) => (
            <ProjectColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              projects={projectsByStatus[column.id] || []}
              developers={developers}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProject ? (
            <ProjectCard project={activeProject} developers={developers} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Project Form */}
      {editingProject && (
        <ProjectForm
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSuccess={(updatedProject) => {
            setEditingProject(null);
            handleUpdateProject(updatedProject);
          }}
        />
      )}
    </div>
  );
}
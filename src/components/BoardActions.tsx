'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProjectForm from './ProjectForm';

export default function BoardActions() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  const handleSuccess = (updatedProject?: any) => {
    // Form will handle its own success and close
  };

  return (
    <>
      <button
        onClick={() => setShowProjectForm(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Project
      </button>

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

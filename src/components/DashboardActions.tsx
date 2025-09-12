'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProjectForm from './ProjectForm';
import DeveloperForm from './DeveloperForm';

export default function DashboardActions() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showDeveloperForm, setShowDeveloperForm] = useState(false);

  const handleSuccess = (updatedProject?: any) => {
    // Forms will handle their own success and close
  };

  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={() => setShowProjectForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Project
        </button>
        
        <button
          onClick={() => setShowDeveloperForm(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Developer
        </button>
      </div>

      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showDeveloperForm && (
        <DeveloperForm
          onClose={() => setShowDeveloperForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

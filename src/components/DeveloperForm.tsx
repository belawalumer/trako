'use client';

import { useState } from 'react';
import { Developer } from '@/lib/supabase';
import { createDeveloper, updateDeveloper } from '@/lib/actions';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ModalTransition from './ModalTransition';
import toast from 'react-hot-toast';

interface DeveloperFormProps {
  developer?: Developer;
  onClose: () => void;
  onSuccess: (updatedDeveloper?: Developer) => void;
}

export default function DeveloperForm({ developer, onClose, onSuccess }: DeveloperFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (developer) {
        result = await updateDeveloper(developer.id, formData);
        toast.success('Developer updated successfully');
      } else {
        result = await createDeveloper(formData);
        toast.success('Developer created successfully');
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
    <ModalTransition isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {developer ? 'Edit Developer' : 'Add New Developer'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={developer?.name || ''}
              placeholder="Enter developer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="working_hours" className="block text-sm font-medium text-gray-700 mb-1">
              Working Hours (per week) *
            </label>
            <input
              type="number"
              id="working_hours"
              name="working_hours"
              required
              min="1"
              max="168"
              step="1"
              defaultValue={developer?.working_hours || ''}
              placeholder="Enter working hours per week (e.g., 40)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-800"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : (developer ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </ModalTransition>
  );
}

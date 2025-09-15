'use client';

import { useEffect, useState } from 'react';

interface ModalTransitionProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function ModalTransition({ 
  isOpen, 
  onClose, 
  children, 
  className = "fixed inset-0 flex items-center justify-center p-4 z-50" 
}: ModalTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className={className}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className={`relative transform transition-all duration-200 ease-out ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    onConfirm: null,
  });

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        onConfirm: () => {
          resolve(true);
          setConfirmState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
        },
      });
    });
  };

  const close = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  const handleConfirm = () => {
    if (confirmState.onConfirm) {
      confirmState.onConfirm();
    }
  };

  return {
    confirm,
    close,
    handleConfirm,
    isOpen: confirmState.isOpen,
    options: confirmState.options,
  };
}

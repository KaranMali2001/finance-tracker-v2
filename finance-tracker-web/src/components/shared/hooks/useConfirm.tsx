'use client';

import React, { useState, useCallback } from 'react';
import { ConfirmDialog } from '../dialog/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface UseConfirmReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  ConfirmDialog: React.ReactNode;
}

/**
 * Promise-based confirmation dialog hook
 * Returns a confirm function that returns a promise resolving to true/false
 *
 * @example
 * const { confirm } = useConfirm();
 * const ok = await confirm({ title: "Delete item?", destructive: true });
 * if (ok) { ... }
 */
export function useConfirm(): UseConfirmReturn {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setResolvePromise(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setOpen(false);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setOpen(false);
  }, [resolvePromise]);

  const ConfirmDialogComponent = options ? (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={options.title}
      description={options.description}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      destructive={options.destructive}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

'use client';

import { Button } from '@/components/ui/button';
import { Check, Loader2, Trash2, X } from 'lucide-react';

/**
 * Props for RowActions component
 */
export interface RowActionsProps {
  /**
   * Whether edit mode is active
   */
  isEditMode: boolean;

  /**
   * Whether this row has unsaved changes
   */
  isModified: boolean;

  /**
   * Callback when save button is clicked
   */
  onSave: () => void;

  /**
   * Callback when cancel button is clicked
   */
  onCancel: () => void;

  /**
   * Callback when delete button is clicked
   */
  onDelete: () => void;

  /**
   * Whether save operation is in progress
   */
  isSaving?: boolean;

  /**
   * Whether to show delete button (when not modified or not in edit mode)
   */
  showDelete?: boolean;

  /**
   * Whether delete operation is in progress
   */
  isDeleting?: boolean;
}

/**
 * Reusable row actions component for data grids
 * Shows save/cancel buttons when row is modified in edit mode
 * Shows delete button when row is not modified or not in edit mode
 */
export function RowActions({
  isEditMode,
  isModified,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  showDelete = true,
  isDeleting = false,
}: RowActionsProps) {
  // Show save/cancel buttons when in edit mode and row is modified
  if (isEditMode && isModified) {
    return (
      <div className="flex items-center justify-center gap-1 h-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          disabled={isSaving}
          title="Save changes"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          disabled={isSaving}
          title="Cancel changes"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show delete button when not in edit mode or row is not modified
  if (showDelete) {
    return (
      <div className="flex items-center justify-center h-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          title="Delete"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return null;
}

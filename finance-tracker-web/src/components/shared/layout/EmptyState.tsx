import React from 'react';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className || ''}`}
    >
      {Icon && <Icon className="mb-4 h-12 w-12 text-muted-foreground" />}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && <p className="mb-4 max-w-sm text-muted-foreground text-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}

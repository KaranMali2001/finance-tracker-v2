import React from 'react';

interface PageShellProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ title, description, actions, children, className }: PageShellProps) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

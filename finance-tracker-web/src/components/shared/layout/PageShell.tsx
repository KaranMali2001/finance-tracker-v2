import React from 'react';

interface PageShellProps {
  title?: string | React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ title, description, actions, children, className }: PageShellProps) {
  // Check if className contains flex-related classes to determine layout
  const isFlexLayout = className?.includes('flex');
  const containerClass = isFlexLayout ? className || '' : `space-y-6 ${className || ''}`;

  return (
    <div className={containerClass}>
      {(title || description || actions) && (
        <div className={`flex items-center justify-between ${isFlexLayout ? 'shrink-0' : ''}`}>
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

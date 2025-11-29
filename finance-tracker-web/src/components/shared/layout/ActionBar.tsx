import React from 'react';

interface ActionBarProps {
  actions: React.ReactNode;
  position?: 'top' | 'bottom' | 'inline';
  className?: string;
}

export function ActionBar({ actions, position = 'inline', className }: ActionBarProps) {
  const positionClasses = {
    top: 'sticky top-0 z-10 border-b bg-background pb-4',
    bottom: 'sticky bottom-0 z-10 border-t bg-background pt-4',
    inline: '',
  };

  return (
    <div
      className={`flex items-center justify-end gap-2 ${positionClasses[position]} ${className || ''}`}
    >
      {actions}
    </div>
  );
}

'use client';

import { useEnqueueAutoLink } from '@/components/shared/hooks/useInvestment';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface AutoLinkButtonProps {
  transactionIds?: string[];
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}

export function AutoLinkButton({
  transactionIds = [],
  variant = 'outline',
  size = 'default',
  label = 'Auto-Link',
}: AutoLinkButtonProps) {
  const enqueue = useEnqueueAutoLink();

  const hasIds = transactionIds.length > 0;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => enqueue.mutate({ transaction_ids: transactionIds })}
      disabled={enqueue.isPending || !hasIds}
      title={!hasIds ? 'Select transactions to auto-link' : undefined}
    >
      <Zap className="mr-2 h-4 w-4" />
      {enqueue.isPending ? 'Queuing...' : label}
    </Button>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { FileSpreadsheet, MessageSquare, Receipt, Target, User, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { title: 'Accounts', url: '/dashboard/accounts', icon: Wallet },
  { title: 'Transactions', url: '/dashboard/transactions', icon: Receipt },
  { title: 'Investments', url: '/dashboard/investments', icon: Target },
  { title: 'Reconciliation', url: '/dashboard/reconciliation', icon: FileSpreadsheet },
  { title: 'SMS', url: '/dashboard/sms', icon: MessageSquare },
  { title: 'Profile', url: '/dashboard/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Frosted glass backdrop */}
      <div className="border-t border-stone-200/80 bg-white/90 backdrop-blur-xl">
        <div className="flex items-stretch">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url || pathname.startsWith(item.url + '/');

            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-center transition-all duration-200 relative',
                  isActive ? 'text-amber-700' : 'text-stone-500 hover:text-stone-800'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600" />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive ? 'scale-110' : 'scale-100'
                  )}
                />
                <span
                  className={cn(
                    'text-[9px] font-medium leading-none truncate w-full text-center px-0.5',
                    isActive ? 'text-amber-700' : 'text-stone-500'
                  )}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

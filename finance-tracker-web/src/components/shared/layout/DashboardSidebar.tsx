'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  FileSpreadsheet,
  LogOut,
  MessageSquare,
  Receipt,
  Target,
  User,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const navigationItems = [
    {
      title: 'Accounts',
      url: '/dashboard/accounts',
      icon: Wallet,
    },
    {
      title: 'Transactions',
      url: '/dashboard/transactions',
      icon: Receipt,
    },
    {
      title: 'Reconciliation',
      url: '/dashboard/reconciliation',
      icon: FileSpreadsheet,
    },
    {
      title: 'Investments',
      url: '/dashboard/investments',
      icon: Target,
    },
    {
      title: 'SMS Logs',
      url: '/dashboard/sms',
      icon: MessageSquare,
    },
    {
      title: 'Profile',
      url: '/dashboard/profile',
      icon: User,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Finance Tracker
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isLoaded && user && (
          <>
            <Link
              href="/dashboard/profile"
              className={cn(
                'flex items-center gap-2 rounded-md p-2 transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                pathname === '/dashboard/profile' &&
                  'bg-sidebar-accent text-sidebar-accent-foreground',
                'group-data-[collapsible=icon]:justify-center'
              )}
              title={user.fullName || user.emailAddresses[0]?.emailAddress || 'Profile'}
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || user.emailAddresses[0]?.emailAddress || 'Profile'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  {(user.fullName || user.emailAddresses[0]?.emailAddress || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">
                  {user.fullName || user.emailAddresses[0]?.emailAddress || 'User'}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {user.emailAddresses[0]?.emailAddress}
                </span>
              </div>
            </Link>
            <button
              onClick={() => {
                signOut();
                router.push('/sign-in');
              }}
              className={cn(
                'flex items-center gap-2 rounded-md p-2 transition-colors w-full',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'group-data-[collapsible=icon]:justify-center',
                'text-sidebar-foreground'
              )}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

'use client';

import type React from 'react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  ChevronLeft,
  FileSpreadsheet,
  Landmark,
  LayoutDashboard,
  LayoutList,
  LogOut,
  MessageSquare,
  Receipt,
  Target,
  TrendingUp,
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
  const { toggleSidebar } = useSidebar();

  const navigationItems: {
    title: string;
    url: string;
    icon: React.ElementType;
    children?: { title: string; url: string; icon: React.ElementType }[];
  }[] = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
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
      title: 'Investments',
      url: '/dashboard/investments',
      icon: TrendingUp,
      children: [
        {
          title: 'Goals',
          url: '/dashboard/investments',
          icon: Target,
        },
        {
          title: 'Rules',
          url: '/dashboard/investments/rules',
          icon: LayoutList,
        },
      ],
    },
    {
      title: 'Reconciliation',
      url: '/dashboard/reconciliation',
      icon: FileSpreadsheet,
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
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1">
          <Button
            type="button"
            variant="ghost"
            onClick={toggleSidebar}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer h-auto p-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-md shadow-amber-600/20 flex-shrink-0">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h2
                className="text-lg font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Wealth Reserve
              </h2>
            </div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="group-data-[collapsible=icon]:hidden h-8 w-8 flex items-center justify-center hover:bg-amber-50 hover:text-amber-700 rounded-md transition-colors -mr-1"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="h-5 w-5 text-stone-600" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.url === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.url || pathname.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive && !item.children}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.children && isActive && (
                      <SidebarMenuSub>
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive =
                            pathname === child.url || pathname.startsWith(child.url + '/');
                          return (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton asChild isActive={isChildActive}>
                                <Link href={child.url} className="flex items-center gap-2">
                                  <ChildIcon className="h-3.5 w-3.5" />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
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
            <Button
              type="button"
              variant="ghost"
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
            </Button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

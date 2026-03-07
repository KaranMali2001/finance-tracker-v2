'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/shared/layout/DashboardSidebar';
import { BottomNav } from '@/components/shared/layout/BottomNav';

function getSidebarDefault(): boolean {
  if (typeof document === 'undefined') return true;
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]*)/);
  if (!match) return true;
  return match[1] === 'true';
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={getSidebarDefault()}>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pb-20 md:pb-6 md:p-6 bg-stone-50/30">
          {children}
        </div>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}

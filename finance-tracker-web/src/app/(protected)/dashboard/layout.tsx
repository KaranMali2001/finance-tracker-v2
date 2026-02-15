'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/shared/layout/DashboardSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-stone-50/30">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

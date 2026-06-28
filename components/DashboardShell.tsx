"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { AuthenticatedRoute } from "@/components/AuthenticatedRoute";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex-1 overflow-auto transition-[margin,width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <SidebarTrigger className="fixed left-3 top-3 z-30 md:hidden" />
            <SidebarTrigger className="fixed right-3 top-3 z-30 hidden md:flex" />
            <main className="p-6 md:p-8 pb-20 md:pb-8 pt-14 md:pt-14">
              {children}
            </main>
          </div>
          <BottomTabBar />
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedRoute>
  );
}

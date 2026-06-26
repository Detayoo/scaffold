"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { BottomTabBar } from "@/components/BottomTabBar";
import { AuthenticatedRoute } from "@/components/AuthenticatedRoute";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <AuthenticatedRoute>
      <SidebarProvider defaultOpen={!isMobile}>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
          <BottomTabBar />
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedRoute>
  );
}

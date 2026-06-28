"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { AuthenticatedRoute } from "@/components/AuthenticatedRoute";

export function DashboardShell({
  children,
  initialSidebarOpen = true,
}: {
  children: React.ReactNode;
  initialSidebarOpen?: boolean;
}) {
  return (
    <AuthenticatedRoute>
      <SidebarProvider defaultOpen={initialSidebarOpen}>
        <AppSidebar />
        <SidebarInset>
          <div className="relative flex-1 overflow-auto transition-[margin,width] duration-200 ease-in-out">
            <main className="p-6 md:p-8 pb-16 md:pb-8">
              <SidebarTrigger className="mb-4 md:mb-5" />
              {children}
            </main>
          </div>
          <BottomTabBar />
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedRoute>
  );
}

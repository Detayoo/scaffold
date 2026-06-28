"use client";

import { PanelLeft } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
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
          <div className="relative flex-1 overflow-auto">
            {isMobile && (
              <SidebarTrigger asChild>
                <Button variant="ghost" size="icon" className="fixed left-3 top-2 z-30 size-8 md:hidden">
                  <PanelLeft className="size-4" />
                </Button>
              </SidebarTrigger>
            )}
            <main className="p-6 md:p-8 pb-20 md:pb-8 pt-10 md:pt-8">
              {children}
            </main>
          </div>
          <BottomTabBar />
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedRoute>
  );
}

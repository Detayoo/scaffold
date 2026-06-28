"use client";

import { PanelLeft } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { AuthenticatedRoute } from "@/components/AuthenticatedRoute";

function DesktopSidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`fixed top-3 z-30 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:flex hidden ${
        isCollapsed ? "left-3" : "left-[calc(16rem+12px)]"
      }`}
    >
      <PanelLeft className="size-4" />
    </button>
  );
}

function MobileSidebarToggle() {
  return (
    <SidebarTrigger className="fixed left-3 top-3 z-30 md:hidden" />
  );
}

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
          <div className="relative flex-1 overflow-auto">
            <DesktopSidebarToggle />
            <MobileSidebarToggle />
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

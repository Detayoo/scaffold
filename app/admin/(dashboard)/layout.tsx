"use client";

import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "x-noname — Admin";
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="relative flex-1 overflow-auto transition-[margin,width] duration-200 ease-in-out">
          <main className="p-6 md:p-8">
            <SidebarTrigger className="mb-4 md:mb-5" />
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

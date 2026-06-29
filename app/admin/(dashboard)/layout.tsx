"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAdminAuth } from "@/contexts/admin-auth-context";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.push("/admin/login");
    }
  }, [token, loading, router]);

  if (loading) return null;

  if (!token) return null;

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

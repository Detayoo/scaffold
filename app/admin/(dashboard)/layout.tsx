import type { Metadata } from "next";
import { APP_NAME } from "@/config";
import { AdminDashboardShell } from "./_components/dashboard-shell";

export const metadata: Metadata = {
  title: `${APP_NAME} — Admin`,
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}

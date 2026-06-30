import type { Metadata } from "next";
import { AdminDashboardShell } from "./_components/dashboard-shell";

export const metadata: Metadata = {
  title: "Malimbe — Admin",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}

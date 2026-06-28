import { cookies } from "next/headers";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;

  return (
    <DashboardShell initialSidebarOpen={sidebarState !== "false"}>
      {children}
    </DashboardShell>
  );
}

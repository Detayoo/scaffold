"use client";

import { PageHeader } from "@/components/PageHeader";
import { withSuspense } from "@/components/withSuspense";

function AdminHome() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform overview and management" />
      <p className="text-sm text-muted-foreground">Welcome to the admin panel. Select a section from the sidebar.</p>
    </div>
  );
}

export default withSuspense(AdminHome);

"use client";

import { useState, Suspense } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { statusColumn, actionsColumn } from "@/components/ColumnHelpers";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getMembersFn, suspendMemberFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import type { Column } from "@/components/DataTable";
import type { Member } from "@/types";
function MembersContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [suspendTarget, setSuspendTarget] = useState<Member | null>(null);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["members", page + 1, size],
    queryFn: () => getMembersFn({ page: page + 1, size }),
  });

  const { mutateAsync: toggleSuspend, isPending } = useMutation({
    mutationFn: (payload: { id: string; status: "SUSPENDED" | "ENABLED" }) =>
      suspendMemberFn(payload),
  });

  const handleToggleSuspend = async () => {
    if (!suspendTarget) return;
    const newStatus =
      suspendTarget.status === "SUSPENDED" ? "ENABLED" : "SUSPENDED";
    try {
      await toggleSuspend({ id: suspendTarget.id, status: newStatus });
      toastMessage(
        "success",
        newStatus === "SUSPENDED"
          ? "Member suspended successfully"
          : "Member enabled successfully"
      );
      setSuspendTarget(null);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const members = data?.data?.members;
  const totalRecords = data?.data?.totalRecords;
  const totalPages = data?.data?.totalPages;

  const columns: Column<Member>[] = [
    {
      key: "name",
      header: "Name",
      cell: (member: Member) => (
        <span className="font-medium text-foreground">
          {member.firstName} {member.lastName}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (member: Member) => (
        <span className="text-muted-foreground">{member.email}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (member: Member) => <span>{member.role}</span>,
    },
    statusColumn((member: Member) => member.status),
    actionsColumn((member: Member) => (
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(e) => {
          e.stopPropagation();
          setSuspendTarget(member);
        }}
      >
        {member.status === "SUSPENDED" ? (
          <CheckCircle className="size-3.5 text-success" />
        ) : (
          <Ban className="size-3.5 text-destructive" />
        )}
      </Button>
    )),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Team Members" description="Manage your team members and their access to the platform" />

      <DataTable
        columns={columns}
        data={members}
        isPending={isFetching}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No team members"
        emptyDescription="Invite team members to collaborate on this account"
        errorMessage="Failed to load team members"
        pageCount={totalPages}
        currentPage={page}
        perPage={size}
        totalRecords={totalRecords}
        itemOffset={page * size}
        onPageChange={(selected) => setPage(selected)}
        onPerPageChange={(newSize) => {
          setSize(newSize);
          setPage(0);
        }}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={(open) => {
          if (!open) setSuspendTarget(null);
        }}
        title={
          suspendTarget?.status === "SUSPENDED"
            ? "Enable Member"
            : "Suspend Member"
        }
        description={
          suspendTarget?.status === "SUSPENDED"
            ? `Are you sure you want to enable "${suspendTarget?.firstName} ${suspendTarget?.lastName}"? They will regain access to the platform.`
            : `Are you sure you want to suspend "${suspendTarget?.firstName} ${suspendTarget?.lastName}"? They will lose access to the platform.`
        }
        confirmLabel={
          suspendTarget?.status === "SUSPENDED" ? "Enable" : "Suspend"
        }
        variant={
          suspendTarget?.status === "SUSPENDED" ? "default" : "destructive"
        }
        onConfirm={handleToggleSuspend}
        loading={isPending}
      />
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={null}>
      <MembersContent />
    </Suspense>
  );
}

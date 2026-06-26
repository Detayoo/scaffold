"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { FormField } from "@/components/FormField";
import { StatusBadge } from "@/components/StatusBadge";
import { getInvitesFn, createInviteFn, deleteInviteFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import { inviteSchema } from "@/utils/validators";
import { formatDate } from "@/utils";
import type { Column } from "@/components/DataTable";
import type { Invite } from "@/types";

type InviteForm = z.infer<typeof inviteSchema>;

export default function InvitesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invite | null>(null);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["invites", page + 1, size],
    queryFn: () => getInvitesFn({ page: page + 1, size }),
  });

  const { mutateAsync: createInvite, isPending: isCreating } = useMutation({
    mutationFn: createInviteFn,
  });

  const { mutateAsync: removeInvite, isPending: isDeleting } = useMutation({
    mutationFn: (reference: string) => deleteInviteFn(reference),
  });

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", firstName: "", lastName: "" },
  });

  const handleCreateInvite = async (formData: InviteForm) => {
    try {
      await createInvite(formData);
      toastMessage("success", "Invitation sent successfully");
      setModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const handleDeleteInvite = async () => {
    if (!deleteTarget) return;
    try {
      await removeInvite(deleteTarget.id);
      toastMessage("success", "Invitation cancelled successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const invites = data?.data?.invites;
  const totalRecords = data?.data?.totalRecords ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  const columns: Column<Invite>[] = [
    {
      key: "email",
      header: "Email",
      cell: (invite: Invite) => (
        <span className="font-medium text-foreground">{invite.email}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (invite: Invite) => (
        <span className="text-muted-foreground">
          {invite.firstName} {invite.lastName}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (invite: Invite) => <StatusBadge status={invite.status} size="sm" />,
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (invite: Invite) => (
        <span className="text-muted-foreground">
          {formatDate(invite.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (invite: Invite) => (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(invite);
          }}
        >
          <X className="size-3.5 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-foreground">
            Team Invitations
          </h1>
          <p className="text-sm text-muted-foreground">
            Invite new members to join your team and manage pending invitations
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="size-3.5" />
          Invite Member
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={invites}
        isPending={isFetching}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No pending invitations"
        emptyDescription="Invite team members to collaborate on this account"
        emptyAction={{
          label: "Invite Member",
          onClick: () => setModalOpen(true),
        }}
        errorMessage="Failed to load invitations"
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

      <ResponsiveModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Invite Member"
        description="Send an invitation to join your team"
      >
        <form
          onSubmit={form.handleSubmit(handleCreateInvite)}
          className="space-y-4 pt-2"
        >
          <FormField
            label="Email"
            error={form.formState.errors.email?.message}
            isRequired
          >
            <Input {...form.register("email")} placeholder="email@example.com" />
          </FormField>
          <FormField
            label="First Name"
            error={form.formState.errors.firstName?.message}
            isRequired
          >
            <Input {...form.register("firstName")} placeholder="John" />
          </FormField>
          <FormField
            label="Last Name"
            error={form.formState.errors.lastName?.message}
            isRequired
          >
            <Input {...form.register("lastName")} placeholder="Doe" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Cancel Invitation"
        description={`Are you sure you want to cancel the invitation for "${deleteTarget?.email}"? They will not be able to join using this invitation.`}
        confirmLabel="Cancel Invitation"
        variant="destructive"
        onConfirm={handleDeleteInvite}
        loading={isDeleting}
      />
    </div>
  );
}

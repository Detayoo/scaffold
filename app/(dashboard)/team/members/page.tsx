"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { FormField } from "@/components/FormField";
import { StatusBadge } from "@/components/StatusBadge";
import { getMembersFn, getInvitesFn, createInviteFn, deleteInviteFn, resendInviteFn } from "@/services";
import { toastMessage, extractError, formatDate } from "@/utils";
import { inviteSchema } from "@/utils/validators";
import { withSuspense } from "@/components/withSuspense";
import type { TeamMember, Invite } from "@/types";

type InviteForm = z.infer<typeof inviteSchema>;

const tabs = [
  { id: "members", label: "Members" },
  { id: "invites", label: "Invites" },
];

function TeamContent() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "members" });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invite | null>(null);
  const [resendTarget, setResendTarget] = useState<Invite | null>(null);

  const memberQuery = useQuery({
    queryKey: ["team-members"],
    queryFn: () => getMembersFn(),
  });

  const inviteQuery = useQuery({
    queryKey: ["team-invites"],
    queryFn: () => getInvitesFn(),
  });

  const { mutateAsync: createInvite, isPending: isCreating } = useMutation({
    mutationFn: createInviteFn,
  });

  const { mutateAsync: removeInvite, isPending: isDeleting } = useMutation({
    mutationFn: (reference: string) => deleteInviteFn(reference),
  });

  const { mutateAsync: resendInvite, isPending: isResending } = useMutation({
    mutationFn: (id: string) => resendInviteFn(id),
    onSuccess: () => {
      toastMessage("success", "Invitation resent");
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "" },
  });

  const handleCreateInvite = async (formData: InviteForm) => {
    try {
      await createInvite({ email: formData.email, role: formData.role });
      toastMessage("success", "Invitation sent");
      setModalOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const handleDeleteInvite = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInviteFn(deleteTarget.id);
      toastMessage("success", "Invitation cancelled");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const members = memberQuery.data?.data;
  const invites = inviteQuery.data?.data;

  const memberColumns: Column<TeamMember>[] = [
    {
      key: "name", header: "Name",
      cell: (m: TeamMember) => <span className="text-sm text-foreground">{m.name}</span>,
    },
    {
      key: "email", header: "Email",
      cell: (m: TeamMember) => <span className="text-sm text-muted-foreground">{m.email}</span>,
    },
    { key: "role", header: "Role", cell: (m: TeamMember) => <span className="text-sm capitalize">{m.role}</span> },
    { key: "status", header: "Status", cell: (m: TeamMember) => <StatusBadge status={m.status} size="sm" /> },
  ];

  const inviteColumns: Column<Invite>[] = [
    {
      key: "email", header: "Email",
      cell: (i: Invite) => <span className="text-sm text-foreground">{i.email}</span>,
    },
    { key: "role", header: "Role", cell: (i: Invite) => <span className="text-sm capitalize">{i.role}</span> },
    { key: "status", header: "Status", cell: (i: Invite) => <StatusBadge status={i.status} size="sm" /> },
    {
      key: "created_at", header: "Date",
      cell: (i: Invite) => <span className="text-xs text-muted-foreground">{i.created_at ? formatDate(i.created_at) : "—"}</span>,
    },
    {
      key: "actions", header: "", className: "w-20",
      cell: (i: Invite) => (
        <div className="flex gap-2">
          {i.status === "pending" && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setResendTarget(i); }} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              Resend
            </button>
          )}
          <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(i); }} className="cursor-pointer">
            <X className="size-3.5 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Team" description="Manage team members and invitations" />
        <Button onClick={() => setModalOpen(true)}>
          <Plus /> Invite Member
        </Button>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`px-4 pb-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <div className="space-y-4">
          <DataTable
            columns={memberColumns}
            data={members}
            isPending={memberQuery.isFetching}
            isError={memberQuery.isError}
            onRetry={memberQuery.refetch}
            emptyTitle="No team members"
            emptyDescription="Invite team members to collaborate"
            errorMessage="Failed to load members"
          />
        </div>
      )}

      {tab === "invites" && (
        <div className="space-y-4">
          <DataTable
            columns={inviteColumns}
            data={invites}
            isPending={inviteQuery.isFetching}
            isError={inviteQuery.isError}
            onRetry={inviteQuery.refetch}
            emptyTitle="No pending invitations"
            emptyDescription="Invite team members to collaborate"
            emptyAction={{ label: "Invite Member", onClick: () => setModalOpen(true) }}
            errorMessage="Failed to load invitations"
          />
          <ConfirmDialog
            open={!!deleteTarget}
            onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
            title="Revoke Invitation"
            description={`Are you sure you want to revoke the invitation for "${deleteTarget?.email}"? This cannot be undone.`}
            confirmLabel="Revoke"
            variant="destructive"
            onConfirm={handleDeleteInvite}
            loading={isDeleting}
          />
          <ConfirmDialog
            open={!!resendTarget}
            onOpenChange={(o) => { if (!o) setResendTarget(null); }}
            title="Resend Invitation"
            description={`Resend the invitation to "${resendTarget?.email}"?`}
            confirmLabel="Resend"
            variant="default"
            onConfirm={async () => {
              try { if (resendTarget) await resendInvite(resendTarget.id); } catch {}
              setResendTarget(null);
            }}
            loading={isResending}
          />
        </div>
      )}

      <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen} title="Invite Member" description="Send an invitation to join your team">
        <form onSubmit={form.handleSubmit(handleCreateInvite)} className="space-y-4 pt-2">
          <FormField label="Email" error={form.formState.errors.email?.message} isRequired>
            <Input {...form.register("email")} placeholder="email@example.com" />
          </FormField>
          <FormField label="Role" error={form.formState.errors.role?.message} isRequired>
            <Select value={form.watch("role")} onValueChange={(v) => form.setValue("role", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); form.reset(); }}>Cancel</Button>
            <Button type="submit" disabled={isCreating}>{isCreating ? "Sending..." : "Send Invitation"}</Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
}

export default withSuspense(TeamContent);

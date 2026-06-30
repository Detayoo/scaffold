"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ban, CheckCircle, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statusColumn, dateColumn, actionsColumn } from "@/components/ColumnHelpers";
import { DataTable, type Column } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { FormField } from "@/components/FormField";
import { StatusBadge } from "@/components/StatusBadge";
import { getMembersFn, suspendMemberFn, getInvitesFn, createInviteFn, deleteInviteFn } from "@/services";
import { toastMessage, extractError, formatDate } from "@/utils";
import { inviteSchema } from "@/utils/validators";
import { withSuspense } from "@/components/withSuspense";
import type { Member, Invite } from "@/types";

type InviteForm = z.infer<typeof inviteSchema>;

const tabs = [
  { id: "members", label: "Members" },
  { id: "invites", label: "Invites" },
];

function TeamContent() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useQueryState("tab", { defaultValue: "members" });
  const [memberPage, setMemberPage] = useQueryState("mpage", parseAsInteger.withDefault(0));
  const [memberSize, setMemberSize] = useQueryState("msize", parseAsInteger.withDefault(10));
  const [invitePage, setInvitePage] = useQueryState("ipage", parseAsInteger.withDefault(0));
  const [inviteSize, setInviteSize] = useQueryState("isize", parseAsInteger.withDefault(10));
  const [suspendTarget, setSuspendTarget] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invite | null>(null);

  const memberQuery = useQuery({
    queryKey: ["team-members", memberPage + 1, memberSize],
    queryFn: () => getMembersFn({ page: memberPage + 1, size: memberSize }),
  });

  const inviteQuery = useQuery({
    queryKey: ["team-invites", invitePage + 1, inviteSize],
    queryFn: () => getInvitesFn({ page: invitePage + 1, size: inviteSize }),
  });

  const { mutateAsync: toggleSuspend, isPending: suspending } = useMutation({
    mutationFn: (payload: { id: string; status: "SUSPENDED" | "ENABLED" }) => suspendMemberFn(payload),
  });

  const { mutateAsync: createInvite, isPending: isCreating } = useMutation({
    mutationFn: createInviteFn,
  });

  const { mutateAsync: removeInvite, isPending: isDeleting } = useMutation({
    mutationFn: (reference: string) => deleteInviteFn(reference),
  });

  const handleToggleSuspend = async () => {
    if (!suspendTarget) return;
    const newStatus = suspendTarget.status === "SUSPENDED" ? "ENABLED" : "SUSPENDED";
    try {
      await toggleSuspend({ id: suspendTarget.id, status: newStatus });
      toastMessage("success", newStatus === "SUSPENDED" ? "Member suspended" : "Member enabled");
      setSuspendTarget(null);
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", firstName: "", lastName: "" },
  });

  const handleCreateInvite = async (formData: InviteForm) => {
    try {
      await createInvite(formData);
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
      await removeInvite(deleteTarget.id);
      toastMessage("success", "Invitation cancelled");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const members = memberQuery.data?.data?.members;
  const memberTotalRecords = memberQuery.data?.data?.totalRecords;
  const memberTotalPages = memberQuery.data?.data?.totalPages;
  const invites = inviteQuery.data?.data?.invites;
  const inviteTotalRecords = inviteQuery.data?.data?.totalRecords;
  const inviteTotalPages = inviteQuery.data?.data?.totalPages;

  const memberColumns: Column<Member>[] = [
    {
      key: "name", header: "Name",
      cell: (m: Member) => <span className="text-sm text-foreground">{m.firstName} {m.lastName}</span>,
    },
    {
      key: "email", header: "Email",
      cell: (m: Member) => <span className="text-sm text-muted-foreground">{m.email}</span>,
    },
    { key: "role", header: "Role", cell: (m: Member) => <span className="text-sm">{m.role}</span> },
    statusColumn((m: Member) => m.status),
    actionsColumn((m: Member) => (
      <button type="button" onClick={(e) => { e.stopPropagation(); setSuspendTarget(m); }} className="cursor-pointer">
        {m.status === "SUSPENDED" ? <CheckCircle className="size-3.5" /> : <Ban className="size-3.5 text-destructive" />}
      </button>
    )),
  ];

  const inviteColumns: Column<Invite>[] = [
    {
      key: "email", header: "Email",
      cell: (i: Invite) => <span className="text-sm text-foreground">{i.email}</span>,
    },
    {
      key: "name", header: "Name",
      cell: (i: Invite) => <span className="text-sm text-muted-foreground">{i.firstName} {i.lastName}</span>,
    },
    statusColumn((i: Invite) => i.status),
    dateColumn((i: Invite) => i.createdAt),
    actionsColumn((i: Invite) => (
      <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(i); }} className="cursor-pointer">
        <X className="size-3.5 text-destructive" />
      </button>
    )),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Team" description="Manage team members and invitations" />

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
            pageCount={memberTotalPages}
            currentPage={memberPage}
            perPage={memberSize}
            totalRecords={memberTotalRecords}
            itemOffset={memberPage * memberSize}
            onPageChange={(selected) => setMemberPage(selected)}
            onPerPageChange={(newSize) => { setMemberSize(newSize); setMemberPage(0); }}
          />
          <ConfirmDialog
            open={!!suspendTarget}
            onOpenChange={(o) => { if (!o) setSuspendTarget(null); }}
            title={suspendTarget?.status === "SUSPENDED" ? "Enable Member" : "Suspend Member"}
            description={`Are you sure you want to ${suspendTarget?.status === "SUSPENDED" ? "enable" : "suspend"} "${suspendTarget?.firstName} ${suspendTarget?.lastName}"?`}
            confirmLabel={suspendTarget?.status === "SUSPENDED" ? "Enable" : "Suspend"}
            variant={suspendTarget?.status === "SUSPENDED" ? "default" : "destructive"}
            onConfirm={handleToggleSuspend}
            loading={suspending}
          />
        </div>
      )}

      {tab === "invites" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setModalOpen(true)}>
              <Plus /> Invite Member
            </Button>
          </div>
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
            pageCount={inviteTotalPages}
            currentPage={invitePage}
            perPage={inviteSize}
            totalRecords={inviteTotalRecords}
            itemOffset={invitePage * inviteSize}
            onPageChange={(selected) => setInvitePage(selected)}
            onPerPageChange={(newSize) => { setInviteSize(newSize); setInvitePage(0); }}
          />
          <ConfirmDialog
            open={!!deleteTarget}
            onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
            title="Cancel Invitation"
            description={`Cancel invitation for "${deleteTarget?.email}"?`}
            confirmLabel="Cancel Invitation"
            variant="destructive"
            onConfirm={handleDeleteInvite}
            loading={isDeleting}
          />
        </div>
      )}

      <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen} title="Invite Member" description="Send an invitation to join your team">
        <form onSubmit={form.handleSubmit(handleCreateInvite)} className="space-y-4 pt-2">
          <FormField label="Email" error={form.formState.errors.email?.message} isRequired>
            <Input {...form.register("email")} placeholder="email@example.com" />
          </FormField>
          <FormField label="First Name" error={form.formState.errors.firstName?.message} isRequired>
            <Input {...form.register("firstName")} placeholder="John" />
          </FormField>
          <FormField label="Last Name" error={form.formState.errors.lastName?.message} isRequired>
            <Input {...form.register("lastName")} placeholder="Doe" />
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

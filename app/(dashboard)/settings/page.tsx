"use client";

import { useState, useEffect, Suspense } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Copy,
  Key,
  Plus,
  Trash2,
  User,
  Lock,
  Globe,
  Percent,
  Webhook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailRow } from "@/components/DetailRow";
import { FormField } from "@/components/FormField";
import { PasswordField } from "@/components/TextField";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { useMerchant } from "@/hooks/use-merchant";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import {
  getKeysFn,
  generateMerchantKeyFn,
  setupWebhookFn,
  changePasswordFn,
} from "@/services";
import { getTaxesFn, createTaxFn, deleteTaxFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import { changePasswordSchema, createTaxSchema } from "@/utils/validators";
import type { Column } from "@/components/DataTable";
import type { Tax } from "@/types";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "keys", label: "API Keys", icon: Key },
  { id: "webhook", label: "Webhook", icon: Webhook },
  { id: "taxes", label: "Taxes", icon: Percent },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, security, and preferences" />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar nav */}
        <nav className="flex shrink-0 flex-col gap-1 lg:w-48">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left ${
                  active
                    ? "bg-foreground/5 font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <t.icon className="size-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === "profile" && <ProfileSection />}
          {tab === "security" && <SecuritySection />}
          {tab === "keys" && <APIKeysSection />}
          {tab === "webhook" && <WebhookSection />}
          {tab === "taxes" && <TaxesSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { data, isPending, isError, refetch, error } = useMerchant();
  const merchant = data?.data?.merchant;
  const owner = data?.data?.owner;

  return (
    <div className="space-y-5">
      <SectionHeader title="Profile" description="Your business and owner information" />
      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load profile">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-muted-foreground" />
            Merchant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <DetailRow label="Business Name" value={merchant?.name} />
          <DetailRow label="Email" value={merchant?.email} />
          <DetailRow label="Account Number" value={merchant?.accountNumber ?? "—"} mono />
          <DetailRow label="Address" value={merchant?.address} />
          <DetailRow label="Status" value={<StatusBadge status={merchant?.status ?? ""} />} />
          <DetailRow label="Slug" value={merchant?.slug} mono />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-muted-foreground" />
            Owner Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <DetailRow label="First Name" value={owner?.firstName} />
          <DetailRow label="Last Name" value={owner?.lastName} />
          <DetailRow label="Email" value={owner?.email} />
          <DetailRow label="Role" value={owner?.role} capitalize />
          <DetailRow label="Verified" value={owner?.isVerified ? "Yes" : "No"} />
        </CardContent>
      </Card>
      </AsyncContent>
    </div>
  );
}

function SecuritySection() {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const { mutateAsync: changePassword, isPending } = useMutation({
    mutationFn: changePasswordFn,
  });

  const newPassword = form.watch("newPassword") ?? "";
  const strength = newPassword.length < 6 ? 0 : newPassword.length < 10 ? 1 : 2;
  const strengthLabel = ["Weak", "Medium", "Strong"][strength];

  const onSubmit = async (data: any) => {
    try {
      await changePassword({ oldPassword: data.oldPassword, password: data.password });
      toastMessage("success", "Password changed");
      form.reset();
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Security" description="Manage your password and account security" />

      <div className="rounded-xl border bg-card">
        <div className="border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground/5">
              <Lock className="size-4 text-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium">Change Password</p>
              <p className="text-xs text-muted-foreground">Choose a strong password you don&apos;t use elsewhere</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5">
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Current Password" error={form.formState.errors.oldPassword?.message as string} isRequired>
                  <PasswordField {...form.register("oldPassword")} placeholder="Enter current password" />
                </FormField>
              </div>

              <FormField label="New Password" error={form.formState.errors.newPassword?.message as string} isRequired>
                <PasswordField {...form.register("newPassword")} placeholder="At least 6 characters" />
              </FormField>

              <FormField label="Confirm Password" error={form.formState.errors.password?.message as string} isRequired>
                <PasswordField {...form.register("password")} placeholder="Re-enter new password" />
              </FormField>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-1.5 w-24 gap-1 overflow-hidden rounded-full bg-muted">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        i <= strength
                          ? i === 0 ? "bg-destructive" : i === 1 ? "bg-warning" : "bg-success"
                          : "bg-muted-foreground/10"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs ${
                  strength === 0 ? "text-destructive" : strength === 1 ? "text-warning" : "text-success"
                }`}>
                  {strengthLabel}
                </span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 rounded-lg bg-foreground/[0.02] px-4 py-3 text-xs text-muted-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[10px] font-medium">i</span>
              Use a unique password with at least 6 characters, mixing letters, numbers, and symbols.
            </div>

            <Button type="submit" disabled={isPending || !form.formState.isValid} className="mt-5 w-full sm:w-auto">
              {isPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function APIKeysSection() {
  const { data, isFetching, isError, refetch, error } = useQuery({
    queryKey: ["merchant-keys"],
    queryFn: getKeysFn,
  });
  const errorCode = (error as any)?.status;
  const copy = useCopyToClipboard();
  const [showPK, setShowPK] = useState(false);
  const [showSK, setShowSK] = useState(false);

  const { mutateAsync: generateKeys, isPending: generating } = useMutation({
    mutationFn: generateMerchantKeyFn,
    onSuccess: () => { toastMessage("success", "New keys generated"); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCopy = async (text: string, label: string) => {
    const ok = await copy(text);
    toastMessage(ok ? "success" : "error", ok ? `${label} copied` : "Copy failed");
  };

  const { public: pub, secret } = data?.data ?? {};

  return (
    <div className="space-y-5">
      <SectionHeader title="API Keys" description="Manage your public and secret API keys" />
      <AsyncContent isPending={isFetching} isError={isError} onRetry={refetch} errorMessage="Failed to load API keys">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="size-4 text-muted-foreground" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Public Key", value: pub, show: showPK, toggle: () => setShowPK(!showPK) },
            { label: "Secret Key", value: secret, show: showSK, toggle: () => setShowSK(!showSK) },
          ].map((k, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={k.show ? "text" : "password"}
                    value={k.value ?? ""}
                    readOnly
                    className="pr-16 font-mono text-xs"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button type="button" onClick={k.toggle} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {k.show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                    {k.value && (
                      <button type="button" onClick={() => handleCopy(k.value!, k.label)} className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <Copy className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={() => generateKeys()} disabled={generating}>
            <Key className="size-3.5" />
            {generating ? "Generating..." : "Generate New Keys"}
          </Button>
        </CardContent>
      </Card>
      </AsyncContent>
    </div>
  );
}

function WebhookSection() {
  const merchantQuery = useMerchant();
  const form = useForm({ defaultValues: { url: "" } });
  const errorCode = (merchantQuery.error as any)?.status;

  useEffect(() => {
    if (merchantQuery.data?.data?.merchant?.webhookURL) {
      form.reset({ url: merchantQuery.data.data.merchant.webhookURL });
    }
  }, [merchantQuery.data]);

  const { mutateAsync: updateWebhook, isPending } = useMutation({
    mutationFn: setupWebhookFn,
    onSuccess: (data) => { toastMessage("success", data?.message ?? "Webhook updated"); merchantQuery.refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const onSubmit = async (values: { url: string }) => {
    try { await updateWebhook(values.url); } catch {}
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Webhook" description="Configure your webhook endpoint URL" />
      <AsyncContent isPending={merchantQuery.isPending} isError={merchantQuery.isError} onRetry={merchantQuery.refetch} errorMessage="Failed to load webhook">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Webhook className="size-4 text-muted-foreground" />
          Webhook URL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-sm space-y-3">
          <FormField label="URL" error={form.formState.errors.url?.message}>
            <Input {...form.register("url")} placeholder="https://example.com/webhook" />
          </FormField>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Update Webhook"}
          </Button>
        </form>
      </CardContent>
    </Card>
      </AsyncContent>
    </div>
  );
}

function TaxesSection() {
  const queryClient = useQueryClient();
  const [page, setPage] = useQueryState("taxPage", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("taxSize", parseAsInteger.withDefault(10));
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["taxes", page + 1, size],
    queryFn: () => getTaxesFn({ page: page + 1, size }),
  });

  const form = useForm({ resolver: zodResolver(createTaxSchema) });

  const { mutateAsync: createTax, isPending: creating } = useMutation({
    mutationFn: createTaxFn,
    onSuccess: () => { toastMessage("success", "Tax created"); setModalOpen(false); form.reset(); queryClient.invalidateQueries({ queryKey: ["taxes"] }); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: removeTax, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteTaxFn(id),
    onSuccess: () => { toastMessage("success", "Tax deleted"); setDeleteTarget(null); queryClient.invalidateQueries({ queryKey: ["taxes"] }); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const columns: Column<Tax>[] = [
    { key: "name", header: "Name", cell: (t) => <span className="font-medium">{t.name}</span> },
    { key: "rate", header: "Rate", cell: (t) => <span>{t.rate}%</span> },
    { key: "date", header: "Created", cell: (t) => <span className="text-muted-foreground text-xs">{new Date(t.createdAt).toLocaleDateString()}</span> },
    {
      key: "actions", header: "", className: "w-10",
      cell: (t) => (
        <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(t.id); }} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
          <Trash2 className="size-3.5" />
        </button>
      ),
    },
  ];

  const taxes = data?.data?.taxes;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Taxes"
        description="Manage tax rates applied to invoices"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-3.5" />
            Add Tax
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={taxes}
        isPending={isFetching}
        isError={isError}
        onRetry={refetch}
        errorMessage="Failed to load taxes"
        emptyTitle="No taxes configured"
        emptyDescription="Add a tax rate to apply to your invoices"
        emptyAction={{ label: "Add Tax", onClick: () => setModalOpen(true) }}
        pageCount={data?.data?.totalPages}
        currentPage={page}
        perPage={size}
        totalRecords={data?.data?.totalRecords}
        itemOffset={page * size}
        onPageChange={(s) => setPage(s)}
        onPerPageChange={(s) => { setSize(s); setPage(0); }}
        isFetching={isFetching}
      />

      <ResponsiveModal open={modalOpen} onOpenChange={setModalOpen} title="Add Tax" description="Create a new tax rate">
        <form onSubmit={form.handleSubmit((v) => createTax({ name: v.name, rate: parseFloat(v.rate) }))} className="space-y-4 pt-2">
          <FormField label="Name" error={form.formState.errors.name?.message} isRequired>
            <Input {...form.register("name")} placeholder="e.g. VAT" />
          </FormField>
          <FormField label="Rate (%)" error={form.formState.errors.rate?.message} isRequired>
            <Input {...form.register("rate")} placeholder="e.g. 7.5" type="number" step="0.1" />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); form.reset(); }}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Tax"}</Button>
          </div>
        </form>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Delete Tax"
        description="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && removeTax(deleteTarget)}
        loading={deleting}
      />
    </div>
  );
}

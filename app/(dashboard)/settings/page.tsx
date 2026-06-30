"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Copy,
  Key,
  Plus,
  Trash2,
  User,
  Lock,
  Percent,
  Webhook,
  List,
  Pause,
  Play,
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
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMerchant } from "@/hooks/use-merchant";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
   import {
  getKeysFn,
  createKeyFn,
  revokeKeyFn,
  rotateKeyFn,
  getWebhookEndpointsFn,
  createWebhookEndpointFn,
  pauseWebhookEndpointFn,
  resumeWebhookEndpointFn,
  getWebhookDeliveriesFn,
  getWebhookDeliveryDetailFn,
  replayWebhookDeliveryFn,
  replayWebhookEventFn,
  changePasswordFn,
} from "@/services";
import { getTaxesFn, createTaxFn, deleteTaxFn, getCollectionOptionsFn, toggleCollectionChannelFn } from "@/services";
import { toastMessage, extractError, formatDate } from "@/utils";
import { changePasswordSchema, createTaxSchema } from "@/utils/validators";
import type { Column } from "@/components/DataTable";
import type { Tax, WebhookEndpoint, WebhookDelivery, WebhookDeliveryDetail } from "@/types";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "keys", label: "API Keys", icon: Key },
  { id: "webhook", label: "Webhook", icon: Webhook },
  // { id: "taxes", label: "Taxes", icon: Percent },
  { id: "channels", label: "Channels", icon: List },
];

export default function SettingsPage() {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "profile" });

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
          {/* {tab === "taxes" && <TaxesSection />} */}
          {tab === "channels" && <ChannelsSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { data, isPending, isError, refetch, error } = useMerchant();
  const merchant = data?.data?.merchant;
  const user = data?.data?.user;

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
          <DetailRow label="Business Name" value={merchant?.display_name} />
          <DetailRow label="Legal Name" value={merchant?.legal_name} />
          <DetailRow label="Email" value={merchant?.email} />
          <DetailRow label="Status" value={<StatusBadge status={merchant?.status ?? ""} />} />
          <DetailRow label="Risk Tier" value={merchant?.risk_tier ? merchant.risk_tier.charAt(0).toUpperCase() + merchant.risk_tier.slice(1) : "—"} />
          <DetailRow label="Default Currency" value={merchant?.default_currency} />
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
          <DetailRow label="Name" value={user?.name} />
          <DetailRow label="Email" value={user?.email} />
          <DetailRow label="Role" value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—"} />
          <DetailRow label="Status" value={<StatusBadge status={user?.status ?? ""} />} />
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
      await changePassword({ currentPassword: data.oldPassword, newPassword: data.newPassword });
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
    queryFn: () => getKeysFn({}),
  });
  const errorCode = (error as any)?.status;
  const copy = useCopyToClipboard();
  const [showPK, setShowPK] = useState(false);
  const [showSK, setShowSK] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeys, setNewKeys] = useState<{ publicKey: string; secretKey: string } | null>(null);

  const { mutateAsync: generateKeys, isPending: generating } = useMutation({
    mutationFn: createKeyFn,
    onSuccess: (res) => {
      setNewKeys(res?.data ?? null);
      setCreating(false);
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: revokeKey, isPending: revoking } = useMutation({
    mutationFn: revokeKeyFn,
    onSuccess: () => {
      toastMessage("success", "Key revoked");
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: rotateKey, isPending: rotating } = useMutation({
    mutationFn: rotateKeyFn,
    onSuccess: () => {
      toastMessage("success", "Key rotated");
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCopy = async (text: string, label: string) => {
    const ok = await copy(text);
    toastMessage(ok ? "success" : "error", ok ? `${label} copied` : "Copy failed");
  };

  const keys = data?.data ?? [];

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
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet. Create one to get started.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {k.environment === "test" ? "Test" : "Live"} — {k.type === "public" ? "Public" : "Secret"}
                      <span className="ml-2 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize"
                        data-status={k.status}
                      >
                        {k.status}
                      </span>
                    </p>
                    {k.status === "active" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => rotateKey({ id: k.id })}
                          disabled={rotating}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          Rotate
                        </button>
                        <button
                          type="button"
                          onClick={() => revokeKey({ id: k.id })}
                          disabled={revoking}
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPK ? "text" : "password"}
                        value={k.maskedKey}
                        readOnly
                        className="pr-9 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(k.maskedKey, `${k.environment} ${k.type} key`)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {newKeys && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <p className="text-xs font-medium">Latest generated keys</p>
              {[
                { label: "Public Key", value: newKeys.publicKey },
                { label: "Secret Key", value: newKeys.secretKey },
              ].map((nk) => (
                <div key={nk.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{nk.label}</p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input value={nk.value} readOnly className="pr-9 text-sm font-mono text-xs" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(nk.value, nk.label)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <Button variant="outline" onClick={() => generateKeys()} disabled={generating}>
              <Key className="size-3.5" />
              {generating ? "Generating..." : "Generate API Keys"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </AsyncContent>
    </div>
  );
}

function WebhookSection() {
  const copy = useCopyToClipboard();
  const [showCreate, setShowCreate] = useState(false);
  const [logsEndpoint, setLogsEndpoint] = useState<WebhookEndpoint | null>(null);
  const [logs, setLogs] = useState<WebhookDelivery[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookDelivery | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<WebhookDeliveryDetail | null>(null);

  const { data: endpointsData, isPending, isError, refetch } = useQuery({
    queryKey: ["webhook-endpoints"],
    queryFn: () => getWebhookEndpointsFn(),
  });
  const endpoints = endpointsData?.data ?? [];

  const createSchema = z.object({
    url: z.string().nonempty("URL is required"),
    environment: z.string().nonempty("Environment is required"),
  });

  const createForm = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { url: "", environment: "" },
  });

  const { mutateAsync: createEndpoint, isPending: creating } = useMutation({
    mutationFn: createWebhookEndpointFn,
    onSuccess: () => {
      toastMessage("success", "Webhook endpoint created");
      setShowCreate(false);
      createForm.reset();
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: pauseEndpoint } = useMutation({
    mutationFn: pauseWebhookEndpointFn,
    onSuccess: () => {
      toastMessage("success", "Endpoint paused");
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: resumeEndpoint } = useMutation({
    mutationFn: resumeWebhookEndpointFn,
    onSuccess: () => {
      toastMessage("success", "Endpoint resumed");
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const fetchLogs = useCallback(async (endpointId: string) => {
    setLogsLoading(true);
    try {
      const res = await getWebhookDeliveriesFn({ endpointId });
      setLogs(res?.data ?? []);
    } catch { } finally {
      setLogsLoading(false);
    }
  }, []);

  const { mutateAsync: replayDelivery } = useMutation({
    mutationFn: replayWebhookDeliveryFn,
    onSuccess: (res) => {
      toastMessage("success", "Replay queued");
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: replayEvent } = useMutation({
    mutationFn: replayWebhookEventFn,
    onSuccess: (res) => {
      toastMessage("success", "Event replay queued");
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const reloadDeliveryDetail = async () => {
    if (!selectedLog) return;
    try {
      const res = await getWebhookDeliveryDetailFn({ id: selectedLog?.id ?? "" });
      setDetailData(res?.data ?? null);
    } catch {}
  };

  const handleCreateEndpoint = createForm.handleSubmit(async (vals) => {
    try {
      await createEndpoint({ url: vals.url, environment: vals.environment });
    } catch {}
  });

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Webhook"
        description="Configure and manage your webhook endpoints"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="size-3.5" />
            Add Endpoint
          </Button>
        }
      />

      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load webhook endpoints">
      {endpoints.length === 0 ? (
        <EmptyState
          title="No webhook endpoints"
          description="Add an endpoint to start receiving payment events"
          action={{ label: "Add Endpoint", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <Card key={ep?.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ep?.status} size="sm" />
                      <span className="text-xs text-muted-foreground capitalize">{ep?.environment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate">{ep?.url}</p>
                      <button type="button" onClick={async () => { const ok = await copy(ep?.url ?? ""); toastMessage(ok ? "success" : "error", ok ? "URL copied" : "Copy failed"); }} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                    {ep?.eventFilter && ep.eventFilter.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Filter: {ep.eventFilter.join(", ")}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Secret: {ep?.secretRef ?? "—"}
                      </p>
                      {ep?.secretRef && (
                        <button type="button" onClick={async () => { const ok = await copy(ep?.secretRef ?? ""); toastMessage(ok ? "success" : "error", ok ? "Secret copied" : "Copy failed"); }} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                          <Copy className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setLogsEndpoint(ep);
                        fetchLogs(ep?.id ?? "");
                      }}
                    >
                      <List className="size-3.5" />
                    </Button>
                    {ep?.status === "active" ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => pauseEndpoint({ id: ep?.id ?? "" })}
                      >
                        <Pause className="size-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => resumeEndpoint({ id: ep?.id ?? "" })}
                      >
                        <Play className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </AsyncContent>

      <ResponsiveSheet
        open={!!logsEndpoint}
        onOpenChange={(open) => { if (!open) setLogsEndpoint(null); }}
        title="Delivery Logs"
        description={logsEndpoint?.url ?? ""}
      >
        <AsyncContent isPending={logsLoading} isError={false} errorMessage="Failed to load deliveries">
        {logs.length === 0 ? (
          <EmptyState title="No deliveries yet" description="Deliveries will appear here when events are sent" />
        ) : (
          <div className="space-y-2 pt-2">
            {logs.map((d) => (
              <Card key={d?.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={async () => {
                setSelectedLog(d);
                setDetailLoading(true);
                try {
                  const res = await getWebhookDeliveryDetailFn({ id: d?.id ?? "" });
                  setDetailData(res?.data ?? null);
                } catch {} finally {
                  setDetailLoading(false);
                }
              }}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={d?.status} size="sm" />
                    <span className="text-xs text-muted-foreground">{d?.attempts} attempt(s)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{d?.eventId}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {d?.responseStatus ? `HTTP ${d.responseStatus}` : "—"}
                    </span>
                    {d?.replayAvailable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          replayDelivery({ id: d?.id ?? "" });
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        Replay
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </AsyncContent>
      </ResponsiveSheet>

      <ResponsiveSheet
        open={!!selectedLog}
        onOpenChange={(open) => { if (!open) { setSelectedLog(null); setDetailData(null); } }}
        title="Delivery Detail"
      >
        <AsyncContent isPending={detailLoading} isError={!detailData} onRetry={reloadDeliveryDetail} errorMessage="Failed to load delivery detail">
          {detailData ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={detailData?.status ?? ""} size="sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attempt</p>
                <p className="text-sm font-medium">#{detailData?.attemptNo}</p>
              </div>
              {detailData?.responseCode && (
                <div>
                  <p className="text-xs text-muted-foreground">Response</p>
                  <p className="text-sm font-medium">HTTP {detailData.responseCode}</p>
                </div>
              )}
              {detailData?.lastAttemptAt && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Last Attempt</p>
                  <p className="text-sm">{detailData.lastAttemptAt}</p>
                </div>
              )}
              {detailData?.nextRetryAt && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Next Retry</p>
                  <p className="text-sm">{detailData.nextRetryAt}</p>
                </div>
              )}
            </div>

            {detailData?.signatureHeaders && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Signature Headers</p>
                <div className="rounded-lg bg-muted p-3 space-y-1">
                  {Object.entries(detailData.signatureHeaders).map(([key, val]) => (
                    <p key={key} className="text-xs font-mono break-all">
                      <span className="text-muted-foreground">{key}: </span>
                      {val}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {detailData.requestBody && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Request Body</p>
                <pre className="rounded-lg bg-muted p-3 text-xs font-mono break-all whitespace-pre-wrap">
                  {detailData.requestBody}
                </pre>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => replayDelivery({ id: selectedLog?.id ?? "" })}>
                Replay Delivery
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => replayEvent({ id: selectedLog?.eventId ?? "" })}>
                Replay Event
              </Button>
            </div>
          </div>
          ) : null}
        </AsyncContent>
      </ResponsiveSheet>

      <ResponsiveModal
        open={showCreate}
        onOpenChange={setShowCreate}
        title="Add Webhook Endpoint"
        description="Create a new endpoint to receive payment events"
      >
        <form onSubmit={handleCreateEndpoint} className="space-y-4 pt-2">
          <FormField label="URL" error={createForm.formState.errors.url?.message} isRequired>
            <Input {...createForm.register("url")} placeholder="https://example.com/webhooks/malimbe" />
          </FormField>
          <FormField label="Environment" error={createForm.formState.errors.environment?.message} isRequired>
            <Select
              value={createForm.watch("environment")}
              onValueChange={(v: "test" | "live") => createForm.setValue("environment", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Endpoint"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
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

  const handleCreateTax = form.handleSubmit(async ({ name, rate }) => {
    try {
      await createTax({ name, rate });
    } catch {}
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
        <form onSubmit={handleCreateTax} className="space-y-4 pt-2">
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
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Delete Tax Rate"
        description="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && removeTax(deleteTarget)}
        loading={deleting}
      />
    </div>
  );
}

function ChannelsSection() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["collection-options"],
    queryFn: () => getCollectionOptionsFn(),
  });

  const { mutateAsync: toggleChannel, isPending: toggling } = useMutation({
    mutationFn: toggleCollectionChannelFn,
    onSuccess: () => {
      toastMessage("success", "Channel updated");
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const channels = data?.data;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Channels"
        description="Enable or disable payment collection channels"
      />

      <AsyncContent isPending={isFetching} isError={isError} onRetry={refetch} errorMessage="Failed to load channels">
        {channels && channels.length > 0 ? (
          <div className="space-y-3">
            {channels.map((ch: any) => (
              <div key={ch?.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground capitalize">{ch?.channel?.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground capitalize">({ch?.environment})</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{ch?.createdAt ? formatDate(ch?.createdAt) : ""}</p>
                </div>
                <button
                  type="button"
                  disabled={toggling}
                  onClick={async () => {
                    try {
                      await toggleChannel({ channel: ch.channel, enabled: !ch.enabled });
                    } catch {}
                  }}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${
                    ch?.enabled ? "bg-foreground" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block size-5 rounded-full bg-background transition-transform ${
                      ch?.enabled ? "translate-x-6.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No channels configured.</p>
        )}
      </AsyncContent>
    </div>
  );
}

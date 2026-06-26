"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Copy, Key, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/FormField";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { StatusBadge } from "@/components/StatusBadge";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
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

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings, API keys, and preferences
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhook">Webhook</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>
        <TabsContent value="api-keys">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="webhook">
          <WebhookTab />
        </TabsContent>
        <TabsContent value="taxes">
          <TaxesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab() {
  const { data, isFetching, isError } = useMerchant();

  if (isFetching) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState message="Failed to load merchant profile" />
        </CardContent>
      </Card>
    );
  }

  const merchant = data?.data?.merchant;
  const owner = data?.data?.owner;

  if (!merchant || !owner) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState message="Merchant profile not found" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Merchant Information</CardTitle>
          <CardDescription>Details about your business account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Business Name</p>
              <p className="text-sm font-medium text-foreground">
                {merchant.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Account Number</p>
              <p className="text-sm font-medium text-foreground">
                {merchant.accountNumber}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">
                {merchant.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={merchant.status} size="sm" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium text-foreground">
                {merchant.address ?? "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Slug</p>
              <p className="text-sm font-medium text-foreground">
                {merchant.slug}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner Information</CardTitle>
          <CardDescription>
            Details about the primary account owner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">
                {owner.firstName} {owner.lastName}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">
                {owner.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium text-foreground">
                {owner.role}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Verified</p>
              <StatusBadge
                status={owner.isVerified ? "active" : "inactive"}
                size="sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordTab() {

  const form = useForm<{
    oldPassword: string;
    newPassword: string;
    password: string;
  }>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      password: "",
    },
  });

  const { mutateAsync: changePassword, isPending } = useMutation({
    mutationFn: (data: { oldPassword: string; password: string }) =>
      changePasswordFn(data),
  });

  const onSubmit = async (data: {
    oldPassword: string;
    newPassword: string;
    password: string;
  }) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        password: data.newPassword,
      });
      toastMessage("success", "Password changed successfully");
      form.reset();
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your account password. Choose a strong password you haven&apos;t
          used before.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Current Password"
            error={form.formState.errors.oldPassword?.message}
            isRequired
          >
            <Input
              type="password"
              {...form.register("oldPassword")}
              placeholder="Enter current password"
            />
          </FormField>
          <FormField
            label="New Password"
            error={form.formState.errors.newPassword?.message}
            isRequired
          >
            <Input
              type="password"
              {...form.register("newPassword")}
              placeholder="Enter new password"
            />
          </FormField>
          <FormField
            label="Confirm New Password"
            error={form.formState.errors.password?.message}
            isRequired
          >
            <Input
              type="password"
              {...form.register("password")}
              placeholder="Confirm new password"
            />
          </FormField>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ApiKeysTab() {
  const copy = useCopyToClipboard();
  const [showSecret, setShowSecret] = useState(false);
  const [showPublic, setShowPublic] = useState(false);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["api-keys"],
    queryFn: getKeysFn,
  });

  const { mutateAsync: generateKeys, isPending: isGenerating } = useMutation({
    mutationFn: generateMerchantKeyFn,
  });

  const handleGenerate = async () => {
    try {
      await generateKeys();
      toastMessage("success", "New API keys generated successfully");
      refetch();
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const ok = await copy(text);
    if (ok) {
      toastMessage("success", `${label} copied to clipboard`);
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState message="Failed to load API keys" onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }

  const publicKey = data?.data?.public ?? "";
  const secretKey = data?.data?.secret ?? "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Your API keys are used to authenticate requests to the API. Keep
            your secret key secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <FormField label="Public Key">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={publicKey}
                    type={showPublic ? "text" : "password"}
                    readOnly
                    className="pr-9 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPublic(!showPublic)}
                  >
                    {showPublic ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleCopy(publicKey, "Public key")}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </FormField>
          </div>

          <div className="space-y-2">
            <FormField label="Secret Key">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={secretKey}
                    type={showSecret ? "text" : "password"}
                    readOnly
                    className="pr-9 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleCopy(secretKey, "Secret key")}
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </FormField>
          </div>

          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Key className="size-3.5" />
            {isGenerating ? "Generating..." : "Generate New Keys"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function WebhookTab() {
  const { data, isFetching, isError, refetch } = useMerchant();

  const form = useForm({
    defaultValues: {
      url: data?.data?.merchant?.webhookURL ?? "",
    },
    values: {
      url: data?.data?.merchant?.webhookURL ?? "",
    },
  });

  const { mutateAsync: setupWebhook, isPending } = useMutation({
    mutationFn: (url: string) => setupWebhookFn(url),
  });

  const onSubmit = async (formData: { url: string }) => {
    try {
      await setupWebhook(formData.url);
      toastMessage("success", "Webhook URL updated successfully");
      refetch();
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  if (isFetching) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ErrorState message="Failed to load webhook settings" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook</CardTitle>
        <CardDescription>
          Configure a webhook URL to receive real-time event notifications from
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Webhook URL"
            error={form.formState.errors.url?.message}
            isOptional
          >
            <Input
              {...form.register("url")}
              placeholder="https://example.com/webhook"
            />
          </FormField>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Webhook URL"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TaxesTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tax | null>(null);

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["taxes", page + 1, size],
    queryFn: () => getTaxesFn({ page: page + 1, size }),
  });

  const { mutateAsync: createTax, isPending: isCreating } = useMutation({
    mutationFn: (payload: { name: string; rate: number }) => createTaxFn(payload),
  });

  const { mutateAsync: removeTax, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteTaxFn(id),
  });

  const taxForm = useForm<{
    name: string;
    rate: string;
  }>({
    resolver: zodResolver(createTaxSchema),
    defaultValues: { name: "", rate: "" },
  });

  const handleCreateTax = async (formData: {
    name: string;
    rate: string;
  }) => {
    try {
      await createTax({ name: formData.name, rate: Number(formData.rate) });
      toastMessage("success", "Tax created successfully");
      setModalOpen(false);
      taxForm.reset();
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const handleDeleteTax = async () => {
    if (!deleteTarget) return;
    try {
      await removeTax(deleteTarget.id);
      toastMessage("success", "Tax deleted successfully");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const taxes = data?.data?.taxes;
  const totalRecords = data?.data?.totalRecords ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  const columns: Column<Tax>[] = [
    {
      key: "name",
      header: "Name",
      cell: (tax: Tax) => (
        <span className="font-medium text-foreground">{tax.name}</span>
      ),
    },
    {
      key: "rate",
      header: "Rate",
      cell: (tax: Tax) => <span>{tax.rate}%</span>,
    },
    {
      key: "createdAt",
      header: "Date Created",
      cell: (tax: Tax) => (
        <span className="text-muted-foreground">
          {new Date(tax.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (tax: Tax) => (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(tax);
          }}
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Tax Rates</h2>
          <p className="text-xs text-muted-foreground">
            Manage tax rates applied to your invoices
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="size-3.5" />
          Add Tax
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={taxes}
        isPending={isFetching}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No taxes yet"
        emptyDescription="Add a tax rate to apply to your invoices"
        emptyAction={{ label: "Add Tax", onClick: () => setModalOpen(true) }}
        errorMessage="Failed to load taxes"
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
        title="Add Tax"
        description="Create a new tax rate for your invoices"
      >
        <form
          onSubmit={taxForm.handleSubmit(handleCreateTax)}
          className="space-y-4 pt-2"
        >
          <FormField
            label="Tax Name"
            error={taxForm.formState.errors.name?.message}
            isRequired
          >
            <Input
              {...taxForm.register("name")}
              placeholder="e.g. VAT"
            />
          </FormField>
          <FormField
            label="Rate (%)"
            error={taxForm.formState.errors.rate?.message}
            isRequired
          >
            <Input
              {...taxForm.register("rate")}
              placeholder="e.g. 7.5"
              type="number"
              step="0.01"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                taxForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Tax"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Tax"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteTax}
        loading={isDeleting}
      />
    </div>
  );
}

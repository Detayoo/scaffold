"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion/dom";
import { Plus, Trash2, ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { SearchSelect } from "@/components/SearchSelect";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { createInvoiceSchema, createCustomerSchema } from "@/utils/validators";
import { getCustomersFn, createCustomerFn, getSingleInvoiceFn, updateInvoiceFn } from "@/services/queries/invoices";
import { getTaxesFn } from "@/services/queries/taxes";
import { toastMessage, extractError } from "@/utils";
import type { z } from "zod";

type InvoiceFormData = z.infer<typeof createInvoiceSchema>;
type CustomerFormData = z.infer<typeof createCustomerSchema>;

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

function UpdateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const id = searchParams.get("id");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: invoiceData, isPending: invoiceLoading, isError: invoiceError } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getSingleInvoiceFn(id!),
    enabled: !!id,
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomersFn,
  });

  const { data: taxesData } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => getTaxesFn({ page: 1, size: 100 }),
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoiceDate: "",
      dueDate: "",
      items: [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
      taxes: [],
      currency: "NGN",
      discount: "",
      notes: "",
      invoiceNumber: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" },
  });

  const createCustomerMutation = useMutation({
    mutationFn: createCustomerFn,
    onSuccess: () => {
      toastMessage("success", "Customer created successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCustomerModalOpen(false);
      customerForm.reset();
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: updateInvoiceFn,
    onSuccess: (res) => {
      toastMessage("success", res.message);
      router.push(`/invoices/${id}`);
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const invoice = invoiceData?.data?.invoice;

  useEffect(() => {
    if (!invoice) return;
    form.reset({
      invoiceDate: invoice.createdAt ? invoice.createdAt.split("T")[0] : "",
      dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
      items: invoice.items?.map((item: any) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) ?? [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
      taxes: invoice.taxes?.map((t: any) => ({ id: t.id, name: t.name, rate: t.rate })) ?? [],
      currency: invoice.currency ?? "NGN",
      discount: invoice.discount?.toString() ?? "",
      notes: invoice.notes ?? "",
      invoiceNumber: invoice.invoiceNumber ?? "",
    });
    setSelectedCustomerId(invoice.customerId ?? "");
  }, [invoice, form]);

  const customers = customersData?.data?.customers ?? [];
  const taxes = taxesData?.data?.taxes ?? [];

  const customerOptions = customers.map((c: any) => ({
    value: c.id,
    label: c.name,
    metadata: c.email,
  }));

  const handleCreateCustomer = async (values: CustomerFormData) => {
    await createCustomerMutation.mutateAsync(values);
  };

  const onSubmit = async (values: InvoiceFormData) => {
    if (!id) return;
    if (!selectedCustomerId) {
      toastMessage("error", "Please select a customer");
      return;
    }

    const selectedTaxes = values.taxes?.length
      ? values.taxes.map((t) => ({ id: t.id, name: t.name, rate: t.rate }))
      : undefined;

    await updateInvoiceMutation.mutateAsync({
      id,
      customerId: selectedCustomerId,
      dueDate: values.dueDate,
      items: values.items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      taxes: selectedTaxes,
      currency: values.currency,
      discount: values.discount || undefined,
      notes: values.notes || undefined,
    });
  };

  if (!id) {
    return <ErrorState message="No invoice ID provided." />;
  }

  if (invoiceLoading) {
    return <LoadingState />;
  }

  if (invoiceError) {
    return <ErrorState message="Failed to load invoice." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Invoices
      </Link>

      <div>
        <h1 className="text-lg font-medium">Update Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Modify the invoice details
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="text-sm font-medium">Customer</h2>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SearchSelect
                label="Select Customer"
                options={customerOptions}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Search customers..."
                emptyMessage="No customers found"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => setCustomerModalOpen(true)}
            >
              <UserPlus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Invoice Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", description: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus />
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Name" error={form.formState.errors.items?.[index]?.name?.message}>
                  <Input {...form.register(`items.${index}.name`)} placeholder="Item name" />
                </FormField>
                <FormField label="Quantity" error={form.formState.errors.items?.[index]?.quantity?.message}>
                  <Input
                    type="number"
                    min={1}
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </FormField>
              </div>
              <FormField label="Description" error={form.formState.errors.items?.[index]?.description?.message}>
                <Input {...form.register(`items.${index}.description`)} placeholder="Item description" />
              </FormField>
              <FormField label="Unit Price" error={form.formState.errors.items?.[index]?.unitPrice?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
              </FormField>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="text-sm font-medium">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Currency" error={form.formState.errors.currency?.message}>
              <Select
                value={form.watch("currency")}
                onValueChange={(val) => form.setValue("currency", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Discount (%)" error={form.formState.errors.discount?.message} isOptional>
              <Input {...form.register("discount")} placeholder="0" type="number" min={0} max={100} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              value={(form.watch("invoiceDate") || "") ? new Date(form.watch("invoiceDate") || "") : undefined}
              onChange={(d) => form.setValue("invoiceDate", d ? d.toISOString().split("T")[0] : "")}
              label="Invoice Date"
              isOptional
            />
            <DatePicker
              value={(form.watch("dueDate") || "") ? new Date(form.watch("dueDate") || "") : undefined}
              onChange={(d) => form.setValue("dueDate", d ? d.toISOString().split("T")[0] : "")}
              label="Due Date"
              error={form.formState.errors.dueDate?.message}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-4">
          <h2 className="text-sm font-medium">Taxes</h2>
          {taxes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No taxes configured</p>
          ) : (
            <div className="space-y-2">
              {taxes.map((tax: any) => {
                const selected = (form.watch("taxes") ?? []).some((t) => t.id === tax.id);
                return (
                  <label key={tax.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const current = form.watch("taxes") ?? [];
                        if (e.target.checked) {
                          form.setValue("taxes", [...current, { id: tax.id, name: tax.name, rate: tax.rate }]);
                        } else {
                          form.setValue("taxes", current.filter((t) => t.id !== tax.id));
                        }
                      }}
                      className="size-4 rounded border-input accent-foreground"
                    />
                    <span className="text-sm">{tax.name}</span>
                    <span className="text-xs text-muted-foreground">({tax.rate}%)</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <FormField label="Notes" isOptional>
          <Textarea {...form.register("notes")} placeholder="Additional notes for the invoice..." rows={3} />
        </FormField>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateInvoiceMutation.isPending}>
            {updateInvoiceMutation.isPending ? "Updating Invoice..." : "Update Invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/invoices")}>
            Cancel
          </Button>
        </div>
      </form>

      <ResponsiveModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        title="Create Customer"
        description="Add a new customer to your list"
      >
        <form onSubmit={customerForm.handleSubmit(handleCreateCustomer)} className="space-y-4">
          <FormField label="Name" error={customerForm.formState.errors.name?.message} isRequired>
            <Input {...customerForm.register("name")} placeholder="Customer name" />
          </FormField>
          <FormField label="Email" error={customerForm.formState.errors.email?.message} isRequired>
            <Input {...customerForm.register("email")} type="email" placeholder="customer@example.com" />
          </FormField>
          <FormField label="Phone" error={customerForm.formState.errors.phone?.message} isRequired>
            <Input {...customerForm.register("phone")} placeholder="08012345678" />
          </FormField>
          <FormField label="Address" error={customerForm.formState.errors.address?.message} isRequired>
            <Input {...customerForm.register("address")} placeholder="Customer address" />
          </FormField>
          <Button type="submit" className="w-full" disabled={createCustomerMutation.isPending}>
            {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
          </Button>
        </form>
      </ResponsiveModal>
    </motion.div>
  );
}

export default function UpdateInvoicePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UpdateInvoiceContent />
    </Suspense>
  );
}

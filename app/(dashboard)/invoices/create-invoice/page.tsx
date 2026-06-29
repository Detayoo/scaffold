"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { CreateCustomerModal } from "@/components/CreateCustomerModal";
import { createInvoiceSchema } from "@/utils/validators";
import { getCustomersFn, createInvoiceFn } from "@/services/queries/invoices";
import { getTaxesFn } from "@/services/queries/taxes";
import { toastMessage, extractError } from "@/utils";
import type { z } from "zod";

type InvoiceFormData = z.infer<typeof createInvoiceSchema>;

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

export default function CreateInvoicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: customersData, refetch: refetchCustomers } = useQuery({
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

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoiceFn,
    onSuccess: (res: any) => {
      toastMessage("success", "Invoice created successfully");
      router.push(`/invoices/${res?.data?.invoice?.id ?? ""}`);
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const customers = customersData?.data?.customers ?? [];
  const taxes = taxesData?.data?.taxes ?? [];

  const customerOptions = customers.map((c: any) => ({
    value: c.id,
    label: c.name,
    metadata: c.email,
  }));

  const onSubmit = async (values: InvoiceFormData) => {
    if (!selectedCustomerId) {
      toastMessage("error", "Please select a customer");
      return;
    }

    const selectedTaxes = values.taxes?.length
      ? values.taxes.map((t) => ({ id: t.id, name: t.name, rate: t.rate }))
      : undefined;

    try {
      await createInvoiceMutation.mutateAsync({
      customerId: selectedCustomerId,
      dueDate: values.dueDate,
      invoiceDate: values.invoiceDate || undefined,
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
      invoiceNumber: values.invoiceNumber || undefined,
    });
    } catch {}
  };

  return (
    <div
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
        <h1 className="text-lg font-medium">Create Invoice</h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details to generate a new invoice for your customer
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  label="Name"
                  error={form.formState.errors.items?.[index]?.name?.message}
                >
                  <Input {...form.register(`items.${index}.name`)} placeholder="Item name" />
                </FormField>
                <FormField
                  label="Quantity"
                  error={form.formState.errors.items?.[index]?.quantity?.message}
                >
                  <Input
                    type="number"
                    min={1}
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </FormField>
              </div>
              <FormField
                label="Description"
                error={form.formState.errors.items?.[index]?.description?.message}
              >
                <Input {...form.register(`items.${index}.description`)} placeholder="Item description" />
              </FormField>
              <FormField
                label="Unit Price"
                error={form.formState.errors.items?.[index]?.unitPrice?.message}
              >
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <FormField
              label="Discount (%)"
              error={form.formState.errors.discount?.message}
              isOptional
            >
              <Input {...form.register("discount")} placeholder="0" type="number" min={0} max={100} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <FormField label="Invoice Number" isOptional>
            <Input {...form.register("invoiceNumber")} placeholder="Auto-generated if left empty" />
          </FormField>
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
          <Button type="submit" disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending ? "Creating Invoice..." : "Create Invoice"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/invoices")}
          >
            Cancel
          </Button>
        </div>
      </form>

      <CreateCustomerModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        onSuccess={() => { refetchCustomers(); }}
      />
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { createGatewayCustomerFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import type { CreateCustomerPayload } from "@/types";

const schema = z.object({
  reference: z.string().nonempty("Reference is required"),
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  status: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCustomerModal({ open, onOpenChange, onSuccess }: CreateCustomerModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reference: "", name: "", email: "", status: "active" },
  });

  const { mutateAsync: createCustomer, isPending: creating } = useMutation({
    mutationFn: createGatewayCustomerFn,
    onSuccess: () => {
      toastMessage("success", "Customer created");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ reference, name, email, status }) => {
    try {
      const payload: CreateCustomerPayload = { reference };
      if (name) payload.name = name;
      if (email) payload.email = email;
      if (status) payload.status = status;
      await createCustomer(payload);
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Create Customer"
      description="Add a new customer record"
    >
      <form onSubmit={handleCreate} className="space-y-4 pt-2">
        <FormField label="Reference" error={form.formState.errors.reference?.message} isRequired>
          <Input {...form.register("reference")} placeholder="cus_unique_ref" />
        </FormField>
        <FormField label="Name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} placeholder="Customer name (optional)" />
        </FormField>
        <FormField label="Email" error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} placeholder="customer@example.com (optional)" />
        </FormField>
        <FormField label="Status" error={form.formState.errors.status?.message}>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Customer"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

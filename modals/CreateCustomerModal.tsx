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
import { createCustomerFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email"),
  status: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  reference: z.string().optional(),
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
    defaultValues: { name: "", email: "", status: "active", phone: "", city: "", reference: "" },
  });

  const { mutateAsync: createCustomer, isPending: creating } = useMutation({
    mutationFn: createCustomerFn,
    onSuccess: () => {
      toastMessage("success", "Customer created");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ name, email, status, phone, city, reference }) => {
    try {
      const metadata: Record<string, string> = {};
      if (phone) metadata.phone = phone;
      if (city) metadata.city = city;
      await createCustomer({
        name,
        email,
        status: status || undefined,
        reference: reference || undefined,
        metadata: Object.keys(metadata).length ? metadata : undefined,
      });
    } catch {}
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Create Customer"
      description="Add a new customer record"
    >
      <form onSubmit={handleCreate} className="space-y-4 pt-2">
        <FormField label="Name" error={form.formState.errors.name?.message} isRequired>
          <Input {...form.register("name")} placeholder="Chinedu Okafor" />
        </FormField>
        <FormField label="Email" error={form.formState.errors.email?.message} isRequired>
          <Input {...form.register("email")} placeholder="chinedu.okafor@example.ng" />
        </FormField>
        <FormField label="Status">
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
        <FormField label="Phone (optional)">
          <Input {...form.register("phone")} placeholder="08034561234" />
        </FormField>
        <FormField label="City (optional)">
          <Input {...form.register("city")} placeholder="Ikeja" />
        </FormField>
        <FormField label="Reference (optional)">
          <Input {...form.register("reference")} placeholder="Auto-generated if blank" />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Customer"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

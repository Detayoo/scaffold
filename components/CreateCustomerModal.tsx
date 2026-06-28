"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/FormField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { createCustomerFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import { createCustomerSchema } from "@/utils/validators";

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customerId: string) => void;
}

type CustomerForm = z.infer<typeof createCustomerSchema>;

export function CreateCustomerModal({ open, onOpenChange, onSuccess }: CreateCustomerModalProps) {
  const form = useForm<CustomerForm>({
    resolver: zodResolver(createCustomerSchema),
  });

  const { mutateAsync: createCustomer, isPending } = useMutation({
    mutationFn: createCustomerFn,
  });

  const onSubmit = async (data: CustomerForm) => {
    try {
      const res = await createCustomer(data);
      toastMessage("success", "Customer created");
      form.reset();
      onOpenChange(false);
      onSuccess(res?.data?.customer?.id ?? "");
    } catch (err) {
      toastMessage("error", extractError(err));
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Customer"
      description="Add a new customer to your list"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField label="Name" error={form.formState.errors.name?.message} isRequired>
          <Input {...form.register("name")} placeholder="Customer name" />
        </FormField>
        <FormField label="Email" error={form.formState.errors.email?.message} isRequired>
          <Input {...form.register("email")} type="email" placeholder="customer@example.com" />
        </FormField>
        <FormField label="Phone" error={form.formState.errors.phone?.message} isRequired>
          <Input {...form.register("phone")} placeholder="08012345678" />
        </FormField>
        <FormField label="Address" error={form.formState.errors.address?.message} isRequired>
          <Input {...form.register("address")} placeholder="Customer address" />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

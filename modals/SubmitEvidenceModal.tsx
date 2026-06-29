"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/FormField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { submitDisputeEvidenceFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  evidenceType: z.string().nonempty("Evidence type is required"),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SubmitEvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
  onSuccess?: () => void;
}

export function SubmitEvidenceModal({ open, onOpenChange, disputeId, onSuccess }: SubmitEvidenceModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { evidenceType: "", note: "" },
  });

  const { mutateAsync: submitEvidence, isPending: submitting } = useMutation({
    mutationFn: submitDisputeEvidenceFn,
    onSuccess: () => {
      toastMessage("success", "Evidence submitted");
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["dispute-detail", disputeId] });
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await submitEvidence({
        id: disputeId,
        payload: {
          evidenceType: data.evidenceType,
          note: data.note || undefined,
        },
      });
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !submitting) { onOpenChange(false); form.reset(); } }}
      title="Submit Evidence"
      description="Provide evidence to support your dispute case"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <FormField label="Evidence Type" error={form.formState.errors.evidenceType?.message} isRequired>
          <Input {...form.register("evidenceType")} placeholder="e.g. delivery_proof" />
        </FormField>
        <FormField label="Note" error={form.formState.errors.note?.message}>
          <Textarea {...form.register("note")} placeholder="Describe the evidence (optional)" className="min-h-20" />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Evidence"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
